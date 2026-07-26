# PROMPT PARA ZCODE — Oráculo Unificado

## Contexto del proyecto

Soy Diego, desarrollador de **Oráculo Unificado**, una app híbrida Android (Capacitor) que combina tres disciplinas oraculares: **Tarot Rider-Waite**, **I Ching** y **Carta Astral**. El proyecto está en `C:\Users\Diego\Desktop\OraculoUnificado`.

## Stack tecnológico

- **Frontend**: HTML5 + CSS3 + JavaScript ES Modules (sin framework, vanilla JS)
- **Empaquetado**: Capacitor (Android APK)
- **Backend de cálculo astral**: Swiss Ephemeris 2.10.03 (WASM) — `js/swisseph/`
- **Base de datos de ciudades**: 1.446 ciudades en `js/data/cities.js` con zonas horarias IANA
- **Persistencia**: localStorage (tiradas y cartas guardadas)
- **Build APK**: `npx cap copy android && cd android && ./gradlew assembleDebug`
- **JDK 17**, Android SDK, Node 22, Windows 10
- **Servidor dev**: `python server.py` en `http://127.0.0.1:8765` con headers no-cache

## Estructura de archivos (5.826 líneas total)

```
OraculoUnificado/
├── index.html              (174 líneas) — Estructura de la app, pestañas, formularios
├── styles.css              (1.060 líneas) — Todos los estilos, animaciones, responsive
├── server.py               — Servidor HTTP de desarrollo
├── js/
│   ├── main.js             (140 líneas) — Entry point, imports, window.__app (guardar/ver tiradas y cartas)
│   ├── storage.js          (81 líneas) — localStorage: tiradas y cartas guardadas
│   ├── astronomy.js        — Librería astronomy-engine (cosinekitty) para cálculos astronómicos
│   ├── swisseph/           — Swiss Ephemeris 2.10.03 WASM
│   │   ├── swisseph.js
│   │   ├── swisseph.wasm
│   │   ├── swisseph-browser.js
│   │   └── ephe/            — Archivos de efemérides (sepl_18, etc.)
│   ├── core/
│   │   ├── astrologia.js    (427 líneas) — Cálculo de carta astral: planetas, casas, aspectos, rueda SVG
│   │   └── analysis.js      (416 líneas) — Análisis holístico Tarot + I Ching
│   ├── data/
│   │   ├── cities.js       (1.532 líneas) — 1.446 ciudades con lat/lon/tzIANA
│   │   ├── tarot-data.js    (25 líneas) — Baraja de 78 cartas, posiciones Cruz Celta, hexagramas I Ching
│   │   ├── tarot-kb.js      (472 líneas) — Conocimiento interpretativo del Tarot
│   │   ├── iching-kb.js     (467 líneas) — Conocimiento interpretativo del I Ching
│   │   └── iching-svg.js    (80 líneas) — Generación SVG de hexagramas
│   └── ui/
│       ├── astral.js        (440 líneas) — Formulario carta astral, animación constelaciones, tabla unificada
│       ├── tarot.js         (402 líneas) — Tiradas de Tarot, I Ching, visualizar tirada guardada
│       ├── modal.js         (89 líneas) — Modales de información
│       └── tabs.js          (21 líneas) — Cambio de pestañas
├── img/tarot/              — 78 imágenes JPG de cartas Rider-Waite (130MB)
├── android/                — Proyecto Capacitor/Gradle
└── www/                    — Copia sincronizada para servir (mirror de la raíz)
```

## Estado actual — Qué está implementado

### Tarot
- 3 tipos de tirada: 1 carta, 3 cartas, Cruz Celta (10 cartas)
- Baraja completa de 78 cartas con imágenes Rider-Waite en `img/tarot/`
- Animación de barajado (8 cartas con efecto riffle, 2.5s)
- Animación de reparto (cardDeal con stagger 0.05-0.95s)
- Nombres de cartas en español ("Suma Sacerdotisa" en vez de "Sacerdotisa")
- Layout Cruz Celta: cruz izquierda + bastón derecha, grid responsivo 3x4
- Layout 3 cartas: siempre horizontal, flex 1/3 cada una
- Análisis holístico Tarot + I Ching
- Guardar/ver/borrar tiradas con visualización completa (botón 👁️)
- Nombres de cartas en español del estilo "Suma Sacerdotisa" (no "Sacerdotisa")

### I Ching
- Generación aleatoria de 6 líneas (monedas virtuales)
- Hexagrama principal + hexagrama futuro (si hay mutación)
- 64 hexagramas con conocimiento interpretativo
- SVG visual de hexagramas
- Integración con tiradas de Tarot

### Carta Astral
- **Swiss Ephemeris 2.10.03** para cálculos planetarios (precisión quirúrgica)
- Planetas: Sol, Luna, Mercurio, Venus, Marte, Júpiter, Saturno, Urano, Neptuno, Plutón, Nodo N, Quirón, Lilith, ASC, MC
- Casas: sistema Placidus con 12 cúspides
- Aspectos: conjunción, sextil, cuadratura, trígono, oposición (con orbes)
- Part of Fortune y South Node (traducidos: "Camino de la Fortuna y Nodo Sur")
- Diagrama de la rueda astral en SVG interactivo (clic en planetas/signos/casas para info)
- Tabla unificada de planetas + casas con nombres en español
- Equilibrio elemental (Fuego/Tierra/Aire/Agua, Cardinal/Fijo/Mutable, Masculino/Femenino)
- Tabla de aspectos colapsable (botón "▸ Mostrar tabla")
- Offset de zona horaria usando Intl.DateTimeFormat con timeZoneName:'shortOffset'
- 1.446 ciudades con coordenadas reales y zonas IANA

### Animaciones
- **Barajado tarot**: 8 cartas, efecto riffle (split→interleave→bridge→collect), 2.5s
- **Reparto cartas**: cardDeal keyframe con scale+rotate+blur, stagger escalonado
- **Constelaciones carta astral**: 3 constelaciones reales aleatorias en secuencia, estrellas de 5 puntas, líneas violeta, fondo oscuro, texto "Descifrando el cielo..." abajo centrado, mínimo 1.5s
- **Fondo de estrellas**: dos capas (.stars-static con twinkle + .stars-moving con drift 120s)
- **Texto dorado**: gradiente 5 paradas (#fce99a→#b8901a) con background-clip:text y dual text-shadow

### Guardar/Cargar
- **Tiradas**: se guardan con datos completos (cartas + I Ching + pregunta), se pueden visualizar con botón 👁️
- **Cartas astrales**: se guardan con datos completos (objeto `c`), al visualizar regenera el diagrama SVG completo

## Convenciones y reglas importantes

1. **Cache busting**: TODOS los imports de ES modules llevan `?v=N` (actualmente v=10). Al modificar archivos, cambiar a v=11 en TODOS los imports (main.js, astral.js, tarot.js, index.html)
2. **Sincronizar www/** : Después de modificar archivos, copiar a `www/` y luego `npx cap copy android`
3. **Build APK**: `cd android && ./gradlew assembleDebug` → copiar a `C:\Users\Diego\Desktop\OraculoUnificado.apk`
4. **Nombres en español**: planetas, signos, cartas del tarot ("Suma Sacerdotisa"), títulos de secciones
5. **Responsive**: la app se diseñó para móviles Android primero. Usar clamp(), minmax(0,1fr), flex responsivo
6. **Sin frameworks**: vanilla JS, sin React/Vue/Angular. ES modules nativos del navegador
7. **Swiss Ephemeris**: se carga como script global (no ES module). La función `calculatePosition(jd, planetId, flags)` usa WASM
8. **Precision astral**: debe coincidir con CafeAstrology (usa Swiss Ephemeris 2.10.03 internamente)
9. **Preferencia del usuario**: prefiere reconstrucciones completas sobre parches cuando hay errores matemáticos

## Orden del output de la Carta Astral (arriba → abajo)

1. Título: "✦ Carta Astral de [nombre] ✦" o "✦ Carta Astral ✦" si no hay nombre
2. Subtítulo: fecha · hora · ciudad · UTC offset
3. Diagrama de la rueda astral (SVG interactivo)
4. Tabla unificada (planetas + casas)
5. Equilibrio Elemental
6. Camino de la Fortuna y Nodo Sur
7. Aspectos Planetarios (colapsable, botón "▸ Mostrar tabla")
8. Botones: Copiar, Guardar, Ver guardadas

## Pendientes conocidos

- Faltan ~40 imágenes de tarot por verificar (algunas pudieron fallar en la descarga de Wikimedia Commons)
- Las constelaciones de la animación podrían necesitar ajustes visuales finales
- El texto de copia de la carta astral aún usa "Part of Fortune" y "South Node" en inglés (debería estar en español)

## Cómo trabajar con este proyecto

1. **Servidor de desarrollo**: `python server.py` en puerto 8765
2. **Probar en navegador**: `http://127.0.0.1:8765/index.html?v=10`
3. **Sincronizar cambios**: copiar archivos modificados a `www/`
4. **Construir APK**: `npx cap copy android && cd android && ./gradlew assembleDebug`
5. **APK final**: `cp android/app/build/outputs/apk/debug/app-debug.apk C:\Users\Diego\Desktop\OraculoUnificado.apk`

## Sobre mí (Diego)

- Estoy en España (UTC+1 / CEST UTC+2 en verano)
- Quiero precisión quirúrgica en los cálculos astrales (match CafeAstrology)
- Prefiero autonomía total: ejecutar cambios, probar y reconstruir sin pedir permiso
- Los nombres del Tarot deben ir en español ("Suma Sacerdotisa", no "Sacerdotisa" ni "High Priestess")
- La app debe verse bien en Android, responsive, con animaciones fluidas