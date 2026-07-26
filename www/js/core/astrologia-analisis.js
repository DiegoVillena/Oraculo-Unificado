// core/astrologia-analisis.js — Análisis Astral Oracular
// Astrólogo Evolutivo y virtuoso de la escritura terapéutica.
// TOLERANCIA CERO A LA CONCATENACIÓN: no pega definiciones, teje consecuencias psicológicas.
//
// MASTERCLASS DE FUSIÓN: redacta la consecuencia psicológica de la combinación,
// no la lista de sus partes.
//
// i18n: todos los diccionarios y textos narrativos se cargan desde datos-maestros.

import { SIGNOS } from './astrologia.js?v=17';
import { getAnalisisAstral, t, tSigno, tAspecto } from '../i18n/i18n.js?v=17';

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
  if (!carta || !carta.planetas) return '<p>' + t('analisisAstral.sinDatos', null, ) || 'No hay datos suficientes para el análisis.' + '</p>';

  const D = _D();
  const SQ = D.SQ || SQ_FB;
  const SE = D.SE || SE_FB;
  const ET = D.ET || ET_FB;
  const EI = D.EI || EI_FB;
  const MT = D.MT || MT_FB;
  const PA = D.PA || PA_FB;
  const CT = D.CT || CT_FB;
  const N = D.narrativa || {};
  const aperturasArr = D.aperturas || [];
  const conectoresArr = D.conectores || [];
  const retroFrasesArr = D.retroFrases || RETRO_FRASES_FB;
  const gruposRaw = D.grupos || GRUPOS_FB;
  // Normalizar: si grupos viene como array de strings (solo titulos), combinar
  // con las casas por defecto de GRUPOS_FB para tener { titulo, casas }.
  const gruposArr = gruposRaw.map((g, i) => {
    if (g && typeof g === 'object' && Array.isArray(g.casas)) return g;
    const fb = GRUPOS_FB[i] || GRUPOS_FB[0];
    return { titulo: (typeof g === 'string') ? g : (fb.titulo), casas: fb.casas };
  });

  const asc = carta.casasInfo.find(c => c.numero === 1);
  const sol = buscar(carta, 'Sun');
  const luna = buscar(carta, 'Moon');
  const st = carta.estadisticas;
  const aIdx = { v: 0 };
  // Cualidad corta del signo: primera frase de SQ (hasta la primera coma o las 5 primeras palabras)
  const cualidadCortaDe = (signo) => {
    const sq = SQ[signo] || '';
    if (!sq) return '';
    // Tomar hasta la primera coma
    const hasta = sq.split(',')[0];
    return hasta || sq;
  };
  const siguienteApertura = (n, s) => {
    if (aperturasArr.length > 0) {
      const tpl = aperturasArr[aIdx.v++ % aperturasArr.length];
      return _evalTpl(tpl, { n, s, CT, SQ, area: CT[n] || '', signo: s, cualidad: SQ[s] || '', cualidadCorta: cualidadCortaDe(s), planeta: '' });
    }
    return '';
  };
  const cIdx = { v: 0 };
  const siguienteConector = (p, s) => {
    if (conectoresArr.length > 0) {
      const tpl = conectoresArr[cIdx.v++ % conectoresArr.length];
      return _evalTpl(tpl, { p, s, CT, SQ, area: '', signo: s, cualidad: SQ[s] || '', cualidadCorta: cualidadCortaDe(s), planeta: p });
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
    const solE = SE[solS], lunaE = SE[lunaS], ascE = SE[ascS];
    const mismaLuz = solS === lunaS;
    // BuscaSol / necesitaLuna: cualidades SQ del Sol y de la Luna, en minúsculas
    const buscaSol = (SQ[solS] || '').toLowerCase();
    const necesitaLuna = (SQ[lunaS] || '').toLowerCase();

    s1 += '<p>';
    s1 += (N.s1_asc || '')
      .replace(/\$\{ascS\}/g, ascS).replace(/\$\{sqAsc\}/g, SQ[ascS] || '')
      .replace(/\$\{SQ\[ascS\]\}/g, SQ[ascS] || '') || '';
    s1 += ' ';
    s1 += (N.s1_mascara || '').replace(/\$\{ascS\}/g, ascS) || '';
    s1 += ' ';
    s1 += (N.s1_sol || '')
      .replace(/\$\{solS\}/g, solS).replace(/\$\{sqSol\}/g, SQ[solS] || '')
      .replace(/\$\{SQ\[solS\]\}/g, SQ[solS] || '') || '';
    s1 += ' ';
    s1 += (N.s1_solLuz || '') ;

    if (mismaLuz) {
      s1 += (N.s1_lunaConj || '').replace(/\$\{solS\}/g, solS) || '';
      s1 += ' ';
      s1 += (N.s1_lunaConj2 || '').replace(/\$\{solS\}/g, solS).replace(/\$\{solSLower\}/g, (solS||'').toLowerCase()) || '';
      s1 += ' ';
      s1 += (N.s1_lunaConj3 || '').replace(/\$\{solS\}/g, solS).replace(/\$\{sqSol\}/g, SQ[solS] || '').replace(/\$\{SQ\[solS\]\}/g, SQ[solS] || '') || '';
      if (ascE !== solE) {
        s1 += ' ';
        s1 += (N.s1_contrasteAscSol || '')
          .replace(/\$\{ascS\}/g, ascS).replace(/\$\{solS\}/g, solS)
          .replace(/\$\{eiAsc\}/g, EI[ascE]||'').replace(/\$\{eiSol\}/g, EI[solE]||'')
          .replace(/\$\{EI\[ascE\]\}/g, EI[ascE]||'').replace(/\$\{EI\[solE\]\}/g, EI[solE]||'') || '';
        s1 += ' ';
        s1 += (N.s1_contrasteAscSol2 || '')
          .replace(/\$\{ascS\}/g, ascS).replace(/\$\{solS\}/g, solS)
          .replace(/\$\{eiAsc\}/g, EI[ascE]||'').replace(/\$\{eiSol\}/g, EI[solE]||'') || '';
        s1 += ' ';
        s1 += (N.s1_coherencia || '');
      } else {
        s1 += ' ';
        s1 += (N.s1_coherencia || '');
      }
    } else {
      s1 += (N.s1_luna || '')
        .replace(/\$\{lunaS\}/g, lunaS).replace(/\$\{sqLuna\}/g, SQ[lunaS] || '')
        .replace(/\$\{SQ\[lunaS\]\}/g, SQ[lunaS] || '') || '';
      s1 += ' ';
      s1 += (N.s1_lunaRefugio || '');
      if (solE !== lunaE) {
        s1 += ' ';
        s1 += (N.s1_contrasteSolLuna || '')
          .replace(/\$\{etSol\}/g, ET[solE]||'').replace(/\$\{etLuna\}/g, ET[lunaE]||'')
          .replace(/\$\{ET\[solE\]\}/g, ET[solE]||'').replace(/\$\{ET\[lunaE\]\}/g, ET[lunaE]||'') || '';
        s1 += ' ';
        s1 += (N.s1_polaridad1 || '')
          .replace(/\$\{buscaSol\}/g, buscaSol).replace(/\$\{necesitaLuna\}/g, necesitaLuna) || '';
      }
      if (ascE !== solE && ascE !== lunaE) {
        s1 += ' ';
        s1 += (N.s1_triangulacion || '')
          .replace(/\$\{eiAsc\}/g, EI[ascE]||'').replace(/\$\{eiSol\}/g, EI[solE]||'').replace(/\$\{eiLuna\}/g, EI[lunaE]||'')
          .replace(/\$\{EI\[ascE\]\}/g, EI[ascE]||'').replace(/\$\{EI\[solE\]\}/g, EI[solE]||'').replace(/\$\{EI\[lunaE\]\}/g, EI[lunaE]||'') || '';
        s1 += ' ';
        s1 += (N.s1_triangulacion2 || '')
          .replace(/\$\{eiAsc\}/g, EI[ascE]||'').replace(/\$\{eiSol\}/g, EI[solE]||'').replace(/\$\{eiLuna\}/g, EI[lunaE]||'') || '';
      } else {
        s1 += ' ';
        s1 += (N.s1_eje || '');
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
    const [domEl, domElC] = elems[0];
    const [weakEl, weakElC] = elems[3];

    s2 += (N.s2_predominio || '')
      .replace(/\$\{domEl\}/g, domEl).replace(/\$\{domElC\}/g, domElC)
      .replace(/\$\{etDom\}/g, ET[domEl]||'').replace(/\$\{ET\[domEl\]\}/g, ET[domEl]||'');
    s2 += ' ';
    if (domElC >= 5) s2 += (N.s2_concentrado || '')
      .replace(/\$\{eiDom\}/g, EI[domEl]||'').replace(/\$\{EI\[domEl\]\}/g, EI[domEl]||'') + ' ';
    else s2 += (N.s2_tendencia || '') + ' ';
    if (weakElC === 0) s2 += (N.s2_ausencia || '')
      .replace(/\$\{weakEl\}/g, weakEl).replace(/\$\{etWeak\}/g, ET[weakEl]||'')
      .replace(/\$\{ET\[weakEl\]\}/g, ET[weakEl]||'') + ' ';
    else if (weakElC <= 1) s2 += (N.s2_debil || '')
      .replace(/\$\{weakEl\}/g, weakEl).replace(/\$\{weakElC\}/g, weakElC) + ' ';
    else s2 += (N.s2_debil2 || '')
      .replace(/\$\{weakEl\}/g, weakEl).replace(/\$\{weakElC\}/g, weakElC) + ' ';

    const mods = [['Cardinal',st.cardinal],['Fijo',st.fixed],['Mutable',st.mutable]];
    mods.sort((a,b) => b[1]-a[1]);
    const [domMod, domModC] = mods[0];
    s2 += (N.s2_modalidad || '')
      .replace(/\$\{domMod\}/g, domMod).replace(/\$\{domModC\}/g, domModC)
      .replace(/\$\{mtDom\}/g, MT[domMod]||'').replace(/\$\{MT\[domMod\]\}/g, MT[domMod]||'') + ' ';
    if (st.masculine > st.feminine + 2) s2 += (N.s2_yang || '')
      .replace(/\$\{masculine\}/g, st.masculine).replace(/\$\{feminine\}/g, st.feminine)
      .replace(/\$\{st\.masculine\}/g, st.masculine).replace(/\$\{st\.feminine\}/g, st.feminine) + ' ';
    else if (st.feminine > st.masculine + 2) s2 += (N.s2_yin || '')
      .replace(/\$\{masculine\}/g, st.masculine).replace(/\$\{feminine\}/g, st.feminine)
      .replace(/\$\{st\.masculine\}/g, st.masculine).replace(/\$\{st\.feminine\}/g, st.feminine) + ' ';
    else s2 += (N.s2_equilibrio || '')
      .replace(/\$\{masculine\}/g, st.masculine).replace(/\$\{feminine\}/g, st.feminine)
      .replace(/\$\{st\.masculine\}/g, st.masculine).replace(/\$\{st\.feminine\}/g, st.feminine) + ' ';
  }

  // Stellium
  const stelliums = [];
  for (let i = 1; i <= 12; i++) {
    const ps = enCasa(carta, i);
    if (ps.length >= 3) stelliums.push({ casa:i, planetas:ps });
  }
  if (stelliums.length > 0) {
    const s0 = stelliums[0];
    const areaStellium = (CT[s0.casa] || '').split(',')[0];
    const planetasLista = s0.planetas.map(p => pES(p.nombre)).join(', ');
    const numPlanetas = String(s0.planetas.length);
    s2 += (N.s2_stellium || '')
      .replace(/\$\{CT\[s0\.casa\]\}/g, CT[s0.casa]||'')
      .replace(/\$\{areaStellium\}/g, areaStellium)
      .replace(/\$\{s0\.planetas\.length\}/g, numPlanetas)
      .replace(/\$\{numPlanetas\}/g, numPlanetas)
      .replace(/\$\{planetas\}/g, planetasLista)
      .replace(/\$\{planetasLista\}/g, planetasLista) + ' ';
    s2 += (N.s2_stellium2 || '') + ' ';
    s2 += (N.s2_stellium3 || '') + '</p>';
  } else {
    s2 += (N.s2_noStellium || '') + '</p>';
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
          const con = siguienteConector(pES(p.nombre), _signoKey(p.signo));
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
  let aspectosClave = carta.aspectos
    .filter(a => a.orb < 6)
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 4);

  let s4 = '';
  if (aspectosClave.length === 0) {
    s4 = '<p>' + (N.s4_sinAspectos || '') + '</p>';
  } else {
    // Mapeo de nombres de aspecto en inglés (a.tipo) a prefijo corto del JSON
    const tipoPrefijo = {
      'Conjunction': 'conj', 'Opposition': 'opp', 'Sextile': 'sex',
      'Square': 'sq', 'Trine': 'tri',
    };
    aspectosClave.forEach(a => {
      s4 += '<p>';
      const p1 = pES(a.p1), p2 = pES(a.p2);
      const desc1 = descripcionAspecto(a.p1);
      const desc2 = descripcionAspecto(a.p2);
      const desc1Cap = desc1.charAt(0).toUpperCase() + desc1.slice(1);
      const orbStr = a.orb.toFixed(1) + '°';

      const pref = tipoPrefijo[a.tipo] || a.tipo.toLowerCase();
      // Concatenar las 3 partes del aspecto (intro + descripción + consejo)
      for (const suf of ['1', '2', '3']) {
        const tpl = N['s4_' + pref + suf];
        if (!tpl) continue;
        s4 += tpl
          .replace(/\$\{p1\}/g, p1).replace(/\$\{p2\}/g, p2).replace(/\$\{orbStr\}/g, orbStr)
          .replace(/\$\{desc1\}/g, desc1).replace(/\$\{desc2\}/g, desc2)
          .replace(/\$\{desc1Cap\}/g, desc1Cap);
      }
      s4 += '</p>';
    });
  }

  // ============================================================
  // 5. TU BRÚJULA KÁRMICA
  // ============================================================
  let s5 = '<p>';
  const nodoN = buscar(carta, 'N Node');
  if (nodoN) {
    const signo = _signoKey(nodoN.signo);
    const sqSigno = SQ[signo] || '';
    s5 += (N.s5_nodoN || '')
      .replace(/\$\{nodoN\.signo\.nombre\}/g, signo)
      .replace(/\$\{SQ\[nodoN\.signo\.nombre\]\}/g, sqSigno)
      .replace(/\$\{signo\}/g, signo)
      .replace(/\$\{sqSigno\}/g, sqSigno) + ' ';
    s5 += (N.s5_nodoN2 || '') + ' ';
  }
  if (carta.southNode) {
    const signo = _signoKey(carta.southNode.signo);
    s5 += (N.s5_nodoS || '')
      .replace(/\$\{carta\.southNode\.signo\.nombre\}/g, signo)
      .replace(/\$\{signo\}/g, signo) + ' ';
  }
  const lilith = buscar(carta, 'Lilith');
  if (lilith) {
    const signo = _signoKey(lilith.signo);
    const sqSigno = SQ[signo] || '';
    s5 += (N.s5_lilith || '')
      .replace(/\$\{lilith\.signo\.nombre\}/g, signo)
      .replace(/\$\{SQ\[lilith\.signo\.nombre\]\}/g, sqSigno)
      .replace(/\$\{signo\}/g, signo)
      .replace(/\$\{sqSigno\}/g, sqSigno) + ' ';
  }
  if (carta.partOfFortune) {
    const signo = _signoKey(carta.partOfFortune.signo);
    s5 += (N.s5_fortuna || '')
      .replace(/\$\{carta\.partOfFortune\.signo\.nombre\}/g, signo)
      .replace(/\$\{signo\}/g, signo) + ' ';
  }
  s5 += '</p>';

  // ============================================================
  // 6. EL CONSEJO DEL ORÁCULO (3 líneas)
  // ============================================================
  let s6 = '<p>';
  if (st) {
    if (st.masculine > st.feminine + 2) s6 += (N.s6_yang || '') + ' ';
    else if (st.feminine > st.masculine + 2) s6 += (N.s6_yin || '') + ' ';
    else s6 += (N.s6_equilibrio || '') + ' ';
  }
  if (stelliums.length > 0) {
    const ctStr = (CT[stelliums[0].casa] || '').split(',')[0];
    s6 += (N.s6_stellium || '')
      .replace(/\$\{CT\[stelliums\[0\]\.casa\]\.split\(','\)\[0\]\}/g, ctStr)
      .replace(/\$\{areaStellium\}/g, ctStr) + ' ';
  }
  s6 += (N.s6_cierre || '') + '</p>';

  // === ENSAMBLAJE ===
  const titulos = D.secciones || {};

  // === MAPA DE SUSTITUCIÓN GENÉRICO ===
  // Las plantillas del JSON traducido usan nombres cortos (${ascS}, ${sqAsc},
  // ${eiSol}, ${etSol}, ${signo}, ${sqSigno}, ${domEl}, etc.) que en algunos
  // casos no coinciden con los replace() puntuales del código. Aquí
  // reemplazamos de forma genérica cualquier placeholder que haya quedado sin
  // resolver, usando los valores ya calculados en el análisis.
  const ascS = asc ? _signoKey(asc.signo) : '';
  const solS = sol ? _signoKey(sol.signo) : '';
  const lunaS = luna ? _signoKey(luna.signo) : '';
  const solE = sol ? SE[solS] : '';
  const lunaE = luna ? SE[lunaS] : '';
  const ascE = asc ? SE[ascS] : '';
  const nodoNSigno = (buscar(carta, 'N Node')) ? _signoKey(buscar(carta, 'N Node').signo) : '';
  const nodoSSigno = carta.southNode ? _signoKey(carta.southNode.signo) : '';
  const lilithSigno = (buscar(carta, 'Lilith')) ? _signoKey(buscar(carta, 'Lilith').signo) : '';
  const fortunaSigno = carta.partOfFortune ? _signoKey(carta.partOfFortune.signo) : '';

  // Elementos dominantes/débiles (si st está disponible)
  let domEl = '', weakEl = '', domMod = '', mtDom = '', etDom = '', etWeak = '';
  let domElC = '', weakElC = '', domModC = '', eiDom = '';
  if (st) {
    const elems = [['Fuego',st.fuego],['Tierra',st.tierra],['Aire',st.aire],['Agua',st.agua]];
    elems.sort((a,b) => b[1]-a[1]);
    [domEl, domElC] = elems[0];
    [weakEl, weakElC] = elems[3];
    etDom = ET[domEl] || '';
    etWeak = ET[weakEl] || '';
    eiDom = EI[domEl] || '';
    const mods = [['Cardinal',st.cardinal],['Fijo',st.fixed],['Mutable',st.mutable]];
    mods.sort((a,b) => b[1]-a[1]);
    [domMod, domModC] = mods[0];
    mtDom = MT[domMod] || '';
  }

  // Stelliums (área)
  let areaStellium = '', planetasLista = '', numPlanetas = '';
  if (stelliums.length > 0) {
    const s0 = stelliums[0];
    areaStellium = (CT[s0.casa] || '').split(',')[0];
    planetasLista = s0.planetas.map(p => pES(p.nombre)).join(', ');
    numPlanetas = String(s0.planetas.length);
  }

  const placeholderMap = {
    ascS, solS, lunaS,
    sqAsc: SQ[ascS] || '', sqSol: SQ[solS] || '', sqLuna: SQ[lunaS] || '',
    eiAsc: EI[ascE] || '', eiSol: EI[solE] || '', eiLuna: EI[lunaE] || '',
    etSol: ET[solE] || '', etLuna: ET[lunaE] || '',
    solSLower: (solS || '').toLowerCase(),
    domEl, domElC, weakEl, weakElC, etDom, etWeak, eiDom,
    domMod, domModC, mtDom,
    masculine: st ? st.masculine : '', feminine: st ? st.feminine : '',
    areaStellium, planetasLista, numPlanetas,
    // Sección 5 (kármica): ${signo} y ${sqSigno} se rellenan según el planeta
    // que toque. Aquí no podemos saber cuál, así que los sustituimos por
    // el del Nodo Norte por defecto (el más frecuente en s5_nodoN).
    signo: nodoNSigno,
    sqSigno: SQ[nodoNSigno] || '',
  };

  function _resolverPlaceholders(str) {
    if (!str) return str;
    let out = str;
    // Primero los largos (que contienen puntos/indices) para evitar dejar
    // residuos del estilo ${nodoN.signo.nombre}.
    out = out.replace(/\$\{nodoN\.signo\.nombre\}/g, nodoNSigno);
    out = out.replace(/\$\{SQ\[nodoN\.signo\.nombre\]\}/g, SQ[nodoNSigno] || '');
    out = out.replace(/\$\{carta\.southNode\.signo\.nombre\}/g, nodoSSigno);
    out = out.replace(/\$\{lilith\.signo\.nombre\}/g, lilithSigno);
    out = out.replace(/\$\{SQ\[lilith\.signo\.nombre\]\}/g, SQ[lilithSigno] || '');
    out = out.replace(/\$\{carta\.partOfFortune\.signo\.nombre\}/g, fortunaSigno);
    out = out.replace(/\$\{SQ\[ascS\]\}/g, SQ[ascS] || '');
    out = out.replace(/\$\{SQ\[solS\]\}/g, SQ[solS] || '');
    out = out.replace(/\$\{SQ\[lunaS\]\}/g, SQ[lunaS] || '');
    out = out.replace(/\$\{EI\[ascE\]\}/g, EI[ascE] || '');
    out = out.replace(/\$\{EI\[solE\]\}/g, EI[solE] || '');
    out = out.replace(/\$\{EI\[lunaE\]\}/g, EI[lunaE] || '');
    out = out.replace(/\$\{ET\[solE\]\}/g, ET[solE] || '');
    out = out.replace(/\$\{ET\[lunaE\]\}/g, ET[lunaE] || '');
    out = out.replace(/\$\{ET\[domEl\]\}/g, ET[domEl] || '');
    out = out.replace(/\$\{ET\[weakEl\]\}/g, ET[weakEl] || '');
    out = out.replace(/\$\{EI\[domEl\]\}/g, EI[domEl] || '');
    out = out.replace(/\$\{MT\[domMod\]\}/g, MT[domMod] || '');
    out = out.replace(/\$\{CT\[s0\.casa\]\}/g, stelliums[0] ? (CT[stelliums[0].casa]||'') : '');
    out = out.replace(/\$\{s0\.planetas\.length\}/g, stelliums[0] ? String(stelliums[0].planetas.length) : '');
    out = out.replace(/\$\{planetas\}/g, planetasLista);
    out = out.replace(/\$\{st\.masculine\}/g, st ? st.masculine : '');
    out = out.replace(/\$\{st\.feminine\}/g, st ? st.feminine : '');
    out = out.replace(/\$\{solS\.toLowerCase\(\)\}/g, (solS||'').toLowerCase());
    // Sustitución genérica de placeholders simples ${name}
    out = out.replace(/\$\{([a-zA-Z0-9_]+)\}/g, (m, key) => {
      if (Object.prototype.hasOwnProperty.call(placeholderMap, key)) {
        return String(placeholderMap[key]);
      }
      return m; // si no lo conocemos, dejarlo (pero ya casi no quedan)
    });
    return out;
  }

  s1 = _resolverPlaceholders(s1);
  s2 = _resolverPlaceholders(s2);
  s3 = _resolverPlaceholders(s3);
  s4 = _resolverPlaceholders(s4);
  s5 = _resolverPlaceholders(s5);
  s6 = _resolverPlaceholders(s6);

  let html = '<div class="analisis-titulo">' + (D.titulo || '✦ Análisis Astral Oracular ✦') + '</div>';
  html += '<div class="analisis-subtitulo">' + (D.subtitulo || 'Un viaje psicológico a través de tu mapa natal') + '</div>';
  html += '<div class="analisis-resumen"><h4>' + (titulos.s1 || '1. El Eje de tu Ser (Tu Gran Trío)') + '</h4>' + s1 + '</div>';
  html += '<div class="analisis-seccion"><h4>' + (titulos.s2 || '2. Tu Huella Energética') + '</h4>' + s2 + '</div>';
  html += '<div class="analisis-seccion"><h4>' + (titulos.s3 || '3. Los Escenarios de tu Vida') + '</h4>' + s3 + '</div>';
  html += '<div class="analisis-seccion gold-border"><h4>' + (titulos.s4 || '4. El Motor de tu Crecimiento') + '</h4>' + s4 + '</div>';
  html += '<div class="analisis-seccion gold-border"><h4>' + (titulos.s5 || '5. Tu Brújula Kármica') + '</h4>' + s5 + '</div>';
  html += '<div class="recomendacion-final"><h4>' + (titulos.s6 || '6. El Consejo del Oráculo') + '</h4>' + s6 + '</div>';
  html += '<p class="aviso-final">' + (N.avisoFinal || 'Este análisis es una interpretación simbólica de tu carta astral. Tómalo como espejo para la reflexión y el autoconocimiento, no como pronóstico determinista.') + '</p>';
  return html;
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
  // Sustituir placeholders simples adicionales (area, signo, cualidad,
  // cualidadCorta, planeta) usados por las aperturas y conectores del JSON.
  const extras = ['area', 'signo', 'cualidad', 'cualidadCorta', 'planeta'];
  for (const k of extras) {
    const re = new RegExp('\\$\\{' + k + '\\}', 'g');
    result = result.replace(re, ctx[k] != null ? ctx[k] : '');
  }
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