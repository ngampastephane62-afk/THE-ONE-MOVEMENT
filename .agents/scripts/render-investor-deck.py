from pathlib import Path
import sys
import fitz

source = Path(sys.argv[1] if len(sys.argv) > 1 else "attached_assets/INVESTOR_DECK_TOM__1792181262036.pdf")
out = Path(sys.argv[2] if len(sys.argv) > 2 else "generated-artifacts/public-investor-deck")
out.mkdir(parents=True, exist_ok=True)
doc = fitz.open(source)
for index, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(1.8, 1.8), alpha=False)
    pix.save(str(out / f"page-{index + 1:02}.jpg"), jpg_quality=85)
    print(f"\nPAGE {index + 1}\n{page.get_text()}")
