# commonerrors.md — Errores comunes y sus soluciones

Memoria persistente de problemas donde ZCode se ha atascado y cómo los solucionó.
**ZCode debe leer este archivo al iniciar una tarea nueva** para evitar repetir tropezones.
Actualizar al **final** de cada tarea (no durante, para no cortar el flujo).

Formato: bullet conciso. Categorizar. Sin prosa larga.

---

## Cacheo de módulos ES (version tags `?v=N`)

- **Síntoma**: Cambios en JS no se reflejan en la app. La UI muestra claves i18n literales ("tarot.seccionTarot"), o funciones nuevas no existen.
- **Causa**: El WebView cachea módulos ES por URL. Si `index.html` carga `main.js?v=17` y solo se actualizan algunos archivos a `?v=18` pero no todos, el navegador carga **dos instancias distintas** de cada módulo (una `v=17`, otra `v=18`). La instancia `v=17` de `i18n.js` no se inicializa → `t()` devuelve claves literales.
- **Solución**: Al cambiar la versión, actualizar **TODOS** los imports `?v=N` en **TODOS** los archivos `js/`, no solo los modificados. Usar `sed -i 's/?v=17/?v=18/g'` en todos los `.js` y `.html`.
- **También**: El `index.html` (raíz, `www/`, `android/app/src/main/assets/public/`) debe cargar `main.js?v=NUEVA`.

## Sincronización js/ → www/ → assets

- **Síntoma**: Cambios no se ven en la app instalada.
- **Causa**: `js/` es el source, pero el WebView carga desde `android/app/src/main/assets/public/`. Si no se sincroniza, el APK tiene archivos viejos.
- **Solución**: Tras editar `js/`, SIEMPRE copiar a `www/` y `android/app/src/main/assets/public/`:
  ```bash
  cp -r js/* www/js/
  cp -r js/* android/app/src/main/assets/public/js/
  ```
- **Verificar**: `diff js/<f> android/app/src/main/assets/public/js/<f>` debe ser idéntico.

## Imágenes de cartas (.webp)

- **Síntoma**: Las imágenes del tarot no se ven (en blanco).
- **Causa**: Las imágenes son `.webp` pero `getImgUrl` devolvía `.jpg`. El `onerror` fallback a `.svg` tampoco funcionaba.
- **Solución**: `getImgUrl` devuelve `.webp`. Los `onerror` en modal.js y tarot.js usan `.webp→.svg`.

## Plantillas i18n con placeholders rotos

- **Síntoma**: El análisis muestra `${nombreHex}`, `${cartaFuturo}` etc. como texto literal.
- **Causa**: Las plantillas en `datos-maestros-*.json` usaban placeholders (`${nombreHex}`) que no coinciden con los que el código reemplaza (`${hexName}`). Además no tenían los spans `data-term`.
- **Solución**: Los placeholders del JSON deben coincidir EXACTAMENTE con los del código. Ver `analysis.js` para la lista canónica: `${hexName}`, `${numP}`, `${trigInf}`, `${trigSup}`, `${sig}`, `${consejo}`, `${hexFName}`, `${numF}`, `${hexFSig}`, `${c1}`, `${c2}`, `${a}`, `${b}`, `${c4}`, `${c1}`, `${c2}`, `${c6}`, `${c10}`, `${c0}`, `${carta}`, `${hex}`.

## `tGlosario` singular vs plural

- **Síntoma**: El popover del glosario no se abre para planetas/signos/casas/aspectos.
- **Causa**: `data-term` usa singular (`planeta:Sun`) pero el JSON usa plural (`glosario.planetas`). `tGlosario` buscaba `g['planeta']` que no existe.
- **Solución**: `tGlosario` tiene `MAPA_PLURAL = { planeta: 'planetas', signo: 'signos', casa: 'casas', aspecto: 'aspectos', concepto: 'conceptos' }`.

## `envolverTerminos` — scope de variable `mapa`

- **Síntoma**: Error "mapa is not defined" en análisis astral.
- **Causa**: `_envolverNodosTexto(root)` usaba `mapa` que era local de `envolverTerminos(html)`.
- **Solución**: Pasar `mapa` como parámetro: `_envolverNodosTexto(tpl.content, mapa)`.

## `envolverTerminos` — medir popover oculto

- **Síntoma**: El popover se corta a la derecha de la pantalla.
- **Causa**: `_posicionar` medía `offsetWidth`/`offsetHeight` con `display: none` → devolvía 0.
- **Solución**: Añadir `.visible` temporalmente (con `visibility: hidden`) para medir, luego restaurar.

## Cartas invertidas en análisis IA

- **Síntoma**: Al pinchar una carta invertida en el análisis IA, abre el modal al derecho.
- **Causa**: La IA escribe "King of Swords Reversed" (sin paréntesis) o "El Sol (Inv)". El post-procesador solo buscaba `(Reversed)` entre paréntesis, y solo en el mismo nodo de texto.
- **Solución**: Regex `\b(Reversed|Invertida|Invertido|Inversée|Umgekehrt|Inv|Rev)\b\.?` (sin paréntesis, multilingüe). Buscar tanto en el nodo actual como en `textContent` del padre (nodos hermanos). Atributo `data-reves="1"` en el span.

## Link Ko-fi no funciona en WebView

- **Síntoma**: Click en botón de Ko-fi no hace nada.
- **Causa**: Los `<a href target="_blank">` no funcionan en WebView de Capacitor (no hay navegador integrado). Además `abrirKo-fi` con guión se interpreta como resta.
- **Solución**: Puente nativo `AndroidOpenUrl.open(url)` con `Intent.ACTION_VIEW`. Usar `addEventListener` (no `onclick` inline). Función `abrirKoFi` (sin guión) o `window.__donacion['abrirKo-fi']` (corchetes).

## Modal no se ve (falta clase `visible`)

- **Síntoma**: El modal "Acerca de" se crea pero no se ve.
- **Causa**: `modal.className = 'modal-overlay'` sin `visible`. CSS: `.modal-overlay { display: none }`, `.modal-overlay.visible { display: flex }`.
- **Solución**: `modal.className = 'modal-overlay visible'`.

## Idioma no detectado (se abre en inglés)

- **Síntoma**: La app se abre en inglés aunque el dispositivo esté en español.
- **Causa**: `navigator.language` en WebView de Capacitor devuelve `'en-US'` aunque el dispositivo esté en español.
- **Solución**: Puente nativo `AndroidLocale.get()` → `Locale.getDefault().getLanguage()`. Usarlo en `detectarIdioma()` si disponible.

## `resetMapaTerminos` al cambiar idioma

- **Síntoma**: Tras cambiar de idioma, los términos dejaban de subrayarse.
- **Causa**: El selector de idioma llamaba `cambiarIdioma()` directamente, no `window.__app.cambiarIdioma` (que tiene el wrapper con `resetMapaTerminos`).
- **Solución**: Llamar `resetMapaTerminos()` directamente en el handler del selector de idioma.

## Estructura `grupos` en datos-maestros

- **Síntoma**: Error "grupo.casas is not iterable" en análisis astral.
- **Causa**: Los `grupos` en `datos-maestros-*.json` eran arrays de strings, no objetos `{ titulo, casas: [...] }`.
- **Solución**: Reescribir `grupos` como array de objetos `{ titulo, casas }` en los 6 idiomas.

## Emulador inestable

- **Síntoma**: El emulador se cierra solo o adb no lo encuentra.
- **Solución**: `adb kill-server && adb start-server`. Arrancar con `-no-snapshot`. Esperar `sys.boot_completed=1` antes de instalar. Si sigue inestable, cerrar y reabrir.

## Depuración WebView (Chrome DevTools Protocol)

- **Cómo**: `adb forward tcp:9222 localabstract:webview_devtools_remote_<PID>` → `curl http://localhost:9222/json` → obtener `id` → WebSocket a `ws://localhost:9222/devtools/page/<id>` → `Runtime.evaluate` con `returnByValue: true`.
- **Truco**: Usar IIFE `(function(){ ... })()` en vez de `try { return ... }` para que `returnByValue` capture el resultado.
- **Requiere**: `WebView.setWebContentsDebuggingEnabled(true)` en debug builds.

## `return` huérfano en main.js (sinastria)

- **Síntoma**: La app arranca pero los tabs no responden al tap. El onboarding no se muestra. Logcat: `Uncaught SyntaxError: Illegal return statement` en `main.js`. `init()` aborta antes de `initTabs()`/`initFormularioSinastria()`.
- **Causa**: Al añadir las funciones de sinastria (`renderSinastriasGuardadas`, `verSinastriaGuardada`), la función `renderTiradasGuardadas()` perdió su declaración `function renderTiradasGuardadas() {` — el cuerpo quedó suelto en el scope del módulo, con un `return` ilegal.
- **Solución**: Añadir `function renderTiradasGuardadas() {` antes del cuerpo huérfano (línea ~339 de `main.js`). Verificar con `node --check js/main.js`.
- **Lección**: Al añadir funciones nuevas a `main.js`, cuidar los límites de las funciones existentes. `node --check` NO detecta esto (es syntax válida a nivel de archivo si el return está dentro de un bloque, pero el motor JS sí lo detecta en runtime como Illegal return). El error solo se ve en logcat del WebView.

## `alert()` bloquea el hilo JS del WebView (CDP se cuelga)

- **Síntoma**: De repente `Runtime.evaluate` vía CDP deja de responder (timeout) aunque antes funcionaba. La app parece congelada.
- **Causa**: Un `alert()`/`confirm()` nativo de Android WebView BLOQUEA el hilo JS hasta que se pulsa OK. Mientras el diálogo está visible, CDP no puede evaluar nada. Ej: el `calcular()` de sinastría mostró "Selecciona las dos cartas astrales." porque los selects estaban vacíos (índices inválidos) y eso colgó todo.
- **Solución**: Detectar el diálogo con `android_ui_describe` (buscar `android:id/message` + botón OK), tocar OK para desbloquear, y luego revalidar la causa del alert. También: al fijar índices en selects de sinastría, usar los índices REALES (opción 0 es el placeholder; las cartas empiezan en 1). Reestablecer el forward CDP tras force-stop/relaunch (`adb forward tcp:9222 localabstract:webview_devtools_remote_<PID>`).

## Caché de WebView persiste tras force-stop Y reinstalar `adb install -r`

- **Síntoma**: Tras editar un `.js`, forzar force-stop + `am start` y/o reinstalar con `-r` y relanzar, la app sigue ejecutando el CÓDIGO VIEJO (mismo error que ya corregiste).
- **Causa**: El WebView cachea módulos ES por URL (`archivo.js?v=N`). `force-stop` NO borra la caché, y `adb install -r` conserva los datos de la app (incluida la caché del WebView). Si el contenido cambia pero la URL `?v=N` es la misma, se sirve la copia cacheada obsoleta.
- **Solución**: Al cambiar contenido de un módulo, bumpear el version tag (`?v=N` → `?v=N+1`) en TODOS los archivos `.js` e `index.html` (js/, www/, assets), reconstruir el APK e instalar. NO usar `adb shell pm clear` (borraría las cartas guardadas del usuario). Para verificar qué versión carga, chequear `main.js?v=` en el `<script src>` del index.html.

## Scroll del WebView en emulador

- **Síntoma**: Los swipes no hacen scroll en el WebView, o el header se colapsa bajo el status bar haciendo los tabs inaccesibles.
- **Causa**: El WebView de Capacitor tiene su propio scroll interno. Los swipes de UIAutomator a veces no se traducen bien. Tras scroll arriba, el header fijo se pega bajo el status bar (top=66, bottom=96) y los taps no registran.
- **Solución**: Evitar `am force-stop` (reinicia el emulador a veces). Para volver al scroll top, recargar la app con `am start`. Los swipes de scroll funcionan mejor con `durationMs=400-600` y distancias de ~800px. Para tabs inaccesibles (y<100), hacer scroll abajo un poco para que el header vuelva a posición normal (~635).
## `node --check` no siempre detecta una llave sobrante en módulos ES

- **Síntoma**: Tras editar un `.js` (p. ej. reemplazar una función grande), `node --check js/foo.js` pasa OK pero el WebView lanza `SyntaxError: Unexpected token '}'` en logcat al cargar la app.
- **Causa**: `node --check` puede no validar del todo la sintaxis de ES modules (`.js` con `import/export`); una `}` sobrante a nivel de módulo puede pasar desapercibida (se parsea de forma distinta que en el motor del WebView).
- **Solución**: Al reemplazar bloques grandes de código, revisar el balance de llaves (p. ej. `grep -n '^}'` o contar `{}`). Y SIEMPRE comprobar logcat del WebView tras instalar: un `Uncaught SyntaxError: Unexpected token` en `sinastria.js?v=N` es síntoma de esto. Bumpear version tag y reinstalar para verificar la corrección.
