from PIL import Image, ImageDraw

CANVAS_W, CANVAS_H = 2400, 1350

uft = Image.open(r"src/assets/content/teaching/computational-architecture-in-germany-uft/MarcaUFTvertical.jpg").convert("RGBA")
avatar = Image.open(r"src/assets/avatars/daniel-locatelli-v1.png").convert("RGBA")

canvas = Image.new("RGB", (CANVAS_W, CANVAS_H), (255, 255, 255))

uft_max_w, uft_max_h = 500, 500
ratio = min(uft_max_w / uft.width, uft_max_h / uft.height)
uft_w, uft_h = int(uft.width * ratio), int(uft.height * ratio)
uft_resized = uft.resize((uft_w, uft_h), Image.LANCZOS)

avatar_size = 500
avatar_resized = avatar.resize((avatar_size, avatar_size), Image.LANCZOS)

mask = Image.new("L", (avatar_size, avatar_size), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.ellipse((0, 0, avatar_size, avatar_size), fill=255)

# space-evenly: equal gaps left of UFT, between, right of avatar
gap = (CANVAS_W - uft_w - avatar_size) // 3
uft_x = gap
uft_y = (CANVAS_H - uft_h) // 2
canvas.paste(uft_resized, (uft_x, uft_y), uft_resized)

av_x = gap + uft_w + gap
av_y = (CANVAS_H - avatar_size) // 2
canvas.paste(avatar_resized, (av_x, av_y), mask)

out_path = r"src/assets/content/teaching/computational-architecture-in-germany-uft/uft-cover.jpg"
canvas.save(out_path, "JPEG", quality=92, optimize=True)
print(f"Saved {out_path} ({canvas.size[0]}x{canvas.size[1]})")
