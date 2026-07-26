// config.js — Configuración de entorno del frontend.
// Los valores se inyectan en build time desde .env (VITE_*) cuando se usa un
// bundler; en Capacitor (sin bundler) se sirven los valores por defecto, que
// apuntan al proxy del Cloudflare Worker. La API key NUNCA vive en el cliente.
//
// Para rotar la URL del worker o el modelo sin tocar el código, edita .env y
// regenera los assets con `npx cap sync`.

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

export const APP_CONFIG = {
  // URL pública del Cloudflare Worker (proxy que oculta la API key de Gemini).
  WORKER_URL: ENV.VITE_WORKER_URL || 'https://oraculo-worker.diegovillens.workers.dev',
  // Modelo de Gemini (lo usa el worker, aquí solo para documentación/debug).
  GEMINI_MODEL: ENV.VITE_GEMINI_MODEL || 'gemini-3.1-flash-lite',
  // Timeout de la llamada a la IA en ms.
  IA_TIMEOUT_MS: parseInt(ENV.VITE_IA_TIMEOUT_MS || '45000', 10),
};

// Flag de release: en Capacitor el esquema es https://localhost (sin query de debug).
// Consideramos release si NO hay parámetro ?debug en la URL.
export const IS_RELEASE = (() => {
  try {
    if (typeof window === 'undefined') return true;
    const url = new URL(window.location.href);
    return !url.searchParams.has('debug');
  } catch {
    return true;
  }
})();