import requests, os, time, random, hashlib
from PIL import Image
from io import BytesIO

OUT_DIR = r"C:\Users\Diego\Desktop\OraculoUnificado\img\tarot"
HEADERS = {"User-Agent": "OraculoUnificado/1.0 (educational tarot project; contact@example.com)"}

# All minor arcana cards that still only have SVGs
SUIT_WIKI = {"Copas": "Cups", "Oros": "Pentacles", "Espadas": "Swords", "Bastos": "Wands"}
RANK_WIKI = {"As": "01_Ace", "2": "02", "3": "03", "4": "04", "5": "05", "6": "06", "7": "07", "8": "08", "9": "09", "10": "10", "Sota": "11_Page", "Caballero": "12_Knight", "Reina": "13_Queen", "Rey": "14_King"}

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

def build_direct_url(filename):
    name_for_hash = filename.replace(" ", "_")
    md5 = hashlib.md5(name_for_hash.encode("utf-8")).hexdigest()
    return f"https://upload.wikimedia.org/wikipedia/commons/{md5[0]}/{md5[:2]}/{filename}"

def build_thumb_url(filename, width=400):
    name_for_hash = filename.replace(" ", "_")
    md5 = hashlib.md5(name_for_hash.encode("utf-8")).hexdigest()
    return f"https://upload.wikimedia.org/wikipedia/commons/thumb/{md5[0]}/{md5[:2]}/{filename}/{width}px-{filename}"

def download(url, out_path, max_retries=6):
    for attempt in range(max_retries):
        try:
            r = requests.get(url, headers=HEADERS, timeout=60)
            if r.status_code == 429:
                wait = 10 * (attempt + 1) + random.uniform(3, 8)
                print(f"    429, wait {wait:.0f}s ({attempt+1}/{max_retries})")
                time.sleep(wait)
                continue
            if r.status_code == 404:
                print(f"    404 - file not found at this URL")
                return False
            r.raise_for_status()
            img = Image.open(BytesIO(r.content))
            if img.mode != "RGB":
                img = img.convert("RGB")
            img.save(out_path, "JPEG", quality=90)
            return True
        except Exception as e:
            if "404" in str(e):
                return False
            if attempt < max_retries - 1:
                wait = 8 * (attempt + 1)
                print(f"    err: {e}, retry {wait}s")
                time.sleep(wait)
            else:
                print(f"    failed: {e}")
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
print(f"Using direct URL approach (bypassing API)")
print()

success = 0
failed = 0
failed_list = []

for i, card in enumerate(to_dl):
    wiki_file = WIKI_NAMES[card]
    out_jpg = os.path.join(OUT_DIR, card + ".jpg")
    svg_path = os.path.join(OUT_DIR, card + ".svg")
    
    print(f"[{i+1}/{len(to_dl)}] {card} -> {wiki_file}")
    
    # Try thumbnail URL first (smaller, faster)
    thumb_url = build_thumb_url(wiki_file, 400)
    direct_url = build_direct_url(wiki_file)
    
    got = False
    if download(thumb_url, out_jpg):
        got = True
    elif download(direct_url, out_jpg):
        got = True
    
    if got:
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
    
    # Wait 3 seconds between each card to avoid rate limiting
    time.sleep(3)

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
