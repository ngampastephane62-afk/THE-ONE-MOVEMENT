import fitz
from pathlib import Path

doc = fitz.open("attached_assets/Tropic_Agency_International_Media_Coverage_1792029914839.pdf")
out = Path("/tmp/tropik-inspection")
out.mkdir(exist_ok=True)
for i in [0, 1, len(doc) - 1]:
    doc[i].get_pixmap(matrix=fitz.Matrix(1.3, 1.3)).save(str(out / f"page-{i+1}.png"))
(out / "text.txt").write_text("\n".join(p.get_text() for p in doc))
print(f"{len(doc)} pages; images and text in {out}")
for i, p in enumerate(doc):
    if i == 1:
        print(p.get_text("blocks")[:12])
