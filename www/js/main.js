// main.js — Entry point Oráculo Unificado (reconstruido)
import { initTabs, cambiarPestana } from './ui/tabs.js?v=72';
import { initFormularioAstral, render as renderAstral } from './ui/astral.js?v=72';
import { initFormularioSinastria, render as renderSinastria, getTextoCopia as getTextoCopiaSinastria, copiar as copiarSinastria, compartir as compartirSinastria, getUltimaSinastria, poblarSelects as poblarSelectsSinastria } from './ui/sinastria.js?v=72';
import { realizarConsulta, mostrarAnalisis, copiarResultados, compartirResultados, getUltimaTirada, getTextoCopia, visualizarTiradaGuardada } from './ui/tarot.js?v=72';
import { abrirModal, abrirModalIching, cerrarModal } from './ui/modal.js?v=72';
import { inicializarGlosario, resetMapaTerminos } from './ui/glossary.js?v=72';
import * as storage from './storage.js?v=72';
import { getUltimaCarta, generarTextoCarta, gradosASigno, SIGNOS } from './core/astrologia.js?v=72';
import { analizarCartaAstral, extraerTextoAnalisisAstral } from './core/astrologia-analisis.js?v=72';
import { analisisAstralIA, analisisCombinadoIA, analisisSinastriaIA, markdownAHtml, generarTextoCopiaAstral } from './core/ia-api.js?v=72';
import { fraseAspecto, frasePlanetaEnCasa, fraseFactor } from './core/sinastria-dictionary.js?v=72';
import { mostrarDonacionSiToca, abrirAcercaDe, actualizarFooterDonacion } from './ui/donacion.js?v=72';
import { initDB } from './data/sqlite-db.js?v=72';
import { initOnboarding } from './ui/onboarding.js?v=72';
import { initI18n, t, cambiarIdioma, getIdioma, getIdiomasSoportados, tSigno } from './i18n/i18n.js?v=72';

window.__tarotUI = { abrirModal, abrirModalIching, realizarConsulta, mostrarAnalisis, copiarResultados, compartirResultados, cerrarModal };

window.__app = {
  cambiarPestana,
  guardarTirada: () => {
    const tirada = getUltimaTirada();
    if (!tirada) { alert(t('main.realizaTirada')); return; }
    storage.guardarTirada(tirada);
    const btn = document.getElementById('btn-guardar-tirada');
    if (btn) { const o = btn.innerText; btn.innerText = t('main.guardada'); setTimeout(() => btn.innerText = o, 2000); }
  },
  verTiradasGuardadas: () => toggleVerGuardadas('tiradas-guardadas-lista', renderTiradasGuardadas),
  verTiradaGuardada: (i) => {
    const lista = storage.obtenerTiradas();
    if (i < 0 || i >= lista.length) return;
    const item = lista[i];
    if (item.datos) {
      visualizarTiradaGuardada(item.datos);
    } else {
      alert(t('main.sinDatosTirada'));
    }
  },
  borrarTirada: (i) => confirmar(t('main.borrarTirada') || '¿Borrar esta tirada?', () => { storage.borrarTirada(i); renderTiradasGuardadas(); }),
  borrarTodasTiradas: () => confirmar(t('main.borrarTiradas'), () => { storage.borrarTodasTiradas(); renderTiradasGuardadas(); }),
  guardarCartaAstral: () => {
    const c = getUltimaCarta();
    if (!c) { alert(t('main.calculaCarta')); return; }
    const titulo = document.getElementById('astral-titulo')?.textContent || t('main.cartaAstral');
    const subtitulo = document.getElementById('astral-subtitulo')?.textContent || '';
    const texto = generarTextoCarta(c);
    storage.guardarCarta({ titulo, subtitulo, texto, datos: c });
    // Refrescar los selects de sinastria (los índices cambian al añadir una carta)
    if (typeof poblarSelectsSinastria === 'function') poblarSelectsSinastria();
    const btn = document.getElementById('btn-guardar-carta');
    if (btn) { const o = btn.innerText; btn.innerText = t('main.guardada'); setTimeout(() => btn.innerText = o, 2000); }
  },
  verCartasGuardadas: () => toggleVerGuardadas('cartas-guardadas-lista', renderCartasGuardadas),
  verCartaAstralGuardada: (i) => renderCartaGuardada(i),
  borrarCarta: (i) => confirmar(t('main.borrarCarta') || '¿Borrar esta carta astral?', () => { storage.borrarCarta(i); renderCartasGuardadas(); if (typeof poblarSelectsSinastria === 'function') poblarSelectsSinastria(); }),
  borrarTodasCartas: () => confirmar(t('main.borrarCartas'), () => { storage.borrarTodasCartas(); renderCartasGuardadas(); if (typeof poblarSelectsSinastria === 'function') poblarSelectsSinastria(); }),
  analizarCartaAstral: () => mostrarAnalisisAstral(),
  cambiarIdioma: (lang) => cambiarIdioma(lang),
  getIdioma: () => getIdioma(),
  getIdiomasSoportados: () => getIdiomasSoportados(),
  analizarCombinado: () => mostrarAnalisisCombinado(),
  copiarAstralTodo: () => copiarAstralConAnalisis(),
  // Sinastria
  analizarSinastria: () => mostrarAnalisisSinastria(),
  copiarSinastriaYAnalisis: () => copiarSinastriaConAnalisis(),
  guardarSinastria: () => {
    const { resultado, cartas } = getUltimaSinastria();
    if (!resultado || !cartas) { alert(t('sinastria.calculaPrimero') || 'Calcula una sinastria primero.'); return; }
    const nombreA = cartas.cartaA.nombre || (t('sinastria.personaA') || 'Persona A');
    const nombreB = cartas.cartaB.nombre || (t('sinastria.personaB') || 'Persona B');
    const titulo = `${nombreA} 💞 ${nombreB}`;
    const subtitulo = `${resultado.globalScore}% · ${resultado.compatibilidadLabel}`;
    const texto = getTextoCopiaSinastria(resultado, cartas.cartaA, cartas.cartaB);
    storage.guardarSinastria({ titulo, subtitulo, texto, datos: { cartaA: cartas.cartaA, cartaB: cartas.cartaB, resultado } });
    const btn = document.getElementById('btn-guardar-sinastria');
    if (btn) { const o = btn.innerText; btn.innerText = t('main.guardada'); setTimeout(() => btn.innerText = o, 2000); }
  },
  verSinastriasGuardadas: () => toggleVerGuardadas('sinastrias-guardadas-lista', renderSinastriasGuardadas),
  verSinastriaGuardada: (i) => renderSinastriaGuardada(i),
  borrarSinastria: (i) => confirmar(t('main.borrarSinastria') || '¿Borrar esta sinastría?', () => { storage.borrarSinastria(i); renderSinastriasGuardadas(); }),
  borrarTodasSinastrias: () => confirmar(t('main.borrarSinastrias') || '¿Borrar todas las sinastrias?', () => { storage.borrarTodasSinastrias(); renderSinastriasGuardadas(); }),
};

// === SELECTOR DE IDIOMA ===
function mostrarSelectorIdioma() {
  // Si ya hay un selector abierto, cerrarlo
  const existente = document.getElementById('idioma-modal');
  if (existente) { existente.remove(); return; }

  const idiomaActual = getIdioma();
  const soportados = getIdiomasSoportados();
  const nombresIdiomas = { es: 'Español', en: 'English', pt: 'Português', fr: 'Français', de: 'Deutsch', it: 'Italiano' };

  const modal = document.createElement('div');
  modal.className = 'idioma-modal-overlay';
  modal.id = 'idioma-modal';
  let html = '<div class="idioma-modal">';
  html += '<h3 data-i18n="idioma.titulo">Idioma</h3>';
  soportados.forEach(cod => {
    const activo = cod === idiomaActual ? 'activo' : '';
    html += `<button id="btn-idioma-${cod}" class="idioma-opcion ${activo}" data-lang="${cod}">${nombresIdiomas[cod]}</button>`;
  });
  html += '</div>';
  modal.innerHTML = html;
  document.body.appendChild(modal);

  // Eventos
  modal.querySelectorAll('.idioma-opcion').forEach(btn => {
    btn.addEventListener('click', async () => {
      const lang = btn.getAttribute('data-lang');
      await cambiarIdioma(lang);
      resetMapaTerminos(); // resetear mapa de términos del glosario (nombres traducidos cambian)
      modal.remove();
      // Re-renderizar onboarding si está visible
      const onb = document.getElementById('onboarding-overlay');
      if (onb) { onb.remove(); initOnboarding(); }
    });
  });
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// === ANÁLISIS ASTRAL ORACULAR ===
// Guarda el texto de análisis (IA o local) para que copiarAstralConAnalisis() lo incluya.
let _ultimoAnalisisAstral = '';

async function mostrarAnalisisAstral() {
  const c = getUltimaCarta();
  if (!c) { alert(t('main.calculaAstral')); return; }
  const cont = document.getElementById('astral-interpretacion');
  if (!cont) return;
  // Spinner mientras la IA procesa
  cont.innerHTML = '<div class="ia-spinner"><div class="ia-spinner-icon">✨</div><p>' + t('ia.generando') + '</p></div>';
  cont.style.display = 'block';
  const btn = document.getElementById('btn-analisis-astral');
  if (btn) btn.style.display = 'none';

  try {
    const textoCarta = generarTextoCopiaAstral(c);
    const htmlIA = await analisisAstralIA(textoCarta);
    _ultimoAnalisisAstral = htmlIA;
    cont.innerHTML = '<div class="analisis-origen ia-origen">' + t('ia.origenIA') + '</div>' + htmlIA;
    // Mostrar botón "Copiar todo (con análisis)" en la zona de botones astrales
    const btnCopiarTodoAstral = document.getElementById('btn-copiar-astral-todo');
    if (btnCopiarTodoAstral) btnCopiarTodoAstral.style.display = 'block';
    const btnCompartirTodoAstral = document.getElementById('btn-compartir-astral-todo');
    if (btnCompartirTodoAstral) btnCompartirTodoAstral.style.display = 'block';
    mostrarDonacionSiToca(cont);
    setTimeout(() => cont.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  } catch (err) {
    console.warn('[IA] Fallback a analisis local:', err.message);
    // Fallback al algoritmo local
    try {
      const html = analizarCartaAstral(c);
      _ultimoAnalisisAstral = html;
      cont.innerHTML = '<div class="analisis-origen local-origen">' + t('ia.origenLocalAstral') + '</div>' + html;
      const btnCopiarTodoAstral2 = document.getElementById('btn-copiar-astral-todo');
      if (btnCopiarTodoAstral2) btnCopiarTodoAstral2.style.display = 'block';
      const btnCompartirTodoAstral2 = document.getElementById('btn-compartir-astral-todo');
      if (btnCompartirTodoAstral2) btnCompartirTodoAstral2.style.display = 'block';
    } catch (err2) {
      cont.innerHTML = '<p style="color:#ff5252">' + t('ia.errorGenerar', {err: err2.message}) + '' + err2.message + '</p>';
    }
    setTimeout(() => cont.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
}

// === COPIAR CARTA ASTRAL + ANÁLISIS ===
function copiarAstralConAnalisis() {
  const c = getUltimaCarta();
  if (!c) { alert(t('main.calculaAstral')); return; }
  const np = t('astral.nombresPlanetarios');
  const getNP = (n) => (np && typeof np === 'object' && np[n]) ? np[n] : n;
  let txt = t('astral.copyHeader') + ' ' + (c.nombre||'').toUpperCase() + '\n' +
    t('astral.copyFecha') + ' ' + c.fecha + '\n' +
    t('astral.copyHora') + ' ' + c.hora + '\n' +
    t('astral.copyLugar') + ' ' + (c.ciudad?c.ciudad.nombre:'') + '\n\n' +
    generarTextoCopiaAstral(c) + '\n' + t('astral.copyAspectos') + '\n' +
    c.aspectos.map(a=>getNP(a.p1)+' '+a.simbolo+' '+getNP(a.p2)+' ('+tAspecto(a.tipo)+', orb '+a.orb.toFixed(1)+'°)').join('\n');
  if (c.partOfFortune) txt += "\n\n" + t('copiar.partOfFortune') + " " + (c.partOfFortune.signo?.nombre || '') + ' ' + c.partOfFortune.grados + '°' + c.partOfFortune.minutos + "'";
  if (c.southNode) txt += '\n' + t('copiar.southNode') + ' ' + (c.southNode.signo?.nombre || '') + ' ' + c.southNode.grados + '°' + c.southNode.minutos + "'";

  // Añadir el análisis (IA o local) si existe
  if (_ultimoAnalisisAstral) {
    // Convertir HTML a texto plano
    const tmp = document.createElement('div');
    tmp.innerHTML = _ultimoAnalisisAstral;
    txt += '\n\n=== ANÁLISIS ASTRAL ===\n' + (tmp.innerText || tmp.textContent || '').trim();
  }

  // Copiar al portapapeles (con fallback)
  try {
    navigator.clipboard.writeText(txt);
  } catch(e) {
    const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
  }
  // Feedback visual en TODOS los botones de copiar astral visibles
  document.querySelectorAll('#astral-interpretacion .btn-sec.copiar, #btn-copiar-astral, #btn-copiar-astral-todo').forEach(b => {
    const old = b.innerHTML;
    b.innerHTML = t('astral.copiado') || '✓ Copiado';
    setTimeout(() => b.innerHTML = old, 2000);
  });
}

// === ANÁLISIS COMBINADO (Tarot + Astral) ===
async function mostrarAnalisisCombinado() {
  const c = getUltimaCarta();
  const tirada = getUltimaTirada();
  if (!c || !tirada) { alert(t('main.necesitaAmbos')); return; }

  // Crear contenedor en la pestana activa
  let cont = document.getElementById('analisis-combinado-output');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'analisis-combinado-output';
    cont.className = 'analisis-contenedor';
    // Insertar despues del boton de analisis combinado
    const btn = document.getElementById('btn-analisis-combinado');
    btn.parentNode.insertBefore(cont, btn.nextSibling);
  }
  cont.innerHTML = '<div class="ia-spinner"><div class="ia-spinner-icon">✨</div><p>' + t('ia.generando') + '</p></div>';
  cont.style.display = 'block';
  const btn = document.getElementById('btn-analisis-combinado');
  if (btn) btn.style.display = 'none';

  // Texto de la tirada
  let textoTirada = t('copiar.preguntaRealizada') + '\n';
  textoTirada += tirada.pregunta || t('copiar.sinPregunta');
  textoTirada += '\n\n' + t('copiar.tiradaTarot', {tipo: tirada.tipo === 'una' ? t('tarot.nombreTirada1') : (tirada.tipo === 'tres' ? t('tarot.nombreTirada3') : t('tarot.nombreTiradaCruz'))}) + '\n';
  tirada.cartas.forEach(card => {
    textoTirada += '- ' + card.posicion + ': ' + card.nombre + ' ' + card.orientacion + '\n';
  });
  if (tirada.iching && tirada.iching.principal) {
    textoTirada += '\n' + t('copiar.tiradaIching') + '\n';
    textoTirada += t('copiar.hexPrincipal') + ' ' + tirada.iching.principal + '\n';
    if (tirada.iching.futuro) textoTirada += t('copiar.hexFuturo') + ' ' + tirada.iching.futuro + '\n';
  }

  const textoCarta = generarTextoCopiaAstral(c);

  try {
    const htmlIA = await analisisCombinadoIA(textoTirada, textoCarta);
    cont.innerHTML = '<div class="analisis-origen ia-origen">' + t('ia.combinadoIA') + '</div>' + htmlIA;
    mostrarDonacionSiToca(cont);
  } catch (err) {
    console.warn('[IA] Fallback combinado:', err.message);
    cont.innerHTML = '<div class="analisis-origen local-origen">' + t('ia.errorConexion') + '</div><p style="color:var(--text-mut)">Error: ' + err.message + '</p>';
  }
  setTimeout(() => cont.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

// === ANÁLISIS SINASTRIA (IA con fallback local) ===
let _ultimoAnalisisSinastria = '';

// Helpers locales para el fallback (traducir planetas, aspectos y formatear orbe)
function _pnLocal(nombreEN) {
  const np = t('astral.nombresPlanetarios');
  return (np && typeof np === 'object' && np[nombreEN]) ? np[nombreEN] : nombreEN;
}
function tAspectoLocal(tipoEN) {
  const asp = t('astrologia.aspectos');
  return (asp && asp[tipoEN]) ? asp[tipoEN] : tipoEN;
}
function _orbeLocal(orb) {
  const g = Math.floor(orb);
  const m = Math.floor((orb - g) * 60);
  return `${g}°${String(m).padStart(2,'0')}'`;
}
function _factorLabelLocal(key) {
  const map = {
    quimica: t('sinastria.quimica') || 'Química',
    emocional: t('sinastria.emocional') || 'Emocional',
    mental: t('sinastria.mental') || 'Mental',
    espiritual: t('sinastria.espiritual') || 'Espiritual',
    estabilidad: t('sinastria.estabilidad') || 'Estabilidad',
    valores: t('sinastria.factorValores') || 'Valores / Estilo de amor',
    transformacion: t('sinastria.factorTransformacion') || 'Transformación / Poder',
    compromiso: t('sinastria.factorCompromiso') || 'Compromiso (Casa 7)',
  };
  return map[key] || key;
}
function _nivelLabelLocal(nivel) {
  const map = {
    facilidad: t('sinastria.nivel_facilidad') || 'Facilidad',
    matiz: t('sinastria.nivel_matiz') || 'Con matices',
    intenso: t('sinastria.nivel_intenso') || 'Intenso (con fricción)',
    desafio: t('sinastria.nivel_desafio') || 'A trabajar',
  };
  return map[nivel] || nivel;
}
// Grados + signo a partir de una longitud (para ASC/MC).
function _gradosSignoLocal(lon) {
  try { const g = gradosASigno(lon); return `${g.grados}°${String(g.minutos).padStart(2,'0')}' ${g.signo.nombre}`; } catch (e) { return ''; }
}
// Consejo de un sector en rojo (i18n con fallback), para el fallback local.
function _consejoFactorLocal(key) {
  const fallbacks = {
    quimica: 'Alimenta la chispa: deja espacio al deseo, la sorpresa y el juego entre ustedes.',
    emocional: 'Practica la escucha y la seguridad emocional: expresa lo que sientes y valida al otro.',
    mental: 'Mejora la comunicación: dialoguen con calma y escucha activa antes de discutir.',
    espiritual: 'Compartan una práctica o valores comunes: conéctense en lo que da sentido a su vida.',
    estabilidad: 'Refuerza los cimientos: fija expectativas claras, rutinas y acuerdos de largo plazo.',
    valores: 'Alinea los valores y el estilo de amor: hablen de qué esperan y cómo desean quererse.',
    transformacion: 'Gestiona la intensidad: establece límites sanos y canaliza el poder compartido sin control ni miedo.',
    compromiso: 'Cuida el compromiso y el eje de pareja: dedica tiempo a construir su "nosotros".',
  };
  const v = t('sinastria.consejo_' + key);
  return (v && v !== 'sinastria.consejo_' + key) ? v : (fallbacks[key] || '');
}
// Bloque compacto de una persona para el prompt de la IA: planetas personales
// con signo, grado y casa + ASC/MC. Sustituye a la carta astral completa (que era
// pesada y desviaba el foco de la dinámica de pareja).
function _datosPersonaIA(carta) {
  if (!carta || !carta.planetas) return '';
  const nombre = carta.nombre || 'Persona';
  let s = `${nombre}\n`;
  const claves = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'];
  for (const n of claves) {
    const p = carta.planetas.find(x => x.nombre === n);
    if (p) s += `- ${_pnLocal(n)}: ${p.grados}°${String(p.minutos).padStart(2,'0')}' ${p.signo.nombre} (Casa ${p.casa})\n`;
  }
  s += `- ${_pnLocal('I ASC')}: ${_gradosSignoLocal(carta.asc)} (Casa 1)\n`;
  s += `- ${_pnLocal('X MC')}: ${_gradosSignoLocal(carta.mc)} (Casa 10)\n`;
  return s;
}

// Prioridades de desempate en "La Llave del Vínculo" (requisito de diseño):
// fortaleza = sector con mayor score; aprendizaje = menor score. En empate, el
// orden del array gana (transformación/química que no aparezcan van al final).
const PRIO_FORTALEZA = { emocional:0, quimica:1, espiritual:2, mental:3, valores:4, estabilidad:5, compromiso:6 };
const PRIO_APRENDIZAJE = { valores:0, mental:1, emocional:2, estabilidad:3, espiritual:4, compromiso:5 };
// Frase corta del % global, por tramo (i18n: sinastria.fbFraseGlobal*).
function _fraseGlobalCorta(score) {
  const bucket = score >= 85 ? '85' : score >= 70 ? '70' : score >= 55 ? '55' : score >= 40 ? '40' : '0';
  return t('sinastria.fbFraseGlobal' + bucket) || '';
}
// "Qué aporta cada uno": para cada aspecto con contribución positiva, el aporte
// se reparte entre A y B en proporción a la importancia de su planeta en el par
// (p1 es de A, p2 es de B). Devuelve los hasta 3 sectores donde más suma cada uno.
function _aportaCadaUno(r) {
  const PESO = { Sun:1.0, Moon:0.95, 'I ASC':0.9, Mercury:0.9, Venus:0.9, Mars:0.85, 'X MC':0.85, Jupiter:0.7, Saturn:0.7, 'N Node':0.6, Chiron:0.55, Uranus:0.55, Neptune:0.5, Pluto:0.5, Lilith:0.5 };
  const sumaA = {}, sumaB = {};
  for (const [sector, arr] of Object.entries(r.factorAspectos || {})) {
    for (const a of (arr || [])) {
      const pos = Math.max(0, a.delta);
      if (pos <= 0) continue;
      const wA = PESO[a.p1] ?? 0.6, wB = PESO[a.p2] ?? 0.6;
      sumaA[sector] = (sumaA[sector] || 0) + pos * (wA / (wA + wB));
      sumaB[sector] = (sumaB[sector] || 0) + pos * (wB / (wA + wB));
    }
  }
  const top = (s) => Object.entries(s).filter(([, v]) => v > 0)
    .sort((x, y) => y[1] - x[1]).slice(0, 3).map(([k]) => _factorLabelLocal(k));
  return { sectoresA: top(sumaA), sectoresB: top(sumaB) };
}
// Selecciona qué aspectos de un sector mostrar según su nivel cualitativo:
// - Facilidad (≥70): hasta 3 priorizando puntuación positiva y menor orbe.
// - Desafío (<50): los de mayor fricción negativa o los quincuncios de menor orbe.
// - Intenso (Química/Transformación): la tensión que atrae Y el flujo que une.
// - Matiz: mezcla equilibrada de lo que suma y lo que pide ajuste.
function _seleccionarAspectosLocal(key, factor, struct) {
  const arr = (struct && struct[key]) || [];
  if (!arr.length) return [];
  const nivel = factor.nivel;
  const porPos = (a, b) => (b.delta - a.delta) || (a.orb - b.orb);
  const porNeg = (a, b) => (a.delta - b.delta) || (a.orb - b.orb);
  if (nivel === 'intenso') {
    const flujo = arr.filter(a => a.armonico).sort(porPos);
    const tension = arr.filter(a => a.friccion).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a.orb - b.orb);
    return [...flujo.slice(0, 2), ...tension.slice(0, 2)].slice(0, 3);
  }
  if (nivel === 'facilidad') {
    const pos = arr.filter(a => a.delta > 0).sort(porPos);
    return (pos.length ? pos : arr.slice().sort((a, b) => a.orb - b.orb)).slice(0, 3);
  }
  if (nivel === 'desafio') {
    const neg = arr.filter(a => a.delta < 0).sort(porNeg);
    const quin = arr.filter(a => a.tipo === 'Quincunx').sort((a, b) => a.orb - b.orb);
    const sel = [...neg.slice(0, 2), ...quin.slice(0, 1)];
    return (sel.length ? sel : arr.slice().sort((a, b) => a.orb - b.orb)).slice(0, 3);
  }
  const pos = arr.filter(a => a.delta > 0).sort(porPos);
  const neg = arr.filter(a => a.delta < 0).sort(porNeg);
  return [...pos.slice(0, 2), ...neg.slice(0, 1)].slice(0, 3);
}
// Formatea un aspecto estructurado: "· Planeta (Signo) de A ☌ Planeta (Signo) de B — Tipo (orbe X°XX', +/-Puntos)".
// En español añade la interpretación del diccionario (fraseAspecto); en otros
// idiomas queda la línea técnica (planetas/signos/tipo ya van traducidos) —
// las ~45 interpretaciones largas del diccionario solo existen en español.
function _formatAspectoLocal(a) {
  const n1 = a.s1 ? `${a.p1Label} (${a.s1}) de ${a.nA}` : `${a.p1Label} de ${a.nA}`;
  const n2 = a.s2 ? `${a.p2Label} (${a.s2}) de ${a.nB}` : `${a.p2Label} de ${a.nB}`;
  const sg = a.delta >= 0 ? '+' : '−';
  let linea = `- ${n1} ${a.simbolo} ${n2} — ${a.tipoLabel} (orbe ${_orbeLocal(a.orb)}, ${sg}${Math.abs(a.delta)})`;
  if (getIdioma() === 'es') {
    const frase = fraseAspecto(a.p1, a.p2, a.tipo);
    if (frase && !/activa una dinámica significativa/.test(frase)) linea += `\n  ${frase}`;
  }
  return linea;
}
// Bloque markdown de un área agrupada (varios sectores) para el fallback local.
function _bloqueAreaLocal(r, keys, struct, titulo) {
  const lines = [`**${titulo}**`];
  for (const k of keys) {
    const f = r.factores.find(x => x.key === k);
    if (!f) continue;
    const nivel = _nivelLabelLocal(f.nivel);
    const fric = f.friccion ? ' ≈' : '';
    lines.push(`**${_factorLabelLocal(f.key)} (${f.score}/100):** *${nivel}${fric}*. ${fraseFactor(f.key, f.score, f.nivel)}`);
    const sel = _seleccionarAspectosLocal(k, f, struct);
    for (const a of sel) lines.push(_formatAspectoLocal(a));
    // Compromiso (Casa 7) no tiene aspectos estructurados: usa su detalle propio.
    if (!sel.length && r.factorDetalle && r.factorDetalle[k]) {
      for (const d of r.factorDetalle[k].slice(0, 2)) lines.push(`- ${d}`);
    }
  }
  return lines;
}
// Mayor fortaleza / menor aprendizaje de "La Llave del Vínculo" con desempate.
function _factorTop(r, modo) {
  const prio = modo === 'fuerte' ? PRIO_FORTALEZA : PRIO_APRENDIZAJE;
  const orden = modo === 'fuerte'
    ? (a, b) => (b.score - a.score) || ((prio[a.key] ?? 99) - (prio[b.key] ?? 99))
    : (a, b) => (a.score - b.score) || ((prio[a.key] ?? 99) - (prio[b.key] ?? 99));
  return r.factores.slice().sort(orden)[0];
}

async function mostrarAnalisisSinastria() {
  const { resultado, cartas } = getUltimaSinastria();
  if (!resultado || !cartas) { alert(t('sinastria.calculaPrimero') || 'Calcula una sinastria primero.'); return; }
  const cont = document.getElementById('sinastria-interpretacion');
  if (!cont) return;
  cont.innerHTML = '<div class="ia-spinner"><div class="ia-spinner-icon">✨</div><p>' + t('ia.generando') + '</p></div>';
  cont.style.display = 'block';
  const btn = document.getElementById('btn-analisis-sinastria');
  if (btn) btn.style.display = 'none';

  try {
    const textoA = _datosPersonaIA(cartas.cartaA);
    const textoB = _datosPersonaIA(cartas.cartaB);
    const htmlIA = await analisisSinastriaIA(textoA, textoB, resultado.promptDataText);
    _ultimoAnalisisSinastria = htmlIA;
    if (window.__sinastriaUI) window.__sinastriaUI._ultimoAnalisis = htmlIA;
    cont.innerHTML = '<div class="analisis-origen ia-origen">' + (t('ia.origenIA') || 'IA') + '</div>' + htmlIA;
    mostrarDonacionSiToca(cont);
    _appendCopiarAnalisisBtn(cont);
  } catch (err) {
    console.warn('[IA] Fallback sinastria local:', err.message);
    // Fallback local: interpretación rica usando el diccionario de sinastria
    const r = resultado;
    const nombreA = cartas.cartaA?.nombre || t('sinastria.personaA') || 'Persona A';
    const nombreB = cartas.cartaB?.nombre || t('sinastria.personaB') || 'Persona B';
    const label = r.compatibilidadLabel;

    // === ANÁLISIS INTEGRAL DE COMPATIBILIDAD === (fallback local alineado con el prompt IA)
    // Texto plano markdown → markdownAHtml, igual que la respuesta de la IA.
    // Toda la estructura está internacionalizada (sinastria.fb_*); las frases
    // por sector vienen de sinastria.factorFase_* (fraseFactor) y los consejos
    // de sinastria.consejo_*. Solo las interpretaciones largas por aspecto y por
    // casa (diccionario) son español puras: se añaden únicamente en locale 'es'.
    const struct = r.factorAspectos || {};
    const L = [];
    const es = getIdioma() === 'es';
    const signoLbl = (so) => { const i = SIGNOS.indexOf(so); const sT = i >= 0 ? tSigno(i) : null; return (sT && sT.nombre) || (so && so.nombre) || ''; };
    const casaStr = (p) => (p && p.casa != null) ? ' (' + t('sinastria.fbCasaN', { n: p.casa }) + ')' : '';

    L.push(t('sinastria.fbTitulo'));
    L.push('');
    // 🌟 1. LA ALQUIMIA Y LA IDENTIDAD DE LA PAREJA
    L.push(t('sinastria.fbS1'));
    L.push('');
    L.push(t('sinastria.fbGlobalScore', { score: r.globalScore, label, frase: _fraseGlobalCorta(r.globalScore) }));
    // Carta compuesta completa (Sol/Luna/Venus/Marte; sin casas si falta hora)
    if (r.cartaCompuesta && r.cartaCompuesta.planetas) {
      const cc = r.cartaCompuesta;
      const cp = (n) => cc.planetas.find(x => x.nombre === n);
      const pS = cp('Sun'), pL = cp('Moon'), pV = cp('Venus'), pM = cp('Mars');
      if (pS && pL && pV && pM) {
        L.push(t('sinastria.fbCompuesta', {
          solSigno: signoLbl(pS.signo), solCasa: casaStr(pS),
          lunaSigno: signoLbl(pL.signo), lunaCasa: casaStr(pL),
          venusSigno: signoLbl(pV.signo), venusCasa: casaStr(pV),
          marteSigno: signoLbl(pM.signo), marteCasa: casaStr(pM),
        }));
      }
      if (cc.asc != null) {
        const g = gradosASigno(cc.asc);
        L.push(t('sinastria.fbCompuestaAsc', { signo: signoLbl(g.signo) }));
      }
    }
    L.push('');
    L.push('---');
    L.push('');
    // 💫 2. RADIOGRAFÍA COMPLETA POR ÁREAS
    L.push(t('sinastria.fbS2'));
    L.push('');
    L.push(..._bloqueAreaLocal(r, ['emocional', 'valores'], struct, t('sinastria.fbAreaEmocional')));
    L.push('');
    L.push(..._bloqueAreaLocal(r, ['mental', 'estabilidad', 'compromiso'], struct, t('sinastria.fbAreaComunicacion')));
    L.push('');
    L.push(..._bloqueAreaLocal(r, ['quimica', 'transformacion'], struct, t('sinastria.fbAreaPasion')));
    L.push('');
    L.push(..._bloqueAreaLocal(r, ['espiritual'], struct, t('sinastria.fbAreaProposito')));
    L.push('');
    // 🏠 Casas de impacto (overlays top; solo con hora fiable)
    if (!r.sinHora && r.casasDestacadas && r.casasDestacadas.length) {
      L.push(`**${t('sinastria.fbCasasTitulo')}**`);
      for (const c of r.casasDestacadas.slice(0, 4)) {
        const quien = c.origen === 'A' ? nombreA : nombreB;
        const deQuien = c.origen === 'A' ? nombreB : nombreA;
        const frase = es ? (' — ' + frasePlanetaEnCasa(c.planeta, c.casaEn)) : '';
        L.push(t('sinastria.fbCasaLinea', { planeta: _pnLocal(c.planeta), quien, casa: t('sinastria.fbCasaN', { n: c.casaEn }), deQuien, significado: c.significado, frase }));
      }
      L.push('');
    }
    // ⚖️ Balance neto de aspectos (estilo CafeAstrology)
    if (r.netoAspectos) {
      const n = r.netoAspectos;
      L.push(t('sinastria.fbNeto', { arm: n.armonico, ten: n.tension, neto: n.net > 0 ? '+' + n.net : String(n.net) }));
    }
    L.push('');
    L.push('---');
    L.push('');
    // 🔑 3. LA LLAVE DEL VÍNCULO
    L.push(t('sinastria.fbS3'));
    L.push('');
    const fuerte = _factorTop(r, 'fuerte');
    const debil = _factorTop(r, 'debil');
    if (fuerte) L.push(t('sinastria.fbRegalo', { factor: _factorLabelLocal(fuerte.key), score: fuerte.score }));
    if (debil) L.push(t('sinastria.fbAprendizaje', { factor: _factorLabelLocal(debil.key), score: debil.score }));
    // Qué aporta cada uno (sectores con más contribución positiva por persona)
    const { sectoresA, sectoresB } = _aportaCadaUno(r);
    if (sectoresA.length) L.push(t('sinastria.fbAportaLinea', { nombre: nombreA, sectores: sectoresA.join(', ') }));
    if (sectoresB.length) L.push(t('sinastria.fbAportaLinea', { nombre: nombreB, sectores: sectoresB.join(', ') }));
    // Pautas siempre: los 2 sectores en rojo si los hay; si no, los 2 más bajos a cultivar.
    const rojos = r.factores.filter(f => f.nivel === 'desafio').sort((a, b) => a.score - b.score);
    const objetivos = rojos.length ? rojos : r.factores.slice().sort((a, b) => a.score - b.score);
    L.push('');
    L.push(rojos.length ? t('sinastria.fbPautas') : t('sinastria.fbPautasCultivo'));
    for (const rf of objetivos.slice(0, 2)) L.push(`- **${_factorLabelLocal(rf.key)}:** ${_consejoFactorLocal(rf.key)}`);
    const local = '<div class="ia-analisis">' + markdownAHtml(L.join('\n')) + '</div>';

    _ultimoAnalisisSinastria = local;
    if (window.__sinastriaUI) window.__sinastriaUI._ultimoAnalisis = local;
    // Distinguir "límite de accesos a la IA" de "sin conexión" (el worker devuelve
    // 429 con mensaje tipo "Límite diario"/"Cuota"/"Demasiadas"; la red lanza "Failed to fetch").
    const em = (err && err.message ? String(err.message).toLowerCase() : '');
    const esLimite = em.includes('límite') || em.includes('limite') || em.includes('cuota') || em.includes('demasiadas') || em.includes('429');
    const origenMsg = esLimite
      ? (t('ia.limiteIA') || '⚠️ Límite de accesos a la IA alcanzado — mostrando análisis local')
      : (t('ia.origenLocalAstral') || 'Análisis local (sin conexión a IA — comprueba tu red)');
    cont.innerHTML = '<div class="analisis-origen local-origen">' + origenMsg + '</div>' + local;
    _appendCopiarAnalisisBtn(cont);
  }
  // Aviso simbólico (equivalente al de tarot/astral, que la sinastría no tenía)
  const avisoSin = t('sinastria.avisoSimbolico');
  if (typeof avisoSin === 'string' && !avisoSin.startsWith('sinastria.')) {
    cont.innerHTML += '<p class="aviso-final">' + avisoSin + '</p>';
  }
  setTimeout(() => cont.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

// Copiar los datos de la sinastría + el análisis (IA o local) juntos.
function copiarSinastriaConAnalisis() {
  const { resultado, cartas } = getUltimaSinastria();
  if (!resultado || !cartas) { alert(t('sinastria.calculaPrimero') || 'Calcula una sinastria primero.'); return; }
  let txt = getTextoCopiaSinastria(resultado, cartas.cartaA, cartas.cartaB);
  if (_ultimoAnalisisSinastria) {
    const tmp = document.createElement('div');
    tmp.innerHTML = _ultimoAnalisisSinastria;
    txt += '\n\n=== ANÁLISIS DE SINASTRIA ===\n' + (tmp.innerText || tmp.textContent || '').trim();
  }
  if (window.AndroidClipboard?.copy) { window.AndroidClipboard.copy(txt); _copiadoAnalisisFeedback(); return; }
  try { navigator.clipboard.writeText(txt).then(_copiadoAnalisisFeedback); }
  catch { _copiadoAnalisisFeedback(); }
}
function _copiadoAnalisisFeedback() {
  const btn = document.getElementById('btn-copiar-sinastria-analisis');
  if (btn) { const orig = btn.textContent; btn.textContent = '✓ ' + (t('sinastria.copiado') || 'Copiado'); setTimeout(() => btn.textContent = orig, 2000); }
}
// Botón "Copiar sinastria + análisis" tras el análisis.
function _appendCopiarAnalisisBtn(cont) {
  if (!cont) return;
  cont.insertAdjacentHTML('beforeend',
    '<div class="sinastria-analisis-actions"><button id="btn-copiar-sinastria-analisis" class="btn-sec" onclick="window.__app.copiarSinastriaYAnalisis()">' +
    (t('sinastria.copiarAnalisis') || '📋 Copiar sinastria + análisis') + '</button></div>');
}

// Puente copiar/compartir sinastria (referenciado por onclick en HTML)
if (window.__sinastriaUI) {
  window.__sinastriaUI.copiarSinastria = copiarSinastria;
  window.__sinastriaUI.compartirSinastria = compartirSinastria;
} else {
  window.__sinastriaUI = { copiarSinastria: copiarSinastria, compartirSinastria: compartirSinastria };
}

function renderSinastriasGuardadas() {
  const cont = document.getElementById('sinastrias-guardadas-lista');
  if (!cont) return;
  const lista = storage.obtenerSinastrias();
  let html = '<h3>📚 ' + (t('sinastria.guardadas', {n: lista.length}) || ('Sinastrias guardadas (' + lista.length + ')')) + '</h3>';
  if (!lista.length) { html += '<div class="guardado-vacio">' + (t('sinastria.noGuardadas') || 'Aún no has guardado ninguna sinastria.') + '</div>'; }
  else {
    html += '<button id="btn-borrar-todas-sinastrias" class="btn-borrar-todas" onclick="window.__app.borrarTodasSinastrias()">🗑️ ' + (t('main.borrarTodas') || 'Borrar todas') + '</button>';
    lista.forEach((item, idx) => {
      const locale = getIdioma() === 'en' ? 'en-US' : getIdioma() === 'pt' ? 'pt-PT' : getIdioma() === 'de' ? 'de-DE' : getIdioma() === 'fr' ? 'fr-FR' : getIdioma() === 'it' ? 'it-IT' : 'es-ES';
      const fecha = new Date(item.fecha).toLocaleString(locale);
      html += '<div class="guardado-item"><div class="guardado-item-info"><strong>' + storage.escapeHtml(item.titulo) + '</strong> · ' + fecha +
        (item.subtitulo ? '<br>' + storage.escapeHtml(item.subtitulo) : '') +
        '</div><div class="guardado-item-actions"><button id="btn-ver-sinastria-' + idx + '" aria-label="' + (t('main.visualizar') || 'Ver') + '" onclick="window.__app.verSinastriaGuardada(' + idx + ')">👁️</button><button id="btn-borrar-sinastria-' + idx + '" class="danger" aria-label="' + (t('main.borrar') || 'Borrar') + '" onclick="window.__app.borrarSinastria(' + idx + ')">🗑️</button></div></div>';
    });
  }
  cont.innerHTML = html; cont.classList.add('visible');
  setTimeout(() => cont.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

function renderSinastriaGuardada(idx) {
  const lista = storage.obtenerSinastrias();
  if (idx < 0 || idx >= lista.length) return;
  const item = lista[idx];
  if (item.datos && item.datos.cartaA && item.datos.cartaB && item.datos.resultado) {
    renderSinastria(item.datos.resultado, item.datos.cartaA, item.datos.cartaB);
  } else if (item.texto) {
    // Fallback: mostrar texto plano
    const output = document.getElementById('sinastria-output');
    if (output) {
      document.getElementById('sinastria-titulo').textContent = item.titulo;
      document.getElementById('sinastria-rueda').innerHTML = '';
      document.getElementById('sinastria-radar').innerHTML = '';
      document.getElementById('sinastria-global').innerHTML = '';
      document.getElementById('sinastria-pills').innerHTML = '';
      document.getElementById('sinastria-casas').innerHTML = '';
      document.getElementById('sinastria-aspectos').innerHTML = '';
      document.getElementById('sinastria-interpretacion').innerHTML = '<pre style="white-space:pre-wrap;color:var(--text)">' + storage.escapeHtml(item.texto) + '</pre>';
      output.classList.add('visible');
    }
  }
}

function toggleVerGuardadas(id, renderFn) {
  const cont = document.getElementById(id);
  if (!cont) return;
  // Si ya está visible, lo ocultamos (toggle); si no, lo renderizamos y mostramos.
  if (cont.classList.contains('visible')) {
    cont.classList.remove('visible');
    cont.innerHTML = '';
    return;
  }
  renderFn();
}

// Modal de confirmación propio: confirm() nativo no muestra diálogo en el WebView
// de Capacitor (requiere WebChromeClient.onJsConfirm, que no está implementado).
function confirmar(mensaje, onOk) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `<div class="confirm-modal">
    <p class="confirm-msg"></p>
    <div class="confirm-btns">
      <button class="btn-sec" data-confirm-cancel>${t('main.cancelar') || 'Cancelar'}</button>
      <button class="btn-sec danger" data-confirm-ok>${t('main.confirmBorrar') || 'Borrar'}</button>
    </div>
  </div>`;
  overlay.querySelector('.confirm-msg').textContent = mensaje;
  document.body.appendChild(overlay);
  const cerrar = () => overlay.remove();
  overlay.querySelector('[data-confirm-cancel]').addEventListener('click', cerrar);
  overlay.querySelector('[data-confirm-ok]').addEventListener('click', () => { cerrar(); onOk(); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(); });
}

function renderTiradasGuardadas() {
  const cont = document.getElementById('tiradas-guardadas-lista');
  if (!cont) return;
  const lista = storage.obtenerTiradas();
  let html = '<h3>' + t('main.tiradasGuardadas', {n: lista.length}) + '</h3>';
  if (!lista.length) { html += '<div class="guardado-vacio">' + t('main.noTiradas') + '</div>'; }
  else {
    html += '<button id="btn-borrar-todas-tiradas" class="btn-borrar-todas" onclick="window.__app.borrarTodasTiradas()">🗑️ ' + t('main.borrarTodas') + '</button>';
    lista.forEach((item, idx) => {
      const locale = getIdioma() === 'en' ? 'en-US' : getIdioma() === 'pt' ? 'pt-PT' : getIdioma() === 'de' ? 'de-DE' : getIdioma() === 'fr' ? 'fr-FR' : getIdioma() === 'it' ? 'it-IT' : 'es-ES';
      const fecha = new Date(item.fecha).toLocaleString(locale);
      const tipo = item.tipo === 'una' ? t('tarot.nombreTirada1') : (item.tipo === 'tres' ? t('tarot.nombreTirada3') : t('tarot.nombreTiradaCruz'));
      html += '<div class="guardado-item"><div class="guardado-item-info"><strong>' + tipo + '</strong> · ' + fecha +
        (item.pregunta ? '<br><em>"' + storage.escapeHtml(item.pregunta) + '"</em>' : '') +
        '<br>' + storage.escapeHtml(item.resumen) +
        (item.iching ? '<br><span style="color:var(--copas);">☯ ' + storage.escapeHtml(item.iching) + '</span>' : '') +
        '</div><div class="guardado-item-actions"><button id="btn-ver-tirada-' + idx + '" aria-label="' + t('main.visualizar') + '" onclick="window.__app.verTiradaGuardada(' + idx + ')" title="' + t('main.visualizar') + '">👁️</button><button id="btn-borrar-tirada-' + idx + '" class="danger" aria-label="' + t('main.borrar') + '" onclick="window.__app.borrarTirada(' + idx + ')" title="' + t('main.borrar') + '">🗑️</button></div></div>';
    });
  }
  cont.innerHTML = html; cont.classList.add('visible');
  setTimeout(() => cont.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

function renderCartasGuardadas() {
  const cont = document.getElementById('cartas-guardadas-lista');
  if (!cont) return;
  const lista = storage.obtenerCartas();
  let html = '<h3>' + t('main.cartasGuardadas', {n: lista.length}) + '</h3>';
  if (!lista.length) { html += '<div class="guardado-vacio">' + t('main.noCartas') + '</div>'; }
  else {
    html += '<button id="btn-borrar-todas-cartas" class="btn-borrar-todas" onclick="window.__app.borrarTodasCartas()">🗑️ ' + t('main.borrarTodas') + '</button>';
    lista.forEach((item, idx) => {
      const locale2 = getIdioma() === 'en' ? 'en-US' : getIdioma() === 'pt' ? 'pt-PT' : getIdioma() === 'de' ? 'de-DE' : getIdioma() === 'fr' ? 'fr-FR' : getIdioma() === 'it' ? 'it-IT' : 'es-ES';
      const fecha = new Date(item.fecha).toLocaleString(locale2);
      html += '<div class="guardado-item"><div class="guardado-item-info"><strong>' + storage.escapeHtml(item.titulo || t('main.cartaAstral')) + '</strong> · ' + fecha +
        (item.subtitulo ? '<br>' + storage.escapeHtml(item.subtitulo) : '') +
        '</div><div class="guardado-item-actions"><button id="btn-ver-carta-' + idx + '" aria-label="' + t('main.visualizar') + '" onclick="window.__app.verCartaAstralGuardada(' + idx + ')">👁️</button><button id="btn-borrar-carta-' + idx + '" class="danger" aria-label="' + t('main.borrar') + '" onclick="window.__app.borrarCarta(' + idx + ')">🗑️</button></div></div>';
    });
  }
  cont.innerHTML = html; cont.classList.add('visible');
  setTimeout(() => cont.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

function renderCartaGuardada(idx) {
  const lista = storage.obtenerCartas();
  if (idx < 0 || idx >= lista.length) return;
  const item = lista[idx];
  if (item.datos) {
    // Regenerar el display completo con el diagrama
    renderAstral(item.datos);
  } else {
    // Fallback para cartas guardadas sin datos completos
    document.getElementById('astral-titulo').textContent = item.titulo || t('main.cartaAstral');
    document.getElementById('astral-subtitulo').textContent = item.subtitulo || '';
    document.getElementById('astral-texto').style.display = 'block';
    document.getElementById('astral-texto').textContent = item.texto || '';
    document.getElementById('astral-wheel').innerHTML = '';
    document.getElementById('astral-wheel-info').textContent = '' + t('main.cartaSinDatos') + '.';
    document.getElementById('astral-interpretacion').innerHTML = '';
    document.getElementById('astral-aspectos').innerHTML = '';
    document.getElementById('astral-stats').innerHTML = '';
    document.getElementById('astral-extra').innerHTML = '';
    document.getElementById('astral-output').classList.add('visible');
    setTimeout(() => document.getElementById('astral-output').scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
}

function crearParticulas() {
  const cont = document.getElementById('particles');
  if (!cont) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = (Math.random() * 100) + '%';
    p.style.animationDuration = (8 + Math.random() * 12) + 's';
    p.style.animationDelay = (Math.random() * 12) + 's';
    p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
    cont.appendChild(p);
  }
}

async function init() {
  // Inicializar i18n (detecta idioma del dispositivo, carga traducciones)
  await initI18n();

  // Inicializar glosario: hace tapables los términos técnicos (data-term)
  inicializarGlosario();

  // Configurar selector de idioma
  const btnIdioma = document.getElementById('btn-idioma');
  if (btnIdioma) btnIdioma.addEventListener('click', mostrarSelectorIdioma);

  // Configurar boton de donacion / Acerca de (registro robusto en init)
  const btnAcerca = document.getElementById('btn-acerca-de');
  if (btnAcerca) btnAcerca.addEventListener('click', abrirAcercaDe);

  // Footer de donacion traducido + listener (delegacion en el footer)
  actualizarFooterDonacion();
  const foot = document.querySelector('footer');
  if (foot) {
    foot.addEventListener('click', (e) => {
      if (foot.querySelector('a.donacion-link')) {
        e.preventDefault();
        abrirAcercaDe();
      }
    });
  }
  // Tras cada cambio de idioma, regenerar el footer y resetear el mapa de términos
  const _cambiarIdiomaOriginal = window.__app.cambiarIdioma || cambiarIdioma;
  window.__app.cambiarIdioma = async function(loc) {
    await cambiarIdioma(loc);
    actualizarFooterDonacion();
    resetMapaTerminos(); // los nombres traducidos cambian con el idioma
  };

  // Tutorial de onboarding (solo la primera vez)
  const mostrandoOnboarding = initOnboarding();
  crearParticulas();
  initTabs();
  initFormularioAstral();
  initFormularioSinastria();
  // Inicializar la BD SQLite de ciudades (carga WASM + .sqlite en memoria)
  initDB().catch(err => console.warn('SQLite no disponible:', err.message));
  const modal = document.getElementById('modal');
  if (modal) modal.addEventListener('click', (e) => cerrarModal(e));
  const mc = document.querySelector('.modal-close');
  if (mc) mc.addEventListener('click', () => cerrarModal());
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  console.log('✦ Oráculo Unificado v1.0 iniciado ✦');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init().catch(e => console.error(e)));
else init().catch(e => console.error(e));