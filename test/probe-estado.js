// Probe 1: estado de la app (idioma, cartas guardadas, tab activa, funciones)
JSON.stringify({
  url: location.href,
  idioma: typeof window.__app?.getIdioma === 'function' ? window.__app.getIdioma() : null,
  appFn: {
    analizarCartaAstral: typeof window.__app?.analizarCartaAstral,
    verCartaAstralGuardada: typeof window.__app?.verCartaAstralGuardada,
    analizarSinastria: typeof window.__app?.analizarSinastria,
  },
  cartas: (() => {
    try {
      return JSON.parse(localStorage.getItem('cartas_astrales_guardadas') || '[]').map((c, i) => ({
        i,
        titulo: c.titulo,
        hora: c.datos ? (c.datos.hora ?? null) : null,
        desconocida: c.datos ? (c.datos.horaDesconocida ?? c.datos.desconocida ?? false) : null,
      }));
    } catch (e) { return 'ERR ' + e.message; }
  })(),
  nSinastrias: (() => { try { return JSON.parse(localStorage.getItem('sinastrias_guardadas') || '[]').length; } catch (e) { return -1; } })(),
  nTiradas: (() => { try { return JSON.parse(localStorage.getItem('tiradas_guardadas') || '[]').length; } catch (e) { return -1; } })(),
  selectA: (document.getElementById('sinastria-personaA') || {}).options?.length ?? -1,
  selectB: (document.getElementById('sinastria-personaB') || {}).options?.length ?? -1,
  panelsActivos: [...document.querySelectorAll('.tab-content')].filter((p) => p.classList.contains('active')).map((p) => p.dataset.panel),
  onboarding: !!document.getElementById('onboarding-overlay'),
})