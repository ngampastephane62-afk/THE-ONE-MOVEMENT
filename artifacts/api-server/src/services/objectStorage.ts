import { Storage, type File as GcsFile } from "@google-cloud/storage";
import {
  S3Client, GetObjectCommand, HeadObjectCommand, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createReadStream as fileStream, createWriteStream } from "node:fs";
import { PassThrough, Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

/**
 * Storage backend for every runtime object path ("/<bucket>/<key>").
 *
 * - "replit" (default): Replit App Storage through its local sidecar. This is
 *   the existing behaviour and needs no configuration.
 * - "s3": any S3-compatible store, e.g. Fly's Tigris. Enabled with
 *   OBJECT_STORAGE_BACKEND=s3 and the standard AWS_* variables that
 *   `fly storage create` sets (AWS_ENDPOINT_URL_S3, AWS_REGION,
 *   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY). The "<bucket>" segment of each
 *   path is the S3 bucket name, so DEFAULT_OBJECT_STORAGE_BUCKET_ID and
 *   PRIVATE_OBJECT_DIR keep their meaning.
 *
 * Only the operations the API uses are exposed. Streams emit "response" once
 * the store has answered, which editorialStream/storedObjectStream rely on for
 * cancellation-safe delivery.
 */
export type StoredMetadata = { size: number; contentType?: string };
export interface StoredFile {
  readonly bucketName: string;
  readonly name: string;
  download(options?: { start?: number; end?: number; destination?: string }): Promise<[Buffer]>;
  createReadStream(options?: { start?: number; end?: number }): Readable;
  getMetadata(): Promise<[StoredMetadata]>;
  delete(options?: { ignoreNotFound?: boolean }): Promise<void>;
  save(data: Buffer | string, options?: { contentType?: string; cacheControl?: string }): Promise<void>;
  uploadFrom(localPath: string, options: { contentType: string; cacheControl?: string }): Promise<void>;
  copy(destination: StoredFile): Promise<void>;
  /** A time-limited URL the browser can PUT the declared content type to. */
  signedUploadUrl(contentType: string, expiresInMs: number): Promise<string>;
}

export function storageBackend(env: Readonly<Record<string, string | undefined>> = process.env): "replit" | "s3" {
  const value = env.OBJECT_STORAGE_BACKEND?.trim().toLowerCase();
  if (!value || value === "replit") return "replit";
  if (value === "s3") return "s3";
  throw new Error(`Unsupported OBJECT_STORAGE_BACKEND "${env.OBJECT_STORAGE_BACKEND}"`);
}

export function splitObjectPath(path: string) {
  const [bucket, ...parts] = path.replace(/^\/+/, "").split("/");
  if (!bucket || !parts.length) throw new Error("Invalid storage configuration");
  return { bucket, key: parts.join("/") };
}

// ---------------------------------------------------------------- Replit ----
const REPLIT_SIDECAR = "http://127.0.0.1:1106";
let gcs: Storage | undefined;
/** Replit App Storage client, for the one-off seeding scripts under src/scripts. */
export function replitStorage() {
  gcs ??= new Storage({
    projectId: "",
    credentials: {
      audience: "replit", subject_token_type: "access_token",
      token_url: `${REPLIT_SIDECAR}/token`, type: "external_account",
      credential_source: { url: `${REPLIT_SIDECAR}/credential`, format: { type: "json", subject_token_field_name: "access_token" } },
      universe_domain: "googleapis.com",
    },
  });
  return gcs;
}
class ReplitFile implements StoredFile {
  private readonly file: GcsFile;
  constructor(readonly bucketName: string, readonly name: string) {
    this.file = replitStorage().bucket(bucketName).file(name);
  }
  async download(options: { start?: number; end?: number; destination?: string } = {}): Promise<[Buffer]> {
    const [bytes] = await this.file.download(options);
    return [bytes];
  }
  createReadStream(options?: { start?: number; end?: number }) { return this.file.createReadStream(options); }
  async getMetadata(): Promise<[StoredMetadata]> {
    const [metadata] = await this.file.getMetadata();
    return [{ size: Number(metadata.size), contentType: metadata.contentType }];
  }
  async delete(options?: { ignoreNotFound?: boolean }) { await this.file.delete(options); }
  async save(data: Buffer | string, options: { contentType?: string; cacheControl?: string } = {}) {
    await this.file.save(data, { resumable: false, metadata: { contentType: options.contentType, cacheControl: options.cacheControl } });
  }
  async uploadFrom(localPath: string, options: { contentType: string; cacheControl?: string }) {
    await this.file.bucket.upload(localPath, { destination: this.name, resumable: false, metadata: options });
  }
  async copy(destination: StoredFile) {
    if (!(destination instanceof ReplitFile)) throw new Error("Cross-backend copy is not supported");
    await this.file.copy(destination.file);
  }
  async signedUploadUrl(_contentType: string, expiresInMs: number) {
    const reply = await fetch(`${REPLIT_SIDECAR}/object-storage/signed-object-url`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bucket_name: this.bucketName, object_name: this.name, method: "PUT",
        expires_at: new Date(Date.now() + expiresInMs).toISOString(),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!reply.ok) throw new Error(`Signed URL request failed with ${reply.status}`);
    const signed = await reply.json() as { signed_url?: string };
    if (!signed.signed_url) throw new Error("No signed URL was issued");
    return signed.signed_url;
  }
}

// -------------------------------------------------------------------- S3 ----
let s3: S3Client | undefined;
function s3Client() {
  s3 ??= new S3Client({
    region: process.env.AWS_REGION || "auto",
    ...(process.env.AWS_ENDPOINT_URL_S3 ? { endpoint: process.env.AWS_ENDPOINT_URL_S3 } : {}),
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  });
  return s3;
}
const range = (options?: { start?: number; end?: number }) =>
  options && (options.start !== undefined || options.end !== undefined)
    ? `bytes=${options.start ?? 0}-${options.end ?? ""}` : undefined;
const notFound = (error: unknown) => {
  const e = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return e?.name === "NoSuchKey" || e?.name === "NotFound" || e?.$metadata?.httpStatusCode === 404;
};
class S3File implements StoredFile {
  constructor(readonly bucketName: string, readonly name: string) {}
  private async body(options?: { start?: number; end?: number }) {
    const reply = await s3Client().send(new GetObjectCommand({ Bucket: this.bucketName, Key: this.name, Range: range(options) }));
    if (!reply.Body) throw new Error("Stored object has no body");
    return reply.Body as Readable;
  }
  async download(options: { start?: number; end?: number; destination?: string } = {}): Promise<[Buffer]> {
    const body = await this.body(options);
    if (options.destination) {
      await pipeline(body, createWriteStream(options.destination));
      return [Buffer.alloc(0)];
    }
    const chunks: Buffer[] = [];
    for await (const chunk of body) chunks.push(Buffer.from(chunk));
    return [Buffer.concat(chunks)];
  }
  createReadStream(options?: { start?: number; end?: number }) {
    const out = new PassThrough();
    let source: Readable | undefined;
    // Mirrors the GCS stream contract: "response" fires once the store answered.
    out.once("close", () => source?.destroy());
    this.body(options).then(body => {
      source = body;
      out.emit("response");
      if (out.destroyed) return void body.destroy();
      body.on("error", error => out.destroy(error)).pipe(out);
    }, error => out.destroy(error));
    return out;
  }
  async getMetadata(): Promise<[StoredMetadata]> {
    const head = await s3Client().send(new HeadObjectCommand({ Bucket: this.bucketName, Key: this.name }));
    return [{ size: Number(head.ContentLength), contentType: head.ContentType }];
  }
  async delete(options?: { ignoreNotFound?: boolean }) {
    try { await s3Client().send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: this.name })); }
    catch (error) { if (!(options?.ignoreNotFound && notFound(error))) throw error; }
  }
  async save(data: Buffer | string, options: { contentType?: string; cacheControl?: string } = {}) {
    await s3Client().send(new PutObjectCommand({
      Bucket: this.bucketName, Key: this.name, Body: data, ContentType: options.contentType, CacheControl: options.cacheControl,
    }));
  }
  async uploadFrom(localPath: string, options: { contentType: string; cacheControl?: string }) {
    const { size } = await import("node:fs/promises").then(fs => fs.stat(localPath));
    await s3Client().send(new PutObjectCommand({
      Bucket: this.bucketName, Key: this.name, Body: fileStream(localPath), ContentLength: size,
      ContentType: options.contentType, CacheControl: options.cacheControl,
    }));
  }
  async copy(destination: StoredFile) {
    if (!(destination instanceof S3File)) throw new Error("Cross-backend copy is not supported");
    await s3Client().send(new CopyObjectCommand({
      Bucket: destination.bucketName, Key: destination.name,
      CopySource: `${this.bucketName}/${this.name.split("/").map(encodeURIComponent).join("/")}`,
    }));
  }
  async signedUploadUrl(contentType: string, expiresInMs: number) {
    return getSignedUrl(s3Client(), new PutObjectCommand({ Bucket: this.bucketName, Key: this.name, ContentType: contentType }),
      { expiresIn: Math.max(60, Math.floor(expiresInMs / 1000)) });
  }
}

export function objectFile(path: string): StoredFile {
  const { bucket, key } = splitObjectPath(path);
  return storageBackend() === "s3" ? new S3File(bucket, key) : new ReplitFile(bucket, key);
}
