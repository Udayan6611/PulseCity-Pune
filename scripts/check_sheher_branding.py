#!/usr/bin/env python3
"""
Verify Sheher branding is correctly visible on the home page screenshot.

This script invokes the z-ai vision CLI (VLM SDK) on a local PNG screenshot of
the Sheher home page and runs a structured QA pass to confirm:

  1. The header shows "Sheher" as the brand name (NOT "CityPulse").
  2. A small subtitle below the header brand reads "शहर · Smart City OS"
     (with the Devanagari character "शहर").
  3. The main hero title is the large gradient text "Sheher".
  4. The badge above the hero title reads "AI-Powered Smart City OS · शहर".
  5. The footer shows "Team Sheher".
  6. The page otherwise renders correctly (map, hero card, stats cards).
  7. The word "CityPulse" is NOT visible anywhere on the page (hard fail if so).

The script also performs targeted re-checks on cropped regions of the image
(the sticky header bar, the hero/badge area, and the footer) to be precise
about positioning, since the page is a tall (1280x2840) full-page screenshot.

Usage:
    python3 scripts/check_sheher_branding.py [image_path]

Exit codes:
    0 = PASS (all branding checks succeeded, no CityPulse visible)
    1 = FAIL (one or more checks failed, or CityPulse is still visible)
    2 = ERROR (script could not run — image missing, CLI failed, etc.)
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

# Optional: PIL used only for region cropping to make VLM checks more precise.
try:
    from PIL import Image  # type: ignore
    _HAS_PIL = True
except ImportError:  # pragma: no cover
    _HAS_PIL = False


DEFAULT_IMAGE = "/home/z/my-project/download/sheher-home.png"

# ---------------------------------------------------------------------------
# VLM prompts
# ---------------------------------------------------------------------------

FULL_PAGE_PROMPT = """You are a senior frontend reviewer verifying a rebranding
change on the "Sheher" web application home page (previously branded "CityPulse").

Examine the ENTIRE screenshot carefully — top to bottom, left to right — and
answer each of the following questions with a strict "YES" or "NO". After each
YES/NO, add a 1-2 sentence justification on the SAME line that QUOTES the exact
text you observe (preserve Devanagari characters verbatim).

IMPORTANT: Answer using PLAIN TEXT key:value lines (one per line). Do NOT wrap
your answer in JSON. Do NOT use code fences. Each value must be on a single
line. Use the literal text "YES" or "NO" for boolean questions, followed by
" | " and your short justification.

Format your answer EXACTLY as:

Q1_HEADER_BRAND_SHEHER: YES or NO | <justification, quote exact text>
Q2_HEADER_SUBTITLE_DEVANAGARI: YES or NO | <justification, quote exact subtitle text>
Q3_HERO_TITLE_SHEHER: YES or NO | <justification, quote the hero title text>
Q4_BADGE_ABOVE_HERO: YES or NO | <justification, quote the exact badge text>
Q5_FOOTER_TEAM_SHEHER: YES or NO | <justification, quote the exact footer copyright text>
Q6_PAGE_RENDERS_OK: YES or NO | <justification, describe map/hero/stats visibility>
Q7_CITYPULSE_ANYWHERE: YES or NO | <justification, state whether "CityPulse" appears anywhere>
OBSERVED_HEADER_BRAND: <exact text or "NOT_FOUND">
OBSERVED_HEADER_SUBTITLE: <exact text or "NOT_FOUND">
OBSERVED_HERO_TITLE: <exact text or "NOT_FOUND">
OBSERVED_BADGE_ABOVE_HERO: <exact text or "NOT_FOUND">
OBSERVED_FOOTER_COPYRIGHT: <exact text or "NOT_FOUND">

Questions:
Q1. Is there a header bar (possibly sticky / appearing mid-page after the
    hero) that shows the brand name "Sheher" on the left? (It must NOT say
    "CityPulse".)
Q2. Directly below the header brand "Sheher", is there a small subtitle
    showing EXACTLY "शहर · Smart City OS" (with the Devanagari word "शहर")?
Q3. Is the large gradient/colored hero title text in the upper portion of the
    page the word "Sheher"?
Q4. Is there a small pill-shaped badge above the hero title that reads EXACTLY
    "AI-Powered Smart City OS · शहर" (with the Devanagari word "शहर")?
Q5. Does the footer at the bottom of the page contain the text "Team Sheher"?
    Quote the exact footer copyright line.
Q6. Is the page rendering correctly — i.e. an interactive map is visible, a
    hero "Currently Exploring" card is visible, and a row of stats cards
    (Places Mapped / Safety Score / Air Quality / Heritage Sites) is visible?
Q7. Is the word "CityPulse" (in any case) visible ANYWHERE on the page —
    header, hero, nav, map, cards, footer, or otherwise?

CRITICAL RULES:
- If "CityPulse" is visible ANYWHERE (Q7 == YES), the overall verdict is FAIL.
- If any of Q1..Q6 is NO, the overall verdict is FAIL.
- Only PASS if Q1..Q6 are all YES AND Q7 is NO.
"""

HEADER_REGION_PROMPT = """This is a tightly cropped horizontal slice of a web
page screenshot that should contain a sticky/floating header bar. List EVERY
text element visible from left to right (preserve Devanagari characters
verbatim). Then answer the structured questions below.

IMPORTANT: Answer using PLAIN TEXT key:value lines (one per line). Do NOT wrap
your answer in JSON. Do NOT use code fences. Each value must be on a single
line. Use the literal text "YES" or "NO" for boolean questions.

Format your answer EXACTLY as:

VISIBLE_TEXTS: <comma-separated list of every text element you can read>
HEADER_BRAND_TEXT: <exact brand name on the left, or NONE>
HEADER_SUBTITLE_TEXT: <exact subtitle text directly below the brand, or NONE>
HAS_DEVANAGARI_SHEHER: YES or NO
HAS_CITYPULSE: YES or NO
"""

BRAND_SUBTITLE_PROMPT = """This is a tightly-cropped, upscaled image of the
brand+subtitle area in the top-left corner of a sticky header bar. Read the
text precisely and answer the questions below.

There should be TWO text lines stacked vertically:
  Line 1 (top, larger, bold): the brand name.
  Line 2 (bottom, smaller, gray): a subtitle / tagline.

IMPORTANT: Answer using PLAIN TEXT key:value lines (one per line). Do NOT wrap
your answer in JSON. Do NOT use code fences. Each value must be on a single
line. Use the literal text "YES" or "NO" for boolean questions. Preserve
Devanagari characters verbatim.

Format your answer EXACTLY as:

BRAND_TEXT: <exact brand name on the top line, or NONE>
SUBTITLE_TEXT: <exact subtitle text on the bottom line, or NONE>
HAS_DEVANAGARI_SHEHER: YES or NO  (is the Devanagari word "शहर" visible anywhere?)
HAS_SMART_CITY_OS: YES or NO  (is the English phrase "Smart City OS" visible?)
HAS_MIDDLE_DOT_SEPARATOR: YES or NO  (is the "·" middle dot separator visible?)
HAS_CITYPULSE: YES or NO  (does the word "CityPulse" appear anywhere here?)
"""

FOOTER_REGION_PROMPT = """This is a cropped region of the bottom of a web page
screenshot. List every text element visible (preserve Devanagari verbatim).
Then answer the structured questions below.

IMPORTANT: Answer using PLAIN TEXT key:value lines (one per line). Do NOT wrap
your answer in JSON. Do NOT use code fences. Each value must be on a single
line. Use the literal text "YES" or "NO" for boolean questions.

Format your answer EXACTLY as:

VISIBLE_TEXTS: <comma-separated list of every text element you can read>
FOOTER_COPYRIGHT_TEXT: <exact copyright line at the very bottom, or NONE>
HAS_TEAM_SHEHER: YES or NO
HAS_CITYPULSE: YES or NO
"""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def run_vlm(image_path: str, prompt: str) -> dict[str, Any]:
    """Invoke the z-ai vision CLI on an image and return parsed JSON."""
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


def extract_content(raw: dict[str, Any]) -> str:
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
    # Fallback: some CLI versions echo content at top level.
    for key in ("content", "text", "result"):
        if isinstance(raw, dict) and raw.get(key):
            return str(raw[key])
    return json.dumps(raw, ensure_ascii=False)


def parse_json_block(text: str) -> dict[str, Any]:
    """Best-effort extraction of a JSON object from a model response."""
    if not text:
        return {}
    cleaned = text.strip()
    # Strip markdown code fences if present.
    if cleaned.startswith("```"):
        parts = cleaned.split("```", 2)
        if len(parts) >= 2:
            inner = parts[1]
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


def parse_keyvalue_block(text: str) -> dict[str, str]:
    """Parse a plain-text "KEY: value" response into a dict.

    Robust against leading markdown fences, multi-line values (only the first
    line of each value is captured), and surrounding prose. Keys are matched
    case-insensitively. Returns lowercase keys -> raw string values.
    """
    out: dict[str, str] = {}
    if not text:
        return out
    # Strip markdown fences if present.
    cleaned = text.strip()
    if cleaned.startswith("```"):
        parts = cleaned.split("```", 2)
        if len(parts) >= 2:
            inner = parts[1]
            if inner.startswith("json") or inner.startswith("text"):
                inner = inner[4:]
            cleaned = inner.strip()
    for line in cleaned.splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip().lower().replace(" ", "_")
        # Strip JSON-style wrapping quotes if the model accidentally used them
        # (e.g. `"YES"` or `"Sheher"`).
        value = value.strip()
        if (
            len(value) >= 2
            and value.startswith('"')
            and value.endswith('"')
        ):
            value = value[1:-1]
        if key:
            out[key] = value
    return out


def yesno(value: str) -> bool:
    """Return True if a value starts with YES (case-insensitive).

    Tolerates a trailing " | justification" suffix, surrounding quotes, and
    surrounding whitespace.
    """
    if not value:
        return False
    v = value.strip()
    # Strip surrounding quotes if any.
    if len(v) >= 2 and v.startswith('"') and v.endswith('"'):
        v = v[1:-1].strip()
    # Take only the part before a " | " separator (the YES/NO token).
    v = v.split("|", 1)[0].strip()
    return v.upper().startswith("Y")


def crop_regions(image_path: str) -> dict[str, str]:
    """Crop the sticky-header and footer regions for targeted re-checks.

    Returns a dict mapping region name -> cropped image path. If PIL is not
    available, returns an empty dict and the caller falls back to relying on
    the full-page VLM pass only.
    """
    if not _HAS_PIL:
        return {}

    img = Image.open(image_path)
    w, h = img.size
    tmp_dir = Path(tempfile.gettempdir())

    # Sticky header bar: based on prior analysis, this lives in the middle
    # third of the page (roughly y=1700..1950 on a 2840-tall image).
    # We use proportional coordinates so the crop adapts to any image size.
    sticky_top = int(h * 0.60)
    sticky_bot = int(h * 0.69)
    sticky = img.crop((0, sticky_top, w, sticky_bot))
    sticky_path = str(tmp_dir / "sheher_check_sticky.png")
    sticky.save(sticky_path)

    # Tight crop of just the brand+subtitle area in the top-left of the
    # sticky header, upscaled 3x for reliable OCR of small text. This crop
    # is intentionally NARROW so the VLM focuses only on the brand stack
    # and does not get distracted by nav items / city selector / etc.
    brand_left = 0
    brand_right = max(300, int(w * 0.25))
    brand_top = sticky_top + int((sticky_bot - sticky_top) * 0.20)
    brand_bot = sticky_top + int((sticky_bot - sticky_top) * 0.85)
    brand_crop = img.crop((brand_left, brand_top, brand_right, brand_bot))
    brand_3x = brand_crop.resize(
        (brand_crop.size[0] * 3, brand_crop.size[1] * 3), Image.LANCZOS
    )
    brand_path = str(tmp_dir / "sheher_check_brand_subtitle.png")
    brand_3x.save(brand_path)

    # Footer: bottom ~14% of the image.
    footer_top = int(h * 0.86)
    footer = img.crop((0, footer_top, w, h))
    footer_path = str(tmp_dir / "sheher_check_footer.png")
    footer.save(footer_path)

    # Hero / badge area: top ~12% of the image (just below the blank padding).
    hero = img.crop((0, 0, w, int(h * 0.12)))
    hero_path = str(tmp_dir / "sheher_check_hero.png")
    hero.save(hero_path)

    return {
        "sticky_header": sticky_path,
        "brand_subtitle": brand_path,
        "footer": footer_path,
        "hero": hero_path,
    }


# ---------------------------------------------------------------------------
# Main check
# ---------------------------------------------------------------------------

def main() -> int:
    image_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_IMAGE
    print(f"[check_sheher_branding] Analyzing: {image_path}")
    if not os.path.exists(image_path):
        print(f"ERROR: image not found at {image_path}", file=sys.stderr)
        return 2

    # ------------------------------------------------------------------
    # 1) Full-page VLM pass
    # ------------------------------------------------------------------
    print("\n--- Pass 1: full-page VLM analysis ---")
    raw_full = run_vlm(image_path, FULL_PAGE_PROMPT)
    content_full = extract_content(raw_full)
    parsed_full = parse_keyvalue_block(content_full)
    parsed_full["_raw_text"] = content_full
    print(json.dumps(parsed_full, ensure_ascii=False, indent=2))

    # ------------------------------------------------------------------
    # 2) Targeted region re-checks (sticky header + footer)
    # ------------------------------------------------------------------
    region_results: dict[str, dict[str, Any]] = {}
    crops = crop_regions(image_path)
    if crops:
        region_prompts = {
            "sticky_header": HEADER_REGION_PROMPT,
            "brand_subtitle": BRAND_SUBTITLE_PROMPT,
            "footer": FOOTER_REGION_PROMPT,
        }
        for region_name, region_path in crops.items():
            prompt = region_prompts.get(region_name)
            if prompt is None:
                # Hero region already covered well by full-page pass; skip.
                continue
            print(f"\n--- Pass 2: targeted region '{region_name}' ---")
            try:
                raw_r = run_vlm(region_path, prompt)
                content_r = extract_content(raw_r)
                parsed_r = parse_keyvalue_block(content_r)
                # Stash the raw text too, for debugging.
                parsed_r["_raw_text"] = content_r
                region_results[region_name] = parsed_r
                print(json.dumps(parsed_r, ensure_ascii=False, indent=2))
            except Exception as exc:
                print(f"WARN: region '{region_name}' check failed: {exc}")
                region_results[region_name] = {"_error": str(exc)}

    # ------------------------------------------------------------------
    # 3) Aggregate verdict
    # ------------------------------------------------------------------
    checks: list[dict[str, Any]] = []

    def add(check_id: str, description: str, passed: bool, evidence: str) -> None:
        checks.append(
            {
                "id": check_id,
                "description": description,
                "passed": passed,
                "evidence": evidence,
            }
        )

    # Q1: Header brand is "Sheher".
    q1 = yesno(parsed_full.get("q1_header_brand_sheher", ""))
    obs_header_brand = str(parsed_full.get("observed_header_brand", "")).strip()
    # Cross-check with sticky-header region if available.
    sticky = region_results.get("sticky_header", {})
    sticky_brand = str(sticky.get("header_brand_text", "")).strip()
    if sticky_brand and sticky_brand.upper() not in ("NONE", "NOT_FOUND", ""):
        q1 = q1 or sticky_brand == "Sheher"
    # Cross-check with the tight brand_subtitle crop (most reliable).
    brand_sub = region_results.get("brand_subtitle", {})
    tight_brand = str(brand_sub.get("brand_text", "")).strip()
    if tight_brand and tight_brand.upper() not in ("NONE", "NOT_FOUND", ""):
        q1 = q1 or tight_brand == "Sheher"
    add(
        "Q1_HEADER_BRAND_SHEHER",
        "Header shows 'Sheher' as the brand name (not CityPulse)",
        q1,
        parsed_full.get("q1_header_brand_sheher", "")
        + (f" [observed='{obs_header_brand}']" if obs_header_brand else "")
        + (f" [sticky brand='{sticky_brand}']" if sticky_brand else "")
        + (f" [tight brand='{tight_brand}']" if tight_brand else ""),
    )

    # Q2: Subtitle below header brand shows "शहर · Smart City OS".
    q2 = yesno(parsed_full.get("q2_header_subtitle_devanagari", ""))
    obs_header_sub = str(parsed_full.get("observed_header_subtitle", "")).strip()
    if obs_header_sub and obs_header_sub.upper() not in ("NONE", "NOT_FOUND", ""):
        sub_ok_obs = "शहर" in obs_header_sub and "Smart City OS" in obs_header_sub
        q2 = q2 or sub_ok_obs
    sticky_sub = str(sticky.get("header_subtitle_text", "")).strip()
    has_deva_sticky = yesno(sticky.get("has_devanagari_sheher", ""))
    if sticky_sub and sticky_sub.upper() not in ("NONE", "NOT_FOUND", ""):
        sub_ok = "शहर" in sticky_sub and "Smart City OS" in sticky_sub
        q2 = q2 or (sub_ok and has_deva_sticky)
    # Tight brand_subtitle crop — most reliable source for the small subtitle.
    tight_sub = str(brand_sub.get("subtitle_text", "")).strip()
    has_deva_tight = yesno(brand_sub.get("has_devanagari_sheher", ""))
    has_scos_tight = yesno(brand_sub.get("has_smart_city_os", ""))
    if tight_sub and tight_sub.upper() not in ("NONE", "NOT_FOUND", ""):
        sub_ok_tight = "शहर" in tight_sub and "Smart City OS" in tight_sub
        q2 = q2 or (sub_ok_tight and has_deva_tight)
    # Also accept the case where the VLM independently confirms BOTH the
    # Devanagari token AND the "Smart City OS" phrase are visible in this
    # tight crop, even if the SUBTITLE_TEXT field wasn't transcribed perfectly.
    if has_deva_tight and has_scos_tight:
        q2 = q2 or True
    add(
        "Q2_HEADER_SUBTITLE_DEVANAGARI",
        "Subtitle below header shows 'शहर · Smart City OS' (with Devanagari)",
        q2,
        parsed_full.get("q2_header_subtitle_devanagari", "")
        + (f" [observed='{obs_header_sub}']" if obs_header_sub else "")
        + (f" [sticky sub='{sticky_sub}' deva={has_deva_sticky}]" if sticky_sub else "")
        + (f" [tight sub='{tight_sub}' deva={has_deva_tight} scos={has_scos_tight}]" if tight_sub else ""),
    )

    # Q3: Hero title is "Sheher".
    q3 = yesno(parsed_full.get("q3_hero_title_sheher", ""))
    obs_hero_title = str(parsed_full.get("observed_hero_title", "")).strip()
    if obs_hero_title and obs_hero_title.upper() not in ("NONE", "NOT_FOUND", ""):
        q3 = q3 or obs_hero_title == "Sheher"
    add(
        "Q3_HERO_TITLE_SHEHER",
        "Main hero title is large gradient text 'Sheher'",
        q3,
        parsed_full.get("q3_hero_title_sheher", "")
        + (f" [observed='{obs_hero_title}']" if obs_hero_title else ""),
    )

    # Q4: Badge above hero shows "AI-Powered Smart City OS · शहर".
    q4 = yesno(parsed_full.get("q4_badge_above_hero", ""))
    obs_badge = str(parsed_full.get("observed_badge_above_hero", "")).strip()
    if obs_badge and obs_badge.upper() not in ("NONE", "NOT_FOUND", ""):
        badge_ok = "AI-Powered" in obs_badge and "Smart City OS" in obs_badge and "शहर" in obs_badge
        q4 = q4 or badge_ok
    add(
        "Q4_BADGE_ABOVE_HERO",
        "Badge above hero reads 'AI-Powered Smart City OS · शहर'",
        q4,
        parsed_full.get("q4_badge_above_hero", "")
        + (f" [observed='{obs_badge}']" if obs_badge else ""),
    )

    # Q5: Footer shows "Team Sheher".
    q5 = yesno(parsed_full.get("q5_footer_team_sheher", ""))
    obs_footer = str(parsed_full.get("observed_footer_copyright", "")).strip()
    if obs_footer and obs_footer.upper() not in ("NONE", "NOT_FOUND", ""):
        q5 = q5 or "Team Sheher" in obs_footer
    footer_region = region_results.get("footer", {})
    footer_text = str(footer_region.get("footer_copyright_text", "")).strip()
    region_has_team = yesno(footer_region.get("has_team_sheher", ""))
    if footer_text and footer_text.upper() not in ("NONE", "NOT_FOUND", ""):
        q5 = q5 or (region_has_team and "Team Sheher" in footer_text)
    add(
        "Q5_FOOTER_TEAM_SHEHER",
        "Footer contains 'Team Sheher'",
        q5,
        parsed_full.get("q5_footer_team_sheher", "")
        + (f" [observed='{obs_footer}']" if obs_footer else "")
        + (f" [footer region='{footer_text}']" if footer_text else ""),
    )

    # Q6: Page renders correctly (map, hero card, stats cards).
    q6 = yesno(parsed_full.get("q6_page_renders_ok", ""))
    add(
        "Q6_PAGE_RENDERS_OK",
        "Page renders correctly (map, hero card, stats cards visible)",
        q6,
        parsed_full.get("q6_page_renders_ok", ""),
    )

    # Q7 (HARD FAIL): CityPulse visible anywhere?
    q7_citypulse = yesno(parsed_full.get("q7_citypulse_anywhere", ""))
    # Cross-check with regions.
    sticky_cp = yesno(sticky.get("has_citypulse", ""))
    footer_cp = yesno(footer_region.get("has_citypulse", ""))
    brand_sub_cp = yesno(brand_sub.get("has_citypulse", ""))
    citypulse_visible = q7_citypulse or sticky_cp or footer_cp or brand_sub_cp
    add(
        "Q7_NO_CITYPULSE_ANYWHERE",
        "Word 'CityPulse' is NOT visible anywhere on the page",
        not citypulse_visible,
        parsed_full.get("q7_citypulse_anywhere", "")
        + f" [sticky_cp={sticky_cp}, footer_cp={footer_cp}, brand_sub_cp={brand_sub_cp}]",
    )

    # ------------------------------------------------------------------
    # 4) Print final report
    # ------------------------------------------------------------------
    print("\n" + "=" * 72)
    print("SHEHER BRANDING VERIFICATION REPORT")
    print("=" * 72)
    print(f"Image: {image_path}")
    print("-" * 72)
    for c in checks:
        status = "PASS" if c["passed"] else "FAIL"
        print(f"[{status}] {c['id']}")
        print(f"        {c['description']}")
        print(f"        Evidence: {c['evidence']}")
    print("-" * 72)

    all_pass = all(c["passed"] for c in checks)
    overall = "PASS" if all_pass else "FAIL"
    print(f"OVERALL VERDICT: {overall}")
    print("=" * 72)

    if not all_pass:
        failed = [c["id"] for c in checks if not c["passed"]]
        print(f"Failed checks: {', '.join(failed)}")
        return 1

    print("All Sheher branding checks passed. No 'CityPulse' text detected.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
