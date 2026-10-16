from pathlib import Path
import subprocess
import fitz
import zipfile

out = Path("generated-artifacts/narrative-review/films")
out.mkdir(parents=True, exist_ok=True)
sources = list(Path("attached_assets").glob("*.mov")) + list(Path("attached_assets").glob("*.mp4"))
archive = next(Path("attached_assets").glob("*.zip"))
with zipfile.ZipFile(archive) as z:
    for name in z.namelist():
        if "/02_VIDEOS_REELS/" in name and ("video-output" in name or "ScreenRecording" in name):
            dest = out / Path(name).name
            if not dest.exists():
                dest.write_bytes(z.read(name))
            sources.append(dest)
doc = fitz.open()
for i, source in enumerate(sources):
    poster = out / f"film-{i}.jpg"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", "3", "-i", str(source), "-frames:v", "1", "-vf", "scale=640:-1", str(poster)], capture_output=True)
    if not poster.exists():
        continue
    p = doc.new_page(width=720, height=490)
    p.insert_text((12,20), f"{i}: {source.name}", fontsize=9)
    p.insert_image(fitz.Rect(10,35,710,480), filename=str(poster))
    print(i, source)
for offset in range(0,len(doc),6):
    sheet=fitz.open()
    p=sheet.new_page(width=1440,height=1470)
    for j in range(min(6,len(doc)-offset)):
        p.show_pdf_page(fitz.Rect((j%2)*720,(j//2)*490,(j%2+1)*720,(j//2+1)*490),doc,offset+j)
    p.get_pixmap().save(str(out / f"sheet-{offset//6}.jpg"))
