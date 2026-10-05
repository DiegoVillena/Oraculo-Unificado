# 🔮 Oráculo Unificado

> App Android híbrida que unifica tres disciplinas adivinatorias en una sola interfaz — **Tarot**, **I Ching** y **Carta Astral** (y **Sinastria**) — con análisis opcional por IA y 6 idiomas.

![Plataforma](https://img.shields.io/badge/plataforma-Android-3DDC84) ![Idiomas](https://img.shields.io/badge/idiomas-6-2980B9) ![Google Play](https://img.shields.io/badge/Google%20Play-Disponible-34A853) ![Licencia](https://img.shields.io/badge/licencia-propietaria-lightgrey)

**Español** · [English](README.en.md)

Sin registro ni cuentas: el cálculo astronómico y la lógica de las tiradas ocurren en tu propio dispositivo (Swiss Ephemeris y SQLite compilados a WASM) y tus tiradas se guardan localmente. El único componente en la nube es un proxy ligero de IA (Cloudflare Worker → Gemini), cuya clave API nunca sale del servidor.

## ✨ Capturas de pantalla

<table>
  <tr>
    <td><img src="img/screens/01-main.png" width="220"></td>
    <td><img src="img/screens/02-tarot.png" width="220"></td>
    <td><img src="img/screens/03-iching.png" width="220"></td>
  </tr>
  <tr>
    <td><img src="img/screens/04-natal.png" width="220"></td>
    <td><img src="img/screens/05-ai.png" width="220"></td>
    <td><img src="img/screens/07-synastry.png" width="220"></td>
  </tr>
  <tr>
    <td><img src="img/screens/06-english.png" width="220"></td>
    <td><i>Idioma inglés (i18n propio)</i></td>
    <td><i>7 pantallas cubren los 3 oráculos + IA</i></td>
  </tr>
</table>

## 📥 Descargar

- **Google Play:** [https://play.google.com/store/apps/details?id=com.oraculounificado.app](https://play.google.com/store/apps/details?id=com.oraculounificado.app)
- También puedes **compilar tu propio APK**: ver [Setup y desarrollo](#setup-y-desarrollo).

> **Estado:** publicada en Google Play (producción, rollout 100%). App construida de principio a fin por una sola persona con desarrollo asistido por IA.

## Características

- **Tarot**: Tiradas de 1 carta, 3 cartas (pasado/presente/futuro) y Cruz Celta (10 cartas), con renderizado en CSS Grid responsivo. Incluye baraja completa con imágenes y descripciones.
- **I Ching**: Generación de hexagramas con líneas mutantes, SVG y texto interpretativo.
- **Carta Astral**: Cálculo astral real con **Swiss Ephemeris (WASM)**, posiciones planetarias, casas, aspectos, Parte de Fortuna y Nodo Sur. Rueda zodiacal en SVG interactivo. Base de datos de ciudades en SQLite (sql.js).
- **Sinastria**: Compatibilidad entre dos personas: dos cartas astrales combinadas con panel de 8 factores de compatibilidad y radar octogonal.
- **Análisis IA**: Integración con Gemini vía Cloudflare Worker (proxy) con fallback a algoritmo local holístico.
- **Compartir/Copiar**: Botones nativos para copiar y compartir resultados vía el menú nativo de Android (WhatsApp, email, Messages, etc.). Los resultados largos se adjuntan como **PDF temporal** para que WhatsApp no los trunque.
- **Multiidioma**: 6 idiomas soportados (es, en, pt, fr, it, de) con sistema i18n propio y detección del idioma real del dispositivo.
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
│   │   │   │   └── MainActivity.java   # Puentes JS↔Nativo
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
├── img/                  # Imágenes (cartas de Tarot + capturas de pantalla)
├── capacitor.config.json
├── package.json
└── .env.example          # Template de variables de entorno
```

## Puentes JS ↔ Nativo (MainActivity.java)

El WebView expone cuatro `@JavascriptInterface` desde Java:

- **`AndroidClipboard.copy(text)` / `.read()`**: copia/lee el portapapeles nativo (necesario porque `navigator.clipboard` no funciona en WebView sin HTTPS).
- **`AndroidShare.share(text)`**: abre el menú nativo de compartir de Android (`Intent.ACTION_SEND`). Estrategia de compatibilidad universal: textos cortos viajan como `EXTRA_TEXT` (text/plain); textos largos (>500 caracteres) se convierten en un **PDF temporal** (API nativa `PdfDocument`, A4 con cabecera de página) adjuntado vía `FileProvider` con MIME `application/pdf` — así WhatsApp no trunca el resultado, como sí hace con `EXTRA_TEXT`.
- **`AndroidOpenUrl.open(url)`**: abre URLs externas en el navegador del sistema (los enlaces `target="_blank"` no funcionan en WebView sin HTTPS).
- **`AndroidLocale.get()`**: devuelve el locale real del dispositivo para inicializar el idioma (en WebView `navigator.language` puede devolver 'en-US' aunque el dispositivo esté en español).

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
| Shell       | Capacitor 8 (Android WebView)       |
| UI          | HTML5 + CSS3 + ES modules (sin framework) |
| Astral      | Swiss Ephemeris (WASM)              |
| Datos       | SQLite (sql.js / WASM)              |
| IA          | Gemini vía Cloudflare Worker        |
| Build       | Gradle 8 + R8/ProGuard              |
| Java        | 17                                  |

## Licencia

Propietario. © Diego Villena.