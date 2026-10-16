import concurrent.futures
import json
from pathlib import Path
import subprocess
import urllib.request

folder = Path("generated-artifacts/tfm-review")
items = json.loads((folder / "portrait-sources.json").read_text())
labels = [
    "Jonathan Rhys", "Eloise Smyth", "Luke Kleintank", "Pierce Brosnan",
    "Hermione Corfield", "Tim Roth", "Jamie Chung", "Nick Cannon",
    "Samer Al Masri", "Micky R", "Robert Knepper", "Bubble Machine",
    "Don Bejnamin", "Tosin Morohunfola", "Matt Rife", "Destorm power",
    "Wesley Armstrong", "Jumana Murad", "King Bach", "George Lopez",
    "Adam Waheed", "Yancey Arias", "Ahmed El Mawas", "Terrence J", "Stephanie Nur",
]
sources = [next(item["url"] for item in items if item["label"].startswith(label)) for label in labels]
sources.append("https://static.wixstatic.com/media/e59907_b7fd24e18d1f454d916ce005ee5de4a6~mv2.png/v1/crop/x_0,y_23,w_385,h_462/fill/w_309,h_371,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/QQ.png")

def prepare(entry):
    index, url = entry
    original = folder / f"portrait-source-{index:02}.image"
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "image/jpeg,image/png"})
    with urllib.request.urlopen(request, timeout=60) as response:
        original.write_bytes(response.read())
    output = folder / f"tfm-portrait-{index:02}.webp"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(original),
                    "-vf", "scale=320:320:force_original_aspect_ratio=decrease",
                    "-frames:v", "1", "-c:v", "libwebp", "-quality", "84",
                    "-threads", "1", str(output)], check=True)
    return f"{output.name}: {output.stat().st_size} bytes"

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    for result in executor.map(prepare, enumerate(sources, 1)):
        print(result)
