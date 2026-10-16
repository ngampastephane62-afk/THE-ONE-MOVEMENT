from pathlib import Path
import subprocess
out = Path("generated-artifacts/documentary")
out.mkdir(parents=True, exist_ok=True)
goma = "attached_assets/0_inmark_1792117953917.mp4"
okapi = "attached_assets/0_inmark_1792117970842.mp4"
def transcode(source, filename, preview=False):
    target = out / filename
    if target.exists():
        return
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", source,
        *(["-t", "15"] if preview else []),
        "-vf", "scale=1280:-2", "-c:v", "libx264", "-preset", "fast", "-crf", "24",
        "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", str(target)], check=True)
transcode(goma, "goma-full.mp4")
transcode(goma, "goma-preview.mp4", True)
transcode(okapi, "radio-okapi-trailer.mp4")
for source, name in [(goma, "goma"), (okapi, "radio-okapi")]:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "6", "-i", source,
        "-frames:v", "1", "-vf", "scale=960:-2", str(out / f"{name}.webp")], check=True)
print("Prepared private Goma film, public 15-second excerpt, credited public trailer and posters.")
