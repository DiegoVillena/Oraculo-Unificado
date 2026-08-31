// Verificación detallada S4/S5 del fallback astral (es) + re-render en en sin títulos españoles
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const cont = document.getElementById('astral-interpretacion');
  const txt = cont.innerText || cont.textContent || '';

  // --- Detalles Sección 4 (Motor de Crecimiento: aspectos + etiquetas 🎁/🔥) y Sección 5 (Brújula Kármica) ---
  const s4 = txt.slice(txt.indexOf('4. El Motor'), txt.indexOf('5. Tu Brújula'));
  const s5 = txt.slice(txt.indexOf('5. Tu Brújula'), txt.indexOf('6. El Consejo'));
  const res4 = {
    longitudS4: s4.length,
    lineaAspecto: s4.split('\n').filter((l) => /[△□✶☄]/.test(l) || /[A-Za-z]+.*(conjunción|oposición|trígono|cuadratura|sextil)/i.test(l)).slice(0, 4),
    etiquetadon: s4.includes('🎁'),
    etiquetaMotor: s4.includes('🔥'),
  };
  const res5 = {
    tieneNodo: /Nodo/.test(s5),
    tieneQuiron: /Quir[oó]n/.test(s5),
    linea: s5.split('\n').filter((l) => /Nodo|Quir[oó]n/i.test(l)).slice(0, 3),
  };

  // --- Re-render en inglés ---
  await window.__app.cambiarIdioma('en');
  await sleep(600);
  window.__app.cambiarPestana('astral');
  await sleep(300);
  window.__app.verCartaAstralGuardada(12);
  await sleep(500);
  await window.__app.analizarCartaAstral();
  await sleep(800);
  const txtEn = (cont.innerText || '').trim();
  const badgeEn = cont.querySelector('.analisis-origen');

  return JSON.stringify({
    s4: res4,
    s5: res5,
    en: {
      badge: badgeEn ? badgeEn.className + ' :: ' + badgeEn.textContent.trim() : null,
      placeholders: txtEn.includes('${'),
      undefinedWord: /\bundefined\b/.test(txtEn),
      headers: [...cont.querySelectorAll('h2,h3,h4')].map((e) => e.textContent.trim()).slice(0, 10),
      residuoEspanol: /Eje de tu Ser|Huella Energética|Brújula Kármica|Consejo del Oráculo/.test(txtEn),
      primerasLineas: txtEn.split('\n').filter((l) => l.trim()).slice(0, 4),
    },
  }, null, 1);
})()