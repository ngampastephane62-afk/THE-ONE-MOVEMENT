"""Recover the supplied archive's partner logos without extracting the whole ZIP."""
from pathlib import Path
import subprocess
import zipfile

archive = Path("attached_assets/00_FOUNDER_RAW_MEDIA_DROP-20261002T153244Z-1-001_1790955523168.zip")
out = Path("generated-artifacts/partner-history")
out.mkdir(parents=True, exist_ok=True)
sources = [
    "IMG_9103.JPG", "IMG_9105.JPG", "IMG_9104.PNG", "IMG_2126.JPG", "IMG_2204.JPG",
    "IMG_2093.JPG", "IMG_8120.jpg", "62314498-3FED-4229-9475-E8EB8047E4CF.JPG",
    "IMG_2243.JPG", "01b02df7-dd8d-4674-9587-2c29b0aa920e.JPG", "IMG_2242.PNG",
    "765552dd-090b-48d3-ada9-013ab78dacb7.JPG", "IMG_4132.PNG", "IMG_2223.JPG",
    "IMG_9102.PNG", "IMG_2097.PNG", "IMG_2114.JPG", "IMG_5247.JPG",
    "51A958E6-0FD5-4F32-BFE1-988E38FA8C32.JPG", "092fff82-3477-4a9d-b1c3-20ce4049a78b.JPG",
    "IMG_9029.PNG", "IMG_2199.JPG", "9c0e00e8-9d73-49db-af08-28de585e30f3.JPG",
    "IMG_9106.jpg", "IMG_8119.JPG", "IMG_9013.jpg", "IMG_5373.WEBP", "IMG_9030.PNG",
    "IMG_2110.PNG", "IMG_2112.WEBP", "245A35B1-941D-46CB-B735-1A8CEF87F10E.PNG",
    "IMG_2109.PNG", "e35384d1-3ef4-4479-ae84-6f6b292c301f.JPG", "IMG_9165.jpg",
    "IMG_6746.JPG", "IMG_1183.PNG", "IMG_2113.PNG",
]
with zipfile.ZipFile(archive) as z:
    by_name = {Path(n).name: n for n in z.namelist()
               if "/03_LOGOS_BRAND/" in n or "/04_PARTNERS_INSTITUTIONS/" in n}
    for i, name in enumerate(sources, 1):
        source = out / ("source-" + name)
        source.write_bytes(z.read(by_name[name]))
        command = ["magick", str(source)]
        # The co-branded graphic contains Tropik as well: isolate its partner.
        if i == 31:
            command += ["-crop", "500x683+0+0", "+repage"]
        command += ["-background", "white", "-alpha", "remove", "-alpha", "off",
                    "-fuzz", "3%", "-trim", "+repage", "-resize", "600x260>",
                    "-bordercolor", "white", "-border", "16", "-quality", "90",
                    str(out / f"archive-partner-{i:02}.webp")]
        subprocess.run(command, check=True)
    # The Founder identified this monogram as Re-Loved Luxury.
    source = out / "source-reloved-luxury.png"
    source.write_bytes(z.read(by_name["IMG_4188.PNG"]))
    subprocess.run(["magick", str(source), "-background", "white", "-alpha", "remove",
                    "-alpha", "off", "-trim", "+repage", "-resize", "600x260>",
                    "-bordercolor", "white", "-border", "16", "-quality", "90",
                    str(out / "archive-partner-42.webp")], check=True)
    strip = out / "source-historical-strip.jpg"
    strip.write_bytes(z.read(by_name["9e2a5f5a-b8ad-4715-88c6-b6541b7082fd.JPG"]))
    # Faithful crops of readable marks in the supplied historical partner banner.
    for i, crop in [(38, "50x48+96+51"), (39, "40x42+400+51"),
                    (40, "78x35+451+57"), (41, "40x42+536+51"),
                    (43, "36x45+581+50")]:
        subprocess.run(["magick", str(strip), "-crop", crop, "+repage",
                        "-resize", "300x140", "-background", "white", "-alpha", "remove",
                        "-bordercolor", "white", "-border", "16", "-quality", "90",
                        str(out / f"archive-partner-{i:02}.webp")], check=True)
print("Prepared 43 distinct partner marks from the Founder's archive.")
