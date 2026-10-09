#!/usr/bin/env python3
"""
Check Sheher screenshot via the z-ai vision CLI (VLM SDK).

This script invokes the z-ai vision command on a local PNG screenshot and
parses the JSON response, then runs a structured QA pass against the image
to verify that the Sheher home page rendered correctly.

Usage:
    python3 scripts/check_screenshot.py [image_path]
"""

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

DEFAULT_IMAGE = "/home/z/my-project/download/sheher-home.png"

PROMPT = """You are a senior frontend reviewer inspecting a screenshot of the
"Sheher" web application home page. Carefully examine the image and answer
each question below with a strict "YES" or "NO" on the first line, followed by
a short justification (1-2 sentences). Then provide a final overall verdict.

Questions:
1. Is the page rendering correctly (no blank screen, no error boundary, no broken layout)?
2. Is the hero section visible with the Sheher title and city info?
3. Are the quick stats cards visible below the hero?
4. Is the map section visible with a filter sidebar?
5. Are there any visible issues (overflow, broken layout, missing content, etc.)?
6. Does the overall design look professional and polished?

Format your reply EXACTLY as JSON:
{
  "q1_rendering_ok": "YES|NO",
  "q1_note": "...",
  "q2_hero_visible": "YES|NO",
  "q2_note": "...",
  "q3_stats_cards_visible": "YES|NO",
  "q3_note": "...",
  "q4_map_with_filters_visible": "YES|NO",
  "q4_note": "...",
  "q5_visible_issues": "YES|NO",
  "q5_note": "...",
  "q6_professional_polished": "YES|NO",
  "q6_note": "...",
  "final_verdict": "PASS|ISSUES",
  "issues": ["...", "..."]
}
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
            timeout=180,
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
    # The z-ai CLI writes the raw SDK response object to --output.
    try:
        choices = raw.get("choices") or raw.get("data", {}).get("choices")
        if choices:
            msg = choices[0].get("message", {})
            content = msg.get("content")
            if content:
                return content
    except Exception:
        pass
    # Fallback: some CLI versions echo content at top level.
    for key in ("content", "text", "result"):
        if isinstance(raw, dict) and raw.get(key):
            return str(raw[key])
    return json.dumps(raw, ensure_ascii=False)


def parse_json_block(text: str) -> dict:
    """Best-effort extraction of a JSON object from a model response."""
    if not text:
        return {}
    # Strip markdown code fences if present.
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```", 2)
        # remove leading fence line
        if len(cleaned) >= 2:
            inner = cleaned[1]
            if inner.startswith("json"):
                inner = inner[4:]
            cleaned = inner.strip()
    # Find first { and last }
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
    print(f"[check_screenshot] Analyzing: {image_path}")
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

    return 0


if __name__ == "__main__":
    sys.exit(main())
