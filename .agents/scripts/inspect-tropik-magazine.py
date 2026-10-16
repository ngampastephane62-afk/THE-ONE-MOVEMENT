"""Inspect the supplied paid magazine without making its full contents public."""
from pathlib import Path
import fitz

source = Path("attached_assets/Tropik_Magazine_1792157776832.pdf")
out = Path("generated-artifacts/tropik-magazine")
out.mkdir(parents=True, exist_ok=True)
with fitz.open(source) as doc:
    print(f"Pages: {len(doc)}")
    for index in range(min(4, len(doc))):
        page = doc[index]
        print(f"\nPAGE {index + 1} ({page.rect.width:g} x {page.rect.height:g} pt)")
        print(page.get_text()[:2000])
        if index == 0:
            page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False).save(out / "cover.png")
