import json, urllib.request, os, time, sys

# Load URL map
with open('C:/Users/Diego/Desktop/OraculoUnificado/img/tarot_url_map.json', 'r', encoding='utf-8') as f:
    url_map = json.load(f)

# Major Arcana mapping
major = {
    'File:RWS1909 - 00 Fool.jpeg': 'El_Loco.jpg',
    'File:RWS1909 - 01 Magician.jpeg': 'El_Mago.jpg',
    'File:RWS1909 - 02 High Priestess.jpeg': 'La_Suma_Sacerdotisa.jpg',
    'File:RWS1909 - 03 Empress.jpeg': 'La_Emperatriz.jpg',
    'File:RWS1909 - 04 Emperor.jpeg': 'El_Emperador.jpg',
    'File:RWS1909 - 05 Hierophant.jpeg': 'El_Hierofante.jpg',
    'File:RWS1909 - 06 Lovers.jpeg': 'Los_Enamorados.jpg',
    'File:RWS1909 - 07 Chariot.jpeg': 'El_Carro.jpg',
    'File:RWS1909 - 08 Strength.jpeg': 'La_Fuerza.jpg',
    'File:RWS1909 - 09 Hermit.jpeg': 'El_Ermitano.jpg',
    'File:RWS1909 - 10 Wheel of Fortune.jpeg': 'La_Rueda_de_la_Fortuna.jpg',
    'File:RWS1909 - 11 Justice.jpeg': 'La_Justicia.jpg',
    'File:RWS1909 - 12 Hanged Man.jpeg': 'El_Colgado.jpg',
    'File:RWS1909 - 13 Death.jpeg': 'La_Muerte.jpg',
    'File:RWS1909 - 14 Temperance.jpeg': 'La_Templanza.jpg',
    'File:RWS1909 - 15 Devil.jpeg': 'El_Diablo.jpg',
    'File:RWS1909 - 16 Tower.jpeg': 'La_Torre.jpg',
    'File:RWS1909 - 17 Star.jpeg': 'La_Estrella.jpg',
    'File:RWS1909 - 18 Moon.jpeg': 'La_Luna.jpg',
    'File:RWS1909 - 19 Sun.jpeg': 'El_Sol.jpg',
    'File:RWS1909 - 20 Judgement.jpeg': 'El_Juicio.jpg',
    'File:RWS1909 - 21 World.jpeg': 'El_Mundo.jpg',
}

num_to_name = {
    '01': 'As', '02': '2', '03': '3', '04': '4', '05': '5',
    '06': '6', '07': '7', '08': '8', '09': '9', '10': '10',
    '11': 'Sota', '12': 'Caballero', '13': 'Reina', '14': 'Rey',
}

suit_to_sp = {'Cups': 'Copas', 'Pentacles': 'Oros', 'Swords': 'Espadas', 'Wands': 'Bastos'}

minor = {}
for title in url_map:
    for suit_en in ['Cups', 'Pentacles', 'Swords', 'Wands']:
        prefix = f'File:RWS1909 - {suit_en} '
        if title.startswith(prefix):
            parts = title.replace(prefix, '').replace('.jpeg', '')
            num = parts.strip()
            suit_sp = suit_to_sp[suit_en]
            name_sp = num_to_name[num]
            minor[title] = f'{name_sp}_de_{suit_sp}.jpg'

all_mapping = {**major, **minor}
dest_dir = 'C:/Users/Diego/Desktop/OraculoUnificado/img/tarot/'

# Check which files already have real images (not placeholders)
# Real RWS images are > 50KB, placeholders are ~14KB
to_download = []
already_done = []
for title, sp_name in all_mapping.items():
    dest = os.path.join(dest_dir, sp_name)
    if os.path.exists(dest) and os.path.getsize(dest) > 50000:
        already_done.append(sp_name)
    else:
        to_download.append((title, sp_name, url_map[title]))

print(f'Already downloaded (real images): {len(already_done)}')
print(f'Need to download: {len(to_download)}', flush=True)

success = 0
failed = []
max_retries = 3

for i, (title, sp_name, url) in enumerate(to_download):
    dest = os.path.join(dest_dir, sp_name)
    downloaded = False
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'HermesAgent/1.0 (educational project; contact@example.com)',
                'Accept': 'image/jpeg,image/png,image/*'
            })
            resp = urllib.request.urlopen(req, timeout=45)
            data = resp.read()
            if len(data) > 5000 and (data[:2] == b'\xff\xd8' or data[:4] == b'\x89PNG'):
                with open(dest, 'wb') as f:
                    f.write(data)
                success += 1
                downloaded = True
                print(f'[{i+1}/{len(to_download)}] OK: {sp_name} ({len(data)} bytes)', flush=True)
                break
            else:
                print(f'[{i+1}/{len(to_download)}] FAIL (bad data): {sp_name} size={len(data)}', flush=True)
        except Exception as e:
            wait_time = 10 * (attempt + 1)
            print(f'[{i+1}/{len(to_download)}] RETRY {attempt+1}/{max_retries}: {sp_name} - {e} (waiting {wait_time}s)', flush=True)
            time.sleep(wait_time)
    
    if not downloaded:
        failed.append(sp_name)
    
    # Rate limit: wait 4 seconds between downloads
    time.sleep(4)

print(f'\n=== FINAL RESULTS ===', flush=True)
print(f'Successfully downloaded: {success + len(already_done)}')
print(f'Failed: {len(failed)}')
if failed:
    print('Failed files:')
    for name in failed:
        print(f'  {name}')
