// Tirada de tarot (3 cartas + I Ching) en el móvil, red cortada → análisis local
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  window.__app.cambiarPestana('tarot');
  await sleep(300);
  window.__tarotUI.realizarConsulta('tres');
  await sleep(6000);
  const res = document.getElementById('resultados');
  const nCartas = res ? res.querySelectorAll('img').length : -1;
  document.getElementById('btn-analisis')?.click();
  await window.__tarotUI.mostrarAnalisis();
  await sleep(1200);
  const out = document.getElementById('analisis-output');
  const txt = (out?.innerText || '').trim();
  const badge = out?.querySelector('.analisis-origen');
  return JSON.stringify({
    nCartas,
    badge: badge ? badge.className + ' :: ' + badge.textContent.trim() : null,
    long: txt.length,
    placeholder: txt.includes('${'),
    undefinedWord: /\bundefined\b/.test(txt),
    headers: txt.split('\n').filter((l) => /^[^a-záéíóú]{0,3}[^ ]*:|^##|^\d\./.test(l.trim()) || /^[🌐💫🔮]/.test(l)).slice(0, 8),
    primerasLineas: txt.split('\n').filter((l) => l.trim()).slice(0, 3),
  }, null, 1);
})()