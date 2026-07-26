// ui/donacion.js — Snackbar de donacion post-analisis + modal Acerca de / Apoyar
// Modelo: Free Tier con donaciones pasivas via Ko-fi.
// Frecuencia: maximo 1 snackbar cada 10 dias por usuario (localStorage).
// No intrusivo: respeta "No, gracias" y nunca se muestra al primer arranque.
// Toda la UI se construye con t() para soportar los 6 idiomas (es/en/pt/fr/de/it).

import { t } from '../i18n/i18n.js?v=17';

const KOFI_URL = 'https://ko-fi.com/diegovill';
const STORAGE_KEY = 'oraculo_donacion_ultima_vez';
const DIAS_ESPERA = 10; // frecuencia del snackbar (en dias)

// === Snackbar post-analisis ===
// Llamar SOLO tras un analisis IA exitoso. Si toca mostrar (se cumplio la
// ventana de 10 dias), inyecta un snackbar no bloqueante en el cont.
export function mostrarDonacionSiToca(contenedor) {
  try {
    const ultima = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    const ahora = Date.now();
    const limite = ultima + DIAS_ESPERA * 24 * 60 * 60 * 1000;
    if (ahora < limite) return; // aun no toca
    if (!contenedor || !contenedor.parentElement) return;
    if (document.getElementById('donacion-snackbar')) return; // ya visible
  } catch (e) {
    return; // si localStorage falla, no molestar
  }

  const snackbar = document.createElement('div');
  snackbar.id = 'donacion-snackbar';
  snackbar.className = 'donacion-snackbar';
  snackbar.innerHTML = `
    <div class="donacion-texto">${t('donacion.snackbarTexto')}</div>
    <div class="donacion-acciones">
      <a href="${KOFI_URL}" target="_blank" rel="noopener" class="donacion-btn-cafe">${t('donacion.snackbarBtn')}</a>
      <button type="button" class="donacion-btn-no">${t('donacion.snackbarNo')}</button>
    </div>
  `;
  contenedor.parentElement.appendChild(snackbar);

  // Registrar la vez que se muestra (no cuando clican, sino cuando se muestra,
  // para no spamear si el usuario ignora el snackbar).
  try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (e) {}

  snackbar.querySelector('.donacion-btn-cafe').addEventListener('click', () => {
    setTimeout(() => snackbar.remove(), 400);
  });
  snackbar.querySelector('.donacion-btn-no').addEventListener('click', () => {
    snackbar.remove();
  });

  // Auto-ocultar tras 25s si no se interactua
  setTimeout(() => { if (snackbar.parentElement) snackbar.remove(); }, 25000);
}

// === Modal Acerca de / Apoyar (entrada permanente en header) ===
export function abrirAcercaDe() {
  if (document.getElementById('modal-acerca-de')) return;
  const modal = document.createElement('div');
  modal.id = 'modal-acerca-de';
  modal.className = 'modal-overlay visible';
  modal.innerHTML = `
    <div class="modal-card acerca-de-card">
      <button class="acerca-cerrar" aria-label="Cerrar">✕</button>
      <div class="acerca-cuerpo">
        <h2>${t('donacion.modalTitulo')}</h2>
        <p class="acerca-linea">${t('donacion.modalLinea')}</p>
        <p class="acerca-texto">${t('donacion.modalP1')}</p>
        <p class="acerca-texto">${t('donacion.modalP2')}</p>
        <a href="${KOFI_URL}" target="_blank" rel="noopener" class="acerca-btn-cafe">${t('donacion.modalBtn')}</a>
        <p class="acerca-mini">${KOFI_URL}</p>
        <p class="acerca-texto acerca-gracias">${t('donacion.modalGracias')}</p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('.acerca-cerrar').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// === Actualizar el texto del footer con el idioma actual ===
// Llama a esta funcion tras initI18n() y tras cambiarIdioma().
export function actualizarFooterDonacion() {
  const foot = document.querySelector('footer');
  if (!foot) return;
  const enlace = t('donacion.footerEnlace');
  const texto = t('donacion.footer', { enlace: `<a href="#" class="donacion-link">${enlace}</a>` });
  foot.innerHTML = texto;
}

// Exponer para botones inline del HTML (header/footer).
window.__donacion = window.__donacion || {};
window.__donacion.abrirAcercaDe = abrirAcercaDe;