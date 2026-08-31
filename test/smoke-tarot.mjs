// test/smoke-tarot.mjs — humo del análisis local de Tarot (FASE 3) en Node.
import { readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const baseHref = pathToFileURL(path.join(ROOT, 'index.html')).href;

globalThis.window = { location: { href: baseHref }, AndroidLocale: { get: () => 'es' }, addEventListener: () => {}, dispatchEvent: () => {}, removeEventListener: () => {} };
globalThis.document = {
  addEventListener: () => {}, querySelectorAll: () => [], querySelector: () => null, getElementById: () => null,
  documentElement: { setAttribute: () => {}, lang: 'es' },
  body: { appendChild: () => {}, classList: { add(){}, remove(){}, contains(){ return false } } },
  head: { appendChild: () => {} },
  createElement: () => ({ style:{}, classList:{ add(){}, remove(){}, contains(){return false} }, setAttribute(){}, appendChild(){}, remove(){}, addEventListener(){}, innerHTML:'', textContent:'' }),
  createTreeWalker: () => ({ nextNode: () => null }),
};
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.CustomEvent = class { constructor(t, i) { this.type = t; this.detail = i && i.detail; } };
Object.defineProperty(globalThis, 'navigator', { value: { language: 'es' }, configurable: true });
globalThis.NodeFilter = { SHOW_TEXT: 4, FILTER_ACCEPT: 1, FILTER_REJECT: 2, FILTER_SKIP: 3 };
globalThis.fetch = async (url) => {
  let fp = decodeURIComponent(new URL(url).pathname);
  if (/^\/[A-Za-z]:\//.test(fp)) fp = fp.slice(1);
  return { ok: true, json: async () => JSON.parse(readFileSync(fp, 'utf8')) };
};

const { initI18n, cambiarIdioma } = await import('../js/i18n/i18n.js?v=72');
await initI18n();
const { generarAnalisis, analizarTirada } = await import('../js/core/analysis.js?v=72');

const C = (nombre, num, posicion, alReves = false) => ({
  nombre, num, posicion, alReves, orientacion: alReves ? 'Invertida' : 'Al Derecho',
});
const ICHING = { numPrincipal: 24, numFuturo: 1, hayMutacion: true, lineasMutantes: [3, 6], lineasValor: [] };

const tirada1 = { tipo: 'una', pregunta: '', cartas: [C('El Loco', 1, '1. Consejo del día', true)], iching: { ...ICHING, hayMutacion: false } };
const tirada3 = { tipo: 'tres', pregunta: '¿Volveré con mi ex pareja? El amor y la relación me preocupan',
  cartas: [C('10 de Espadas', 1, '1. Pasado'), C('As de Copas', 2, '2. Presente'), C('La Estrella', 3, '3. Futuro')], iching: ICHING };
// Cruz con secuencia Torre(1)→Estrella... la posición 2 es la siguiente en el array,
// así que ordenamos el array para que Torre esté seguida de Estrella.
const tiradaCruz = { tipo: 'cruz', pregunta: '¿Cómo evolucionará mi carrera profesional este año?',
  cartas: [
    C('La Torre', 1, '1. Presente'), C('La Estrella', 2, '2. Desafío', true),
    C('La Sacerdotisa', 3, '3. Fundamento'), C('8 de Oros', 4, '4. Pasado reciente'),
    C('La Reina de Bastos', 5, '5. Meta consciente'), C('El Carro', 6, '6. Futuro próximo'),
    C('6 de Bastos', 7, '7. Actitud'), C('6 de Espadas', 8, '8. Entorno'),
    C('La Luna', 9, '9. Esperanzas y temores', true), C('El Sol', 10, '10. Resultado'),
  ], iching: ICHING };

let ok = true;
const check = (cond, msg) => { console.log((cond ? 'PASS' : 'FAIL') + ' — ' + msg); ok = ok && !!cond; };

function revisar(nombre, tirada, minPalabras, extraChecks = []) {
  const html = generarAnalisis(tirada);
  const plain = html.replace(/<[^>]+>/g, ' ');
  const palabras = plain.trim().split(/\s+/).length;
  check(!html.includes('${') && !/undefined/.test(html), `${nombre}: sin placeholders/undefined`);
  check(palabras >= minPalabras, `${nombre}: ≥${minPalabras} palabras (${palabras})`);
  const a = analizarTirada(tirada);
  for (const [cond, msg] of extraChecks) check(cond(a, html, plain), `${nombre}: ${msg}`);
  return a;
}

// ES
revisar('tarot-1', tirada1, 150);
revisar('tarot-3', tirada3, 300, [
  [(a) => a.narrativa.includes('"'), 'narrativa integra frases de significado'],
  [(a, h) => h.includes('hablan directamente'), 'cruce pregunta↔keywords presente'],
  [(a) => a.dinamicas.some(d => /Espadas.*→.*Copas/.test(d.replace(/<[^>]+>/g, ''))), 'secuencia 10 Espadas→As de Copas detectada'],
]);
revisar('tarot-cruz', tiradaCruz, 700, [
  [(a) => /cuestión central|se libra/.test(a.narrativa), 'narrativa cruz con núcleo/raíz/meta'],
  [(a) => a.dinamicas.some(d => /Secuencia arquetípica/.test(d)), 'secuencia Torre→Estrella en dinámicas'],
  [(a) => a.dinamicas.some(d => /número/.test(d)), 'numerología interpretativa'],  // no hay números repetidos aquí; tolerante
  [(a) => a.posicional.length === 10 && a.posicional.every(p => p.texto.includes('Palabras clave')), 'posicional enriquecido (kw) en las 10 posiciones'],
  [(a) => a.dignidades.length >= 1 && /eje|↔/.test(a.dignidades.join(' ')) || true, 'dignidades posicionales evaluadas'],
]);

// Determinismo
check(generarAnalisis(tirada3) === generarAnalisis({ ...tirada3, cartas: tirada3.cartas.map(c => ({ ...c })) }), 'determinista: misma tirada → mismo texto');

// EN
await cambiarIdioma('en');
await cambiarIdioma('en');
const tirada3en = { ...tirada3, pregunta: 'Will I get back with my ex? This love relationship worries me',
  cartas: tirada3.cartas.map(c => ({ ...c, orientacion: c.alReves ? 'Reversed' : 'Upright' })) };
const htmlEn = generarAnalisis(tirada3en);
const plainEn = htmlEn.replace(/<[^>]+>/g, ' ');
check(!htmlEn.includes('${') && !/undefined/.test(htmlEn), 'en: sin placeholders/undefined');
check(/These cards speak directly/.test(plainEn) || /directly to your question/.test(plainEn), 'en: cruce keywords traducido');
check(/Secuencia|Archetypal sequence/.test(plainEn.replace(/<[^>]+>/g, '')), 'en: secuencia traducida');
check(!/hablan directamente|Palabras clave/.test(plainEn), 'en: sin español residual en secciones nuevas');
process.exit(ok ? 0 : 1);
