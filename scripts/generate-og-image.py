"""
Draws public/og-image.png: the picture that shows when someone shares a link
to the site in WhatsApp, Facebook, LinkedIn or Slack.

    python3 scripts/generate-og-image.py

Without it a shared link renders as a bare grey rectangle, which reads as an
abandoned page and costs clicks on exactly the links people pass to friends.

The colours and the mark are taken from the same tokens the site uses, so the
image and the site cannot drift apart visually. 1200x630 is the size every
platform crops from.

Fonts: Fraunces and Karla are what the site loads from Google Fonts. Install
them locally and set FRAUNCES/KARLA below to their paths to regenerate this
exactly on brand; the fallbacks are the closest shapes available otherwise.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "og-image.png"

WIDTH, HEIGHT = 1200, 630

BRAND = (18, 69, 89)
BRAND_STRONG = (11, 50, 66)
ACCENT = (217, 164, 65)
SURFACE = (245, 247, 247)
MUTED = (255, 255, 255, 190)

# Serif for the display face, geometric sans for the rest: the same pairing
# the site makes with Fraunces and Karla.
DISPLAY_CANDIDATES = [
    "/usr/share/fonts/truetype/google-fonts/Fraunces-Variable.ttf",
    "/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
]
BODY_CANDIDATES = [
    "/usr/share/fonts/truetype/google-fonts/Karla-Variable.ttf",
    "/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]


def load(candidates, size):
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size)


def vertical_gradient(size, top, bottom):
    """A gradient drawn row by row; Pillow has no gradient of its own."""
    width, height = size
    image = Image.new("RGB", (1, height))
    pixels = image.load()

    for y in range(height):
        ratio = y / (height - 1)
        pixels[0, y] = tuple(
            round(top[channel] + (bottom[channel] - top[channel]) * ratio)
            for channel in range(3)
        )

    return image.resize((width, height))


def draw_mark(canvas, x, y, size):
    """The logo mark: an M, an A, and the droplet in the counter of the A."""
    scale = size / 48
    draw = ImageDraw.Draw(canvas)

    draw.rounded_rectangle(
        [x, y, x + size, y + size],
        radius=10 * scale,
        fill=SURFACE,
    )

    stroke = round(3.2 * scale)

    def point(px, py):
        return (x + px * scale, y + py * scale)

    draw.line(
        [point(10, 33), point(10, 16.5), point(17, 23), point(24, 16.5), point(24, 33)],
        fill=BRAND,
        width=stroke,
        joint="curve",
    )
    draw.line(
        [point(28, 33), point(34, 16.5), point(40, 33)],
        fill=BRAND,
        width=stroke,
        joint="curve",
    )

    radius = 2.6 * scale
    centre = point(34, 27.5)
    draw.ellipse(
        [centre[0] - radius, centre[1] - radius, centre[0] + radius, centre[1] + radius],
        fill=ACCENT,
    )


def main():
    canvas = vertical_gradient((WIDTH, HEIGHT), BRAND, BRAND_STRONG).convert("RGBA")
    draw = ImageDraw.Draw(canvas)

    # A brass rule down the left edge, the same accent the site uses to mark
    # the things it wants read first.
    draw.rectangle([0, 0, 14, HEIGHT], fill=ACCENT)

    margin = 92

    draw_mark(canvas, margin, 86, 84)

    name = load(DISPLAY_CANDIDATES, 58)
    draw.text((margin + 110, 104), "MA Städ", font=name, fill=SURFACE)

    headline = load(DISPLAY_CANDIDATES, 76)
    draw.text((margin, 236), "Städfirma med fast pris", font=headline, fill=SURFACE)

    sub = load(BODY_CANDIDATES, 34)
    draw.text(
        (margin, 352),
        "Västra Götaland · Jönköping · Halland",
        font=sub,
        fill=(255, 255, 255, 200),
    )

    # The three things a first-time visitor actually wants to know.
    points = ["RUT draget på fakturan", "Samma team varje gång", "076-263 89 40"]
    body = load(BODY_CANDIDATES, 30)

    y = 452
    for text in points:
        draw.ellipse([margin + 2, y + 12, margin + 12, y + 22], fill=ACCENT)
        draw.text((margin + 32, y), text, font=body, fill=(255, 255, 255, 225))
        y += 52

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(OUTPUT, "PNG", optimize=True)

    size_kb = OUTPUT.stat().st_size / 1024
    print(f"Wrote {OUTPUT} ({WIDTH}x{HEIGHT}, {size_kb:.0f} kB)")


if __name__ == "__main__":
    main()
