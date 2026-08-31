// test/smoke-sinastria.mjs — humo del motor de sinastría (FASE 2B) en Node.
import { readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const baseHref = pathToFileURL(path.join(ROOT, 'index.html')).href;

globalThis.window = {
  location: { href: baseHref },
  AndroidLocale: { get: () => 'es' },
  addEventListener: () => {}, dispatchEvent: () => {}, removeEventListener: () => {},
};
globalThis.document = {
  addEventListener: () => {}, querySelectorAll: () => [], querySelector: () => null,
  getElementById: () => null,
  documentElement: { setAttribute: () => {}, lang: 'es' },
  body: { appendChild: () => {}, classList: { add(){}, remove(){}, contains(){ return false } } },
  head: { appendChild: () => {} },
  createElement: () => ({ style:{}, classList:{ add(){}, remove(){}, contains(){return false} }, setAttribute(){}, appendChild(){}, remove(){}, addEventListener(){}, innerHTML:'', textContent:'' }),
  createTreeWalker: () => ({ nextNode: () => null }),
};
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init && init.detail; } };
Object.defineProperty(globalThis, 'navigator', { value: { language: 'es' }, configurable: true });
globalThis.NodeFilter = { SHOW_TEXT: 4, FILTER_ACCEPT: 1, FILTER_REJECT: 2, FILTER_SKIP: 3 };

globalThis.fetch = async (url) => {
  let fp = decodeURIComponent(new URL(url).pathname);
  if (/^\/[A-Za-z]:\//.test(fp)) fp = fp.slice(1);
  return { ok: true, json: async () => JSON.parse(readFileSync(fp, 'utf8')) };
};

const { initI18n, cambiarIdioma } = await import('../js/i18n/i18n.js?v=72');
await initI18n();

const { calcularSinastria, calcularCartaCompuesta, SIGNOS } = await import('../js/core/astrologia.js?v=72');

// Cartas sintéticas: posiciones por longitud absoluta
function P(nombre, lon, retro = false) {
  const info = { signo: SIGNOS[Math.floor(lon / 30)] };
  return { nombre, longitud: lon % 360, signo: info.signo, grados: Math.floor(lon % 30), minutos: 0, retro, color: '#fff' };
}
function mkCarta(nombre, planetas, desconocida) {
  const asc = 100, mc = 200;
  const cusps = Array.from({ length: 12 }, (_, i) => (asc + i * 30) % 360);
  const casasInfo = cusps.map((c, i) => ({ numero: i + 1, longitud: c, signo: SIGNOS[Math.floor(c / 30) % 12], grados: 0, minutos: 0, esAngulo: false, etiqueta: '' }));
  planetas.forEach(p => {
    p.casa = ((Math.floor(((p.longitud - asc + 360) % 360) / 30)) % 12) + 1;
    p.esAngulo = [1, 10].includes(p.casa);
  });
  const chiron = planetas.find(p => p.nombre === 'Chiron');
  return {
    nombre, desconocida: !!desconocida, planetas, casasInfo,
    aspectos: [], asc, mc,
    partOfFortune: { longitud: 50, signo: SIGNOS[1] },
    southNode: { longitud: 245, signo: SIGNOS[8] },
    estadisticas: { masculine: 6, feminine: 6, cardinal: 4, fixed: 4, mutable: 4, fuego: 3, tierra: 3, aire: 3, agua: 3 },
  };
}
// Marte de A (10°) □ Saturno de B (100.5°) → orbe 0.5°, par clásico añadido
const cartaA = mkCarta('Ana', [
  P('Sun', 25), P('Moon', 70), P('Mercury', 30), P('Venus', 45), P('Mars', 10),
  P('Jupiter', 150), P('Saturn', 120), P('Uranus', 250), P('Neptune', 260), P('Pluto', 210),
  P('N Node', 65), P('Lilith', 190), P('Chiron', 88),
]);
const cartaB = mkCarta('Luis', [
  P('Sun', 55), P('Moon', 95), P('Mercury', 40), P('Venus', 46.8), P('Mars', 78),
  P('Jupiter', 160), P('Saturn', 100.5), P('Uranus', 252), P('Neptune', 262), P('Pluto', 212),
  P('N Node', 80), P('Lilith', 200), P('Chiron', 130),
]);
// cartaB2: igual pero SIN el Saturno en cuadratura (Saturno a 300°, sin aspecto con Marte)
const cartaB2 = mkCarta('Luis2', cartaB.planetas.map(p => p.nombre === 'Saturn' ? P('Saturn', 320) : p));

let ok = true;
const check = (cond, msg) => { console.log((cond ? 'PASS' : 'FAIL') + ' — ' + msg); ok = ok && !!cond; };

const r1 = calcularSinastria(cartaA, cartaB);
const r2 = calcularSinastria(cartaA, cartaB2);

check(r1.factores.length === 8, '8 factores con hora conocida');
check(!r1.sinHora, 'sinHora=false cuando ambas tienen hora');
const est1 = r1.factores.find(f => f.key === 'estabilidad');
const est2 = r2.factores.find(f => f.key === 'estabilidad');
check(est1.score < est2.score, `Marte□Saturno baja Estabilidad (${est1.score} < ${est2.score})`);
const q1 = r1.factores.find(f => f.key === 'quimica');
const q2 = r2.factores.find(f => f.key === 'quimica');
console.log(`  quimica r1=${q1.score} r2=${q2.score} | global r1=${r1.globalScore} r2=${r2.globalScore}`);
check(r1.aspectosCruzados.some(a => (a.p1 === 'Mars' && a.p2 === 'Saturn') || (a.p2 === 'Mars' && a.p1 === 'Saturn')), 'aspecto Marte-Saturno detectado');
check(r1.factorAspectos.emocional.some(a => a.p1 === 'Chiron' || a.p2 === 'Chiron'), 'Quirón alimenta sectores (emocional)');

// Quincuncio glosario: tAspecto('Quincunx') traducido (lee datos-maestros)
const { tAspecto } = await import('../js/i18n/i18n.js?v=72');
check(tAspecto('Quincunx') === 'Quincuncio', 'tAspecto Quincunx traducido (es)');

// Hora desconocida
const cartaBsin = mkCarta('Luis', cartaB.planetas.map(p => ({ ...p })), true);
const r3 = calcularSinastria(cartaA, cartaBsin);
check(r3.sinHora === true, 'sinHora=true con una carta sin hora');
check(r3.factores.length === 7, 'solo 7 factores sin hora (sin Compromiso)');
check(Math.abs(r3.factores.reduce((a, f) => a + f.peso, 0) - 1) < 0.001, 'pesos renormalizados a 1');
check(!r3.aspectosCruzados.some(a => a.p1 === 'I ASC' || a.p2 === 'I ASC' || a.p1 === 'X MC' || a.p2 === 'X MC'), 'sin contactos con ángulos en cruces');
check(r3.overlays.length === 0 && r3.casasDestacadas.length === 0, 'sin overlays/casas destacadas');
check(r3.cartaCompuesta.asc === null && r3.cartaCompuesta.mc === null, 'compuesta sin ASC/MC');
check(r3.promptDataText.includes('NO interpretes casas'), 'prompt IA con nota de hora desconocida');
check(r1.promptDataText.includes('ASPECTOS MÁS EXACTOS'), 'prompt IA con aspectosTop (hora conocida)');
check(r1.promptDataText.match(/ASC compuesto: \d+°\d+' [A-ZÁÉÍ]/), 'compuesta ASC con signo+grado');
console.log(`  sinHora global r3=${r3.globalScore}`);

// i18n del fallback: fraseFactor traducido
const { fraseFactor } = await import('../js/core/sinastria-dictionary.js?v=72');
await cambiarIdioma('en');
const fEn = fraseFactor('quimica', 80, 'facilidad');
check(/Attraction and passion/.test(fEn), 'fraseFactor traducido a inglés');

process.exit(ok ? 0 : 1);
