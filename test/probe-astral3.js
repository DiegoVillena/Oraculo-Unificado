// Carta ASTRAL fresca (motor nuevo, con Quirón) → fallback local → S5 debe citar Quirón
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  // Volver a español (quedó en 'en' tras el check anterior)
  await window.__app.cambiarIdioma('es');
  await sleep(600);

  const astro = await import('/js/core/astrologia.js?v=72');
  // Carta fresca calculada IN-PAGE con el motor nuevo (incluye Asteroid.Chiron id 15)
  const datos = await astro.calcularCartaAstral({
    nombre: 'PruebaCDP Quiron',
    dia: 15, mes: 5, ano: 1990, hora: 21, min: 35,
    desconocida: false,
    ciudad: { nombre: 'Madrid', lat: 40.4168, lon: -3.7038 },
    offsetReal: 2,
  });
  const nombres = (datos.planetas || []).map((p) => p.nombre);
  astro.setUltimaCarta(datos);

  window.__app.cambiarPestana('astral');
  await sleep(300);
  // Sin red → fallback local
  await window.__app.analizarCartaAstral();
  await sleep(800);

  const cont = document.getElementById('astral-interpretacion');
  const txt = (cont.innerText || '').trim();
  const s5 = txt.slice(txt.indexOf('5. Tu Brújula'), txt.indexOf('6. El Consejo'));
  return JSON.stringify({
    nombresPlanetas: nombres,
    badge: cont.querySelector('.analisis-origen')?.className + ' :: ' + cont.querySelector('.analisis-origen')?.textContent.trim(),
    placeholders: txt.includes('${'),
    undefinedWord: /\bundefined\b/.test(txt),
    s5Quiron: /Quir[oó]n/i.test(s5),
    s5LineaQuiron: s5.split('\n').filter((l) => /Quir[oó]n/i.test(l)).slice(0, 1),
  }, null, 1);
})()