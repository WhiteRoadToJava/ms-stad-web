"""
Draws the pictures that represent the company outside the site itself:

    public/og-image.png          shown when a link is shared
    brand/facebook-profile.png   1080x1080 profile picture
    brand/facebook-cover.png     1640x924 cover photo

    python3 scripts/generate-brand-images.py

The social pictures are generated from the same tokens and the same mark as
the site, which is the whole point of them: a customer who sees the Facebook
page and then opens mastad.se should not wonder whether it is the same
company. Only public/og-image.png is published; the other two are uploaded to
Facebook by hand.

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
OG_OUTPUT = ROOT / "public" / "og-image.png"
BRAND_DIR = ROOT / "brand"

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


def draw_share_image():
    canvas = vertical_gradient((WIDTH, HEIGHT), BRAND, BRAND_STRONG).convert("RGBA")
    draw = ImageDraw.Draw(canvas)

    # A brass rule down the left edge, the same accent the site uses to mark
    # the things it wants read first.
    draw.rectangle([0, 0, 14, HEIGHT], fill=ACCENT)

    margin = 92

    draw_mark(canvas, margin, 86, 84)

    name = load(DISPLAY_CANDIDATES, 58)
    draw.text((margin + 110, 104), "MA Städservice", font=name, fill=SURFACE)

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

    save(canvas, OG_OUTPUT, WIDTH, HEIGHT)


def centred(draw, text, font, y, width, fill):
    """Facebook crops from the edges, so anything that matters is centred."""
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    draw.text(((width - (right - left)) / 2 - left, y), text, font=font, fill=fill)
    return bottom - top


def draw_profile_picture():
    """
    1080x1080, shown as a circle almost everywhere.

    So the mark sits in the middle with room around it: the corners of this
    square are never seen, and a name written across it would be clipped.
    """
    size = 1080
    canvas = vertical_gradient((size, size), BRAND, BRAND_STRONG).convert("RGBA")
    draw = ImageDraw.Draw(canvas)

    mark = 300
    draw_mark(canvas, (size - mark) // 2, 300, mark)

    name = load(DISPLAY_CANDIDATES, 86)
    centred(draw, "MA Städservice", name, 680, size, SURFACE)

    tagline = load(BODY_CANDIDATES, 38)
    centred(draw, "Städning med fast pris", tagline, 790, size, (255, 255, 255, 205))

    save(canvas, BRAND_DIR / "facebook-profile.png", size, size)


def draw_cover_photo():
    """
    1640x924, and cropped differently on every device.

    Facebook shows roughly the middle band on a phone and hides the lower left
    behind the profile picture on a desktop, so everything that has to be read
    stays centred and above that corner.
    """
    width, height = 1640, 924
    canvas = vertical_gradient((width, height), BRAND, BRAND_STRONG).convert("RGBA")
    draw = ImageDraw.Draw(canvas)

    mark = 150
    draw_mark(canvas, (width - mark) // 2, 150, mark)

    name = load(DISPLAY_CANDIDATES, 92)
    centred(draw, "MA Städservice", name, 340, width, SURFACE)

    services = load(BODY_CANDIDATES, 40)
    centred(
        draw,
        "Hemstädning · Flyttstädning · Kontorsstäd · Fönsterputs",
        services,
        460,
        width,
        (255, 255, 255, 210),
    )

    cities = load(BODY_CANDIDATES, 32)
    centred(
        draw,
        "GÖTEBORG · BORÅS · JÖNKÖPING · HALMSTAD · VARBERG",
        cities,
        530,
        width,
        ACCENT,
    )

    # The phone number is the one thing worth making loud: most of this trade
    # is still booked by calling.
    phone = load(DISPLAY_CANDIDATES, 56)
    left, top, right, bottom = draw.textbbox((0, 0), "076-263 89 40", font=phone)
    pill_width, pill_height = right - left + 96, bottom - top + 52
    pill_x, pill_y = (width - pill_width) / 2, 610

    draw.rounded_rectangle(
        [pill_x, pill_y, pill_x + pill_width, pill_y + pill_height],
        radius=pill_height / 2,
        fill=ACCENT,
    )
    draw.text(
        (pill_x + 48 - left, pill_y + 26 - top),
        "076-263 89 40",
        font=phone,
        fill=BRAND_STRONG,
    )

    site = load(BODY_CANDIDATES, 36)
    centred(draw, "mastad.se", site, 740, width, (255, 255, 255, 215))

    save(canvas, BRAND_DIR / "facebook-cover.png", width, height)


def save(canvas, output, width, height):
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(output, "PNG", optimize=True)
    print(f"Wrote {output} ({width}x{height}, {output.stat().st_size / 1024:.0f} kB)")


def main():
    draw_share_image()
    draw_profile_picture()
    draw_cover_photo()


if __name__ == "__main__":
    main()
