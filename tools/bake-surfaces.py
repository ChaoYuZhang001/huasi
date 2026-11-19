"""Bake temple color maps from the original CC0 scans (NumPy and Pillow with WebP)."""

from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1] / "tex"
GRADES = {
    "granite_tile": (.35, 1.75, (1, 1.01, 1.03)),
    "granite_wall": (.25, 1.25, (1, 1.01, 1.04)),
    "cliff_side": (.12, 1.3, (1, 1.01, 1.05)),
    "grey_roof_tiles": (.3, .62, (.92, 1, 1)),
    "mossy_paving": (.8, 1, (1, 1, 1)),
}


def grade(image, saturation, gain, tint):
    pixels = np.asarray(image, dtype=np.float64)
    luma = (.3 * pixels[..., 0] + .59 * pixels[..., 1] + .11 * pixels[..., 2])[..., None]
    colors = (luma + (pixels - luma) * saturation) * gain * tint
    return Image.fromarray(np.rint(np.clip(colors, 0, 255)).astype(np.uint8))


def encode(image):
    original = np.asarray(image).astype(np.int16)
    candidates = []
    for options in ({"lossless": True}, {"quality": 91}, {"quality": 94}, {"quality": 97}, {"quality": 100}):
        stream = BytesIO()
        image.save(stream, "WEBP", method=6, **options)
        stream.seek(0)
        with Image.open(stream) as decoded:
            error = np.abs(np.asarray(decoded.convert("RGB")) - original)
        rms = np.sqrt(np.mean(np.square(error, dtype=np.float64)))
        if rms <= 2 and np.percentile(error, 99) <= 6:
            candidates.append((stream.getvalue(), rms))
    return min(candidates, key=lambda candidate: len(candidate[0]))


def main():
    for resolution in ("512", "1k"):
        for name, settings in GRADES.items():
            source = ROOT / resolution / name / "color.jpg"
            with Image.open(source) as scan:
                baked, rms = encode(grade(scan.convert("RGB"), *settings))
            source.with_name("color-temple.webp").write_bytes(baked)
            print(f"{resolution}/{name}: {source.stat().st_size} -> {len(baked)} bytes, RGB RMS {rms:.2f}")


if __name__ == "__main__":
    main()
