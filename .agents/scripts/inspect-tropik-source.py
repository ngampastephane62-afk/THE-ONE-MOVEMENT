"""Render the supplied magazine kit and an index of new artwork for review."""
from pathlib import Path
import pymupdf

output = Path("/tmp/tropik-source-review")
output.mkdir(exist_ok=True)
source = pymupdf.open("attached_assets/Tropik_Magazine_1792157776832.pdf")
contact = pymupdf.open()
page = contact.new_page(width=1500, height=1000)
for i, original in enumerate(source):
    x, y = (i % 5) * 300, (i // 5) * 500
    page.insert_text((x + 8, y + 18), f"Kit — page {i + 1}")
    page.show_pdf_page(pymupdf.Rect(x + 8, y + 25, x + 292, y + 490), source, i)
    print(f"\n--- PAGE {i + 1} ---\n{original.get_text()}")
page.get_pixmap().save(str(output / "kit-contact.png"))

images = sorted(Path("attached_assets").glob("*179216268514*"))
contact = pymupdf.open()
page = contact.new_page(width=1500, height=1200)
for i, path in enumerate(images):
    x, y = (i % 5) * 300, (i // 5) * 400
    page.insert_text((x + 8, y + 18), f"{i + 1}: {path.name[:12]}")
    page.insert_image(pymupdf.Rect(x + 5, y + 25, x + 295, y + 395), filename=str(path))
    print(f"ARTWORK {i + 1}: {path.name}")
page.get_pixmap().save(str(output / "articles-contact.png"))
