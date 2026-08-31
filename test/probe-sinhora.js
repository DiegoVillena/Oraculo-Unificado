// UI con HORA DESCONOCIDA: banner ⚠️ visible + panel de factores SIN Compromiso
// Usa el motor y render() reales in-page (no toca localStorage de las cartas de Diego)
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const astro = await import('/js/core/astrologia.js?v=72');
  const S = await import('/js/ui/sinastria.js?v=72');

  const cartas = JSON.parse(localStorage.getItem('cartas_astrales_guardadas') || '[]');
  const diego = cartas[12].datos; // carta real con hora conocida (21:35)
  // Carta fresca con hora desconocida (el motor la marca desconocida:true)
  const sinH = await astro.calcularCartaAstral({
    nombre: 'PruebaCDP SinHora',
    dia: 20, mes: 11, ano: 1989, hora: 12, min: 0,
    desconocida: true,
    ciudad: { nombre: 'Barcelona', lat: 41.3874, lon: 2.1686 },
    offsetReal: 1,
  });

  const r = astro.calcularSinastria(diego, sinH);

  // Limpiar el análisis anterior para que el render sea el del caso sinHora
  window.__app.cambiarPestana('sinastria');
  const cont = document.getElementById('sinastria-interpretacion');
  cont.innerHTML = '';
  S.render(r, diego, sinH);
  await sleep(2000);

  const banner = document.getElementById('sinastria-hora-aviso');
  const factores = document.getElementById('sinastria-factores');
  const panelTxt = factores?.innerText || '';
  return JSON.stringify({
    sinHoraFlag: r.sinHora,
    bannerDisplay: banner ? getComputedStyle(banner).display : 'no-existe',
    bannerTexto: (banner?.innerText || '').trim().slice(0, 200),
    nFactoresFilas: factores ? factores.children.length : -1,
    labelsPanel: factores ? [...factores.querySelectorAll('*')].map((e) => e.firstChild?.textContent?.trim()).filter((t) => t && t.length < 40).slice(0, 8) : [],
    mencionaCompromiso: /Compromiso/i.test(panelTxt),
    mencionaCasa7: /Casa 7|Descendente/i.test(panelTxt),
    btnAnalisisVisible: (() => { const b = document.getElementById('btn-analisis-sinastria'); return b ? b.style.display : 'no-existe'; })(),
  }, null, 1);
})()