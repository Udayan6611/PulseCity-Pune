#!/usr/bin/env python3
"""
Check Sheher AI chat screenshot via the z-ai vision CLI (VLM SDK).

This script invokes the z-ai vision command on a local PNG screenshot of the
Sheher AI chat widget and runs a structured QA pass to verify that an AI
response to the user's Mumbai question rendered correctly.

Usage:
    python3 scripts/check_chat.py [image_path]
"""

import json
import os
import subprocess
import sys
import tempfile

DEFAULT_IMAGE = "/home/z/my-project/download/sheher-ai-response.png"

PROMPT = """You are a senior frontend reviewer inspecting a screenshot of the
"Sheher" web application. The screenshot should show an open AI chat widget
where the user asked:

  "What are 3 must-visit places in Mumbai for first-timers? Also any safety tips?"

Carefully examine the image and answer each question below with a strict "YES"
or "NO" on the first line, followed by a short justification (1-2 sentences).
Then provide a final overall verdict.

Questions:
1. Is the AI chat widget visible and open (chat panel/dialog rendered on screen)?
2. Is there a visible AI response (assistant message bubble/content), not just the
   user's question?
3. Does the AI response appear relevant to Mumbai (mentions Mumbai places/landmarks
   and/or safety tips)?
4. Are there any visible errors, broken layouts, or stuck loading/spinner states
   in the chat area?
5. Does the chat UI look professional and polished (no overlapping elements,
   readable text, sensible spacing)?
6. Overall, did the AI successfully answer the user's Mumbai question?

Format your reply EXACTLY as JSON (no markdown fences, no extra prose):
{
  "q1_widget_open": "YES|NO",
  "q1_note": "...",
  "q2_ai_response_visible": "YES|NO",
  "q2_note": "...",
  "q3_response_relevant_mumbai": "YES|NO",
  "q3_note": "...",
  "q4_errors_or_stuck_loading": "YES|NO",
  "q4_note": "...",
  "q5_ui_polished": "YES|NO",
  "q5_note": "...",
  "q6_overall_answered": "YES|NO",
  "q6_note": "...",
  "final_verdict": "PASS|ISSUES",
  "issues": ["...", "..."]
}

If everything is fine, set "final_verdict" to "PASS" and leave "issues" as an
empty array. Otherwise set "final_verdict" to "ISSUES" and list each problem.
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
    print(f"[check_chat] Analyzing: {image_path}")
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

    return 0 if verdict == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
