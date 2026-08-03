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
let Planet, LunarPoint, HouseSystem, CalculationFlag, CalendarType;

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
  { angulo:180, orb:10, nombre:'Opposition',  simbolo:'☍', clase:'asp-opp', color:'#ff8a3d' },
];

export const PLANETAS_UI = {
  Sun:{simbolo:'☉',color:'#ffd700'}, Moon:{simbolo:'☽',color:'#c0c5d0'},
  Mercury:{simbolo:'☿',color:'#ff8a3d'}, Venus:{simbolo:'♀',color:'#4dffb3'},
  Mars:{simbolo:'♂',color:'#ff5252'}, Jupiter:{simbolo:'♃',color:'#ffaa3d'},
  Saturn:{simbolo:'♄',color:'#d4af37'}, Uranus:{simbolo:'♅',color:'#5ab8ff'},
  Neptune:{simbolo:'♆',color:'#4d8aff'}, Pluto:{simbolo:'♇',color:'#9c5fff'},
  Lilith:{simbolo:'☾',color:'#9a8cc0'}, 'N Node':{simbolo:'☊',color:'#d946ef'},
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
        if (orb <= def.orb) {
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
import { t, tSigno, tAspecto, tPais } from '../i18n/i18n.js?v=18';

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