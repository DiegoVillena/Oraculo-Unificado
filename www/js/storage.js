// storage.js — Persistencia con localStorage
// Compatible con WebViews de Android (Capacitor/Cordova)

const TIRADAS_KEY = 'tiradas_guardadas';
const CARTAS_KEY = 'cartas_astrales_guardadas';

// === TIRADAS ===
export function guardarTirada(tirada) {
  let lista = [];
  try { lista = JSON.parse(localStorage.getItem(TIRADAS_KEY) || '[]'); } catch (e) { lista = []; }
  const entrada = {
    fecha: new Date().toISOString(),
    tipo: tirada.tipo,
    pregunta: tirada.pregunta || '',
    resumen: tirada.cartas.map(c => c.posicion + ': ' + c.nombre + ' ' + c.orientacion).join(' | '),
    iching: tirada.iching ? tirada.iching.principal : '',
    datos: tirada
  };
  lista.unshift(entrada);
  try { localStorage.setItem(TIRADAS_KEY, JSON.stringify(lista)); } catch (e) { console.error('Error guardando tirada:', e); }
  return entrada;
}

export function obtenerTiradas() {
  try { return JSON.parse(localStorage.getItem(TIRADAS_KEY) || '[]'); } catch (e) { return []; }
}

export function borrarTirada(idx) {
  let lista = [];
  try { lista = JSON.parse(localStorage.getItem(TIRADAS_KEY) || '[]'); } catch (e) { lista = []; }
  if (idx < 0 || idx >= lista.length) return;
  lista.splice(idx, 1);
  try { localStorage.setItem(TIRADAS_KEY, JSON.stringify(lista)); } catch (e) {}
}

export function borrarTodasTiradas() {
  localStorage.removeItem(TIRADAS_KEY);
}

// === CARTAS ASTRALES ===
export function guardarCarta(cartaData) {
  let lista = [];
  try { lista = JSON.parse(localStorage.getItem(CARTAS_KEY) || '[]'); } catch (e) { lista = []; }
  const entrada = {
    fecha: new Date().toISOString(),
    titulo: cartaData.titulo,
    subtitulo: cartaData.subtitulo || '',
    texto: cartaData.texto,
    datos: cartaData.datos || null
  };
  lista.unshift(entrada);
  try { localStorage.setItem(CARTAS_KEY, JSON.stringify(lista)); } catch (e) { console.error('Error guardando carta:', e); }
  return entrada;
}

export function obtenerCartas() {
  try { return JSON.parse(localStorage.getItem(CARTAS_KEY) || '[]'); } catch (e) { return []; }
}

export function borrarCarta(idx) {
  let lista = [];
  try { lista = JSON.parse(localStorage.getItem(CARTAS_KEY) || '[]'); } catch (e) { lista = []; }
  if (idx < 0 || idx >= lista.length) return;
  lista.splice(idx, 1);
  try { localStorage.setItem(CARTAS_KEY, JSON.stringify(lista)); } catch (e) {}
}

export function borrarTodasCartas() {
  localStorage.removeItem(CARTAS_KEY);
}

// === UTILIDAD ===
export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
