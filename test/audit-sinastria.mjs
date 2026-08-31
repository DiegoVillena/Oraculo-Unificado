// test/audit-sinastria.mjs — AUDITORÍA CIEGA del motor de sinastría (rama vs main).
//
// Misión: reproducir el síntoma reportado por Diego ("Diego×Fran puntúa muy bajo
// en Emocional y Mental aunque la app muestra esos sectores casi todo positivo"),
// cuantificar qué componente del motor contribuye qué magnitud, y comprobar la
// coherencia entre lo que la UI muestra (factorDetalle, top 3 por barra) y lo
// que el motor puntúa (media ponderada de TODOS los aspectos del sector).
//
// Uso (desde la raíz del repo):  node test/audit-sinastria.mjs
// Datos: test/_tmp-fran-data.json (dump real del localStorage: fran=c[10], diego=c[12]).
// Motores: rama = ../js/core/astrologia.js?v=72 ; main = ./_astr-main.mjs
//   (snapshot `git show main:js/core/astrologia.js` con el import de i18n repuntado).

import { readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const baseHref = pathToFileURL(path.join(ROOT, 'index.html')).href;

// ---- stubs idénticos a smoke-sinastria.mjs ----
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

const { initI18n } = await import('../js/i18n/i18n.js?v=72');
await initI18n();

const rama = await import('../js/core/astrologia.js?v=72');
const main = await import('./_astr-main.mjs');

const data = JSON.parse(readFileSync('test/_tmp-fran-data.json', 'utf8'));
const DIEGO = data.diego, FRAN = data.fran;

// ---- Copias locales de los helpers internos del motor (para descomponer pesos;
//      son funciones puras de orb/nombres — se copian verbatim del fuente) ----
function factorOrbe(orb) { if (orb<=1) return 1.0; if (orb<=3) return 0.75; if (orb<=5) return 0.5; return 0.2; }
function _pesoOrb(orb) { if (orb<=1) return 1.0; if (orb<=2) return 0.85; if (orb<=3) return 0.65; if (orb<=4) return 0.45; if (orb<=5) return 0.3; return 0.15; }
function _pesoPlaneta(nombre) {
  const p = { Sun:1.0, Moon:0.95, 'I ASC':0.9, Mercury:0.9, Venus:0.9, Mars:0.85, 'X MC':0.85,
    Jupiter:0.7, Saturn:0.7, 'N Node':0.6, Uranus:0.55, Neptune:0.5, Pluto:0.5 };
  return p[nombre] ?? 0.6;
}
const _pesoPlanetaPar = (p1, p2) => Math.max(_pesoPlaneta(p1), _pesoPlaneta(p2));

const ORDEN = ['quimica','emocional','mental','espiritual','estabilidad','valores','transformacion','compromiso'];

function fmtFactorTable(r, titulo) {
  console.log(`\n=== ${titulo} ===`);
  console.log(`globalScore=${r.globalScore} (${r.compatibilidadLabel})  sinHora=${!!r.sinHora}`);
  console.log(' sector           score nivel      peso   contribución');
  for (const k of ORDEN) {
    const f = r.factores.find(x => x.key === k);
    if (!f) { console.log(` ${k.padEnd(15)}  (ausente)`); continue; }
    console.log(` ${k.padEnd(15)}  ${String(f.score).padStart(4)}  ${(f.nivel||'').padEnd(8)} ${String((f.peso*100).toFixed(1)).padStart(5)}%  ${String(f.contribucion).padStart(4)}`);
  }
}

function fmtSector(r, k, titulo) {
  console.log(`\n--- ${titulo} — aspectos que ALIMENTAN el sector (motor devuelve factorAspectos) ---`);
  const lista = (r.factorAspectos && r.factorAspectos[k]) || [];
  if (!lista.length) { console.log('  (ninguno — score de base 50 + refuerzos overlay)'); return; }
  // Recrea la media ponderada para verificar coherencia con el score final.
  let suma = 0, wsum = 0;
  for (const o of lista) {
    const w = _pesoOrb(o.orb) * _pesoPlanetaPar(o.p1, o.p2);
    suma += o.delta * w; wsum += w; // o.delta = round(c); aproximación suficiente
    const signoUI = o.friccion ? '≈' : (o.armonico ? '+' : '−');
    const signoReal = o.delta >= 0 ? '+' : '-';
    const marca = signoUI !== signoReal && !(o.friccion && o.delta >= 0) ? '   <<< UI muestra ' + signoUI + ' pero el delta real es ' + signoReal : '';
    console.log(`  ${String(o.p1).padEnd(9)} ${String(o.tipo).padEnd(12)} ${String(o.p2).padEnd(9)} orbe=${o.orb.toFixed(2).padStart(6)}  delta=${String(o.delta).padStart(4)}  arm=${o.armonico?1:0} fric=${o.friccion?1:0}  w=${w.toFixed(3)}${marca}`);
  }
  const scoreDeAspectos = 50 + (suma / wsum) * 2.3;
  console.log(`  media ponderada ≈ ${(suma/wsum).toFixed(2)} → scoreDeAspectos ≈ ${scoreDeAspectos.toFixed(1)}  (score final sector=${r.factores.find(f=>f.key===k).score}; la diferencia son refuerzos de overlay)`);
}

function fmtOverlays(r, titulo) {
  console.log(`\n--- ${titulo} — refuerzo por overlays (planeta en casa) ---`);
  const CASA_A_FACTOR = { 1:'emocional',4:'emocional',3:'mental',5:'quimica',7:'compromiso',8:'quimica',9:'espiritual',10:'estabilidad',12:'espiritual' };
  const porSector = {};
  for (const ov of r.overlays || []) {
    if (!ov.planetaPersonal) continue;
    let fac, puntos;
    if (ov.planeta === 'Venus' && (ov.casaEnA === 5 || ov.casaEnA === 7)) { fac = 'valores'; puntos = ov.refuerzo * 0.5; }
    else if (ov.planeta === 'Pluto') { fac = 'transformacion'; puntos = ov.refuerzo * 0.5; }
    else { fac = CASA_A_FACTOR[ov.casaEnA]; puntos = ov.refuerzo * 0.35; if (fac === 'compromiso') fac = null; }
    if (fac) porSector[fac] = (porSector[fac] || 0) + puntos;
    console.log(`  ${String(ov.planeta).padEnd(9)} de ${ov.origen} → casa ${String(ov.casaEnA).padStart(2)}  refuerzo=${ov.refuerzo}  → ${fac || '(sin sector)'} ${fac ? '+'+puntos.toFixed(1) : ''}`);
  }
  console.log('  Resumen refuerzos: ' + Object.entries(porSector).map(([k,v]) => `${k}+${v.toFixed(1)}`).join('  '));
}

// ════════════════════════════════════════════════════════════════
// 1) RAMA vs MAIN — Diego(A) × Fran(B)
// ════════════════════════════════════════════════════════════════
const rRama = rama.calcularSinastria(DIEGO, FRAN);
const rMain = main.calcularSinastria(DIEGO, FRAN);
fmtFactorTable(rRama, 'RAMA (feat/mejora-fallbacks-locales, ?v=72) — DiegoVO × Fran');
fmtFactorTable(rMain, 'MAIN (motor anterior, ?v=69) — DiegoVO × Fran');

console.log('\n════════════════ COMPARATIVA RAMA vs MAIN ════════════════');
console.log(' sector           rama   main    delta');
for (const k of ORDEN) {
  const a = rRama.factores.find(x => x.key === k), b = rMain.factores.find(x => x.key === k);
  console.log(` ${k.padEnd(15)}  ${String(a ? a.score : '—').padStart(4)}  ${String(b ? b.score : '—').padStart(4)}  ${(a && b) ? String(a.score - b.score).padStart(5) : ''}`);
}
console.log(` global           ${String(rRama.globalScore).padStart(4)}  ${String(rMain.globalScore).padStart(4)}  ${String(rRama.globalScore - rMain.globalScore).padStart(5)}`);

fmtSector(rRama, 'emocional', 'RAMA · EMOCIONAL');
fmtSector(rRama, 'mental',    'RAMA · MENTAL');
fmtSector(rMain, 'emocional', 'MAIN · EMOCIONAL');
fmtSector(rMain, 'mental',    'MAIN · MENTAL');
fmtOverlays(rRama, 'RAMA');
fmtOverlays(rMain, 'MAIN');

// ════════════════════════════════════════════════════════════════
// 2) Desglose interno del sector EMOCIONAL (rama): base×fOrb×mult + elem + maitri
//    Se recomputa con copias locales para validar que el audit es fiel al motor.
// ════════════════════════════════════════════════════════════════
console.log('\n════════════════ VERIFICACIÓN ARITMÉTICA (rama, Diego×Fran) ════════════════');
for (const k of ['emocional','mental']) {
  const lista = (rRama.factorAspectos && rRama.factorAspectos[k]) || [];
  let suma = 0, wsum = 0;
  for (const o of lista) {
    const w = _pesoOrb(o.orb) * _pesoPlanetaPar(o.p1, o.p2);
    suma += o.delta * w; wsum += w;
  }
  const est = 50 + (suma / wsum) * 2.3;
  const real = rRama.factores.find(f=>f.key===k).score;
  console.log(` ${k}: estimación con delta redondeado=${est.toFixed(1)} vs score motor=${real} (diff ≈ refuerzos overlay + redondeo de delta)`);
}

// ════════════════════════════════════════════════════════════════
// 3) Coherencia UI: qué muestran las barras (top 3 en orden de inserción)
//    vs la puntuación real.
// ════════════════════════════════════════════════════════════════
console.log('\n════════════════ COHERENCIA UI (rama): barras top-3 vs score ════════════════');
for (const k of ['emocional','mental']) {
  const det = (rRama.factorDetalle && rRama.factorDetalle[k]) || [];
  const score = rRama.factores.find(f=>f.key===k).score;
  const todos = (rRama.factorAspectos && rRama.factorAspectos[k]) || [];
  const negativos = todos.filter(o => o.delta < 0).length;
  console.log(` ${k}: score=${score}; barra muestra ${Math.min(3, det.length)} de ${det.length} aspectos; ${negativos} aspectos con delta NEGATIVO en el sector`);
  det.slice(0,3).forEach(d => console.log('   barra> ' + d));
}

// ════════════════════════════════════════════════════════════════
// 4) Orden inverso Fran(A) × Diego(B): ¿el síntoma depende del orden?
// ════════════════════════════════════════════════════════════════
const rInv = rama.calcularSinastria(FRAN, DIEGO);
fmtFactorTable(rInv, 'RAMA — Fran × DiegoVO (orden inverso)');

console.log('\n[fin de auditoría — motor]');
