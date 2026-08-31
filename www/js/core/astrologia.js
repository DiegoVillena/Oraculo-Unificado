// ============================================================
// core/astrologia.js — Motor astrológico basado en Swiss Ephemeris
// Precisión JPL DE440 (sub-milimétrica) vía WebAssembly.
// Matching exacto con CafeAstrology / Swiss Ephemeris.
//
// Arquitectura:
// - @swisseph/browser (WASM) para efemérides planetarias, casas,
//   True Node, Mean Lilith — todo calculado nativamente por la
//   librería C original de Astrodienst.
// - Intl.DateTimeFormat con tzIANA para offset UTC/DST.
// - Part of Fortune con fórmula clásica.
// ============================================================

// === IMPORTS DINÁMICOS ===
// SwissEphemeris se carga como ES module desde js/swisseph/
let _swe = null;
let _sweReady = false;

// Constantes exportadas desde @swisseph/browser
let Planet, LunarPoint, Asteroid, HouseSystem, CalculationFlag, CalendarType;

async function initSwissEph() {
  if (_sweReady) return _swe;

  // swisseph-browser.js usa `exports` (patrón CommonJS) internamente,
  // por lo que no puede cargarse como ES module con import().
  // Lo cargamos como script clásico y usamos window.SwissEphemeris.
  if (!window.SwissEphemeris) {
    // Definir exports globalmente para que el bundle funcione
    window.exports = window.exports || {};
    window.module = window.module || { exports: window.exports };

    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = './js/swisseph/swisseph-browser.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load swisseph-browser.js'));
      document.head.appendChild(script);
    });
  }

  // El bundle pone SwissEphemeris en window
  const SwissEphemeris = window.SwissEphemeris;
  // Los enums también se exportan a window via el bundle
  // Pero el bundle usa `export {}` al final, que no funciona con script clásico.
  // Vamos a extraer los enums del objeto exports global.
  const e = window.exports || {};
  Planet = e.Planet;
  LunarPoint = e.LunarPoint;
  Asteroid = e.Asteroid;
  HouseSystem = e.HouseSystem;
  CalculationFlag = e.CalculationFlag;
  CalendarType = e.CalendarType;

  // Si los enums no están en exports, definirlos manualmente
  if (!Planet) {
    Planet = { Sun:0, Moon:1, Mercury:2, Venus:3, Mars:4, Jupiter:5, Saturn:6, Uranus:7, Neptune:8, Pluto:9 };
  }
  if (!LunarPoint) {
    LunarPoint = { MeanNode:10, TrueNode:11, MeanApogee:12, OsculatingApogee:13, InterpolatedApogee:21, InterpolatedPerigee:22 };
  }
  if (!Asteroid) {
    Asteroid = { Chiron:15 };
  }
  if (!HouseSystem) {
    HouseSystem = { Placidus:'P', Koch:'K', Porphyrius:'O', Regiomontanus:'R', Campanus:'C', Equal:'A', VehlowEqual:'V', WholeSign:'W', Meridian:'X', Azimuthal:'H', PolichPage:'T', Alcabitus:'B', Morinus:'M' };
  }
  if (!CalculationFlag) {
    CalculationFlag = { JPLEphemeris:1, SwissEphemeris:2, MoshierEphemeris:4, Heliocentric:8, TruePositions:16, J2000:32, NoNutation:64, Speed3:128, Speed:256, NoGravitationalDeflection:512, NoAberration:1024, Equatorial:2048, XYZ:4096, Radians:8192, Barycentric:16384, Topocentric:32768, Sidereal:65536, ICRS:131072, DpsidepsIAU1980:262144, JPLHorizons:524288, JPLHorizonsApprox:1048576 };
  }
  if (!CalendarType) {
    CalendarType = { Julian:0, Gregorian:1 };
  }

  _swe = new SwissEphemeris();
  // Pasar la ruta absoluta del WASM explícitamente
  const wasmUrl = new URL('./js/swisseph/swisseph.wasm', window.location.href).href;
  await _swe.init(wasmUrl);
  // Cargar efemérides estándar desde servidor local para máxima precisión
  try {
    await _swe.loadStandardEphemeris();
    console.log('✦ Swiss Ephemeris data files loaded — precision JPL DE440');
  } catch(e) {
    console.warn('Ephemeris files not loaded, using Moshier:', e.message || e);
  }
  _sweReady = true;
  return _swe;
}

export async function ensureReady() { return await initSwissEph(); }

// ============================================================
// CONSTANTES
// ============================================================
export const SIGNOS = [
  { nombre:'Aries', simbolo:'♈', elemento:'Fuego', modalidad:'Cardinal', regente:'Marte' },
  { nombre:'Tauro', simbolo:'♉', elemento:'Tierra', modalidad:'Fijo', regente:'Venus' },
  { nombre:'Géminis', simbolo:'♊', elemento:'Aire', modalidad:'Mutable', regente:'Mercurio' },
  { nombre:'Cáncer', simbolo:'♋', elemento:'Agua', modalidad:'Cardinal', regente:'Luna' },
  { nombre:'Leo', simbolo:'♌', elemento:'Fuego', modalidad:'Fijo', regente:'Sol' },
  { nombre:'Virgo', simbolo:'♍', elemento:'Tierra', modalidad:'Mutable', regente:'Mercurio' },
  { nombre:'Libra', simbolo:'♎', elemento:'Aire', modalidad:'Cardinal', regente:'Venus' },
  { nombre:'Escorpio', simbolo:'♏', elemento:'Agua', modalidad:'Fijo', regente:'Marte/Plutón' },
  { nombre:'Sagitario', simbolo:'♐', elemento:'Fuego', modalidad:'Mutable', regente:'Júpiter' },
  { nombre:'Capricornio', simbolo:'♑', elemento:'Tierra', modalidad:'Cardinal', regente:'Saturno' },
  { nombre:'Acuario', simbolo:'♒', elemento:'Aire', modalidad:'Fijo', regente:'Saturno/Urano' },
  { nombre:'Piscis', simbolo:'♓', elemento:'Agua', modalidad:'Mutable', regente:'Júpiter/Neptuno' },
];

export const CASAS_ROMANAS = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

export const ASPECTOS_DEF = [
  { angulo:0,   orb:10, nombre:'Conjunction', simbolo:'☌', clase:'asp-conj', color:'#e5e7eb' },
  { angulo:60,  orb:6,  nombre:'Sextile',    simbolo:'⚹', clase:'asp-sext', color:'#4dffb3' },
  { angulo:90,  orb:8,  nombre:'Square',     simbolo:'□', clase:'asp-square', color:'#ff5252' },
  { angulo:120, orb:8,  nombre:'Trine',      simbolo:'△', clase:'asp-trine', color:'#5ab8ff' },
  { angulo:150, orb:2.5, nombre:'Quincunx',  simbolo:'⚻', clase:'asp-quincunx', color:'#c0a0ff' },
  { angulo:180, orb:10, nombre:'Opposition',  simbolo:'☍', clase:'asp-opp', color:'#ff8a3d' },
];

export const PLANETAS_UI = {
  Sun:{simbolo:'☉',color:'#ffd700'}, Moon:{simbolo:'☽',color:'#c0c5d0'},
  Mercury:{simbolo:'☿',color:'#ff8a3d'}, Venus:{simbolo:'♀',color:'#4dffb3'},
  Mars:{simbolo:'♂',color:'#ff5252'}, Jupiter:{simbolo:'♃',color:'#ffaa3d'},
  Saturn:{simbolo:'♄',color:'#d4af37'}, Uranus:{simbolo:'♅',color:'#5ab8ff'},
  Neptune:{simbolo:'♆',color:'#4d8aff'}, Pluto:{simbolo:'♇',color:'#9c5fff'},
  Lilith:{simbolo:'☾',color:'#9a8cc0'}, 'N Node':{simbolo:'☊',color:'#d946ef'},
  Chiron:{simbolo:'⚷',color:'#7dd6c4'},
};

// Estado mutable
let ultimaCarta = null;
let ciudadSel = null;
export const getUltimaCarta = () => ultimaCarta;
export const setUltimaCarta = (d) => { ultimaCarta = d; };
export const getCiudad = () => ciudadSel;
export const setCiudad = (c) => { ciudadSel = c; };

// ============================================================
// UTILIDADES
// ============================================================
export function gradosASigno(lon) {
  const l = ((lon % 360) + 360) % 360;
  const idx = Math.floor(l / 30);
  const enSigno = l % 30;
  const g = Math.floor(enSigno);
  const m = Math.floor((enSigno - g) * 60);
  return { longitud:l, signo:SIGNOS[idx], grados:g, minutos:m };
}

function casaDelPlaneta(lon, cusps) {
  const l = ((lon%360)+360)%360;
  for (let i = 0; i < 12; i++) {
    let ini = ((cusps[i]%360)+360)%360;
    let fin = ((cusps[(i+1)%12]%360)+360)%360;
    if (fin <= ini) fin += 360;
    let ll = l; if (ll < ini) ll += 360;
    if (ll >= ini && ll < fin) return i + 1;
  }
  return 1;
}

// ============================================================
// ASPECTOS
// ============================================================
function calcularAspectos(puntos) {
  const asp = [];
  for (let i = 0; i < puntos.length; i++) {
    for (let j = i+1; j < puntos.length; j++) {
      let diff = Math.abs(puntos[i].longitud - puntos[j].longitud);
      if (diff > 180) diff = 360 - diff;
      for (const def of ASPECTOS_DEF) {
        const orb = Math.abs(diff - def.angulo);
        // Algunos puntos (Quirón) acotan su orbe para no generar ruido
        const cap = Math.min(puntos[i].orbMax ?? 99, puntos[j].orbMax ?? 99);
        if (orb <= Math.min(def.orb, cap)) {
          asp.push({
            p1: puntos[i].nombre, p2: puntos[j].nombre,
            tipo: def.nombre, simbolo: def.simbolo,
            anguloExacto: def.angulo, anguloReal: diff, orb,
            clase: def.clase, color: def.color
          });
          break;
        }
      }
    }
  }
  return asp;
}

// ============================================================
// PART OF FORTUNE
// ============================================================
function esCartaDiurna(solLon, cusps) { return casaDelPlaneta(solLon, cusps) >= 7; }

function calcularPartOfFortune(asc, sol, luna, diurna) {
  let pof = diurna ? (asc + luna - sol) : (asc + sol - luna);
  pof %= 360; if (pof < 0) pof += 360;
  return pof;
}

// ============================================================
// STATS
// ============================================================
function calcularStats(planetas) {
  let masc=0, fem=0, card=0, fix=0, mut=0;
  let fuego=0, tierra=0, aire=0, agua=0;
  const stats = planetas.filter(p =>
    ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'].includes(p.nombre)
  );
  for (const p of stats) {
    const el = p.signo.elemento, mod = p.signo.modalidad;
    if (el==='Fuego'){fuego++;masc++;} else if(el==='Aire'){aire++;masc++;}
    else if(el==='Tierra'){tierra++;fem++;} else if(el==='Agua'){agua++;fem++;}
    if (mod==='Cardinal') card++; else if(mod==='Fijo') fix++; else if(mod==='Mutable') mut++;
  }
  return {masculine:masc,feminine:fem,cardinal:card,fixed:fix,mutable:mut,fuego,tierra,aire,agua};
}

// ============================================================
// TEXTO — Formato CafeAstrology
// ============================================================
import { t, tSigno, tAspecto, tPais } from '../i18n/i18n.js?v=72';

// Helper: nombre del signo traducido
function _sn(signoObj) {
  const idx = SIGNOS.indexOf(signoObj);
  if (idx >= 0) { const sT = tSigno(idx); if (sT?.nombre) return sT.nombre; }
  return signoObj.nombre;
}
// Helper: nombre de planeta traducido
function _pn(nombreEN) {
  const np = t('astral.nombresPlanetarios');
  return (np && typeof np === 'object' && np[nombreEN]) ? np[nombreEN] : nombreEN;
}

export function generarTextoCarta(d) {
  let txt = "Zodiac : Tropical\t\tPlacidus Orb : 0\n";
  const max = Math.max(d.planetas.length, d.casasInfo.length);
  for (let i = 0; i < max; i++) {
    let line = '';
    if (i < d.planetas.length) {
      const p = d.planetas[i];
      line += _pn(p.nombre) + '\t' + _sn(p.signo) + '\t' + p.grados + '°' +
        p.minutos.toString().padStart(2,'0') + "'" + (p.retro ? ' R' : '');
    }
    if (i < d.casasInfo.length) {
      const c = d.casasInfo[i];
      const etq = c.esAngulo ? c.etiqueta : CASAS_ROMANAS[c.numero-1];
      line += '\t' + etq + '\t' + _sn(c.signo) + '\t' + c.grados + '°' +
        c.minutos.toString().padStart(2,'0') + "'";
    }
    txt += line + '\n';
  }
  txt += '\n';
  for (const p of d.planetas) {
    const rom = CASAS_ROMANAS[p.casa-1];
    const ang = p.esAngulo ? ' ' + p.etiquetaAngulo : '';
    txt += _pn(p.nombre) + '\tin\t' + rom + ang + '\n';
  }
  return txt;
}

// ============================================================
// INTERPRETACIÓN
// ============================================================
export function generarInterpretacion(d) {
  const sol = d.planetas.find(p=>p.nombre==='Sun');
  const luna = d.planetas.find(p=>p.nombre==='Moon');
  const asc = d.casasInfo.find(c=>c.numero===1);
  const mc = d.casasInfo.find(c=>c.numero===10);
  let h = '';
  if (sol) h += `<p><span class="int-label">☉ ${_pn('Sun')} ${t('astrologia.en')} ${_sn(sol.signo)}:</span> ${t('astrologia.solDesc')} ${t('astrologia.casa')} ${sol.casa}.</p>`;
  if (luna) h += `<p><span class="int-label">☽ ${_pn('Moon')} ${t('astrologia.en')} ${_sn(luna.signo)}:</span> ${t('astrologia.lunaDesc')} ${t('astrologia.casa')} ${luna.casa}.</p>`;
  if (asc) h += `<p><span class="int-label">${t('astrologia.ascendente')} ${_sn(asc.signo)}:</span> ${t('astrologia.ascDesc')}</p>`;
  if (mc) h += `<p><span class="int-label">MC ${_sn(mc.signo)}:</span> ${t('astrologia.mcDesc')}</p>`;
  const imp = d.aspectos.filter(a => (a.tipo==='Conjunction'||a.tipo==='Opposition'||a.tipo==='Square') && a.orb < 4);
  if (imp.length > 0) {
    h += '<p><span class="int-label">' + t('astrologia.aspectosDest') + ':</span> ';
    imp.slice(0,5).forEach((a,i) => { if(i>0)h+='; '; h+=`${_pn(a.p1)} ${a.simbolo} ${_pn(a.p2)} (${tAspecto(a.tipo)}, orb ${a.orb.toFixed(1)}°)`; });
    h += '.</p>';
  }
  if (d.partOfFortune) {
    const pf = d.partOfFortune;
    h += `<p><span class="int-label">${t('astrologia.parteFortuna')}:</span> ${_sn(pf.signo)} ${pf.grados}°${pf.minutos.toString().padStart(2,'0')}'.</p>`;
  }
  return h;
}

// ============================================================
// RUEDA SVG
// ============================================================
export function generarRuedaSVG(d) {
  const cx=250, cy=250, rExt=230, rSig=215, rCas=175, rAsp=165, rPlan=195, rNum=155;
  let s = '';
  s += `<circle cx="${cx}" cy="${cy}" r="${rExt}" fill="none" stroke="#e8c46a" stroke-width="1.2"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${rSig}" fill="none" stroke="#e8c46a" stroke-width="1.2"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${rCas}" fill="none" stroke="#e8c46a" stroke-width="1.2"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${rAsp}" fill="none" stroke="#e8c46a" stroke-width="0.5" opacity="0.3"/>`;
  const ascLon = d.casasInfo[0].longitud;
  function lon2xy(lon, r) {
    const a = ((180-(lon-ascLon))%360+360)%360 * Math.PI/180;
    return { x: cx+r*Math.cos(a), y: cy-r*Math.sin(a) };
  }
  for (let i=0;i<12;i++){const p1=lon2xy(i*30,rCas),p2=lon2xy(i*30,rExt);s+=`<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="rgba(232,196,106,0.4)" stroke-width="0.8"/>`;}
  for (let j=0;j<12;j++){const c=d.casasInfo[j];const p1=lon2xy(c.longitud,rAsp),p2=lon2xy(c.longitud,rExt);s+=`<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="rgba(232,196,106,0.6)" stroke-width="1" style="cursor:pointer" onclick="window.__astroUI.mostrarInfoCasa(${j})"/>`;}
  for (let k=0;k<12;k++){const p=lon2xy(k*30+15,(rExt+rSig)/2);s+=`<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="middle" fill="#e8c46a" font-size="16" style="cursor:pointer" onclick="window.__astroUI.mostrarInfoSigno(${k})">${SIGNOS[k].simbolo}</text>`;}
  for (let l=0;l<12;l++){const cu=d.casasInfo[l].longitud,cuN=d.casasInfo[(l+1)%12].longitud;let mid=(cu+cuN)/2;if(cuN<cu)mid=((cu+cuN+360)/2)%360;const p=lon2xy(mid,rNum);s+=`<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="middle" fill="#e8c46a" font-size="11" font-weight="bold" style="cursor:pointer" onclick="window.__astroUI.mostrarInfoCasa(${l})">${l+1}</text>`;}
  d.planetas.forEach((p,idx)=>{const pp=lon2xy(p.longitud,rPlan);const off=idx*3;const ar=Math.atan2(pp.y-cy,pp.x-cx);const px=pp.x+Math.cos(ar+Math.PI/2)*(off-15);const py=pp.y+Math.sin(ar+Math.PI/2)*(off-15);s+=`<circle cx="${pp.x}" cy="${pp.y}" r="3" fill="${p.color||'#fff0a8'}" style="cursor:pointer" onclick="window.__astroUI.mostrarInfoPlaneta(${idx})"/>`;s+=`<text x="${px}" y="${py}" text-anchor="middle" dominant-baseline="middle" fill="${p.color||'#fff0a8'}" font-size="13" font-weight="bold" style="cursor:pointer" onclick="window.__astroUI.mostrarInfoPlaneta(${idx})">${p.simbolo}</text>`;});
  d.aspectos.forEach((a,idx)=>{const p1=d.planetas.find(p=>p.nombre===a.p1),p2=d.planetas.find(p=>p.nombre===a.p2);if(!p1||!p2)return;const pa=lon2xy(p1.longitud,rAsp*0.7),pb=lon2xy(p2.longitud,rAsp*0.7);s+=`<line x1="${pa.x}" y1="${pa.y}" x2="${pb.x}" y2="${pb.y}" stroke="${a.color}" stroke-width="1" opacity="0.7" style="cursor:pointer" onclick="window.__astroUI.mostrarInfoAspecto(${idx})"/>`;});
  s += `<text x="${cx}" y="${cy-5}" text-anchor="middle" font-size="18" fill="#e8c46a" font-family="serif">✦</text>`;
  s += `<text x="${cx}" y="${cy+15}" text-anchor="middle" font-size="9" fill="#9a8cc0" font-family="serif">${(d.nombre||'Carta').substring(0,15)}</text>`;
  return s;
}

// ============================================================
// CÁLCULO PRINCIPAL — calcularCartaAstral
// Usa Swiss Ephemeris WASM para TODO:
//   - Posiciones planetarias (longitud eclíptica tropical)
//   - True Node, Mean Lilith (puntos lunares nativos de Swiss Eph)
//   - Casas Placidus, ASC, MC (swe_houses nativo)
// ============================================================
export async function calcularCartaAstral(params) {
  const { nombre='', dia, mes, ano, hora, min, desconocida=false, ciudad, offsetReal=null } = params;
  if (!ciudad) throw new Error('Se requiere ciudad de nacimiento');

  const swe = await ensureReady();

  const mesReal = mes + 1;
  const fechaISO = ano + '-' + String(mesReal).padStart(2,'0') + '-' + String(dia).padStart(2,'0');
  const horaStr = String(hora).padStart(2,'0') + ':' + String(min).padStart(2,'0');
  const horaFinal = desconocida ? '12:00' : horaStr;
  const offset = offsetReal !== null ? offsetReal : 0;
  const lat = ciudad.lat, lon = ciudad.lon;

  // Calcular día juliano UTC
  // Swiss Ephemeris usa JD en Tiempo Universal (UT)
  const [y, m2, d2] = fechaISO.split('-').map(Number);
  const [h2, mi2] = horaFinal.split(':').map(Number);
  const utcHour = (h2 - offset) + mi2 / 60;
  const jd = swe.julianDay(y, m2, d2, utcHour, CalendarType.Gregorian);

  // Flags: Swiss Ephemeris + Speed (para retrogradación)
  // Si los archivos de efemérides no se cargaron, usa Moshier automáticamente
  let flags = CalculationFlag.SwissEphemeris | CalculationFlag.Speed;
  // Si loadStandardEphemeris falló, SwissEphemeris flag cae a Moshier

  // === POSICIONES PLANETARIAS ===
  const planetasData = [
    { body: Planet.Sun,     nombre:'Sun',     simbolo:'☉', color:'#ffd700' },
    { body: Planet.Moon,    nombre:'Moon',    simbolo:'☽', color:'#c0c5d0' },
    { body: Planet.Mercury, nombre:'Mercury', simbolo:'☿', color:'#ff8a3d' },
    { body: Planet.Venus,   nombre:'Venus',   simbolo:'♀', color:'#4dffb3' },
    { body: Planet.Mars,    nombre:'Mars',    simbolo:'♂', color:'#ff5252' },
    { body: Planet.Jupiter, nombre:'Jupiter', simbolo:'♃', color:'#ffaa3d' },
    { body: Planet.Saturn,  nombre:'Saturn',  simbolo:'♄', color:'#d4af37' },
    { body: Planet.Uranus,  nombre:'Uranus',  simbolo:'♅', color:'#5ab8ff' },
    { body: Planet.Neptune, nombre:'Neptune', simbolo:'♆', color:'#4d8aff' },
    { body: Planet.Pluto,   nombre:'Pluto',   simbolo:'♇', color:'#9c5fff' },
  ];

  const planetas = planetasData.map(p => {
    const pos = swe.calculatePosition(jd, p.body, flags);
    const info = gradosASigno(pos.longitude);
    return {
      nombre: p.nombre, simbolo: p.simbolo,
      longitud: pos.longitude, signo: info.signo,
      grados: info.grados, minutos: info.minutos,
      retro: pos.longitudeSpeed < 0, color: p.color
    };
  });

  // === LILITH (Mean Apogee = LunarPoint.MeanApogee = 12) ===
  const liliPos = swe.calculatePosition(jd, LunarPoint.MeanApogee, flags);
  const liliInfo = gradosASigno(liliPos.longitude);
  planetas.push({
    nombre: 'Lilith', simbolo: '☾',
    longitud: liliPos.longitude, signo: liliInfo.signo,
    grados: liliInfo.grados, minutos: liliInfo.minutos,
    retro: liliPos.longitudeSpeed < 0, color: '#9a8cc0'
  });

  // === TRUE NODE (TrueNode = 11) ===
  const nodePos = swe.calculatePosition(jd, LunarPoint.TrueNode, flags);
  const nodeInfo = gradosASigno(nodePos.longitude);
  planetas.push({
    nombre: 'N Node', simbolo: '☊',
    longitud: nodePos.longitude, signo: nodeInfo.signo,
    grados: nodeInfo.grados, minutos: nodeInfo.minutos,
    retro: nodePos.longitudeSpeed < 0, color: '#d946ef'
  });

  // === QUIRÓN (asteroide; Swiss Ephemeris id 15) ===
  // Orbe acotado (5°) para no ensuciar la tabla de aspectos natales.
  // Si la build WASM no lo soporta, la carta se calcula sin él.
  try {
    const chironPos = swe.calculatePosition(jd, Asteroid.Chiron, flags);
    const chInfo = gradosASigno(chironPos.longitude);
    planetas.push({
      nombre: 'Chiron', simbolo: '⚷', orbMax: 5,
      longitud: chironPos.longitude, signo: chInfo.signo,
      grados: chInfo.grados, minutos: chInfo.minutos,
      retro: chironPos.longitudeSpeed < 0, color: '#7dd6c4'
    });
  } catch (e) { console.warn('Quirón no disponible:', e.message || e); }

  // === CASAS PLACIDUS (nativo de Swiss Ephemeris) ===
  const houseData = swe.calculateHouses(jd, lat, lon, HouseSystem.Placidus);
  const asc = houseData.ascendant;
  const mc = houseData.mc;
  // cusps es un array de 13 elementos (index 0 sin usar, 1-12 son las cúspides)
  const cusps = [];
  for (let i = 1; i <= 12; i++) cusps.push(houseData.cusps[i]);

  const etiquetasAngulo = {1:'I ASC',4:'IV',7:'VII DSC',10:'X MC'};
  const casasInfo = cusps.map((c, i) => {
    const info = gradosASigno(c);
    return { numero:i+1, longitud:c, signo:info.signo,
      grados:info.grados, minutos:info.minutos,
      esAngulo:!!etiquetasAngulo[i+1], etiqueta:etiquetasAngulo[i+1]||'' };
  });

  planetas.forEach(p => {
    p.casa = casaDelPlaneta(p.longitud, cusps);
    p.esAngulo = (p.casa===1 || p.casa===10);
    p.etiquetaAngulo = p.casa===1 ? 'ASC' : (p.casa===10 ? 'MC' : '');
  });

  // === ASPECTOS ===
  const puntos = planetas.slice();
  const ascInfo = gradosASigno(asc);
  puntos.push({ nombre:'I ASC', simbolo:'ASC', longitud:asc,
    signo:ascInfo.signo, grados:ascInfo.grados, minutos:ascInfo.minutos,
    retro:false, color:'#d4af37', casa:1, esAngulo:true });
  const mcInfo = gradosASigno(mc);
  puntos.push({ nombre:'X MC', simbolo:'MC', longitud:mc,
    signo:mcInfo.signo, grados:mcInfo.grados, minutos:mcInfo.minutos,
    retro:false, color:'#d4af37', casa:10, esAngulo:true });
  const aspectos = calcularAspectos(puntos);

  // === PART OF FORTUNE ===
  const solLon = planetas[0].longitud;
  const lunaLon = planetas[1].longitud;
  const diurna = esCartaDiurna(solLon, cusps);
  const pofLon = calcularPartOfFortune(asc, solLon, lunaLon, diurna);
  const pofInfo = gradosASigno(pofLon);

  // === SOUTH NODE ===
  const snLon = (nodePos.longitude + 180) % 360;
  const snInfo = gradosASigno(snLon);

  // === STATS ===
  const stats = calcularStats(planetas);

  ultimaCarta = {
    nombre, fecha:fechaISO, hora:horaFinal, desconocida,
    ciudad, tz:offset, jd,
    planetas, casasInfo, aspectos, asc, mc,
    partOfFortune: { longitud:pofLon, signo:pofInfo.signo, grados:pofInfo.grados, minutos:pofInfo.minutos },
    southNode: { longitud:snLon, signo:snInfo.signo, grados:snInfo.grados, minutos:snInfo.minutos },
    esDiurna: diurna, estadisticas: stats,
  };
  return ultimaCarta;
}

// ============================================================
// SINASTRIA — compatibilidad entre 2 cartas astrales
// ============================================================

// Exportamos casaDelPlaneta para reusar en overlays de sinastria
export function casaDelPlanetaExport(lon, cusps) {
  return casaDelPlaneta(lon, cusps);
}

// --- Cálculo de aspectos CRUZADOS (planetas de A × planetas de B) ---
// Devuelve el mismo formato que calcularAspectos, pero cada aspecto lleva
// el origen de cada planeta ('A' o 'B') para distinguirlos en la UI.
export function calcularAspectosSinastria(puntosA, puntosB) {
  // Orb máximo por tipo de cuerpo (filtro de ruido generacional):
  // - Ángulos (ASC/MC): 4° (sensibles a la hora de nacimiento).
  // - Planeta Personal × Planeta Personal: orbes estándar (def.orb).
  // - Personal × Lento/Nodos/Quirón: máx 5° (6° si conjunción con luminaria Sol/Luna).
  // - Lento × Lento generacional (Urano/Neptuno/Plutón entre sí): máx 1.5° (partil).
  // - Quincuncio (150°): solo entre planetas personales, orbe máx 2.5°.
  const ANGLE_ORB_MAX = 4;
  const PERSONAL = new Set(['Sun','Moon','Mercury','Venus','Mars']);
  const SLOW_GEN = new Set(['Uranus','Neptune','Pluto']);
  const esAngulo = n => n === 'I ASC' || n === 'X MC';
  const maxOrbFor = (orb, p1, p2, def) => {
    if (def.nombre === 'Quincunx') {
      // Quincuncio solo entre planetas personales, orbe 2.5°.
      return (PERSONAL.has(p1) && PERSONAL.has(p2)) ? Math.min(def.orb, 2.5) : -1;
    }
    if (esAngulo(p1) || esAngulo(p2)) return Math.min(def.orb, ANGLE_ORB_MAX);
    const a = PERSONAL.has(p1), b = PERSONAL.has(p2);
    if (a && b) return def.orb; // personal × personal: estándar
    if (SLOW_GEN.has(p1) && SLOW_GEN.has(p2)) return Math.min(def.orb, 1.5); // generacional
    // involucra planeta lento/nodo/quirón
    const lumConj = def.nombre === 'Conjunction' && (p1 === 'Sun' || p2 === 'Sun' || p1 === 'Moon' || p2 === 'Moon');
    return Math.min(def.orb, lumConj ? 6 : 5);
  };
  const asp = [];
  for (let i = 0; i < puntosA.length; i++) {
    for (let j = 0; j < puntosB.length; j++) {
      let diff = Math.abs(puntosA[i].longitud - puntosB[j].longitud);
      if (diff > 180) diff = 360 - diff;
      for (const def of ASPECTOS_DEF) {
        const orb = Math.abs(diff - def.angulo);
        const maxOrb = maxOrbFor(orb, puntosA[i].nombre, puntosB[j].nombre, def);
        if (maxOrb >= 0 && orb <= maxOrb) {
          asp.push({
            p1: puntosA[i].nombre, p2: puntosB[j].nombre,
            origen1: 'A', origen2: 'B',
            long1: puntosA[i].longitud, long2: puntosB[j].longitud,
            tipo: def.nombre, simbolo: def.simbolo,
            anguloExacto: def.angulo, anguloReal: diff, orb,
            clase: def.clase, color: def.color
          });
          break;
        }
      }
    }
  }
  return asp;
}

// --- Factor de peso por orbe (tabla del algoritmo local) ---
// 0-1°: 100% | 1-3°: 75% | 3-5°: 50% | >5°: 20%
function factorOrbe(orb) {
  if (orb <= 1) return 1.0;
  if (orb <= 3) return 0.75;
  if (orb <= 5) return 0.5;
  return 0.2;
}

// --- Ponderación profesional del scoring (no promediar) ---
// Los expertos enfatizan los orbes muy exactos y los planetas personales:
// un aspecto definitorio (orbe estrecho + planeta personal) debe dominar el
// sector, y muchos aspectos amplios no deben diluirlo. Por eso cada aspecto
// lleva un PESO (orbe + importancia del planeta) que pondera su contribución
// en una media ponderada, en lugar de un promedio aritmético por número.
// Curva de peso por orbe (más agresiva que factorOrbe): 0-1° = 1, 1-2° = 0.85,
// 2-3° = 0.65, 3-4° = 0.45, 4-5° = 0.3, >5° = 0.15.
function _pesoOrb(orb) {
  if (orb <= 1) return 1.0;
  if (orb <= 2) return 0.85;
  if (orb <= 3) return 0.65;
  if (orb <= 4) return 0.45;
  if (orb <= 5) return 0.3;
  return 0.15;
}
// Peso de un planeta: los personales (Sol, Luna, Mercurio, Venus, Marte) y los
// ángulos pesan más que los lentos (Urano, Neptuno, Plutón).
function _pesoPlaneta(nombre) {
  const p = {
    Sun:1.0, Moon:0.95, 'I ASC':0.9, Mercury:0.9, Venus:0.9, Mars:0.85, 'X MC':0.85,
    Jupiter:0.7, Saturn:0.7, 'N Node':0.6, Uranus:0.55, Neptune:0.5, Pluto:0.5,
  };
  return p[nombre] ?? 0.6;
}
// Peso de un par: usa el planeta más importante (si hay un personal, define).
function _pesoPlanetaPar(p1, p2) {
  return Math.max(_pesoPlaneta(p1), _pesoPlaneta(p2));
}

// Clasifica un aspecto cruzado como armónico o de tensión.
// Trígonos y sextiles siempre armónicos. Cuadraturas y oposiciones siempre tensión.
// Conjunciones: armónica si ambos planetas son benéficos (Venus/Júpiter) o
// si al menos uno es luminaria personal (Sol/Luna/Mercurio/Venus); tensión si
// ambos son maléficos (Marte/Saturno/Plutón); neutra en caso mixto.
const BENEFICOS = new Set(['Sun','Moon','Mercury','Venus','Jupiter']);
const MALEFICOS = new Set(['Mars','Saturn','Pluto']);
function esAspectoArmonico(tipo, p1, p2) {
  if (tipo === 'Trine' || tipo === 'Sextile') return true;
  if (tipo === 'Square' || tipo === 'Opposition' || tipo === 'Quincunx') return false;
  // Conjunción
  const b1 = BENEFICOS.has(p1), b2 = BENEFICOS.has(p2);
  const m1 = MALEFICOS.has(p1), m2 = MALEFICOS.has(p2);
  if (m1 && m2) return false;       // dos maléficos → tensión
  if (b1 || b2) return true;         // al menos un benéfico → armónico
  return true;                        // mixto neutro → leve armónico
}

// Pesos base de cada par planetaA×planetaB para cada dimensión del radar.
// Estructura: para cada par "P1-P2" (en cualquiera de los dos órdenes) se
// asignan puntos que alimentan una o varias dimensiones.
// puntosPos = puntos que suma si el aspecto es armónico;
// puntosNeg = puntos que resta si es de tensión.
const PESOS_PARES = {
  'Venus-Mars':    { dim:'quimicaPasion',      puntosPos:18, puntosNeg:12 },
  'Mars-Venus':    { dim:'quimicaPasion',      puntosPos:18, puntosNeg:12 },
  'Sun-Mars':      { dim:'quimicaPasion',      puntosPos:8,  puntosNeg:6  },
  'Mars-Moon':     { dim:'quimicaPasion',      puntosPos:8,  puntosNeg:6  },
  'Pluto-Venus':   { dim:'quimicaPasion',      puntosPos:10, puntosNeg:8  },
  'Venus-Pluto':   { dim:'quimicaPasion',      puntosPos:10, puntosNeg:8  },
  'Sun-Venus':     { dim:'conexionEmocional',  puntosPos:14, puntosNeg:8  },
  'Venus-Sun':     { dim:'conexionEmocional',  puntosPos:14, puntosNeg:8  },
  'Moon-Moon':     { dim:'conexionEmocional',  puntosPos:20, puntosNeg:14 },
  'Moon-Venus':    { dim:'conexionEmocional',  puntosPos:16, puntosNeg:10 },
  'Venus-Moon':    { dim:'conexionEmocional',  puntosPos:16, puntosNeg:10 },
  'Sun-Moon':      { dim:'conexionEmocional',  puntosPos:18, puntosNeg:12 },
  'Moon-Sun':      { dim:'conexionEmocional',  puntosPos:18, puntosNeg:12 },
  'Mercury-Mercury':{ dim:'afinidadMental',    puntosPos:18, puntosNeg:12 },
  'Sun-Mercury':   { dim:'afinidadMental',     puntosPos:10, puntosNeg:6  },
  'Mercury-Sun':   { dim:'afinidadMental',     puntosPos:10, puntosNeg:6  },
  'Mercury-Venus': { dim:'afinidadMental',     puntosPos:8,  puntosNeg:5  },
  'Venus-Mercury': { dim:'afinidadMental',     puntosPos:8,  puntosNeg:5  },
  'Mercury-Mars':  { dim:'afinidadMental',      puntosPos:6,  puntosNeg:8  },
  'Mars-Mercury':  { dim:'afinidadMental',      puntosPos:6,  puntosNeg:8  },
  'N Node-N Node':{ dim:'sintoniaEspiritual',  puntosPos:18, puntosNeg:10 },
  'N Node-Sun':    { dim:'sintoniaEspiritual',  puntosPos:12, puntosNeg:8  },
  'Sun-N Node':    { dim:'sintoniaEspiritual',  puntosPos:12, puntosNeg:8  },
  'N Node-Moon':   { dim:'sintoniaEspiritual',  puntosPos:12, puntosNeg:8  },
  'Moon-N Node':   { dim:'sintoniaEspiritual',  puntosPos:12, puntosNeg:8  },
  'N Node-Venus':  { dim:'sintoniaEspiritual',  puntosPos:10, puntosNeg:6  },
  'Venus-N Node':  { dim:'sintoniaEspiritual',  puntosPos:10, puntosNeg:6  },
  'Neptune-Sun':   { dim:'sintoniaEspiritual',  puntosPos:8,  puntosNeg:6  },
  'Sun-Neptune':   { dim:'sintoniaEspiritual',  puntosPos:8,  puntosNeg:6  },
  'Neptune-Moon':  { dim:'sintoniaEspiritual',  puntosPos:8,  puntosNeg:6  },
  'Moon-Neptune':  { dim:'sintoniaEspiritual',  puntosPos:8,  puntosNeg:6  },
  'Neptune-Venus': { dim:'sintoniaEspiritual',  puntosPos:8,  puntosNeg:6  },
  'Venus-Neptune': { dim:'sintoniaEspiritual',  puntosPos:8,  puntosNeg:6  },
  'Saturn-Venus':  { dim:'estabilidadFuturo',   puntosPos:14, puntosNeg:10 },
  'Venus-Saturn':  { dim:'estabilidadFuturo',   puntosPos:14, puntosNeg:10 },
  'Saturn-Saturn': { dim:'estabilidadFuturo',   puntosPos:10, puntosNeg:8  },
  'Sun-Saturn':    { dim:'estabilidadFuturo',   puntosPos:12, puntosNeg:10 },
  'Saturn-Sun':    { dim:'estabilidadFuturo',   puntosPos:12, puntosNeg:10 },
  'Moon-Saturn':   { dim:'estabilidadFuturo',   puntosPos:10, puntosNeg:12 },
  'Saturn-Moon':   { dim:'estabilidadFuturo',   puntosPos:10, puntosNeg:12 },
  'Sun-Sun':       { dim:'estabilidadFuturo',   puntosPos:8,  puntosNeg:6  },
  // Pares adicionales (química, valores, transformación) para el display de
  // dimensión en la tabla de aspectos y para el scoring por sector (PARES_FACTOR).
  'Mars-Mars':     { dim:'quimicaPasion',       puntosPos:16, puntosNeg:10 },
  'Mars-Pluto':    { dim:'quimicaPasion',       puntosPos:15, puntosNeg:10 },
  'Pluto-Mars':    { dim:'quimicaPasion',       puntosPos:15, puntosNeg:10 },
  'Venus-Venus':   { dim:'conexionEmocional',   puntosPos:18, puntosNeg:12 },
  'Sun-Pluto':     { dim:'quimicaPasion',       puntosPos:12, puntosNeg:8  },
  'Pluto-Sun':     { dim:'quimicaPasion',       puntosPos:12, puntosNeg:8  },
  'Moon-Pluto':    { dim:'quimicaPasion',       puntosPos:10, puntosNeg:8  },
  'Pluto-Moon':    { dim:'quimicaPasion',       puntosPos:10, puntosNeg:8  },
  'Mercury-Pluto': { dim:'afinidadMental',      puntosPos:8,  puntosNeg:6  },
  'Pluto-Mercury': { dim:'afinidadMental',      puntosPos:8,  puntosNeg:6  },
  'Saturn-Pluto':  { dim:'estabilidadFuturo',   puntosPos:8,  puntosNeg:6  },
  'Pluto-Saturn':  { dim:'estabilidadFuturo',   puntosPos:8,  puntosNeg:6  },
  'Mercury-Saturn':{ dim:'afinidadMental',      puntosPos:8,  puntosNeg:6  },
  'Saturn-Mercury':{ dim:'afinidadMental',      puntosPos:8,  puntosNeg:6  },
  'Mercury-Jupiter':{ dim:'afinidadMental',     puntosPos:8,  puntosNeg:5  },
  'Jupiter-Mercury':{ dim:'afinidadMental',     puntosPos:8,  puntosNeg:5  },
  'Sun-Jupiter':   { dim:'sintoniaEspiritual',  puntosPos:10, puntosNeg:6  },
  'Jupiter-Sun':   { dim:'sintoniaEspiritual',  puntosPos:10, puntosNeg:6  },
  'Moon-Jupiter':  { dim:'sintoniaEspiritual',  puntosPos:10, puntosNeg:6  },
  'Jupiter-Moon':  { dim:'sintoniaEspiritual',  puntosPos:10, puntosNeg:6  },
  'Venus-Jupiter': { dim:'sintoniaEspiritual',  puntosPos:10, puntosNeg:6  },
  'Jupiter-Venus': { dim:'sintoniaEspiritual',  puntosPos:10, puntosNeg:6  },
  // Display de dimensión para los pares añadidos en PARES_FACTOR
  'Mars-Saturn':     { dim:'estabilidadFuturo', puntosPos:10, puntosNeg:10 },
  'Saturn-Mars':     { dim:'estabilidadFuturo', puntosPos:10, puntosNeg:10 },
  'Moon-Mercury':    { dim:'conexionEmocional', puntosPos:11, puntosNeg:8  },
  'Mercury-Moon':    { dim:'conexionEmocional', puntosPos:11, puntosNeg:8  },
  'Mars-Jupiter':    { dim:'quimicaPasion',     puntosPos:9,  puntosNeg:6  },
  'Jupiter-Mars':    { dim:'quimicaPasion',     puntosPos:9,  puntosNeg:6  },
  'Jupiter-Jupiter': { dim:'sintoniaEspiritual',puntosPos:9,  puntosNeg:5  },
  'Jupiter-Saturn':  { dim:'estabilidadFuturo', puntosPos:7,  puntosNeg:6  },
  'Saturn-Jupiter':  { dim:'estabilidadFuturo', puntosPos:7,  puntosNeg:6  },
  'Mercury-Uranus':  { dim:'afinidadMental',    puntosPos:7,  puntosNeg:5  },
  'Uranus-Mercury':  { dim:'afinidadMental',    puntosPos:7,  puntosNeg:5  },
  'Mercury-Neptune': { dim:'afinidadMental',    puntosPos:7,  puntosNeg:5  },
  'Neptune-Mercury': { dim:'afinidadMental',    puntosPos:7,  puntosNeg:5  },
  'Moon-Uranus':     { dim:'conexionEmocional', puntosPos:7,  puntosNeg:6  },
  'Uranus-Moon':     { dim:'conexionEmocional', puntosPos:7,  puntosNeg:6  },
  'Sun-S Node':      { dim:'sintoniaEspiritual',puntosPos:7,  puntosNeg:5  },
  'S Node-Sun':      { dim:'sintoniaEspiritual',puntosPos:7,  puntosNeg:5  },
  'Moon-S Node':     { dim:'sintoniaEspiritual',puntosPos:8,  puntosNeg:5  },
  'S Node-Moon':     { dim:'sintoniaEspiritual',puntosPos:8,  puntosNeg:5  },
  'Venus-S Node':    { dim:'sintoniaEspiritual',puntosPos:7,  puntosNeg:5  },
  'S Node-Venus':    { dim:'sintoniaEspiritual',puntosPos:7,  puntosNeg:5  },
};

// ============================================================
// PARES_FACTOR — mapa por sector para el scoring de los 8 factores.
// Cada par de planetas (en cualquier orden) alimenta un factor primario
// (`f`) y, opcionalmente, un secundario (`sec`).
// `atraccion:true` = par de química pura (Venus-Mars/Mars-Mars/Mars-Plutón):
//   TODO contacto SUMA atracción (por intensidad/orbe); cuadratura/oposición
//   solo añade "fricción" (descriptor) sin puntuar negativo.
// `sec` en un par de transformación: el contacto tenso se valora como
//   "intenso" (Plutón), no como negativo.
// ============================================================
const PARES_FACTOR = {
  'Venus-Mars':   { f:'quimica', base:20, atraccion:true },
  'Mars-Venus':   { f:'quimica', base:20, atraccion:true },
  'Mars-Mars':    { f:'quimica', base:16, atraccion:true },
  'Mars-Pluto':   { f:'quimica', base:15, atraccion:true, sec:'transformacion' },
  'Pluto-Mars':   { f:'quimica', base:15, atraccion:true, sec:'transformacion' },
  'Pluto-Venus':  { f:'quimica', base:14, atraccion:true, sec:'transformacion' },
  'Venus-Pluto':  { f:'quimica', base:14, atraccion:true, sec:'transformacion' },
  'Sun-Mars':     { f:'quimica', base:9  },
  'Mars-Sun':     { f:'quimica', base:9  },
  'Mars-Moon':    { f:'quimica', base:9  },
  'Moon-Mars':    { f:'quimica', base:9  },
  // Emocional (Luna)
  'Sun-Moon':     { f:'emocional', base:18 },
  'Moon-Sun':     { f:'emocional', base:18 },
  'Moon-Moon':    { f:'emocional', base:20 },
  'Moon-Venus':   { f:'emocional', base:15 },
  'Venus-Moon':   { f:'emocional', base:15 },
  'Sun-Venus':    { f:'emocional', base:13 },
  'Venus-Sun':    { f:'emocional', base:13 },
  // Mental (Mercurio)
  'Mercury-Mercury': { f:'mental', base:15 },
  'Sun-Mercury':     { f:'mental', base:10 },
  'Mercury-Sun':     { f:'mental', base:10 },
  'Mercury-Venus':   { f:'mental', base:9  },
  'Venus-Mercury':   { f:'mental', base:9  },
  'Mercury-Mars':    { f:'mental', base:8  },
  'Mars-Mercury':    { f:'mental', base:8  },
  'Mercury-Saturn':  { f:'mental', base:8  },
  'Saturn-Mercury':  { f:'mental', base:8  },
  // Espiritual (Nodo Norte / Neptuno / Júpiter)
  'N Node-N Node':   { f:'espiritual', base:18 },
  'N Node-Sun':      { f:'espiritual', base:12 },
  'Sun-N Node':      { f:'espiritual', base:12 },
  'N Node-Moon':     { f:'espiritual', base:12 },
  'Moon-N Node':     { f:'espiritual', base:12 },
  'N Node-Venus':    { f:'espiritual', base:10 },
  'Venus-N Node':    { f:'espiritual', base:10 },
  'Sun-Neptune':     { f:'espiritual', base:9  },
  'Neptune-Sun':     { f:'espiritual', base:9  },
  'Moon-Neptune':    { f:'espiritual', base:9  },
  'Neptune-Moon':    { f:'espiritual', base:9  },
  'Venus-Neptune':   { f:'espiritual', base:8  },
  'Neptune-Venus':   { f:'espiritual', base:8  },
  'Sun-Jupiter':     { f:'espiritual', base:8  },
  'Jupiter-Sun':     { f:'espiritual', base:8  },
  'Moon-Jupiter':    { f:'espiritual', base:8  },
  'Jupiter-Moon':    { f:'espiritual', base:8  },
  // Estabilidad (Saturno)
  'Sun-Saturn':      { f:'estabilidad', base:13 },
  'Saturn-Sun':      { f:'estabilidad', base:13 },
  'Venus-Saturn':    { f:'estabilidad', base:14 },
  'Saturn-Venus':    { f:'estabilidad', base:14 },
  'Moon-Saturn':     { f:'estabilidad', base:12 },
  'Saturn-Moon':     { f:'estabilidad', base:12 },
  'Saturn-Saturn':   { f:'estabilidad', base:15 },
  // Valores / Estilo de amor (Venus)
  'Venus-Venus':     { f:'valores', base:18 },
  'Venus-Jupiter':   { f:'valores', base:9  },
  'Jupiter-Venus':   { f:'valores', base:9  },
  // Transformación / Poder (Plutón): tenso = intenso, no malo
  'Sun-Pluto':       { f:'transformacion', base:11, intenso:true },
  'Pluto-Sun':       { f:'transformacion', base:11, intenso:true },
  'Moon-Pluto':      { f:'transformacion', base:10, intenso:true },
  'Pluto-Moon':      { f:'transformacion', base:10, intenso:true },
  'Mercury-Pluto':   { f:'transformacion', base:8,  intenso:true },
  'Pluto-Mercury':   { f:'transformacion', base:8,  intenso:true },
  'Saturn-Pluto':    { f:'transformacion', base:8,  intenso:true },
  'Pluto-Saturn':    { f:'transformacion', base:8,  intenso:true },
  'Pluto-Pluto':     { f:'transformacion', base:10, intenso:true },
  // --- Ángulos (ASC): contactos con el Ascendente alimentan sectores (orbe ≤4°).
  // La OPOSICIÓN al ASC = conjunción al Descendente (Casa 7): la gestiona
  // _factorCasa7 (Compromiso), por eso en el loop se salta si es Opposition.
  'Sun-I ASC':      { f:'quimica',   base:8, angulo:true },
  'I ASC-Sun':      { f:'quimica',   base:8, angulo:true },
  'Venus-I ASC':    { f:'quimica',   base:9, angulo:true },
  'I ASC-Venus':    { f:'quimica',   base:9, angulo:true },
  'Mars-I ASC':     { f:'quimica',   base:9, angulo:true },
  'I ASC-Mars':     { f:'quimica',   base:9, angulo:true },
  'Moon-I ASC':     { f:'emocional', base:8, angulo:true },
  'I ASC-Moon':     { f:'emocional', base:8, angulo:true },
  'Mercury-I ASC':  { f:'mental',    base:7, angulo:true },
  'I ASC-Mercury':  { f:'mental',    base:7, angulo:true },
  // --- Aspectos que faltaban según práctica profesional ---
  'Venus-Uranus':   { f:'quimica',   base:8, atraccion:true },
  'Uranus-Venus':   { f:'quimica',   base:8, atraccion:true },
  'Mars-Neptune':   { f:'quimica',   base:8 },
  'Neptune-Mars':   { f:'quimica',   base:8 },
  'Venus-Chiron':   { f:'emocional', base:9, chiron:true },
  'Chiron-Venus':   { f:'emocional', base:9, chiron:true },
  'Sun-Chiron':     { f:'emocional', base:7, chiron:true },
  'Chiron-Sun':     { f:'emocional', base:7, chiron:true },
  'Moon-Chiron':    { f:'emocional', base:8, chiron:true },
  'Chiron-Moon':    { f:'emocional', base:8, chiron:true },
  'Mercury-Jupiter':{ f:'mental',    base:8 },
  'Jupiter-Mercury':{ f:'mental',    base:8 },
  // --- Cobertura ampliada a pares clásicos (Hand / Cafe Astrology) ---
  'Mars-Saturn':     { f:'estabilidad', base:10 },              // fricción deseo↔límite
  'Saturn-Mars':     { f:'estabilidad', base:10 },
  'Moon-Mercury':    { f:'emocional', base:11, sec:'mental' },  // entender las emociones del otro
  'Mercury-Moon':    { f:'emocional', base:11, sec:'mental' },
  'Sun-Sun':         { f:'espiritual', base:10, sec:'valores' },// afinidad de propósito e identidad
  'Mars-Jupiter':    { f:'quimica', base:9, sec:'espiritual' }, // entusiasmo y juego compartidos
  'Jupiter-Mars':    { f:'quimica', base:9, sec:'espiritual' },
  'Jupiter-Jupiter': { f:'espiritual', base:9 },                // visión y filosofía comunes
  'Jupiter-Saturn':  { f:'estabilidad', base:7 },               // expansión vs. estructura
  'Saturn-Jupiter':  { f:'estabilidad', base:7 },
  'Mercury-Uranus':  { f:'mental', base:7 },                    // chispa y originalidad mental
  'Uranus-Mercury':  { f:'mental', base:7 },
  'Mercury-Neptune': { f:'mental', base:7 },                    // intuición vs. lógica
  'Neptune-Mercury': { f:'mental', base:7 },
  'Moon-Uranus':     { f:'emocional', base:7 },                 // necesidad de libertad afectiva
  'Uranus-Moon':     { f:'emocional', base:7 },
  // Eje nodal: contactos con el Nodo Sur = familiaridad kármica ("ya nos conocíamos")
  'Sun-S Node':      { f:'espiritual', base:7 },
  'S Node-Sun':      { f:'espiritual', base:7 },
  'Moon-S Node':     { f:'espiritual', base:8 },
  'S Node-Moon':     { f:'espiritual', base:8 },
  'Venus-S Node':    { f:'espiritual', base:7 },
  'S Node-Venus':    { f:'espiritual', base:7 },
};

// Significados de casas para overlays (texto breve, se traduce en UI via i18n
// usando claves sinastria.casaSignificado.<n> en datos-maestros)
const CASAS_PRIORITARIAS = ['Sun','Moon','Mercury','Venus','Mars','N Node','Jupiter','Saturn','Pluto'];

// Importancia astrológica de cada punto para ponderar overlays de casas y
// elegir el "punto fuerte/desafío" (no solo por orbe). Luminarias y personales
// pesan más que los planetas exteriores.
const IMPORTANCIA_PLANETA = {
  Sun: 10, Moon: 9, 'I ASC': 9, Mercury: 8, Venus: 8, 'X MC': 8, Mars: 7,
  Jupiter: 6, Saturn: 5, 'N Node': 4, Uranus: 3, Neptune: 3, Pluto: 3,
};

// Fuerza de un planeta dentro de su casa: 1.0 si está en el centro de la casa,
// 0.5 si está justo en una cúspide (borde). Un planeta central "llena" más la casa.
function _fuerzaEnCasa(lon, cusps, casa) {
  const l = ((lon % 360) + 360) % 360;
  const ini = ((cusps[casa - 1] % 360) + 360) % 360;
  let fin = ((cusps[casa % 12] % 360) + 360) % 360;
  if (fin <= ini) fin += 360;
  let ll = l; if (ll < ini) ll += 360;
  // La regla de la cúspide 5° (_casaOverlay) puede asignar un planeta a la casa
  // siguiente aunque quede justo ANTES de ini: sin el clamp, frac ≈ 16 y la
  // fuerza sale ≈ -14 → refuerzo ≈ -145 (colapsa el factor). Acotado a [0,1],
  // el planeta movido cuenta con fuerza de cúspide (0.5), su valor real.
  const frac = Math.max(0, Math.min(1, (ll - ini) / (fin - ini))); // 0..1 dentro de la casa
  const distCentro = Math.abs(frac - 0.5) * 2; // 0 centro, 1 cúspide
  return 1 - 0.5 * distCentro; // 1.0 centro, 0.5 cúspide
}

// === Compatibilidad de elementos (fuego/agua/aire/tierra) ===
// Cada signo pertenece a un elemento. La compatibilidad clásica entre elementos
// ajusta ligeramente la puntuación de cada aspecto cruzado.
const ELEMENTO_SIGNO = ['fuego','tierra','aire','agua','fuego','tierra','aire','agua','fuego','tierra','aire','agua'];
function _elementoDeLongitud(lon) {
  const idx = Math.floor((((lon % 360) + 360) % 360) / 30);
  return ELEMENTO_SIGNO[idx];
}
// 1 = armónico, 0.5 = neutro, 0 = desafiante
const COMPAT_ELEMENTO = {
  'fuego-fuego':1,'aire-aire':1,'tierra-tierra':1,'agua-agua':1,
  'fuego-aire':1,'aire-fuego':1,'tierra-agua':1,'agua-tierra':1,
  'fuego-tierra':0.5,'tierra-fuego':0.5,'aire-agua':0.5,'agua-aire':0.5,
  'fuego-agua':0,'agua-fuego':0,'aire-tierra':0,'tierra-aire':0,
};
function _compatElemento(lon1, lon2) {
  const e1 = _elementoDeLongitud(lon1);
  const e2 = _elementoDeLongitud(lon2);
  return COMPAT_ELEMENTO[`${e1}-${e2}`] ?? 0.5;
}

// ============================================================
// CARTA COMPUESTA (composite chart)
// Punto medio de cada par de longitudes (arco más corto, cuidando el
// límite 0°/360°). ASC/MC compuestos = punto medio de los ASC/MC.
// Casas derivadas del ASC compuesto (sistema Equal, 30° por casa).
// ============================================================
function _puntoMedio(lon1, lon2) {
  let d = lon2 - lon1;
  d = ((d + 180) % 360 + 360) % 360 - 180; // normaliza a [-180,180]
  return ((lon1 + d / 2) % 360 + 360) % 360;
}

export function calcularCartaCompuesta(cartaA, cartaB) {
  // Sin hora de nacimiento fiable, ASC/MC/casas de la compuesta serían
  // aleatorios (las casas se fijan a las 12:00): solo se calculan planetas.
  const sinHora = !!(cartaA.desconocida || cartaB.desconocida);
  const planetas = [];
  for (const pA of cartaA.planetas) {
    const pB = cartaB.planetas.find(p => p.nombre === pA.nombre);
    if (!pB) continue;
    const lon = _puntoMedio(pA.longitud, pB.longitud);
    const info = gradosASigno(lon);
    planetas.push({
      nombre: pA.nombre, simbolo: pA.simbolo, color: pA.color,
      longitud: lon, signo: info.signo, grados: info.grados, minutos: info.minutos,
      retro: false,
    });
  }
  // Casas Equal derivadas del ASC compuesto. La cúspide 10 Equal NO es el MC
  // real (el MC compuesto es el punto medio de los MC), así que no se etiqueta
  // como 'X MC' para no presentar dos MC distintos.
  const asc = sinHora ? null : _puntoMedio(cartaA.asc, cartaB.asc);
  const mc = sinHora ? null : _puntoMedio(cartaA.mc, cartaB.mc);
  const casasInfo = [];
  if (!sinHora) {
    for (let i = 0; i < 12; i++) {
      const lon = ((asc + i * 30) % 360 + 360) % 360;
      const info = gradosASigno(lon);
      casasInfo.push({
        numero: i + 1, longitud: lon, signo: info.signo,
        grados: info.grados, minutos: info.minutos,
        esAngulo: (i === 0),
        etiqueta: i === 0 ? 'I ASC' : '',
      });
    }
  }
  const cusps = casasInfo.map(c => c.longitud);
  planetas.forEach(p => { p.casa = sinHora ? null : casaDelPlaneta(p.longitud, cusps); });
  const puntos = planetas.map(p => ({ nombre: p.nombre, longitud: p.longitud }));
  const aspectos = calcularAspectos(puntos);
  return { planetas, casasInfo, asc, mc, aspectos, sinHora };
}

// ============================================================
// AMISTAD PLANETARIA (Graha Maitri) — tabla védica estándar
// (Brihat Parashara Hora Shastra). Los planetas exteriores
// (Urano/Neptuno/Plutón) y el Nodo se tratan como neutrales.
// ============================================================
const AMISTAD_PLANETARIA = {
  Sun:     { amigos:['Moon','Mars','Jupiter'], enemigos:['Venus','Saturn'], neutrales:['Mercury'] },
  Moon:    { amigos:['Sun','Mercury'], enemigos:[], neutrales:['Mars','Jupiter','Venus','Saturn'] },
  Mars:    { amigos:['Sun','Moon','Jupiter'], enemigos:['Mercury'], neutrales:['Venus','Saturn'] },
  Mercury: { amigos:['Sun','Venus'], enemigos:['Moon'], neutrales:['Mars','Jupiter','Saturn'] },
  Jupiter: { amigos:['Sun','Moon','Mars'], enemigos:['Mercury','Venus'], neutrales:['Saturn'] },
  Venus:   { amigos:['Mercury','Saturn'], enemigos:['Sun','Moon'], neutrales:['Mars','Jupiter'] },
  Saturn:  { amigos:['Mercury','Venus'], enemigos:['Sun','Moon','Mars'], neutrales:['Jupiter'] },
};
// Devuelve +1 (amigos), -1 (enemigos), 0 (neutrales/exteriores).
// La amistad es MUTUA: se evalúa en ambos sentidos y no depende del orden
// A/B. Si cualquiera de los dos planetas considera al otro amigo → amistad;
// si ninguno lo considera amigo y alguno lo considera enemigo → enemistad.
function _grahaMaitri(p1, p2) {
  const r1 = AMISTAD_PLANETARIA[p1];
  const r2 = AMISTAD_PLANETARIA[p2];
  const esAmigo = (r1 && r1.amigos.includes(p2)) || (r2 && r2.amigos.includes(p1));
  if (esAmigo) return 1;
  const esEnemigo = (r1 && r1.enemigos.includes(p2)) || (r2 && r2.enemigos.includes(p1));
  if (esEnemigo) return -1;
  return 0;
}

// Amistad planetaria (Graha Maitri) entre las dos cartas: pares de planetas
// que son amigos/enemigos naturales, para mostrarlo en el análisis local.
function _calcularAmistad(cartaA, cartaB) {
  const pa = cartaA.planetas.filter(p => AMISTAD_PLANETARIA[p.nombre]);
  const pb = cartaB.planetas.filter(p => AMISTAD_PLANETARIA[p.nombre]);
  const amigos = [], enemigos = [];
  for (const a of pa) for (const b of pb) {
    const rel = _grahaMaitri(a.nombre, b.nombre);
    if (rel === 1) amigos.push({ p1: a.nombre, p2: b.nombre });
    else if (rel === -1) enemigos.push({ p1: a.nombre, p2: b.nombre });
  }
  return { amigos, enemigos };
}

// ============================================================
// FACTORES DEL SISTEMA JERARQUIZADO (8 factores, pesos = 100%)
// ============================================================
// Los 5 primeros se alimentan del radar clásico; los 3 últimos se
// calculan por separado (elementos, casa 7/Descendente, carta compuesta).
const FACTORES = [
  { key:'quimica',        radarKey:'quimicaPasion',     peso:0.15, label:'Química' },
  { key:'emocional',      radarKey:'conexionEmocional', peso:0.20, label:'Emocional' },
  { key:'mental',         radarKey:'afinidadMental',    peso:0.15, label:'Mental' },
  { key:'espiritual',     radarKey:'sintoniaEspiritual',peso:0.10, label:'Espiritual' },
  { key:'estabilidad',    radarKey:'estabilidadFuturo', peso:0.12, label:'Estabilidad' },
  { key:'valores',        radarKey:null,                peso:0.15, label:'Valores / Estilo de amor' },
  { key:'transformacion', radarKey:null,                peso:0.05, label:'Transformación / Poder' },
  { key:'compromiso',     radarKey:null,                peso:0.08, label:'Compromiso (Casa 7)' },
];

// Nivel cualitativo de cada factor, según su puntuación y si arrastra tensión
// (fricción). Devuelve una de: facilidad / matiz / intenso / desafio.
// - Química con fricción (cuadratura/oposición Venus-Mars/Mars-Mars/Mars-Plutón)
//   y Transformación son "intenso" cuando el score es alto: tensión que excita,
//   no que resta.
function _nivelFactor(key, score, friccion) {
  if (key === 'quimica' && friccion && score >= 55) return 'intenso';
  if (key === 'transformacion' && score >= 50) return 'intenso';
  if (score >= 70) return 'facilidad';
  if (score >= 50) return 'matiz';
  return 'desafio';
}

// Factor 6 — Compatibilidad de elementos (fuego-aire / tierra-agua).
// Promedia la compatibilidad elemental de todos los pares de planetas.
function _factorElementos(cartaA, cartaB) {
  const pa = cartaA.planetas.filter(p => IMPORTANCIA_PLANETA[p.nombre]);
  const pb = cartaB.planetas.filter(p => IMPORTANCIA_PLANETA[p.nombre]);
  if (!pa.length || !pb.length) return 50;
  let suma = 0, n = 0;
  for (const a of pa) for (const b of pb) {
    suma += _compatElemento(a.longitud, b.longitud);
    n++;
  }
  return Math.max(0, Math.min(100, Math.round((suma / n) * 100)));
}

// Factor 7 — Eje casa 7 / Descendente.
// El Descendente = ASC + 180°. Detecta planetas de A cerca del Descendente
// de B (orbe ~8°) y viceversa, y valora el regente de la casa 7.
// Los regentes de SIGNOS están en español ('Marte', 'Luna'...), pero los
// planetas de carta.planetas usan nombres ingleses ('Mars', 'Moon'...).
const REGENTE_EN = { 'Sol':'Sun', 'Luna':'Moon', 'Mercurio':'Mercury', 'Venus':'Venus', 'Marte':'Mars', 'Júpiter':'Jupiter', 'Saturno':'Saturn', 'Plutón':'Pluto' };
function _factorCasa7(cartaA, cartaB) {
  const descA = ((cartaA.asc + 180) % 360 + 360) % 360;
  const descB = ((cartaB.asc + 180) % 360 + 360) % 360;
  // Orbe estrecho (4°): el Descendente deriva del ASC, sensible a errores de hora.
  const ORBE_DESC = 4;
  let score = 50;
  let n = 0;
  const _cerca = (lon, desc) => {
    let d = Math.abs(lon - desc);
    if (d > 180) d = 360 - d;
    return d;
  };
  // Planetas de A cerca del Descendente de B
  for (const p of cartaA.planetas) {
    const d = _cerca(p.longitud, descB);
    if (d <= ORBE_DESC) {
      const imp = IMPORTANCIA_PLANETA[p.nombre] || 3;
      const fOrb = 1 - (d / ORBE_DESC); // 1 exacto, 0 en el borde
      score += imp * fOrb * 1.2;
      n++;
    }
  }
  // Planetas de B cerca del Descendente de A
  for (const p of cartaB.planetas) {
    const d = _cerca(p.longitud, descA);
    if (d <= ORBE_DESC) {
      const imp = IMPORTANCIA_PLANETA[p.nombre] || 3;
      const fOrb = 1 - (d / ORBE_DESC);
      score += imp * fOrb * 1.2;
      n++;
    }
  }
  // Regente de la casa 7: el planeta que rige el signo en la cúspide 7.
  // Si ese planeta está bien aspectado en la sinastría, suma.
  const _regenteCasa7 = (carta) => {
    const cusp7 = carta.casasInfo[6]; // índice 6 = casa 7
    const regente = cusp7.signo.regente; // ej. 'Venus', 'Marte/Plutón' (en español)
    const nombre = REGENTE_EN[regente.split('/')[0]] || regente.split('/')[0];
    return carta.planetas.find(p => p.nombre === nombre);
  };
  const regA = _regenteCasa7(cartaA);
  const regB = _regenteCasa7(cartaB);
  if (regA && regB) {
    let d = Math.abs(regA.longitud - regB.longitud);
    if (d > 180) d = 360 - d;
    for (const def of ASPECTOS_DEF) {
      const orb = Math.abs(d - def.angulo);
      if (orb <= def.orb) {
        const armonico = esAspectoArmonico(def.nombre, regA.nombre, regB.nombre);
        score += (armonico ? 6 : -4) * factorOrbe(orb);
        break;
      }
    }
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Factor 8 — Carta compuesta: armonía de Sol/Luna/Venus/Marte compuestos.
function _factorCompuesta(cartaA, cartaB) {
  const cc = calcularCartaCompuesta(cartaA, cartaB);
  const claves = ['Sun','Moon','Venus','Mars'];
  const puntos = claves.map(n => cc.planetas.find(p => p.nombre === n)).filter(Boolean);
  let score = 50;
  for (let i = 0; i < puntos.length; i++) {
    for (let j = i + 1; j < puntos.length; j++) {
      let diff = Math.abs(puntos[i].longitud - puntos[j].longitud);
      if (diff > 180) diff = 360 - diff;
      for (const def of ASPECTOS_DEF) {
        const orb = Math.abs(diff - def.angulo);
        if (orb <= def.orb) {
          const armonico = esAspectoArmonico(def.nombre, puntos[i].nombre, puntos[j].nombre);
          score += (armonico ? 1 : -1) * 10 * factorOrbe(orb);
          break;
        }
      }
    }
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ============================================================
// DETALLE POR FACTOR (qué contribuye a cada puntuación, para el desglose)
// ============================================================
// Signo de un planeta (o de los ángulos ASC/MC) en su carta, traducido.
function _signoDePlaneta(nombre, carta) {
  if (nombre === 'I ASC') return _sn(gradosASigno(carta.asc).signo);
  if (nombre === 'X MC') return _sn(gradosASigno(carta.mc).signo);
  const p = carta.planetas.find(x => x.nombre === nombre);
  return p ? _sn(p.signo) : '';
}
function _detalleElementos(cartaA, cartaB) {
  const pa = cartaA.planetas.filter(p => IMPORTANCIA_PLANETA[p.nombre]);
  const pb = cartaB.planetas.filter(p => IMPORTANCIA_PLANETA[p.nombre]);
  const armonicos = ['fuego-aire','aire-fuego','tierra-agua','agua-tierra'];
  let count = 0;
  for (const a of pa) for (const b of pb) {
    const e1 = _elementoDeLongitud(a.longitud), e2 = _elementoDeLongitud(b.longitud);
    if (armonicos.includes(`${e1}-${e2}`)) count++;
  }
  return [`${count} pares con elementos armónicos (fuego↔aire, tierra↔agua)`];
}

function _detalleCasa7(cartaA, cartaB) {
  const descA = ((cartaA.asc + 180) % 360 + 360) % 360;
  const descB = ((cartaB.asc + 180) % 360 + 360) % 360;
  // Mismo orbe que el scoring (_factorCasa7): 4°, para que el detalle no muestre
  // planetas "junto al Descendente" que no contribuyen a la puntuación.
  const ORBE = 4;
  const nombreA = cartaA.nombre || 'Persona A';
  const nombreB = cartaB.nombre || 'Persona B';
  const cerca = (lon, desc) => { let d = Math.abs(lon - desc); if (d > 180) d = 360 - d; return d; };
  const res = [];
  for (const p of cartaA.planetas) {
    const d = cerca(p.longitud, descB);
    if (d <= ORBE) res.push(`${_pn(p.nombre)} (${_sn(p.signo)}) de ${nombreA} junto al Descendente de ${nombreB}`);
  }
  for (const p of cartaB.planetas) {
    const d = cerca(p.longitud, descA);
    if (d <= ORBE) res.push(`${_pn(p.nombre)} (${_sn(p.signo)}) de ${nombreB} junto al Descendente de ${nombreA}`);
  }
  if (!res.length) res.push('Sin planetas junto al eje 7/Descendente');
  return res.slice(0, 3);
}

function _detalleCompuesta(cartaCompuesta) {
  const claves = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'];
  const res = [];
  for (const n of claves) {
    const p = cartaCompuesta.planetas.find(x => x.nombre === n);
    if (p) res.push(`${_pn(n)} compuesto en ${_sn(p.signo)}${p.casa != null ? ` (Casa ${p.casa})` : ''}`);
  }
  // Signo + grado (no longitud absoluta), legible para cualquier usuario
  const fmt = (lon) => { const g = gradosASigno(lon); return `${g.grados}°${String(g.minutos).padStart(2,'0')}' ${_sn(g.signo)}`; };
  if (cartaCompuesta.asc != null) res.push(`ASC compuesto: ${fmt(cartaCompuesta.asc)}`);
  if (cartaCompuesta.mc != null) res.push(`MC compuesto: ${fmt(cartaCompuesta.mc)}`);
  return res;
}

// ============================================================
// NETO DE ASPECTOS (estilo CafeAstrology) + CONSEJOS
// Balance bruto: suma de la fuerza de los aspectos armónicos
// menos la de los tensos, sin normalizar. Es una visión global
// complementaria al % por factores.
// ============================================================
function _netoAspectos(aspectosCruzados) {
  let armonico = 0, tension = 0;
  for (const a of aspectosCruzados) {
    const imp = (IMPORTANCIA_PLANETA[a.p1] || 3) + (IMPORTANCIA_PLANETA[a.p2] || 3);
    const delta = imp * factorOrbe(a.orb) * 10;
    if (esAspectoArmonico(a.tipo, a.p1, a.p2)) armonico += delta;
    else tension += delta;
  }
  return { armonico: Math.round(armonico), tension: Math.round(tension), net: Math.round(armonico - tension) };
}

// Consejo accionable por factor (cuando el factor es débil)
const CONSEJOS_FACTOR = {
  quimica: () => t('sinastria.consejo_quimica') || 'Alimenta la chispa: deja espacio al deseo, la sorpresa y el juego entre ustedes.',
  emocional: () => t('sinastria.consejo_emocional') || 'Practica la escucha y la seguridad emocional: expresa lo que sientes y valida al otro.',
  mental: () => t('sinastria.consejo_mental') || 'Mejora la comunicación: dialoguen con calma y escucha activa antes de discutir.',
  espiritual: () => t('sinastria.consejo_espiritual') || 'Compartan una práctica o valores comunes: conéctense en lo que da sentido a su vida.',
  estabilidad: () => t('sinastria.consejo_estabilidad') || 'Refuerza los cimientos: fija expectativas claras, rutinas y acuerdos de largo plazo.',
  valores: () => t('sinastria.consejo_valores') || 'Alinea los valores y el estilo de amor: hablen de qué esperan y cómo desean quererse.',
  transformacion: () => t('sinastria.consejo_transformacion') || 'Gestiona la intensidad: establece límites sanos y canaliza el poder compartido sin control ni miedo.',
  compromiso: () => t('sinastria.consejo_compromiso') || 'Cuida el compromiso y el eje de pareja: dedica tiempo a construir su "nosotros".',
};
function _consejoFactor(key) {
  const f = CONSEJOS_FACTOR[key];
  return f ? f() : '';
}

// === Inferencia de dimensión del radar para un par de planetas ===
// Usa PESOS_PARES si existe; si no, infiere de la dimensión del planeta más importante.
const DIM_PLANETA = {
  Sun:'conexionEmocional', Moon:'conexionEmocional', Venus:'conexionEmocional',
  Mercury:'afinidadMental', Mars:'quimicaPasion', Pluto:'quimicaPasion',
  Jupiter:'sintoniaEspiritual', Neptune:'sintoniaEspiritual', 'N Node':'sintoniaEspiritual',
  Saturn:'estabilidadFuturo',
};
function _dimensionDePar(p1, p2) {
  const pesoPar = PESOS_PARES[`${p1}-${p2}`] || PESOS_PARES[`${p2}-${p1}`];
  if (pesoPar) return pesoPar.dim;
  const d1 = DIM_PLANETA[p1], d2 = DIM_PLANETA[p2];
  if (d1 && d2) {
    const imp1 = IMPORTANCIA_PLANETA[p1] || 3;
    const imp2 = IMPORTANCIA_PLANETA[p2] || 3;
    return imp1 >= imp2 ? d1 : d2;
  }
  return d1 || d2 || null;
}

// --- Función principal: calcularSinastria(cartaA, cartaB) ---
// Recibe dos cartas completas (devueltas por calcularCartaAstral o leídas de
// storage.obtenerCartas()[i].datos) y devuelve el objeto sinastriaLocalOutput.
export function calcularSinastria(cartaA, cartaB) {
  // Sin hora de nacimiento fiable, ASC/MC/casas son aleatorios (se fijan a las
  // 12:00). Se excluyen todos los cálculos que dependen de ellos: contactos con
  // ángulos, overlays, factor Compromiso (Casa 7) y ASC/MC de la compuesta.
  const sinHora = !!(cartaA.desconocida || cartaB.desconocida);

  // Puntos de cada carta: planetas + ASC + MC (+ Nodo Sur).
  // Sin hora: no se cruzan los ángulos (serían ruido).
  const _puntos = (c) => sinHora
    ? _extraerPuntos(c).filter(p => p.nombre !== 'I ASC' && p.nombre !== 'X MC')
    : _extraerPuntos(c);
  const puntosA = _puntos(cartaA);
  const puntosB = _puntos(cartaB);

  // Aspectos cruzados A×B
  const aspectosCruzados = calcularAspectosSinastria(puntosA, puntosB);

  // --- 1. Overlays de casas (planetas de un@ en casas del otr@); sin hora: vacíos ---
  const overlays = sinHora ? [] : _calcularOverlays(cartaA, cartaB);

  // --- 2. Puntuación por sector (8 factores) ---
  // Cada aspecto cruzado alimenta su factor (PARES_FACTOR) con una contribución
  // según el sector:
  //  - Química pura (Venus-Mars/Mars-Mars/Mars-Plutón): TODO contacto SUMA
  //    atracción (por intensidad/orbe); cuadratura/oposición añade "fricción"
  //    (descriptor) sin puntuar negativo.
  //  - Transformación (Plutón): el contacto tenso se valora como "intenso"
  //    (no malo).
  //  - Resto de sectores: la tensión sigue bajando (es "requiere trabajo"),
  //    pero con descriptor cualitativo.
  const factorKeys = FACTORES.map(f => f.key);
  const sumas = {}; const pesos = {}; const fricciones = {}; const detalle = {};
  for (const k of factorKeys) { sumas[k] = 0; pesos[k] = 0; fricciones[k] = false; detalle[k] = []; }

  for (const a of aspectosCruzados) {
    const key = `${a.p1}-${a.p2}`;
    const fOrb = factorOrbe(a.orb);
    const armonico = esAspectoArmonico(a.tipo, a.p1, a.p2);
    const deltaElem = (_compatElemento(a.long1, a.long2) - 0.5) * 6;
    const deltaMaitri = _grahaMaitri(a.p1, a.p2) * 3;
    // Peso de este aspecto: orbe exacto × planeta más importante. Define cuánto
    // domina el sector (media ponderada, no promedio aritmético).
    const pesoAsp = _pesoOrb(a.orb) * _pesoPlanetaPar(a.p1, a.p2);
    const _sumar = (fac, base, mult, fric) => {
      const c = base * fOrb * mult + deltaElem + deltaMaitri;
      sumas[fac] += c * pesoAsp; pesos[fac] += pesoAsp;
      if (fric) fricciones[fac] = true;
      detalle[fac].push({ p1: a.p1, p2: a.p2, tipo: a.tipo, orb: a.orb, delta: Math.round(c), armonico, friccion: !!fric });
    };
    // Quincuncio (150°): tensión moderada de ajuste (mult -0.7) en Valores y Emocional.
    if (a.tipo === 'Quincunx') {
      _sumar('valores', 7, -0.7, false);
      _sumar('emocional', 7, -0.7, false);
      continue;
    }
    const par = PARES_FACTOR[key] || PARES_FACTOR[`${a.p2}-${a.p1}`];
    if (!par) continue;
    // Oposición a un ángulo = conjunción al ángulo opuesto (ASC→DSC / Casa 7):
    // la gestiona _factorCasa7 (Compromiso), así que aquí se salta para no duplicar.
    if (par.angulo && a.tipo === 'Opposition') continue;
    if (par.atraccion) {
      // Química pura: siempre suma; la tensión añade fricción, no resta.
      _sumar(par.f, par.base, armonico ? 1 : 0.6, !armonico);
      // Pares de química con componente de transformación (Venus-Plutón,
      // Marte-Plutón): también alimentan el factor Transformación (tenso = intenso).
      if (par.sec) _sumar(par.sec, par.base, armonico ? 0.7 : 0.5, !armonico);
    } else if (par.intenso || par.chiron) {
      // Transformación y Quirón: el contacto tenso no resta — es "intenso"
      // (poder) o un enganche kármico de sanación (Quirón).
      _sumar(par.f, par.base, armonico ? 1 : 0.5, !armonico);
      if (par.sec) _sumar(par.sec, par.base, armonico ? 0.6 : 0.3, !armonico);
    } else {
      // Resto de sectores: la tensión resta (requiere trabajo).
      _sumar(par.f, par.base, armonico ? 1 : -1, false);
      // Sector secundario (ej. Luna-Mercurio también alimenta Mental).
      if (par.sec) _sumar(par.sec, par.base, armonico ? 0.6 : -0.6, false);
    }
  }

  // Normalización: score = 50 + (suma ponderada / suma de pesos) * 2.3.
  // Los aspectos definitorios (orbe exacto + planeta personal) dominan el
  // sector; los aspectos amplios contribuyen poco. Escala 2.3 equilibra la
  // discriminación sin inflar los factores.
  const factorScores = {};
  for (const k of factorKeys) {
    factorScores[k] = pesos[k] > 0 ? 50 + (sumas[k] / pesos[k]) * 2.3 : 50;
  }

  // Refuerzos por overlays de casas (activación de áreas de vida).
  // Venus en 5ª/7ª refuerza Valores; Plutón refuerza Transformación.
  // Sin hora: no hay casas fiables, así que no hay refuerzos.
  if (!sinHora) {
    const CASA_A_FACTOR = { 1:'emocional',4:'emocional',3:'mental',5:'quimica',7:'compromiso',8:'quimica',9:'espiritual',10:'estabilidad',12:'espiritual' };
    for (const ov of overlays) {
      if (!ov.planetaPersonal) continue;
      if (ov.planeta === 'Venus' && (ov.casaEnA === 5 || ov.casaEnA === 7)) {
        factorScores['valores'] += ov.refuerzo * 0.5;
      } else if (ov.planeta === 'Pluto') {
        factorScores['transformacion'] += ov.refuerzo * 0.5;
      } else {
        const fac = CASA_A_FACTOR[ov.casaEnA];
        if (fac && fac !== 'compromiso') factorScores[fac] += ov.refuerzo * 0.35;
      }
    }
  }

  // El factor Compromiso (eje Casa 7 / Descendente) se calcula con su lógica
  // propia. Sin hora exacta el eje no existe: se excluye y su peso (8%) se
  // redistribuye proporcionalmente entre los demás factores.
  const factorCasa7 = sinHora ? null : _factorCasa7(cartaA, cartaB);
  if (!sinHora) factorScores['compromiso'] = factorCasa7;

  // Factores complementarios de visualización (carta compuesta + elementos).
  const factorElementos = _factorElementos(cartaA, cartaB);
  const factorCompuesta = _factorCompuesta(cartaA, cartaB);
  const cartaCompuesta = calcularCartaCompuesta(cartaA, cartaB);

  // Clamp 0-100
  for (const k of factorKeys) factorScores[k] = Math.max(0, Math.min(100, Math.round(factorScores[k])));

  // Radar (5 dimensiones) derivado de los factores, para compatibilidad con el
  // texto de copiado y las frases del diccionario.
  const radar = {
    quimicaPasion: factorScores['quimica'],
    afinidadMental: factorScores['mental'],
    conexionEmocional: factorScores['emocional'],
    sintoniaEspiritual: factorScores['espiritual'],
    estabilidadFuturo: factorScores['estabilidad'],
  };
  const radarOrigen = {
    quimicaPasion: detalle['quimica'], afinidadMental: detalle['mental'],
    conexionEmocional: detalle['emocional'], sintoniaEspiritual: detalle['espiritual'],
    estabilidadFuturo: detalle['estabilidad'],
  };

  // Detalle de qué contribuye a cada factor (para el desglose de puntuación).
  // Guarda TODOS los aspectos; el "top 3" se aplica solo en el desglose de barras
  // de la app. Cada aspecto indica planeta, signo, tipo, el nombre de a quien
  // pertenece y el orbe. p1 pertenece a la persona A, p2 a la persona B.
  const _nombreA = cartaA.nombre || 'Persona A';
  const _nombreB = cartaB.nombre || 'Persona B';
  // Estructura completa de un aspecto por sector: datos crudos + etiquetas
  // localizadas, para que el fallback local pueda seleccionar qué aspectos
  // mostrar según su contribución (orbe, signo del delta, tensión/armonía).
  const _structAspecto = (o) => {
    const simb = ASPECTOS_DEF.find(d => d.nombre === o.tipo)?.simbolo || o.tipo;
    return {
      p1: o.p1, p2: o.p2, tipo: o.tipo, orb: o.orb, delta: o.delta,
      armonico: o.armonico, friccion: o.friccion, simbolo: simb,
      p1Label: _pn(o.p1), p2Label: _pn(o.p2), s1: _signoDePlaneta(o.p1, cartaA),
      s2: _signoDePlaneta(o.p2, cartaB), nA: _nombreA, nB: _nombreB,
      tipoLabel: tAspecto(o.tipo),
    };
  };
  const _detalleFactorStruct = (key) => (detalle[key] || []).map(_structAspecto);
  const _detalleFactor = (key) => _detalleFactorStruct(key).map(o => {
    const n1 = o.s1 ? `${o.p1Label} (${o.s1}) de ${o.nA}` : `${o.p1Label} de ${o.nA}`;
    const n2 = o.s2 ? `${o.p2Label} (${o.s2}) de ${o.nB}` : `${o.p2Label} de ${o.nB}`;
    const sg = o.friccion ? '≈' : (o.armonico ? '+' : '−');
    return `${n1} ${o.simbolo} ${n2} — ${o.tipoLabel} (orbe ${_formatOrbe(o.orb)}, ${sg}${Math.abs(o.delta)})`;
  });
  const factorDetalle = {};
  const factorAspectos = {};
  for (const k of factorKeys) {
    factorDetalle[k] = k === 'compromiso' ? (sinHora ? [] : _detalleCasa7(cartaA, cartaB)) : _detalleFactor(k);
    factorAspectos[k] = k === 'compromiso' ? [] : _detalleFactorStruct(k);
  }

  // Factores jerarquizados con su nivel cualitativo (Facilidad/Matiz/Intenso/Desafío).
  // Sin hora: se excluye Compromiso y su peso se redistribuye proporcionalmente.
  let factoresEf = FACTORES.filter(f => !sinHora || f.key !== 'compromiso');
  if (sinHora) {
    const tot = factoresEf.reduce((acc, f) => acc + f.peso, 0);
    factoresEf = factoresEf.map(f => ({ ...f, peso: f.peso / tot }));
  }
  const factores = factoresEf.map(f => {
    const score = factorScores[f.key];
    const friccion = fricciones[f.key];
    return {
      key: f.key,
      label: f.label,
      peso: f.peso,
      score,
      contribucion: Math.round(score * f.peso),
      nivel: _nivelFactor(f.key, score, friccion),
      friccion,
    };
  });

  let globalScore = 0;
  for (const f of factores) globalScore += f.score * f.peso;
  globalScore = Math.round(globalScore);
  const compatibilidadLabel = _labelCompatibilidad(globalScore);

  // Neto de aspectos (balance armónicos vs tensión) + consejo del área más débil
  const netoAspectos = _netoAspectos(aspectosCruzados);
  const factorDebil = factores.slice().sort((a, b) => a.score - b.score)[0];
  const factorFuerte = factores.slice().sort((a, b) => b.score - a.score)[0];
  const consejo = factorDebil ? _consejoFactor(factorDebil.key) : '';

  // --- 3. Puntos fuerte / desafío top ---
  const arm = aspectosCruzados.filter(a => esAspectoArmonico(a.tipo, a.p1, a.p2));
  const ten = aspectosCruzados.filter(a => !esAspectoArmonico(a.tipo, a.p1, a.p2));
  const masFuerte = _topAspecto(arm);
  const masDesafiante = _topAspecto(ten);
  const puntosFuerteTop = masFuerte ? _fraseAspecto(masFuerte, true) : '—';
  const desafioTop = masDesafiante ? _fraseAspecto(masDesafiante, false) : '—';
  const puntosFuerteData = masFuerte ? { p1: masFuerte.p1, p2: masFuerte.p2, tipo: masFuerte.tipo, orb: masFuerte.orb, simbolo: masFuerte.simbolo } : null;
  const desafioData = masDesafiante ? { p1: masDesafiante.p1, p2: masDesafiante.p2, tipo: masDesafiante.tipo, orb: masDesafiante.orb, simbolo: masDesafiante.simbolo } : null;

  // --- 4. Casas destacadas (overlays top, ambas direcciones) ---
  const casasDestacadas = _seleccionarCasas(overlays);

  // --- 5. Aspectos top (ordenados por orbe asc = mayor potencia) ---
  const aspectosTop = aspectosCruzados
    .slice()
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 8)
    .map(a => _formatAspectoTop(a, cartaA, cartaB));

  // --- 6. Texto formateado para el prompt de IA ---
  const promptDataText = _generarPromptData(radar, globalScore, aspectosTop, casasDestacadas, factores, cartaCompuesta, factorCasa7, cartaA, cartaB, factorDetalle);

  return {
    radarScores: radar,
    radarOrigen,
    globalScore,
    compatibilidadLabel,
    factores,
    factorDetalle,
    factorAspectos,
    netoAspectos,
    factorDebil,
    factorFuerte,
    consejo,
    cartaCompuesta,
    factorCasa7,
    factorElementos,
    factorCompuesta,
    amistadPlanetaria: _calcularAmistad(cartaA, cartaB),
    puntosFuerteTop,
    desafioTop,
    puntosFuerteData,
    desafioData,
    casasDestacadas,
    aspectosTop,
    aspectosCruzados,
    sinHora,
    overlays,
    promptDataText,
  };
}

// Extrae planetas + ASC + MC (+ Nodo Sur) de una carta como puntos con longitud
function _extraerPuntos(carta) {
  const pts = carta.planetas.map(p => ({ nombre:p.nombre, longitud:p.longitud }));
  pts.push({ nombre:'I ASC', longitud:carta.asc });
  pts.push({ nombre:'X MC', longitud:carta.mc });
  if (carta.southNode) pts.push({ nombre:'S Node', longitud: carta.southNode.longitud });
  return pts;
}

// Regla tradicional de la cúspide en overlays: un planeta a menos de 5° de la
// cúspide de la casa SIGUIENTE se lee en esa casa siguiente, no en la actual.
function _casaOverlay(lon, cusps) {
  const casa = casaDelPlaneta(lon, cusps);
  const cuspNext = ((cusps[casa % 12] % 360) + 360) % 360;
  let d = ((cuspNext - lon) % 360 + 360) % 360;
  if (d > 180) d = 360 - d;
  return d <= 5 ? (casa % 12) + 1 : casa;
}

// Calcula overlays: para cada planeta personal de B, en qué casa de A cae
// (y viceversa). Devuelve refuerzo (puntos a la dimensión) y significado.
function _calcularOverlays(cartaA, cartaB) {
  const cuspsA = cartaA.casasInfo.map(c => c.longitud);
  const cuspsB = cartaB.casasInfo.map(c => c.longitud);
  const overlays = [];

  // Planetas de B en casas de A
  for (const p of cartaB.planetas) {
    if (!CASAS_PRIORITARIAS.includes(p.nombre)) continue;
    const casa = _casaOverlay(p.longitud, cuspsA);
    const refuerzo = Math.round((IMPORTANCIA_PLANETA[p.nombre] || 3) * _fuerzaEnCasa(p.longitud, cuspsA, casa));
    overlays.push({
      planeta: p.nombre, origen:'B', casaEnA: casa,
      planetaPersonal: true,
      refuerzo,
      significado: (SIGNIFICADO_CASA[casa] ? SIGNIFICADO_CASA[casa]() : 'Área de vida activada'),
    });
  }
  // Planetas de A en casas de B
  for (const p of cartaA.planetas) {
    if (!CASAS_PRIORITARIAS.includes(p.nombre)) continue;
    const casa = _casaOverlay(p.longitud, cuspsB);
    const refuerzo = Math.round((IMPORTANCIA_PLANETA[p.nombre] || 3) * _fuerzaEnCasa(p.longitud, cuspsB, casa));
    overlays.push({
      planeta: p.nombre, origen:'A', casaEnA: casa,
      planetaPersonal: true,
      refuerzo,
      significado: (SIGNIFICADO_CASA[casa] ? SIGNIFICADO_CASA[casa]() : 'Área de vida activada'),
    });
  }
  return overlays;
}

// Selecciona las casas de impacto mostrando AMBAS direcciones: las 3 más
// fuertes de los planetas de B en casas de A y las 3 más fuertes de A en casas
// de B, intercaladas. Así el output no queda sesgado a un solo sentido.
function _seleccionarCasas(overlays) {
  const porOrigen = { A: [], B: [] };
  for (const o of overlays) {
    if (o.planetaPersonal) porOrigen[o.origen].push(o);
  }
  const ordenar = arr => arr.slice().sort((a, b) => b.refuerzo - a.refuerzo);
  const a = ordenar(porOrigen.A).slice(0, 3);
  const b = ordenar(porOrigen.B).slice(0, 3);
  const res = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (b[i]) res.push(b[i]);
    if (a[i]) res.push(a[i]);
  }
  return res.map(o => ({
    planeta: o.planeta,
    origen: o.origen,
    casaEn: o.casaEnA,
    refuerzo: o.refuerzo,
    significado: o.significado,
  }));
}

const SIGNIFICADO_CASA = {
  1: () => t('sinastria.casa1') || 'Identidad y proyección mutua',
  2: () => t('sinastria.casa2') || 'Valores y recursos compartidos',
  3: () => t('sinastria.casa3') || 'Comunicación cotidiana',
  4: () => t('sinastria.casa4') || 'Hogar y raíces emocionales',
  5: () => t('sinastria.casa5') || 'Romance, creatividad y diversión',
  6: () => t('sinastria.casa6') || 'Rutinas y cuidado diario',
  7: () => t('sinastria.casa7') || 'Compromiso e identificación mutua',
  8: () => t('sinastria.casa8') || 'Intimidad profunda y transformación',
  9: () => t('sinastria.casa9') || 'Visión de mundo y crecimiento',
  10: () => t('sinastria.casa10') || 'Propósitos y reconocimiento',
  11: () => t('sinastria.casa11') || 'Amistad e ideales compartidos',
  12: () => t('sinastria.casa12') || 'Vínculo espiritual y karma',
};

function _labelCompatibilidad(score) {
  if (score >= 85) return t('sinastria.labelAlma') || 'Conexión Almática y Transformadora';
  if (score >= 70) return t('sinastria.labelSolida') || 'Afinidad Sólida y Constructiva';
  if (score >= 55) return t('sinastria.labelMatices') || 'Atracción con Matices';
  if (score >= 40) return t('sinastria.labelDesafiante') || 'Conexión Desafiante y Formativa';
  return t('sinastria.labelDivergencia') || 'Caminos en Divergencia';
}

// Significancia de un aspecto: combina la importancia de los dos planetas con la
// exactitud del orbe. Un aspecto entre luminarias con orbe pequeño pesa más que
// uno entre planetas exteriores aunque sea más exacto.
function _significanciaAspecto(a) {
  const imp1 = IMPORTANCIA_PLANETA[a.p1] || 3;
  const imp2 = IMPORTANCIA_PLANETA[a.p2] || 3;
  return (imp1 + imp2) - a.orb;
}

function _topAspecto(lista) {
  if (!lista.length) return null;
  return lista.slice().sort((a, b) => _significanciaAspecto(b) - _significanciaAspecto(a))[0];
}

function _fraseAspecto(a, armonico) {
  return `${_pn(a.p1)} ${a.simbolo} ${_pn(a.p2)} — ${tAspecto(a.tipo)} (orbe ${_formatOrbe(a.orb)})`;
}

function _formatOrbe(orb) {
  const g = Math.floor(orb);
  const m = Math.floor((orb - g) * 60);
  return `${g}°${String(m).padStart(2,'0')}'`;
}

function _formatAspectoTop(a, cartaA, cartaB) {
  // Localiza planeta en su carta para sacar grados/signo
  const p1Obj = _findPlaneta(cartaA, a.p1) || _findPlaneta(cartaB, a.p1);
  const p2Obj = _findPlaneta(cartaB, a.p2) || _findPlaneta(cartaA, a.p2);
  const fmt = (p, origen) => {
    if (!p) return `${_pn(a.origen1 === origen ? a.p1 : a.p2)}`;
    const sg = _sn(p.signo);
    return `${_pn(p.nombre)} (${p.grados}°${String(p.minutos).padStart(2,'0')}' ${sg})`;
  };
  const armonico = esAspectoArmonico(a.tipo, a.p1, a.p2);
  // Dimensión del radar que alimenta este par de planetas (para la tabla).
  // Usa PESOS_PARES si existe; si no, infiere de los planetas.
  const dim = _dimensionDePar(a.p1, a.p2);
  let peso = t('sinastria.pesoMedio') || 'Medio';
  if (a.orb <= 1) peso = t('sinastria.pesoMuyAlto') || 'Muy Alto';
  else if (a.orb <= 3) peso = t('sinastria.pesoAlto') || 'Alto';
  else if (a.orb <= 5) peso = t('sinastria.pesoMedio') || 'Medio';
  else peso = t('sinastria.pesoBajo') || 'Bajo';
  return {
    planetaA: fmt(p1Obj, 'A'),
    planetaB: fmt(p2Obj, 'B'),
    planetaANombre: p1Obj ? `${_pn(p1Obj.nombre)} (${_sn(p1Obj.signo)})` : _pn(a.p1),
    planetaBNombre: p2Obj ? `${_pn(p2Obj.nombre)} (${_sn(p2Obj.signo)})` : _pn(a.p2),
    p1EN: a.p1, p2EN: a.p2,
    tipoEN: a.tipo,
    tipoAspecto: tAspecto(a.tipo),
    simbolo: a.simbolo,
    orbe: _formatOrbe(a.orb),
    peso,
    armonico,
    dim,
    impacto: armonico ? (t('sinastria.impactoPositivo') || 'Positivo') : (t('sinastria.impactoTension') || 'Tensión'),
    color: a.color,
    clase: a.clase,
  };
}

function _findPlaneta(carta, nombre) {
  return carta.planetas.find(p => p.nombre === nombre);
}

function _generarPromptData(radar, global, aspectosTop, casasDestacadas, factores, cartaCompuesta, factorCasa7, cartaA, cartaB, factorDetalle) {
  const nombreA = (cartaA && cartaA.nombre) || 'Persona A';
  const nombreB = (cartaB && cartaB.nombre) || 'Persona B';
  const NIVEL = {
    facilidad: 'Facilidad', matiz: 'Matiz', intenso: 'Intenso (con fricción)', desafio: 'Desafío / requiere trabajo',
  };
  let s = '';
  s += `PUNTUACIONES POR SECTOR (0 a 100) Y SU NIVEL:\n`;
  for (const f of factores) {
    s += `- ${f.label} (${Math.round(f.peso * 100)}%): ${f.score}/100 → +${f.contribucion}% — Nivel: ${NIVEL[f.nivel] || f.nivel}\n`;
    // Detalle de qué aspectos alimentan cada sector (planetas, signos, tipo,
    // persona a la que pertenece cada planeta y orbe). Todos, no solo el top 3.
    const det = (factorDetalle && factorDetalle[f.key]) || [];
    for (const d of det) s += `    · ${d}\n`;
  }
  s += `- COMPATIBILIDAD GLOBAL: ${Math.round(factores.reduce((a, f) => a + f.score * f.peso, 0))}%\n\n`;
  // Facilidades vs desafíos por sector, para que la IA explique cada área.
  const facilidades = factores.filter(f => f.nivel === 'facilidad' || f.nivel === 'intenso').map(f => f.label);
  const desafios = factores.filter(f => f.nivel === 'desafio').map(f => f.label);
  const matices = factores.filter(f => f.nivel === 'matiz').map(f => f.label);
  s += `RESUMEN DE SECTORES:\n`;
  s += `- Facilidades (áreas que fluyen): ${facilidades.length ? facilidades.join(', ') : 'ninguna destacada'}\n`;
  s += `- Con matices (bien con trabajo): ${matices.length ? matices.join(', ') : 'ninguna'}\n`;
  s += `- Desafíos / requieren trabajo: ${desafios.length ? desafios.join(', ') : 'ninguno destacado'}\n`;
  s += `Nota: en Química y Transformación, la tensión (cuadratura/oposición) no resta: suma intensidad/atracción, solo añade "fricción".\n`;
  if (cartaA.desconocida || cartaB.desconocida) {
    s += `NOTA IMPORTANTE: al menos una persona no tiene hora de nacimiento exacta. NO interpretes casas, Ascendente ni Descendente: céntrate solo en aspectos entre planetas y en la carta compuesta planetaria.\n`;
  }
  // Aspectos más exactos (top por orbe): los contactos definitorios de la pareja.
  if (aspectosTop && aspectosTop.length) {
    s += `\nASPECTOS MÁS EXACTOS (top por orbe):\n`;
    for (const a of aspectosTop.slice(0, 8)) {
      s += `- ${a.planetaA} ${a.simbolo} ${a.planetaB} — ${a.tipoAspecto} (orbe ${a.orbe}, ${a.impacto})\n`;
    }
  }
  s += `\n`;
  s += `CARTA COMPUESTA (punto medio de cada par de planetas — la relación de ${nombreA} × ${nombreB}):\n`;
  if (cartaCompuesta && cartaCompuesta.planetas) {
    const fmtAng = (lon) => { const g = gradosASigno(lon); return `${g.grados}°${String(g.minutos).padStart(2,'0')}' ${g.signo.nombre}`; };
    const claves = ['Sun','Moon','Venus','Mars','Mercury','Saturn','ASC','MC'];
    for (const n of claves) {
      if (n === 'ASC') { if (cartaCompuesta.asc != null) s += `- ASC compuesto: ${fmtAng(cartaCompuesta.asc)}\n`; continue; }
      if (n === 'MC') { if (cartaCompuesta.mc != null) s += `- MC compuesto: ${fmtAng(cartaCompuesta.mc)}\n`; continue; }
      const p = cartaCompuesta.planetas.find(x => x.nombre === n);
      if (p) s += `- ${_pn(n)} compuesto: ${p.grados}°${String(p.minutos).padStart(2,'0')}' ${p.signo.nombre}${p.casa != null ? ` (Casa ${p.casa})` : ''}\n`;
    }
  }
  if (casasDestacadas && casasDestacadas.length) {
    s += `\nCASAS DESTACADAS (overlays):\n`;
    for (const c of casasDestacadas) {
      s += `- ${_pn(c.planeta)} de ${c.origen === 'B' ? nombreB : nombreA} cae en la CASA ${c.casaEn} de ${c.origen === 'B' ? nombreA : nombreB}. ${c.significado}.\n`;
    }
  }
  return s;
}

// ============================================================
// Rueda SVG bicarta para sinastria
// Anillo interior = carta A (dorado #e8c46a)
// Anillo exterior = carta B (morado armónico #b89cff)
// Líneas centrales = aspectos cruzados
// ============================================================
export function generarRuedaSinastriaSVG(dA, dB, aspectosCruzados) {
  const cx=250, cy=250;
  // Anillo interior (A)
  const rAext=175, rAsig=165, rAcas=130, rAasp=120, rAplan=145, rAnum=110;
  // Anillo exterior (B)
  const rBext=230, rBsig=220, rBcas=185, rBplan=200;
  const COL_A = '#e8c46a';
  const COL_A_SOFT = 'rgba(232,196,106,0.4)';
  const COL_B = '#b89cff';
  const COL_B_SOFT = 'rgba(184,156,255,0.4)';
  let s = '';

  // Círculos A (interior)
  s += `<circle cx="${cx}" cy="${cy}" r="${rAext}" fill="none" stroke="${COL_A}" stroke-width="1"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${rAsig}" fill="none" stroke="${COL_A}" stroke-width="1"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${rAcas}" fill="none" stroke="${COL_A}" stroke-width="1"/>`;
  // Círculos B (exterior)
  s += `<circle cx="${cx}" cy="${cy}" r="${rBext}" fill="none" stroke="${COL_B}" stroke-width="1.2"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${rBsig}" fill="none" stroke="${COL_B}" stroke-width="1"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${rBcas}" fill="none" stroke="${COL_B}" stroke-width="1"/>`;

  // Referencia angular: ASC de A (la carta interior define el oriente)
  const ascLon = dA.casasInfo[0].longitud;
  function lon2xy(lon, r) {
    const a = ((180-(lon-ascLon))%360+360)%360 * Math.PI/180;
    return { x: cx+r*Math.cos(a), y: cy-r*Math.sin(a) };
  }

  // Divisiones de signos (interior, referencia A)
  for (let i=0;i<12;i++){
    const p1=lon2xy(i*30,rAcas), p2=lon2xy(i*30,rAext);
    s += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${COL_A_SOFT}" stroke-width="0.6"/>`;
  }
  // Cúspides de casas de A (interior)
  for (let j=0;j<12;j++){
    const c=dA.casasInfo[j];
    const p1=lon2xy(c.longitud,rAext), p2=lon2xy(c.longitud,rBcas);
    s += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${COL_A_SOFT}" stroke-width="0.8"/>`;
  }
  // Símbolos de signo (anillo A, entre rAext y rAsig)
  for (let k=0;k<12;k++){
    const p=lon2xy(k*30+15,(rAext+rAsig)/2);
    s += `<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="middle" fill="${COL_A}" font-size="13" style="cursor:pointer" onclick="window.__sinastriaUI.mostrarInfoSignoA(${k})">${SIGNOS[k].simbolo}</text>`;
  }
  // Números de casa de A (interior)
  for (let l=0;l<12;l++){
    const cu=dA.casasInfo[l].longitud, cuN=dA.casasInfo[(l+1)%12].longitud;
    let mid=(cu+cuN)/2; if(cuN<cu) mid=((cu+cuN+360)/2)%360;
    const p=lon2xy(mid,rAnum);
    s += `<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="middle" fill="${COL_A}" font-size="10" font-weight="bold">${l+1}</text>`;
  }

  // Cúspides de casas de B (exterior): dibujamos sus divisiones en el anillo B
  // Referencia angular de B: ASC de B relativo a ASC de A
  const ascBLon = dB.casasInfo[0].longitud;
  for (let j=0;j<12;j++){
    const c=dB.casasInfo[j];
    // posición absoluta del cúspide de B respecto al oriente de A
    const lonAbs = ascBLon + (c.longitud - ascBLon);
    const p1=lon2xy(c.longitud,rBcas), p2=lon2xy(c.longitud,rBext);
    s += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${COL_B_SOFT}" stroke-width="0.8"/>`;
  }
  // Símbolos de signo de B (anillo exterior, entre rBext y rBsig)
  // Los signos son fijos zodiacales (igual referencia que A), así que reutilizamos lon2xy
  for (let k=0;k<12;k++){
    const p=lon2xy(k*30+15,(rBext+rBsig)/2);
    s += `<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="middle" fill="${COL_B}" font-size="14" style="cursor:pointer" onclick="window.__sinastriaUI.mostrarInfoSignoB(${k})">${SIGNOS[k].simbolo}</text>`;
  }

  // Planetas de A (anillo interior)
  dA.planetas.forEach((p,idx)=>{
    const pp=lon2xy(p.longitud,rAplan);
    s += `<circle cx="${pp.x}" cy="${pp.y}" r="3" fill="${p.color||'#fff0a8'}" style="cursor:pointer" onclick="window.__sinastriaUI.mostrarInfoPlaneta('A',${idx})"/>`;
    s += `<text x="${pp.x}" y="${pp.y-6}" text-anchor="middle" dominant-baseline="middle" fill="${p.color||'#fff0a8'}" font-size="12" font-weight="bold" style="cursor:pointer" onclick="window.__sinastriaUI.mostrarInfoPlaneta('A',${idx})">${p.simbolo}</text>`;
  });
  // Planetas de B (anillo exterior)
  dB.planetas.forEach((p,idx)=>{
    const pp=lon2xy(p.longitud,rBplan);
    s += `<circle cx="${pp.x}" cy="${pp.y}" r="3.5" fill="${p.color||'#b89cff'}" stroke="${COL_B}" stroke-width="0.8" style="cursor:pointer" onclick="window.__sinastriaUI.mostrarInfoPlaneta('B',${idx})"/>`;
    s += `<text x="${pp.x}" y="${pp.y-7}" text-anchor="middle" dominant-baseline="middle" fill="${p.color||'#b89cff'}" font-size="13" font-weight="bold" style="cursor:pointer" onclick="window.__sinastriaUI.mostrarInfoPlaneta('B',${idx})">${p.simbolo}</text>`;
  });

  // Líneas de aspectos cruzados en el centro
  const rAspLine = 105;
  if (aspectosCruzados) {
    aspectosCruzados.forEach((a,idx)=>{
      const p1 = dA.planetas.find(p=>p.nombre===a.p1);
      const p2 = dB.planetas.find(p=>p.nombre===a.p2);
      if (!p1 || !p2) return;
      const pa=lon2xy(p1.longitud,rAspLine), pb=lon2xy(p2.longitud,rAspLine);
      const f = factorOrbe(a.orb);
      const op = (0.85 * f).toFixed(2);
      const midX = ((pa.x + pb.x) / 2).toFixed(1);
      const midY = ((pa.y + pb.y) / 2).toFixed(1);
      // Línea mitad A (dorado) + línea mitad B (morado) + símbolo del aspecto en el medio
      s += `<line x1="${pa.x}" y1="${pa.y}" x2="${midX}" y2="${midY}" stroke="${COL_A}" stroke-width="${(1.2 + f).toFixed(2)}" opacity="${op}" style="cursor:pointer" onclick="window.__sinastriaUI.mostrarInfoAspecto(${idx})"/>`;
      s += `<line x1="${midX}" y1="${midY}" x2="${pb.x}" y2="${pb.y}" stroke="${COL_B}" stroke-width="${(1.2 + f).toFixed(2)}" opacity="${op}" style="cursor:pointer" onclick="window.__sinastriaUI.mostrarInfoAspecto(${idx})"/>`;
      s += `<circle cx="${midX}" cy="${midY}" r="2.5" fill="${a.color}" opacity="${op}"/>`;
    });
  }

  // Centro
  s += `<text x="${cx}" y="${cy-2}" text-anchor="middle" font-size="16" fill="${COL_A}" font-family="serif">💞</text>`;
  s += `<text x="${cx}" y="${cy+12}" text-anchor="middle" font-size="8" fill="#9a8cc0" font-family="serif">${(dA.nombre||'A').substring(0,8)} × ${(dB.nombre||'B').substring(0,8)}</text>`;

  // Leyenda de colores (abajo del diagrama)
  const lgY = 490;
  const nombreA = (dA.nombre||'A').substring(0,12);
  const nombreB = (dB.nombre||'B').substring(0,12);
  s += `<line x1="60" y1="${lgY}" x2="80" y2="${lgY}" stroke="${COL_A}" stroke-width="2.5"/>`;
  s += `<text x="85" y="${lgY+3}" text-anchor="start" font-size="10" fill="${COL_A}" font-family="sans-serif">${nombreA}</text>`;
  s += `<line x1="260" y1="${lgY}" x2="280" y2="${lgY}" stroke="${COL_B}" stroke-width="2.5"/>`;
  s += `<text x="285" y="${lgY+3}" text-anchor="start" font-size="10" fill="${COL_B}" font-family="sans-serif">${nombreB}</text>`;
  return s;
}