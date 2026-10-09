#!/usr/bin/env python3
"""Search images for all Sheher places — sequential to avoid rate limits."""
import json
import subprocess
import re
import time

PLACES = [
    ("mum-gateway", "Gateway of India Mumbai monument"),
    ("mum-elephanta", "Elephanta Caves Mumbai ancient sculpture"),
    ("mum-cst", "Chhatrapati Shivaji Terminus Mumbai railway station"),
    ("mum-marine", "Marine Drive Mumbai sunset promenade"),
    ("mum-mohammedali", "Mumbai street food kebabs night market"),
    ("mum-leopold", "Leopold Cafe Mumbai historic restaurant"),
    ("mum-taj", "Taj Mahal Palace Hotel Mumbai luxury"),
    ("mum-bandra", "Bandra Mumbai street art promenade"),
    ("mum-unsafe-kamathipura", "dark narrow Mumbai street night"),
    ("mum-accident-jvlr", "Mumbai traffic jam highway aerial"),
    ("del-redfort", "Red Fort Delhi Mughal monument"),
    ("del-qutub", "Qutub Minar Delhi ancient tower"),
    ("del-indiagate", "India Gate Delhi war memorial"),
    ("del-lodhi", "Lodhi Gardens Delhi ancient tomb park"),
    ("del-chandni", "Chandni Chowk Delhi market street food"),
    ("del-hauz", "Hauz Khas Delhi cafe ruins lake"),
    ("del-taj", "Imperial Hotel Delhi colonial luxury"),
    ("del-accident-anand", "Delhi traffic jam trucks highway"),
    ("del-unsafe-late", "empty Delhi street midnight dark"),
    ("blr-palace", "Bangalore Palace stone building"),
    ("blr-lalbagh", "Lalbagh Botanical Garden Bangalore trees"),
    ("blr-vidhana", "Vidhana Soudha Bangalore government building"),
    ("blr-indiranagar", "Bangalore brewery craft beer night"),
    ("blr-vv", "VV Puram Bangalore street food dosa"),
    ("blr-oberoi", "Oberoi Hotel Bangalore luxury lobby"),
    ("blr-accident-silkboard", "Silk Board Bangalore traffic jam aerial"),
    ("blr-unsafe-ejipura", "dark narrow Bangalore lane night"),
    ("jai-hawa", "Hawa Mahal Jaipur pink sandstone"),
    ("jai-amber", "Amber Fort Jaipur hilltop palace"),
    ("jai-city", "City Palace Jaipur royal architecture"),
    ("jai-chowki", "Chokhi Dhani Rajasthani village thali"),
    ("jai-rawat", "Rawat Jaipur kachori snack food"),
    ("jai-rambagh", "Rambagh Palace Jaipur luxury hotel"),
    ("jai-unsafe-bani", "quiet Jaipur residential street night"),
    ("kol-victoria", "Victoria Memorial Kolkata white marble"),
    ("kol-howrah", "Howrah Bridge Kolkata river Hooghly"),
    ("kol-dakshineswar", "Dakshineswar Kali Temple Kolkata river"),
    ("kol-newmarket", "New Market Kolkata colonial shopping"),
    ("kol-parkst", "Park Street Kolkata restaurant nightlife"),
    ("kol-oberoi", "Oberoi Grand Kolkata colonial hotel"),
    ("kol-accident-gariahat", "Kolkata traffic crossing tram busy"),
]

OUTPUT_FILE = "/home/z/my-project/scripts/image_urls.json"

def search_image(place_id, query):
    """Search for a single image."""
    try:
        result = subprocess.run(
            ["z-ai", "image-search", "-q", query, "--count", "1", "--no-rank"],
            capture_output=True, text=True, timeout=120
        )
        out = result.stdout
        # Extract JSON block (find first { and last })
        start = out.find('{')
        end = out.rfind('}')
        if start == -1 or end == -1:
            return place_id, None, "No JSON found"
        json_str = out[start:end+1]
        data = json.loads(json_str)
        if data.get("success") and data.get("results"):
            url = data["results"][0]["original_url"]
            return place_id, url, None
        return place_id, None, f"No results: {data.get('error', 'unknown')}"
    except subprocess.TimeoutExpired:
        return place_id, None, "Timeout"
    except Exception as e:
        return place_id, None, str(e)[:100]

def main():
    results = {}
    errors = {}
    
    print(f"Searching images for {len(PLACES)} places (sequential)...")
    
    for i, (place_id, query) in enumerate(PLACES, 1):
        place_id, url, error = search_image(place_id, query)
        if url:
            results[place_id] = url
            print(f"[{i}/{len(PLACES)}] ✓ {place_id}")
        else:
            errors[place_id] = error
            print(f"[{i}/{len(PLACES)}] ✗ {place_id}: {error}")
        time.sleep(0.5)  # small delay to avoid rate limits
    
    with open(OUTPUT_FILE, "w") as f:
        json.dump({"results": results, "errors": errors}, f, indent=2)
    
    print(f"\n✅ Success: {len(results)}/{len(PLACES)}")
    print(f"❌ Failed: {len(errors)}")
    print(f"📁 Saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
