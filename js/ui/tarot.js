// ui/tarot.js — Renderizado de tiradas de Tarot + I Ching
// FIX: Layout rediseñado sin solapamientos. Cruz Celta usa CSS Grid responsivo
// en lugar de position:absolute con porcentajes que causaban pisado en móvil.
import { barajaTarot, posicionesCruzCelta, posicionesTres, dictHexagramas, codigoANumero, getImgUrl } from '../data/tarot-data.js?v=18';
import { t, tCarta, tKB, tHexagrama, tPosicion } from '../i18n/i18n.js?v=18';
import { KB } from '../data/tarot-kb.js?v=18';
import { KB_ICHING } from '../data/iching-kb.js?v=18';
import { abrirModal, abrirModalIching } from './modal.js?v=18';
import { generarAnalisis, extraerTextoAnalisis } from '../core/analysis.js?v=18';
import { generarHexagramaPorNum } from '../data/iching-svg.js?v=18';
import { analisisTarotIA } from '../core/ia-api.js?v=18';
import { mostrarDonacionSiToca } from './donacion.js?v=18';

let ultimaTirada = null;
let textoGlobalCopia = '';

export function getUltimaTirada() { return ultimaTirada; }
export function getTextoCopia() { return textoGlobalCopia; }

// === VISUALIZAR TIRADA GUARDADA ===
export function visualizarTiradaGuardada(datos) {
  if (!datos || !datos.cartas) return;
  ultimaTirada = datos;

  const resultadosDiv = document.getElementById('resultados');
  const btnCopiar = document.getElementById('btn-copiar');
  const btnAnalisis = document.getElementById('btn-analisis');
  const btnGuardar = document.getElementById('btn-guardar-tirada');

  let html = '';
  const nombreTirada = datos.tipo === 'una' ? t('tarot.nombreTirada1') : (datos.tipo === 'tres' ? t('tarot.nombreTirada3') : t('tarot.nombreTiradaCruz'));

  // Sección Tarot
  html += '<div class="seccion" style="animation-delay:0s"><h2 class="seccion-titulo"><span class="icono-titulo">🔮</span>' + t('tarot.seccionTarot', {tipo: nombreTirada}) + '</h2>';
  if (datos.tipo === 'cruz') {
    html += renderCruzCelta(datos.cartas);
  } else {
    html += renderCartasSimples(datos.cartas);
  }
  html += '</div>';

  // Sección I Ching
  if (datos.iching) {
    const ic = datos.iching;
    html += '<div class="seccion" style="animation-delay:0.2s"><h2 class="seccion-titulo"><span class="icono-titulo">☯️</span>' + t('tarot.seccionIching') + '</h2><div class="iching-contenedor">';
    html += '<div class="hexagrama-caja" onclick="window.__tarotUI.abrirModalIching(' + ic.numPrincipal + ')">';
    html += '<h4 class="hexagrama-titulo">' + t('tarot.hexPrincipal') + '</h4>';
    html += generarHexagramaPorNum(ic.numPrincipal, 70);
    html += '<div class="hexagrama-nombre">' + (tHexagrama(ic.numPrincipal)?.nombre || ic.principal || '') + '</div>';
    const kbP_T = tHexagrama(ic.numPrincipal);
    if (kbP_T) html += '<div class="hexagrama-trigramas">' + kbP_T.trigInf + ' ↑ ' + kbP_T.trigSup + '</div>';
    if (ic.lineasValor) html += dibujarHexagramaVisual(ic.lineasValor, true);
    html += '</div>';
    if (ic.hayMutacion && ic.numFuturo) {
      html += '<div class="hexagrama-caja" onclick="window.__tarotUI.abrirModalIching(' + ic.numFuturo + ')">';
      html += '<h4 class="hexagrama-titulo">' + t('tarot.hexFuturo') + '</h4>';
      html += generarHexagramaPorNum(ic.numFuturo, 70);
      html += '<div class="hexagrama-nombre">' + (tHexagrama(ic.numFuturo)?.nombre || ic.futuro || '') + '</div>';
      const kbF_T = tHexagrama(ic.numFuturo);
      if (kbF_T) html += '<div class="hexagrama-trigramas">' + kbF_T.trigInf + ' ↑ ' + kbF_T.trigSup + '</div>';
      if (ic.lineasValor) {
        let lineasFuturo = ic.lineasValor.map(function(v) { if (v === 9) return 8; if (v === 6) return 7; return v; });
        html += dibujarHexagramaVisual(lineasFuturo, false);
      }
      html += '</div>';
    }
    html += '</div></div>';
  }

  // Reconstruir texto de copia
  textoGlobalCopia = t('copiar.preguntaRealizada') + '\n' + (datos.pregunta || t('copiar.sinPregunta')) + '\n\n';
  textoGlobalCopia += t('copiar.tiradaTarot', {tipo: nombreTirada}) + '\n';
  datos.cartas.forEach(function(c) {
    textoGlobalCopia += '- ' + c.posicion + ': ' + tCarta(c.nombre) + ' ' + c.orientacion + '\n';
  });
  if (datos.iching && datos.iching.principal) {
    const hexP_T = datos.iching.numPrincipal ? tHexagrama(datos.iching.numPrincipal) : null;
    const hexF_T = datos.iching.numFuturo ? tHexagrama(datos.iching.numFuturo) : null;
    textoGlobalCopia += '\n' + t('copiar.tiradaIching') + '\n' + t('copiar.hexPrincipal') + ' ' + (hexP_T?.nombre || datos.iching.principal) + '\n';
    if (datos.iching.futuro) textoGlobalCopia += t('copiar.hexFuturo') + ' ' + (hexF_T?.nombre || datos.iching.futuro) + '\n';
  }

  resultadosDiv.innerHTML = html;
  if (btnCopiar) btnCopiar.style.display = 'block';
  const btnCompartir = document.getElementById('btn-compartir');
  if (btnCompartir) btnCompartir.style.display = 'block';
  if (btnAnalisis) btnAnalisis.style.display = 'block';
  if (btnGuardar) btnGuardar.style.display = 'none';
  setTimeout(function() { resultadosDiv.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
}

// Las explicaciones de cada tirada se muestran en el HTML vía data-i18n
// (tarot.tirada1_desc, tarot.tirada3_desc, tarot.tiradaCruz_desc).

export function realizarConsulta(tipoTiradaTarot) {
  const resultadosDiv = document.getElementById('resultados');
  const btnCopiar = document.getElementById('btn-copiar');
  const btnCopiarTodo = document.getElementById('btn-copiar-todo');
  const btnCompartir = document.getElementById('btn-compartir');
  const btnCompartirTodo = document.getElementById('btn-compartir-todo');
  const btnAnalisis = document.getElementById('btn-analisis');
  const btnGuardar = document.getElementById('btn-guardar-tirada');
  const divExplicacion = document.getElementById('tirada-explicacion');
  const pregunta = document.getElementById('pregunta').value.trim();

  // Limpiar análisis previo
  const oldAnalisis = document.getElementById('analisis-output');
  if (oldAnalisis) oldAnalisis.remove();

  // La explicación breve ya está visible debajo de cada botón en el HTML;
  // no la duplicamos aquí. Ocultamos el contenedor legacy por si acaso.
  if (divExplicacion) { divExplicacion.innerHTML = ''; divExplicacion.style.display = 'none'; }

  // === MOSTRAR ANIMACIÓN DE BARAJADO INMEDIATAMENTE ===
  mostrarAnimacionBarajado();

  // Limpiar resultados mientras baraja
  resultadosDiv.innerHTML = '';
  btnCopiar.style.display = 'none';
  if (btnCopiarTodo) btnCopiarTodo.style.display = 'none';
  if (btnCompartir) btnCompartir.style.display = 'none';
  if (btnCompartirTodo) btnCompartirTodo.style.display = 'none';
  btnAnalisis.style.display = 'none';
  if (btnGuardar) btnGuardar.style.display = 'none';

  textoGlobalCopia = t('copiar.preguntaRealizada') + '\n';
  textoGlobalCopia += pregunta !== '' ? pregunta : t('copiar.sinPregunta');
  textoGlobalCopia += '\n\n';

  // El cálculo se ejecuta en paralelo mientras la animación se muestra
  setTimeout(() => {
    let html = '';
    const cantidadCartas = tipoTiradaTarot === 'una' ? 1 : (tipoTiradaTarot === 'tres' ? 3 : 10);
    const nombreTirada = tipoTiradaTarot === 'una' ? t('tarot.nombreTirada1') : (tipoTiradaTarot === 'tres' ? t('tarot.nombreTirada3') : t('tarot.nombreTiradaCruz'));

    textoGlobalCopia += `${t("copiar.tiradaTarot", {tipo: nombreTirada})}\n`;
    html += `<div class="seccion" style="animation-delay:0s"><h2 class="seccion-titulo"><span class="icono-titulo">🔮</span>${t('tarot.seccionTarot', {tipo: nombreTirada})}</h2>`;

    const cartasTiradas = [];
    const mazoTemporal = [...barajaTarot];
    for (let i = 0; i < cantidadCartas; i++) {
      const indice = Math.floor(Math.random() * mazoTemporal.length);
      const cartaNombre = mazoTemporal.splice(indice, 1)[0];
      const alReves = Math.random() < 0.5;
      const posicion = tipoTiradaTarot === 'una' ? t('tarot.tuCarta') : (tipoTiradaTarot === 'tres' ? tPosicion(['pasado','presente','futuro'][i]) : tPosicion('pos' + (i + 1)));
      const orientacion = alReves ? t('tarot.invertida') : t('tarot.derecho');
      cartasTiradas.push({ nombre: cartaNombre, alReves, posicion, orientacion, num: i + 1 });
      textoGlobalCopia += `- ${posicion}: ${tCarta(cartaNombre)} ${orientacion}\n`;
    }

    // Render según tipo
    if (tipoTiradaTarot === 'cruz') {
      html += renderCruzCelta(cartasTiradas);
    } else {
      html += renderCartasSimples(cartasTiradas);
    }
    html += `</div>`;

    // === I CHING ===
    textoGlobalCopia += `\n${t('copiar.tiradaIching')}\n`;
    html += `<div class="seccion" style="animation-delay:0.2s"><h2 class="seccion-titulo"><span class="icono-titulo">☯️</span>${t('tarot.seccionIching')}</h2><div class="iching-contenedor">`;

    let lineasValor = [];
    for (let i = 0; i < 6; i++) {
      let m1 = Math.random() < 0.5 ? 2 : 3;
      let m2 = Math.random() < 0.5 ? 2 : 3;
      let m3 = Math.random() < 0.5 ? 2 : 3;
      lineasValor.push(m1 + m2 + m3);
    }

    let codPrincipal = '', codFuturo = '';
    let hayMutacion = false;
    let lineasMutantes = [];
    lineasValor.forEach((valor, idx) => {
      if (valor === 7) { codPrincipal += '1'; codFuturo += '1'; }
      else if (valor === 8) { codPrincipal += '0'; codFuturo += '0'; }
      else if (valor === 9) { codPrincipal += '1'; codFuturo += '0'; hayMutacion = true; lineasMutantes.push(idx + 1); }
      else if (valor === 6) { codPrincipal += '0'; codFuturo += '1'; hayMutacion = true; lineasMutantes.push(idx + 1); }
    });

    const numPrincipal = codigoANumero(codPrincipal);
    const hexPrincipal = tHexagrama(numPrincipal)?.nombre || dictHexagramas[codPrincipal];
    const kbHexPrincipal = KB_ICHING[String(numPrincipal)];
    const kbHexPrincipalT = tHexagrama(numPrincipal);
    textoGlobalCopia += `${t("copiar.hexPrincipal")} ${hexPrincipal}\n`;
    html += `<div class="hexagrama-caja" onclick="window.__tarotUI.abrirModalIching(${numPrincipal})">
                <h4 class="hexagrama-titulo">${t('tarot.hexPrincipal')}</h4>
                ${generarHexagramaPorNum(numPrincipal, 70)}
                <div class="hexagrama-nombre">${hexPrincipal}</div>
                ${kbHexPrincipalT ? `<div class="hexagrama-trigramas">${kbHexPrincipalT.trigInf} ↑ ${kbHexPrincipalT.trigSup}</div>` : ''}
                ${dibujarHexagramaVisual(lineasValor, true)}
             </div>`;

    let ichingData = { principal: hexPrincipal, numPrincipal, codPrincipal, hayMutacion, lineasMutantes, lineasValor };

    if (hayMutacion) {
      const numFuturo = codigoANumero(codFuturo);
      const hexFuturo = tHexagrama(numFuturo)?.nombre || dictHexagramas[codFuturo];
      const kbHexFuturoT = tHexagrama(numFuturo);
      textoGlobalCopia += `${t("copiar.hexFuturo")} ${hexFuturo}\n`;
      textoGlobalCopia += `${t("copiar.lineasMutantes")} ${lineasMutantes.join(', ')}\n`;
      let lineasFuturo = lineasValor.map(v => { if (v === 9) return 8; if (v === 6) return 7; return v; });
      html += `<div class="hexagrama-caja" onclick="window.__tarotUI.abrirModalIching(${numFuturo})">
                  <h4 class="hexagrama-titulo">${t('tarot.hexFuturo')}</h4>
                  ${generarHexagramaPorNum(numFuturo, 70)}
                  <div class="hexagrama-nombre">${hexFuturo}</div>
                  ${kbHexFuturoT ? `<div class="hexagrama-trigramas">${kbHexFuturoT.trigInf} ↑ ${kbHexFuturoT.trigSup}</div>` : ''}
                  ${dibujarHexagramaVisual(lineasFuturo, false)}
               </div>`;
      ichingData.futuro = hexFuturo;
      ichingData.numFuturo = numFuturo;
      ichingData.codFuturo = codFuturo;
    } else {
      textoGlobalCopia += `${t("copiar.sinMutantes")}\n`;
    }
    html += `</div></div>`;

    ultimaTirada = { tipo: tipoTiradaTarot, pregunta, cartas: cartasTiradas, iching: ichingData };

    resultadosDiv.innerHTML = html;
    btnCopiar.style.display = 'block';
    if (btnCompartir) btnCompartir.style.display = 'block';
    btnAnalisis.style.display = 'block';
    if (btnGuardar) btnGuardar.style.display = 'block';
    // Mostrar botón de análisis combinado si también hay carta astral
    actualizarBotonCombinado();
    // En la Cruz Celta, enfocar el visual (#cc-visual) para que la tirada
    // quepa entera en pantalla. En el resto, el contenedor de resultados.
    setTimeout(() => {
      const visual = document.getElementById('cc-visual');
      const target = visual || resultadosDiv;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
  }, 1500);
}

// Mostrar/ocultar botón de análisis combinado según si hay tirada y carta astral
function actualizarBotonCombinado() {
  const btnCombinado = document.getElementById('btn-analisis-combinado');
  if (!btnCombinado) return;
  // Importar getUltimaCarta dinámicamente para evitar dependencia circular
  import('../core/astrologia.js?v=18').then(mod => {
    const carta = mod.getUltimaCarta();
    if (ultimaTirada && carta) {
      btnCombinado.style.display = 'block';
    } else {
      btnCombinado.style.display = 'none';
    }
  }).catch(() => { btnCombinado.style.display = 'none'; });
}

// === ANIMACIÓN DE BARAJADO ===
function mostrarAnimacionBarajado() {
  const overlay = document.createElement('div');
  overlay.className = 'shuffle-overlay';
  overlay.id = 'shuffle-overlay';

  // 8 cartas que se barajan con riffle
  let cardsHtml = '<div class="shuffle-deck">';
  for (let i = 0; i < 8; i++) {
    cardsHtml += '<div class="shuffle-card"></div>';
  }
  cardsHtml += '</div>';

  // Partículas místicas
  let particlesHtml = '<div class="shuffle-particles">';
  for (let i = 0; i < 12; i++) {
    const left = Math.random() * 100;
    const delay = (Math.random() * 2.5).toFixed(2);
    const dur = (2.5 + Math.random() * 1.5).toFixed(1);
    particlesHtml += `<div class="shuffle-particle" style="left:${left}%;bottom:40%;animation-delay:${delay}s;animation-duration:${dur}s;"></div>`;
  }
  particlesHtml += '</div>';

  overlay.innerHTML = particlesHtml + cardsHtml + '<div class="shuffle-text">' + t('tarot.barajando') + '</div>';
  document.body.appendChild(overlay);

  // Fade out — las cartas aparecen escalonadas después
  setTimeout(() => {
    overlay.classList.add('hide');
    setTimeout(() => overlay.remove(), 500);
  }, 2200);
}

// === RENDER CARTAS SIMPLES (1 y 3 cartas) ===
function renderCartasSimples(cartasTiradas) {
  let html = '';
  // Contenedor flex para 3 cartas
  const esTres = cartasTiradas.length === 3;
  if (esTres) {
    html += `<div class="tirada-tres">`;
  }
  cartasTiradas.forEach(c => {
    const invClass = c.alReves ? 'invertida' : '';
    const escaped = c.nombre.replace(/'/g, "\\'");
    const kbEntry = KB[c.nombre];
    const kbT = tKB(c.nombre);
    const nombreT = tCarta(c.nombre);
    const tipoLabel = kbEntry ? (kbEntry.tipo === 'mayor' ? t('tarot.arcanoMayor') : t('tarot.arcanoMenor')) : '';
    const tipoClass = kbEntry && kbEntry.tipo === 'mayor' ? '' : 'arcano-menor';
    const paloT = kbT && kbT.palo ? ' · ' + kbT.palo.charAt(0).toUpperCase() + kbT.palo.slice(1) : '';
    const delay = (c.num * 0.15).toFixed(2);
    html += `\n      <div class="carta" style="animation-delay:${delay}s" onclick="window.__tarotUI.abrirModal('${escaped}',${c.alReves},'${c.posicion}')">\n        <img src="${getImgUrl(c.nombre)}" alt="${nombreT}" class="carta-img ${invClass}" loading="lazy" onerror="this.onerror=null;this.src=this.src.replace('.webp','.svg')">\n        <div>\n          <div class="posicion-label">${c.posicion}</div>\n          <div class="carta-nombre ${c.alReves ? 'reves' : 'derecho'}">${nombreT} ${c.orientacion}</div>\n          ${tipoLabel ? `<div class="carta-tipo ${tipoClass}">${tipoLabel}${paloT}</div>` : ''}\n        </div>\n      </div>`;
  });
  if (esTres) {
    html += `</div>`;
  }
  return html;
}

// === RENDER CRUZ CELTA — LAYOUT COMPLETO RESPONSIVE ===
function renderCruzCelta(cartasTiradas) {
  let html = '';

  // Contenedor principal: Cruz (izquierda) + Bastón (derecha) — PRIMERO el visual
  html += `<div class="cc-main-layout" id="cc-visual">`;

  // 1. Cruz central: Grid 3x4
  html += `<div class="cruz-celta-grid">`;
  const getCard = (num) => cartasTiradas.find(c => c.num === num);

  html += renderCcCard(getCard(5), 'cc-area-corona');
  html += `<div class="cc-empty"></div>`;
  html += `<div class="cc-empty"></div>`;
  html += renderCcCard(getCard(4), 'cc-area-pasado');
  html += renderCcCard(getCard(1), 'cc-area-presente');
  html += renderCcCard(getCard(6), 'cc-area-futuro');
  html += `<div class="cc-empty"></div>`;
  html += renderCcCard(getCard(2), 'cc-area-desafio');
  html += `<div class="cc-empty"></div>`;
  html += `<div class="cc-empty"></div>`;
  html += renderCcCard(getCard(3), 'cc-area-base');
  html += `<div class="cc-empty"></div>`;
  html += `</div>`;

  // 2. Bastón: 4 cartas en columna (10 arriba → 7 abajo)
  html += `<div class="cc-baston">`;
  html += `<div class="cc-baston-label">${t('tarot.baston')}</div>`;
  for (const num of [10, 9, 8, 7]) {
    html += renderCcCard(getCard(num), 'cc-baston-item');
  }
  html += `</div>`;

  html += `</div>`; // Cierre de .cc-main-layout

  // Leyenda descriptiva DEBAJO del visual
  html += `<div class="cc-legend">`;
  cartasTiradas.forEach(c => {
    const escaped = c.nombre.replace(/'/g, "\\'");
    html += `<div onclick="window.__tarotUI.abrirModal('${escaped}',${c.alReves},'${c.posicion}')"><span class="posicion-label">${c.posicion}:</span> <span class="${c.alReves ? 'reves' : 'derecho'}">${tCarta(c.nombre)} ${c.orientacion}</span></div>`;
  });
  html += `</div>`;

  return html;
}

function renderCcCard(c, areaClass) {
  if (!c) return `<div class="${areaClass} cc-empty"></div>`;
  const invClass = c.alReves ? 'invertida' : '';
  const escaped = c.nombre.replace(/'/g, "\\'");
  const delay = (c.num * 0.10).toFixed(2);
  // La carta 2 (Desafío) lleva un borde dorado para distinguirla
  const desafioClass = c.num === 2 ? 'debajo' : '';
  return `<div class="cc-card-wrap ${areaClass}" style="animation-delay:${delay}s">
    <div class="cc-card-label">${c.posicion}</div>
    <img src="${getImgUrl(c.nombre)}" alt="${c.nombre}" class="cc-carta ${desafioClass} ${invClass}" loading="lazy" onerror="this.onerror=null;this.src=this.src.replace('.webp','.svg')" onclick="window.__tarotUI.abrirModal('${escaped}',${c.alReves},'${c.posicion}')">
  </div>`;
}

function dibujarHexagramaVisual(valores, mostrarMutantes) {
  let htmlHex = `<div style="display:inline-block; margin-top:8px;">`;
  for (let i = 5; i >= 0; i--) {
    let valor = valores[i];
    let esYang = (valor === 7 || valor === 9);
    let esMutante = mostrarMutantes && (valor === 6 || valor === 9);
    let marca = esMutante ? `<span class="mutante-indicador">●</span>` : ``;
    if (esYang) {
      htmlHex += `<div class="linea"><div class="yang"></div>${marca}</div>`;
    } else {
      htmlHex += `<div class="linea"><div class="yin"><div class="yin-parte"></div><div class="yin-parte"></div></div>${marca}</div>`;
    }
  }
  htmlHex += `</div>`;
  return htmlHex;
}

// === MOSTRAR ANÁLISIS ===
export async function mostrarAnalisis() {
  if (!ultimaTirada) return;
  const cont = document.createElement('div');
  cont.className = 'analisis-contenedor';
  cont.id = 'analisis-output';

  // Spinner mientras la IA procesa
  cont.innerHTML = '<div class="ia-spinner"><div class="ia-spinner-icon">✨</div><p>' + t('ia.generando') + '</p></div>';
  const btnCopiar = document.getElementById('btn-copiar');
  btnCopiar.parentNode.insertBefore(cont, btnCopiar);
  document.getElementById('btn-analisis').style.display = 'none';

  // Texto de la tirada sin el analisis local (solo datos para la IA)
  let textoParaIA = t('copiar.preguntaRealizada') + '\n';
  textoParaIA += ultimaTirada.pregunta || t('copiar.sinPregunta');
  textoParaIA += '\n\n' + t('copiar.tiradaTarot', {tipo: ultimaTirada.tipo === 'una' ? t('tarot.nombreTirada1') : (ultimaTirada.tipo === 'tres' ? t('tarot.nombreTirada3') : t('tarot.nombreTiradaCruz'))});
  ultimaTirada.cartas.forEach(c => {
    textoParaIA += '- ' + c.posicion + ': ' + tCarta(c.nombre) + ' ' + c.orientacion + '\n';
  });
  if (ultimaTirada.iching && ultimaTirada.iching.principal) {
    textoParaIA += '\n' + t('copiar.tiradaIching') + '\n';
    textoParaIA += t('copiar.hexPrincipal') + ' ' + ultimaTirada.iching.principal + '\n';
    if (ultimaTirada.iching.futuro) textoParaIA += t('copiar.hexFuturo') + ' ' + ultimaTirada.iching.futuro + '\n';
    if (ultimaTirada.iching.lineasMutantes) textoParaIA += t('copiar.lineasMutantes') + ' ' + ultimaTirada.iching.lineasMutantes.join(', ') + '\n';
  }

  try {
    const htmlIA = await analisisTarotIA(textoParaIA);
    cont.innerHTML = '<div class="analisis-origen ia-origen">' + t('ia.origenIA') + '</div>' + htmlIA;
    // Actualizar texto de copia con el analisis IA
    const txtPlano = cont.innerText.replace('' + t('ia.origenIA') + '', '').trim();
    textoGlobalCopia += '\n\n=== ANÁLISIS HOLÍSTICO TAROT + I CHING (IA) ===\n' + txtPlano;
    // Snackbar de donacion (no intrusivo, max 1 vez cada 10 dias)
    mostrarDonacionSiToca(cont);
  } catch (err) {
    console.warn('[IA] Fallback a analisis local:', err.message);
    // Fallback al algoritmo local
    cont.innerHTML = '<div class="analisis-origen local-origen">' + t('ia.origenLocal') + '</div>' + generarAnalisis(ultimaTirada);
    const txtAnalisis = extraerTextoAnalisis(ultimaTirada);
    textoGlobalCopia += '\n\n=== ANÁLISIS HOLÍSTICO TAROT + I CHING ===\n' + txtAnalisis;
  }

  const btnCopiarTodo = document.getElementById('btn-copiar-todo');
  if (btnCopiarTodo) btnCopiarTodo.style.display = 'block';
  const btnCompartirTodo = document.getElementById('btn-compartir-todo');
  if (btnCompartirTodo) btnCompartirTodo.style.display = 'block';
  setTimeout(() => cont.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

// === COPIAR RESULTADOS ===
export async function copiarResultados(incluirAnalisis) {
  let textoAEnviar = textoGlobalCopia;
  if (incluirAnalisis === false) {
    const idx = textoAEnviar.indexOf('\n\n=== ANÁLISIS');
    if (idx !== -1) textoAEnviar = textoAEnviar.substring(0, idx).trim();
  }
  // 1. Puente nativo Android (JavascriptInterface)
  try {
    if (window.AndroidClipboard && typeof window.AndroidClipboard.copy === 'function') {
      window.AndroidClipboard.copy(textoAEnviar);
      mostrarExitoCopia(incluirAnalisis);
      return;
    }
  } catch (e) {
    console.warn('AndroidClipboard no disponible');
  }
  // 2. Fallback: navigator.clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textoAEnviar).then(() => mostrarExitoCopia(incluirAnalisis)).catch(() => copiarFallback(textoAEnviar, incluirAnalisis));
  } else { copiarFallback(textoAEnviar, incluirAnalisis); }
}

// === COMPARTIR RESULTADOS ===
let _compartiendo = false;
export async function compartirResultados(incluirAnalisis) {
  if (_compartiendo) return; // Evita lanzar varios choosers apilados
  let textoAEnviar = textoGlobalCopia;
  if (incluirAnalisis === false) {
    const idx = textoAEnviar.indexOf('\n\n=== ANÁLISIS');
    if (idx !== -1) textoAEnviar = textoAEnviar.substring(0, idx).trim();
  }
  _compartiendo = true;
  setTimeout(() => { _compartiendo = false; }, 1500);
  // 1. Puente nativo Android (Intent.ACTION_SEND) — abre WhatsApp, email, etc.
  try {
    if (window.AndroidShare && typeof window.AndroidShare.share === 'function') {
      window.AndroidShare.share(textoAEnviar);
      return;
    }
  } catch (e) {
    console.warn('AndroidShare no disponible:', e);
  }
  // 2. Fallback: Web Share API
  if (navigator.share) {
    try { await navigator.share({ text: textoAEnviar }); } catch (e) { console.warn('share cancelado:', e); }
    return;
  }
  // 3. Último recurso: copiar al portapapeles y avisar
  copiarResultados(incluirAnalisis);
}

function copiarFallback(textoAEnviar, incluirAnalisis) {
  try {
    const ta = document.createElement('textarea');
    ta.value = textoAEnviar;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    mostrarExitoCopia(incluirAnalisis);
  } catch (err) { alert('Error al copiar: ' + err); }
}

function mostrarExitoCopia(incluirAnalisis) {
  const btnSolo = document.getElementById('btn-copiar');
  const btnTodo = document.getElementById('btn-copiar-todo');
  const targetBtn = (incluirAnalisis === false) ? btnSolo : (btnTodo && btnTodo.style.display !== 'none' ? btnTodo : btnSolo);
  const oldTxt = targetBtn.innerText;
  targetBtn.innerText = '' + t('main.copiadoExito') + '';
  setTimeout(() => targetBtn.innerText = oldTxt, 2000);
}
