// core/analysis.js — Motor de análisis holístico Tarot + I Ching
// i18n: todos los textos se cargan desde datos-maestros (analisisTarot)
import { KB } from '../data/tarot-kb.js?v=69';
import { KB_ICHING } from '../data/iching-kb.js?v=69';
import { tCarta, tKB, tHexagrama, getAnalisisTarot } from '../i18n/i18n.js?v=69';

export const ELEMENTOS = {
  fuego:  { dual: "aire",   opuesto: "agua"   },
  aire:   { dual: "fuego",  opuesto: "tierra" },
  agua:   { dual: "tierra", opuesto: "fuego"  },
  tierra: { dual: "agua",   opuesto: "aire"   }
};
export const ELEMENTO_ASTRO = {
  aries:"fuego", leo:"fuego", sagitario:"fuego",
  tauro:"tierra", virgo:"tierra", capricornio:"tierra",
  geminis:"aire", libra:"aire", acuario:"aire",
  cancer:"agua", escorpio:"agua", piscis:"agua",
  sol:"fuego", marte:"fuego", jupiter:"fuego",
  luna:"agua", venus:"agua",
  mercurio:"aire", urano:"aire",
  neptuno:"agua", pluton:"fuego",
  saturno:"tierra"
};

export function elementoCanonico(el) {
  if (ELEMENTOS[el]) return el;
  if (ELEMENTO_ASTRO[el]) return ELEMENTO_ASTRO[el];
  return null;
}

export function dignidadEntre(el1, el2) {
  const a = elementoCanonico(el1);
  const b = elementoCanonico(el2);
  if (!a || !b) return "neutro";
  if (a === b) return "amigable";
  if (ELEMENTOS[a].dual === b) return "amigable";
  if (ELEMENTOS[a].opuesto === b) return "tenso";
  return "neutro";
}

// Helper: obtener datos traducidos o fallback vacío
function _D() {
  return getAnalisisTarot() || {};
}

// Fallback dictionaries (Spanish, used when i18n not loaded)
const LEXICON_FB = {
  love:    ['amor','pareja','relacion','relación','novio','novia','esposo','esposa','matrimonio','ex','amante','enamorado','enamorar','corazon','corazón','sentimiento','afecto','amistad','amigo','amiga','romantico','romántico'],
  money:   ['dinero','trabajo','empleo','sueldo','economia','economía','finanzas','ricos','rico','pobreza','pobre','herencia','inversion','inversión','negocio','empresa','comercio','venta','comprar','vender','deuda','credito','crédito','banco','ahorro','coste','precio'],
  conflict:['conflicto','pelea','discusion','discusión','pleito','juicio','demandar','denuncia','reyerta','enfrentamiento','rival','enemigo','odio','rencor','venganza','perdonar','perdon','disculpa','ruptura','separacion','separación'],
  work:    ['trabajo','empleo','carrera','profesion','profesión','ascenso','jefe','companero','compañero','oficina','proyecto','negocio','vocacion','vocación','estudio','examen','universidad','escuela','aprendizaje','tarea','labor','funcion','función','puesto','cargo'],
  decision:['decidir','decision','decisión','elegir','eleccion','elección','duda','dudar','opcion','opción','alternativa','camino','ruta','encrucijada','escoger','seleccionar','sopesar','dilema','cruce','bifurcacion','bifurcación'],
  health:  ['salud','enfermedad','enfermo','cuerpo','fisico','físico','dolor','cura','sanar','sanacion','sanación','medico','médico','tratamiento','hospital','clinica','clínica','bienestar','energia','energía','vitalidad','cansancio','agotamiento'],
  change:  ['cambio','cambiar','transformacion','transformación','mudanza','mudar','viaje','mover','nuevo','nueva','comienzo','empezar','iniciar','dejar','soltar','abandonar','final','terminar','cierre','etapa','ciclo','paso','fase','transicion','transición'],
  fear:    ['miedo','temor','asustado','asustada','preocupacion','preocupación','preocupar','angustia','ansiedad','inseguridad','duda','incertidumbre','inquietud','panico','pánico','fobia','amenaza','peligro','riesgo'],
  fire:    ['pasión','pasion','fuego','entusiasmo','energia','energía','impulso','accion','acción','iniciativa','creatividad','motivacion','motivación','ardor','furia','rabia','ira','coraje','valentia','valentía','apasionar'],
  water:   ['emocion','emoción','sentir','sentimiento','lagrima','lágrima','llanto','tristeza','alegria','alegría','felicidad','amor','corazon','corazón','intuicion','intuición','sueño','sueno','sensible','sensibilidad','ternura','compasion','compasión'],
  air:     ['pensar','pensamiento','idea','razon','razón','logica','lógica','comunicacion','comunicación','hablar','decir','palabra','mensaje','claridad','confusion','confusión','mentir','verdad','explicar','analizar','estudiar','aprender','discernir'],
  earth:   ['cuerpo','casa','hogar','familia','tierra','naturaleza','estabilidad','seguridad','raiz','raíz','base','cimientos','patrimonio','bienes','posesion','posesión','campo','cultivar','construir','edificar','asentar','establecer']
};

const DESCRIPCIONES_FB = {
  love: 'relaciones afectivas o amorosas',
  money: 'temas materiales, económicos o financieros',
  conflict: 'conflictos, disputas o tensiones',
  work: 'trabajo, profesión o estudios',
  decision: 'decisiones y encrucijadas',
  health: 'salud física o bienestar',
  change: 'cambios, transiciones o transformaciones',
  fear: 'miedos, preocupaciones o inseguridades'
};

const TEMATICAS_FB = {
  copas: "El palo de Copas (Agua) domina la tirada, lo que sitúa el foco en el terreno emocional, los vínculos afectivos y la intuición.",
  oros: "El palo de Oros (Tierra) domina, señalando que el centro de gravedad está en lo material, laboral o físico.",
  espadas: "El palo de Espadas (Aire) domina, poniendo el acento en la mente, la comunicación y los conflictos.",
  bastos: "El palo de Bastos (Fuego) domina, indicando un momento de acción, pasión e iniciativa.",
};

const PLANTILLA_FB = [
  null, "El Presente muestra la energía central.", "El Desafío representa la fuerza que se cruza.",
  "La Base es la raíz inconsciente.", "El Pasado Reciente aporta el antecedente.",
  "La Corona es lo consciente.", "El Futuro Cercano señala la tendencia.",
  "Tu Actitud, lo que aportas.", "El Entorno, personas y circunstancias.",
  "Esperanzas y Temores.", "El Resultado Final, hacia donde se dirige la energía."
];

const ESPERADO_FB = {
  love: 'copas', fear: 'copas',
  money: 'oros', work: 'oros', health: 'oros',
  conflict: 'espadas', decision: 'espadas',
  change: 'bastos'
};

export function extraerTextoAnalisis(tirada) {
  const a = analizarTirada(tirada);
  const D = _D();
  const EH = D.exportHeaders || {};
  const limpiar = (txt) => txt
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?strong>/gi, '')
    .replace(/<\/?span[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
  let out = "";
  out += (EH.visionGeneral || "VISIÓN GENERAL") + "\n" + limpiar(a.visionGeneral) + "\n\n";
  out += (EH.tematica || "TEMÁTICA TAROT") + "\n" + limpiar(a.tematica) + "\n\n";
  if (a.crucePreguntaTirada) {
    out += (EH.alineacion || "ALINEACIÓN PREGUNTA ↔ TIRADA") + "\n" + limpiar(a.crucePreguntaTirada) + "\n\n";
  }
  out += (EH.lecturaIching || "LECTURA DEL I CHING") + "\n" + limpiar(a.lecturaIching) + "\n\n";
  out += (EH.dinamicas || "DINÁMICAS Y PATRONES TAROT") + "\n";
  a.dinamicas.forEach(d => out += `- ${limpiar(d)}\n`);
  out += "\n" + (EH.dignidades || "DIGNIDADES ELEMENTALES ENTRE CARTAS") + "\n";
  a.dignidades.forEach(d => out += `- ${limpiar(d)}\n`);
  out += "\n" + (EH.posicional || "LECTURA POSICIONAL DETALLADA") + "\n";
  a.posicional.forEach(p => out += `- ${limpiar(p.titulo)}: ${limpiar(p.texto)}\n`);
  out += "\n" + (EH.narrativa || "SÍNTESIS NARRATIVA TAROT") + "\n" + limpiar(a.narrativa) + "\n\n";
  out += (EH.holistico || "ANÁLISIS HOLÍSTICO TAROT ↔ I CHING") + "\n" + limpiar(a.holistico) + "\n\n";
  out += (EH.recomendacion || "RECOMENDACIÓN INTEGRADA") + "\n" + limpiar(a.recomendacion) + "\n";
  return out;
}

export function analizarTirada(tirada) {
  const D = _D();
  const N = D.narrativa || {};
  const VG = D.visionGeneral || {};
  const lexicon = D.lexicon || LEXICON_FB;
  const descripciones = D.descripciones || DESCRIPCIONES_FB;
  const tematicas = D.tematicas || TEMATICAS_FB;
  const esperado = D.esperado || ESPERADO_FB;
  const plantilla = D.plantilla || PLANTILLA_FB;
  const ichingT = D.iching || {};
  const dinamicasT = D.dinamicas || {};
  const dignidadesT = D.dignidades || {};
  const posicionalT = D.posicional || {};
  const narrativaT = D.narrativa || {};
  const holisticoT = D.holistico || {};
  const recomendacionT = D.recomendacion || {};

  const cartas = tirada.cartas;
  const total = cartas.length;
  const pregunta = (tirada.pregunta || '').trim();
  const tienePregunta = pregunta.length > 0;
  let mayores = 0, menores = 0, invertidas = 0, ases = 0;
  let palos = { copas: 0, oros: 0, espadas: 0, bastos: 0 };
  let figuras = { Sota: 0, Caballero: 0, Reina: 0, Rey: 0 };
  let numeros = {};
  let elementosTarot = { fuego: 0, aire: 0, agua: 0, tierra: 0 };

  cartas.forEach(c => {
    const kb = KB[c.nombre];
    if (!kb) return;
    if (kb.tipo === 'mayor') mayores++; else menores++;
    if (c.alReves) invertidas++;
    if (kb.palo) palos[kb.palo]++;
    const elCanon = elementoCanonico(kb.elemento);
    if (elCanon) elementosTarot[elCanon]++;
    if (kb.palo) {
      ['Sota','Caballero','Reina','Rey'].forEach(f => {
        if (c.nombre.startsWith(f)) figuras[f]++;
      });
      if (c.nombre.startsWith('As')) ases++;
      const m = c.nombre.match(/^(\d+) de/);
      if (m) numeros[m[1]] = (numeros[m[1]] || 0) + 1;
    }
  });

  let contextoPregunta = "";
  let palabrasClavePregunta = { fire:0, water:0, air:0, earth:0, love:0, money:0, conflict:0, work:0, decision:0, health:0, change:0, fear:0 };
  if (tienePregunta) {
    const p = pregunta.toLowerCase();
    Object.entries(lexicon).forEach(([cat, palabras]) => {
      palabras.forEach(palabra => {
        if (p.includes(palabra)) palabrasClavePregunta[cat]++;
      });
    });
    let catDom = null, catDomC = 0;
    Object.entries(palabrasClavePregunta).forEach(([cat, c]) => {
      if (c > catDomC) { catDomC = c; catDom = cat; }
    });
    if (catDom && catDomC > 0) {
      contextoPregunta = (VG.preguntaVersa || 'Tu pregunta/intención versa sobre <span class="destacado">{desc}</span>. ').replace('{desc}', descripciones[catDom] || 'tu situación');
    } else {
      contextoPregunta = VG.sinCategoria || 'Tu pregunta/intención se enfoca en un tema general sin una categoría temática dominante clara. ';
    }
  } else {
    // Sin pregunta: la línea 201 ya muestra el aviso "No se especificó ninguna
    // pregunta", así que aquí no se repite el mensaje (evita duplicación).
    contextoPregunta = '';
  }

  const pctMayores = Math.round((mayores / total) * 100);
  const pctInvertidas = Math.round((invertidas / total) * 100);
  let visionGeneral = (VG.preguntaLabel || '<span class="destacado">Pregunta/intención:</span> ');
  if (tienePregunta) {
    visionGeneral += `<em>"${pregunta}"</em><br><br>`;
  } else {
    visionGeneral += `<em>${VG.sinPreguntaLabel || '(No se especificó ninguna pregunta — lectura general del momento)'}</em><br><br>`;
  }
  visionGeneral += contextoPregunta;
  visionGeneral += (VG.tiradaCartas || 'Esta tirada de ${total} carta${s} muestra ${mayores} arcano${sMay} mayor${esMay} (${pctMayores}%) y ${menores} menor${esMen}. ')
    .replace(/\$\{total\}/g, total).replace(/\$\{s\}/g, total > 1 ? 's' : '')
    .replace(/\$\{mayores\}/g, mayores).replace(/\$\{sMay\}/g, mayores !== 1 ? 's' : '').replace(/\$\{esMay\}/g, mayores !== 1 ? 'es' : '')
    .replace(/\$\{pctMayores\}/g, pctMayores).replace(/\$\{menores\}/g, menores).replace(/\$\{esMen\}/g, menores !== 1 ? 'es' : '');
  if (pctMayores >= 50) {
    visionGeneral += VG.mayores50 || 'La presencia mayoritaria de arcanos mayores indica un momento de fuerte calado vital: fuerzas arquetípicas profundas están en juego y los eventos tienen un peso que trasciende lo cotidiano.';
  } else if (pctMayores >= 25) {
    visionGeneral += VG.mayores25 || 'El equilibrio entre arcanos mayores y menores sugiere una mezcla de lo cotidiano con lo significativo.';
  } else {
    visionGeneral += VG.mayoresBajo || 'El predominio de arcanos menores señala que la situación se desarrolla principalmente en el plano práctico y cotidiano.';
  }
  visionGeneral += ' ' + (VG.invertidasCount || 'Hay ${invertidas} carta${s} invertida${s} (${pctInvertidas}%).')
    .replace(/\$\{invertidas\}/g, invertidas).replace(/\$\{s\}/g, invertidas !== 1 ? 's' : '').replace(/\$\{pctInvertidas\}/g, pctInvertidas);
  if (pctInvertidas >= 50) {
    visionGeneral += ' ' + (VG.invertidas50 || 'El alto número de invertidas indica energías bloqueadas o aspectos internos que aún no se han integrado.');
  } else if (pctInvertidas > 0) {
    visionGeneral += ' ' + (VG.invertidasAlgunas || 'Las cartas invertidas señalan zonas donde la energía se expresa con dificultad.');
  } else {
    visionGeneral += ' ' + (VG.invertidasCero || 'Todas las cartas al derecho indican que las energías fluyen con relativa facilidad.');
  }

  let paloDom = null, paloDomC = 0;
  Object.entries(palos).forEach(([p, c]) => { if (c > paloDomC) { paloDomC = c; paloDom = p; } });
  let tematica = "";
  if (paloDom && paloDomC > 0) {
    tematica = tematicas[paloDom] || TEMATICAS_FB[paloDom] || '';
    if (paloDomC >= total * 0.5) tematica += ' ' + (VG.concentracion || 'La concentración en este palo es notable.');
  } else {
    tematica = VG.palosEquilibrados || 'Los palos están equilibrados, lo que indica que la situación toca varios planos a la vez.';
  }

  let crucePreguntaTirada = "";
  if (tienePregunta) {
    let catDom = null, catDomC = 0;
    Object.entries(palabrasClavePregunta).forEach(([cat, c]) => {
      if (c > catDomC) { catDomC = c; catDom = cat; }
    });
    if (catDom && catDomC > 0 && paloDom) {
      const paloEsperado = esperado[catDom];
      if (paloEsperado && paloDom === paloEsperado) {
        crucePreguntaTirada = (D.cruce?.resuena || 'El palo dominante (<span class="ref-tarot">${paloDom}</span>) <span class="destacado">resuena directamente</span> con la temática de tu pregunta (${catDom}).')
          .replace(/\$\{paloDom\}/g, paloDom).replace(/\$\{catDom\}/g, catDom);
      } else if (paloEsperado) {
        crucePreguntaTirada = (D.cruce?.noResuena || 'El palo dominante (<span class="ref-tarot">${paloDom}</span>) no es el esperado para ${catDom}. La respuesta viene por un ángulo distinto.')
          .replace(/\$\{paloDom\}/g, paloDom).replace(/\$\{catDom\}/g, catDom);
      }
    }
  }

  // I Ching - usar tHexagrama para nombres traducidos
  const iching = tirada.iching;
  const numP = iching.numPrincipal;
  const kbHexP_T = tHexagrama(numP);
  const kbHexP = KB_ICHING[String(numP)];
  let lecturaIching = "";
  if (kbHexP_T || kbHexP) {
    const hexName = kbHexP_T?.nombre || kbHexP?.nombre || '';
    const trigInf = kbHexP_T?.trigInf || kbHexP?.trigInf || '';
    const trigSup = kbHexP_T?.trigSup || kbHexP?.trigSup || '';
    const sig = kbHexP_T?.sig || kbHexP?.sig || '';
    const consejo = kbHexP_T?.consejo || kbHexP?.consejo || '';
    lecturaIching = (ichingT.principal || 'El hexagrama principal es <span class="ref-iching">${hexName}</span> (nº ${numP}), formado por <span class="ref-iching">${trigInf}</span> y <span class="ref-iching">${trigSup}</span>. ${sig} El consejo es: <span class="destacado">${consejo}</span>')
      .replace(/\$\{hexName\}/g, `<span data-term="iching:${numP}">${hexName}</span>`).replace(/\$\{numP\}/g, numP)
      .replace(/\$\{trigInf\}/g, trigInf).replace(/\$\{trigSup\}/g, trigSup)
      .replace(/\$\{sig\}/g, sig).replace(/\$\{consejo\}/g, consejo);
    if (iching.hayMutacion && iching.numFuturo) {
      const kbHexF_T = tHexagrama(iching.numFuturo);
      const kbHexF = KB_ICHING[String(iching.numFuturo)];
      if (kbHexF_T || kbHexF) {
        const hexFName = kbHexF_T?.nombre || kbHexF?.nombre || '';
        const hexFSig = kbHexF_T?.sig || kbHexF?.sig || '';
        lecturaIching += '\n\n' + (ichingT.mutantes || 'Las líneas mutantes (${mutantes}) indican evolución hacia <span class="ref-iching">${hexFName}</span> (nº ${numF}). ${hexFSig}')
          .replace(/\$\{mutantes\}/g, iching.lineasMutantes.join(', '))
          .replace(/\$\{hexFName\}/g, `<span data-term="iching:${iching.numFuturo}">${hexFName}</span>`).replace(/\$\{numF\}/g, iching.numFuturo)
          .replace(/\$\{hexFSig\}/g, hexFSig);
      }
    } else {
      lecturaIching += '\n\n' + (ichingT.sinMutantes || 'Sin líneas mutantes, la situación se presenta estable.');
    }
  } else {
    lecturaIching = ichingT.errorHex || "No se pudo cargar el hexagrama.";
  }

  const dinamicas = [];
  if (ases >= 2) dinamicas.push((dinamicasT.ases || 'Presencia de ${ases} Ases: varias semillas de nuevos comienzos.').replace(/\$\{ases\}/g, ases));
  const figTotal = Object.values(figuras).reduce((a, b) => a + b, 0);
  if (figTotal >= 3) dinamicas.push((dinamicasT.corte || 'Hay ${figTotal} cartas de corte: otras personas juegan un papel relevante.').replace(/\$\{figTotal\}/g, figTotal));
  if (figuras.Rey >= 2) dinamicas.push(dinamicasT.reyes || 'Varios Reyes: autoridades masculinas influyen.');
  if (figuras.Reina >= 2) dinamicas.push(dinamicasT.reinas || 'Varias Reinas: figuras femeninas son centrales.');
  Object.entries(numeros).forEach(([n, c]) => {
    if (c >= 2) dinamicas.push((dinamicasT.numero || 'El número ${n} aparece ${c} veces: su cualidad numerológica se refuerza.').replace(/\$\{n\}/g, n).replace(/\$\{c\}/g, c));
  });
  if (invertidas >= total * 0.4) dinamicas.push((dinamicasT.invertidas || 'Alto porcentaje de invertidas (${pctInvertidas}%): bloqueos internos.').replace(/\$\{pctInvertidas\}/g, pctInvertidas));

  const dignidades = [];
  if (total >= 2) {
    for (let i = 0; i < total - 1; i++) {
      const a = KB[cartas[i].nombre];
      const b = KB[cartas[i + 1].nombre];
      if (!a || !b) continue;
      const d = dignidadEntre(a.elemento, b.elemento);
      const c1Ref = `${cartas[i].posicion.split('.')[0]}·<span class="ref-tarot" data-term="tarot:${cartas[i].nombre}"${cartas[i].alReves ? ' data-reves="1"' : ''}>${tCarta(cartas[i].nombre)}</span>`;
      const c2Ref = `${cartas[i + 1].posicion.split('.')[0]}·<span class="ref-tarot" data-term="tarot:${cartas[i + 1].nombre}"${cartas[i + 1].alReves ? ' data-reves="1"' : ''}>${tCarta(cartas[i + 1].nombre)}</span>`;
      if (d === "amigable") {
        dignidades.push((dignidadesT.amigable || '<span class="ref-tarot">${c1}</span> y <span class="ref-tarot">${c2}</span> están en dignidad amigable (${a} + ${b}).')
          .replace(/\$\{c1\}/g, c1Ref).replace(/\$\{c2\}/g, c2Ref).replace(/\$\{a\}/g, a.elemento).replace(/\$\{b\}/g, b.elemento));
      } else if (d === "tenso") {
        dignidades.push((dignidadesT.tension || '<span class="ref-tarot">${c1}</span> y <span class="ref-tarot">${c2}</span> están en tensión (${a} vs ${b}).')
          .replace(/\$\{c1\}/g, c1Ref).replace(/\$\{c2\}/g, c2Ref).replace(/\$\{a\}/g, a.elemento).replace(/\$\{b\}/g, b.elemento));
      }
    }
  }
  if (dignidades.length === 0) dignidades.push(dignidadesT.neutro || "No se observan dinámicas elementales significativas entre cartas adyacentes.");

  const posicional = [];
  // Helper: envolver nombre de carta como término seleccionable.
  // alReves se pasa para que al tap abra el modal con la orientación correcta.
  const cartaTerm = (nombre, alReves) => `<span class="ref-tarot" data-term="tarot:${nombre}"${alReves ? ' data-reves="1"' : ''}>${tCarta(nombre)}</span>`;
  if (tirada.tipo === 'una') {
    const c = cartas[0];
    const kb = KB[c.nombre];
    const kbT = tKB(c.nombre);
    const data = c.alReves ? { kw: kbT?.revesKw || kb.reves.kw, sig: kbT?.revesSig || kb.reves.sig }
                           : { kw: kbT?.kw || kb.derecho.kw, sig: kbT?.sig || kb.derecho.sig };
    posicional.push({ titulo: c.posicion, texto: `${cartaTerm(c.nombre, c.alReves)} ${c.orientacion}: ${data.sig} ${(posicionalT.kwLabel || 'Palabras clave:')} ${data.kw.join(', ')}.` });
  } else if (tirada.tipo === 'tres') {
    cartas.forEach(c => {
      const kb = KB[c.nombre];
      const kbT = tKB(c.nombre);
      const data = c.alReves ? { sig: kbT?.revesSig || kb.reves.sig } : { sig: kbT?.sig || kb.derecho.sig };
      let contexto = "";
      if (c.num === 1) contexto = posicionalT.pasado || "El pasado ha dejado esta energía como herencia.";
      else if (c.num === 2) contexto = posicionalT.presente || "En el presente, esta carta describe la energía actual.";
      else contexto = posicionalT.futuro || "En el futuro cercano, esta energía se vislumbra como tendencia.";
      posicional.push({ titulo: c.posicion, texto: `${cartaTerm(c.nombre, c.alReves)} ${c.orientacion}. ${contexto} ${data.sig}` });
    });
  } else if (tirada.tipo === 'cruz') {
    cartas.forEach(c => {
      const kb = KB[c.nombre];
      const kbT = tKB(c.nombre);
      const data = c.alReves ? { sig: kbT?.revesSig || kb.reves.sig } : { sig: kbT?.sig || kb.derecho.sig };
      posicional.push({ titulo: c.posicion, texto: `${cartaTerm(c.nombre, c.alReves)} ${c.orientacion}. ${plantilla[c.num] || ''} ${data.sig}` });
    });
  }

  let narrativa = "";
  if (tirada.tipo === 'cruz') {
    const c4 = cartas.find(c => c.num === 4);
    const c1 = cartas.find(c => c.num === 1);
    const c2 = cartas.find(c => c.num === 2);
    const c6 = cartas.find(c => c.num === 6);
    const c10 = cartas.find(c => c.num === 10);
    narrativa = (narrativaT.cruz || 'Desde el pasado (<span class="ref-tarot">${c4}</span>), el presente está marcado por <span class="ref-tarot">${c1}</span>, con desafío <span class="ref-tarot">${c2}</span>. El futuro apunta a <span class="ref-tarot">${c6}</span>, y el resultado a <span class="ref-tarot">${c10}</span>.')
      .replace(/\$\{c4\}/g, cartaTerm(c4.nombre, c4.alReves)).replace(/\$\{c1\}/g, cartaTerm(c1.nombre, c1.alReves))
      .replace(/\$\{c2\}/g, cartaTerm(c2.nombre, c2.alReves)).replace(/\$\{c6\}/g, cartaTerm(c6.nombre, c6.alReves))
      .replace(/\$\{c10\}/g, cartaTerm(c10.nombre, c10.alReves));
  } else if (tirada.tipo === 'tres') {
    narrativa = (narrativaT.tres || 'El arco temporal va de <span class="ref-tarot">${c0}</span> (pasado) a <span class="ref-tarot">${c1}</span> (presente), hacia <span class="ref-tarot">${c2}</span> (futuro).')
      .replace(/\$\{c0\}/g, cartaTerm(cartas[0].nombre, cartas[0].alReves)).replace(/\$\{c1\}/g, cartaTerm(cartas[1].nombre, cartas[1].alReves))
      .replace(/\$\{c2\}/g, cartaTerm(cartas[2].nombre, cartas[2].alReves));
  } else {
    narrativa = narrativaT.una || 'La carta única condensa pasado, presente y futuro en una sola energía.';
  }

  const elHexP = kbHexP ? kbHexP.elemento : null;
  let paloDomCanonico = null;
  if (paloDom === 'copas') paloDomCanonico = 'agua';
  else if (paloDom === 'oros') paloDomCanonico = 'tierra';
  else if (paloDom === 'espadas') paloDomCanonico = 'aire';
  else if (paloDom === 'bastos') paloDomCanonico = 'fuego';

  let holistico = "";
  holistico += `<strong>${holisticoT.resonanciaTitulo || '1. Resonancia elemental:'}</strong> `;
  if (paloDomCanonico && elHexP) {
    const d = dignidadEntre(paloDomCanonico, elHexP);
    if (d === "amigable") holistico += (holisticoT.armonia || 'El elemento del Tarot (${palo}) está en <span class="destacado">armonía</span> con el del I Ching (${elHex}).').replace(/\$\{palo\}/g, paloDomCanonico).replace(/\$\{elHex\}/g, elHexP);
    else if (d === "tenso") holistico += (holisticoT.tension || 'El elemento del Tarot (${palo}) está en <span class="destacado">tensión</span> con el del I Ching (${elHex}).').replace(/\$\{palo\}/g, paloDomCanonico).replace(/\$\{elHex\}/g, elHexP);
    else holistico += holisticoT.neutro || 'Los elementos son <span class="destacado">neutros</span> entre sí.';
  } else {
    holistico += (holisticoT.sinPalo || 'No hay palo dominante claro; el I Ching aporta ${elHex} como cualidad de fondo.').replace(/\$\{elHex\}/g, elHexP || (holisticoT.indefinido || 'indefinido'));
  }

  holistico += `\n\n<strong>${holisticoT.convergenciaTitulo || '2. Convergencia del resultado:'}</strong> `;
  let cartaResultado = null;
  if (tirada.tipo === 'cruz') cartaResultado = cartas.find(c => c.num === 10);
  else if (tirada.tipo === 'tres') cartaResultado = cartas[2];
  else cartaResultado = cartas[0];

  if (cartaResultado && (kbHexP_T || kbHexP)) {
    const kbCR = KB[cartaResultado.nombre];
    const kbCRT = tKB(cartaResultado.nombre);
    const dataCR = cartaResultado.alReves ? { sig: kbCRT?.revesSig || kbCR.reves.sig } : { sig: kbCRT?.sig || kbCR.derecho.sig };
    const hexName = kbHexP_T?.nombre || kbHexP?.nombre || '';
    const hexConsejo = kbHexP_T?.consejo || kbHexP?.consejo || '';
    holistico += (holisticoT.convergencia || 'La carta resultado (<span class="ref-tarot">${carta}</span>) y el hexagrama (<span class="ref-iching">${hex}</span>) se complementan. ')
      .replace(/\$\{carta\}/g, cartaTerm(cartaResultado.nombre, cartaResultado.alReves)).replace(/\$\{hex\}/g, `<span data-term="iching:${numP}">${hexName}</span>`);
    const cierreCarta = ['El Mundo','La Muerte','La Torre','El Juicio','10 de Espadas','10 de Bastos','10 de Copas','10 de Oros'].includes(cartaResultado.nombre);
    const cierreHex = ['23','24','49','63','64'].includes(String(numP));
    const comienzoCarta = cartaResultado.nombre.startsWith('As') || ['El Loco','El Mago','La Rueda de la Fortuna'].includes(cartaResultado.nombre);
    const comienzoHex = ['1','3','4','19','24','25'].includes(String(numP));
    if (cierreCarta && cierreHex) holistico += holisticoT.cierreCiclo || 'Ambos coinciden en marcar un cierre de ciclo.';
    else if (comienzoCarta && comienzoHex) holistico += holisticoT.inicio || 'Ambos coinciden en señalar un inicio.';
    else if (cartaResultado.alReves && iching.hayMutacion) holistico += holisticoT.transformacion || 'La carta invertida y las líneas mutantes indican transformación en curso.';
    else holistico += (holisticoT.consejoConvergencia || 'La carta apunta a: "${sig}." El hexagrama aconseja: "${consejo}"')
      .replace(/\$\{sig\}/g, (dataCR.sig || '').split('.')[0]).replace(/\$\{consejo\}/g, hexConsejo);
  }

  if (iching.hayMutacion && iching.numFuturo) {
    const kbHexF_T = tHexagrama(iching.numFuturo);
    const kbHexF = KB_ICHING[String(iching.numFuturo)];
    let cartaFuturo = null;
    if (tirada.tipo === 'cruz') cartaFuturo = cartas.find(c => c.num === 6);
    else if (tirada.tipo === 'tres') cartaFuturo = cartas[2];
    else cartaFuturo = cartas[0];
    holistico += `\n\n<strong>${holisticoT.trayectoriaTitulo || '3. Trayectoria evolutiva:'}</strong> `;
    if ((kbHexF_T || kbHexF) && cartaFuturo) {
      const hexFName = kbHexF_T?.nombre || kbHexF?.nombre || '';
      holistico += (holisticoT.trayectoria || 'El hexagrama futuro (<span class="ref-iching">${hex}</span>) y la carta del futuro (<span class="ref-tarot">${carta}</span>) marcan la dirección.')
        .replace(/\$\{hex\}/g, `<span data-term="iching:${iching.numFuturo}">${hexFName}</span>`).replace(/\$\{carta\}/g, cartaTerm(cartaFuturo.nombre, cartaFuturo.alReves));
    }
  }

  holistico += `\n\n<strong>${holisticoT.sintesisTitulo || '4. Síntesis kármica:'}</strong> `;
  if (pctMayores >= 50 && kbHexP && ['1','2','11','12','29','30','51','52'].includes(String(numP))) {
    holistico += holisticoT.karmico || 'Arcanos mayores + hexagrama arquetípico: la situación toca capas kármicas profundas.';
  } else if (invertidas >= total * 0.4 && kbHexP && ['29','39','47','3','12','23','36'].includes(String(numP))) {
    holistico += holisticoT.trabajoInterior || 'Invertidas + hexagrama de dificultad: se pide trabajo interior antes que acción externa.';
  } else if (pctInvertidas === 0 && kbHexP && ['11','14','35','42','46','55'].includes(String(numP))) {
    holistico += holisticoT.momentoFavorable || 'Cartas al derecho + hexagrama de avance: momento favorable, aprovecha el impulso.';
  } else {
    holistico += holisticoT.matizado || 'La combinación pinta un cuadro matizado: ni todo favorable ni todo adverso.';
  }

  let recomendacion = "";
  if (pctInvertidas >= 50 && kbHexP && ['29','39','47','3'].includes(String(numP))) {
    recomendacion = recomendacionT.r1 || "Ante tantas invertidas y hexagrama de dificultad, no forzar. Escucha y nombra qué sientes. La acción se volverá evidente cuando las energías cedan.";
  } else if (paloDom === 'copas' && kbHexP && ['17','31','54','37','8'].includes(String(numP))) {
    recomendacion = recomendacionT.r2 || "El agua domina. Actúa desde el sentir, no desde el cálculo. Las emociones son información valiosa ahora.";
  } else if (paloDom === 'oros' && kbHexP && ['14','26','41','42','48','50'].includes(String(numP))) {
    recomendacion = recomendacionT.r3 || "La tierra pide concreción. Traduce intuiciones en pasos prácticos. La abundancia se materializa cuando se estructura.";
  } else if (paloDom === 'bastos' && kbHexP && ['1','16','25','34','43','51'].includes(String(numP))) {
    recomendacion = recomendacionT.r4 || "El fuego pide movimiento. La claridad vendrá con la acción. Avanza con decisión sin quemar puentes.";
  } else if (paloDom === 'espadas' && kbHexP && ['6','21','38','4','20'].includes(String(numP))) {
    recomendacion = recomendacionT.r5 || "El aire pide claridad mental. Define qué comunicar y a quién. Una palabra bien elegida vale más que varias acciones.";
  } else if (pctMayores >= 50 && kbHexP && ['1','2','11','12','24','51','52'].includes(String(numP))) {
    recomendacion = recomendacionT.r6 || "La situación tiene peso kármico. Alinéate con el ciclo. Lo que parece obstáculo puede ser la puerta.";
  } else if (iching.hayMutacion) {
    recomendacion = recomendacionT.r7 || "La situación está viva, en evolución. Sé flexible para ajustar el rumbo cuando la energía gire.";
  } else {
    recomendacion = recomendacionT.r8 || "Tirada equilibrada sin extremos. Combina escucha interior con acción práctica. La estabilidad es una base, no un destino.";
  }

  return {
    visionGeneral, tematica, contextoPregunta, crucePreguntaTirada,
    lecturaIching, dinamicas, dignidades,
    posicional, narrativa, holistico, recomendacion,
    estadisticas: { mayores, menores, invertidas, palos, figuras, ases, numeros, paloDom, pctMayores, pctInvertidas, elementosTarot, elHexP, tienePregunta, palabrasClavePregunta }
  };
}

export function generarAnalisis(tirada) {
  const a = analizarTirada(tirada);
  const D = _D();
  const H = D.headers || {};
  let html = '';
  html += `<div class="analisis-titulo">${D.titulo || '✦ Análisis Holístico ✦'}</div>`;
  html += `<div class="analisis-subtitulo">${D.subtitulo || 'Lectura integral de Tarot e I Ching · dignidades elementales · numerología · narrativa · resonancias cruzadas'}</div>`;
  html += `<div class="analisis-resumen"><h4>${H.visionGeneral || '🌌 Visión General'}</h4><p>${a.visionGeneral}</p></div>`;
  html += `<div class="analisis-seccion"><h4>${H.tematica || '🌟 Temática Dominante en el Tarot'}</h4><p>${a.tematica}</p></div>`;
  if (a.crucePreguntaTirada) {
    html += `<div class="analisis-seccion"><h4>${H.alineacion || '🎯 Alineación Pregunta ↔ Tirada'}</h4><p>${a.crucePreguntaTirada}</p></div>`;
  }
  html += `<div class="analisis-seccion iching-border"><h4>${H.lecturaIching || '☯️ Lectura del I Ching'}</h4><p>${a.lecturaIching.replace(/\n/g, '<br>')}</p></div>`;
  if (a.dinamicas.length > 0) {
    html += `<div class="analisis-seccion"><h4>${H.dinamicas || '⚙️ Dinámicas y Patrones del Tarot'}</h4>`;
    a.dinamicas.forEach(d => html += `<p>• ${d}</p>`);
    html += `</div>`;
  }
  html += `<div class="analisis-seccion"><h4>${H.dignidades || '⚡ Relaciones Elementales entre Cartas'}</h4>`;
  a.dignidades.forEach(d => html += `<p>${d}</p>`);
  html += `</div>`;
  html += `<div class="analisis-seccion"><h4>${H.posicional || '📍 Lectura Posicional Detallada'}</h4>`;
  a.posicional.forEach(p => { html += `<p><span class="destacado">${p.titulo}:</span> ${p.texto}</p>`; });
  html += `</div>`;
  html += `<div class="analisis-seccion gold-border"><h4>${H.narrativa || '🌀 Síntesis Narrativa del Tarot'}</h4><p>${a.narrativa}</p></div>`;
  html += `<div class="analisis-seccion gold-border"><h4>${H.holistico || '🔮 Análisis Holístico Tarot ↔ I Ching'}</h4><p>${a.holistico.replace(/\n/g, '<br>')}</p></div>`;
  html += `<div class="recomendacion-final"><h4>${H.recomendacion || '✨ Recomendación Integrada'}</h4><p>${a.recomendacion}</p></div>`;
  html += `<p class="aviso-final">${D.aviso || 'Este análisis es una interpretación simbólica. Tómalo como espejo para la reflexión, no como pronóstico determinista.'}</p>`;
  return html;
}