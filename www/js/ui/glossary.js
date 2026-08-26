// js/ui/glossary.js — Términos técnicos seleccionables (popover + modal)
// Hace que cualquier elemento con data-term="tipo:clave" sea tapable.
//   tarot:El Loco   → abre el modal existente (abrirModal)
//   iching:7        → abre el modal I Ching existente (abrirModalIching)
//   planeta:Sol     → popover flotante con descripción breve
//   signo:0         → popover flotante (índice 0-11)
//   casa:5          → popover flotante (1-12)
//   aspecto:Conjunction → popover flotante
// La clave siempre es canónica (español para tarot, inglés para planetas/
// aspectos, índice para signos, número para casas). El texto visible es la
// traducción al idioma actual; data-term desacopla identidad de presentación.

import { t, tGlosario, tCarta, tSigno, tAspecto, getIdioma } from '../i18n/i18n.js?v=69';
import { SIGNOS, PLANETAS_UI } from '../core/astrologia.js?v=69';
import { barajaTarot } from '../data/tarot-data.js?v=69';

let popoverEl = null;
let terminoActivoEl = null;   // elemento del término actualmente abierto
let historialPush = false;    // ¿hemos hecho pushState para el popover?

// === INICIALIZACIÓN ===
// Instala event delegation global: cualquier elemento [data-term] generado
// dinámicamente (análisis local, análisis IA, tabla astral) responde al tap
// sin necesidad de reasignar handlers.
export function inicializarGlosario() {
  // Tap en un término
  document.addEventListener('click', (e) => {
    const term = e.target.closest('[data-term]');
    if (term) {
      e.preventDefault();
      e.stopPropagation();
      manejarTapTermino(term);
      return;
    }
    // Tap fuera de un término → cerrar popover si estaba abierto
    if (popoverEl && popoverEl.classList.contains('visible')) {
      if (!popoverEl.contains(e.target)) cerrarPopover();
    }
  }, true); // capture: intercepta antes que otros handlers

  // Cerrar popover al hacer scroll (evita que quede flotando desubicado)
  window.addEventListener('scroll', cerrarPopover, { passive: true });
  // Cerrar popover al cambiar tamaño/orientación
  window.addEventListener('resize', cerrarPopover, { passive: true });
  // Botón atrás de Android: si el popover está abierto, lo cierra
  window.addEventListener('popstate', () => {
    if (popoverEl && popoverEl.classList.contains('visible')) {
      _cerrarVisualPopover();
    }
  });

  // Exponer API para onclick inline (si fuera necesario)
  window.__glossary = { abrirPopover, cerrarPopover, manejarTapTermino };

  console.log('✦ Glosario inicializado (términos seleccionables)');
}

// === MANEJAR TAP EN UN TÉRMINO ===
function manejarTapTermino(elTerm) {
  const dataTerm = elTerm.getAttribute('data-term');
  if (!dataTerm) return;
  const idx = dataTerm.indexOf(':');
  if (idx < 0) return;
  const tipo = dataTerm.slice(0, idx);
  const clave = dataTerm.slice(idx + 1);

  // Si hay popover abierto y se tapa el mismo término, se cierra (toggle)
  if (terminoActivoEl === elTerm && popoverEl && popoverEl.classList.contains('visible')) {
    cerrarPopover();
    return;
  }

  // Cartas de Tarot e I Ching: abrir modal existente (no popover)
  if (tipo === 'tarot') {
    cerrarPopover();
    if (window.__tarotUI && window.__tarotUI.abrirModal) {
      // data-reves="1" indica que la carta está invertida en este contexto
      const alReves = elTerm.getAttribute('data-reves') === '1';
      window.__tarotUI.abrirModal(clave, alReves, '');
    }
    return;
  }
  if (tipo === 'iching') {
    cerrarPopover();
    const num = parseInt(clave, 10);
    if (!isNaN(num) && window.__tarotUI && window.__tarotUI.abrirModalIching) {
      window.__tarotUI.abrirModalIching(num);
    }
    return;
  }

  // Términos astrológicos: popover flotante
  abrirPopover(tipo, clave, elTerm);
}

// === ABRIR POPOVER ===
export function abrirPopover(tipo, clave, hostEl) {
  // Resolver título y descripción desde el glosario (i18n)
  const entry = tGlosario(tipo, clave);
  if (!entry) {
    // Sin descripción disponible: no abrir popover vacío
    console.warn(`glossary: sin entrada para ${tipo}:${clave}`);
    return;
  }

  // Título legible según el tipo (traducido al idioma actual)
  let titulo = entry.titulo;
  if (tipo === 'planeta') titulo = _nombrePlanetaDisplay(clave);
  else if (tipo === 'signo') titulo = _nombreSignoDisplay(clave);
  else if (tipo === 'casa') titulo = _nombreCasaDisplay(clave);
  else if (tipo === 'aspecto') titulo = _nombreAspectoDisplay(clave);
  else if (tipo === 'concepto') {
    // Para conceptos, capitalizar la primera letra del título
    titulo = entry.titulo.charAt(0).toUpperCase() + entry.titulo.slice(1);
  }

  // Crear (o reutilizar) el elemento popover
  let primero = false;
  if (!popoverEl) {
    popoverEl = document.createElement('div');
    popoverEl.className = 'glossary-popover';
    popoverEl.setAttribute('role', 'dialog');
    popoverEl.addEventListener('click', (e) => e.stopPropagation());
    document.body.appendChild(popoverEl);
    primero = true;
  }
  const btnCerrarTxt = t('glossary.cerrar') || 'Cerrar';
  popoverEl.innerHTML =
    `<button id="btn-cerrar-glosario" class="gl-cerrar" aria-label="${btnCerrarTxt}">&times;</button>` +
    `<div class="gl-titulo">${titulo}</div>` +
    `<div class="gl-desc">${entry.desc}</div>`;

  // Listener del botón cerrar
  popoverEl.querySelector('.gl-cerrar').addEventListener('click', cerrarPopover);

  // Posicionar antes de mostrar para medir correctamente
  _posicionar(hostEl);

  // Mostrar
  popoverEl.classList.add('visible');
  terminoActivoEl = hostEl;

  // Historial: botón atrás cierra el popover en lugar de salir de la app
  if (!historialPush) {
    history.pushState({ glossary: true }, '');
    historialPush = true;
  }
}

// === POSICIONAMIENTO DEL POPOVER ===
// Coloca el popover junto al término, flippando arriba/abajo si queda cortado.
function _posicionar(hostEl) {
  const r = hostEl.getBoundingClientRect();
  const POPOVER_MAX_W = 280;
  const MARGEN = 8;

  // Para medir el popover necesitamos que esté visible (display: block).
  // Si está oculto, lo mostramos temporalmente con visibility: hidden para
  // que ocupe espacio sin verse, medimos, y luego lo ocultamos de nuevo.
  const estabaOculto = !popoverEl.classList.contains('visible');
  if (estabaOculto) {
    popoverEl.classList.add('visible');
    popoverEl.style.visibility = 'hidden';
  }

  popoverEl.style.maxWidth = POPOVER_MAX_W + 'px';
  popoverEl.style.left = '0px';
  popoverEl.style.top = '0px';
  const w = popoverEl.offsetWidth;
  const h = popoverEl.offsetHeight;

  // Centro horizontal del término
  let left = r.left + (r.width / 2) - (w / 2);
  // Clamp horizontal dentro de viewport con márgenes
  const vw = window.innerWidth;
  if (left < MARGEN) left = MARGEN;
  if (left + w > vw - MARGEN) left = vw - MARGEN - w;
  if (left < MARGEN) left = MARGEN; // por si w > viewport

  // Vertical: preferentemente debajo del término; si no cabe, arriba
  let abajo = r.bottom + MARGEN;
  let arriba = r.top - MARGEN - h;
  let top;
  const vh = window.innerHeight;
  if (abajo + h <= vh - MARGEN) {
    top = abajo;
  } else if (arriba >= MARGEN) {
    top = arriba;
  } else {
    // No cabe ni arriba ni abajo: poner debajo y dejar que scrollee dentro
    top = abajo;
  }

  popoverEl.style.left = left + 'px';
  popoverEl.style.top = top + 'px';

  if (estabaOculto) {
    // Restaurar estado oculto: abrirPopover añadirá .visible después
    popoverEl.classList.remove('visible');
    popoverEl.style.visibility = '';
  }
}

// === CERRAR POPOVER ===
export function cerrarPopover() {
  if (!popoverEl || !popoverEl.classList.contains('visible')) return;
  _cerrarVisualPopover();
  // Consumir la entrada de historial creada al abrir
  if (historialPush) {
    historialPush = false;
    // history.back() dispara popstate; como ya cerramos visualmente, el handler
    // popstate no vuelve a cerrar. Así el historial queda limpio.
    history.back();
  }
}

function _cerrarVisualPopover() {
  if (!popoverEl) return;
  popoverEl.classList.remove('visible');
  popoverEl.style.visibility = '';
  terminoActivoEl = null;
}

// === HELPERS DE NOMBRES PARA MOSTRAR (traducidos al idioma actual) ===
function _nombrePlanetaDisplay(clave) {
  // clave: 'Sun', 'Moon', ... → traducir
  const np = t('astral.nombresPlanetarios');
  if (np && np[clave]) return np[clave];
  return clave;
}

function _nombreSignoDisplay(clave) {
  // clave: índice 0-11
  const s = tSigno(clave);
  if (s && s.nombre) return s.nombre;
  return 'Signo ' + clave;
}

function _nombreCasaDisplay(clave) {
  // clave: 1-12. Reusar etiqueta de la tabla (astral.cuspideCasa = "Cúspide Casa {n}")
  const etiqueta = t('astral.cuspideCasa');
  if (etiqueta && etiqueta !== 'astral.cuspideCasa') {
    return etiqueta.replace('{n}', String(clave));
  }
  const romanos = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  const idx = parseInt(clave, 10) - 1;
  const rom = romanos[idx] || clave;
  return `Casa ${rom}`;
}

function _nombreAspectoDisplay(clave) {
  // clave: 'Conjunction', 'Trine', ...
  return tAspecto(clave) || clave;
}

// ============================================================
// POST-PROCESAMIENTO DE HTML: envolver términos astrológicos y
// de Tarot/I Ching en textos generados por análisis local o IA.
// Recorre los nodos de texto dentro de <p>, <li>, <h4>, <td> y
// envuelve las ocurrencias en <span class="term" data-term="...">.
// Solo actúa sobre texto plano (no atributos, no tags existentes).
// ============================================================

// Mapa nombre traducido → clave canónica, construido perezosamente.
let _mapaTerminos = null;

function _construirMapaTerminos() {
  if (_mapaTerminos) return _mapaTerminos;
  _mapaTerminos = []; // array de { regex, tipo, clave } — ordenado por longitud desc
  const loc = getIdioma();

  // Planetas: claves de PLANETAS_UI + N Node + S Node + Chiron + Lilith + ASC/MC
  const nombresPlanetarios = t('astral.nombresPlanetarios') || {};
  const planetasClaves = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','N Node','S Node','Chiron','Lilith','I ASC','X MC'];
  for (const clave of planetasClaves) {
    const display = nombresPlanetarios[clave] || clave;
    if (display) _mapaTerminos.push({ display, tipo: 'planeta', clave });
  }

  // Signos: índice 0-11, nombre traducido
  for (let i = 0; i < 12; i++) {
    const sT = tSigno(i);
    const display = sT?.nombre || SIGNOS[i].nombre;
    if (display) _mapaTerminos.push({ display, tipo: 'signo', clave: String(i) });
  }

  // Cartas de Tarot: claves de barajaTarot, nombre traducido
  for (const nombreES of barajaTarot) {
    const display = tCarta(nombreES);
    if (display) _mapaTerminos.push({ display, tipo: 'tarot', clave: nombreES });
  }

  // Aspectos: tipos en ASPECTOS_DEF
  const aspectosTipos = ['Conjunction','Sextile','Square','Trine','Opposition'];
  for (const clave of aspectosTipos) {
    const display = tAspecto(clave);
    if (display && display !== clave) _mapaTerminos.push({ display, tipo: 'aspecto', clave });
  }

  // Casas 1-12: múltiples patrones de texto ("House 10", "Casa 10",
  // "10th House", "House X", "Cúspide Casa 10", etc.)
  const romanos = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  const casaLabel = t('astral.casa') || 'House'; // "House" / "Casa" / "Maison" / etc.
  const cuspideLabel = t('astral.cuspideCasa') || 'House {n} Cusp';
  const ordinales = {
    en: ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'],
    es: ['1ª','2ª','3ª','4ª','5ª','6ª','7ª','8ª','9ª','10ª','11ª','12ª'],
    pt: ['1ª','2ª','3ª','4ª','5ª','6ª','7ª','8ª','9ª','10ª','11ª','12ª'],
    fr: ['1ère','2ème','3ème','4ème','5ème','6ème','7ème','8ème','9ème','10ème','11ème','12ème'],
    de: ['1.','2.','3.','4.','5.','6.','7.','8.','9.','10.','11.','12.'],
    it: ['1ª','2ª','3ª','4ª','5ª','6ª','7ª','8ª','9ª','10ª','11ª','12ª'],
  };
  const ords = ordinales[loc] || ordinales.en;
  for (let i = 0; i < 12; i++) {
    const num = String(i + 1);
    const rom = romanos[i];
    const ord = ords[i];
    // "House 10", "Casa 10"
    _mapaTerminos.push({ display: `${casaLabel} ${num}`, tipo: 'casa', clave: num });
    // "House X" (romano)
    _mapaTerminos.push({ display: `${casaLabel} ${rom}`, tipo: 'casa', clave: num });
    // "10th House" (ordinal + House)
    _mapaTerminos.push({ display: `${ord} ${casaLabel}`, tipo: 'casa', clave: num });
    // "Cúspide Casa 10" / "House 10 Cusp"
    _mapaTerminos.push({ display: cuspideLabel.replace('{n}', num), tipo: 'casa', clave: num });
  }

  // Conceptos astrológicos: stellium, elementos, modalidades, polaridades.
  // Se buscan por su nombre traducido en el idioma actual.
  const conceptosClaves = ['stellium','masculino','femenino','fuego','tierra','aire','agua','cardinal','fijo','mutable','medioCielo','ascendente'];
  const traduccionesConceptos = {
    es: { stellium:'Stellium', masculino:'Masculino', femenino:'Femenino', fuego:'Fuego', tierra:'Tierra', aire:'Aire', agua:'Agua', cardinal:'Cardinal', fijo:'Fijo', mutable:'Mutable', medioCielo:'Medio Cielo', ascendente:'Ascendente' },
    en: { stellium:'Stellium', masculino:'Masculine', femenino:'Feminine', fuego:'Fire', tierra:'Earth', aire:'Air', agua:'Water', cardinal:'Cardinal', fijo:'Fixed', mutable:'Mutable', medioCielo:'Midheaven', ascendente:'Ascendant' },
    pt: { stellium:'Stellium', masculino:'Masculino', femenino:'Feminino', fuego:'Fogo', tierra:'Terra', aire:'Ar', agua:'Água', cardinal:'Cardinal', fijo:'Fixo', mutable:'Mutável', medioCielo:'Meio do Céu', ascendente:'Ascendente' },
    fr: { stellium:'Stellium', masculino:'Masculin', femenino:'Féminin', fuego:'Feu', tierra:'Terre', aire:'Air', agua:'Eau', cardinal:'Cardinal', fijo:'Fixe', mutable:'Mutable', medioCielo:'Milieu du Ciel', ascendente:'Ascendant' },
    de: { stellium:'Stellium', masculino:'Männlich', femenino:'Weiblich', fuego:'Feuer', tierra:'Erde', aire:'Luft', agua:'Wasser', cardinal:'Kardinal', fijo:'Fix', mutable:'Veränderlich', medioCielo:'Medium Coeli', ascendente:'Aszendent' },
    it: { stellium:'Stellium', masculino:'Maschile', femenino:'Femminile', fuego:'Fuoco', tierra:'Terra', aria:'Aria', agua:'Acqua', cardinal:'Cardinale', fijo:'Fisso', mutable:'Mutabile', medioCielo:'Medio Cielo', ascendente:'Ascendente' },
  };
  const tc = traduccionesConceptos[loc] || traduccionesConceptos.en;
  for (const clave of conceptosClaves) {
    const display = tc[clave] || clave;
    _mapaTerminos.push({ display, tipo: 'concepto', clave });
  }

  // Ordenar por longitud de display desc: así "El Loco" se matchea antes que "Loco"
  // y "Nodo Norte" antes que "Norte". Evita matches parciales solapados.
  _mapaTerminos.sort((a, b) => b.display.length - a.display.length);
  return _mapaTerminos;
}

// Escapa regex special chars en un string literal
function _escRx(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Envolver términos en un fragmento HTML.
// Procesa solo los nodos de texto dentro de elementos de contenido
// (p, li, h4, td, strong, em, span sin data-term). No toca atributos.
export function envolverTerminos(html) {
  if (!html) return html;
  const mapa = _construirMapaTerminos();
  if (mapa.length === 0) return html;

  // Parser DOM para recorrer nodos de texto de forma segura
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  _envolverNodosTexto(tpl.content, mapa);
  return tpl.innerHTML;
}

// Recorre nodos de texto y envuelve ocurrencias. Si el nodo ya está dentro
// de un [data-term], se salta (evita doble envoltura).
function _envolverNodosTexto(root, mapa) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      // Saltar nodos vacíos o solo-whitespace
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      // Saltar si el padre ya es un [data-term] o un script/style
      const p = node.parentNode;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (p.closest && p.closest('[data-term]')) return NodeFilter.FILTER_REJECT;
      const tag = p.nodeName;
      if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodos = [];
  let n;
  while ((n = walker.nextNode())) nodos.push(n);

  for (const nodo of nodos) {
    const txt = nodo.nodeValue;
    // Regex combinado con word boundaries para evitar falsos positivos
    // (ej: "Sol" dentro de "Consolación"). Se construye una sola vez.
    // Usamos grupos de captura para los caracteres circundantes en vez de
    // lookbehind/lookahead, por compatibilidad con WebViews antiguos.
    if (!mapa._regex) {
      const pat = mapa.map(m => _escRx(m.display)).join('|');
      // (?:^|[^letra/número])(término)(?=[^letra/número]|$)
      // Usamos [A-Za-zÀ-ÿ0-9] como clase de "carácter de palabra" extendida
      // (cubre acentos del español/francés/portugués/italiano/alemán básico).
      mapa._regex = new RegExp('(^|[^A-Za-zÀ-ÿ0-9])(' + pat + ')(?=[^A-Za-zÀ-ÿ0-9]|$)', 'g');
    }
    // Resetear lastIndex antes de test (el flag g lo avanza)
    mapa._regex.lastIndex = 0;
    if (!mapa._regex.test(txt)) continue;
    mapa._regex.lastIndex = 0;
    // Para cartas de Tarot: construir el texto completo del padre para detectar
    // "(Reversed)"/"(Invertida)" que puede estar en un nodo hermano (ej: la IA
    // escribe "**4 of Cups** (Reversed)" → el nombre va en <strong> y "(Reversed)"
    // en un nodo de texto hermano).
    const textoPadre = nodo.parentNode ? nodo.parentNode.textContent : txt;
    // Reemplazar ocurrencias: para cada match, buscar qué término es.
    const htmlReemplazado = txt.replace(mapa._regex, (full, pre, match, offset, str) => {
      for (const m of mapa) {
        if (m.display === match) {
          let extra = '';
          // Solo para cartas de Tarot: buscar "(Reversed)" o "(Invertida)" después
          // del match, tanto en el nodo actual como en el texto del padre (nodos hermanos).
          if (m.tipo === 'tarot') {
            const despuesNodo = str.slice(offset + full.length, offset + full.length + 30);
            // Buscar la posición del match en el texto del padre y ver qué viene después
            const idxEnPadre = textoPadre.indexOf(match, textoPadre.indexOf(txt) >= 0 ? textoPadre.indexOf(txt) : 0);
            const despuesPadre = idxEnPadre >= 0 ? textoPadre.slice(idxEnPadre + match.length, idxEnPadre + match.length + 40) : '';
            const despuesTotal = despuesNodo + ' ' + despuesPadre;
            // La IA escribe la orientación de muchas formas según el idioma:
            //   EN: "(Reversed)", "Reversed"
            //   ES: "(Invertida)", "invertido", "(Inv)", "Inv.", "al revés"
            //   PT: "(Invertida)", "invertida", "(Inv)"
            //   FR: "(Inversée)", "inversée", "(Inv)"
            //   DE: "(Umgekehrt)", "umgekehrt", "(Rev)"
            //   IT: "(Invertita)", "invertita", "(Inv)"
            // Buscamos cualquiera de estas variantes en los 40 chars siguientes.
            if (/\b(Reversed|Invertida|Invertidas|Invertido|Invertita|Invertitë|Inversée|Inversées|Invertida|Umgekehrt|Inv|Rev)\b\.?/i.test(despuesTotal)) {
              extra = ' data-reves="1"';
            }
          }
          return `${pre}<span class="term" data-term="${m.tipo}:${m.clave}"${extra}>${match}</span>`;
        }
      }
      return full;
    });
    if (htmlReemplazado !== txt) {
      // Reemplazar el nodo de texto por un fragmento con el HTML
      const span = document.createElement('span');
      span.innerHTML = htmlReemplazado;
      nodo.parentNode.replaceChild(span, nodo);
    }
  }
}

// Resetear el mapa de términos (llamar al cambiar idioma)
export function resetMapaTerminos() {
  _mapaTerminos = null;
}