"""Prepare the Founder's four supplied documentary excerpts for native playback."""
from pathlib import Path
import subprocess
import sys

sources = [
    "2170c994-2f80-47bb-a48a-4be72d6ed995_1792157443623.mov",
    "4c2eaccf-ae02-4205-bf75-2f1a1df7a3d0_1792157443623.mp4",
    "79bfaad7-ab5c-4283-b1da-6a1c119dcffd_1792157443623.mp4",
    "VIDEO-2025-10-23-09-59-58_1792157443623.mp4",
]
out = Path("generated-artifacts/documentary-teasers")
out.mkdir(parents=True, exist_ok=True)
for index, name in enumerate(sources, 1):
    if len(sys.argv) > 1 and index != int(sys.argv[1]):
        continue
    source = str(Path("attached_assets") / name)
    target = out / f"documentary-teaser-{index:02}.mp4"
    # The second recording has sideways content but no rotation metadata.
    filters = ("transpose=cclock," if index == 2 else "") + "scale=w='min(1280,iw)':h='min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2"
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", source, "-map", "0:v:0", "-map", "0:a:0?",
        "-vf", filters,
        "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-threads", "2",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
        "-metadata:s:v:0", "rotate=0", "-movflags", "+faststart", str(target),
    ], check=True)
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-ss", "1", "-i", str(target),
        "-frames:v", "1", "-vf", "scale=480:-2", "-c:v", "libwebp", "-quality", "88",
        str(out / f"documentary-teaser-{index:02}.webp"),
    ], check=True)
    print(f"Prepared excerpt {index}: {target.name}", flush=True)
