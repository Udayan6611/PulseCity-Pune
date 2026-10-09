#!/usr/bin/env python3
"""Update city-data.ts image: 'xxx' → image: 'url' for each place."""
import json
import re

IMAGE_URLS_FILE = "/home/z/my-project/scripts/image_urls.json"
DATA_FILE = "/home/z/my-project/src/lib/city-data.ts"

with open(IMAGE_URLS_FILE) as f:
    urls = json.load(f)["results"]

# Add fallbacks for missing places
fallbacks = {
    "del-unsafe-late": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8eb55d9c67e7.jpg",
    "jai-chowki": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/deaf6875f9f6.jpeg",
}
urls.update(fallbacks)

with open(DATA_FILE) as f:
    lines = f.readlines()

# Track which place we're in
current_place_id = None
updated = 0

for i, line in enumerate(lines):
    # Detect place id
    m = re.search(r"id:\s*'([^']+)'", line)
    if m and not line.strip().startswith('//'):
        current_place_id = m.group(1)
    
    # Replace image: 'xxx' line
    if current_place_id and current_place_id in urls:
        if re.match(r"\s*image:\s*'[^']+'", line):
            new_url = urls[current_place_id]
            lines[i] = re.sub(r"image:\s*'[^']+'", f"image: '{new_url}'", line)
            updated += 1
            print(f"  ✓ {current_place_id}")
            current_place_id = None  # avoid double-replace

with open(DATA_FILE, 'w') as f:
    f.writelines(lines)

print(f"\n✅ Updated {updated} image URLs in {DATA_FILE}")
