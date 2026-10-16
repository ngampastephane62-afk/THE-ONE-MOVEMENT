"""Produce bounded public web artwork from the owner-supplied magazine material."""
from pathlib import Path
import subprocess
import pymupdf
out = Path("generated-artifacts/tropik-editorial")
out.mkdir(parents=True, exist_ok=True)
images = sorted(Path("attached_assets").glob("*179216268514*"))
assert len(images) == 15
for i, path in enumerate(images, 1):
    subprocess.run(["magick", str(path), "-auto-orient", "-resize", "1600x1600>", "-quality", "85", str(out / f"artwork-{i:02}.webp")], check=True)
source = pymupdf.open("attached_assets/Tropik_Magazine_1792157776832.pdf")
for i, page in enumerate(source, 1):
    png = Path(f"/tmp/tropik-kit-page-{i}.png")
    page.get_pixmap(matrix=pymupdf.Matrix(1.6, 1.6)).save(str(png))
    subprocess.run(["magick", str(png), "-quality", "85", str(out / f"kit-page-{i:02}.webp")], check=True)
print("Prepared 15 magazine layouts and 10 kit illustrations.")
