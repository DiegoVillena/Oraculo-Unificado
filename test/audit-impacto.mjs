// test/audit-impacto.mjs — Impacto del bug de _fuerzaEnCasa/_casaOverlay en TODAS
// las cartas guardadas reales (13 cartas → 156 pares ordenados).
// Compara tres motores sobre los mismos datos:
//   rama = js/core/astrologia.js?v=72        (bug presente)
//   fix  = test/_astr-fix.mjs                (rama + clamp frac 0..1 — SOLO medición)
//   main = test/_astr-main.mjs               (motor previo, sin la regla de cúspide 5°)
// Uso: node test/audit-impacto.mjs   (desde la raíz del repo)
// Datos: test/_tmp-all-cartas.json — regenerar con
//   node test/cdp-eval.mjs test/probe-dump-cartas.js > test/_tmp-all-cartas.json

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
  if (/^\/\/[A-Za-z]:\//.test(fp)) fp = fp.slice(1);
  else if (/^\/[A-Za-z]:\//.test(fp)) fp = fp.slice(1);
  return { ok: true, json: async () => JSON.parse(readFileSync(fp, 'utf8')) };
};

const { initI18n } = await import('../js/i18n/i18n.js?v=72');
await initI18n();
const rama = await import('../js/core/astrologia.js?v=72');
const fix  = await import('./_astr-fix.mjs');
const main = await import('./_astr-main.mjs');

const { cartas, sinastrias } = JSON.parse(readFileSync('test/_tmp-all-cartas.json', 'utf8'));
const ORDEN = ['quimica','emocional','mental','espiritual','estabilidad','valores','transformacion','compromiso'];

const score = (r, k) => { const f = r.factores.find(x => x.key === k); return f ? f.score : null; };

// Detector del bug: overlay con refuerzo NEGATIVO (fuerza < 0 es imposible sin el bug)
const overlaysBug = (r) => (r.overlays || []).filter(o => o.refuerzo < 0);

console.log('════════ IMPACTO GLOBAL: 13×12 = 156 pares ordenados ════════');
let afectados = 0;
let maxDropGlobal = 0, maxDropSector = { v: 0, sector: '' }, sampleMax = null;
const dropsPorSector = Object.fromEntries(ORDEN.map(k => [k, { n: 0, suma: 0, max: 0 }]));
const peores = [];
for (let i = 0; i < cartas.length; i++) {
  for (let j = 0; j < cartas.length; j++) {
    if (i === j) continue;
    const A = cartas[i], B = cartas[j];
    const rb = rama.calcularSinastria(A, B);
    const rf = fix.calcularSinastria(A, B);
    const bug = overlaysBug(rb);
    const dGlobal = rf.globalScore - rb.globalScore;
    if (bug.length) afectados++;
    if (dGlobal > maxDropGlobal) maxDropGlobal = dGlobal;
    if (dGlobal > 0) peores.push({ par: `${A.nombre}×${B.nombre}`, dGlobal, nBug: bug.length });
    for (const k of ORDEN) {
      const a = score(rb, k), f = score(rf, k);
      if (a == null || f == null) continue;
      const d = f - a;
      if (d > 0) { dropsPorSector[k].n++; dropsPorSector[k].suma += d; dropsPorSector[k].max = Math.max(dropsPorSector[k].max, d); }
      if (d > maxDropSector.v) maxDropSector = { v: d, sector: k, par: `${A.nombre}×${B.nombre}` };
    }
  }
}
console.log(`Pares ordenados con $\u2265$1 overlay bugueado (refuerzo<0): ${afectados}/156 (${(afectados/156*100).toFixed(1)}%)`);
console.log(`Drop máximo del % global causado por el bug: -${maxDropGlobal} puntos`);
console.log(`Drop máximo de un sector: -${maxDropSector.v} en ${maxDropSector.sector} (${maxDropSector.par})`);
console.log('\nDrop por sector (solo pares donde el sector cayó):');
for (const k of ORDEN) {
  const s = dropsPorSector[k];
  if (!s.n) continue;
  console.log(` ${k.padEnd(15)} afectados=${String(s.n).padStart(3)}  drop medio=${(s.suma/s.n).toFixed(1)}  drop máx=${s.max}`);
}
peores.sort((a, b) => b.dGlobal - a.dGlobal);
console.log('\nTop 8 pares más castigados (global):');
peores.slice(0, 8).forEach(p => console.log(`  -${p.dGlobal}  ${p.par}  (${p.nBug} overlays bugueados)`));

console.log('\n════════ MUESTRAS PEDIDAS: Diego×Fran, Diego×Ainoa, Diego×Paula ════════');
const byName = Object.fromEntries(cartas.map(c => [(c.nombre || '').trim(), c]));
for (const [a, b] of [['DiegoVO','Fran'], ['DiegoVO','Ainoa'], ['DiegoVO','Paula'], ['Fran','Paula'], ['Fran','Ainoa']]) {
  const A = byName[a], B = byName[b];
  const rb = rama.calcularSinastria(A, B), rf = fix.calcularSinastria(A, B), rm = main.calcularSinastria(A, B);
  console.log(`\n── ${a} × ${b} ──  (overlays bugueados en rama: ${overlaysBug(rb).map(o => `${o.planeta}@${o.origen}→c${o.casaEnA}=${o.refuerzo}`).join(', ') || 'ninguno'})`);
  console.log(' sector           rama    fix   main');
  for (const k of ORDEN) {
    console.log(` ${k.padEnd(15)}  ${String(score(rb,k)).padStart(4)}  ${String(score(rf,k)).padStart(4)}  ${String(score(rm,k)).padStart(4)}`);
  }
  console.log(` global           ${String(rb.globalScore).padStart(4)}  ${String(rf.globalScore).padStart(4)}  ${String(rm.globalScore).padStart(4)}`);
}

console.log('\n════════ LAS 12 SINASTRÍAS GUARDADAS (valor almacenado = motor del 22-ago) vs rama y fix ════════');
for (const s of sinastrias) {
  const [na, nb] = (s.titulo || '').split(' 💞 ');
  const A = byName[(na || '').trim()], B = byName[(nb || '').trim()];
  if (!A || !B) { console.log(`  ${s.titulo}: cartas no encontradas`); continue; }
  const rb = rama.calcularSinastria(A, B), rf = fix.calcularSinastria(A, B);
  console.log(`  ${s.titulo.padEnd(24)} guardado=${String(s.global).padStart(3)}  rama=${String(rb.globalScore).padStart(3)}  fix=${String(rf.globalScore).padStart(3)}  (rama−fix=${rb.globalScore - rf.globalScore})`);
}
console.log('\n[fin impacto]');
