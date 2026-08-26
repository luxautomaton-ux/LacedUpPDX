#!/usr/bin/env python3
"""Extract each supplied sponsor-sheet mark as an individual transparent PNG."""

from __future__ import annotations

from json import dumps
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "migration" / "sponsors-partners-sheet.jpg"
OUTPUT = ROOT / "public" / "media" / "sponsors" / "sheet"
MANIFEST = ROOT / "migration" / "sponsor-sheet-manifest.json"

# Crop rectangles use the original 4243 x 5657 supplied sheet coordinates.
CROPS = [
    ("quantum-fiber-att", "Quantum Fiber from AT&T", (150, 1100, 1550, 1600)),
    ("smack-town-sheet", "Smack Town", (1570, 1090, 2180, 1730)),
    ("dj-switch-pdx", "DJ Switch PDX", (2160, 1100, 3020, 1610)),
    ("omsi", "OMSI", (2990, 1100, 4050, 1530)),
    ("dj-og-one", "DJ O.G. One", (300, 1580, 970, 2030)),
    ("portland-gear-sheet", "Portland Gear", (980, 1600, 1390, 2180)),
    ("black-parent-initiative-sheet", "Black Parent Initiative", (1410, 1790, 1920, 2310)),
    ("taking-ownership-pdx", "Taking Ownership PDX", (1930, 1720, 2450, 2270)),
    ("julian-outlaw-sheet", "Julian Outlaw", (2470, 1690, 3000, 2220)),
    ("portland-timbers", "Portland Timbers", (3040, 1580, 3520, 2150)),
    ("red-flame-partner", "Red Flame Partner", (3500, 1530, 4090, 2280)),
    ("dominant-nutrition", "Dominant Nutrition", (290, 2080, 820, 2630)),
    ("h-cube-partner", "H-Cube Partner", (970, 2230, 1440, 2730)),
    ("starkidd-kickz", "Starkidd Kickz", (1500, 2290, 2470, 2700)),
    ("cleats-kicks-4-kids", "Cleats & Kicks 4 Kids", (2510, 2230, 3040, 2760)),
    ("booker-wallace-taylor", "The Booker Wallace Taylor Collection", (3080, 2160, 3520, 2680)),
    ("middleborn", "Middleborn", (3560, 2280, 4010, 2690)),
    ("jamn-1075-sheet", "JAM'N 107.5", (300, 2640, 850, 3170)),
    ("lego", "LEGO", (930, 2720, 1430, 3050)),
    ("que-dice", "Que Dice", (1450, 2730, 1940, 3190)),
    ("amc", "AMC", (1970, 2750, 2360, 3170)),
    ("portland-trail-blazers", "Portland Trail Blazers", (2430, 2850, 2920, 3340)),
    ("adidas", "Adidas", (2940, 2740, 3430, 3090)),
    ("lizzys-sweet-treats", "Lizzy's Sweet Treats Inc.", (3410, 2730, 3970, 3280)),
    ("photography-partner", "Photography Partner", (360, 3190, 850, 3720)),
    ("situations-conversations", "Situations & Conversations", (940, 3160, 1480, 3590)),
    ("epic-auto-detailing", "Epic Auto Detailing", (1500, 3280, 2470, 3520)),
    ("fwi", "FWI", (2970, 3120, 3280, 3430)),
    ("chime", "Chime", (3310, 3280, 3970, 3540)),
    ("oaks-park", "Oaks Park", (2500, 3350, 3060, 3740)),
    ("cmo-rose-collection", "CMO Rose Collection", (3070, 3500, 3820, 3880)),
    ("village-manor-sheet", "Village Manor of Cascadia", (300, 3730, 950, 4160)),
    ("kgw-8", "KGW 8", (990, 3560, 1350, 3940)),
    ("dejaye-johnson-photography", "DeJaye Johnson Photography", (1360, 3550, 1800, 4010)),
    ("shifted-theory", "Shifted Theory", (1800, 3540, 2210, 3970)),
    ("starting-line", "Starting Line Youth Sports Alliance", (2230, 3700, 3020, 3980)),
    ("bullwinkles", "Bullwinkles", (950, 3960, 1410, 4350)),
    ("bureau-police-portland", "Portland Police Bureau", (1450, 4020, 1940, 4410)),
    ("office-depot-sheet", "Office Depot", (1940, 3940, 2530, 4220)),
    ("trader-joes", "Trader Joe's", (2570, 3960, 3800, 4190)),
    ("bunker-recording-studio", "The Bunker Recording Studio", (300, 4160, 920, 4800)),
    ("city-of-gresham", "City of Gresham", (960, 4350, 1410, 4800)),
    ("slam", "SLAM", (1400, 4410, 2050, 4740)),
    ("fabos-tacos", "Fabo's Tacos", (2050, 4230, 2600, 4820)),
    ("krazy-koconut", "The Krazy Koconut", (2620, 4240, 3150, 4830)),
    ("hoop-portland", "Hoop Portland", (3180, 4210, 3820, 4810)),
    ("pdx-hip-hop-week", "PDX Hip-Hop Week", (150, 4990, 750, 5580)),
    ("upperleft-collective", "Upperleft Collective", (760, 4990, 1530, 5560)),
    ("laced-up-pdx-sheet", "Laced Up PDX", (1590, 4980, 2830, 5560)),
    ("mighty-nation-sheet", "Mighty Nation", (2860, 4960, 3420, 5580)),
    ("city-of-portland-sheet", "City of Portland", (3420, 4950, 4100, 5570)),
]


def remove_sheet_white(image: Image.Image) -> Image.Image:
    """Remove the sheet's near-white background without redrawing the mark."""

    rgba = np.asarray(image.convert("RGBA")).copy()
    near_white = np.all(rgba[:, :, :3] >= 248, axis=2)
    rgba[near_white, 3] = 0
    return Image.fromarray(rgba, mode="RGBA")


def trim_and_pad(image: Image.Image, padding: int = 24) -> Image.Image:
    alpha = image.getchannel("A")
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError("Crop became fully transparent")
    trimmed = image.crop(bounds)
    canvas = Image.new("RGBA", (trimmed.width + padding * 2, trimmed.height + padding * 2))
    canvas.alpha_composite(trimmed, (padding, padding))
    canvas.thumbnail((1000, 780), Image.Resampling.LANCZOS)
    return canvas


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Missing sponsor sheet: {SOURCE}")

    OUTPUT.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(SOURCE).convert("RGB")
    if sheet.size != (4243, 5657):
        raise ValueError(f"Unexpected sponsor sheet size: {sheet.size}")

    manifest = []
    for slug, name, box in CROPS:
        extracted = trim_and_pad(remove_sheet_white(sheet.crop(box)))
        filename = f"{slug}.png"
        extracted.save(OUTPUT / filename)
        manifest.append({
            "name": name,
            "file": f"/media/sponsors/sheet/{filename}",
            "crop": list(box),
            "width": extracted.width,
            "height": extracted.height,
        })

    MANIFEST.write_text(dumps({
        "source": "migration/sponsors-partners-sheet.jpg",
        "sourceWidth": sheet.width,
        "sourceHeight": sheet.height,
        "count": len(manifest),
        "logos": manifest,
    }, indent=2) + "\n")
    print(f"Extracted {len(manifest)} individual sponsor logos to {OUTPUT}")


if __name__ == "__main__":
    main()
