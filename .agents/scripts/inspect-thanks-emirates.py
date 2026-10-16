from pathlib import Path
import fitz

source = fitz.open("attached_assets/THE_ONE_MOVEMENT_X_THANKS_EMIRATES_1792105175121.pdf")
out = Path("generated-artifacts/thanks-emirates-review")
out.mkdir(parents=True, exist_ok=True)
overview = fitz.open()
sheet = overview.new_page(width=1200, height=1800)
for i in range(len(source)):
    x, y = (i % 3) * 400, (i // 3) * 300
    sheet.show_pdf_page(fitz.Rect(x + 5, y + 5, x + 395, y + 295), source, i)
sheet.get_pixmap().save(str(out / "concept-overview.png"))
print(f"Reviewed visual overview: {len(source)} pages.")
