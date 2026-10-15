"""Extract catalogue records and original logos, preserving the supplied PDF."""
import json
import re
from pathlib import Path
import fitz

doc = fitz.open("attached_assets/Tropic_Agency_International_Media_Coverage_1792029914839.pdf")
out = Path("generated-artifacts/media-catalogue")
out.mkdir(parents=True, exist_ok=True)
categories, outlets = [], []
current = None
for pi, page in enumerate(doc):
    spans = [s for b in page.get_text("dict")["blocks"] if b["type"] == 0 for l in b["lines"] for s in l["spans"]]
    headers = sorted([s for s in spans if s["size"] >= 14 and pi > 0], key=lambda s: s["bbox"][1])
    names = [s for s in spans if 8.1 < s["size"] < 14]
    images = page.get_image_info(xrefs=True)
    events = sorted([(h["bbox"][1], "header", h) for h in headers] + [(n["bbox"][1], "name", n) for n in names], key=lambda e: (e[0], e[2]["bbox"][0]))
    for y, kind, span in events:
        if kind == "header":
            current = {"id": f"category-{len(categories)+1:02d}", "name": span["text"].strip()}
            categories.append(current)
            continue
        if not current:
            continue
        x = span["bbox"][0]
        # Multi-line names are grouped into the same PDF text block.
        continuation = next((o for o in reversed(outlets[-2:]) if o.get("_page") == pi and abs(o["_x"]-x)<2 and 0 < y-o["_y"] < 15), None)
        if continuation:
            continuation["name"] += " " + span["text"].strip()
            continue
        following = [s["bbox"][1] for s in names if abs(s["bbox"][0]-x)<2 and s["bbox"][1] > y+15]
        stop = min(following + [y+62])
        nearby = [s["text"].strip() for s in spans if x-2 <= s["bbox"][0] < x+165 and y+10 < s["bbox"][1] < stop]
        formats = [f for f in ["ARTICLE", "PRESS RELEASE", "CAMPAIGN", "COVER CAMPAIGN"] if f in nearby]
        languages = [s for s in nearby if s in ["ARABIC", "FRENCH", "JAPANESE", "URDU", "PERSIAN", "TURKISH"]]
        domains = [s for s in nearby if "." in s and " " not in s and re.match(r"^[a-z0-9.-]+\.[a-z]{2,}(/.*)?$", s)]
        idx = len(outlets)+1
        image = next((im for im in images if 0 < x-im["bbox"][2] < 20 and abs(im["bbox"][1]-y)<12), None)
        logo = None
        if image:
            logo = f"outlet-{idx:03d}.png"
            page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=fitz.Rect(image["bbox"])).save(str(out / logo))
        outlets.append({"id": f"outlet-{idx:03d}", "name": span["text"].strip(), "categoryId": current["id"], "formats": formats, "languages": languages, "website": "https://"+domains[0] if domains else None, "logo": f"/api/media-catalogue/assets/{logo}" if logo else None, "sourcePage": pi+1, "_page": pi, "_x": x, "_y": y})
for o in outlets:
    for k in ["_page", "_x", "_y"]:
        del o[k]
assert len(categories) == 18, len(categories)
print("Counts by category:", [(c["name"], sum(o["categoryId"] == c["id"] for o in outlets)) for c in categories])
assert len(outlets) == 353, len(outlets)
data = {"categories": categories, "outlets": outlets}
Path("lib/shared/src/mediaCatalogue.ts").write_text(
    "// Generated from the supplied Tropic Agency International Media Coverage PDF.\n"
    "export type MediaOutlet = { id: string; name: string; categoryId: string; formats: string[]; languages: string[]; website: string | null; logo: string | null; sourcePage: number };\n"
    "export const MEDIA_CATEGORIES: { id: string; name: string }[] = " + json.dumps(categories, ensure_ascii=False, indent=2) + ";\n"
    "export const MEDIA_OUTLETS: MediaOutlet[] = " + json.dumps(outlets, ensure_ascii=False, indent=2) + ";\n"
)
print(json.dumps({"categories": categories, "outlets": len(outlets), "logos": sum(bool(o["logo"]) for o in outlets), "missingFormats": [o["name"] for o in outlets if not o["formats"]]}, indent=2))
