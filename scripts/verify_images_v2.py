#!/usr/bin/env python3
"""
Verify that place cards in the "Explore Mumbai" section show REAL photographs
(not colored gradients) after removing lazy-loading.

Uses the z-ai vision CLI to analyze the screenshot.

Verification points:
  1. Do ALL place cards show REAL PHOTOGRAPHS (not colored gradients)?
  2. Specifically: Gateway of India, Taj Mahal Palace Hotel, Marine Drive - real photos?
  3. Are the images relevant to each place
     (Gateway arch, hotel interior, seaside promenade)?
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime

SCREENSHOT_PATH = "/home/z/my-project/download/sheher-explore-images.png"
OUTPUT_DIR = "/home/z/my-project/scripts/vlm_outputs"

PROMPT = """You are inspecting a screenshot of a travel website's "Explore Mumbai" section.
The page shows a horizontal row of place cards, each with a title and an image at the top.

Answer the following questions PRECISELY and in a structured way. Be strict and
observant. Distinguish between a real photograph (shows real-world detail, textures,
lighting, depth) and a flat colored gradient / placeholder (smooth color blocks, no
real-world content).

For EACH visible place card, output a line in this exact format:

CARD: <card title> | IMAGE_TYPE: <PHOTOGRAPH | GRADIENT | UNKNOWN> | RELEVANT: <YES | NO | UNKNOWN> | DESCRIPTION: <one short sentence describing what the image actually shows>

Then answer these three overall questions, each on its own line, exactly:

OVERALL_ALL_PHOTOS: <YES | NO>
SPECIFIC_GATEWAY_OF_INDIA_PHOTO: <YES | NO>
SPECIFIC_TAJ_MAHAL_PALACE_HOTEL_PHOTO: <YES | NO>
SPECIFIC_MARINE_DRIVE_PHOTO: <YES | NO>
RELEVANCE_GATEWAY_ARCH: <YES | NO>   # Gateway of India image shows the arch monument
RELEVANCE_HOTEL_INTERIOR_OR_EXTERIOR: <YES | NO>  # Taj hotel image shows the building/interior
RELEVANCE_SEASIDE_PROMENADE: <YES | NO>  # Marine Drive image shows the seaside promenade/seafront

Be literal: only answer YES when you actually see real photographic content that
matches the description. If a card is missing or you cannot tell, answer NO.
"""


def run_vlm(image_path: str) -> dict:
    """Invoke z-ai vision CLI on the given image and return parsed result."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Screenshot not found: {image_path}")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = os.path.join(OUTPUT_DIR, f"verify_images_v2_{timestamp}.json")

    cmd = [
        "z-ai", "vision",
        "-p", PROMPT,
        "-i", image_path,
        "-o", output_path,
    ]

    print(f"Running: {' '.join(cmd[:1])} vision -p <prompt> -i {image_path} -o {output_path}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)

    if result.returncode != 0:
        print("STDERR:", result.stderr)
        raise RuntimeError(f"z-ai vision failed (exit {result.returncode})")

    # The CLI writes JSON to output_path. Parse it.
    with open(output_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Save the raw text response alongside for debugging.
    text_path = output_path.replace(".json", ".txt")
    content = _extract_text(data)
    with open(text_path, "w", encoding="utf-8") as f:
        f.write(content)

    return {"raw": data, "text": content, "output_json": output_path, "text_path": text_path}


def _extract_text(data: dict) -> str:
    """Pull the assistant message text out of the CLI's JSON response."""
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        # Fall back to dumping whatever we have.
        return json.dumps(data, ensure_ascii=False, indent=2)


def parse_verdicts(text: str) -> dict:
    """Extract YES/NO verdicts from the model's structured response."""
    keys = [
        "OVERALL_ALL_PHOTOS",
        "SPECIFIC_GATEWAY_OF_INDIA_PHOTO",
        "SPECIFIC_TAJ_MAHAL_PALACE_HOTEL_PHOTO",
        "SPECIFIC_MARINE_DRIVE_PHOTO",
        "RELEVANCE_GATEWAY_ARCH",
        "RELEVANCE_HOTEL_INTERIOR_OR_EXTERIOR",
        "RELEVANCE_SEASIDE_PROMENADE",
    ]
    verdicts = {}
    for key in keys:
        m = re.search(rf"{key}\s*:\s*(YES|NO)", text, re.IGNORECASE)
        verdicts[key] = (m.group(1).upper() if m else "UNKNOWN")
    return verdicts


def extract_card_lines(text: str) -> list:
    """Pull per-card detail lines out of the response."""
    lines = []
    for line in text.splitlines():
        ls = line.strip()
        if ls.upper().startswith("CARD:"):
            lines.append(ls)
    return lines


def main() -> int:
    result = run_vlm(SCREENSHOT_PATH)
    text = result["text"]

    print("\n" + "=" * 78)
    print("VLM RESPONSE")
    print("=" * 78)
    print(text)
    print("=" * 78 + "\n")

    verdicts = parse_verdicts(text)
    cards = extract_card_lines(text)

    print("PER-CARD DETAIL:")
    for c in cards:
        print(f"  - {c}")
    if not cards:
        print("  (no CARD: lines parsed from response)")
    print()

    print("VERDICTS:")
    for k, v in verdicts.items():
        print(f"  {k}: {v}")
    print()

    # Final PASS/FAIL logic.
    photo_checks = [
        ("All cards show photos", verdicts["OVERALL_ALL_PHOTOS"]),
        ("Gateway of India photo", verdicts["SPECIFIC_GATEWAY_OF_INDIA_PHOTO"]),
        ("Taj Mahal Palace Hotel photo", verdicts["SPECIFIC_TAJ_MAHAL_PALACE_HOTEL_PHOTO"]),
        ("Marine Drive photo", verdicts["SPECIFIC_MARINE_DRIVE_PHOTO"]),
    ]
    relevance_checks = [
        ("Gateway arch relevance", verdicts["RELEVANCE_GATEWAY_ARCH"]),
        ("Hotel relevance", verdicts["RELEVANCE_HOTEL_INTERIOR_OR_EXTERIOR"]),
        ("Seaside promenade relevance", verdicts["RELEVANCE_SEASIDE_PROMENADE"]),
    ]

    photos_ok = all(v == "YES" for _, v in photo_checks)
    relevance_ok = all(v == "YES" for _, v in relevance_checks)

    print("CHECK SUMMARY:")
    for label, v in photo_checks:
        flag = "PASS" if v == "YES" else "FAIL"
        print(f"  [{flag}] {label} -> {v}")
    for label, v in relevance_checks:
        flag = "PASS" if v == "YES" else "FAIL"
        print(f"  [{flag}] {label} -> {v}")
    print()

    overall_pass = photos_ok and relevance_ok

    print("=" * 78)
    if overall_pass:
        print("OVERALL: PASS")
        print("All place cards show real photographs of the correct Mumbai landmarks.")
    else:
        print("OVERALL: FAIL")
        if not photos_ok:
            print("  Reason: not all cards display real photographs.")
        if not relevance_ok:
            print("  Reason: at least one image is not relevant to its place.")
    print("=" * 78)

    print(f"\nRaw JSON : {result['output_json']}")
    print(f"Raw text : {result['text_path']}")

    return 0 if overall_pass else 1


if __name__ == "__main__":
    sys.exit(main())
