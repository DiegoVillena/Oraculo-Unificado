// test/smoke-astral.mjs — humo del análisis local de Carta Astral sin navegador.
// Stubs mínimos de DOM/i18n para ejecutar analizarCartaAstral en Node.
import { readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const baseHref = pathToFileURL(path.join(ROOT, 'index.html')).href;

// --- Stubs ---
globalThis.window = {
  location: { href: baseHref },
  AndroidLocale: { get: () => 'es' },
  addEventListener: () => {},
  dispatchEvent: () => {},
  removeEventListener: () => {},
};
globalThis.document = {
  addEventListener: () => {},
  querySelectorAll: () => [],
  querySelector: () => null,
  getElementById: () => null,
  documentElement: { setAttribute: () => {}, lang: 'es' },
  body: { appendChild: () => {}, classList: { add(){}, remove(){}, contains(){ return false } } },
  head: { appendChild: () => {} },
  createElement: () => ({ style:{}, classList:{ add(){}, remove(){}, contains(){return false} }, setAttribute(){}, appendChild(){}, remove(){}, addEventListener(){}, click(){}, focus(){}, blur(){}, innerHTML:'', textContent:'' }),
};
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init && init.detail; } };
Object.defineProperty(globalThis, 'navigator', { value: { language: 'es' }, configurable: true });
globalThis.NodeFilter = { SHOW_TEXT: 4, FILTER_ACCEPT: 1, FILTER_REJECT: 2, FILTER_SKIP: 3 };
// createTreeWalker sin árbol real: devuelve walker vacío (envolverTerminos queda no-op)
globalThis.document.createTreeWalker = () => ({ nextNode: () => null });

globalThis.fetch = async (url) => {
  const p = new URL(url);
  let fp = decodeURIComponent(p.pathname);
  // En Windows: /C:/Users/... → C:/Users/...
  if (/^\/[A-Za-z]:\//.test(fp)) fp = fp.slice(1);
  return { ok: true, json: async () => JSON.parse(readFileSync(fp, 'utf8')) };
};

// --- Cargar i18n ---
const i18n = await import('../js/i18n/i18n.js?v=72');
const { initI18n, cambiarIdioma } = i18n;
await initI18n();

const { analizarCartaAstral } = await import('../js/core/astrologia-analisis.js?v=72');
const { SIGNOS } = await import('../js/core/astrologia.js?v=72');

// --- Carta sintética tipo "Diego" (15/06/1990 Madrid, valores representativos) ---
const S = (i, casa) => ({ signo: SIGNOS[i], casa });
function P(nombre, signoIdx, casa, retro = false) {
  const longitud = signoIdx * 30 + 10;
  const info = { signo: SIGNOS[signoIdx] };
  return { nombre, simbolo: '☉', longitud, signo: info.signo, grados: 10, minutos: 0, retro, color: '#fff', casa, esAngulo: false };
}
const carta = {
  nombre: 'Diego', desconocida: false,
  planetas: [
    P('Sun', 3, 6), P('Moon', 8, 10), P('Mercury', 4, 6), P('Venus', 3, 5),
    P('Mars', 0, 4), P('Jupiter', 9, 12), P('Saturn', 9, 12, true),
    P('Uranus', 9, 12), P('Neptune', 9, 12), P('Pluto', 7, 11),
    P('Lilith', 1, 4), P('N Node', 10, 1), P('Chiron', 3, 6),
  ],
  casasInfo: Array.from({ length: 12 }, (_, i) => ({
    numero: i + 1, longitud: i * 30, signo: SIGNOS[i], grados: 0, minutos: 0,
    esAngulo: [1, 4, 7, 10].includes(i + 1), etiqueta: '',
  })),
  aspectos: [
    { p1: 'Sun', p2: 'Moon', tipo: 'Square', simbolo: '□', orb: 1.2 },
    { p1: 'Venus', p2: 'Mars', tipo: 'Trine', simbolo: '△', orb: 0.6 },
    { p1: 'Mercury', p2: 'Saturn', tipo: 'Opposition', simbolo: '☍', orb: 2.4 },
    { p1: 'Sun', p2: 'Venus', tipo: 'Conjunction', simbolo: '☌', orb: 3.1 },
    { p1: 'Moon', p2: 'Neptune', tipo: 'Sextile', simbolo: '⚹', orb: 1.8 },
    { p1: 'Chiron', p2: 'Sun', tipo: 'Conjunction', simbolo: '☌', orb: 0.4 },
  ],
  southNode: { signo: SIGNOS[4], grados: 10, minutos: 0 },
  partOfFortune: { signo: SIGNOS[2], grados: 5, minutos: 0 },
  asc: 25, mc: 300,
  estadisticas: { masculine: 7, feminine: 6, cardinal: 4, fixed: 4, mutable: 5, fuego: 1, tierra: 3, aire: 3, agua: 6 },
};

function revisar(html, locale) {
  const plain = html.replace(/<[^>]+>/g, ' ');
  const D = i18n.getAnalisisAstral();
  const checks = {
    'sin placeholders ${': !html.includes('${'),
    'sin undefined': !/undefined/.test(html),
    'titulos i18n (s1_titulo visible)': html.includes(D.secciones.s1_titulo) && html.includes(D.secciones.s6_titulo),
    'S4 aspectos': /(orbe|orb|Orbis) \d/.test(plain),
    'stellium casa12': /12|doce|twelfth|zwölften|realm|ámbito|Bereich/i.test(plain),
    '>=900 palabras': plain.trim().split(/\s+/).length >= 900,
  };
  const palabras = plain.trim().split(/\s+/).length;
  const fails = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);
  console.log(`[${locale}] palabras=${palabras} ${fails.length ? 'FALLOS: ' + fails.join(' | ') : 'TODO OK'}`);
  if (html.includes('${')) {
    const m = plain.match(/\$\{[^}]*\}/g);
    console.log('  placeholders visibles:', m && m.slice(0, 5));
  }
  return !fails.length;
}

let ok = true;
ok = revisar(analizarCartaAstral(carta), 'es') && ok;

await cambiarIdioma('en');
ok = revisar(analizarCartaAstral(carta), 'en') && ok;

await cambiarIdioma('de');
ok = revisar(analizarCartaAstral(carta), 'de') && ok;

process.exit(ok ? 0 : 1);
