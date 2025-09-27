#!/usr/bin/env python3
"""Utility script to keep the screenshot gallery in sync with the images folder.

The script scans ``docs/screenshots`` for ``.png`` files and writes a JavaScript
module (``docs/screenshot_data.js``) that exposes a ``window.screenshotData``
array. Each entry contains the filename and a caption derived from the
filename. Optional caption overrides can be supplied via
``docs/screenshot_captions.json``.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SCREENSHOT_DIR = ROOT / "screenshots"
OUTPUT_FILE = ROOT / "screenshot_data.js"
CAPTION_OVERRIDES_FILE = ROOT / "screenshot_captions.json"


def _slug_to_caption(name: str) -> str:
    """Generate a human readable caption from a filename."""
    stem = Path(name).stem
    # Split on hyphen/underscore and collapse multiple delimiters.
    parts = [part for part in re.split(r"[-_]+", stem) if part]
    if not parts:
        return stem.title() or name
    return " ".join(part.capitalize() if part.isupper() else part.title() for part in parts)


def load_caption_overrides() -> dict[str, str]:
    if not CAPTION_OVERRIDES_FILE.exists():
        return {}

    try:
        with CAPTION_OVERRIDES_FILE.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid JSON in {CAPTION_OVERRIDES_FILE}: {exc}") from exc

    if not isinstance(data, dict):
        raise SystemExit(
            f"Expected {CAPTION_OVERRIDES_FILE} to contain a JSON object mapping filenames to captions."
        )

    overrides: dict[str, str] = {}
    for key, value in data.items():
        if not isinstance(key, str) or not isinstance(value, str):
            raise SystemExit(
                f"Invalid entry in {CAPTION_OVERRIDES_FILE}: both keys and values must be strings."
            )
        overrides[key] = value.strip()
    return overrides


def gather_screenshots() -> list[dict[str, str]]:
    if not SCREENSHOT_DIR.exists():
        raise SystemExit(f"Screenshot directory {SCREENSHOT_DIR} does not exist.")

    overrides = load_caption_overrides()

    screenshots = []
    for path in sorted(SCREENSHOT_DIR.glob("*.png")):
        caption = overrides.get(path.name, _slug_to_caption(path.name))
        screenshots.append({"file": path.name, "caption": caption})

    return screenshots


def write_data_file(screenshots: list[dict[str, str]]) -> None:
    OUTPUT_FILE.write_text(
        "window.screenshotData = " + json.dumps(screenshots, indent=4, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    screenshots = gather_screenshots()
    write_data_file(screenshots)
    print(f"Generated {OUTPUT_FILE.relative_to(ROOT)} with {len(screenshots)} entries.")
