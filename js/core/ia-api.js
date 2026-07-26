// core/ia-api.js — Cliente de la IA (Gemini 3.1 Flash-Lite via Cloudflare Worker)
// Funciones async que llaman al proxy y devuelven HTML del análisis.
// Si fallan (timeout, sin red, error), lanzan excepción para que el caller
// haga fallback al algoritmo local.

import { getIdioma } from '../i18n/i18n.js?v=17';

const WORKER_URL = 'https://oraculo-worker.diegovillens.workers.dev';
const TIMEOUT_MS = 45000;

// === Markdown → HTML (conversor ligero) ===
function markdownAHtml(md) {
  if (!md) return '';
  // Escapar HTML peligroso
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Encabezados ### y ##
  html = html.replace(/^###\s+(.+)$/gm, '<h4 class="analisis-sub">$1</h4>');
  html = html.replace(/^##\s+(.+)$/gm, '<h4 class="analisis-sub">$1</h4>');

  // Negritas **texto**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Cursivas *texto* (evitar conflicto con **)
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g, '<em>$1</em>');

  // Listas con guion
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, m => '<ul>' + m + '</ul>');

  // Listas numeradas
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Separadores ---
  html = html.replace(/^---$/gm, '<hr class="analisis-hr">');

  // Parrafos: lineas sueltas que no son HTML ya
  const lineas = html.split('\n');
  const resultado = [];
  let enLista = false;
  for (const linea of lineas) {
    const trimmed = linea.trim();
    if (!trimmed) {
      if (enLista) { enLista = false; }
      resultado.push('');
      continue;
    }
    if (trimmed.startsWith('<h4') || trimmed.startsWith('<ul') || trimmed.startsWith('<li') || trimmed.startsWith('<hr')) {
      resultado.push(trimmed);
    } else if (trimmed.startsWith('<')) {
      resultado.push(trimmed);
    } else {
      resultado.push('<p>' + trimmed + '</p>');
    }
  }
  return resultado.join('\n');
}

// === Fetch con timeout ===
async function fetchConTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return resp;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// === Funciones publicas ===

export async function analisisTarotIA(textoTirada) {
  const resp = await fetchConTimeout(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'tarot', datos: textoTirada, idioma: getIdioma() }),
  }, TIMEOUT_MS);
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || 'Error del servidor (' + resp.status + ')');
  }
  const data = await resp.json();
  if (!data.texto) throw new Error('Respuesta vacía de la IA');
  return '<div class="ia-analisis">' + markdownAHtml(data.texto) + '</div>';
}

export async function analisisAstralIA(textoCarta) {
  const resp = await fetchConTimeout(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'astral', datos: textoCarta, idioma: getIdioma() }),
  }, TIMEOUT_MS);
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || 'Error del servidor (' + resp.status + ')');
  }
  const data = await resp.json();
  if (!data.texto) throw new Error('Respuesta vacía de la IA');
  return '<div class="ia-analisis">' + markdownAHtml(data.texto) + '</div>';
}

export async function analisisCombinadoIA(textoTirada, textoCarta) {
  const resp = await fetchConTimeout(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'combinado', datos: { tirada: textoTirada, carta: textoCarta }, idioma: getIdioma() }),
  }, TIMEOUT_MS);
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || 'Error del servidor (' + resp.status + ')');
  }
  const data = await resp.json();
  if (!data.texto) throw new Error('Respuesta vacía de la IA');
  return '<div class="ia-analisis">' + markdownAHtml(data.texto) + '</div>';
}

// === Generar texto de copia de la carta astral (igual que copiar()) ===
export function generarTextoCopiaAstral(c) {
  let txt = 'CARTA ASTRAL DE ' + (c.nombre || '').toUpperCase() + '\n';
  txt += 'Fecha: ' + c.fecha + '\n';
  txt += 'Hora: ' + c.hora + '\n';
  txt += 'Lugar: ' + (c.ciudad ? c.ciudad.nombre : '') + '\n\n';
  // Generar texto tabla planetas + casas
  txt += 'Zodiac : Tropical\t\tPlacidus Orb : 0\n';
  const max = Math.max(c.planetas.length, c.casasInfo.length);
  for (let i = 0; i < max; i++) {
    let line = '';
    if (i < c.planetas.length) {
      const p = c.planetas[i];
      line += p.nombre + '\t' + p.signo.nombre + '\t' + p.grados + '°' +
        p.minutos.toString().padStart(2, '0') + "'" + (p.retro ? ' R' : '');
    }
    if (i < c.casasInfo.length) {
      const cc = c.casasInfo[i];
      const etq = cc.esAngulo ? cc.etiqueta : ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][cc.numero - 1];
      line += '\t' + etq + '\t' + cc.signo.nombre + '\t' + cc.grados + '°' +
        cc.minutos.toString().padStart(2, '0') + "'";
    }
    txt += line + '\n';
  }
  txt += '\n';
  for (const p of c.planetas) {
    const rom = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][p.casa - 1];
    const ang = p.esAngulo ? ' ' + p.etiquetaAngulo : '';
    txt += p.nombre + '\tin\t' + rom + ang + '\n';
  }
  txt += '\n=== ASPECTOS ===\n';
  txt += c.aspectos.map(a => a.p1 + ' ' + a.simbolo + ' ' + a.p2 + ' (' + a.tipo + ', orb ' + a.orb.toFixed(1) + '°)').join('\n');
  if (c.partOfFortune) {
    txt += '\n\nPart of Fortune: ' + c.partOfFortune.signo.nombre + ' ' + c.partOfFortune.grados + '°' + c.partOfFortune.minutos + "'";
  }
  if (c.southNode) {
    txt += '\nSouth Node: ' + c.southNode.signo.nombre + ' ' + c.southNode.grados + '°' + c.southNode.minutos + "'";
  }
  return txt;
}