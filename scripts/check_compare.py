#!/usr/bin/env python3
"""
Check Sheher "Compare" tab screenshot (scrolled-down view) via the z-ai
vision CLI (VLM SDK).

The screenshot at /home/z/my-project/download/sheher-compare-2.png is
expected to show the Compare tab scrolled down, displaying:
  1. Six "winner" cards comparing Mumbai vs Delhi across:
     safety, cleanliness, affordability, AQI, traffic, culture
  2. A radar chart for "Quality of Life"
  3. A bar chart for "Operational Metrics" (traffic %, avg speed, AQI)

This script invokes the z-ai vision command on the local PNG, parses the
JSON response, runs a structured QA pass, and prints a PASS/ISSUES verdict.

Usage:
    python3 scripts/check_compare.py [image_path]
"""

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

DEFAULT_IMAGE = "/home/z/my-project/download/sheher-compare-2.png"

PROMPT = """You are a senior frontend reviewer inspecting a screenshot of the
"Sheher" web application's Compare tab (scrolled-down view). The page is
expected to show a side-by-side comparison of Mumbai vs Delhi.

Carefully examine the image and answer each question below with a strict
"YES" or "NO" on its line, followed by a short justification (1-2 sentences).

Expected elements:
- Six "winner" cards comparing Mumbai vs Delhi across these categories:
    1. Safety
    2. Cleanliness
    3. Affordability
    4. AQI (Air Quality Index)
    5. Traffic
    6. Culture
- A radar chart visualizing "Quality of Life" dimensions.
- A bar chart visualizing "Operational Metrics" with at least these metrics:
    traffic %, average speed, AQI.

Questions:
1. Is the page rendering correctly (no blank screen, no error boundary, no
   broken layout, no console-style error overlay)?
2. Are winner/comparison cards visible comparing Mumbai vs Delhi?
3. Are exactly (or at least) 6 winner cards visible, covering safety,
   cleanliness, affordability, AQI, traffic, and culture?
4. Is a radar chart for "Quality of Life" visible (multi-axis polygon chart)?
5. Is a bar chart for "Operational Metrics" visible (bars for traffic %, avg
   speed, AQI)?
6. Is the layout professional, with consistent spacing, readable typography,
   aligned cards, and clearly labeled axes/legends?
7. Are there any visible issues (overflow, broken layout, missing content,
   cut-off charts, overlap, placeholder text, etc.)?

Format your reply EXACTLY as JSON (no extra text outside the JSON):
{
  "q1_rendering_ok": "YES|NO",
  "q1_note": "...",
  "q2_winner_cards_visible": "YES|NO",
  "q2_note": "...",
  "q3_six_categories_covered": "YES|NO",
  "q3_note": "...",
  "q4_radar_quality_of_life": "YES|NO",
  "q4_note": "...",
  "q5_bar_operational_metrics": "YES|NO",
  "q5_note": "...",
  "q6_professional_layout": "YES|NO",
  "q6_note": "...",
  "q7_visible_issues": "YES|NO",
  "q7_note": "...",
  "final_verdict": "PASS|ISSUES",
  "issues": ["...", "..."]
}

Set final_verdict to "PASS" only if ALL of q1..q6 are YES and q7 is NO
(i.e., no visible issues). Otherwise set final_verdict to "ISSUES" and list
every concrete problem in the "issues" array.
"""


def run_vlm(image_path: str) -> dict:
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
            "--prompt", PROMPT,
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
        parts = cleaned.split("```", 2)
        if len(parts) >= 2:
            inner = parts[1]
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


def main() -> int:
    image_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_IMAGE
    print(f"[check_compare] Analyzing: {image_path}")
    raw = run_vlm(image_path)
    content = extract_content(raw)
    parsed = parse_json_block(content)

    print("\n========== VLM STRUCTURED RESPONSE ==========")
    print(json.dumps(parsed, ensure_ascii=False, indent=2))

    print("\n========== RAW MODEL CONTENT ==========")
    print(content)

    verdict = parsed.get("final_verdict", "UNKNOWN")
    issues = parsed.get("issues", []) or []
    print("\n========== SUMMARY ==========")
    print(f"Final verdict: {verdict}")
    if issues:
        print("Issues:")
        for i, issue in enumerate(issues, 1):
            print(f"  {i}. {issue}")
    else:
        print("Issues: none reported")

    # Exit code: 0 = PASS, 1 = ISSUES, 2 = unknown/parse failure
    if verdict == "PASS":
        return 0
    elif verdict == "ISSUES":
        return 1
    else:
        return 2


if __name__ == "__main__":
    sys.exit(main())
