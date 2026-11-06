import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { NetworkError } from "./networkAuth";
const exec = promisify(execFile);

/** External tools receive local files only, finite CPU/address space and no network protocols. */
export async function mediaCommand(tool: "ffmpeg" | "ffprobe", args: string[]) {
  return exec("prlimit", ["--as=1073741824", "--cpu=120", "--", tool, ...args], {
    timeout: 125000, maxBuffer: 1024 * 1024, env: { PATH: process.env.PATH },
  });
}
export async function processGratitudeFile(
  download: (destination: string) => Promise<void>, kind: "image" | "video",
  done: (files: { playback: string; thumbnail: string | null; width: number; height: number; durationMs: number | null; type: string }) => Promise<void>,
) {
  const directory = await mkdtemp(path.join(tmpdir(), "tomi-gratitude-"));
  try {
    const source = path.join(directory, "input");
    await download(source);
    const probe = await mediaCommand("ffprobe", [
      "-v", "error", "-max_alloc", "67108864", "-protocol_whitelist", "file,pipe",
      "-show_format", "-show_streams", "-of", "json", source,
    ]);
    const data = JSON.parse(probe.stdout) as { format: { duration?: string }; streams: { codec_type: string; width?: number; height?: number }[] };
    const visual = data.streams.find(s => s.codec_type === "video");
    if (!visual?.width || !visual.height || visual.width > 4096 || visual.height > 4096) throw new NetworkError(400, "Use an image or video up to 4096 pixels per side.");
    const durationMs = kind === "video" ? Math.round(Number(data.format.duration) * 1000) : null;
    if (kind === "video" && (!Number.isFinite(durationMs) || durationMs! <= 0 || durationMs! > 180000)) throw new NetworkError(400, "Videos must be playable and no longer than three minutes.");
    const playback = path.join(directory, kind === "video" ? "playback.mp4" : "image.jpg");
    const base = ["-nostdin", "-v", "error", "-max_alloc", "67108864", "-threads", "1", "-filter_threads", "1",
      "-protocol_whitelist", "file,pipe", "-i", source, "-map_metadata", "-1"];
    await mediaCommand("ffmpeg", kind === "video" ? [
      ...base, "-map", "0:v:0", "-map", "0:a:0?", "-sn", "-dn",
      "-vf", "scale=w='min(1280,iw)':h=-2", "-c:v", "libx264", "-threads", "1",
      "-preset", "veryfast", "-crf", "25", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", "-y", playback,
    ] : [
      ...base, "-vf", "scale=w='min(2560,iw)':h=-2", "-frames:v", "1", "-q:v", "3", "-y", playback,
    ]);
    const size = (await stat(playback)).size;
    if (!size || size > 500 * 1024 * 1024) throw new NetworkError(400, "The processed media exceeds the allowed size.");
    let thumbnail: string | null = null;
    if (kind === "video") {
      thumbnail = path.join(directory, "thumbnail.jpg");
      await mediaCommand("ffmpeg", [
        "-nostdin", "-v", "error", "-threads", "1", "-filter_threads", "1",
        "-protocol_whitelist", "file,pipe", "-i", playback, "-map_metadata", "-1",
        "-frames:v", "1", "-vf", "scale=w='min(640,iw)':h=-2", "-y", thumbnail,
      ]);
    }
    // Dimensions describe the original framing; CSS preserves its aspect ratio.
    await done({ playback, thumbnail, width: visual.width, height: visual.height, durationMs, type: kind === "video" ? "video/mp4" : "image/jpeg" });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
