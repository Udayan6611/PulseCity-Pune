#!/usr/bin/env python3
"""
verify_fixes.py

Verifies two screenshots using the z-ai vision CLI:

1. sheher-explore-fresh.png  -> the "Explore Mumbai" section.
   Check 1: place cards show REAL PHOTOGRAPHS (not colored gradients).
   Check 2: images are loading correctly (not broken / missing).

2. sheher-footer-check.png   -> the page footer.
   Check 3: footer shows exactly 3 columns (Sheher brand, Cities, Quick Tips).
   Check 4: 'Tech Stack' column is removed.
   Check 5: 'Features' column is removed.

Usage:
    python3 /home/z/my-project/scripts/verify_fixes.py
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

EXPLORE_IMG = DOWNLOAD_DIR / "sheher-explore-fresh.png"
FOOTER_IMG = DOWNLOAD_DIR / "sheher-footer-check.png"

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
    m = re.search(r"\b(yes|true|pass|present|visible|correct|loaded)\b", text)
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


def _parse_json_reply(reply: str) -> Dict[str, Any]:
    """Strip markdown fences and parse the first {...} block from the reply."""
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


# ---------------------------------------------------------------------------
# Explore section verification
# ---------------------------------------------------------------------------
EXPLORE_PROMPT = (
    "You are inspecting a screenshot of an 'Explore Mumbai' web section that "
    "shows a grid/list of place cards. Each card is supposed to display a "
    "REAL PHOTOGRAPH (not a flat solid color or simple gradient placeholder) "
    "of the place it represents — for example a photo of the Gateway of India, "
    "the Marine Drive seafront, a hotel interior, or an Indian food plate.\n\n"
    "Look at the screenshot carefully and answer ALL of the following "
    "questions. Reply with a STRICT JSON object with EXACTLY these keys, "
    "values restricted to true / false / string:\n"
    "{\n"
    "  \"real_photos\": <true|false> -- true if the cards show REAL "
    "photographs (e.g. an arch monument, a seafront promenade, a hotel "
    "lobby, a food plate). false if any/all card images are flat colored "
    "gradients or solid-color placeholders,\n"
    "  \"images_loading\": <true|false> -- true if every card image is "
    "actually rendering / loading correctly. false if any image looks "
    "broken, missing, blank, or shows a broken-image / placeholder icon,\n"
    "  \"observed_places\": <string> -- comma-separated list of place "
    "titles you can read on the cards,\n"
    "  \"observed_image_subjects\": <string> -- comma-separated list of "
    "what you actually see in the card images (e.g. 'arch monument, "
    "seafront promenade, hotel lobby, thali plate'),\n"
    "  \"any_gradient_or_broken\": <true|false> -- true if ANY card image "
    "is a colored gradient placeholder or appears broken/missing,\n"
    "  \"notes\": <string> -- one short sentence summary\n"
    "}\n\n"
    "Reply with ONLY the JSON object, no other text, no markdown fences."
)


def verify_explore() -> Dict[str, Any]:
    print("\n" + "=" * 72)
    print("EXPLORE MUMBAI SECTION — screenshot:", EXPLORE_IMG.name)
    print("=" * 72)
    if not EXPLORE_IMG.exists():
        print(f"  [FAIL] Screenshot not found at {EXPLORE_IMG}")
        return {"overall_ok": False, "checks": []}

    reply = _run_vision(EXPLORE_PROMPT, EXPLORE_IMG, "explore_fresh")
    parsed = _parse_json_reply(reply)
    print("\n--- VLM raw reply (trimmed) ---")
    print(reply[:1500] + ("..." if len(reply) > 1500 else ""))

    checks: List[Dict[str, Any]] = []

    # Check 1: real photographs (not gradients)
    real = _coerce_bool(parsed.get("real_photos"))
    # Cross-check with the inverted signal
    broken = _coerce_bool(parsed.get("any_gradient_or_broken"))
    if real is None and broken is not None:
        real = not broken
    elif real is not None and broken is not None:
        # If model contradicts itself, prefer the explicit real_photos answer
        # but downgrade detail so the reviewer sees the conflict.
        pass
    checks.append({
        "id": 1,
        "label": "Place cards show REAL PHOTOGRAPHS (not gradients)",
        "ok": real,
        "detail": parsed.get("observed_image_subjects", "") or parsed.get("notes", ""),
    })

    # Check 2: images loading correctly
    loading = _coerce_bool(parsed.get("images_loading"))
    if loading is None and broken is not None:
        loading = not broken
    checks.append({
        "id": 2,
        "label": "All card images load correctly (none broken/missing)",
        "ok": loading,
        "detail": "broken/gradient flagged" if broken else "no broken images",
    })

    print("\n--- Explore section verdicts ---")
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
# Footer verification
# ---------------------------------------------------------------------------
FOOTER_PROMPT = (
    "You are inspecting the FOOTER at the bottom of a web page screenshot. "
    "The footer is supposed to have EXACTLY THREE columns: "
    "(1) the 'Sheher' brand column, "
    "(2) a 'Cities' column, "
    "(3) a 'Quick Tips' column. "
    "Two previous columns — 'Tech Stack' and 'Features' — should have been "
    "removed entirely.\n\n"
    "Look at the footer carefully and answer ALL of the following questions "
    "as a STRICT JSON object with EXACTLY these keys, values restricted to "
    "true / false / integer / string:\n"
    "{\n"
    "  \"footer_column_count\": <integer> -- the exact number of distinct "
    "columns you can count in the footer,\n"
    "  \"has_sheher_brand_column\": <true|false>,\n"
    "  \"has_cities_column\": <true|false>,\n"
    "  \"has_quick_tips_column\": <true|false>,\n"
    "  \"has_tech_stack_column\": <true|false> -- should be FALSE if removed,\n"
    "  \"has_features_column\": <true|false> -- should be FALSE if removed,\n"
    "  \"exactly_three_columns\": <true|false> -- true only if the footer "
    "has exactly 3 columns AND those three are Sheher / Cities / Quick Tips,\n"
    "  \"visible_column_titles\": <string> -- comma-separated list of the "
    "column heading titles you can actually read in the footer, in order,\n"
    "  \"notes\": <string> -- one short sentence summary\n"
    "}\n\n"
    "Reply with ONLY the JSON object, no other text, no markdown fences."
)


def verify_footer() -> Dict[str, Any]:
    print("\n" + "=" * 72)
    print("FOOTER CHECK — screenshot:", FOOTER_IMG.name)
    print("=" * 72)
    if not FOOTER_IMG.exists():
        print(f"  [FAIL] Screenshot not found at {FOOTER_IMG}")
        return {"overall_ok": False, "checks": []}

    reply = _run_vision(FOOTER_PROMPT, FOOTER_IMG, "footer_check")
    parsed = _parse_json_reply(reply)
    print("\n--- VLM raw reply (trimmed) ---")
    print(reply[:1500] + ("..." if len(reply) > 1500 else ""))

    checks: List[Dict[str, Any]] = []

    # Check 3: exactly 3 columns = Sheher / Cities / Quick Tips
    exactly_three = _coerce_bool(parsed.get("exactly_three_columns"))
    col_count = parsed.get("footer_column_count")
    detail_cols = parsed.get("visible_column_titles", "")
    # Fallback: if exactly_three is None, infer from count + presence flags
    if exactly_three is None and isinstance(col_count, int):
        has_brand = _coerce_bool(parsed.get("has_sheher_brand_column"))
        has_cities = _coerce_bool(parsed.get("has_cities_column"))
        has_tips = _coerce_bool(parsed.get("has_quick_tips_column"))
        if (has_brand, has_cities, has_tips) == (True, True, True):
            exactly_three = (col_count == 3)
    checks.append({
        "id": 3,
        "label": "Footer shows exactly 3 columns (Sheher brand, Cities, Quick Tips)",
        "ok": exactly_three,
        "detail": f"count={col_count!r}, titles=[{detail_cols}]",
    })

    # Check 4: Tech Stack removed
    has_ts = _coerce_bool(parsed.get("has_tech_stack_column"))
    checks.append({
        "id": 4,
        "label": "'Tech Stack' column removed from footer",
        "ok": (not has_ts) if has_ts is not None else None,
        "detail": "still present" if has_ts else "removed",
    })

    # Check 5: Features removed
    has_feat = _coerce_bool(parsed.get("has_features_column"))
    checks.append({
        "id": 5,
        "label": "'Features' column removed from footer",
        "ok": (not has_feat) if has_feat is not None else None,
        "detail": "still present" if has_feat else "removed",
    })

    print("\n--- Footer verdicts ---")
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
    print("Fresh screenshot verification via z-ai vision CLI")
    print("=" * 72)

    if not os.path.exists(ZAI_BIN):
        print(f"[FATAL] z-ai binary not found at {ZAI_BIN}")
        return 2

    explore_result = verify_explore()
    footer_result = verify_footer()

    # Final consolidated report
    print("\n" + "=" * 72)
    print("FINAL CONSOLIDATED REPORT")
    print("=" * 72)

    print("\nAll 5 checks:")
    all_checks: List[Dict[str, Any]] = []
    all_checks.extend(explore_result.get("checks", []))
    all_checks.extend(footer_result.get("checks", []))
    overall = True
    for c in sorted(all_checks, key=lambda x: x["id"]):
        ok = c["ok"]
        if ok is True:
            tag = "PASS"
            color = "\033[92m"
        elif ok is False:
            tag = "FAIL"
            color = "\033[91m"
            overall = False
        else:
            tag = "UNKNOWN"
            color = "\033[93m"
            overall = False
        reset = "\033[0m"
        detail = f"  ({c['detail']})" if c.get("detail") else ""
        print(f"  Check {c['id']}: [{color}{tag}{reset}] {c['label']}{detail}")

    print(
        "\nOVERALL VERDICT: "
        f"{'\033[92mPASS — all 5 checks satisfied\033[0m' if overall else '\033[91mFAIL — at least one check failed\033[0m'}"
    )

    # Persist a structured summary
    summary_path = OUTPUT_DIR / "verify_fixes_summary.json"
    summary = {
        "explore": explore_result,
        "footer": footer_result,
        "overall_ok": overall,
    }
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"\n[summary] written to {summary_path}")

    return 0 if overall else 1


if __name__ == "__main__":
    sys.exit(main())
