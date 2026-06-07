"""Create a 5-stripe collage cover for the UFT/SEMANAU 2023 talk page.

Each stripe is one of the German projects featured in the deck, centered-cropped
to a vertical strip. The talk is about computational architecture in Germany,
so only German-located projects are included.
"""
from pathlib import Path
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
ASSETS = REPO_ROOT / "src/assets/content"
DECK = ASSETS / "teaching/computational-architecture-in-germany-uft/deck"
OUT = ASSETS / "teaching/computational-architecture-in-germany-uft/uft-cover.jpg"

CANVAS_W, CANVAS_H = 3840, 2160
N = 5
STRIPE_W = CANVAS_W // N
STRIPE_H = CANVAS_H

# (path, x_shift): x_shift nudges the horizontal crop center for wide
# images, as a fraction of the stripe width. Negative moves left.
images = [
    (DECK / "buga-wood-pavilion-reuse-2023.jpg", 0.0),
    (DECK / "icd-itke-research-pavilion-2016-17_upscayl_2x_high-fidelity-4x.png", -0.40),
    (DECK / "icd-itke-research-pavilion-2015-16.jpg", 0.0),
    (DECK / "buga-fibre-pavilion-2019.jpg", 0.0),
    (DECK / "livmats-biomimetic-shell.jpg", 0.0),
]

canvas = Image.new("RGB", (CANVAS_W, CANVAS_H), (255, 255, 255))
target_ratio = STRIPE_W / STRIPE_H

for i, (path, x_shift) in enumerate(images):
    img = Image.open(path).convert("RGB")
    w, h = img.size
    src_ratio = w / h

    if src_ratio > target_ratio:
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2 + int(x_shift * new_w)
        left = max(0, min(left, w - new_w))
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
