#!/usr/bin/env python3
"""
Verify the Sheher "Heritage" and "Compare" tabs via the z-ai vision CLI (VLM SDK).

For each screenshot the script asks the vision model a structured set of
questions about the tab UI, parses the JSON reply, and prints a concise
PASS/FAIL summary.

Usage:
    python3 scripts/check_tabs.py
    python3 scripts/check_tabs.py /path/to/heritage.png /path/to/compare.png
"""

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

DEFAULT_HERITAGE = "/home/z/my-project/download/sheher-heritage.png"
DEFAULT_COMPARE = "/home/z/my-project/download/sheher-compare.png"

HERITAGE_PROMPT = """You are a senior frontend reviewer inspecting a screenshot
of the "Sheher" web application. This screenshot is supposed to show the
"Heritage" tab, which displays a TIMELINE of historical places/landmarks for a
city. Carefully examine the image and answer each question with a strict
"YES" or "NO" on the first line, followed by a short justification
(1-2 sentences).

Questions:
1. Is the Heritage tab content visible and rendering correctly (no blank screen,
   no error boundary, no broken layout, no loading spinner stuck forever)?
2. Is there a visible TIMELINE of historical places / landmarks (chronological
   ordering, year/era markers, points along an axis, or stacked milestone cards)?
3. Are individual heritage place cards / entries visible (each showing at least a
   name and a year/era)?
4. Are there any visible issues (overflow, broken layout, missing content,
   untranslated placeholder text, empty state where data should be, etc.)?
5. Does the overall Heritage tab look professional and on-theme (city heritage)?

Format your reply EXACTLY as JSON:
{
  "q1_content_visible": "YES|NO",
  "q1_note": "...",
  "q2_timeline_visible": "YES|NO",
  "q2_note": "...",
  "q3_place_cards_visible": "YES|NO",
  "q3_note": "...",
  "q4_visible_issues": "YES|NO",
  "q4_note": "...",
  "q5_professional_polished": "YES|NO",
  "q5_note": "...",
  "final_verdict": "PASS|ISSUES",
  "issues": ["...", "..."]
}
"""

COMPARE_PROMPT = """You are a senior frontend reviewer inspecting a screenshot
of the "Sheher" web application. This screenshot is supposed to show the
"Compare" tab, which lets a user pick two cities and shows WINNER cards plus
BAR and RADAR charts comparing them across metrics. Carefully examine the image
and answer each question with a strict "YES" or "NO" on the first line,
followed by a short justification (1-2 sentences).

Questions:
1. Is the Compare tab content visible and rendering correctly (no blank screen,
   no error boundary, no broken layout, no stuck loading spinner)?
2. Are there visible CITY SELECTORS (dropdowns, search inputs, or pickers) for
   choosing the two cities to compare?
3. Are WINNER cards visible (cards calling out which city wins each metric or an
   overall winner)?
4. Is a BAR CHART visible comparing metrics between the two cities?
5. Is a RADAR CHART visible comparing the two cities across multiple axes?
6. Are there any visible issues (overflow, broken layout, missing content,
   empty state where data should be, chart not rendering, etc.)?
7. Does the overall Compare tab look professional and on-theme (data viz)?

Format your reply EXACTLY as JSON:
{
  "q1_content_visible": "YES|NO",
  "q1_note": "...",
  "q2_city_selectors_visible": "YES|NO",
  "q2_note": "...",
  "q3_winner_cards_visible": "YES|NO",
  "q3_note": "...",
  "q4_bar_chart_visible": "YES|NO",
  "q4_note": "...",
  "q5_radar_chart_visible": "YES|NO",
  "q5_note": "...",
  "q6_visible_issues": "YES|NO",
  "q6_note": "...",
  "q7_professional_polished": "YES|NO",
  "q7_note": "...",
  "final_verdict": "PASS|ISSUES",
  "issues": ["...", "..."]
}
"""


def run_vlm(image_path: str, prompt: str) -> dict:
    """Invoke the z-ai vision CLI on the given image and return parsed JSON."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".json", delete=False
    ) as tmp:
        out_path = tmp.name

    try:
        cmd = [
            "z-ai", "vision",
            "--prompt", prompt,
            "--image", image_path,
            "--output", out_path,
        ]
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=240,
        )
        if proc.returncode != 0:
            raise RuntimeError(
                f"z-ai vision failed (exit {proc.returncode}):\n"
                f"stdout: {proc.stdout}\nstderr: {proc.stderr}"
            )

        with open(out_path, "r", encoding="utf-8") as f:
            raw = json.load(f)
        return raw
    finally:
        try:
            os.unlink(out_path)
        except OSError:
            pass


def extract_content(raw: dict) -> str:
    """Pull the assistant message content out of the CLI JSON response."""
    try:
        choices = raw.get("choices") or raw.get("data", {}).get("choices")
        if choices:
            msg = choices[0].get("message", {})
            content = msg.get("content")
            if content:
                return content
    except Exception:
        pass
    for key in ("content", "text", "result"):
        if isinstance(raw, dict) and raw.get(key):
            return str(raw[key])
    return json.dumps(raw, ensure_ascii=False)


def parse_json_block(text: str) -> dict:
    """Best-effort extraction of a JSON object from a model response."""
    if not text:
        return {}
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```", 2)
        if len(cleaned) >= 2:
            inner = cleaned[1]
            if inner.startswith("json"):
                inner = inner[4:]
            cleaned = inner.strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        cleaned = cleaned[start : end + 1]
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"_raw": text}


def check_tab(name: str, image_path: str, prompt: str) -> dict:
    """Run the VLM check for a single tab screenshot and return parsed result."""
    print(f"\n========== [{name}] Analyzing: {image_path} ==========")
    raw = run_vlm(image_path, prompt)
    content = extract_content(raw)
    parsed = parse_json_block(content)

    print(f"\n--- [{name}] VLM STRUCTURED RESPONSE ---")
    print(json.dumps(parsed, ensure_ascii=False, indent=2))

    print(f"\n--- [{name}] RAW MODEL CONTENT ---")
    print(content)

    verdict = parsed.get("final_verdict", "UNKNOWN")
    issues = parsed.get("issues", []) or []
    print(f"\n--- [{name}] SUMMARY ---")
    print(f"Final verdict: {verdict}")
    if issues:
        print("Issues:")
        for i, issue in enumerate(issues, 1):
            print(f"  {i}. {issue}")
    else:
        print("Issues: none reported")

    return {"name": name, "image": image_path, "verdict": verdict,
            "issues": issues, "parsed": parsed}


def main() -> int:
    heritage_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_HERITAGE
    compare_path = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_COMPARE

    results = []
    try:
        results.append(check_tab("HERITAGE", heritage_path, HERITAGE_PROMPT))
    except Exception as e:
        print(f"[HERITAGE] ERROR: {e}")
        results.append({"name": "HERITAGE", "image": heritage_path,
                        "verdict": "ERROR", "issues": [str(e)],
                        "parsed": {}})

    try:
        results.append(check_tab("COMPARE", compare_path, COMPARE_PROMPT))
    except Exception as e:
        print(f"[COMPARE] ERROR: {e}")
        results.append({"name": "COMPARE", "image": compare_path,
                        "verdict": "ERROR", "issues": [str(e)],
                        "parsed": {}})

    print("\n========== FINAL CONSOLIDATED REPORT ==========")
    overall_pass = True
    for r in results:
        v = r["verdict"]
        if v != "PASS":
            overall_pass = False
        print(f"- {r['name']}: {v}  ({r['image']})")
        for i, issue in enumerate(r["issues"], 1):
            print(f"    {i}. {issue}")
    print("\nOverall: " + ("PASS ✅" if overall_pass else "ISSUES ❌"))
    return 0 if overall_pass else 1


if __name__ == "__main__":
    sys.exit(main())
