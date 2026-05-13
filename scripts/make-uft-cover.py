"""Create a 5-stripe collage cover for the UFT/SEMANAU 2023 talk page.

Each stripe is one of Daniel's projects featured in the deck, centered-cropped
to a vertical strip. Career arc: Atelier Marko Brajovic -> Estudio Guto Requena
-> ITECH master thesis -> Art Engineering.
"""
from pathlib import Path
from PIL import Image, ImageDraw

ASSETS = Path(r"C:\repos-gitlab-personal\daniellocatelli\src\assets\content")
OUT = Path(r"C:\repos-gitlab-personal\daniellocatelli\src\assets\content\teaching\computational-architecture-in-germany-uft\uft-cover.jpg")

CANVAS_W, CANVAS_H = 3840, 2160
N = 5
STRIPE_W = CANVAS_W // N
STRIPE_H = CANVAS_H
GAP = 6

images = [
    ASSETS / "projects/o3-pavilion-by-atelier-marko-brajovic-for-docol/interior-of-the-middle-cell-rain-sounds-and-leds-simulating-lightnings.jpg",
    ASSETS / "projects/air-guitar-by-atelier-marko-brajovic-for-nike/air-guitar-by-atelier-marko-brajovic-for-nike-cover_no-beams.png",
    ASSETS / "projects/life-lamp-by-estudio-guto-requena-for-decimal/life-lamp_on.jpg",
    ASSETS / "research/building-across-scales/the-demonstrator-at-night-the-holes-for-the-clamping-robots-are-now-used-for-01.jpg",
    ASSETS / "projects/donum-pavilion-by-artengineering/Donum VPP-FULL RES-26.jpg",
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

if GAP > 0:
    draw = ImageDraw.Draw(canvas)
    for i in range(1, N):
        x = i * STRIPE_W
        draw.rectangle([x - GAP // 2, 0, x + GAP // 2, CANVAS_H], fill=(255, 255, 255))

canvas.save(OUT, "JPEG", quality=88, optimize=True, progressive=True)
print(f"Saved {OUT} ({canvas.size[0]}x{canvas.size[1]})")
