# Oráculo Unificado

App Android híbrida (Capacitor + WebView) que unifica tres disciplinas adivinatorias en una sola interfaz: **Tarot**, **I Ching** y **Carta Astral**, con análisis opcional por IA (Gemini).

## Características

- **Tarot**: Tiradas de 1 carta, 3 cartas (pasado/presente/futuro) y Cruz Celta (10 cartas), con renderizado en CSS Grid responsivo. Incluye baraja completa con imágenes y descripciones.
- **I Ching**: Generación de hexagramas con líneas mutantes, SVG y texto interpretativo.
- **Carta Astral**: Cálculo astral real con **Swiss Ephemeris (WASM)**, posiciones planetarias, casas, aspectos, Parte de Fortuna y Nodo Sur. Rueda zodiacal en SVG interactivo. Base de datos de ciudades en SQLite (sql.js).
- **Análisis IA**: Integración con Gemini vía Cloudflare Worker (proxy) con fallback a algoritmo local holístico.
- **Compartir/Copiar**: Botones nativos para copiar y compartir resultados (texto plano) vía el menú nativo de Android (WhatsApp, email, Messages, etc.) usando un puente `@JavascriptInterface`.
- **Multiidioma**: 6 idiomas soportados (es, en, pt, fr, it, de) con sistema i18n propio.
- **Persistencia**: Guardar/cargar tiradas y cartas astrales con almacenamiento local.

## Arquitectura

```
OraculoUnificado/
├── android/               # Proyecto Android nativo (Capacitor)
│   ├── app/
│   │   ├── build.gradle    # Config de build + firma release
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/oraculounificado/app/
│   │   │   │   └── MainActivity.java   # Puentes JS↔Nativo (clipboard, share)
│   │   │   └── res/                    # Recursos, iconos, splash
│   │   └── oraculo-release.keystore    # Keystore firma (NO se commitea)
│   └── keystore.properties             # Credenciales keystore (NO se commitea)
│
├── js/                   # Código fuente JavaScript (ES modules)
│   ├── core/              # Lógica: astrologia, analysis, ia-api
│   ├── data/              # Datos: tarot-kb, iching-kb, sqlite-db, swisseph WASM
│   ├── i18n/              # Internacionalización + locales (6 idiomas)
│   ├── ui/                # UI: tarot, astral, modal, tabs, onboarding, donacion
│   ├── storage.js         # Persistencia local (tiradas/cartas guardadas)
│   └── main.js            # Entry point
│
├── www/                  # Web root servido por Capacitor (webDir)
│   ├── index.html
│   ├── styles.css
│   └── js/               # Copia de js/ (sincronizada)
│
├── worker/               # Cloudflare Worker (proxy IA Gemini)
│   ├── oraculo-worker.js
│   └── wrangler.toml
│
├── scripts/             # Scripts de utilidad y generación de datos
├── img/                  # Imágenes de cartas de Tarot
├── capacitor.config.json
├── package.json
└── .env.example          # Template de variables de entorno
```

## Puentes JS ↔ Nativo (MainActivity.java)

La app expone dos `@JavascriptInterface` desde Java al WebView:

- **`AndroidClipboard.copy(text)`** / **`.read()`**: Copia/lee el portapapeles nativo (necesario porque `navigator.clipboard` no funciona en WebView sin HTTPS).
- **`AndroidShare.share(text)`**: Abre el menú nativo de compartir de Android (`Intent.ACTION_SEND`). Usa `ClipData` + `EXTRA_TEXT` + archivo `.txt` temporal vía `FileProvider` para textos largos, evitando truncamiento.

## Setup y desarrollo

### Requisitos

- Node.js 18+
- Android Studio (SDK 34, Java 17)
- Cloudflare account (para el Worker de IA, opcional)

### Instalación

```bash
# Instalar dependencias
npm install

# Copiar template de entorno y rellenar valores
cp .env.example .env
# Editar .env con tu VITE_WORKER_URL

# Sincronizar www/ → android/app/src/main/assets/public/
npx cap sync android
```

### Build

```bash
# APK debug
npm run build:apk:debug

# APK release firmado (requiere keystore.properties)
cd android && ./gradlew assembleRelease

# AAB release (para Play Store)
npm run build:bundle
```

El APK release se genera en:
`android/app/build/outputs/apk/release/app-release.apk`

### Firma release

El keystore (`oraculo-release.keystore`) y sus credenciales (`keystore.properties`) están en `.gitignore` y **no se suben al repositorio**. Para reproducir la firma:

1. Coloca `oraculo-release.keystore` en `android/app/`
2. Crea `android/keystore.properties` con:
   ```properties
   storeFile=oraculo-release.keystore
   storePassword=<tu_password>
   keyAlias=oraculo
   keyPassword=<tu_password>
   ```

### Cloudflare Worker (IA)

La IA usa un Cloudflare Worker como proxy a Gemini. La API key vive en los secrets del Worker, no en el cliente:

```bash
cd worker
npx wrangler secret put GEMINI_KEY
npx wrangler deploy
```

## Stack técnico

| Capa        | Tecnología                          |
|------------|-------------------------------------|
| Shell       | Capacitor 8 (Android)               |
| UI          | HTML5 + CSS3 + ES modules (sin framework) |
| Astral      | Swiss Ephemeris (WASM)              |
| Datos       | SQLite (sql.js / WASM)              |
| IA          | Gemini vía Cloudflare Worker        |
| Build       | Gradle 8 + R8/ProGuard              |
| Java        | 17                                  |

## Licencia

Propietario. © Diego Villena.