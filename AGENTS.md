# AGENTS.md — Instrucciones para ZCode (Oráculo Unificado)

Este archivo es la **memoria persistente** del proyecto. ZCode lo lee al iniciar cada sesión en esta carpeta, antes de cualquier prompt del usuario. Mantenlo actualizado cuando haya cambios estructurales.

---

## Qué es este proyecto

App Android híbrida (Capacitor + WebView) que unifica Tarot, I Ching y Carta Astral con análisis IA (Gemini). Sin framework JS — HTML5 + CSS3 + ES modules vanilla. Stack completo en `README.md`.

- **applicationId**: `com.oraculounificado.app`
- **MainActivity**: `com.oraculounificado.app.MainActivity`
- **Web root**: `www/` (servido por Capacitor; `js/` es el source que se sincroniza con `www/`)
- **Stack**: Capacitor 8, Swiss Ephemeris WASM, SQLite (sql.js), Gradle 8, Java 17, R8/ProGuard

## Estructura del proyecto

```
js/                          # Código fuente (ES modules)
  core/                      # astrologia.js, analysis.js, ia-api.js
  data/                      # tarot-kb, iching-kb, sqlite-db, swisseph WASM, ciudades.sqlite
  i18n/locales/               # 6 idiomas: es, en, pt, fr, it, de
  ui/                        # tarot.js, astral.js, modal.js, tabs.js, onboarding.js, donacion.js
  main.js                    # Entry point
www/                         # Copia de js/ servida en el WebView (sincronizar tras editar js/)
android/                     # Proyecto nativo (Capacitor)
  app/src/main/java/.../MainActivity.java   # Puentes JS↔Nativo
  app/build.gradle           # Config build + firma release
worker/                      # Cloudflare Worker (proxy IA Gemini)
img/tarot/                   # Imágenes de las cartas
```

## Puentes JS ↔ Nativo (MainActivity.java)

ZCode debe mantener estos puentes al añadir features nativas. R8/ProGuard los conserva (ver `proguard-rules.pro`).

- **`AndroidClipboard.copy(text)` / `.read()`** — portapapeles nativo (navigator.clipboard no funciona en WebView sin HTTPS).
- **`AndroidShare.share(text)`** — menú compartir de Android. Usa `runOnUiThread` (las @JavascriptInterface corren en hilo de fondo), `ClipData` + `EXTRA_TEXT`. Debounce en JS evita choosers apilados. **Comportamiento por app**: Gmail/Telegram/Messages leen `EXTRA_TEXT` completo; WhatsApp impone su propio límite interno y trunca el texto a medias (no hay forma de forzarlo). Para textos >500 chars: genera un **PDF** con `android.graphics.pdf.PdfDocument` (API nativa, sin librerías), lo adjunta con `EXTRA_STREAM` vía `FileProvider`, MIME `application/pdf`, y **NO** incluye `EXTRA_TEXT` (si lo incluye, WhatsApp prioriza el texto truncado e ignora el archivo). El texto completo va en el PDF sin truncar, multi-página con wrapping automático. Textos cortos usan `EXTRA_TEXT` + `text/plain` normal.

## Flujo de trabajo (OBLIGATORIO)

### 1. Antes de tocar código
- Trabaja siempre en una **rama nueva** desde `main`: `git checkout -b <tipo>/<descripcion>` (tipos: `fix`, `feat`, `refactor`, `docs`).
- NUNCA trabajes directamente en `main`.

### 2. Reglas de edición
- **`js/` es el source.** Tras editar archivos en `js/`, sincroniza a `www/` y a `android/app/src/main/assets/public/` (es lo que ve el WebView). Capacitor no hace esto solo durante el build debug/release a menos que se ejecute `cap sync`; para cambios rápidos, copia manualmente los archivos modificados de `js/` → `www/` → `android/app/src/main/assets/public/`.
- Mantén el estilo del código existente (sin framework, ES modules, `t()` para i18n).

### 3. Verificación
- Compila y prueba antes de declarar terminado: `cd android && ./gradlew assembleDebug` (o `assembleRelease` si el usuario lo pide).
- Si el emulador está disponible, instala y prueba. Si no, deja claro al usuario que debe probar en su móvil.

### 4. Commit y push — CON CONFIRMACIÓN DEL USUARIO
- **NUNCA hagas commit ni push sin preguntar al usuario primero.** El usuario quiere testear personalmente antes de que nada entre al historial.
- Cuando la tarea esté lista para commit, propón al usuario:
  1. El mensaje del commit (formato: `<tipo>: <descripción breve>` — ej. `fix: truncamiento al compartir textos largos`)
  2. Si quiere push a la rama
- Espera su confirmación explícita antes de ejecutar `git commit` o `git push`.

### 5. Actualización de documentación
- **Si la tarea añade/cambia algo estructural** (nuevo puente nativo, nueva feature, cambio de build, nueva dependencia): actualiza este `AGENTS.md` y/o `README.md` como parte del commit.
- **Si es un bugfix aislado o cambio menor**: el mensaje del commit basta, no hace falta tocar la docs.
- El historial de commits (`git log --oneline`) es la documentación de qué se ha hecho entre sesiones — usa mensajes descriptivos.

## Comandos útiles

```bash
# Build debug
cd android && ./gradlew assembleDebug

# Build release firmado (APK en android/app/build/outputs/apk/release/)
cd android && ./gradlew assembleRelease

# Sincronizar js/ → www/ → assets (después de editar js/)
# Manual, archivo por archivo:
cp js/<archivo> www/js/<archivo>
cp js/<archivo> android/app/src/main/assets/public/js/<archivo>

# Ver historial de commits (contexto de tareas previas)
git log --oneline -20

# Instalar APK en dispositivo/emulador
adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell am start -n com.oraculounificado.app/.MainActivity
```

## Lo que NO se debe hacer

- No hacer commit en `main` directamente — siempre rama nueva.
- No subir `*.keystore`, `keystore.properties`, `.env`, `node_modules/`, `build/` (ya están en `.gitignore`).
- No usar `navigator.share()` directamente en JS — no funciona en WebView. Usar el puente `AndroidShare.share()`.
- No usar `navigator.clipboard` directamente — usar `AndroidClipboard.copy()`.
- No editar solo `www/` sin sincronizar `js/` (source of truth) — el orden correcto es editar `js/` y copiar a `www/`.

## Estado actual (última actualización: 2026-07-23)

- v1.0 subido a GitHub (commit inicial)
- Botones de copiar y compartir funcionando en Tarot y Carta Astral
- Fix de crash por choosers apilados (runOnUiThread + debounce + FLAG_ACTIVITY_NEW_TASK)
- Fix de truncamiento de textos largos al compartir (ClipData + FileProvider con .txt temporal)
- APK release firmado y verificado en emulador