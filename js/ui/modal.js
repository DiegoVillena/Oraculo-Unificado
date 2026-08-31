// ui/modal.js — Modal de zoom para cartas del Tarot e I Ching
import { KB } from '../data/tarot-kb.js?v=72';
import { KB_ICHING } from '../data/iching-kb.js?v=72';
import { getImgUrl } from '../data/tarot-data.js?v=72';
import { generarHexagramaPorNum } from '../data/iching-svg.js?v=72';
import { t, tKB, tHexagrama, tCarta } from '../i18n/i18n.js?v=72';

// === GESTIÓN DEL BOTÓN ATRÁS DE ANDROID ===
// En una WebView de Capacitor, el botón físico atrás cierra la app si el
// historial está en la raíz. Para que cierre el modal en su lugar, añadimos
// una entrada de historial al abrir el modal: el botón atrás consume esa
// entrada (dispara popstate) y cerramos el modal. Sin modal, dejamos que
// Capacitor salga de la app normalmente.
let modalAbierto = false;

function _cerrarVisual() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('visible');
  const img = document.getElementById('modal-img');
  if (img) { img.style.display = ''; img.style.width = ''; img.style.height = ''; img.style.objectFit = ''; }
  const svgContainer = document.getElementById('modal-svg-container');
  if (svgContainer) svgContainer.style.display = 'none';
  modalAbierto = false;
}

// popstate: se dispara al pulsar el botón atrás (Android backbutton, que en
// Capacitor 8 se intercepta en MainActivity.onBackPressed → webView.goBack(),
// lo que dispara popstate aquí) o el botón atrás del navegador. Si el modal
// está abierto, lo cerramos. El goBack ya consume la entrada de historial.
window.addEventListener('popstate', () => {
  if (modalAbierto) {
    _cerrarVisual();
  }
});

export function abrirModal(nombre, alReves, posicion) {
  const kb = KB[nombre];
  if (!kb) return;
  const img = document.getElementById('modal-img');
  img.src = getImgUrl(nombre);
  img.onerror = function() { this.onerror = null; this.src = this.src.replace('.webp', '.svg'); };
  img.className = alReves ? 'invertida' : '';
  img.alt = nombre;
  img.style.width = '';
  img.style.height = '';
  img.style.objectFit = '';
  img.style.display = '';
  const svgContainer = document.getElementById('modal-svg-container');
  if (svgContainer) svgContainer.style.display = 'none';
  document.getElementById('modal-posicion').textContent = posicion;
  document.getElementById('modal-nombre').textContent = tCarta(nombre);
  const ori = document.getElementById('modal-orientacion');
  if (alReves) { ori.textContent = t('modal.invertida'); ori.className = 'modal-orientacion reves'; }
  else { ori.textContent = t('modal.derecho'); ori.className = 'modal-orientacion derecho'; }
  const kbT = tKB(nombre);
  const data = alReves ? { kw: kbT?.revesKw || kb.reves.kw, sig: kbT?.revesSig || kb.reves.sig }
                       : { kw: kbT?.kw || kb.derecho.kw, sig: kbT?.sig || kb.derecho.sig };
  document.getElementById('modal-keywords').textContent = data.kw.join(' · ');
  document.getElementById('modal-significado').textContent = data.sig;
  const meta = document.getElementById('modal-meta');
  let metaHtml = '';
  metaHtml += `<span>${kb.tipo === 'mayor' ? t('modal.arcanoMayor') : t('modal.arcanoMenor')}</span>`;
  if (kb.palo) metaHtml += `<span>${kbT && kbT.palo ? kbT.palo.charAt(0).toUpperCase() + kbT.palo.slice(1) : kb.palo.charAt(0).toUpperCase() + kb.palo.slice(1)}</span>`;
  metaHtml += `<span>${t('modal.elemento')} ${kbT && kbT.elemento ? kbT.elemento : kb.elemento}</span>`;
  metaHtml += `<span>${kbT && kbT.arquetipo ? kbT.arquetipo : kb.arquetipo}</span>`;
  meta.innerHTML = metaHtml;
  document.getElementById('modal').classList.add('visible');
  modalAbierto = true;
  // Añadir entrada de historial: el botón atrás la consumirá (vía
  // MainActivity.onBackPressed → webView.goBack) y cerrará el modal.
  history.pushState({ modal: true }, '');
}

export function abrirModalIching(num) {
  const h = KB_ICHING[String(num)];
  if (!h) return;
  const img = document.getElementById('modal-img');
  // Reemplazar el <img> con un div conteniendo el SVG del hexagrama
  const svgHtml = generarHexagramaPorNum(num, 180);
  img.style.display = 'none';
  // Buscar o crear un contenedor SVG en el modal
  let svgContainer = document.getElementById('modal-svg-container');
  if (!svgContainer) {
    svgContainer = document.createElement('div');
    svgContainer.id = 'modal-svg-container';
    svgContainer.style.cssText = 'display:flex;justify-content:center;margin-bottom:12px;';
    img.parentNode.insertBefore(svgContainer, img);
  }
  svgContainer.innerHTML = svgHtml;
  svgContainer.style.display = 'flex';
  document.getElementById('modal-posicion').textContent = t('modal.ichingTitulo', {num: num});
  const hT = tHexagrama(num);
  document.getElementById('modal-nombre').textContent = hT?.nombre || h.nombre;
  const ori = document.getElementById('modal-orientacion');
  ori.textContent = (hT?.trigInf || h.trigInf) + ' ↑ ' + (hT?.trigSup || h.trigSup);
  ori.className = 'modal-orientacion derecho';
  document.getElementById('modal-keywords').textContent = (hT?.kw || h.kw).join(' · ');
  document.getElementById('modal-significado').textContent = (hT?.sig || h.sig) + t('modal.consejo') + (hT?.consejo || h.consejo);
  const meta = document.getElementById('modal-meta');
  meta.innerHTML = `<span>${t('modal.trigramaInf')} ${hT?.trigInf || h.trigInf}</span><span>${t('modal.trigramaSup')} ${hT?.trigSup || h.trigSup}</span><span>${t('modal.elemento')} ${hT?.elemento || h.elemento}</span>`;
  document.getElementById('modal').classList.add('visible');
  modalAbierto = true;
  history.pushState({ modal: true }, '');
}

export function cerrarModal(event) {
  if (event && event.target && event.target.id !== 'modal') return;
  const modal = document.getElementById('modal');
  if (!modal.classList.contains('visible')) return;
  // Cerrar visualmente y consumir la entrada de historial creada al abrir.
  modalAbierto = false;
  modal.classList.remove('visible');
  const img = document.getElementById('modal-img');
  if (img) { img.style.display = ''; img.style.width = ''; img.style.height = ''; img.style.objectFit = ''; }
  const svgContainer = document.getElementById('modal-svg-container');
  if (svgContainer) svgContainer.style.display = 'none';
  // history.back() dispara popstate; como modalAbierto ya es false, el handler
  // no volverá a cerrar. Así el historial queda limpio y el siguiente back físico
  // saldrá de la app (comportamiento esperado sin modal).
  if (history.state && history.state.modal) history.back();
}