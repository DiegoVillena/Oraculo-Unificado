// js/ui/onboarding.js — Tutorial de inicio (Walkthrough / Onboarding)
// Se muestra solo la primera vez que el usuario abre la app.
// Persistencia: localStorage clave "oraculo_onboarding_visto".

import { t } from '../i18n/i18n.js?v=72';

const ONBOARDING_KEY = 'oraculo_onboarding_visto_v2';

// === PASOS DEL CARRUSEL (claves i18n) ===
const PASOS_KEYS = [
  { iconoKey: 'onboarding.paso1_icono', tituloKey: 'onboarding.paso1_titulo', textoKey: 'onboarding.paso1_texto' },
  { iconoKey: 'onboarding.paso2_icono', tituloKey: 'onboarding.paso2_titulo', textoKey: 'onboarding.paso2_texto' },
  { iconoKey: 'onboarding.paso3_icono', tituloKey: 'onboarding.paso3_titulo', textoKey: 'onboarding.paso3_texto' },
  { iconoKey: 'onboarding.paso4_icono', tituloKey: 'onboarding.paso4_titulo', textoKey: 'onboarding.paso4_texto' },
  { iconoKey: 'onboarding.paso5_icono', tituloKey: 'onboarding.paso5_titulo', textoKey: 'onboarding.paso5_texto' },
  { iconoKey: 'onboarding.paso6_icono', tituloKey: 'onboarding.paso6_titulo', textoKey: 'onboarding.paso6_texto' },
];

// === ESTADO ===
let pasoActual = 0;

// === INICIALIZACIÓN ===
export function initOnboarding() {
  // Verificar si ya vio el onboarding
  try {
    if (localStorage.getItem(ONBOARDING_KEY) === 'true') return false;
  } catch (e) { return false; }

  // Mostrar onboarding
  mostrarOnboarding();
  return true;
}

function mostrarOnboarding() {
  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';
  overlay.id = 'onboarding-overlay';

  // === ESTRUCTURA HTML ===
  let html = '<div class="onboarding-container">';

  // Botón Saltar (esquina superior derecha) + selector idioma
  html += '<button class="onboarding-skip" id="onboarding-skip">' + t('onboarding.saltar') + '</button>';
  html += '<button id="btn-onboarding-idioma" class="onboarding-idioma" onclick="window.__app && document.getElementById(\'btn-idioma\') && document.getElementById(\'btn-idioma\').click()">🌐</button>';

  // Carrusel
  html += '<div class="onboarding-slider" id="onboarding-slider">';
  PASOS_KEYS.forEach((paso, i) => {
    html += `<div class="onboarding-slide ${i === 0 ? 'active' : ''}" data-step="${i}">`;
    html += `<div class="onboarding-icon">${t(paso.iconoKey)}</div>`;
    html += `<h3 class="onboarding-titulo">${t(paso.tituloKey)}</h3>`;
    html += `<p class="onboarding-texto">${t(paso.textoKey)}</p>`;
    html += '</div>';
  });
  html += '</div>'; // fin slider

  // Indicadores (puntitos)
  html += '<div class="onboarding-dots">';
  PASOS_KEYS.forEach((_, i) => {
    html += `<span class="onboarding-dot ${i === 0 ? 'active' : ''}" data-step="${i}"></span>`;
  });
  html += '</div>';

  // Botón Comenzar (solo visible en último paso)
  html += '<button class="onboarding-start" id="onboarding-start" style="display:none;">' + t('onboarding.comenzar') + '</button>';

  // Botón Siguiente (visible en pasos intermedios)
  html += '<button class="onboarding-next" id="onboarding-next">' + t('onboarding.siguiente') + '</button>';

  html += '</div>'; // fin container

  overlay.innerHTML = html;
  document.body.appendChild(overlay);

  // === EVENTOS ===
  const slider = overlay.querySelector('#onboarding-slider');
  const dots = overlay.querySelectorAll('.onboarding-dot');
  const btnSkip = overlay.querySelector('#onboarding-skip');
  const btnNext = overlay.querySelector('#onboarding-next');
  const btnStart = overlay.querySelector('#onboarding-start');

  function irAPaso(n) {
    pasoActual = Math.max(0, Math.min(n, PASOS_KEYS.length - 1));

    // Mover slider
    slider.style.transform = `translateX(-${pasoActual * 100}%)`;

    // Actualizar slides activos
    overlay.querySelectorAll('.onboarding-slide').forEach((s, i) => {
      s.classList.toggle('active', i === pasoActual);
    });

    // Actualizar dots
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === pasoActual);
    });

    // Mostrar/ocultar botones según el paso
    const esUltimo = pasoActual === PASOS_KEYS.length - 1;
    btnNext.style.display = esUltimo ? 'none' : 'block';
    btnStart.style.display = esUltimo ? 'block' : 'none';
  }

  btnNext.addEventListener('click', () => irAPaso(pasoActual + 1));
  btnSkip.addEventListener('click', cerrarOnboarding);
  btnStart.addEventListener('click', cerrarOnboarding);

  // Click en dots para navegar directamente
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const step = parseInt(dot.dataset.step);
      irAPaso(step);
    });
  });

  // Swipe horizontal (touch)
  let touchStartX = 0;
  let touchEndX = 0;
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && pasoActual < PASOS_KEYS.length - 1) irAPaso(pasoActual + 1);
      else if (diff < 0 && pasoActual > 0) irAPaso(pasoActual - 1);
    }
  }, { passive: true });

  // Fade-in inicial
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
  });
}

function cerrarOnboarding() {
  // Guardar en localStorage
  try { localStorage.setItem(ONBOARDING_KEY, 'true'); } catch (e) {}

  // Fade-out
  const overlay = document.getElementById('onboarding-overlay');
  if (overlay) {
    overlay.classList.remove('visible');
    overlay.classList.add('hide');
    setTimeout(() => overlay.remove(), 500);
  }
}