from pathlib import Path
import fitz

for pdf in sorted(Path("attached_assets").glob("*179199654437*.pdf")):
    document = fitz.open(pdf)
    print(f"\n{pdf.name}: {len(document)} pages")
    output = Path("/tmp") / f"{pdf.stem}.txt"
    output.write_text(
        "\n\n".join(
            f"=== PAGE {index + 1} ===\n{page.get_text()}"
            for index, page in enumerate(document)
        ),
        encoding="utf-8",
    )
    for index in range(min(2, len(document))):
        page = document[index]
        page.get_pixmap(matrix=fitz.Matrix(0.85, 0.85)).save(
            str(Path("/tmp") / f"{pdf.stem}-{index + 1}.png")
        )
    for index, page in enumerate(document):
        text = page.get_text()
        interesting = [
            line.strip()
            for line in text.splitlines()
            if any(
                word in line.lower()
                for word in (
                    "package", "usd", "aed", "eur", "fee", "price",
                    "sponsor", "partner", "invest", "membership",
                    "return", "stylist", "designer", "exhibitor", "speaker"
                )
            )
        ]
        print(f"  Page {index + 1}: {' / '.join(interesting[:9])[:480]}")
