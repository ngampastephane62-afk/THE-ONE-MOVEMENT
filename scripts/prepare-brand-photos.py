"""Create bounded JPEGs for the original brand-photo contract from supplied media.

Run from the repository root: python scripts/prepare-brand-photos.py
No stock imagery or invented event photography is used.
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "artifacts/web"
DEST = WEB / "public/brand-photos"
CATALOG = json.loads((WEB / "src/assets/media/founder/catalog.json").read_text())

ARCHIVE = {
    "photo-01.jpg": "casting-group",
    "photo-02.jpg": "runway-edition-five",
    "photo-03.jpg": "designer-portrait",
    "photo-04.jpg": "audience",
    "photo-05.jpg": "cultural-performance",
    "photo-06.jpg": "casting-group",
    "photo-07.jpg": "institutional-dialogue",
    "photo-08.jpg": "summit-goma",
    "photo-09.jpg": "diplomatic-encounter",
    "photo-10.jpg": "global-encounter",
    "photo-11.jpg": "community-gathering",
    "photo-12.jpg": "community-outreach",
    "photo-13.jpg": "runway-cultural",
    "vision-hero.jpg": "casting-group",
    # Origin-themed archive, not a claim that this photograph was taken in Bukavu.
    "vision-bukavu.jpg": "runway-edition-five",
    "vision-culture-peace.jpg": "cultural-performance",
    "vision-global-community.jpg": "community-gathering",
    "programs-summit.jpg": "summit-goma",
}
SUPPLIED = {
    "programs-diplomatic-gala.jpg": ("programs/gala-diplomatic-handshake.webp", "Diplomatic encounter · supplied archive, not a gala edition"),
    "programs-fashion-week.jpg": ("editorial/fashion-three-models.webp", "Official Fashion Week artwork · supplied programme cover"),
    "programs-awards.jpg": ("editorial/awards-naomi.webp", "Official Awards artwork featuring Naomi Campbell · announced recognition, not proof of attendance"),
    "programs-fashion-night.jpg": ("programs/fashion-night-runway-group.webp", "Night runway · illustrative archive, not a Fashion Night edition"),
    "programs-investment-forum.jpg": ("programs/archive-speaker-microphone.webp", "Speaker on stage · illustrative archive, not an Investment Forum event"),
}


def prepare():
    manifest = {}
    for filename, photo_id in ARCHIVE.items():
        photo = CATALOG["photos"][photo_id]
        manifest[filename] = {
            "source": f"public/brand-photos/{photo['filename']}",
            "originalSource": photo["source"],
            "caption": photo["caption"],
            "alt": photo["alt"],
        }
    for filename, (source, caption) in SUPPLIED.items():
        manifest[filename] = {
            "source": f"src/assets/media/{source}",
            "caption": caption,
        }
    for filename, metadata in manifest.items():
        source = WEB / metadata["source"]
        if not source.is_file():
            raise FileNotFoundError(source)
        subprocess.run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(source), "-frames:v", "1",
            "-vf", "scale=w='min(1400,iw)':h='min(1800,ih)':force_original_aspect_ratio=decrease",
            "-q:v", "3", str(DEST / filename),
        ], check=True)
    (DEST / "sources.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Prepared {len(manifest)} brand photographs and supplied covers.")


if __name__ == "__main__":
    prepare()
