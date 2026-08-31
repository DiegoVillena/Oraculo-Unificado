// core/astrologia-analisis.js — Análisis Astral Oracular
// Astrólogo Evolutivo y virtuoso de la escritura terapéutica.
// TOLERANCIA CERO A LA CONCATENACIÓN: no pega definiciones, teje consecuencias psicológicas.
//
// MASTERCLASS DE FUSIÓN: redacta la consecuencia psicológica de la combinación,
// no la lista de sus partes.
//
// i18n: todos los diccionarios y textos narrativos se cargan desde datos-maestros.

import { SIGNOS } from './astrologia.js?v=72';
import { getAnalisisAstral, t, tSigno, tAspecto } from '../i18n/i18n.js?v=72';
import { envolverTerminos } from '../ui/glossary.js?v=72';

// === DICCIONARIOS FALLBACK (español, usados si i18n no está cargado) ===

const PES_FB = {
  'Sun':'Sol','Moon':'Luna','Mercury':'Mercurio','Venus':'Venus','Mars':'Marte',
  'Jupiter':'Júpiter','Saturn':'Saturno','Uranus':'Urano','Neptune':'Neptuno',
  'Pluto':'Plutón','N Node':'Nodo Norte','Chiron':'Quirón','Lilith':'Lilith',
  'I ASC':'el Ascendente','X MC':'el Medio Cielo',
};

const SQ_FB = {
  'Aries':'iniciativa, valentía y un impulso pionero que abre camino donde otros ven muros',
  'Tauro':'estabilidad, paciencia y una sensualidad arraigada a lo tangible y duradero',
  'Géminis':'curiosidad, versatilidad mental y una sed insaciable de conectar ideas y personas',
  'Cáncer':'sensibilidad protectora, memoria emocional y un vínculo profundo con la raíz y el cuidado',
  'Leo':'orgullo creativo, calidez y una necesidad irrenunciable de brillar y ser reconocido',
  'Virgo':'análisis, servicio y un afán perfeccionista que busca la maestría en lo práctico',
  'Libra':'equilibrio, diplomacia y una búsqueda constante de armonía y belleza en los vínculos',
  'Escorpio':'intensidad, penetración y una capacidad de sumergirse en lo oculto y renacer transformado',
  'Sagitario':'expansión, fe y una búsqueda entusiasta de sentido, verdad y horizontes amplios',
  'Capricornio':'ambición, disciplina y una voluntad de construir paso a paso hacia lo perdurable',
  'Acuario':'originalidad, idealismo y una visión de futuro que desafía lo establecido por convicción',
  'Piscis':'empatía, imaginación y una entrega a lo invisible y lo universal que borra las fronteras',
};

const SE_FB = {
  'Aries':'Fuego','Leo':'Fuego','Sagitario':'Fuego',
  'Tauro':'Tierra','Virgo':'Tierra','Capricornio':'Tierra',
  'Géminis':'Aire','Libra':'Aire','Acuario':'Aire',
  'Cáncer':'Agua','Escorpio':'Agua','Piscis':'Agua',
};

const ET_FB = {
  'Fuego':'pasión, inspiración y un impulso de acción que necesita combustible',
  'Tierra':'pragmatismo, estabilidad y un anclaje en lo concreto y duradero',
  'Aire':'mentalidad, sociabilidad y un hambre de comunicación e ideas',
  'Agua':'emocionalidad, intuición y una capacidad de sentir y conectar a profundidad',
};

const EI_FB = {
  'Fuego':'la llama que baila','Tierra':'la montaña que perdura',
  'Aire':'el viento que dispersa semillas','Agua':'el océano que todo lo acoge',
};

const ME_FB = { 'Cardinal':'Cardinal','Fixed':'Fijo','Mutable':'Mutable' };
const MT_FB = {
  'Cardinal':'iniciativa para emprender, liderazgo y un empuje que arranca los ciclos',
  'Fijo':'perseverancia, estabilidad y una resistencia que sostiene cuando otros ceden',
  'Mutable':'adaptabilidad, fluidez y un talento para transitar entre mundos y etapas',
};

const PA_FB = {
  'Sun':'tu identidad esencial, la chispa vital y el propósito que te hace sentir auténtico',
  'Moon':'tu mundo emocional, tus necesidades íntimas y la forma de nutrir y descansar',
  'Mercury':'tu mente, tu palabra y la forma de tejer pensamientos y conectar ideas',
  'Venus':'tu capacidad de amar, tus valores y tu sensibilidad para la belleza y el disfrute',
  'Mars':'tu coraje, tu deseo y la energía que pones en perseguir lo que quieres',
  'Jupiter':'tu fe, tu expansión y la búsqueda de sentido y verdad',
  'Saturn':'tu disciplina, tus límites y las lecciones que estructuran tu madurez',
  'Uranus':'tu originalidad, tu rebeldía y el destello de intuición que rompe lo establecido',
  'Neptune':'tu imaginación, tu espiritualidad y el velo entre el sueño y la entrega',
  'Pluto':'tu poder de transformación, tu sombra y la capacidad de morir y renacer',
  'N Node':'tu camino kármico de crecimiento, la dirección que asusta pero expande',
  'Chiron':'la herida que se vuelve sanadora y sabiduría',
  'Lilith':'tu yo salvaje y oculto, lo instintivo que pide ser reconocido sin vergüenza',
};

const CT_FB = {
  1:'tu cuerpo y la forma en que el mundo te percibe al primer encuentro',
  2:'tus finanzas, tus recursos personales y el sentido de lo que te pertenece',
  3:'tu mente cotidiana, tu comunicación y el intercambio constante con tu entorno',
  4:'tu hogar, tus raíces y el refugio íntimo donde descansas la armadura',
  5:'tu creatividad, tu forma de jugar y enamorarte y el lugar donde te atreves a crear',
  6:'tu trabajo cotidiano, tu salud y los hábitos que sostienen tu vida día a día',
  7:'tus vínculos íntimos, tus parejas y los contratos que sellas con el otro',
  8:'la transformación, la intimidad profunda y todo lo que compartes y dejas ir',
  9:'tu búsqueda de sentido, los estudios que te ensanchan y los horizontes que te llaman',
  10:'tu vocación, tu carrera y el reconocimiento público que construyes paso a paso',
  11:'tus amigos, tus ideales y las comunidades donde tu visión se encuentra con la de otros',
  12:'tu intuición, tu inconsciente y los ciclos de cierre que preparan tu siguiente renacimiento',
};

const RETRO_FRASES_FB = [
  ', una fuerza que primero se cocina a fuego lento dentro de ti antes de manifestarse al exterior',
  ' y, al estar retrogrado, se vive como un diálogo interior constante antes de volverse acción visible',
  ', retrogrado, lo que significa que esta cualidad se refina en la intimidad antes de proyectarse',
];

const GRUPOS_FB = [
  { titulo:'La Identidad y la Materia (Casas 1, 2 y 3)', casas:[1,2,3] },
  { titulo:'El Refugio y el Servicio (Casas 4, 5 y 6)', casas:[4,5,6] },
  { titulo:'El Espejo y la Expansión (Casas 7, 8 y 9)', casas:[7,8,9] },
  { titulo:'La Cima y el Inconsciente (Casas 10, 11 y 12)', casas:[10,11,12] },
];

// === UTILIDADES ===
const pES = (n) => PES_FB[n] || n;
const buscar = (c, n) => c.planetas.find(p => p.nombre === n);
const enCasa = (c, n) => c.planetas.filter(p => p.casa === n && !p.esAngulo);
const arq = (n) => (PA_FB[n] || '');

function descripcionAspecto(nombre) {
  if (nombre === 'I ASC') return 'la forma en que te muestras al mundo';
  if (nombre === 'X MC') return 'tus metas o imagen pública';
  return arq(nombre);
}

// Helper: obtener diccionario traducido o fallback
function _D() {
  return getAnalisisAstral() || {};
}

// Helper: signo nombre traducido (clave para SQ, SE)
function _signoKey(signoObj) {
  return SIGNOS.indexOf(signoObj) >= 0 ? SIGNOS[SIGNOS.indexOf(signoObj)].nombre : signoObj?.nombre;
}

// === ALGORITMO ===

export function analizarCartaAstral(carta) {
  if (!carta || !carta.planetas) return '<p>' + t('analisisAstral.sinDatos') + '</p>';

  const D = _D();
  const SQ = D.SQ || SQ_FB;
  const SE = D.SE || SE_FB;
  const ET = D.ET || ET_FB;
  const EI = D.EI || EI_FB;
  const MT = D.MT || MT_FB;
  const CT = D.CT || CT_FB;
  const N = D.narrativa || {};
  const aperturasArr = D.aperturas || [];
  const conectoresArr = D.conectores || [];
  const retroFrasesArr = D.retroFrases || RETRO_FRASES_FB;
  const gruposArr = D.grupos || GRUPOS_FB;

  // === HELPERS LOCALIZADOS (i18n real; los *_FB solo son última red) ===
  // Nombres de planeta traducidos (astral.nombresPlanetarios del locale activo).
  const NP = (() => { const np = t('astral.nombresPlanetarios'); return (np && typeof np === 'object') ? np : {}; })();
  const pN = (n) => NP[n] || PES_FB[n] || n;
  // Arquetipo del planeta (bloque PA del datos-maestros activo).
  const PA = D.PA || PA_FB;
  const arq = (n) => PA[n] || PA_FB[n] || '';
  // Descripción para aspectos (S4): PA o frases especiales para ángulos.
  const descAsp = (n) => N[n === 'I ASC' ? 's4_desc_asc' : (n === 'X MC' ? 's4_desc_mc' : '')] || arq(n) || pN(n);
  const cap1 = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  // Nombre de signo traducido para mostrar (las CLAVES de SQ/SE son españolas
  // en todos los locales; el nombre visible se traduce con tSigno).
  const _signoLabel = (signoObj) => {
    const i = SIGNOS.indexOf(signoObj);
    const s = i >= 0 ? tSigno(i) : null;
    return (s && s.nombre) || (signoObj && signoObj.nombre) || '';
  };
  // Elemento/modalidad traducidos vía un signo representativo (tSigno).
  const EL_IDX = { 'Fuego':0, 'Tierra':1, 'Aire':2, 'Agua':3 };      // Aries/Tauro/Géminis/Cáncer
  const MOD_IDX = { 'Cardinal':0, 'Fijo':1, 'Mutable':2 };           // Aries/Tauro/Géminis
  const elLabel = (elES) => { const s = tSigno(EL_IDX[elES]); return (s && s.elemento) || elES; };
  const modLabel = (mES) => { const s = tSigno(MOD_IDX[mES]); return (s && s.modalidad) || mES; };

  const asc = carta.casasInfo.find(c => c.numero === 1);
  const sol = buscar(carta, 'Sun');
  const luna = buscar(carta, 'Moon');
  const st = carta.estadisticas;
  // Valores del stellium (si hay) que consume el pase final de placeholders
  let stArea = '', stNum = 0, stLista = '';
  const aIdx = { v: 0 };
  const siguienteApertura = (n, sKey) => {
    if (aperturasArr.length > 0) {
      const tpl = aperturasArr[aIdx.v++ % aperturasArr.length];
      return _evalTpl(tpl, { n, s: sKey, CT, SQ });
    }
    return '';
  };
  const cIdx = { v: 0 };
  const siguienteConector = (p, sKey) => {
    if (conectoresArr.length > 0) {
      const tpl = conectoresArr[cIdx.v++ % conectoresArr.length];
      return _evalTpl(tpl, { p, s: sKey, CT, SQ });
    }
    return '';
  };
  const rIdx = { v: 0 };
  const siguienteRetro = () => retroFrasesArr[rIdx.v++ % retroFrasesArr.length] || '';

  // ============================================================
  // 1. EL EJE DE TU SER (Tu Gran Trío)
  // ============================================================
  let s1 = '';
  if (asc && sol && luna) {
    const ascS = _signoKey(asc.signo), solS = _signoKey(sol.signo), lunaS = _signoKey(luna.signo);
    const ascSl = _signoLabel(asc.signo), solSl = _signoLabel(sol.signo), lunaSl = _signoLabel(luna.signo);
    const solE = SE[solS], lunaE = SE[lunaS], ascE = SE[ascS];
    const mismaLuz = solS === lunaS;

    s1 += '<p>';
    // ${sqAsc}, ${sqSol}... los sustituye el pase final
    s1 += (N.s1_asc || '').replace(/\$\{ascS\}/g, ascSl) + ' ';
    s1 += (N.s1_mascara || '') + ' ';
    s1 += (N.s1_sol || '').replace(/\$\{solS\}/g, solSl) + ' ';
    s1 += (N.s1_solLuz || '');

    if (mismaLuz) {
      s1 += (N.s1_lunaConj || '').replace(/\$\{solS\}/g, solSl) + ' ';
      s1 += (N.s1_lunaConj2 || '') + ' ';
      s1 += (N.s1_lunaConj3 || '');
      if (ascE !== solE) {
        s1 += ' ' + (N.s1_contrasteAscSol || '') + ' ' + (N.s1_contrasteAscSol2 || '');
      } else {
        s1 += ' ' + (N.s1_coherencia || '');
      }
    } else {
      s1 += (N.s1_luna || '').replace(/\$\{lunaS\}/g, lunaSl) + ' ';
      s1 += (N.s1_lunaRefugio || '');
      if (solE !== lunaE) {
        s1 += ' ' + (N.s1_contrasteSolLuna || '') + ' ' + (N.s1_polaridad1 || '');
      }
      if (ascE !== solE && ascE !== lunaE) {
        s1 += ' ' + (N.s1_triangulacion || '') + ' ' + (N.s1_triangulacion2 || '');
      } else {
        s1 += ' ' + (N.s1_eje || '');
      }
    }
    s1 += '</p>';
  }

  // ============================================================
  // 2. TU HUELLA ENERGÉTICA (Elementos y Stelliums)
  // ============================================================
  let s2 = '<p>';
  if (st) {
    const elems = [['Fuego',st.fuego],['Tierra',st.tierra],['Aire',st.aire],['Agua',st.agua]];
    elems.sort((a,b) => b[1]-a[1]);
    const domElES = elems[0][0], domElC = elems[0][1];
    const weakElES = elems[3][0], weakElC = elems[3][1];
    const domEl = elLabel(domElES), weakEl = elLabel(weakElES);

    s2 += (N.s2_predominio || '').replace(/\$\{domEl\}/g, domEl).replace(/\$\{domElC\}/g, domElC);
    s2 += ' ';
    if (domElC >= 5) s2 += (N.s2_concentrado || '').replace(/\$\{eiDom\}/g, EI[domEl]||'') + ' ';
    else s2 += (N.s2_tendencia || '') + ' ';
    if (weakElC === 0) s2 += (N.s2_ausencia || '').replace(/\$\{weakEl\}/g, weakEl).replace(/\$\{etWeak\}/g, ET[weakEl]||'') + ' ';
    else if (weakElC <= 1) s2 += (N.s2_debil || '').replace(/\$\{weakEl\}/g, weakEl).replace(/\$\{weakElC\}/g, weakElC) + ' ';
    else s2 += (N.s2_debil2 || '').replace(/\$\{weakEl\}/g, weakEl).replace(/\$\{weakElC\}/g, weakElC) + ' ';

    const mods = [['Cardinal',st.cardinal],['Fijo',st.fixed],['Mutable',st.mutable]];
    mods.sort((a,b) => b[1]-a[1]);
    const domModES = mods[0][0], domModC = mods[0][1];
    const domMod = modLabel(domModES);
    s2 += (N.s2_modalidad || '').replace(/\$\{domMod\}/g, domMod).replace(/\$\{domModC\}/g, domModC).replace(/\$\{mtDom\}/g, MT[domMod]||'') + ' ';
    if (st.masculine > st.feminine + 2) s2 += (N.s2_yang || '') + ' ';
    else if (st.feminine > st.masculine + 2) s2 += (N.s2_yin || '') + ' ';
    else s2 += (N.s2_equilibrio || '') + ' ';
  }

  // Stellium por casa (>=3 planetas no angulares en la misma casa)
  const stelliums = [];
  for (let i = 1; i <= 12; i++) {
    const ps = enCasa(carta, i);
    if (ps.length >= 3) stelliums.push({ casa:i, planetas:ps });
  }
  if (stelliums.length > 0) {
    const s0 = stelliums[0];
    stArea = (CT[s0.casa] || '').split(',')[0];
    stNum = s0.planetas.length;
    stLista = s0.planetas.map(p => pN(p.nombre)).join(', ');
    s2 += (N.s2_stellium || '') + ' ';
    s2 += (N.s2_stellium2 || '') + ' ';
    s2 += (N.s2_stellium3 || '') + '</p>';
  } else {
    s2 += (N.s2_noStellium || '') + '</p>';
  }

  // === 2B. CONFIGURACIONES GEOMÉTRICAS (stellium por signo, T-Square, Gran Trígono) ===
  {
    const personales = carta.planetas.filter(p =>
      ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'].includes(p.nombre));
    const fragConfig = [];

    // Stellium por signo: >=3 planetas en el mismo signo (independiente de la casa)
    const porSigno = {};
    for (const p of personales) {
      const k = _signoKey(p.signo);
      (porSigno[k] = porSigno[k] || []).push(p);
    }
    const sigSt = Object.entries(porSigno).find(([, ps]) => ps.length >= 3);
    if (sigSt) {
      const [sigKey, ps] = sigSt;
      const lista = ps.map(p => pN(p.nombre)).join(', ');
      const idx = SIGNOS.findIndex(s => s.nombre === sigKey);
      const label = idx >= 0 ? _signoLabel(SIGNOS[idx]) : sigKey;
      fragConfig.push((N.s2b_stelliumSigno || '')
        .replace(/\$\{signo\}/g, label)
        .replace(/\$\{sqSigno\}/g, SQ[sigKey] || '')
        .replace(/\$\{planetasLista\}/g, lista));
    }

    // T-Square: dos planetas en oposición y un tercero en cuadratura a ambos
    let tsquare = null;
    const ops = carta.aspectos.filter(a => a.tipo === 'Opposition');
    for (const o of ops) {
      const apex = carta.aspectos.find(a =>
        a.tipo === 'Square' &&
        ((a.p1 === o.p1 || a.p1 === o.p2) && carta.aspectos.some(b =>
          b.tipo === 'Square' && b.p1 === a.p2 &&
          (b.p2 === o.p1 || b.p2 === o.p2))));
      if (apex) { tsquare = { o, apex }; break; }
    }
    if (tsquare) {
      fragConfig.push((N.s2b_tsquare || '')
        .replace(/\$\{p1\}/g, pN(tsquare.o.p1))
        .replace(/\$\{p2\}/g, pN(tsquare.o.p2))
        .replace(/\$\{p3\}/g, pN(tsquare.apex.p2 === tsquare.o.p1 || tsquare.apex.p2 === tsquare.o.p2 ? tsquare.apex.p1 : tsquare.apex.p2)));
    }

    // Gran Trígono: 3 planetas del mismo elemento con trígonos entre sí 2 a 2
    let granTri = null;
    for (const elES of ['Fuego','Tierra','Aire','Agua']) {
      const ps = personales.filter(p => p.signo.elemento === elES);
      for (let i = 0; i < ps.length && !granTri; i++)
        for (let j = i+1; j < ps.length && !granTri; j++)
          for (let k = j+1; k < ps.length && !granTri; k++) {
            const trio = [ps[i], ps[j], ps[k]];
            const trinesOK = [[0,1],[0,2],[1,2]].every(([a,b]) =>
              carta.aspectos.some(x => x.tipo === 'Trine' &&
                ((x.p1 === trio[a].nombre && x.p2 === trio[b].nombre) ||
                 (x.p1 === trio[b].nombre && x.p2 === trio[a].nombre))));
            if (trinesOK) granTri = { trio, elES };
          }
    }
    if (granTri) {
      fragConfig.push((N.s2b_granTrigono || '')
        .replace(/\$\{elemento\}/g, elLabel(granTri.elES))
        .replace(/\$\{planetasLista\}/g, granTri.trio.map(p => pN(p.nombre)).join(', ')));
    }

    if (fragConfig.some(f => f)) s2 += '<p>' + fragConfig.filter(Boolean).join(' ') + '</p>';
  }

  // ============================================================
  // 3. LOS ESCENARIOS DE TU VIDA
  // ============================================================
  let s3 = '';
  for (const grupo of gruposArr) {
    s3 += `<h4 class="analisis-sub">${grupo.titulo}</h4><p>`;
    const fragmentos = [];
    for (const num of grupo.casas) {
      const cuspide = carta.casasInfo[num - 1];
      if (!cuspide) continue;
      const ps = enCasa(carta, num);
      const signoC = _signoKey(cuspide.signo);

      if (ps.length === 0) {
        fragmentos.push(siguienteApertura(num, signoC) + '.');
      } else {
        let frag = siguienteApertura(num, signoC);
        ps.forEach((p, idx) => {
          const con = siguienteConector(pN(p.nombre), _signoKey(p.signo));
          const a = arq(p.nombre);
          if (idx === 0) {
            frag += `, ${con}. `;
          } else {
            frag += ` ${con.charAt(0).toUpperCase() + con.slice(1)}, y ${a}. `;
          }
          if (p.retro) frag += siguienteRetro() + '. ';
        });
        fragmentos.push(frag);
      }
    }
    s3 += fragmentos.join(' ') + '</p>';
  }

  // ============================================================
  // 4. EL MOTOR DE TU CRECIMIENTO (Aspectos Clave)
  // ============================================================
  // El JSON ofrece 3 partes por familia (titular + lectura + consejo):
  // s4_conj1/2/3, s4_opp1/2/3, s4_sq1/2/3, s4_tri1/2/3, s4_sex1/2/3.
  const MAPA_S4 = { Conjunction:'conj', Opposition:'opp', Square:'sq', Trine:'tri', Sextile:'sex' };
  const FAMILIAS_ARMONICAS = ['conj', 'tri', 'sex'];
  let aspectosClave = carta.aspectos
    .filter(a => a.orb < 8 && MAPA_S4[a.tipo])
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 6);

  let s4 = '';
  if (aspectosClave.length === 0) {
    s4 = '<p>' + (N.s4_sinAspectos || '') + '</p>';
  } else {
    aspectosClave.forEach(a => {
      const fam = MAPA_S4[a.tipo];
      const p1 = pN(a.p1), p2 = pN(a.p2);
      const desc1 = descAsp(a.p1);
      const desc2 = descAsp(a.p2);
      const orbStr = a.orb.toFixed(1) + '°';
      const etiqueta = FAMILIAS_ARMONICAS.includes(fam) ? (N.s4_don || '') : (N.s4_motor || '');
      const partes = [1, 2, 3]
        .map(i => (N['s4_' + fam + i] || '')
          .replace(/\$\{p1\}/g, p1).replace(/\$\{p2\}/g, p2)
          .replace(/\$\{orbStr\}/g, orbStr)
          .replace(/\$\{desc1\}/g, desc1).replace(/\$\{desc1Cap\}/g, cap1(desc1))
          .replace(/\$\{desc2\}/g, desc2));
      const parrafo = partes.filter(Boolean).join(' ');
      if (parrafo) s4 += '<p>' + (etiqueta ? etiqueta + ' ' : '') + parrafo + '</p>';
    });
  }

  // ============================================================
  // 5. TU BRÚJULA KÁRMICA
  // ============================================================
  // ${signo}/${sqSigno} se sustituyen INLINE por punto (cada uno es distinto).
  const _s5Signo = (tpl, signoObj) => (tpl || '')
    .replace(/\$\{signo\}/g, _signoLabel(signoObj))
    .replace(/\$\{sqSigno\}/g, SQ[_signoKey(signoObj)] || '');
  let s5 = '<p>';
  const nodoN = buscar(carta, 'N Node');
  if (nodoN) {
    s5 += _s5Signo(N.s5_nodoN, nodoN.signo) + ' ';
    s5 += (N.s5_nodoN2 || '') + ' ';
    if (nodoN.casa) {
      s5 += (N.s5_nodoNCasa || '').replace(/\$\{area\}/g, (CT[nodoN.casa] || '').split(',')[0]) + ' ';
    }
  }
  if (carta.southNode) {
    s5 += _s5Signo(N.s5_nodoS, carta.southNode.signo) + ' ';
  }
  const quiron = buscar(carta, 'Chiron');
  if (quiron) {
    const fq = _s5Signo(N.s5_quiron, quiron.signo)
      .replace(/\$\{area\}/g, quiron.casa ? (CT[quiron.casa] || '').split(',')[0] : '');
    s5 += fq + ' ';
  }
  const lilith = buscar(carta, 'Lilith');
  if (lilith) {
    s5 += _s5Signo(N.s5_lilith, lilith.signo) + ' ';
  }
  if (carta.partOfFortune) {
    s5 += _s5Signo(N.s5_fortuna, carta.partOfFortune.signo) + ' ';
  }
  s5 += '</p>';

  // ============================================================
  // 6. EL CONSEJO DEL ORÁCULO
  // ============================================================
  let s6 = '<p>';
  if (st) {
    if (st.masculine > st.feminine + 2) s6 += (N.s6_yang || '') + ' ';
    else if (st.feminine > st.masculine + 2) s6 += (N.s6_yin || '') + ' ';
    else s6 += (N.s6_equil || '') + ' ';
  }
  // Consejo por elemento escaso/ausente
  if (st && N.s6_weak) {
    const elems6 = [['Fuego',st.fuego],['Tierra',st.tierra],['Aire',st.aire],['Agua',st.agua]].sort((a,b)=>a[1]-b[1]);
    if (elems6[0][1] <= 1 && stArea === '') {
      s6 += N.s6_weak.replace(/\$\{weakEl\}/g, elLabel(elems6[0][0])).replace(/\$\{etWeak\}/g, ET[elLabel(elems6[0][0])]||'') + ' ';
    }
  }
  // Invitación desde el aspecto más tenso de menor orbe
  if (N.s6_tenso) {
    const tenso = carta.aspectos.filter(a => (a.tipo === 'Square' || a.tipo === 'Opposition')).sort((a,b) => a.orb - b.orb)[0];
    if (tenso) s6 += N.s6_tenso.replace(/\$\{p1\}/g, pN(tenso.p1)).replace(/\$\{p2\}/g, pN(tenso.p2)) + ' ';
  }
  if (stelliums.length > 0 && stArea) {
    s6 += (N.s6_stellium || '').replace(/\$\{areaStellium\}/g, stArea) + ' ';
  }
  s6 += (N.s6_cierre || '') + '</p>';

  // === ENSAMBLAJE ===
  const titulos = D.secciones || {};
  let html = '<div class="analisis-titulo">' + (D.titulo || '✦ Análisis Astral Oracular ✦') + '</div>';
  html += '<div class="analisis-subtitulo">' + (D.subtitulo || 'Un viaje psicológico a través de tu mapa natal') + '</div>';
  html += '<div class="analisis-resumen"><h4>' + (titulos.s1_titulo || '1. El Eje de tu Ser (Tu Gran Trío)') + '</h4>' + s1 + '</div>';
  html += '<div class="analisis-seccion"><h4>' + (titulos.s2_titulo || '2. Tu Huella Energética') + '</h4>' + s2 + '</div>';
  html += '<div class="analisis-seccion"><h4>' + (titulos.s3_titulo || '3. Los Escenarios de tu Vida') + '</h4>' + s3 + '</div>';
  html += '<div class="analisis-seccion gold-border"><h4>' + (titulos.s4_titulo || '4. El Motor de tu Crecimiento') + '</h4>' + s4 + '</div>';
  html += '<div class="analisis-seccion gold-border"><h4>' + (titulos.s5_titulo || '5. Tu Brújula Kármica') + '</h4>' + s5 + '</div>';
  html += '<div class="recomendacion-final"><h4>' + (titulos.s6_titulo || '6. El Consejo del Oráculo') + '</h4>' + s6 + '</div>';
  html += '<p class="aviso-final">' + (N.avisoFinal || 'Este análisis es una interpretación simbólica de tu carta astral. Tómalo como espejo para la reflexión y el autoconocimiento, no como pronóstico determinista.') + '</p>';

  // Pase final de placeholders de plantilla que el código no sustituye en línea
  // (${sqSol}, ${eiAsc}, ${etDom}, ${mtDom}, ${masculine}...). Los templates de
  // datos-maestros usan esta nomenclatura; los nombres visibles van traducidos
  // y las descripciones (SQ/EI/ET/MT) se resuelven por clave española (así lo
  // exige la convención de datos-maestros en los 6 locales).
  const _ascS = asc ? _signoKey(asc.signo) : '';
  const _solS = sol ? _signoKey(sol.signo) : '';
  const _lunaS = luna ? _signoKey(luna.signo) : '';
  const _ascSl = asc ? _signoLabel(asc.signo) : '';
  const _solSl = sol ? _signoLabel(sol.signo) : '';
  const _lunaSl = luna ? _signoLabel(luna.signo) : '';
  const _solE = _solS ? SE[_solS] : '';
  const _lunaE = _lunaS ? SE[_lunaS] : '';
  const _ascE = _ascS ? SE[_ascS] : '';
  let _domEl = '', _domMod = '', _weakEl = '', _domElC = '', _weakElC = '', _domModC = '';
  if (st) {
    const _elems = [['Fuego',st.fuego],['Tierra',st.tierra],['Aire',st.aire],['Agua',st.agua]].sort((a,b)=>b[1]-a[1]);
    _domEl = elLabel(_elems[0][0]); _domElC = _elems[0][1]; _weakEl = elLabel(_elems[_elems.length-1][0]); _weakElC = _elems[_elems.length-1][1];
    _domMod = modLabel([['Cardinal',st.cardinal],['Fijo',st.fixed],['Mutable',st.mutable]].sort((a,b)=>b[1]-a[1])[0][0]); _domModC = [['Cardinal',st.cardinal],['Fijo',st.fixed],['Mutable',st.mutable]].sort((a,b)=>b[1]-a[1])[0][1];
  }
  html = html
    .replace(/\$\{sqSol\}/g, SQ[_solS] || '')
    .replace(/\$\{sqLuna\}/g, SQ[_lunaS] || '')
    .replace(/\$\{sqAsc\}/g, SQ[_ascS] || '')
    .replace(/\$\{eiAsc\}/g, EI[_ascE] || '')
    .replace(/\$\{eiSol\}/g, EI[_solE] || '')
    .replace(/\$\{eiLuna\}/g, EI[_lunaE] || '')
    .replace(/\$\{eiDom\}/g, EI[_domEl] || '')
    .replace(/\$\{etSol\}/g, ET[_solE] || '')
    .replace(/\$\{etLuna\}/g, ET[_lunaE] || '')
    .replace(/\$\{etDom\}/g, ET[_domEl] || '')
    .replace(/\$\{etWeak\}/g, ET[_weakEl] || '')
    .replace(/\$\{mtDom\}/g, MT[_domMod] || '')
    .replace(/\$\{masculine\}/g, st ? st.masculine : '')
    .replace(/\$\{feminine\}/g, st ? st.feminine : '')
    .replace(/\$\{buscaSol\}/g, ET[_solE] || '')
    .replace(/\$\{necesitaLuna\}/g, ET[_lunaE] || '')
    .replace(/\$\{solSLower\}/g, (_solSl || '').toLowerCase())
    .replace(/\$\{areaStellium\}/g, stArea)
    .replace(/\$\{numPlanetas\}/g, stNum)
    .replace(/\$\{planetasLista\}/g, stLista)
    .replace(/\$\{domElC\}/g, _domElC)
    .replace(/\$\{weakElC\}/g, _weakElC)
    .replace(/\$\{domModC\}/g, _domModC);

  // Envolver términos técnicos (planetas, signos, cartas) para que sean tapables.
  return envolverTerminos(html);
}

// Evaluar template string desde JSON (sustituye ${var} y ${dict[key]})
function _evalTpl(tpl, ctx) {
  if (!tpl) return '';
  let result = tpl;
  // Sustituir ${CT[n]} → CT[n]
  result = result.replace(/\$\{CT\[(\w+)\]\}/g, (m, key) => ctx.CT[key] || '');
  // Sustituir ${SQ[var]} → SQ[var]
  result = result.replace(/\$\{SQ\[(\w+)\]\}/g, (m, key) => ctx.SQ[key] || '');
  // Sustituir ${n}, ${s}, ${p}
  result = result.replace(/\$\{n\}/g, ctx.n || '');
  result = result.replace(/\$\{s\}/g, ctx.s || '');
  result = result.replace(/\$\{p\}/g, ctx.p || '');
  // Placeholders de aperturas/conectores (sección 3): ${area} (casa), ${signo},
  // ${cualidad} (descripción del signo) y ${cualidadCorta} (primer término).
  // ${signo} muestra el nombre TRADUCIDO; ${cualidad} usa la clave española.
  const sIdx = SIGNOS.findIndex(x => x.nombre === ctx.s);
  const sT = sIdx >= 0 ? tSigno(sIdx) : null;
  result = result.replace(/\$\{area\}/g, ctx.CT[ctx.n] || '');
  result = result.replace(/\$\{signo\}/g, (sT && sT.nombre) || ctx.s || '');
  result = result.replace(/\$\{cualidad\}/g, ctx.SQ[ctx.s] || '');
  result = result.replace(/\$\{cualidadCorta\}/g, (ctx.SQ[ctx.s] || '').split(',')[0] || '');
  result = result.replace(/\$\{planeta\}/g, ctx.p || '');
  return result;
}

export function extraerTextoAnalisisAstral(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?strong>/gi, '')
    .replace(/<\/?h4[^>]*>/gi, '\n')
    .replace(/<\/?div[^>]*>/gi, '\n')
    .replace(/<\/?p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}