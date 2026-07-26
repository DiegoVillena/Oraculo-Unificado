import requests
import time

HEADERS = {"User-Agent": "OraculoUnificado/1.0 (educational tarot project)"}

def search_commons(search_term, limit=5):
    api_url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "list": "search",
        "srsearch": search_term,
        "srnamespace": 6,  # File namespace
        "srlimit": limit,
        "format": "json",
    }
    try:
        r = requests.get(api_url, params=params, headers=HEADERS, timeout=30)
        r.raise_for_status()
        data = r.json()
        results = data.get("query", {}).get("search", [])
        return [r["title"] for r in results]
    except Exception as e:
        print(f"  Search error: {e}")
        return []

# Search for RWS Tarot Cups files
searches = [
    "RWS Tarot Cups",
    "RWS Tarot Pentacles",
    "RWS Tarot Swords",
    "RWS Tarot Wands",
]

for s in searches:
    print(f"\n=== Search: {s} ===")
    results = search_commons(s, 20)
    for r in results:
        print(f"  {r}")
    time.sleep(2)
