#!/usr/bin/env python3
"""
Final verification that the "Explore Mumbai" section in
/home/z/my-project/download/sheher-explore-final.png shows REAL photographs
(not colored gradients) on all 6 place cards, that three specific landmarks
are depicted correctly, and that the overall card layout is clean and
professional.

Uses the z-ai vision CLI (z-ai-web-dev-sdk) to analyze the screenshot.

Verification points:
  1. Do ALL 6 place cards show real photographs (not gradients)?
  2. Specifically:
       - Gateway of India      -> stone arch monument
       - Taj Mahal Palace Hotel -> luxury hotel building
       - Marine Drive           -> seaside promenade
  3. Is the overall card layout clean and professional?
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime

SCREENSHOT_PATH = "/home/z/my-project/download/sheher-explore-final.png"
OUTPUT_DIR = "/home/z/my-project/scripts/vlm_outputs"

PROMPT = """You are inspecting a screenshot of a travel website's "Explore Mumbai" section.
The page shows a horizontal row of place cards (there should be 6 cards), each with a
title and an image at the top.

Distinguish carefully between:
  * a REAL PHOTOGRAPH (shows real-world detail, textures, lighting, depth, recognizable
    objects like buildings, people, sky, water, stone, etc.), and
  * a FLAT GRADIENT / PLACEHOLDER (smooth color blocks, no real-world content, possibly
    a CSS linear-gradient or solid color).

For EACH visible place card, output one line in EXACTLY this format:

CARD: <card title> | IMAGE_TYPE: <PHOTOGRAPH | GRADIENT | UNKNOWN> | DESCRIPTION: <one short sentence describing what the image actually shows>

Then output the following verdict lines, each on its own line, EXACTLY as shown
(only YES or NO, nothing else after the colon):

CARD_COUNT_IS_SIX: <YES | NO>
ALL_SIX_ARE_PHOTOGRAPHS: <YES | NO>
SPECIFIC_GATEWAY_OF_INDIA_IS_STONE_ARCH_MONUMENT: <YES | NO>
SPECIFIC_TAJ_MAHAL_PALACE_IS_LUXURY_HOTEL: <YES | NO>
SPECIFIC_MARINE_DRIVE_IS_SEASIDE_PROMENADE: <YES | NO>
LAYOUT_IS_CLEAN_AND_PROFESSIONAL: <YES | NO>

Rules:
  * CARD_COUNT_IS_SIX: YES only if exactly 6 place cards are visible.
  * ALL_SIX_ARE_PHOTOGRAPHS: YES only if every one of the 6 cards shows a real
    photograph (not a gradient/placeholder).
  * SPECIFIC_GATEWAY_OF_INDIA_IS_STONE_ARCH_MONUMENT: YES only if you can see the
    Gateway of India - a stone arch monument (yellow basalt archway by the sea).
  * SPECIFIC_TAJ_MAHAL_PALACE_IS_LUXURY_HOTEL: YES only if you can see the Taj
    Mahal Palace Hotel - a grand historic luxury hotel building (red dome /
    Indo-Saracenic architecture).
  * SPECIFIC_MARINE_DRIVE_IS_SEASIDE_PROMENADE: YES only if you can see Marine
    Drive - a seaside promenade / curved coastal road along the sea.
  * LAYOUT_IS_CLEAN_AND_PROFESSIONAL: YES only if cards are evenly sized,
    aligned, images properly cropped (no broken images, no overlapping text,
    no squashed aspect ratios, no obvious layout glitches).

Be strict and literal: answer NO whenever the visual evidence does not clearly
support the claim.
"""


def run_vlm(image_path: str) -> dict:
    """Invoke the z-ai vision CLI on the given image and return parsed result."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Screenshot not found: {image_path}")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = os.path.join(OUTPUT_DIR, f"verify_images_final_{timestamp}.json")

    cmd = [
        "z-ai", "vision",
        "-p", PROMPT,
        "-i", image_path,
        "-o", output_path,
    ]

    print(f"Running: z-ai vision -p <prompt> -i {image_path} -o {output_path}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=240)

    if result.returncode != 0:
        print("STDOUT:", result.stdout)
        print("STDERR:", result.stderr)
        raise RuntimeError(f"z-ai vision failed (exit {result.returncode})")

    with open(output_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    text_path = output_path.replace(".json", ".txt")
    content = _extract_text(data)
    with open(text_path, "w", encoding="utf-8") as f:
        f.write(content)

    return {
        "raw": data,
        "text": content,
        "output_json": output_path,
        "text_path": text_path,
    }


def _extract_text(data: dict) -> str:
    """Pull the assistant message text out of the CLI's JSON response."""
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        return json.dumps(data, ensure_ascii=False, indent=2)


def parse_verdicts(text: str) -> dict:
    """Extract YES/NO verdicts from the model's structured response."""
    keys = [
        "CARD_COUNT_IS_SIX",
        "ALL_SIX_ARE_PHOTOGRAPHS",
        "SPECIFIC_GATEWAY_OF_INDIA_IS_STONE_ARCH_MONUMENT",
        "SPECIFIC_TAJ_MAHAL_PALACE_IS_LUXURY_HOTEL",
        "SPECIFIC_MARINE_DRIVE_IS_SEASIDE_PROMENADE",
        "LAYOUT_IS_CLEAN_AND_PROFESSIONAL",
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

    # Build a clear PASS/FAIL summary mapped to the user's three questions.
    checks = [
        # (user-facing label, verdict key, expected value)
        ("Q1a. Six place cards visible",
         verdicts["CARD_COUNT_IS_SIX"], "YES"),
        ("Q1b. All 6 cards show real photographs (not gradients)",
         verdicts["ALL_SIX_ARE_PHOTOGRAPHS"], "YES"),
        ("Q2a. Gateway of India shows stone arch monument",
         verdicts["SPECIFIC_GATEWAY_OF_INDIA_IS_STONE_ARCH_MONUMENT"], "YES"),
        ("Q2b. Taj Mahal Palace Hotel shows luxury hotel",
         verdicts["SPECIFIC_TAJ_MAHAL_PALACE_IS_LUXURY_HOTEL"], "YES"),
        ("Q2c. Marine Drive shows seaside promenade",
         verdicts["SPECIFIC_MARINE_DRIVE_IS_SEASIDE_PROMENADE"], "YES"),
        ("Q3. Overall card layout clean and professional",
         verdicts["LAYOUT_IS_CLEAN_AND_PROFESSIONAL"], "YES"),
    ]

    print("VERDICTS:")
    for k, v in verdicts.items():
        print(f"  {k}: {v}")
    print()

    print("CHECK SUMMARY:")
    for label, value, expected in checks:
        flag = "PASS" if value == expected else "FAIL"
        print(f"  [{flag}] {label} -> {value}")
    print()

    overall_pass = all(value == expected for _, value, expected in checks)

    print("=" * 78)
    if overall_pass:
        print("OVERALL: PASS")
        print("All 6 place cards show real photographs of the correct Mumbai "
              "landmarks, and the card layout is clean and professional.")
    else:
        print("OVERALL: FAIL")
        for label, value, expected in checks:
            if value != expected:
                print(f"  - FAIL: {label} (got {value})")
    print("=" * 78)

    print(f"\nRaw JSON: {result['output_json']}")
    print(f"Raw text: {result['text_path']}")

    return 0 if overall_pass else 1


if __name__ == "__main__":
    sys.exit(main())
