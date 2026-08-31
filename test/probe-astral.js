// Verificación del fallback local de CARTA ASTRAL en la app (sin red)
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const tabs = [...document.querySelectorAll('.tab-btn')].map((b) => b.dataset.tab);

  window.__app.cambiarPestana('astral');
  await sleep(400);
  // Cargar la última carta guardada (DiegoVO, hora 21:35) como carta activa
  window.__app.verCartaAstralGuardada(12);
  await sleep(500);

  // Sin red (modo avión): la IA falla rápido y cae al fallback local
  await window.__app.analizarCartaAstral();
  await sleep(800);

  const cont = document.getElementById('astral-interpretacion');
  const txt = (cont.innerText || cont.textContent || '').trim();
  const badge = cont.querySelector('.analisis-origen');
  return JSON.stringify({
    tabs,
    display: cont.style.display,
    badge: badge ? badge.className + ' :: ' + badge.textContent.trim() : null,
    long: txt.length,
    placeholder: txt.includes('${'),
    undefinedWord: /\bundefined\b/.test(txt),
    headers: [...cont.querySelectorAll('h2,h3,h4')].map((e) => e.textContent.trim()).slice(0, 15),
    primerasLineas: txt.split('\n').filter((l) => l.trim()).slice(0, 8),
  }, null, 1);
})()