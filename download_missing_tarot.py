import os
import requests
from PIL import Image
import io
import time

# Mapping of Spanish filenames to Wikimedia Commons English filenames
# These are the 40 that failed in the previous run
missing_images = {
    # Copas (3)
    "Caballero_de_Copas.jpg": "Knight_of_Cups_(Rider-Waite_Smith_tarot_deck).png",
    "Reina_de_Copas.jpg": "Queen_of_Cups_(Rider-Waite_Smith_tarot_deck).png",
    "Rey_de_Copas.jpg": "King_of_Cups_(Rider-Waite_Smith_tarot_deck).png",
    # Oros (12)
    "As_de_Oros.jpg": "Ace_of_Pentacles_(Rider-Waite_Smith_tarot_deck).png",
    "2_de_Oros.jpg": "Two_of_Pentacles_(Rider-Waite_Smith_tarot_deck).png",
    "3_de_Oros.jpg": "Three_of_Pentacles_(Rider-Waite_Smith_tarot_deck).png",
    "4_de_Oros.jpg": "Four_of_Pentacles_(Rider-Waite_Smith_tarot_deck).png",
    "5_de_Oros.jpg": "Five_of_Pentacles_(Rider-Waite_Smith_tarot_deck).png",
    "6_de_Oros.jpg": "Six_of_Pentacles_(Rider-Waite_Smith_tarot_deck).png",
    "7_de_Oros.jpg": "Seven_of_Pentacles_(Rider-Waite_Smith_tarot_deck).png",
    "8_de_Oros.jpg": "Eight_of_Pentacles_(Rider-Waite_Smith_tarot_deck).png",
    "9_de_Oros.jpg": "Nine_of_Pentacles_(Rider-Waite_Smith_tarot_deck).png",
    "Sota_de_Oros.jpg": "Page_of_Pentacles_(Rider-Waite_Smith_tarot_deck).png",
    "Caballero_de_Oros.jpg": "Knight_of_Pentacles_(Rider-Waite_Smith_tarot_deck).png",
    "Reina_de_Oros.jpg": "Queen_of_Pentacles_(Rider-Waite_Smith_tarot_deck).png",
    "Rey_de_Oros.jpg": "King_of_Pentacles_(Rider-Waite_Smith_tarot_deck).png",
    # Espadas (11)
    "As_de_Espadas.jpg": "Ace_of_Swords_(Rider-Waite_Smith_tarot_deck).png",
    "3_de_Espadas.jpg": "Three_of_Swords_(Rider-Waite_Smith_tarot_deck).png",
    "4_de_Espadas.jpg": "Four_of_Swords_(Rider-Waite_Smith_tarot_deck).png",
    "5_de_Espadas.jpg": "Five_of_Swords_(Rider-Waite_Smith_tarot_deck).png",
    "6_de_Espadas.jpg": "Six_of_Swords_(Rider-Waite_Smith_tarot_deck).png",
    "7_de_Espadas.jpg": "Seven_of_Swords_(Rider-Waite_Smith_tarot_deck).png",
    "8_de_Espadas.jpg": "Eight_of_Swords_(Rider-Waite_Smith_tarot_deck).png",
    "9_de_Espadas.jpg": "Nine_of_Swords_(Rider-Waite_Smith_tarot_deck).png",
    "Sota_de_Espadas.jpg": "Page_of_Swords_(Rider-Waite_Smith_tarot_deck).png",
    "Caballero_de_Espadas.jpg": "Knight_of_Swords_(Rider-Waite_Smith_tarot_deck).png",
    "Reina_de_Espadas.jpg": "Queen_of_Swords_(Rider-Waite_Smith_tarot_deck).png",
    "Rey_de_Espadas.jpg": "King_of_Swords_(Rider-Waite_Smith_tarot_deck).png",
    # Bastos (14)
    "As_de_Bastos.jpg": "Ace_of_Wands_(Rider-Waite_Smith_tarot_deck).png",
    "3_de_Bastos.jpg": "Three_of_Wands_(Rider-Waite_Smith_tarot_deck).png",
    "4_de_Bastos.jpg": "Four_of_Wands_(Rider-Waite_Smith_tarot_deck).png",
    "5_de_Bastos.jpg": "Five_of_Wands_(Rider-Waite_Smith_tarot_deck).png",
    "6_de_Bastos.jpg": "Six_of_Wands_(Rider-Waite_Smith_tarot_deck).png",
    "7_de_Bastos.jpg": "Seven_of_Wands_(Rider-Waite_Smith_tarot_deck).png",
    "8_de_Bastos.jpg": "Eight_of_Wands_(Rider-Waite_Smith_tarot_deck).png",
    "9_de_Bastos.jpg": "Nine_of_Wands_(Rider-Waite_Smith_tarot_deck).png",
    "Sota_de_Bastos.jpg": "Page_of_Wands_(Rider-Waite_Smith_tarot_deck).png",
    "Caballero_de_Bastos.jpg": "Knight_of_Wands_(Rider-Waite_Smith_tarot_deck).png",
    "Reina_de_Bastos.jpg": "Queen_of_Wands_(Rider-Waite_Smith_tarot_deck).png",
    "Rey_de_Bastos.jpg": "King_of_Wands_(Rider-Waite_Smith_tarot_deck).png",
}

# Output directories
output_dirs = [
    "C:/Users/Diego/Desktop/OraculoUnificado/www/img/tarot/",
    "C:/Users/Diego/Desktop/OraculoUnificado/img/tarot/"
]

# Create directories if they don't exist
for d in output_dirs:
    os.makedirs(d, exist_ok=True)

def download_and_convert(spanish_name, wikimedia_filename):
    """Download PNG from Wikimedia and convert to JPG"""
    base_url = "https://upload.wikimedia.org/wikipedia/commons/"
    
    # Construct URL from wikimedia filename
    # PNGs are stored with their full filename
    url = base_url + wikimedia_filename[0].lower() + "/" + wikimedia_filename[0:2].upper() + "/" + wikimedia_filename
    
    try:
        # Download PNG
        headers = {"User-Agent": "OraculoUnificado/1.0 (diegovillens@gmail.com)"}
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Open with PIL and convert to JPG
        img = Image.open(io.BytesIO(response.content))
        
        # Convert to RGB if necessary (PNG might have alpha channel)
        if img.mode in ('RGBA', 'LA', 'P'):
            # Create white background
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Save to both directories
        for output_dir in output_dirs:
            output_path = os.path.join(output_dir, spanish_name)
            img.save(output_path, 'JPEG', quality=95)
        
        return True, url
        
    except Exception as e:
        return False, str(e)

# Download all missing images
print(f"Downloading {len(missing_images)} missing tarot images...\n")
success_count = 0
failures = []

for i, (spanish_name, wikimedia_filename) in enumerate(missing_images.items(), 1):
    print(f"[{i}/{len(missing_images)}] {spanish_name}", end=" ... ")
    success, result = download_and_convert(spanish_name, wikimedia_filename)
    
    if success:
        print(f"OK (from {result[-50:]})")
        success_count += 1
    else:
        print(f"FAILED: {result}")
        failures.append((spanish_name, result))
    
    # Rate limiting - be nice to Wikimedia
    time.sleep(2)

print(f"\n{'='*60}")
print(f"RESULTS: {success_count}/{len(missing_images)} downloaded successfully")

if failures:
    print(f"\nFAILED ({len(failures)}):")
    for name, error in failures:
        print(f"  - {name}: {error}")
else:
    print("\n✓ All images downloaded successfully!")

# Count total JPG files in both directories
print(f"\n{'='*60}")
for d in output_dirs:
    jpg_count = len([f for f in os.listdir(d) if f.endswith('.jpg')])
    svg_count = len([f for f in os.listdir(d) if f.endswith('.svg')])
    print(f"{d}: {jpg_count} JPG files, {svg_count} SVG files")
