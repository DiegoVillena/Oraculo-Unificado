// js/data/sqlite-db.js — Motor SQLite offline para búsqueda de ciudades
// Usa sql.js (SQLite compilado a WASM) para consultar ciudades.sqlite.
// Reemplaza al array estático cities.js con una BD SQLite indexada.
//
// Exporta:
//   initDB()              — inicializa la BD (carga WASM + .sqlite)
//   buscarCiudadesSQL(q)  — busca ciudades por nombre (autocomplete)
//   obtenerOffsetTZ(...)  — calcula offset UTC con DST histórico (Intl)
//   normalizarTexto(s)    — normaliza acentos para búsqueda

import { tPais } from '../i18n/i18n.js?v=69';

// === ESTADO ===
let _db = null;
let _initPromise = null;

// === INICIALIZACIÓN ===
export async function initDB() {
  if (_db) return _db;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    // sql-wasm.js se carga como script global en index.html (como astronomy.js)
    // y pone initSqlJs en window.
    if (typeof window.initSqlJs === 'undefined') {
      throw new Error('sql.js no cargado — falta el script sql-wasm.js en index.html');
    }

    // Inicializar WASM. Localizar el .wasm relativo a la página.
    const wasmPath = new URL('js/data/sql-wasm.wasm', window.location.href).href;
    const SQL = await window.initSqlJs({ locateFile: () => wasmPath });

    // Cargar el archivo .sqlite desde los assets
    const dbPath = new URL('js/data/ciudades.sqlite', window.location.href).href;
    const resp = await fetch(dbPath);
    if (!resp.ok) {
      throw new Error('No se pudo cargar ciudades.sqlite (' + resp.status + ')');
    }
    const buf = await resp.arrayBuffer();
    _db = new SQL.Database(new Uint8Array(buf));
    console.log('✦ SQLite ciudades cargado (' + (buf.byteLength / 1024).toFixed(0) + ' KB)');
    return _db;
  })();

  return _initPromise;
}

// === BÚSQUEDA ===

export function normalizarTexto(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

/**
 * Busca ciudades por nombre en la BD SQLite.
 * @param {string} query — texto de búsqueda (mínimo 2 chars)
 * @param {number} limite — máximo de resultados (default 8)
 * @returns {Array<{nombre, lat, lon, tzIANA, pais}>} — mismo formato que cities.js
 */
export function buscarCiudadesSQL(query, limite) {
  limite = limite || 8;
  if (!query || query.length < 2 || !_db) return [];

  const q = normalizarTexto(query);
  const likePattern = '%' + q + '%';

  try {
    // Buscar coincidencias, agrupando por nombre para evitar duplicados
    // (pueblos pequeños pueden aparecer varias veces con coords ligeramente
    // distintas en GeoNames). Usamos GROUP BY + MIN(id) para quedarnos con
    // una sola entrada por nombre+provincia_pais.
    const stmt = _db.prepare(
      `SELECT nombre, provincia_pais, lat, lon, timezone_id
       FROM ciudades
       WHERE id IN (
         SELECT MIN(id) FROM ciudades
         WHERE nombre LIKE ? COLLATE NOCASE
         GROUP BY LOWER(nombre), COALESCE(provincia_pais, '')
       )
       ORDER BY LENGTH(nombre) ASC`
    );
    stmt.bind([likePattern]);
    const resultados = [];
    const vistos = new Set();
    while (stmt.step()) {
      const row = stmt.getAsObject();
      // Doble deduplicación por nombre compuesto (ej. "Madrid, España")
      const nombreComp = row.nombre + '|' + (row.provincia_pais || '');
      const key = normalizarTexto(nombreComp);
      if (vistos.has(key)) continue;
      vistos.add(key);
      // Traducir el país al idioma actual (ej. "España" → "Spain")
      const paisES = row.provincia_pais || '';
      const paisTraducido = paisES ? tPais(paisES) : '';
      resultados.push({
        nombre: row.nombre + (paisTraducido ? ', ' + paisTraducido : ''),
        lat: row.lat,
        lon: row.lon,
        tzIANA: row.timezone_id,
        pais: paisTraducido || ''
      });
      if (resultados.length >= limite) break;
    }
    stmt.free();

    // Ordenar: primero los que empiezan por el query, luego por longitud
    resultados.sort((a, b) => {
      const aStarts = normalizarTexto(a.nombre).startsWith(q) ? 0 : 1;
      const bStarts = normalizarTexto(b.nombre).startsWith(q) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.nombre.length - b.nombre.length;
    });

    return resultados.slice(0, limite);
  } catch (err) {
    console.error('Error buscando ciudades:', err);
    return [];
  }
}

// === TIMEZONE (DST histórico) ===
// Migrado tal cual de cities.js — usa Intl.DateTimeFormat con shortOffset.
// El motor ICU del navegador resuelve el DST histórico automáticamente.

export function obtenerOffsetTZ(tzIANA, ano, mes, dia, hora, min) {
  if (!tzIANA || typeof Intl === 'undefined') return null;

  // Método 1: shortOffset (preferido — directo, preciso, sin ambigüedad)
  try {
    const fecha = new Date(Date.UTC(ano, mes, dia, hora, min, 0));
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tzIANA,
      timeZoneName: 'shortOffset'
    });
    const parts = dtf.formatToParts(fecha);
    const offsetPart = parts.find(p => p.type === 'timeZoneName');
    if (offsetPart) {
      const val = offsetPart.value;
      const m = val.match(/(?:GMT|UTC)([+-])(\d{1,2})(?::(\d{2}))?/);
      if (m) {
        const sign = m[1] === '+' ? 1 : -1;
        const h = parseInt(m[2]);
        const min2 = m[3] ? parseInt(m[3]) : 0;
        return sign * (h + min2 / 60);
      }
    }
  } catch (e) { /* fallback */ }

  // Método 2: diferencia con formatToParts
  const fecha = new Date(Date.UTC(ano, mes, dia, hora, min, 0));
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tzIANA,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
  const parts = dtf.formatToParts(fecha);
  const obj = {};
  parts.forEach(p => { if (p.type !== 'literal') obj[p.type] = p.value; });
  let hourVal = parseInt(obj.hour);
  if (hourVal === 24) hourVal = 0;
  const localUTC = Date.UTC(
    parseInt(obj.year), parseInt(obj.month) - 1, parseInt(obj.day),
    hourVal, parseInt(obj.minute), parseInt(obj.second)
  );
  const offsetMs = localUTC - fecha.getTime();
  return offsetMs / (1000 * 60 * 60);
}