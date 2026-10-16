from pathlib import Path
import fitz

out = Path("generated-artifacts/narrative-review")
out.mkdir(parents=True, exist_ok=True)
doc = fitz.open("attached_assets/The_One_Movement_International_Narrative_FINAL_1792105099109.pdf")
sheet = fitz.open()
overview = sheet.new_page(width=1440, height=590*((len(doc)+2)//3))
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(1.3, 1.3))
    pix.save(str(out / f"page-{i+1}.png"))
    x, y = (i%3)*480, (i//3)*590
    overview.insert_text((x+10,y+15), f"PAGE {i+1}")
    overview.insert_image(fitz.Rect(x,y+20,x+480,y+580), filename=str(out / f"page-{i+1}.png"))
overview.get_pixmap().save(str(out / "overview.jpg"))
print(len(doc), "pages rendered")
