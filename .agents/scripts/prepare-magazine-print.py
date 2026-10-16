"""Optimize the new print-heritage photographs, excluding duplicate reference screenshots."""
from pathlib import Path
import subprocess

out = Path("generated-artifacts/tropik-editorial")
out.mkdir(parents=True, exist_ok=True)
sources = {
    "heritage-01": "IMG_3726_1792165986973.jpeg",
    "heritage-02": "IMG_2727_1792165986973.jpeg",
    "heritage-03": "IMG_2726_1792165986973.jpeg",
    "heritage-04": "36586aca-768e-44bf-93d6-26eeffa960ad_1792165986973.jpeg",
    "print-reader-01": "6B69DB32-4A0C-4304-9E01-0CEABF8F7E63_1792165986973.png",
    "artwork-16": "9ABC840D-A34A-4B74-ADFB-7FB4A6BB93E8_1792165986973.png",
}
for name, source in sources.items():
    subprocess.run(["magick", str(Path("attached_assets") / source), "-auto-orient", "-resize", "1600x1600>", "-quality", "88", str(out / f"{name}.webp")], check=True)
print("Prepared six unique magazine/print visuals.")
