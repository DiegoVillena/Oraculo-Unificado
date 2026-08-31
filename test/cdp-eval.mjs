// cdp-eval.mjs — Evalúa un script JS en el WebView de la app vía Chrome DevTools Protocol.
// La app tiene setWebContentsDebuggingEnabled(true) (MainActivity.java) → socket
// adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>
//
// Uso: node test/cdp-eval.mjs <archivo-con-script.js>
// Imprime por stdout el resultado (returnByValue). Soporta async/await.

import { readFileSync } from 'node:fs';

const PORT = process.env.CDP_PORT || '9222';
const scriptFile = process.argv[2];
if (!scriptFile) { console.error('Uso: node test/cdp-eval.mjs <script.js>'); process.exit(1); }
const expression = readFileSync(scriptFile, 'utf8');

const pages = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
const page = pages.find((p) => p.type === 'page' && !/devtools/i.test(p.url || '')) || pages[0];
if (!page) { console.error('No hay página CDP disponible'); process.exit(1); }

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = (e) => rej(new Error('WebSocket error')); });

function evaluar(exp) {
  return new Promise((res, rej) => {
    const timer = setTimeout(() => rej(new Error('Timeout CDP (90s)')), 90000);
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id !== 1) return;
      clearTimeout(timer);
      if (msg.error) { rej(new Error(msg.error.message)); return; }
      if (msg.result?.exceptionDetails) {
        const d = msg.result.exceptionDetails;
        res({ __exception: d.exception?.description || d.text || JSON.stringify(d) });
        return;
      }
      const r = msg.result?.result ?? {};
      res(r.value !== undefined ? r.value : (r.description ?? `(${r.type})`));
    };
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: { expression: exp, returnByValue: true, awaitPromise: true },
    }));
  });
}

let out;
try {
  out = await evaluar(expression);
} catch (e) {
  console.error('[CDP ERROR]', e.message);
  process.exit(2);
} finally {
  try { ws.close(); } catch (e) { /* noop */ }
}
console.log(typeof out === 'string' ? out : JSON.stringify(out, null, 2));