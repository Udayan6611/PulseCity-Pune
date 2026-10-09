#!/usr/bin/env python3
"""Retry with 15s delays between calls to fully avoid 429."""
import json
import subprocess
import time

OUTPUT_FILE = "/home/z/my-project/scripts/image_urls.json"

with open(OUTPUT_FILE) as f:
    data = json.load(f)

results = data["results"]
errors = data["errors"]

QUERIES = {
    "del-unsafe-late": "empty city street midnight dark",
    "blr-palace": "Bangalore Palace stone Tudor building",
    "blr-lalbagh": "Lalbagh Botanical Garden Bangalore green",
    "blr-vidhana": "Vidhana Soudha Bangalore government building",
    "blr-indiranagar": "Bangalore brewery pub craft beer night",
    "blr-vv": "Bangalore street food dosa stall",
    "blr-oberoi": "luxury hotel lobby garden interior",
    "blr-accident-silkboard": "Bangalore traffic jam aerial view",
    "blr-unsafe-ejipura": "dark narrow lane night city",
    "jai-hawa": "Hawa Mahal Jaipur pink facade",
    "jai-amber": "Amber Fort Jaipur hilltop palace",
    "jai-city": "City Palace Jaipur royal architecture",
    "jai-chowki": "Rajasthani thali village cultural food",
    "jai-rawat": "Indian kachori snack food street",
    "jai-rambagh": "luxury palace hotel heritage India",
    "jai-unsafe-bani": "quiet residential street night India",
    "kol-victoria": "Victoria Memorial Kolkata white marble",
    "kol-howrah": "Howrah Bridge Kolkata river",
    "kol-dakshineswar": "Kali Temple Kolkata riverside",
    "kol-newmarket": "New Market Kolkata colonial shopping",
    "kol-parkst": "Park Street Kolkata restaurant",
    "kol-oberoi": "colonial heritage hotel luxury India",
    "kol-accident-gariahat": "Kolkata traffic tram crossing busy",
}

remaining = [k for k in QUERIES if k not in results]
print(f"Retrying {len(remaining)} with 15s delays...")

for i, place_id in enumerate(remaining, 1):
    query = QUERIES[place_id]
    try:
        result = subprocess.run(
            ["z-ai", "image-search", "-q", query, "--count", "1", "--no-rank"],
            capture_output=True, text=True, timeout=120
        )
        out = result.stdout
        start = out.find('{')
        end = out.rfind('}')
        if start != -1 and end != -1:
            json_str = out[start:end+1]
            d = json.loads(json_str)
            if d.get("success") and d.get("results"):
                url = d["results"][0]["original_url"]
                results[place_id] = url
                errors.pop(place_id, None)
                print(f"[{i}/{len(remaining)}] ✓ {place_id}")
            else:
                print(f"[{i}/{len(remaining)}] ✗ {place_id}: no results")
        else:
            err = result.stderr[:80] if result.stderr else "no JSON"
            print(f"[{i}/{len(remaining)}] ✗ {place_id}: {err}")
    except Exception as e:
        print(f"[{i}/{len(remaining)}] ✗ {place_id}: {str(e)[:60]}")
    if i < len(remaining):
        time.sleep(15)

with open(OUTPUT_FILE, "w") as f:
    json.dump({"results": results, "errors": errors}, f, indent=2)

print(f"\n✅ Total: {len(results)}/{len(results)+len(errors)}")
