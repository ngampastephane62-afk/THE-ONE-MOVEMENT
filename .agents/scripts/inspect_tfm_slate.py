from pathlib import Path
import fitz

source = Path("attached_assets/0_TFM_SLATE_26_1792150979514.pdf")
output = Path("generated-artifacts/tfm-review")
output.mkdir(parents=True, exist_ok=True)
document = fitz.open(source)
print(f"Pages: {len(document)}")
for index, page in enumerate(document):
    pix = page.get_pixmap(matrix=fitz.Matrix(1.3, 1.3), alpha=False)
    path = output / f"page-{index + 1:02}.png"
    pix.save(str(path))
for start in range(0, len(document), 12):
    batch = list(range(start, min(start + 12, len(document))))
    sheet = fitz.open()
    canvas = sheet.new_page(width=1320, height=330 * ((len(batch) + 2) // 3))
    for offset, page_index in enumerate(batch):
        x, y = (offset % 3) * 440, (offset // 3) * 330
        canvas.insert_text((x + 10, y + 15), f"Page {page_index + 1}")
        canvas.show_pdf_page(fitz.Rect(x + 10, y + 25, x + 430, y + 320), document, page_index)
    path = output / f"contact-{start // 12 + 1}.jpg"
    canvas.get_pixmap(alpha=False).save(str(path))
    print(path)
