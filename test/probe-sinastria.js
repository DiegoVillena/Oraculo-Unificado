// Verificación del fallback local de SINASTRÍA en la app (sin red)
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  window.__app.cambiarPestana('sinastria');
  await sleep(500);

  const selA = document.getElementById('sinastria-personaA');
  const selB = document.getElementById('sinastria-personaB');
  // Cartas guardadas: índice 12 = DiegoVO, 11 = Ainoa
  const opt12 = selA.options[13] ? selA.options[13].text : null; // options[0] = placeholder
  selA.value = '12';
  selB.value = '11';

  // Cálculo sincrónico de UI (calcular es async)
  await window.__tarotUI; // noop, asegura evaluación
  document.getElementById('btn-calcular-sinastria').click();
  await sleep(2600); // animación de fusión 1.5s + render

  const titulo = document.getElementById('sinastria-titulo')?.innerText || '';
  const factores = document.getElementById('sinastria-factores');
  const nBarras = factores ? factores.querySelectorAll('.sinastria-factor, [class*=factor]').length : -1;
  const avisoHora = getComputedStyle(document.getElementById('sinastria-hora-aviso')).display;
  const disclaimer = !!document.querySelector('.sinastria-score-disclaimer');
  const neto = document.getElementById('sinastria-neto')?.innerText || '';

  // Análisis fallback (IA falla rápido sin red)
  await window.__app.analizarSinastria();
  await sleep(800);

  const cont = document.getElementById('sinastria-interpretacion');
  const txt = (cont.innerText || '').trim();
  return JSON.stringify({
    opciones13: opt12,
    titulo,
    nBarras,
    avisoHoraDisplay: avisoHora, // debe ser 'none' (ambas con hora conocida)
    disclaimer,
    neto: neto.split('\n').filter((l) => l.trim()).slice(0, 2),
    analisis: {
      badge: cont.querySelector('.analisis-origen')?.className + ' :: ' + cont.querySelector('.analisis-origen')?.textContent.trim(),
      estructuraOK: /^=== ANÁLISIS INTEGRAL/.test(txt),
      emojis: ['🌟', '💫', '🔑', '🪐', '⚖️', '💌'].map((e) => e + ':' + txt.includes(e)).join(' '),
      placeholders: txt.includes('${'),
      undefinedWord: /\bundefined\b/.test(txt),
      long: txt.length,
      headers: txt.split('\n').filter((l) => /^\*\*|^[🌟💫🔑]|^===/.test(l.trim())).slice(0, 12),
      primerasLineas: txt.split('\n').filter((l) => l.trim()).slice(0, 4),
    },
  }, null, 1);
})()