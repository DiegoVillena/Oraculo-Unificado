import requests
import time
import json

HEADERS = {"User-Agent": "OraculoUnificado/1.0 (educational tarot project; contact@example.com)"}

def search_commons(search_term, limit=20):
    api_url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "list": "search",
        "srsearch": search_term,
        "srnamespace": 6,
        "srlimit": limit,
        "format": "json",
    }
    try:
        r = requests.get(api_url, params=params, headers=HEADERS, timeout=30)
        if r.status_code == 429:
            print(f"  429, waiting 15s...")
            time.sleep(15)
            r = requests.get(api_url, params=params, headers=HEADERS, timeout=30)
        r.raise_for_status()
        data = r.json()
        results = data.get("query", {}).get("search", [])
        return [(r["title"], r.get("snippet", "")) for r in results]
    except Exception as e:
        print(f"  Search error: {e}")
        return []

# Try various search terms
searches = [
    "RWS Tarot Cups",
    "Rider Waite Cups tarot",
    "RWS Tarot Wands",
    "RWS Tarot Swords",
    "RWS Tarot Pentacles",
    "tarot cups rider waite",
    "tarot minor arcana",
    "RWS_Tarot_Cups",
    "RWS_Tarot_Wands",
]

for s in searches:
    print(f"\n=== Search: {s} ===")
    results = search_commons(s, 10)
    if results:
        for title, snippet in results:
            print(f"  {title}")
    else:
        print("  (no results)")
    time.sleep(3)
