import os
import requests
from PIL import Image
import io
import time
import urllib.parse

# Mapping of Spanish filenames to Wikimedia Commons English filenames
# Using the correct pattern: "Card Name (Rider-Waite Smith tarot deck).png"
missing_images = {
    # Copas (3) - Court cards
    "Caballero_de_Copas.jpg": "Knight of Cups (Rider-Waite Smith tarot deck).png",
    "Reina_de_Copas.jpg": "Queen of Cups (Rider-Waite Smith tarot deck).png",
    "Rey_de_Copas.jpg": "King of Cups (Rider-Waite Smith tarot deck).png",
    # Oros (12)
    "As_de_Oros.jpg": "Ace of Pentacles (Rider-Waite Smith tarot deck).png",
    "2_de_Oros.jpg": "Two of Pentacles (Rider-Waite Smith tarot deck).png",
    "3_de_Oros.jpg": "Three of Pentacles (Rider-Waite Smith tarot deck).png",
    "4_de_Oros.jpg": "Four of Pentacles (Rider-Waite Smith tarot deck).png",
    "5_de_Oros.jpg": "Five of Pentacles (Rider-Waite Smith tarot deck).png",
    "6_de_Oros.jpg": "Six of Pentacles (Rider-Waite Smith tarot deck).png",
    "7_de_Oros.jpg": "Seven of Pentacles (Rider-Waite Smith tarot deck).png",
    "8_de_Oros.jpg": "Eight of Pentacles (Rider-Waite Smith tarot deck).png",
    "9_de_Oros.jpg": "Nine of Pentacles (Rider-Waite Smith tarot deck).png",
    "Sota_de_Oros.jpg": "Page of Pentacles (Rider-Waite Smith tarot deck).png",
    "Caballero_de_Oros.jpg": "Knight of Pentacles (Rider-Waite Smith tarot deck).png",
    "Reina_de_Oros.jpg": "Queen of Pentacles (Rider-Waite Smith tarot deck).png",
    "Rey_de_Oros.jpg": "King of Pentacles (Rider-Waite Smith tarot deck).png",
    # Espadas (11)
    "As_de_Espadas.jpg": "Ace of Swords (Rider-Waite Smith tarot deck).png",
    "3_de_Espadas.jpg": "Three of Swords (Rider-Waite Smith tarot deck).png",
    "4_de_Espadas.jpg": "Four of Swords (Rider-Waite Smith tarot deck).png",
    "5_de_Espadas.jpg": "Five of Swords (Rider-Waite Smith tarot deck).png",
    "6_de_Espadas.jpg": "Six of Swords (Rider-Waite Smith tarot deck).png",
    "7_de_Espadas.jpg": "Seven of Swords (Rider-Waite Smith tarot deck).png",
    "8_de_Espadas.jpg": "Eight of Swords (Rider-Waite Smith tarot deck).png",
    "9_de_Espadas.jpg": "Nine of Swords (Rider-Waite Smith tarot deck).png",
    "Sota_de_Espadas.jpg": "Page of Swords (Rider-Waite Smith tarot deck).png",
    "Caballero_de_Espadas.jpg": "Knight of Swords (Rider-Waite Smith tarot deck).png",
    "Reina_de_Espadas.jpg": "Queen of Swords (Rider-Waite Smith tarot deck).png",
    "Rey_de_Espadas.jpg": "King of Swords (Rider-Waite Smith tarot deck).png",
    # Bastos (14)
    "As_de_Bastos.jpg": "Ace of Wands (Rider-Waite Smith tarot deck).png",
    "3_de_Bastos.jpg": "Three of Wands (Rider-Waite Smith tarot deck).png",
    "4_de_Bastos.jpg": "Four of Wands (Rider-Waite Smith tarot deck).png",
    "5_de_Bastos.jpg": "Five of Wands (Rider-Waite Smith tarot deck).png",
    "6_de_Bastos.jpg": "Six of Wands (Rider-Waite Smith tarot deck).png",
    "7_de_Bastos.jpg": "Seven of Wands (Rider-Waite Smith tarot deck).png",
    "8_de_Bastos.jpg": "Eight of Wands (Rider-Waite Smith tarot deck).png",
    "9_de_Bastos.jpg": "Nine of Wands (Rider-Waite Smith tarot deck).png",
    "Sota_de_Bastos.jpg": "Page of Wands (Rider-Waite Smith tarot deck).png",
    "Caballero_de_Bastos.jpg": "Knight of Wands (Rider-Waite Smith tarot deck).png",
    "Reina_de_Bastos.jpg": "Queen of Wands (Rider-Waite Smith tarot deck).png",
    "Rey_de_Bastos.jpg": "King of Wands (Rider-Waite Smith tarot deck).png",
}

output_dirs = [
    "C:/Users/Diego/Desktop/OraculoUnificado/www/img/tarot/",
    "C:/Users/Diego/Desktop/OraculoUnificado/img/tarot/"
]

for d in output_dirs:
    os.makedirs(d, exist_ok=True)

def get_wikimedia_url(filename):
    """Get the direct URL from Wikimedia Commons API"""
    api_url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "titles": f"File:{filename}",
        "prop": "imageinfo",
        "iiprop": "url",
        "format": "json"
    }
    headers = {"User-Agent": "OraculoUnificado/1.0 (diegovillens@gmail.com)"}
    
    try:
        response = requests.get(api_url, params=params, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        pages = data.get("query", {}).get("pages", {})
        for page in pages.values():
            info = page.get("imageinfo", [{}])[0]
            return info.get("url")
    except Exception as e:
        print(f"API error for {filename}: {e}")
    return None

def download_and_convert(spanish_name, wikimedia_filename):
    """Download PNG from Wikimedia and convert to JPG"""
    url = get_wikimedia_url(wikimedia_filename)
    if not url:
        return False, "Could not get URL from API"
    
    try:
        headers = {"User-Agent": "OraculoUnificado/1.0 (diegovillens@gmail.com)"}
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        img = Image.open(io.BytesIO(response.content))
        
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        for output_dir in output_dirs:
            output_path = os.path.join(output_dir, spanish_name)
            img.save(output_path, 'JPEG', quality=95)
        
        return True, url
        
    except Exception as e:
        return False, str(e)

print(f"Downloading {len(missing_images)} missing tarot images...\n")
success_count = 0
failures = []

for i, (spanish_name, wikimedia_filename) in enumerate(missing_images.items(), 1):
    print(f"[{i}/{len(missing_images)}] {spanish_name}", end=" ... ")
    success, result = download_and_convert(spanish_name, wikimedia_filename)
    
    if success:
        print(f"OK")
        success_count += 1
    else:
        print(f"FAILED: {result}")
        failures.append((spanish_name, result))
    
    time.sleep(2)

print(f"\n{'='*60}")
print(f"RESULTS: {success_count}/{len(missing_images)} downloaded successfully")

if failures:
    print(f"\nFAILED ({len(failures)}):")
    for name, error in failures:
        print(f"  - {name}: {error}")
else:
    print("\n✓ All images downloaded successfully!")

print(f"\n{'='*60}")
for d in output_dirs:
    jpg_count = len([f for f in os.listdir(d) if f.endswith('.jpg')])
    svg_count = len([f for f in os.listdir(d) if f.endswith('.svg')])
    print(f"{d}: {jpg_count} JPG files, {svg_count} SVG files")
