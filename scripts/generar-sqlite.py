#!/usr/bin/env python3
"""
generar-sqlite.py — Genera la base de datos SQLite de ciudades desde GeoNames.

Uso:
  1. Descarga ES.txt y cities5000.txt desde https://download.geonames.org/export/dump/
  2. Colócalos en scripts/geonames/
  3. Ejecuta: python scripts/generar-sqlite.py

Genera js/data/ciudades.sqlite con tabla:
  ciudades(id, nombre, provincia_pais, lat, lon, timezone_id)
  ÍNDICE en columna nombre.

Filtra solo Feature class P (poblaciones). Descarta columnas inútiles.
"""

import sqlite3
import os
import sys

# Rutas
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
GEONAMES_DIR = os.path.join(SCRIPT_DIR, "geonames")
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_PATH = os.path.join(PROJECT_ROOT, "js", "data", "ciudades.sqlite")

# Archivos GeoNames a procesar (en orden de prioridad)
# ES.txt: todas las poblaciones de España
# cities5000.txt: poblaciones mundiales con >5000 habitantes
GEONAMES_FILES = ["ES.txt", "cities5000.txt"]

# Columnas GeoNames (tab-delimited, 0-indexed)
# 0: geonameid, 1: name, 2: asciiname, 3: alternatenames,
# 4: latitude, 5: longitude, 6: feature class, 7: feature code,
# 8: country code, 9: cc2, 10: admin1, 11: admin2, 12: admin3, 13: admin4,
# 14: population, 15: elevation, 16: dem, 17: timezone, 18: modification date

# Mapeo de códigos de país a nombre (para provincia_pais)
PAISES = {
    "ES": "España", "PT": "Portugal", "FR": "Francia", "GB": "Reino Unido",
    "IE": "Irlanda", "IT": "Italia", "DE": "Alemania", "AT": "Austria",
    "BE": "Bélgica", "NL": "Países Bajos", "LU": "Luxemburgo", "CH": "Suiza",
    "US": "Estados Unidos", "CA": "Canadá", "MX": "México", "AR": "Argentina",
    "BR": "Brasil", "CL": "Chile", "CO": "Colombia", "PE": "Perú",
    "VE": "Venezuela", "UY": "Uruguay", "EC": "Ecuador", "BO": "Bolivia",
    "PY": "Paraguay", "CU": "Cuba", "DO": "Rep. Dominicana", "PR": "Puerto Rico",
    "AU": "Australia", "NZ": "Nueva Zelanda", "ZA": "Sudáfrica",
    "MA": "Marruecos", "DZ": "Argelia", "TN": "Túnez", "EH": "Sáhara Occidental",
    "AD": "Andorra", "GI": "Gibraltar", "MC": "Mónaco", "SM": "San Marino",
    "VA": "Vaticano", "MT": "Malta", "CY": "Chipre", "GR": "Grecia",
    "TR": "Turquía", "RU": "Rusia", "UA": "Ucrania", "PL": "Polonia",
    "SE": "Suecia", "NO": "Noruega", "FI": "Finlandia", "DK": "Dinamarca",
    "IS": "Islandia", "EE": "Estonia", "LV": "Letonia", "LT": "Lituania",
    "CZ": "Chequia", "SK": "Eslovaquia", "HU": "Hungría", "RO": "Rumanía",
    "BG": "Bulgaria", "RS": "Serbia", "HR": "Croacia", "SI": "Eslovenia",
    "BA": "Bosnia", "MK": "Macedonia del Norte", "AL": "Albania", "ME": "Montenegro",
    "MD": "Moldavia", "BY": "Bielorrusia", "GE": "Georgia", "AM": "Armenia",
    "AZ": "Azerbaiyán", "KZ": "Kazajistán", "UZ": "Uzbekistán",
    "CN": "China", "JP": "Japón", "KR": "Corea del Sur", "KP": "Corea del Norte",
    "IN": "India", "PK": "Pakistán", "BD": "Bangladés", "LK": "Sri Lanka",
    "NP": "Nepal", "BT": "Bután", "MM": "Myanmar", "TH": "Tailandia",
    "LA": "Laos", "KH": "Camboya", "VN": "Vietnam", "MY": "Malasia",
    "SG": "Singapur", "ID": "Indonesia", "PH": "Filipinas", "BN": "Brunéi",
    "TL": "Timor Oriental", "MN": "Mongolia", "TW": "Taiwán", "HK": "Hong Kong",
    "MO": "Macao", "AF": "Afganistán", "IR": "Irán", "IQ": "Irak",
    "SY": "Siria", "LB": "Líbano", "JO": "Jordania", "IL": "Israel",
    "PS": "Palestina", "SA": "Arabia Saudí", "AE": "Emiratos Árabes",
    "QA": "Catar", "BH": "Baréin", "KW": "Kuwait", "OM": "Omán",
    "YE": "Yemen", "EG": "Egipto", "LY": "Libia", "SD": "Sudán",
    "SS": "Sudán del Sur", "ET": "Etiopía", "ER": "Eritrea", "DJ": "Yibuti",
    "SO": "Somalia", "KE": "Kenia", "UG": "Uganda", "TZ": "Tanzania",
    "RW": "Ruanda", "BI": "Burundi", "MZ": "Mozambique", "ZM": "Zambia",
    "ZW": "Zimbabue", "BW": "Botsuana", "NA": "Namibia", "AO": "Angola",
    "CG": "Congo", "CD": "R.D. Congo", "GA": "Gabón", "CM": "Camerún",
    "CF": "Rep. Centroafricana", "TD": "Chad", "NE": "Níger", "ML": "Mali",
    "BF": "Burkina Faso", "SN": "Senegal", "GM": "Gambia", "GN": "Guinea",
    "SL": "Sierra Leona", "LR": "Liberia", "CI": "Costa de Marfil",
    "GH": "Ghana", "TG": "Togo", "BJ": "Benín", "NG": "Nigeria",
    "ST": "Santo Tomé", "GQ": "Guinea Ecuatorial", "KM": "Comoras",
    "MG": "Madagascar", "MU": "Mauricio", "SC": "Seychelles",
    "RE": "Reunión", "YT": "Mayotte", "SH": "Santa Elena",
}


def procesar_geonames():
    """Lee los archivos GeoNames y devuelve una lista de tuplas (nombre, provincia_pais, lat, lon, tz)."""
    ciudades = {}
    vistos = set()  # geonameid para evitar duplicados

    for filename in GEONAMES_FILES:
        filepath = os.path.join(GEONAMES_DIR, filename)
        if not os.path.exists(filepath):
            print(f"  ⚠ {filename} no encontrado en {GEONAMES_DIR} — saltando")
            continue

        count_file = 0
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                parts = line.rstrip("\n").split("\t")
                if len(parts) < 19:
                    continue

                geonameid = parts[0]
                name = parts[1]
                lat = parts[4]
                lon = parts[5]
                feature_class = parts[6]
                feature_code = parts[7]
                country_code = parts[8]
                admin1 = parts[10] if len(parts) > 10 else ""
                timezone = parts[17]

                # Filtrar solo poblaciones (Feature class P)
                if feature_class != "P":
                    continue

                # Evitar duplicados por geonameid
                if geonameid in vistos:
                    continue
                vistos.add(geonameid)

                # Validar lat/lon
                try:
                    lat_f = float(lat)
                    lon_f = float(lon)
                except (ValueError, TypeError):
                    continue

                # Construir provincia_pais: "País" o "Provincia, País"
                pais = PAISES.get(country_code, country_code)
                # admin1 a veces es un código numérico — no siempre es útil
                # Para España, admin1 podría ser el código de comunidad autónoma
                # Mantenemos formato simple: "Nombre, País"
                provincia_pais = f"{pais}"

                # Clave única: nombre + país + coords redondeadas (para evitar duplicados de nombres)
                key = (name.lower(), country_code, round(lat_f, 2), round(lon_f, 2))
                if key in ciudades:
                    continue

                ciudades[key] = (name, provincia_pais, lat_f, lon_f, timezone)
                count_file += 1

        print(f"  ✓ {filename}: {count_file} poblaciones importadas")

    return list(ciudades.values())


def crear_sqlite(ciudades):
    """Crea el archivo SQLite con la tabla de ciudades."""
    # Eliminar si existe
    if os.path.exists(OUTPUT_PATH):
        os.remove(OUTPUT_PATH)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    conn = sqlite3.connect(OUTPUT_PATH)
    cursor = conn.cursor()

    # Crear tabla
    cursor.execute("""
        CREATE TABLE ciudades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            provincia_pais TEXT,
            lat REAL,
            lon REAL,
            timezone_id TEXT
        )
    """)

    # Insertar ciudades
    cursor.executemany(
        "INSERT INTO ciudades (nombre, provincia_pais, lat, lon, timezone_id) VALUES (?, ?, ?, ?, ?)",
        ciudades
    )

    # Crear índice en nombre
    cursor.execute("CREATE INDEX idx_ciudades_nombre ON ciudades(nombre)")

    conn.commit()
    conn.close()

    # Reportar tamaño
    size = os.path.getsize(OUTPUT_PATH)
    size_mb = size / (1024 * 1024)
    size_kb = size / 1024
    if size_mb < 1:
        print(f"\n  ✅ SQLite generado: {size_kb:.0f} KB ({len(ciudades)} ciudades)")
    else:
        print(f"\n  ✅ SQLite generado: {size_mb:.1f} MB ({len(ciudades)} ciudades)")

    print(f"  📁 Ruta: {OUTPUT_PATH}")


def main():
    print("=" * 60)
    print("  Generador de SQLite — Oráculo Unificado")
    print("=" * 60)
    print()
    print("Procesando archivos GeoNames...")

    ciudades = procesar_geonames()

    if not ciudades:
        print("\n❌ No se encontraron ciudades. Coloca ES.txt y cities5000.txt en:")
        print(f"   {GEONAMES_DIR}")
        print("   Descarga desde: https://download.geonames.org/export/dump/")
        sys.exit(1)

    print(f"\nTotal de ciudades únicas: {len(ciudades)}")

    # Top 10 por nombre (muestra de verificación)
    print("\nTop 10 ciudades (muestra):")
    for c in sorted(ciudades, key=lambda x: x[0])[:10]:
        print(f"  {c[0]}, {c[1]} — lat:{c[2]} lon:{c[3]} tz:{c[4]}")

    print("\nCreando base de datos SQLite...")
    crear_sqlite(ciudades)

    print("\n" + "=" * 60)
    print("  ✅ Proceso completado")
    print("=" * 60)
    print(f"\nSiguiente paso: copia js/data/ciudades.sqlite a www/js/data/")
    print("y ejecuta npx cap copy android")


if __name__ == "__main__":
    main()