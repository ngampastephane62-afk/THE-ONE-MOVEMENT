from pathlib import Path
import subprocess

out = Path("generated-artifacts/press-archive")
out.mkdir(parents=True, exist_ok=True)
groups = {
    "licence": [f"IMG_{n}_1792108614500.png" for n in range(7296, 7305)],
    "tv5monde": [f"IMG_{n}_1792108614500.png" for n in [695, 696, 697]],
    "monusco": ["IMG_6726_1792108614500.jpeg", "1a8bcf51-f49f-46b1-b21c-b2ab5fdfb677_1792108614500.jpeg", "28a3dae6-eb05-4369-8468-7d60274b5ffd_1792108614500.jpeg"],
    "acp": [f"IMG_{n}_1792108614500.png" for n in [6469, 6413, 6412]],
}
groups["tv5monde"] = [f"IMG_0{n}_1792108614500.png" for n in [695, 696, 697]]
for outlet, sources in groups.items():
    for i, source in enumerate(sources, 1):
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", f"attached_assets/{source}",
            "-frames:v", "1", "-c:v", "libwebp", "-quality", "90", str(out / f"{outlet}-{i:02}.webp")], check=True)

# Logos are faithful crops of the publisher marks already visible in the supplied evidence.
for name, source, crop in [
    ("licence", groups["licence"][0], "crop=645:135:60:250"),
    ("tv5monde", groups["tv5monde"][0], "crop=465:195:760:250"),
    ("monusco", groups["monusco"][0], "crop=145:145:45:30"),
]:
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", f"attached_assets/{source}",
        "-vf", crop, "-frames:v", "1", str(out / f"{name}-logo.png")], check=True)
subprocess.run(["curl", "-fL", "--max-time", "30", "-sS", "https://acp.cd/app/uploads/2023/04/Logo.png",
    "-o", str(out / "acp-logo.png")], check=True)
print("Prepared 18 full screenshots and four source publisher logos.")
