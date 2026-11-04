"""Export the 31 printed Iqro 1 lessons without retyping or reordering them.

The source PDF has one cover followed by exactly 31 lesson pages. Cropping
removes only the surrounding white margin and the printed footer; the entire
framed lesson, including its original instructions and exercises, is kept.
"""

from pathlib import Path

import cv2
import numpy as np
import pypdfium2 as pdfium
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public/assets/aistudio/Buku_Iqro__1_-_KH._As_ad_Humam_fd135cf3.pdf"
OUTPUT = ROOT / "public/iqro/book-1"
SCALE = 2.4


def lesson_frame(image: Image.Image) -> tuple[int, int, int, int]:
    pixels = np.asarray(image.convert("L"))
    ink = (pixels < 125).astype(np.uint8)
    long_lines = cv2.morphologyEx(
        ink, cv2.MORPH_OPEN, np.ones((round(SCALE * 95), 1), np.uint8)
    )
    height, width = pixels.shape
    density = long_lines.sum(axis=0)
    xs = np.flatnonzero(
        (density > SCALE * 245)
        & (np.arange(width) > width * 0.05)
        & (np.arange(width) < width * 0.95)
    )
    if len(xs) < 2:
        raise ValueError("The two lesson borders could not be identified")
    left, right = int(xs.min()), int(xs.max())
    horizontal = cv2.morphologyEx(
        ink, cv2.MORPH_OPEN, np.ones((1, round(SCALE * 200)), np.uint8)
    )
    ys = np.flatnonzero(horizontal.sum(axis=1) > SCALE * 400)
    if not len(ys) or right - left < width * 0.55 or ys.max() - ys.min() < height * 0.5:
        raise ValueError("Lesson frame is incomplete")
    margin = round(SCALE * 7)
    return (
        max(0, left - margin),
        max(0, int(ys.min()) - margin),
        min(width, right + margin + 1),
        min(height, int(ys.max()) + margin + 1),
    )


def main() -> None:
    book = pdfium.PdfDocument(str(SOURCE))
    if len(book) != 32:
        raise ValueError(f"Expected a cover and 31 lessons; found {len(book)} pages")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for number in range(1, 32):
        rendered = book[number].render(scale=SCALE).to_pil().convert("RGB")
        image = rendered.crop(lesson_frame(rendered))
        path = OUTPUT / f"page-{number:02d}.webp"
        image.save(path, format="WEBP", lossless=True, method=6)
        with Image.open(path) as decoded:
            if not np.array_equal(np.asarray(decoded), np.asarray(image)):
                raise ValueError(f"Page {number} changed during lossless export")
        print(f"{number:02d}: {image.width}x{image.height} -> {path.name}")


if __name__ == "__main__":
    main()
