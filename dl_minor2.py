import requests, os, time, random
from PIL import Image
from io import BytesIO

OUT_DIR = r"C:\Users\Diego\Desktop\OraculoUnificado\img\tarot"
HEADERS = {
    "User-Agent": "OraculoUnificado/1.0 (educational tarot project; contact@example.com)",
    "Accept": "image/*,*/*;q=0.8",
}

SUIT_WIKI = {"Copas": "Cups", "Oros": "Pentacles", "Espadas": "Swords", "Bastos": "Wands"}
RANK_WIKI = {"As": "01_Ace", "2": "02", "3": "03", "4": "04", "5": "05", "6": "06", "7": "07", "8": "08", "9": "09", "10": "10", "Sota": "11_Page", "Caballero": "12_Knight", "Reina": "13_Queen", "Rey": "14_King"}

suits = ["Copas", "Oros", "Espadas", "Swords"]
# Fix: use proper suit order
suits = ["Copas", "Oros", "Espadas", "Bastos"]
CARDS = []
for suit in suits:
    ranks = [f"As_de_{suit}", f"Rey_de_{suit}", f"Reina_de_{suit}", f"Caballero_de_{suit}", f"Sota_de_{suit}"]
    for i in range(2, 11):
        ranks.append(f"{i}_de_{suit}")
    CARDS.extend(ranks)

WIKI_NAMES = {}
for card in CARDS:
    parts = card.split("_de_")
    rank_en = RANK_WIKI[parts[0]]
    suit_en = SUIT_WIKI[parts[1]]
    WIKI_NAMES[card] = f"RWS_Tarot_{suit_en}_{rank_en}.jpg"

def get_url_from_api(filename, max_retries=8):
    """Use the Commons API with very long delays between retries."""
    api_url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "titles": f"File:{filename}",
        "prop": "imageinfo",
        "iiprop": "url",
        "format": "json",
        "iiurlwidth": "400",
    }
    for attempt in range(max_retries):
        try:
            r = requests.get(api_url, params=params, headers=HEADERS, timeout=30)
            if r.status_code == 429:
                wait = 15 * (attempt + 1) + random.uniform(5, 10)
                print(f"    429 API, wait {wait:.0f}s ({attempt+1}/{max_retries})")
                time.sleep(wait)
                continue
            r.raise_for_status()
            data = r.json()
            pages = data.get("query", {}).get("pages", {})
            for pid, page in pages.items():
                if "imageinfo" in page:
                    return page["imageinfo"][0].get("thumburl") or page["imageinfo"][0].get("url")
            # Check if the file doesn't exist
            for pid, page in pages.items():
                if "missing" in page:
                    print(f"    File does not exist on Commons: {filename}")
                    return None
            return None
        except Exception as e:
            if attempt < max_retries - 1:
                wait = 10 * (attempt + 1)
                print(f"    API err: {e}, retry {wait}s")
                time.sleep(wait)
    return None

def download(url, out_path, max_retries=6):
    for attempt in range(max_retries):
        try:
            r = requests.get(url, headers=HEADERS, timeout=60)
            if r.status_code == 429:
                wait = 15 * (attempt + 1) + random.uniform(3, 7)
                print(f"    429 dl, wait {wait:.0f}s ({attempt+1}/{max_retries})")
                time.sleep(wait)
                continue
            if r.status_code == 403:
                wait = 10 * (attempt + 1)
                print(f"    403, wait {wait}s ({attempt+1}/{max_retries})")
                time.sleep(wait)
                continue
            r.raise_for_status()
            img = Image.open(BytesIO(r.content))
            if img.mode != "RGB":
                img = img.convert("RGB")
            img.save(out_path, "JPEG", quality=90)
            return True
        except Exception as e:
            if attempt < max_retries - 1:
                wait = 8 * (attempt + 1)
                print(f"    dl err: {e}, retry {wait}s")
                time.sleep(wait)
            else:
                print(f"    dl failed: {e}")
    return False

def make_svg(card_name, path):
    label = card_name.replace("_", " ")
    lines = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="350" viewBox="0 0 200 350">',
        '<rect width="200" height="350" fill="#1a1a2e" stroke="#c9a227" stroke-width="3" rx="12"/>',
        '<rect x="10" y="10" width="180" height="330" fill="none" stroke="#c9a227" stroke-width="1" rx="8" opacity="0.4"/>',
        f'<text x="100" y="170" font-family="serif" font-size="16" fill="#c9a227" text-anchor="middle" font-weight="bold">{label}</text>',
        '<text x="100" y="200" font-family="serif" font-size="12" fill="#888" text-anchor="middle">Tarot Placeholder</text>',
        '</svg>',
    ]
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

# Only download cards that still need JPGs
to_dl = []
for card in CARDS:
    out_jpg = os.path.join(OUT_DIR, card + ".jpg")
    if not (os.path.exists(out_jpg) and os.path.getsize(out_jpg) > 5000):
        to_dl.append(card)

print(f"Minor arcana to download: {len(to_dl)}")
print(f"Using API with long delays (5s between cards)")
print()

success = 0
failed = 0
failed_list = []

for i, card in enumerate(to_dl):
    wiki_file = WIKI_NAMES[card]
    out_jpg = os.path.join(OUT_DIR, card + ".jpg")
    svg_path = os.path.join(OUT_DIR, card + ".svg")
    
    print(f"[{i+1}/{len(to_dl)}] {card} -> {wiki_file}")
    
    url = get_url_from_api(wiki_file)
    if url and download(url, out_jpg):
        print(f"  OK: {card}.jpg ({os.path.getsize(out_jpg)} bytes)")
        success += 1
        if os.path.exists(svg_path):
            os.remove(svg_path)
    else:
        print(f"  FAILED, keeping placeholder")
        if not os.path.exists(svg_path):
            make_svg(card, svg_path)
        failed += 1
        failed_list.append(card)
    
    # 5 second delay between cards
    if i < len(to_dl) - 1:
        time.sleep(5)

print()
print("=== MINOR ARCANA RESULTS ===")
print(f"Total: {len(to_dl)}")
print(f"Downloaded: {success}")
print(f"Failed: {failed}")
if failed_list:
    print(f"Failed cards: {failed_list}")

jpg_count = len([f for f in os.listdir(OUT_DIR) if f.endswith(".jpg")])
svg_count = len([f for f in os.listdir(OUT_DIR) if f.endswith(".svg")])
print(f"\nTotal files: {jpg_count} JPGs, {svg_count} SVGs, {jpg_count + svg_count} total")
