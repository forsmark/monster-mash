"""Draws public/icon.png (512x512), the home-screen icon, from the favicon's design:
a red skewed panel, a black panel inside it and a white "M", tilted like the favicon.
Run: python3 scripts/make-icon.py (needs Pillow)."""
import math
from PIL import Image, ImageDraw

SIZE, SCALE = 512, 4  # draw at 4x and downsample for smooth edges
S = SIZE * SCALE / 64  # favicon units (viewBox 0 0 64 64) to pixels


def pts(coords):
    return [(x * S, y * S) for x, y in coords]


def rotate(points, deg, cx=32, cy=32):
    a = math.radians(deg)
    out = []
    for x, y in points:
        dx, dy = x - cx, y - cy
        out.append((cx + dx * math.cos(a) - dy * math.sin(a), cy + dx * math.sin(a) + dy * math.cos(a)))
    return out


img = Image.new("RGB", (SIZE * SCALE,) * 2, "#111111")
d = ImageDraw.Draw(img)
d.polygon(pts([(4, 10), (58, 2), (62, 54), (8, 62)]), fill="#d50017")
d.polygon(pts([(10, 14), (52, 8), (56, 50), (14, 56)]), fill="#111111")
# A blocky "M" in favicon units, like the favicon's Impact letter, tilted -6 degrees.
m = [(19, 46), (19, 20), (26, 20), (33, 32), (40, 20), (47, 20), (47, 46), (41, 46), (41, 31), (35, 41), (31, 41), (25, 31), (25, 46)]
d.polygon(pts(rotate(m, -6)), fill="#ffffff")
img.resize((SIZE, SIZE), Image.LANCZOS).save("public/icon.png", optimize=True)
print("wrote public/icon.png")
