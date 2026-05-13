"""Create a 5-stripe collage cover for the UFT/SEMANAU 2023 talk page.

Each stripe is one of the German projects featured in the deck, centered-cropped
to a vertical strip. The talk is about computational architecture in Germany,
so only German-located projects are included.
"""
from pathlib import Path
from PIL import Image

ASSETS = Path(r"C:\repos-gitlab-personal\daniellocatelli\src\assets\content")
DECK = ASSETS / "teaching/computational-architecture-in-germany-uft/deck"
OUT = Path(r"C:\repos-gitlab-personal\daniellocatelli\src\assets\content\teaching\computational-architecture-in-germany-uft\uft-cover.jpg")

CANVAS_W, CANVAS_H = 3840, 2160
N = 5
STRIPE_W = CANVAS_W // N
STRIPE_H = CANVAS_H

images = [
    DECK / "buga-wood-pavilion-reuse-2023.jpg",
    DECK / "icd-itke-research-pavilion-2015-16.jpg",
    DECK / "icd-itke-research-pavilion-2016-17.jpg",
    ASSETS / "research/building-across-scales/demonstrated-construction-site-setup-mobile-robotic-platform-tim-spider-crane.jpg",
    DECK / "livmats-biomimetic-shell.jpg",
]

canvas = Image.new("RGB", (CANVAS_W, CANVAS_H), (255, 255, 255))
target_ratio = STRIPE_W / STRIPE_H

for i, path in enumerate(images):
    img = Image.open(path).convert("RGB")
    w, h = img.size
    src_ratio = w / h

    if src_ratio > target_ratio:
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        box = (left, 0, left + new_w, h)
    else:
        new_h = int(w / target_ratio)
        top = (h - new_h) // 2
        box = (0, top, w, top + new_h)

    cropped = img.crop(box)
    resized = cropped.resize((STRIPE_W, STRIPE_H), Image.LANCZOS)
    canvas.paste(resized, (i * STRIPE_W, 0))

canvas.save(OUT, "JPEG", quality=88, optimize=True, progressive=True)
print(f"Saved {OUT} ({canvas.size[0]}x{canvas.size[1]})")
