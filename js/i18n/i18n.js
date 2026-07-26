// js/i18n/i18n.js — Motor de internacionalización (sin dependencias externas)
// Detecta el idioma del dispositivo, carga el locale JSON y expone t().
// Idiomas soportados: es (por defecto), en, pt, fr, de, it.
// Persistencia: localStorage "oraculo_idioma".

const IDIOMAS_SOPORTADOS = ['es', 'en', 'pt', 'fr', 'de', 'it'];
const IDIOMA_DEFECTO = 'es';
const STORAGE_KEY = 'oraculo_idioma';

let _localeActual = IDIOMA_DEFECTO;
let _traducciones = {};
let _datosMaestros = {};
let _cargado = false;

// === DETECCIÓN AUTOMÁTICA ===
function detectarIdioma() {
  // 1. Verificar preferencia guardada
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado && IDIOMAS_SOPORTADOS.includes(guardado)) return guardado;
  } catch (e) {}

  // 2. Detectar idioma del dispositivo
  const navLang = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
  const codigo2 = navLang.split('-')[0];

  // 3. Si el idioma del dispositivo es soportado, usarlo
  if (IDIOMAS_SOPORTADOS.includes(codigo2)) return codigo2;

  // 4. Fallback: inglés (si no es español el dispositivo)
  return 'en';
}

// === CARGA DE TRADUCCIONES ===
async function cargarTraducciones(locale) {
  try {
    const url = new URL(`js/i18n/locales/${locale}.json`, window.location.href).href;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`No se pudo cargar ${locale}.json`);
    return await resp.json();
  } catch (err) {
    console.warn(`i18n: error cargando ${locale}.json:`, err.message);
    if (locale !== IDIOMA_DEFECTO) {
      return await cargarTraducciones(IDIOMA_DEFECTO);
    }
    return {};
  }
}

// === CARGA DE DATOS MAESTROS (cartas, KB, hexagramas, signos) ===
async function cargarDatosMaestros(locale) {
  try {
    const url = new URL(`js/i18n/locales/datos-maestros-${locale}.json`, window.location.href).href;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`No se pudo cargar datos-maestros-${locale}.json`);
    return await resp.json();
  } catch (err) {
    console.warn(`i18n: error cargando datos-maestros-${locale}.json:`, err.message);
    if (locale !== IDIOMA_DEFECTO) {
      return await cargarDatosMaestros(IDIOMA_DEFECTO);
    }
    return {};
  }
}

// === INICIALIZACIÓN ===
export async function initI18n() {
  _localeActual = detectarIdioma();
  _traducciones = await cargarTraducciones(_localeActual);
  _datosMaestros = await cargarDatosMaestros(_localeActual);
  _cargado = true;
  aplicarTraduccionesDOM();
  console.log(`✦ i18n inicializado: ${_localeActual}`);
  return _localeActual;
}

// === FUNCIÓN t() — traducir clave ===
export function t(clave, vars) {
  if (!_cargado) return clave;

  // Buscar la clave en las traducciones (soporta puntos: "app.titulo")
  let valor = _traducciones;
  const partes = clave.split('.');
  for (const p of partes) {
    if (valor && typeof valor === 'object' && p in valor) {
      valor = valor[p];
    } else {
      return clave; // clave no encontrada → devolver la clave literal
    }
  }

  if (typeof valor !== 'string') return valor; // devolver objetos/arrays para claves compuestas

  // Interpolación de variables: {nombre}, {n}, etc.
  if (vars) {
    return valor.replace(/\{(\w+)\}/g, (match, key) => {
      return key in vars ? String(vars[key]) : match;
    });
  }

  return valor;
}

// === CAMBIAR IDIOMA EN CALIENTE ===
export async function cambiarIdioma(nuevoLocale) {
  if (!IDIOMAS_SOPORTADOS.includes(nuevoLocale)) return;
  _localeActual = nuevoLocale;
  _traducciones = await cargarTraducciones(nuevoLocale);
  _datosMaestros = await cargarDatosMaestros(nuevoLocale);

  try { localStorage.setItem(STORAGE_KEY, nuevoLocale); } catch (e) {}
  aplicarTraduccionesDOM();
  window.dispatchEvent(new CustomEvent('idioma-cambiado', { detail: { locale: nuevoLocale } }));
  console.log(`✦ i18n cambiado a: ${nuevoLocale}`);
}

// === OBTENER IDIOMA ACTUAL ===
export function getIdioma() { return _localeActual; }
export function getIdiomasSoportados() { return IDIOMAS_SOPORTADOS; }

// === FUNCIONES HELPER PARA DATOS MAESTROS ===

// Traducir nombre de carta (clave=nombre español, valor=traducido)
export function tCarta(nombreES) {
  if (!_datosMaestros.tarot || !_datosMaestros.tarot.cartas) return nombreES;
  return _datosMaestros.tarot.cartas[nombreES] || nombreES;
}

// Traducir KB de carta (devuelve objeto con kw, sig, revesKw, revesSig, arquetipo, palo, elemento)
export function tKB(nombreCarta) {
  if (!_datosMaestros.tarot || !_datosMaestros.tarot.kb) return null;
  return _datosMaestros.tarot.kb[nombreCarta] || null;
}

// Traducir hexagrama (devuelve objeto con nombre, kw, sig, consejo, trigInf, trigSup, elemento)
export function tHexagrama(num) {
  if (!_datosMaestros.iching || !_datosMaestros.iching.hexagramas) return null;
  return _datosMaestros.iching.hexagramas[String(num)] || null;
}

// Traducir signo zodiacal (devuelve objeto con nombre, elemento, modalidad, regente)
export function tSigno(idx) {
  if (!_datosMaestros.astrologia || !_datosMaestros.astrologia.signos) return null;
  return _datosMaestros.astrologia.signos[String(idx)] || null;
}

// Traducir tipo de aspecto (ej: 'Conjunction' → 'Conjunción')
export function tAspecto(tipoEN) {
  if (!_datosMaestros.astrologia || !_datosMaestros.astrologia.aspectos) return tipoEN;
  return _datosMaestros.astrologia.aspectos[tipoEN] || tipoEN;
}

// Traducir posición de tirada (ej: 'pos1' → '1. Presente')
export function tPosicion(clave) {
  if (!_datosMaestros.tarot || !_datosMaestros.tarot.posiciones) return clave;
  return _datosMaestros.tarot.posiciones[clave] || clave;
}

// Traducir nombre de país (ej: 'España' → 'Spain' si idioma=en)
export function tPais(nombreES) {
  if (!_traducciones || !_traducciones.paises) return nombreES;
  return _traducciones.paises[nombreES] || nombreES;
}

// === DATOS DE ANÁLISIS (motores de análisis local) ===

// Obtener datos del análisis astral (diccionarios SQ, PA, CT, narrativa, etc.)
export function getAnalisisAstral() {
  return _datosMaestros.analisisAstral || null;
}

// Obtener datos del análisis de Tarot (lexicon, descripciones, narrativa, etc.)
export function getAnalisisTarot() {
  return _datosMaestros.analisisTarot || null;
}

// === APLICAR AL DOM ===
function aplicarTraduccionesDOM() {
  // Elementos con data-i18n: el contenido se reemplaza por t(clave)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const clave = el.getAttribute('data-i18n');
    el.textContent = t(clave);
  });
  // Elementos con data-i18n-placeholder: el placeholder se reemplaza
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const clave = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(clave));
  });
  // Elementos con data-i18n-title: el title/tooltip se reemplaza
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const clave = el.getAttribute('data-i18n-title');
    el.setAttribute('title', t(clave));
  });
  // Elementos con data-i18n-html: innerHTML se reemplaza
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const clave = el.getAttribute('data-i18n-html');
    el.innerHTML = t(clave);
  });
}