from pathlib import Path
import subprocess

out = Path("generated-artifacts/editorial-media")
out.mkdir(parents=True, exist_ok=True)
films = [
    ("goma-donation", "attached_assets/v09025g40000cpi0aivog65o7bmt50l0_1792105269754.mp4"),
    ("previous-editions", "attached_assets/99f4549341f3407681793a8e1f2e4a5f_1791970203748.mov"),
]
for slug, source in films:
    common = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", source]
    scale = "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2"
    subprocess.run(common + ["-vf", scale, "-c:v", "libx264", "-preset", "fast",
        "-crf", "24", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart", str(out / f"{slug}.mp4")], check=True)
    subprocess.run(common + ["-vf", "scale='min(960,iw)':'min(960,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
        "-c:v", "libvpx-vp9", "-deadline", "realtime", "-cpu-used", "8", "-b:v", "0",
        "-crf", "36", "-c:a", "libopus", "-b:a", "96k", str(out / f"{slug}.webm")], check=True)
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", "12",
        "-i", source, "-frames:v", "1", "-vf", scale, str(out / f"{slug}.webp")], check=True)
    print(f"Prepared {slug}", flush=True)
