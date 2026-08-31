// ui/sinastria.js — Sinastria: compatibilidad entre 2 cartas astrales
import { calcularSinastria, generarRuedaSinastriaSVG, SIGNOS, PLANETAS_UI, gradosASigno } from '../core/astrologia.js?v=72';
import { mostrarAnimacionConstelaciones, ocultarAnimacionConstelaciones } from './astral.js?v=72';
import { t, tAspecto } from '../i18n/i18n.js?v=72';
import * as storage from '../storage.js?v=72';

// Última sinastria calculada (en memoria para análisis/copiar/compartir)
let ultimaSinastria = null;
let ultimasCartas = null; // { cartaA, cartaB }

// ============================================================
// Inicialización del formulario
// ============================================================
export function initFormularioSinastria() {
  const btn = document.getElementById('btn-calcular-sinastria');
  if (btn) btn.addEventListener('click', calcular);

  // Repoblar selects al cambiar de idioma o al volver a abrir el tab
  window.addEventListener('idioma-cambiado', poblarSelects);
  // Al abrir la pestaña de sinastria, refrescar los selects (por si se añadieron
  // cartas nuevas en la pestaña astral, que desplazan los índices).
  window.addEventListener('pestana-cambiada', (e) => {
    if (e.detail && e.detail.tab === 'sinastria') poblarSelects();
  });
  // Poblar ahora (por si hay cartas guardadas de sesiones previas)
  poblarSelects();
}

export function poblarSelects() {
  const selA = document.getElementById('sinastria-personaA');
  const selB = document.getElementById('sinastria-personaB');
  if (!selA || !selB) return;
  const cartas = storage.obtenerCartas();
  const placeholder = t('sinastria.selecciona') || '— Selecciona una carta —';
  const optsHTML = '<option value="">' + placeholder + '</option>' +
    cartas.map((c, i) => {
      const label = `${c.titulo || c.subtitulo || ('Carta ' + (i+1))}`;
      return `<option value="${i}">${label}</option>`;
    }).join('');
  const valA = selA.value, valB = selB.value;
  selA.innerHTML = optsHTML;
  selB.innerHTML = optsHTML;
  if (valA) selA.value = valA;
  if (valB) selB.value = valB;
}

// ============================================================
// Cálculo + animación de fusión
// ============================================================
async function calcular() {
  const selA = document.getElementById('sinastria-personaA');
  const selB = document.getElementById('sinastria-personaB');
  const idxA = parseInt(selA.value, 10);
  const idxB = parseInt(selB.value, 10);

  if (isNaN(idxA) || isNaN(idxB)) {
    alert(t('sinastria.seleccionaAmbas') || 'Selecciona las dos cartas astrales.');
    return;
  }
  if (idxA === idxB) {
    alert(t('sinastria.distintas') || 'Selecciona dos cartas distintas.');
    return;
  }

  const cartas = storage.obtenerCartas();
  const cartaA = cartas[idxA] && cartas[idxA].datos;
  const cartaB = cartas[idxB] && cartas[idxB].datos;
  if (!cartaA || !cartaB) {
    alert(t('sinastria.sinDatos') || 'Faltan datos de alguna carta. Recalcula y guarda las cartas astrales primero.');
    return;
  }

  // Limpiar el análisis anterior (IA o local) al calcular una nueva pareja.
  const interp = document.getElementById('sinastria-interpretacion');
  if (interp) { interp.innerHTML = ''; interp.style.display = 'none'; }
  if (window.__sinastriaUI) window.__sinastriaUI._ultimoAnalisis = '';

  // Animación de constelaciones (overlay base) + animación de fusión bicarta
  mostrarAnimacionConstelaciones('sinastria.fusionando');
  mostrarAnimacionFusion(cartaA, cartaB);

  const t0 = Date.now();
  let resultado;
  try {
    resultado = calcularSinastria(cartaA, cartaB);
  } catch (e) {
    console.error('Error calcularSinastria:', e);
    ocultarAnimacionConstelaciones();
    ocultarAnimacionFusion();
    alert(t('sinastria.error') || 'Error al calcular la sinastria.');
    return;
  }

  // Garantizar mínimo 1.5s de animación (igual que astral.js)
  const elapsed = Date.now() - t0;
  const wait = Math.max(0, 1500 - elapsed);
  setTimeout(() => {
    ocultarAnimacionConstelaciones();
    ocultarAnimacionFusion();
    ultimasCartas = { cartaA, cartaB };
    ultimaSinastria = resultado;
    render(resultado, cartaA, cartaB);
  }, wait);
}

// ============================================================
// Animación de fusión: 2 ruedas (A arriba dorada, B abajo morada)
// que se atraen hacia el centro y se funden. 1.5s.
// ============================================================
function mostrarAnimacionFusion(cartaA, cartaB) {
  const overlay = document.createElement('div');
  overlay.className = 'sinastria-fusion-overlay';
  overlay.id = 'sinastria-fusion-overlay';

  const svgA = generarRuedaSinastriaSVG(cartaA, cartaA, cartaA.aspectos);
  const svgB = generarRuedaSinastriaSVG(cartaB, cartaB, cartaB.aspectos);

  overlay.innerHTML = `
    <div class="sinastria-fusion-wrap">
      <svg class="sinastria-fusion-wheel sinastria-fusion-a" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">${svgA}</svg>
      <svg class="sinastria-fusion-wheel sinastria-fusion-b" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">${svgB}</svg>
      <div class="sinastria-fusion-spark"></div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function ocultarAnimacionFusion() {
  const overlay = document.getElementById('sinastria-fusion-overlay');
  if (overlay) {
    overlay.classList.add('hide');
    setTimeout(() => overlay.remove(), 600);
  }
}

// ============================================================
// Render del resultado
// ============================================================
export function render(resultado, cartaA, cartaB) {
  const output = document.getElementById('sinastria-output');
  if (!output) return;

  // Título
  const nombreA = cartaA.nombre || t('sinastria.personaA') || 'Persona A';
  const nombreB = cartaB.nombre || t('sinastria.personaB') || 'Persona B';
  document.getElementById('sinastria-titulo').textContent =
    `${t('sinastria.tituloResultado') || 'Sinastria'}: ${nombreA} 💞 ${nombreB}`;

  // Aviso de hora desconocida: sin hora exacta no hay casas ni eje Casa 7.
  // El motor ya excluye esos datos; aquí se informa al usuario.
  const bannerHora = document.getElementById('sinastria-hora-aviso');
  if (bannerHora) {
    if (resultado.sinHora) {
      bannerHora.textContent = t('sinastria.horaDesconocida') || '';
      bannerHora.style.display = 'block';
    } else {
      bannerHora.style.display = 'none';
      bannerHora.textContent = '';
    }
  }

  // Rueda bicarta
  const wheel = document.getElementById('sinastria-rueda');
  if (wheel) wheel.innerHTML = generarRuedaSinastriaSVG(cartaA, cartaB, resultado.aspectosCruzados);
  const info = document.getElementById('sinastria-rueda-info');
  if (info) info.textContent = t('sinastria.infoRueda') || 'Pulsa sobre planetas o aspectos para ver detalles.';

  // Panel de 8 factores (sustituye al pentágono de 5 ejes): enfatiza el perfil
  // por sector. El % global queda como resumen secundario dentro del panel.
  const panel = document.getElementById('sinastria-factores');
  if (panel) panel.innerHTML = renderPanelFactores(resultado.factores, resultado.globalScore, resultado.compatibilidadLabel, resultado.factorDetalle);

  // Neto de aspectos (balance armónicos vs tensión) en un contenedor ancho aparte
  const netoEl = document.getElementById('sinastria-neto');
  if (netoEl) netoEl.innerHTML = _netoHTML(resultado.netoAspectos);

  // Detalles técnicos: tabla desplegable por sector (peso, puntuación y aporte)
  // con los aspectos que alimentan cada sector. Para quien quiera el desglose.
  const detalles = document.getElementById('sinastria-aspectos');
  if (detalles) detalles.innerHTML = renderDetallesTecnicos(resultado, cartaA, cartaB);

  // Botones
  const btnAnalisis = document.getElementById('btn-analisis-sinastria');
  if (btnAnalisis) btnAnalisis.style.display = 'block';
  const btnCopiar = document.getElementById('btn-copiar-sinastria');
  if (btnCopiar) btnCopiar.style.display = '';
  const btnCompartir = document.getElementById('btn-compartir-sinastria');
  if (btnCompartir) btnCompartir.style.display = '';
  const btnGuardar = document.getElementById('btn-guardar-sinastria');
  if (btnGuardar) btnGuardar.style.display = '';

  output.classList.add('visible');
  output.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- Panel de 8 factores (barras horizontales por sector) ---
// Sustituye al pentágono: más legible y accionable. Cada barra muestra nombre,
// nivel cualitativo (Facilidad/Matiz/Intenso/Desafío), score y descriptor.
const NIVEL_COL = { facilidad:'#4ade80', matiz:'#f5d76e', intenso:'#f59e0b', desafio:'#f87171' };
function _nivelMeta(nivel) {
  const labels = {
    facilidad: t('sinastria.nivel_facilidad') || 'Facilidad',
    matiz: t('sinastria.nivel_matiz') || 'Con matices',
    intenso: t('sinastria.nivel_intenso') || 'Intenso (con fricción)',
    desafio: t('sinastria.nivel_desafio') || 'A trabajar',
  };
  return { label: labels[nivel] || nivel, color: NIVEL_COL[nivel] || NIVEL_COL.matiz };
}
function renderPanelFactores(factores, globalScore, label, detalle) {
  if (!factores || !factores.length) return '';
  const orden = ['quimica','emocional','mental','espiritual','estabilidad','valores','transformacion','compromiso'];
  const ordenados = orden.map(k => factores.find(f => f.key === k)).filter(Boolean);
  let h = `<div class="sinastria-factores-panel">`;
  // Radar octogonal (8 ejes): complemento visual del perfil por sector.
  h += `<div class="sinastria-factores-radar">${generarRadarOctogonalSVG(ordenados, globalScore)}</div>`;
  // Consejo "Punto a trabajar": justo debajo del diagrama, adaptado a los
  // sectores en rojo (nivel 'desafio'). Si hay varios, los lista todos.
  h += _renderConsejo(factores);
  // Resumen secundario: % global (el perfil por factores es lo protagonista)
  h += `<div class="sinastria-factores-global">`;
  h += `  <span class="fg-pct">${globalScore}%</span>`;
  h += `  <div class="fg-texto"><span class="fg-label">${t('sinastria.globalScore') || 'Compatibilidad global'}</span><span class="fg-frase">${label}</span></div>`;
  h += `</div>`;
  h += `<div class="sinastria-score-disclaimer">${t('sinastria.disclaimerScore') || ''}</div>`;
  // Leyenda con puntos de color (como el radar clásico): qué significa cada color.
  h += `<div class="sinastria-factores-leyenda">`;
  h += `  <span class="leyenda-item"><i class="leyenda-dot" style="background:#4ade80"></i>${t('sinastria.leyendaFluye') || 'Fluye'}</span>`;
  h += `  <span class="leyenda-item"><i class="leyenda-dot" style="background:#f5d76e"></i>${t('sinastria.leyendaMatices') || 'Con matices'}</span>`;
  h += `  <span class="leyenda-item"><i class="leyenda-dot" style="background:#f59e0b"></i>${t('sinastria.leyendaIntenso') || 'Intenso (con fricción)'}</span>`;
  h += `  <span class="leyenda-item"><i class="leyenda-dot" style="background:#f87171"></i>${t('sinastria.leyendaTrabajar') || 'Requiere trabajo'}</span>`;
  h += `</div>`;
  for (const f of ordenados) {
    const n = _nivelMeta(f.nivel);
    const det = (detalle && detalle[f.key]) ? detalle[f.key] : [];
    const friccion = f.friccion ? ` <span class="factor-friccion">${t('sinastria.conFriccion') || '≈ con fricción'}</span>` : '';
    h += `<div class="factor-row" data-factor="${f.key}">`;
    h += `  <div class="factor-row-top">`;
    h += `    <span class="factor-nombre">${_factorLabel(f.key)}</span>`;
    h += `    <span class="factor-nivel" style="color:${n.color};border-color:${n.color}">${n.label}</span>`;
    h += `    <span class="factor-score" style="color:${n.color}">${f.score}</span>`;
    h += `  </div>`;
    h += `  <div class="factor-bar"><div class="factor-bar-fill" style="width:${f.score}%;background:${n.color}"></div></div>`;
    h += `  <div class="factor-desc">${_factorDesc(f.key)}${friccion}</div>`;
    if (det.length) h += `  <div class="factor-detalle"><ul>${det.slice(0, 3).map(d => `<li>${d}</li>`).join('')}</ul></div>`;
    h += `</div>`;
  }
  h += `</div>`;
  return h;
}

// Consejo de un sector en rojo (i18n con fallback), para el bloque "Punto a trabajar".
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

// "Punto a trabajar": se adapta al número de sectores en rojo (nivel 'desafio').
// Si hay más de uno, los lista y da su consejo. Se muestra justo bajo el diagrama.
function _renderConsejo(factores) {
  const rojos = (factores || []).filter(f => f.nivel === 'desafio').sort((a, b) => a.score - b.score);
  if (!rojos.length) return '';
  const principal = rojos[0];
  const rest = rojos.slice(1);
  const plural = rest.length > 0;
  let h = `<div class="sinastria-consejo sinastria-consejo-panel">`;
  h += `<span class="sinastria-consejo-icon">⚡</span><div>`;
  if (plural) {
    h += `<span class="sinastria-consejo-titulo">${t('sinastria.consejoTituloPlural') || 'Puntos a trabajar'}: <strong>${rojos.map(r => _factorLabel(r.key)).join(', ')}</strong></span>`;
  } else {
    h += `<span class="sinastria-consejo-titulo">${t('sinastria.consejoTitulo') || 'Punto a trabajar'}: <strong>${_factorLabel(principal.key)} (${principal.score})</strong></span>`;
  }
  h += `<span class="sinastria-consejo-texto">${_consejoFactorLocal(principal.key)}</span>`;
  for (const r of rest) {
    h += `<span class="sinastria-consejo-extra"><strong>${_factorLabel(r.key)}:</strong> ${_consejoFactorLocal(r.key)}</span>`;
  }
  h += `</div></div>`;
  return h;
}

// --- Detalles técnicos (tabla desplegable por sector) ---
// Para quien quiera el desglose técnico total: (1) tabla por sector con peso,
// puntuación y aporte; (2) un apartado "Datos completos" con TODOS los aspectos
// cruzados, los planetas de cada carta con signo y grado, la carta compuesta,
// las casas de impacto y la amistad planetaria.
function renderDetallesTecnicos(resultado, cartaA, cartaB) {
  const factores = resultado.factores;
  if (!factores || !factores.length) return '';
  const orden = ['quimica','emocional','mental','espiritual','estabilidad','valores','transformacion','compromiso'];
  const fs = orden.map(k => factores.find(f => f.key === k)).filter(Boolean);
  const factorDetalle = resultado.factorDetalle;
  let h = `<div class="detalles-collapse-wrap sinastria-aspectos-wrap">`;
  h += `<h4 class="aspectos-titulo">${t('sinastria.detallesTitulo') || 'Detalles técnicos'} <button class="btn-aspectos-toggle" id="btn-sinastria-detalles-toggle">▸</button></h4>`;
  h += `<div class="aspectos-scroll" style="display:none">`;
  h += `<table class="tabla-detalles"><thead><tr>`;
  h += `<th class="td-sector">${t('sinastria.sector') || 'Sector'}</th>`;
  h += `<th class="td-peso">${t('sinastria.peso') || 'Peso'}</th>`;
  h += `<th class="td-score">${t('sinastria.globalScore') || 'Punt.'}</th>`;
  h += `<th class="td-contrib">${t('sinastria.desgloseContrib') || 'Aporta'}</th>`;
  h += `</tr></thead><tbody>`;
  for (const f of fs) {
    const pct = Math.round(f.peso * 100);
    const color = NIVEL_COL[f.nivel] || NIVEL_COL.matiz;
    h += `<tr class="detalles-sector">`;
    h += `  <td class="td-sector"><span style="color:${color}">●</span> ${_factorLabel(f.key)}</td>`;
    h += `  <td class="td-peso">${pct}%</td>`;
    h += `  <td class="td-score"><strong>${f.score}</strong></td>`;
    h += `  <td class="td-contrib">+${f.contribucion}%</td>`;
    h += `</tr>`;
    const det = (factorDetalle && factorDetalle[f.key]) ? factorDetalle[f.key] : [];
    if (det.length) {
      h += `<tr class="detalles-asp-row"><td colspan="4"><ul>${det.map(d => `<li>${d}</li>`).join('')}</ul></td></tr>`;
    }
  }
  h += `</tbody></table>`;

  // --- Datos completos: toda la sinastría a nivel técnico ---
  h += `<div class="detalles-completos">`;
  h += _tablaAspectosCompleta(resultado.aspectosCruzados, cartaA, cartaB);
  h += `<div class="detalles-cartas">`;
  h += _tablaPlanetas(cartaA, (cartaA?.nombre || t('sinastria.personaA') || 'Persona A'));
  h += _tablaPlanetas(cartaB, (cartaB?.nombre || t('sinastria.personaB') || 'Persona B'));
  h += `</div>`;
  h += _tablaCompuesta(resultado.cartaCompuesta);
  h += _listaCasas(resultado.casasDestacadas, (cartaA?.nombre || 'A'), (cartaB?.nombre || 'B'));
  h += _listaAmistad(resultado.amistadPlanetaria);
  h += `</div>`;

  h += `</div></div>`;
  setTimeout(() => {
    const btn = document.getElementById('btn-sinastria-detalles-toggle');
    if (btn) btn.addEventListener('click', () => {
      const t = btn.closest('.detalles-collapse-wrap').querySelector('.aspectos-scroll');
      if (t) t.style.display = (t.style.display === 'none' ? '' : 'none');
      btn.textContent = (t && t.style.display === 'none') ? '▸' : '▾';
    });
  }, 0);
  return h;
}

// --- Helpers del desglose técnico completo ---
function _formatGradosSigno(lon) {
  try { const g = gradosASigno(lon); return `${g.grados}°${String(g.minutos).padStart(2,'0')}' ${g.signo.nombre}`; } catch (e) { return ''; }
}
// Planeta con signo y grado en su carta (incluye ASC/MC).
function _planetaGrados(nombre, carta) {
  const np = _nombrePlaneta(nombre);
  if (nombre === 'I ASC') return `${np} ${_formatGradosSigno(carta.asc)}`;
  if (nombre === 'X MC') return `${np} ${_formatGradosSigno(carta.mc)}`;
  const p = carta.planetas.find(x => x.nombre === nombre);
  if (p) return `${np} ${p.grados}°${String(p.minutos).padStart(2,'0')}' ${p.signo.nombre}`;
  return np;
}
// Todos los aspectos cruzados, ordenados por orbe (los más exactos primero).
function _tablaAspectosCompleta(aspectos, cartaA, cartaB) {
  if (!aspectos || !aspectos.length) return '';
  const nombreA = cartaA?.nombre || 'A';
  const nombreB = cartaB?.nombre || 'B';
  let h = `<h5 class="detalles-sub">${t('sinastria.todosAspectos') || 'Todos los aspectos cruzados'}</h5>`;
  h += `<table class="tabla-detalles"><thead><tr><th>${nombreA}</th><th></th><th>${nombreB}</th><th>${t('sinastria.tipo')||'Aspecto'}</th><th>${t('sinastria.orbe')||'Orbe'}</th></tr></thead><tbody>`;
  const sorted = aspectos.slice().sort((a, b) => a.orb - b.orb);
  for (const a of sorted) {
    h += `<tr>`;
    h += `<td>${_planetaGrados(a.p1, cartaA)}</td>`;
    h += `<td>${a.simbolo}</td>`;
    h += `<td>${_planetaGrados(a.p2, cartaB)}</td>`;
    h += `<td>${tAspecto(a.tipo)}</td>`;
    h += `<td>${_formatOrbe(a.orb)}</td>`;
    h += `</tr>`;
  }
  h += `</tbody></table>`;
  return h;
}
// Planetas de una carta natal (con signo, grado y casa).
// Cada carta se envuelve en su propio <div> para que el nombre quede encima de
// su tabla (y las dos cartas se colocan lado a lado sin nombres sueltos).
function _tablaPlanetas(carta, label) {
  if (!carta || !carta.planetas) return '';
  const planeta = t('sinastria.planeta') || 'Planeta';
  const pos = t('sinastria.posicion') || 'Posición';
  const casa = t('sinastria.casa') || 'Casa';
  let h = `<div class="detalles-carta">`;
  h += `<h5 class="detalles-sub">${label}</h5>`;
  h += `<table class="tabla-detalles"><thead><tr><th>${planeta}</th><th>${pos}</th><th>${casa}</th></tr></thead><tbody>`;
  for (const p of carta.planetas) {
    h += `<tr><td>${_nombrePlaneta(p.nombre)}</td><td>${p.grados}°${String(p.minutos).padStart(2,'0')}' ${p.signo.nombre}</td><td>${p.casa}</td></tr>`;
  }
  h += `<tr><td>${_nombrePlaneta('I ASC')}</td><td>${_formatGradosSigno(carta.asc)}</td><td>1</td></tr>`;
  h += `<tr><td>${_nombrePlaneta('X MC')}</td><td>${_formatGradosSigno(carta.mc)}</td><td>10</td></tr>`;
  h += `</tbody></table>`;
  h += `</div>`;
  return h;
}
// Carta compuesta (la relación como entidad).
function _tablaCompuesta(cc) {
  if (!cc || !cc.planetas) return '';
  const pos = t('sinastria.posicion') || 'Posición';
  const casa = t('sinastria.casa') || 'Casa';
  let h = `<h5 class="detalles-sub">${t('sinastria.cartaCompuesta') || 'Carta compuesta'}</h5>`;
  h += `<table class="tabla-detalles"><thead><tr><th>Planeta</th><th>${pos}</th><th>${casa}</th></tr></thead><tbody>`;
  for (const p of cc.planetas) {
    h += `<tr><td>${_nombrePlaneta(p.nombre)}</td><td>${p.grados}°${String(p.minutos).padStart(2,'0')}' ${p.signo.nombre}</td><td>${p.casa ?? '—'}</td></tr>`;
  }
  // Con hora desconocida el motor no calcula ASC/MC compuestos (sinHora) → sin filas de ángulos.
  if (cc.asc != null && cc.mc != null) {
    h += `<tr><td>${_nombrePlaneta('I ASC')}</td><td>${cc.asc.toFixed(2)}°</td><td>1</td></tr>`;
    h += `<tr><td>${_nombrePlaneta('X MC')}</td><td>${cc.mc.toFixed(2)}°</td><td>10</td></tr>`;
  }
  h += `</tbody></table>`;
  return h;
}
// Casas de impacto (overlays): planetas de una persona en las casas de la otra.
function _listaCasas(casasDestacadas, nombreA, nombreB) {
  if (!casasDestacadas || !casasDestacadas.length) return '';
  const na = nombreA || 'A', nb = nombreB || 'B';
  let h = `<h5 class="detalles-sub">${t('sinastria.casasImpacto') || 'Casas de impacto'}</h5><ul class="detalles-lista">`;
  for (const c of casasDestacadas) {
    h += `<li>${_nombrePlaneta(c.planeta)} (${c.origen === 'B' ? nb : na}) → ${t('sinastria.casa')||'Casa'} ${c.casaEn} de ${c.origen === 'B' ? na : nb}: ${c.significado}</li>`;
  }
  h += `</ul>`;
  return h;
}
// Amistad planetaria (Graha Maitri).
function _listaAmistad(am) {
  if (!am) return '';
  const parts = [];
  if (am.amigos && am.amigos.length) parts.push((t('sinastria.amistadAmigos')||'Amistades naturales') + ': ' + am.amigos.slice(0, 6).map(x => _nombrePlaneta(x.p1) + '–' + _nombrePlaneta(x.p2)).join(', '));
  if (am.enemigos && am.enemigos.length) parts.push((t('sinastria.amistadEnemigos')||'Tensiones naturales') + ': ' + am.enemigos.slice(0, 6).map(x => _nombrePlaneta(x.p1) + '–' + _nombrePlaneta(x.p2)).join(', '));
  if (!parts.length) return '';
  return `<h5 class="detalles-sub">${t('sinastria.amistadTitulo') || 'Amistad planetaria (Graha Maitri)'}</h5><p class="detalles-p">${parts.join(' · ')}</p>`;
}

// --- Radar octogonal (8 ejes, uno por factor) ---
// Complemento visual del panel de barras: cada vértice está a la altura de su
// puntuación y se colorea por nivel (verde/amarillo/ámbar/rojo). El % global
// queda en el centro. Los vértices son tappables (muestran el detalle del factor).
function generarRadarOctogonalSVG(factores, globalScore) {
  if (!factores || !factores.length) return '';
  const cx = 170, cy = 170, R = 106;
  const n = factores.length;
  const ang = i => (-Math.PI / 2) + (i * 2 * Math.PI / n);
  const col = f => NIVEL_COL[f.nivel] || NIVEL_COL.matiz;
  // Etiqueta corta para el radar: "Transformación / Poder" → "Transformación",
  // "Valores / Estilo de amor" → "Valores", "Compromiso (Casa 7)" → "Compromiso".
  const _corto = s => s.split('/')[0].split('(')[0].trim();
  let s = '';
  // Rejilla concéntrica (25, 50, 75, 100)
  for (const pct of [25, 50, 75, 100]) {
    const r = R * pct / 100;
    const pts = [];
    for (let i = 0; i < n; i++) { const a = ang(i); pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`); }
    s += `<polygon points="${pts.join(' ')}" fill="none" stroke="rgba(232,196,106,0.15)" stroke-width="0.8"/>`;
  }
  // Ejes
  for (let i = 0; i < n; i++) {
    const a = ang(i);
    s += `<line x1="${cx}" y1="${cy}" x2="${(cx + R * Math.cos(a)).toFixed(1)}" y2="${(cy + R * Math.sin(a)).toFixed(1)}" stroke="rgba(232,196,106,0.2)" stroke-width="0.8"/>`;
  }
  // Área de puntuación
  const area = [];
  for (let i = 0; i < n; i++) {
    const a = ang(i); const r = R * factores[i].score / 100;
    area.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  s += `<polygon points="${area.join(' ')}" fill="rgba(232,196,106,0.18)" stroke="#e8c46a" stroke-width="1.5"/>`;
  // Vértices coloreados por nivel (tappables)
  for (let i = 0; i < n; i++) {
    const a = ang(i); const r = R * factores[i].score / 100;
    const vx = (cx + r * Math.cos(a)).toFixed(1), vy = (cy + r * Math.sin(a)).toFixed(1);
    const c = col(factores[i]);
    s += `<circle cx="${vx}" cy="${vy}" r="4.5" fill="${c}" stroke="#0b0716" stroke-width="1" style="cursor:pointer" onclick="window.__sinastriaUI.mostrarInfoFactor(${i})"/>`;
  }
  // Etiquetas (nombre + score) fuera del octágono
  for (let i = 0; i < n; i++) {
    const a = ang(i); const lr = R + 26;
    const lx = cx + lr * Math.cos(a), ly = cy + lr * Math.sin(a);
    const c = col(factores[i]);
    s += `<text x="${lx.toFixed(1)}" y="${(ly - 2).toFixed(1)}" text-anchor="middle" fill="#e8c46a" font-size="8.5" font-weight="bold" style="cursor:pointer" onclick="window.__sinastriaUI.mostrarInfoFactor(${i})">${_corto(_factorLabel(factores[i].key))}</text>`;
    s += `<text x="${lx.toFixed(1)}" y="${(ly + 9).toFixed(1)}" text-anchor="middle" fill="${c}" font-size="9" font-weight="bold" style="cursor:pointer" onclick="window.__sinastriaUI.mostrarInfoFactor(${i})">${factores[i].score}</text>`;
  }
  // % global en el centro
  s += `<circle cx="${cx}" cy="${cy}" r="17" fill="rgba(5,2,20,0.8)"/>`;
  s += `<text x="${cx}" y="${cy - 1}" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">${globalScore}%</text>`;
  s += `<text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="#9a8cc0" font-size="6.5">${t('sinastria.radarGlobal') || 'Global'}</text>`;
  return `<svg viewBox="0 0 340 340" xmlns="http://www.w3.org/2000/svg" class="sinastria-radar-oct">${s}</svg>`;
}

// --- Desglose de la puntuación (8 factores) ---
function _factorLabel(key) {
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

// Frase explicativa breve de cada factor (para el panel de barras)
function _factorDesc(key) {
  const map = {
    quimica: t('sinastria.factorDesc_quimica') || 'Atracción física y pasión entre ustedes.',
    emocional: t('sinastria.factorDesc_emocional') || 'Conexión de sentimientos y cuidado mutuo.',
    mental: t('sinastria.factorDesc_mental') || 'Comunicación y afinidad de ideas.',
    espiritual: t('sinastria.factorDesc_espiritual') || 'Valores profundos y sentido de destino.',
    estabilidad: t('sinastria.factorDesc_estabilidad') || 'Compromiso y solidez a largo plazo.',
    valores: t('sinastria.factorDesc_valores') || 'Estilo de amor y valores: cómo se quieren y qué esperan el uno del otro.',
    transformacion: t('sinastria.factorDesc_transformacion') || 'Intensidad, poder compartido y capacidad de transformarse juntos.',
    compromiso: t('sinastria.factorDesc_compromiso') || 'Planetas cerca del eje de compromiso (Casa 7 / Descendente).',
  };
  return map[key] || '';
}

// Balance de aspectos (estilo CafeAstrology): armónicos / tensos / neto
function _netoHTML(neto) {
  if (!neto) return '';
  const signo = n => n > 0 ? '+' + n : String(n);
  return `<div class="sinastria-neto">
    <span class="neto-pos">+${neto.armonico} ${t('sinastria.netoArmonicos') || 'armónicos'}</span>
    <span class="neto-sep">·</span>
    <span class="neto-neg">−${neto.tension} ${t('sinastria.netoTensos') || 'tensos'}</span>
    <span class="neto-sep">·</span>
    <span class="neto-total">${t('sinastria.netoBalance') || 'neto'} ${signo(neto.net)}</span>
    <div class="neto-disclaimer">${t('sinastria.netoDisclaimer') || 'Balance general de todos los aspectos. El desglose por factores te muestra mejor el día a día de la relación.'}</div>
  </div>`;
}





// --- Tarjetas de casas destacadas ---
// Mapa casa → dimensión del radar (mismo que DIM_CASA en el motor)
const _DIM_CASA = {
  1:'conexionEmocional', 4:'conexionEmocional', 5:'quimicaPasion', 7:'estabilidadFuturo',
  8:'quimicaPasion', 3:'afinidadMental', 9:'sintoniaEspiritual', 10:'estabilidadFuturo', 12:'sintoniaEspiritual',
};

// Etiqueta traducida de una dimensión del radar
function _dimensionLabel(dim) {
  const map = {
    quimicaPasion: t('sinastria.quimica') || 'Pasión',
    afinidadMental: t('sinastria.mental') || 'Mental',
    conexionEmocional: t('sinastria.emocional') || 'Emocional',
    sintoniaEspiritual: t('sinastria.espiritual') || 'Espiritual',
    estabilidadFuturo: t('sinastria.estabilidad') || 'Estabilidad',
  };
  return map[dim] || '';
}





// Frase descriptiva para una dimensión del radar según su score
function _fraseDimensionRadar(dimKey, score) {
  const nivel = score >= 70 ? 'Alta' : score >= 50 ? 'Media' : 'Baja';
  const clave = `sinastria.radar_${dimKey}_${nivel}`;
  const val = t(clave);
  if (val && val !== clave) return val;
  // Fallback genérico
  const _tf = (k, fb) => { const v = t(k); return (v && v !== k) ? v : fb; };
  if (score >= 70) return _tf('sinastria.radarAlta', 'Conexión intensa en esta dimensión');
  if (score >= 50) return _tf('sinastria.radarMedia', 'Buena sintonía con matices a pulir');
  return _tf('sinastria.radarBaja', 'Conexión moderada que requiere atención');
}





function _nombrePlaneta(nombreEN) {
  const nombres = t('astral.nombresPlanetarios');
  if (nombres && typeof nombres === 'object' && nombres[nombreEN]) return nombres[nombreEN];
  return nombreEN;
}

// Formatea un planeta con su signo y la persona a la que pertenece.
// p1 del aspecto pertenece a la persona A (cartaA), p2 a la persona B (cartaB).
// El nombre se envuelve como término del glosario (tappable).
// Los ángulos (ASC/MC) no están en carta.planetas: su signo se deriva de carta.asc/.mc.
function _planetaConSigno(planetaEN, carta, nombrePersona) {
  const p = carta.planetas.find(x => x.nombre === planetaEN);
  const nombre = _nombrePlaneta(planetaEN);
  let term, signo = '';
  if (planetaEN === 'X MC') {
    term = `<span class="term" data-term="concepto:medioCielo">${nombre}</span>`;
    signo = _signoDeLongitud(carta.mc);
  } else if (planetaEN === 'I ASC') {
    term = `<span class="term" data-term="concepto:ascendente">${nombre}</span>`;
    signo = _signoDeLongitud(carta.asc);
  } else {
    term = `<span class="term" data-term="planeta:${planetaEN}">${nombre}</span>`;
    if (p) signo = p.signo.nombre;
  }
  const parteSigno = signo ? ` (${signo}, ` : ' (';
  return `${term}${parteSigno}${nombrePersona})`;
}

function _signoDeLongitud(lon) {
  try { return gradosASigno(lon).signo.nombre; } catch (e) { return ''; }
}
function _aspectoConSignoYPersona(data, cartaA, cartaB, nombreA, nombreB) {
  if (!data) return '';
  return `${_planetaConSigno(data.p1, cartaA, nombreA)} ${data.simbolo} ${_planetaConSigno(data.p2, cartaB, nombreB)}`;
}

// --- Título interpretable para pills fuerte/desafío ---
// Genera una frase humana basada en los planetas y tipo de aspecto.
// Usa claves i18n con fallback a español.
function _tituloInterpretable(data, armonico) {
  if (!data) return armonico ? (t('sinastria.sinFuerte') || 'Sin punto fuerte destacado') : (t('sinastria.sinDesafio') || 'Sin desafío destacado');
  const p1 = _nombrePlaneta(data.p1);
  const p2 = _nombrePlaneta(data.p2);
  const tipo = data.tipo;
  // Clave i18n específica para este par de planetas + aspecto (opcional, para personalizar)
  const clave = `sinastria.${armonico ? 'fuerte' : 'desafio'}_${data.p1}_${data.p2}_${tipo}`;
  const custom = t(clave);
  if (custom && custom !== clave) return custom;
  // Patrones genéricos por tipo de aspecto
  const _tf = (k, fb) => { const v = t(k); return (v && v !== k) ? v : fb; };
  if (armonico) {
    if (tipo === 'Conjunction') return _tf('sinastria.tituloConjuncion', 'Unión armoniosa que fusiona energías') + `: ${p1} + ${p2}`;
    if (tipo === 'Trine') return _tf('sinastria.tituloTrigono', 'Fluir natural entre ambas energías') + `: ${p1} + ${p2}`;
    if (tipo === 'Sextile') return _tf('sinastria.tituloSextil', 'Oportunidad de sintonía por cultivar') + `: ${p1} + ${p2}`;
    return `${p1} y ${p2} en armonía`;
  } else {
    if (tipo === 'Square') return _tf('sinastria.tituloCuadratura', 'Tensión creativa que empuja a crecer') + `: ${p1} vs ${p2}`;
    if (tipo === 'Opposition') return _tf('sinastria.tituloOposicion', 'Polaridad a integrar y equilibrar') + `: ${p1} vs ${p2}`;
    if (tipo === 'Conjunction') return _tf('sinastria.tituloConjuncionTen', 'Fusión intensa que puede abrumar') + `: ${p1} + ${p2}`;
    return `Desafío entre ${p1} y ${p2}`;
  }
}

// ============================================================
// Puente global para onclick del SVG bicarta
// ============================================================
window.__sinastriaUI = {
  mostrarInfoPlaneta(origen, idx) {
    if (!ultimasCartas) return;
    const carta = origen === 'A' ? ultimasCartas.cartaA : ultimasCartas.cartaB;
    const p = carta.planetas[idx];
    if (!p) return;
    const info = document.getElementById('sinastria-rueda-info');
    if (info) info.innerHTML = `<b>${_nombrePlaneta(p.nombre)}</b> · ${p.grados}°${String(p.minutos).padStart(2,'0')}' ${p.signo?.nombre||''} · ${t('sinastria.casa')||'Casa'} ${p.casa}${p.retro?' · R':''}`;
  },
  mostrarInfoAspecto(idx) {
    if (!ultimaSinastria) return;
    const a = ultimaSinastria.aspectosCruzados[idx];
    if (!a) return;
    const info = document.getElementById('sinastria-rueda-info');
    if (info) info.innerHTML = `<b>${_nombrePlaneta(a.p1)} (A) ${a.simbolo} ${_nombrePlaneta(a.p2)} (B)</b> · ${tAspecto(a.tipo)} · orbe ${_formatOrbe(a.orb)}`;
  },
  mostrarInfoSignoA(idx) {
    const info = document.getElementById('sinastria-rueda-info');
    if (info) info.textContent = SIGNOS[idx].nombre + ' — ' + SIGNOS[idx].elemento + '/' + SIGNOS[idx].modalidad;
  },
  mostrarInfoSignoB(idx) {
    const info = document.getElementById('sinastria-rueda-info');
    if (info) info.textContent = SIGNOS[idx].nombre + ' — ' + SIGNOS[idx].elemento + '/' + SIGNOS[idx].modalidad;
  },
  mostrarInfoFactor(idx) {
    if (!ultimaSinastria) return;
    const orden = ['quimica','emocional','mental','espiritual','estabilidad','valores','transformacion','compromiso'];
    const f = ultimaSinastria.factores.find(x => x.key === orden[idx]);
    if (!f) return;
    const info = document.getElementById('sinastria-rueda-info');
    if (!info) return;
    const nivel = _nivelMeta(f.nivel).label;
    const det = (ultimaSinastria.factorDetalle && ultimaSinastria.factorDetalle[f.key]) || [];
    let html = `<b>${_factorLabel(f.key)}: ${f.score}/100</b> — ${nivel}${f.friccion ? ' ≈' : ''}`;
    if (det.length) html += `<br><span style="font-size:0.8em;opacity:0.85">${det.slice(0, 3).join(' · ')}</span>`;
    info.innerHTML = html;
  },
  mostrarInfoRadar(dimIdx) {
    if (!ultimaSinastria) return;
    const dims = [
      { key:'quimicaPasion',       label: t('sinastria.quimica')       || 'Pasión' },
      { key:'afinidadMental',      label: t('sinastria.mental')       || 'Mental' },
      { key:'conexionEmocional',   label: t('sinastria.emocional')   || 'Emocional' },
      { key:'sintoniaEspiritual',  label: t('sinastria.espiritual')  || 'Espiritual' },
      { key:'estabilidadFuturo',   label: t('sinastria.estabilidad') || 'Estabilidad' },
    ];
    const dim = dims[dimIdx];
    if (!dim) return;
    const score = ultimaSinastria.radarScores[dim.key];
    const origen = ultimaSinastria.radarOrigen?.[dim.key] || [];
    const frase = _fraseDimensionRadar(dim.key, score);
    let html = `<b>${dim.label}: ${score}/100</b> — ${frase}`;
    if (origen.length) {
      const aspectos = origen.slice(0, 3).map(o => {
        const signo = o.armonico ? '+' : '−';
        return `${_nombrePlaneta(o.p1)} ${tAspecto(o.tipo)} ${_nombrePlaneta(o.p2)} (${signo}${Math.abs(o.delta)})`;
      }).join(' · ');
      html += `<br><span style="font-size:0.8em;opacity:0.85">${aspectos}</span>`;
    }
    const info = document.getElementById('sinastria-rueda-info');
    if (info) info.innerHTML = html;
  },
};

function _formatOrbe(orb) {
  const g = Math.floor(orb);
  const m = Math.floor((orb - g) * 60);
  return `${g}°${String(m).padStart(2,'0')}'`;
}

// ============================================================
// Copiar / Compartir (reutiliza puentes nativos)
// Copia el mismo bloque de datos que se envía a la IA en "Analizar sinastría":
// DATOS DE LAS PERSONAS + PUNTUACIONES Y ASPECTOS (el prompt del usuario).
// ============================================================
export function getTextoCopia(resultado, cartaA, cartaB) {
  if (!resultado) return '';
  let s = `DATOS DE LAS PERSONAS:\n`;
  s += `- Persona A:\n${_personaDataIA(cartaA)}\n`;
  s += `- Persona B:\n${_personaDataIA(cartaB)}\n`;
  s += `PUNTUACIONES Y ASPECTOS:\n${resultado.promptDataText || ''}`;
  return s;
}

// Bloque compacto de una persona (mismo formato que el del prompt de la IA):
// planetas personales con signo, grado y casa + ASC/MC.
function _personaDataIA(carta) {
  if (!carta || !carta.planetas) return '';
  const nombre = carta.nombre || 'Persona';
  let s = `${nombre}\n`;
  const claves = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'];
  for (const n of claves) {
    const p = carta.planetas.find(x => x.nombre === n);
    if (p) s += `- ${_nombrePlaneta(n)}: ${p.grados}°${String(p.minutos).padStart(2,'0')}' ${p.signo.nombre} (Casa ${p.casa})\n`;
  }
  s += `- ${_nombrePlaneta('I ASC')}: ${_formatGradosSigno(carta.asc)} (Casa 1)\n`;
  s += `- ${_nombrePlaneta('X MC')}: ${_formatGradosSigno(carta.mc)} (Casa 10)\n`;
  return s;
}

// Planetas de una carta para el texto copiado.
function _planetasCopia(carta, nombre) {
  if (!carta || !carta.planetas) return '';
  let s = `${nombre}:\n`;
  for (const p of carta.planetas) {
    s += `- ${_nombrePlaneta(p.nombre)}: ${p.grados}°${String(p.minutos).padStart(2,'0')}' ${p.signo.nombre} (Casa ${p.casa})\n`;
  }
  s += `- ${_nombrePlaneta('I ASC')}: ${_formatGradosSigno(carta.asc)} (Casa 1)\n`;
  s += `- ${_nombrePlaneta('X MC')}: ${_formatGradosSigno(carta.mc)} (Casa 10)\n`;
  return s;
}
// Carta compuesta para el formato copiado.
function _compuestaCopia(cc) {
  if (!cc || !cc.planetas) return '';
  let s = `CARTA COMPUESTA (la relación como entidad):\n`;
  for (const p of cc.planetas) {
    s += `- ${_nombrePlaneta(p.nombre)}: ${p.grados}°${String(p.minutos).padStart(2,'0')}' ${p.signo.nombre} (Casa ${p.casa})\n`;
  }
  s += `- ${_nombrePlaneta('I ASC')}: ${cc.asc.toFixed(2)}° (Casa 1)\n`;
  s += `- ${_nombrePlaneta('X MC')}: ${cc.mc.toFixed(2)}° (Casa 10)\n`;
  return s;
}

export async function copiar() {
  let txt = getTextoCopia(ultimaSinastria, ultimasCartas?.cartaA, ultimasCartas?.cartaB);
  if (!txt) return;
  if (window.AndroidClipboard?.copy) { window.AndroidClipboard.copy(txt); _mostrarCopiado('btn-copiar-sinastria'); return; }
  try { await navigator.clipboard.writeText(txt); _mostrarCopiado('btn-copiar-sinastria'); }
  catch { _fallbackCopiar(txt); _mostrarCopiado('btn-copiar-sinastria'); }
}

export async function compartir() {
  let txt = getTextoCopia(ultimaSinastria, ultimasCartas?.cartaA, ultimasCartas?.cartaB);
  if (!txt) return;
  // Añadir el análisis (IA o local) si se ha realizado
  const analisis = window.__sinastriaUI?._ultimoAnalisis;
  if (analisis) {
    const tmp = document.createElement('div');
    tmp.innerHTML = analisis;
    txt += '\n\n=== ANÁLISIS DE SINASTRIA ===\n' + (tmp.innerText || tmp.textContent || '').trim();
  }
  if (window.AndroidShare?.share) { window.AndroidShare.share(txt); return; }
  try { if (navigator.share) { await navigator.share({ text: txt }); return; } } catch {}
  // Fallback: copiar al portapapeles el texto completo (datos + análisis)
  if (window.AndroidClipboard?.copy) { window.AndroidClipboard.copy(txt); _mostrarCopiado('btn-compartir-sinastria'); return; }
  try { await navigator.clipboard.writeText(txt); _mostrarCopiado('btn-compartir-sinastria'); }
  catch { _fallbackCopiar(txt); _mostrarCopiado('btn-compartir-sinastria'); }
}

function _fallbackCopiar(txt) {
  const ta = document.createElement('textarea');
  ta.value = txt; document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); } catch {}
  ta.remove();
}

function _mostrarCopiado(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const orig = btn.textContent;
  btn.textContent = '✓ ' + (t('sinastria.copiado') || 'Copiado');
  setTimeout(() => { btn.textContent = orig; }, 2000);
}

export function getUltimaSinastria() { return { resultado: ultimaSinastria, cartas: ultimasCartas }; }