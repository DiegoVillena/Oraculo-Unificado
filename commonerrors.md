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