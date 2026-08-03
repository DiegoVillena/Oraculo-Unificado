// main.js — Entry point Oráculo Unificado (reconstruido)
import { initTabs, cambiarPestana } from './ui/tabs.js?v=18';
import { initFormularioAstral, render as renderAstral } from './ui/astral.js?v=18';
import { realizarConsulta, mostrarAnalisis, copiarResultados, compartirResultados, getUltimaTirada, getTextoCopia, visualizarTiradaGuardada } from './ui/tarot.js?v=18';
import { abrirModal, abrirModalIching, cerrarModal } from './ui/modal.js?v=18';
import { inicializarGlosario, resetMapaTerminos } from './ui/glossary.js?v=18';
import * as storage from './storage.js?v=18';
import { getUltimaCarta, generarTextoCarta } from './core/astrologia.js?v=18';
import { analizarCartaAstral, extraerTextoAnalisisAstral } from './core/astrologia-analisis.js?v=18';
import { analisisAstralIA, analisisCombinadoIA, generarTextoCopiaAstral } from './core/ia-api.js?v=18';
import { mostrarDonacionSiToca, abrirAcercaDe, actualizarFooterDonacion } from './ui/donacion.js?v=18';
import { initDB } from './data/sqlite-db.js?v=18';
import { initOnboarding } from './ui/onboarding.js?v=18';
import { initI18n, t, cambiarIdioma, getIdioma, getIdiomasSoportados } from './i18n/i18n.js?v=18';

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
  verTiradasGuardadas: () => renderTiradasGuardadas(),
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
  borrarTirada: (i) => { storage.borrarTirada(i); renderTiradasGuardadas(); },
  borrarTodasTiradas: () => { if (confirm(t('main.borrarTiradas'))) { storage.borrarTodasTiradas(); renderTiradasGuardadas(); } },
  guardarCartaAstral: () => {
    const c = getUltimaCarta();
    if (!c) { alert(t('main.calculaCarta')); return; }
    const titulo = document.getElementById('astral-titulo')?.textContent || t('main.cartaAstral');
    const subtitulo = document.getElementById('astral-subtitulo')?.textContent || '';
    const texto = generarTextoCarta(c);
    storage.guardarCarta({ titulo, subtitulo, texto, datos: c });
    const btn = document.getElementById('btn-guardar-carta');
    if (btn) { const o = btn.innerText; btn.innerText = t('main.guardada'); setTimeout(() => btn.innerText = o, 2000); }
  },
  verCartasGuardadas: () => renderCartasGuardadas(),
  verCartaAstralGuardada: (i) => renderCartaGuardada(i),
  borrarCarta: (i) => { storage.borrarCarta(i); renderCartasGuardadas(); },
  borrarTodasCartas: () => { if (confirm(t('main.borrarCartas'))) { storage.borrarTodasCartas(); renderCartasGuardadas(); } },
  analizarCartaAstral: () => mostrarAnalisisAstral(),
  cambiarIdioma: (lang) => cambiarIdioma(lang),
  getIdioma: () => getIdioma(),
  getIdiomasSoportados: () => getIdiomasSoportados(),
  analizarCombinado: () => mostrarAnalisisCombinado(),
  copiarAstralTodo: () => copiarAstralConAnalisis(),
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
    html += `<button class="idioma-opcion ${activo}" data-lang="${cod}">${nombresIdiomas[cod]}</button>`;
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

function renderTiradasGuardadas() {
  const cont = document.getElementById('tiradas-guardadas-lista');
  if (!cont) return;
  const lista = storage.obtenerTiradas();
  let html = '<h3>📚 ' + t('main.tiradasGuardadas', {n: lista.length}) + ' (' + lista.length + ')</h3>';
  if (!lista.length) { html += '<div class="guardado-vacio">' + t('main.noTiradas') + '.</div>'; }
  else {
    html += '<button class="btn-borrar-todas" onclick="window.__app.borrarTodasTiradas()">🗑️ ' + t('main.borrarTodas') + '</button>';
    lista.forEach((item, idx) => {
      const locale = getIdioma() === 'en' ? 'en-US' : getIdioma() === 'pt' ? 'pt-PT' : getIdioma() === 'de' ? 'de-DE' : getIdioma() === 'fr' ? 'fr-FR' : getIdioma() === 'it' ? 'it-IT' : 'es-ES';
      const fecha = new Date(item.fecha).toLocaleString(locale);
      const tipo = item.tipo === 'una' ? t('tarot.nombreTirada1') : (item.tipo === 'tres' ? t('tarot.nombreTirada3') : t('tarot.nombreTiradaCruz'));
      html += '<div class="guardado-item"><div class="guardado-item-info"><strong>' + tipo + '</strong> · ' + fecha +
        (item.pregunta ? '<br><em>"' + storage.escapeHtml(item.pregunta) + '"</em>' : '') +
        '<br>' + storage.escapeHtml(item.resumen) +
        (item.iching ? '<br><span style="color:var(--copas);">☯ ' + storage.escapeHtml(item.iching) + '</span>' : '') +
        '</div><div class="guardado-item-actions"><button onclick="window.__app.verTiradaGuardada(' + idx + ')" title="' + t('main.visualizar') + '">👁️</button><button class="danger" onclick="window.__app.borrarTirada(' + idx + ')" title="' + t('main.borrar') + '">🗑️</button></div></div>';
    });
  }
  cont.innerHTML = html; cont.classList.add('visible');
  setTimeout(() => cont.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

function renderCartasGuardadas() {
  const cont = document.getElementById('cartas-guardadas-lista');
  if (!cont) return;
  const lista = storage.obtenerCartas();
  let html = '<h3>📚 ' + t('main.cartasGuardadas', {n: lista.length}) + ' (' + lista.length + ')</h3>';
  if (!lista.length) { html += '<div class="guardado-vacio">' + t('main.noCartas') + '.</div>'; }
  else {
    html += '<button class="btn-borrar-todas" onclick="window.__app.borrarTodasCartas()">🗑️ ' + t('main.borrarTodas') + '</button>';
    lista.forEach((item, idx) => {
      const locale2 = getIdioma() === 'en' ? 'en-US' : getIdioma() === 'pt' ? 'pt-PT' : getIdioma() === 'de' ? 'de-DE' : getIdioma() === 'fr' ? 'fr-FR' : getIdioma() === 'it' ? 'it-IT' : 'es-ES';
      const fecha = new Date(item.fecha).toLocaleString(locale2);
      html += '<div class="guardado-item"><div class="guardado-item-info"><strong>' + storage.escapeHtml(item.titulo || t('main.cartaAstral')) + '</strong> · ' + fecha +
        (item.subtitulo ? '<br>' + storage.escapeHtml(item.subtitulo) : '') +
        '</div><div class="guardado-item-actions"><button onclick="window.__app.verCartaAstralGuardada(' + idx + ')">👁️</button><button class="danger" onclick="window.__app.borrarCarta(' + idx + ')">🗑️</button></div></div>';
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
  // Inicializar la BD SQLite de ciudades (carga WASM + .sqlite en memoria)
  initDB().catch(err => console.warn('SQLite no disponible:', err.message));
  const modal = document.getElementById('modal');
  if (modal) modal.addEventListener('click', (e) => cerrarModal(e));
  const mc = document.querySelector('.modal-close');
  if (mc) mc.addEventListener('click', () => cerrarModal());
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  console.log('✦ Oráculo Unificado v4.0 iniciado ✦');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init().catch(e => console.error(e)));
else init().catch(e => console.error(e));