// probe-dump-cartas.js — extrae TODAS las cartas y sinastrías guardadas del
// localStorage del WebView vía CDP, como string JSON (para redirect a archivo).
// Uso: node test/cdp-eval.mjs test/probe-dump-cartas.js > test/_tmp-all-cartas.json
// (cdp-eval imprime el string tal cual → el archivo ya es JSON parseable una vez).
// Requiere: app debug corriendo + `adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>`.
(function(){
  const cartas = JSON.parse(localStorage.getItem('cartas_astrales_guardadas') || '[]');
  const sins = JSON.parse(localStorage.getItem('sinastrias_guardadas') || '[]');
  const payload = {
    cartas: cartas.map(c => c.datos || c),
    sinastrias: sins.map(s => ({ fecha: s.fecha, titulo: s.titulo,
      global: s.datos && s.datos.resultado ? s.datos.resultado.globalScore : (s.datos && s.datos.globalScore != null ? s.datos.globalScore : null) })),
  };
  return JSON.stringify(payload);
})()
