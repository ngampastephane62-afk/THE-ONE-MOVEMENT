import { Router } from "express";
import {
  db, networkUploads as uploads, networkProfiles as profiles, networkPosts as posts,
  networkCertifications as certificates, ecosystemMembersTable as members, networkFollows as follows,
} from "@workspace/db";
import { and, eq, sql, or, isNull } from "drizzle-orm";
import { GetNetworkStateQueryParams, RequestNetworkUploadBody } from "@workspace/api-zod";
import { networkAuth, networkEnabled, networkWrite, actor, NetworkError, type NetworkActor } from "../services/networkAuth";
import { networkAction } from "../services/networkActions";
import { networkState, activeBadge, visibleMember } from "../services/networkState";
import { requestUpload, objectFile } from "../services/networkFiles";
import { DOCUMENTS, paymentStatus } from "../services/networkPayments";
import type { Request, Response, NextFunction } from "express";

const router = Router();
router.get("/community/profiles/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) throw new NetworkError(404, "Profile not found.");
  const [row] = await db.select({ member: members, profile: profiles }).from(members)
    .leftJoin(profiles, eq(profiles.memberId, members.id))
    .where(and(eq(members.id, id), eq(members.isPublic, true), or(eq(profiles.suspended, false), isNull(profiles.memberId)))).limit(1);
  if (!row) throw new NetworkError(404, "Profile not found.");
  const { member: m, profile: p } = row;
  const [counts, certs] = await Promise.all([
    db.select({
      followers: sql<number>`count(*) filter (where ${follows.followingId} = ${id})::integer`,
      following: sql<number>`count(*) filter (where ${follows.followerId} = ${id})::integer`,
    }).from(follows).where(or(eq(follows.followingId, id), eq(follows.followerId, id))),
    p?.enabled ? db.select().from(certificates).where(eq(certificates.memberId, id)) : Promise.resolve([]),
  ]);
  const avatar = m.publicMedia && p?.enabled && p.avatarId ? await db.select({ id: uploads.id }).from(uploads)
    .where(and(eq(uploads.id, p.avatarId), eq(uploads.ownerId, id), eq(uploads.ready, true))).limit(1) : [];
  const cover = m.publicMedia && p?.enabled && p.coverId ? await db.select({ id: uploads.id }).from(uploads)
    .where(and(eq(uploads.id, p.coverId), eq(uploads.ownerId, id), eq(uploads.ready, true))).limit(1) : [];
  res.set("Cache-Control", "no-store").json({ profile: {
    id, fullName: m.fullName, profession: m.profession, organization: m.organization, country: m.country,
    bio: m.bio, offering: m.offering, lookingFor: m.lookingFor, website: m.website, sectors: m.sectors,
    isPublic: true, enabled: !!p?.enabled, founder: !!p?.founder, suspended: false,
    profileLayout: m.profileLayout, coverPosition: m.coverPosition, postsLayout: m.postsLayout,
    avatarUrl: avatar.length ? `/api/community/media/${avatar[0]!.id}` : null,
    coverUrl: cover.length ? `/api/community/media/${cover[0]!.id}` : null,
    followers: p?.enabled ? counts[0]?.followers ?? 0 : 0, following: p?.enabled ? counts[0]?.following ?? 0 : 0,
    followed: false, blocked: false,
    badges: certs.filter(activeBadge).map(c => ({ role: c.role, program: c.program, expiresAt: c.expiresAt?.toISOString() ?? null })),
  } });
});
router.get("/community/media/:id", async (req, res) => {
  const [upload] = await db.select().from(uploads)
    .innerJoin(profiles, and(eq(profiles.memberId, uploads.ownerId), or(eq(profiles.avatarId, uploads.id), eq(profiles.coverId, uploads.id))))
    .innerJoin(members, eq(members.id, profiles.memberId))
    .where(and(eq(uploads.id, String(req.params.id)), eq(uploads.ready, true),
      eq(members.isPublic, true), eq(members.publicMedia, true), eq(profiles.enabled, true), eq(profiles.suspended, false)))
    .limit(1).then(rows => rows.map(r => r.network_uploads));
  if (!upload || !upload.contentType.startsWith("image/")) throw new NetworkError(404, "Image not found.");
  res.set({
    "Content-Type": upload.contentType, "Content-Length": String(upload.size),
    "Cache-Control": "no-store", "Content-Disposition": "inline",
    "X-Content-Type-Options": "nosniff",
  });
  if (req.method === "HEAD") return void res.end();
  objectFile(upload.objectPath).createReadStream().on("error", () => {
    if (!res.headersSent) res.status(502).end();
    else if (!res.destroyed) res.end();
  }).pipe(res);
});
router.get("/donations", (_req, res) => {
  res.json({
    title: "Stand with communities in eastern DR Congo",
    description: "Support humanitarian action through The One Movement International. Each collection will identify its specific emergency, beneficiary, use of funds and reporting commitments before receiving donations.",
    collector: "The One Movement International", beneficiary: null, active: false, currency: "usd",
    reason: "Donations are not open yet. A campaign-specific beneficiary, legal fundraising authorization and payment-provider eligibility must be confirmed before collection.",
  });
});
router.use("/network", networkAuth, networkEnabled);
router.get("/network/state", async (req, res) => {
  const parsed = GetNetworkStateQueryParams.safeParse(req.query);
  if (!parsed.success) throw new NetworkError(400, "Invalid network filters.");
  res.json(await networkState(res.locals.actor as NetworkActor, parsed.data));
});
router.post("/network/action", networkWrite, async (req, res) => {
  res.json(await networkAction(req, res));
});
router.post("/network/uploads", networkWrite, async (req, res) => {
  const who = actor(res, false);
  const parsed = RequestNetworkUploadBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "Invalid upload metadata.");
  res.json(await requestUpload(who.member.id, parsed.data));
});
router.get("/network/payments/status", async (req, res) => {
  const who = actor(res);
  const sessionId = String(req.query.sessionId ?? "");
  if (!/^cs_[\w]+$/.test(sessionId)) throw new NetworkError(400, "Invalid checkout session.");
  res.json(await paymentStatus(who.member.id, sessionId));
});
router.get("/network/documents/:slug", async (req, res) => {
  const who = actor(res);
  const document = DOCUMENTS.find(d => d.slug === String(req.params.slug));
  if (!document) throw new NetworkError(404, "Document not found.");
  if (document.restricted && !who.founder) {
    const ownCerts = await db.select().from(certificates).where(and(eq(certificates.memberId, who.member.id), eq(certificates.role, "investor")));
    if (!ownCerts.some(activeBadge)) throw new NetworkError(403, "This confidential deck requires approved investor access.");
  }
  const dir = process.env.PRIVATE_OBJECT_DIR;
  if (!dir) throw new NetworkError(503, "Documents are unavailable.");
  try {
    const [bytes] = await objectFile(`${dir.replace(/\/$/, "")}/network-documents/${document.slug}.pdf`).download();
    res.set({
      "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="TOMI-${document.slug}.pdf"`,
      "Content-Length": String(bytes.length), "Content-Security-Policy": "default-src 'none'; sandbox", "Cache-Control": "private, no-store",
    }).end(bytes);
  } catch {
    throw new NetworkError(503, "This document could not be loaded. Please try again.");
  }
});
router.get("/network/media/:id", async (req, res) => {
  const who = actor(res, false);
  const [upload] = await db.select().from(uploads).where(and(eq(uploads.id, String(req.params.id)), eq(uploads.ready, true)));
  if (!upload) throw new NetworkError(404, "Media not found.");
  let allowed = upload.ownerId === who.member.id;
  if (!allowed) {
    const [profile] = await db.select().from(profiles).where(and(eq(profiles.memberId, upload.ownerId), eq(profiles.enabled, true), eq(profiles.suspended, false)));
    if (profile) {
      try {
        await visibleMember(upload.ownerId, who.member.id);
        allowed = profile.avatarId === upload.id || profile.coverId === upload.id;
        if (!allowed) {
          const [post] = await db.select({ id: posts.id }).from(posts).where(and(eq(posts.authorId, upload.ownerId), eq(posts.hidden, false), sql`${upload.id} = ANY(${posts.mediaIds})`)).limit(1);
          allowed = !!post;
        }
      } catch { /* A blocked profile does not authorize media delivery. */ }
    }
    if (!allowed && who.founder) {
      const [evidence] = await db.select({ id: certificates.id }).from(certificates).where(sql`${upload.id} = ANY(${certificates.evidenceIds})`).limit(1);
      allowed = !!evidence;
    }
  }
  if (!allowed) throw new NetworkError(404, "Media not found.");
  const file = objectFile(upload.objectPath);
  const size = upload.size;
  let start = 0, end = size - 1;
  if (req.headers.range) {
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!range || (!range[1] && !range[2])) return void res.status(416).set("Content-Range", `bytes */${size}`).end();
    if (!range[1]) start = Math.max(0, size - Number(range[2]));
    else { start = Number(range[1]); if (range[2]) end = Math.min(end, Number(range[2])); }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) return void res.status(416).set("Content-Range", `bytes */${size}`).end();
    res.status(206).set("Content-Range", `bytes ${start}-${end}/${size}`);
  }
  const pdf = upload.contentType === "application/pdf";
  res.set({
    "Content-Type": upload.contentType, "Content-Length": String(end - start + 1),
    "Cache-Control": "private, no-store", "Accept-Ranges": "bytes",
    "Content-Disposition": pdf ? `attachment; filename="document.pdf"; filename*=UTF-8''${encodeURIComponent(upload.filename)}` : "inline",
    ...(pdf ? { "Content-Security-Policy": "default-src 'none'; sandbox" } : {}),
  });
  if (req.method === "HEAD") return void res.end();
  // Do not cancel the GCS source on an early browser abort: its sidecar request
  // may not yet have an HTTP response (see curated-reel storage constraints).
  file.createReadStream({ start, end }).on("error", () => {
    if (!res.headersSent) res.status(502).end();
    else if (!res.destroyed) res.end();
  }).pipe(res);
});
export function networkErrors(error: unknown, _req: Request, res: Response, next: NextFunction) {
  if (error instanceof NetworkError) return void res.status(error.status).json({ error: error.message });
  next(error);
}
export default router;
