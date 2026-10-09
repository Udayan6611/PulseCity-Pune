#!/usr/bin/env python3
"""
check_images_and_footer.py

Verifies the "Explore Mumbai" place-cards screenshot (sheher-explore-cards.png)
and the home page screenshot (sheher-home.png) using the z-ai vision CLI.

Checks performed:
------------------
Explore cards screenshot (sheher-explore-cards.png):
  1. Do the place cards show REAL PHOTOGRAPHS (not colored gradients)?
  2. Are the images relevant to the places (Gateway of India, Marine Drive,
     hotel interiors, food photos, etc.)?
  3. Is the card layout clean — image on top, title, category badge,
     description, budget + safety info at bottom?
  4. Are rating badges visible on the images (bottom-left corner)?
  5. Is the category icon (Compass/Utensils/Hotel) visible top-right?
  6. Are any images broken / still showing as gradients?

Home screenshot (sheher-home.png) — footer checks:
  7. Does the FOOTER now show only 3 columns (Sheher brand, Cities,
     Quick Tips) instead of 4 columns?
  8. Is "Tech Stack" removed?
  9. Is "Features" removed?

Usage:
    python3 check_images_and_footer.py
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path("/home/z/my-project")
DOWNLOAD_DIR = PROJECT_ROOT / "download"
EXPLORE_CARDS_IMG = DOWNLOAD_DIR / "sheher-explore-cards.png"
HOME_IMG = DOWNLOAD_DIR / "sheher-home.png"

OUTPUT_DIR = PROJECT_ROOT / "scripts" / "vlm_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

ZAI_BIN = "/usr/local/bin/z-ai"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _run_vision(prompt: str, image_path: Path, output_name: str) -> str:
    """Invoke the z-ai vision CLI on a single image and return the text reply."""
    out_file = OUTPUT_DIR / f"{output_name}.json"
    cmd = [
        ZAI_BIN, "vision",
        "--prompt", prompt,
        "--image", str(image_path),
        "--output", str(out_file),
    ]
    print(f"\n[vision] Running z-ai on {image_path.name} ...")
    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=180,
        )
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError(f"z-ai vision timed out on {image_path.name}") from exc

    if proc.returncode != 0:
        print(f"[vision] stderr:\n{proc.stderr}")
        raise RuntimeError(
            f"z-ai vision failed on {image_path.name} "
            f"(exit {proc.returncode})"
        )

    # Parse the JSON output file written by --output
    if out_file.exists():
        try:
            data = json.loads(out_file.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            # The CLI may write a plain-string body; fall back to stdout.
            data = {"raw": out_file.read_text(encoding="utf-8")}

        # The vision response shape is typically:
        #   {"choices": [{"message": {"content": "..."}}]}
        if isinstance(data, dict):
            choices = data.get("choices")
            if isinstance(choices, list) and choices:
                content = choices[0].get("message", {}).get("content")
                if content:
                    return content
            # Fallbacks
            for key in ("content", "text", "response", "raw"):
                if data.get(key):
                    return str(data[key])

    # Last-resort fallback to stdout
    return proc.stdout.strip()


def _coerce_bool(value: Any) -> bool | None:
    """Coerce arbitrary VLM answers to a tri-state bool."""
    if isinstance(value, bool):
        return value
    if value is None:
        return None
    text = str(value).strip().lower()
    if not text:
        return None
    # Look at the first YES/NO/TRUE/FALSE/PASS/FAIL we encounter
    m = re.search(r"\b(yes|true|pass|present|visible|correct)\b", text)
    if m:
        return True
    m = re.search(r"\b(no|false|fail|absent|missing|broken|removed|gradient)\b", text)
    if m:
        return False
    return None


def _print_verdict(label: str, ok: bool | None, detail: str = "") -> bool:
    """Pretty-print a PASS/FAIL/UNKNOWN verdict line and return the bool."""
    if ok is True:
        tag = "PASS"
        color = "\033[92m"  # green
    elif ok is False:
        tag = "FAIL"
        color = "\033[91m"  # red
    else:
        tag = "UNKNOWN"
        color = "\033[93m"  # yellow
    reset = "\033[0m"
    suffix = f" — {detail}" if detail else ""
    print(f"  [{color}{tag}{reset}] {label}{suffix}")
    return bool(ok)


# ---------------------------------------------------------------------------
# Explore cards verification
# ---------------------------------------------------------------------------
EXPLORE_PROMPT = (
    "You are inspecting a screenshot of an 'Explore Mumbai' web section that "
    "shows a grid/list of place cards. Each card is supposed to display a "
    "REAL PHOTOGRAPH (not a flat solid color or simple gradient placeholder), "
    "a title, a small category badge, a short description, and at the bottom "
    "a budget amount plus a safety indicator. A rating badge (e.g. '4.5') "
    "should sit at the BOTTOM-LEFT corner of the image, and a small category "
    "icon (Compass / Utensils / Hotel / Bed) should sit at the TOP-RIGHT "
    "corner of the image.\n\n"
    "Look at the screenshot carefully and answer ALL of the following "
    "questions. Answer each as a strict JSON object with EXACTLY these keys "
    "and values restricted to true / false / string:\n"
    "{\n"
    "  \"real_photos\": <true|false>  -- true if the cards show REAL "
    "photographs of places, false if any/all images are flat colored "
    "gradients or solid-color placeholders,\n"
    "  \"images_relevant\": <true|false> -- true if the images are relevant "
    "to Mumbai places (e.g. Gateway of India, Marine Drive, hotel interiors, "
    "Indian food), false if they are generic / unrelated,\n"
    "  \"layout_clean\": <true|false> -- true if each card has image on top, "
    "then title, then category badge, then description, then budget + safety "
    "info at the bottom,\n"
    "  \"rating_badge_visible\": <true|false> -- true if a numeric rating "
    "badge is visible at the bottom-left corner of the card images,\n"
    "  \"category_icon_visible\": <true|false> -- true if a small category "
    "icon (compass / utensils / hotel) is visible at the top-right corner "
    "of the card images,\n"
    "  \"any_image_broken_or_gradient\": <true|false> -- true if ANY card "
    "image appears broken, missing, or still a colored gradient placeholder,\n"
    "  \"observed_places\": <string> -- comma-separated list of place titles "
    "you can read on the cards,\n"
    "  \"observed_image_subjects\": <string> -- comma-separated list of what "
    "you actually see in the card images (e.g. 'arch monument, seafront "
    "promenade, hotel lobby, thali plate'),\n"
    "  \"notes\": <string> -- one short sentence summary\n"
    "}\n\n"
    "Reply with ONLY the JSON object, no other text, no markdown fences."
)


def _parse_explore(reply: str) -> Dict[str, Any]:
    """Parse the VLM JSON reply for the explore-cards image."""
    # Strip markdown code fences if any
    cleaned = reply.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    # Try to locate the first {...} block
    m = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if not m:
        return {"_raw": reply}
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return {"_raw": reply}


def verify_explore_cards() -> Dict[str, Any]:
    print("\n" + "=" * 72)
    print("EXPLORE MUMBAI CARDS — screenshot:", EXPLORE_CARDS_IMG.name)
    print("=" * 72)
    if not EXPLORE_CARDS_IMG.exists():
        print(f"  [FAIL] Screenshot not found at {EXPLORE_CARDS_IMG}")
        return {"overall_ok": False}

    reply = _run_vision(EXPLORE_PROMPT, EXPLORE_CARDS_IMG, "explore_cards")
    parsed = _parse_explore(reply)
    print("\n--- VLM raw reply (trimmed) ---")
    print(reply[:1500] + ("..." if len(reply) > 1500 else ""))

    checks: List[Dict[str, Any]] = []

    checks.append({
        "id": 1,
        "label": "Place cards show REAL PHOTOGRAPHS (not gradients)",
        "ok": _coerce_bool(parsed.get("real_photos")),
        "detail": parsed.get("notes", ""),
    })
    checks.append({
        "id": 2,
        "label": "Images are relevant to the places (Gateway / Marine Drive / hotels / food)",
        "ok": _coerce_bool(parsed.get("images_relevant")),
        "detail": parsed.get("observed_image_subjects", ""),
    })
    checks.append({
        "id": 3,
        "label": "Card layout is clean (image / title / badge / desc / budget+safety)",
        "ok": _coerce_bool(parsed.get("layout_clean")),
        "detail": "",
    })
    checks.append({
        "id": 4,
        "label": "Rating badge visible bottom-left of the image",
        "ok": _coerce_bool(parsed.get("rating_badge_visible")),
        "detail": "",
    })
    checks.append({
        "id": 5,
        "label": "Category icon (Compass / Utensils / Hotel) visible top-right",
        "ok": _coerce_bool(parsed.get("category_icon_visible")),
        "detail": "",
    })
    # For check #6 the meaning is inverted: ok = NOT broken/gradient
    broken = _coerce_bool(parsed.get("any_image_broken_or_gradient"))
    checks.append({
        "id": 6,
        "label": "No broken / gradient images",
        "ok": (not broken) if broken is not None else None,
        "detail": "no broken images" if broken is False else "broken/gradient images detected",
    })

    print("\n--- Explore-cards verdicts ---")
    overall = True
    for c in checks:
        ok = _print_verdict(c["label"], c["ok"], c["detail"])
        if not ok:
            overall = False

    return {
        "overall_ok": overall,
        "checks": checks,
        "vlm_raw": reply,
        "parsed": parsed,
    }


# ---------------------------------------------------------------------------
# Home page footer verification
# ---------------------------------------------------------------------------
FOOTER_PROMPT = (
    "You are inspecting the FOOTER at the bottom of a web page screenshot. "
    "The footer should have EXACTLY THREE columns: "
    "(1) the 'Sheher' brand column, "
    "(2) a 'Cities' column, "
    "(3) a 'Quick Tips' column. "
    "Two previous columns — 'Tech Stack' and 'Features' — should have been "
    "removed. Look at the footer carefully and answer ALL of the following "
    "questions as a strict JSON object with EXACTLY these keys, values "
    "restricted to true / false / integer / string:\n"
    "{\n"
    "  \"footer_column_count\": <integer> -- the exact number of distinct "
    "columns you can count in the footer,\n"
    "  \"has_sheher_brand_column\": <true|false>,\n"
    "  \"has_cities_column\": <true|false>,\n"
    "  \"has_quick_tips_column\": <true|false>,\n"
    "  \"has_tech_stack_column\": <true|false> -- should be FALSE if removed,\n"
    "  \"has_features_column\": <true|false> -- should be FALSE if removed,\n"
    "  \"exactly_three_columns\": <true|false> -- true only if footer has "
    "exactly 3 columns AND those are Sheher / Cities / Quick Tips,\n"
    "  \"visible_column_titles\": <string> -- comma-separated list of the "
    "column heading titles you can actually read in the footer, in order,\n"
    "  \"notes\": <string> -- one short sentence summary\n"
    "}\n\n"
    "Reply with ONLY the JSON object, no other text, no markdown fences."
)


def _parse_footer(reply: str) -> Dict[str, Any]:
    cleaned = reply.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    m = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if not m:
        return {"_raw": reply}
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return {"_raw": reply}


def verify_home_footer() -> Dict[str, Any]:
    print("\n" + "=" * 72)
    print("HOME PAGE FOOTER — screenshot:", HOME_IMG.name)
    print("=" * 72)
    if not HOME_IMG.exists():
        print(f"  [FAIL] Screenshot not found at {HOME_IMG}")
        return {"overall_ok": False}

    reply = _run_vision(FOOTER_PROMPT, HOME_IMG, "home_footer")
    parsed = _parse_footer(reply)
    print("\n--- VLM raw reply (trimmed) ---")
    print(reply[:1500] + ("..." if len(reply) > 1500 else ""))

    checks: List[Dict[str, Any]] = []

    # Check #7: exactly 3 columns = Sheher / Cities / Quick Tips
    exactly_three = _coerce_bool(parsed.get("exactly_three_columns"))
    col_count = parsed.get("footer_column_count")
    detail_cols = parsed.get("visible_column_titles", "")
    checks.append({
        "id": 7,
        "label": "Footer shows exactly 3 columns (Sheher brand, Cities, Quick Tips)",
        "ok": exactly_three,
        "detail": f"count={col_count!r}, titles=[{detail_cols}]",
    })
    # Check #8: Tech Stack removed
    has_ts = _coerce_bool(parsed.get("has_tech_stack_column"))
    checks.append({
        "id": 8,
        "label": "'Tech Stack' column removed",
        "ok": (not has_ts) if has_ts is not None else None,
        "detail": "still present" if has_ts else "removed",
    })
    # Check #9: Features removed
    has_feat = _coerce_bool(parsed.get("has_features_column"))
    checks.append({
        "id": 9,
        "label": "'Features' column removed",
        "ok": (not has_feat) if has_feat is not None else None,
        "detail": "still present" if has_feat else "removed",
    })

    print("\n--- Home-footer verdicts ---")
    overall = True
    for c in checks:
        ok = _print_verdict(c["label"], c["ok"], c["detail"])
        if not ok:
            overall = False

    return {
        "overall_ok": overall,
        "checks": checks,
        "vlm_raw": reply,
        "parsed": parsed,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> int:
    print("=" * 72)
    print("Image + Footer verification via z-ai vision CLI")
    print("=" * 72)

    if not os.path.exists(ZAI_BIN):
        print(f"[FATAL] z-ai binary not found at {ZAI_BIN}")
        return 2

    explore_result = verify_explore_cards()
    footer_result = verify_home_footer()

    # Final consolidated report
    print("\n" + "=" * 72)
    print("FINAL CONSOLIDATED REPORT")
    print("=" * 72)

    explore_overall = explore_result.get("overall_ok", False)
    footer_overall = footer_result.get("overall_ok", False)

    print(
        f"\nExplore-cards section ......... "
        f"{'\033[92mPASS\033[0m' if explore_overall else '\033[91mFAIL\033[0m'}"
    )
    for c in explore_result.get("checks", []):
        tag = "PASS" if c["ok"] else ("FAIL" if c["ok"] is False else "UNKNOWN")
        print(f"   #{c['id']:<2} {tag:<7} {c['label']}"
              + (f"  ({c['detail']})" if c["detail"] else ""))

    print(
        f"\nHome page footer .............. "
        f"{'\033[92mPASS\033[0m' if footer_overall else '\033[91mFAIL\033[0m'}"
    )
    for c in footer_result.get("checks", []):
        tag = "PASS" if c["ok"] else ("FAIL" if c["ok"] is False else "UNKNOWN")
        print(f"   #{c['id']:<2} {tag:<7} {c['label']}"
              + (f"  ({c['detail']})" if c["detail"] else ""))

    overall = explore_overall and footer_overall
    print(
        "\nOVERALL VERDICT: "
        f"{'\033[92mPASS — all checks satisfied\033[0m' if overall else '\033[91mFAIL — at least one check failed\033[0m'}"
    )

    # Persist a structured summary
    summary_path = OUTPUT_DIR / "summary.json"
    summary = {
        "explore_cards": explore_result,
        "home_footer": footer_result,
        "overall_ok": overall,
    }
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"\n[summary] written to {summary_path}")

    return 0 if overall else 1


if __name__ == "__main__":
    sys.exit(main())
