// ui/astral.js — Formulario y renderizado de Carta Astral (reconstruido)
import { calcularCartaAstral, getUltimaCarta, setUltimaCarta, getCiudad, setCiudad,
  generarTextoCarta, generarInterpretacion, generarRuedaSVG,
  SIGNOS, CASAS_ROMANAS } from '../core/astrologia.js?v=17';
import { buscarCiudadesSQL as buscarCiudades, obtenerOffsetTZ } from '../data/sqlite-db.js?v=17';
import { t, tSigno, tAspecto } from '../i18n/i18n.js?v=17';

let dropdownResultados = [];

window.__astroUI = {
  mostrarInfoPlaneta, mostrarInfoAspecto, mostrarInfoSigno, mostrarInfoCasa,
  copiarCartaAstral: () => copiar(),
  copiarCartaAstralTodo: () => copiarTodo(),
  compartirCartaAstral: () => compartir(),
  compartirCartaAstralTodo: () => compartirTodo(),
};

export function initFormularioAstral() {
  const selDia = document.getElementById('dia-nacimiento');
  if (selDia && !selDia.options.length) {
    for (let i=1;i<=31;i++){const o=document.createElement('option');o.value=i;o.textContent=i;selDia.appendChild(o);}
    selDia.value=15;
  }
  const selAno = document.getElementById('ano-nacimiento');
  if (selAno && !selAno.options.length) {
    for (let i=2025;i>=1920;i--){const o=document.createElement('option');o.value=i;o.textContent=i;if(i===1990)o.selected=true;selAno.appendChild(o);}
  }
  const selHora = document.getElementById('hora-nacimiento');
  if (selHora && !selHora.options.length) {
    for (let h=0;h<=23;h++){const o=document.createElement('option');o.value=h;o.textContent=(h<10?'0':'')+h;selHora.appendChild(o);}
    selHora.value=12;
  }
  const selMin = document.getElementById('minuto-nacimiento');
  if (selMin && !selMin.options.length) {
    for (let m=0;m<=55;m+=5){const o=document.createElement('option');o.value=m;o.textContent=(m<10?'0':'')+m;selMin.appendChild(o);}
    selMin.value=0;
  }

  const selMes = document.getElementById('mes-nacimiento');
  if (selMes && !selMes.dataset.l) {
    selMes.addEventListener('change', actualizarDias);
    selAno.addEventListener('change', actualizarDias);
    selMes.dataset.l = '1';
  }
  const ci = document.getElementById('ciudad-input');
  if (ci && !ci.dataset.l) {
    ci.addEventListener('input', autocompletar);
    ci.addEventListener('focus', autocompletar);
    ci.dataset.l = '1';
  }
  const chk = document.getElementById('hora-desconocida');
  if (chk && !chk.dataset.l) {
    chk.addEventListener('change', toggleHora);
    chk.dataset.l = '1';
  }
  const btn = document.getElementById('btn-calcular-astral');
  if (btn) btn.addEventListener('click', calcular);
  const btnCopy = document.getElementById('btn-copiar-astral');
  if (btnCopy) btnCopy.addEventListener('click', copiar);
  const btnCopyTodo = document.getElementById('btn-copiar-astral-todo');
  if (btnCopyTodo) btnCopyTodo.addEventListener('click', copiarTodo);
  const btnShare = document.getElementById('btn-compartir-astral');
  if (btnShare) btnShare.addEventListener('click', compartir);
  const btnShareTodo = document.getElementById('btn-compartir-astral-todo');
  if (btnShareTodo) btnShareTodo.addEventListener('click', compartirTodo);
}

function actualizarDias() {
  const m = parseInt(document.getElementById('mes-nacimiento').value);
  const a = parseInt(document.getElementById('ano-nacimiento').value);
  const d = parseInt(document.getElementById('dia-nacimiento').value);
  let max;
  if (m===1){const b=(a%4===0&&a%100!==0)||(a%400===0);max=b?29:28;}
  else if ([0,2,4,6,7,9,11].includes(m)) max=31; else max=30;
  const sel = document.getElementById('dia-nacimiento');
  sel.innerHTML='';
  for(let i=1;i<=max;i++){const o=document.createElement('option');o.value=i;o.textContent=i;sel.appendChild(o);}
  sel.value=Math.min(d,max);
}

function autocompletar() {
  const input = document.getElementById('ciudad-input');
  const dd = document.getElementById('ciudades-dropdown');
  const q = input.value.trim();
  if (q.length < 2) { dd.classList.remove('visible'); dd.innerHTML=''; return; }
  const res = buscarCiudades(q, 8);
  if (!res.length) { dd.innerHTML='<div class="ciudad-item" style="color:var(--text-mut);font-style:italic">' + t('astral.noCiudades') + '</div>'; dd.classList.add('visible'); return; }
  dd.innerHTML = res.map((c,i)=>`<div class="ciudad-item" data-idx="${i}">${c.nombre}</div>`).join('');
  dropdownResultados = res;
  dd.classList.add('visible');
  dd.querySelectorAll('.ciudad-item').forEach((item,idx)=>item.addEventListener('click',()=>seleccionar(idx)));
}

function seleccionar(idx) {
  if (idx>=0 && idx<dropdownResultados.length) {
    const c = dropdownResultados[idx];
    document.getElementById('ciudad-input').value = c.nombre;
    document.getElementById('ciudades-dropdown').classList.remove('visible');
    document.getElementById('ciudades-dropdown').innerHTML = '';
    setCiudad(c);
  }
}

function toggleHora() {
  const chk = document.getElementById('hora-desconocida');
  const h = document.getElementById('hora-nacimiento');
  const m = document.getElementById('minuto-nacimiento');
  if (chk.checked) { h.disabled=true; m.disabled=true; h.value=12; m.value=0; }
  else { h.disabled=false; m.disabled=false; }
}

async function calcular() {
  const nombre = document.getElementById('nombre-nativo')?.value.trim() || '';
  const dia = parseInt(document.getElementById('dia-nacimiento')?.value || '1');
  const mes = parseInt(document.getElementById('mes-nacimiento')?.value || '0');
  const ano = parseInt(document.getElementById('ano-nacimiento')?.value || '2000');
  const hora = parseInt(document.getElementById('hora-nacimiento')?.value || '12');
  const min = parseInt(document.getElementById('minuto-nacimiento')?.value || '0');
  const desc = document.getElementById('hora-desconocida')?.checked || false;
  const ciudad = getCiudad();
  if (!ciudad) { alert('' + t('astral.seleccionaCiudad') + ''); document.getElementById('ciudad-input')?.focus(); return; }

  let offsetReal = null;
  if (ciudad.tzIANA) {
    try { offsetReal = obtenerOffsetTZ(ciudad.tzIANA, ano, mes, dia, hora, min); }
    catch(e) { console.warn('Offset TZ falló:', e); }
  }

  // === MOSTRAR ANIMACIÓN DE CONSTELACIONES ===
  mostrarAnimacionConstelaciones();

  const btn = document.getElementById('btn-calcular-astral');
  if (btn) { const o = btn.innerText; btn.innerText = '' + t('astral.calculando') + ''; btn.disabled = true;
    setTimeout(() => { btn.innerText = o; btn.disabled = false; }, 10000);
  }

  try {
    const datos = await calcularCartaAstral({ nombre, dia, mes, ano, hora, min, desconocida:desc, ciudad, offsetReal });
    // Garantizar que la animación dure mínimo 1.5s
    const tiempoInicio = window.__constellationStartTime || Date.now();
    const transcurrido = Date.now() - tiempoInicio;
    const delayRestante = Math.max(0, 1500 - transcurrido);
    setTimeout(() => {
      ocultarAnimacionConstelaciones();
      render(datos);
      if (btn) { btn.innerText = '' + t('astral.calcular') + ''; btn.disabled = false; }
    }, delayRestante + 200);
  } catch(err) {
    ocultarAnimacionConstelaciones();
    alert('Error: ' + err.message); console.error(err);
    if (btn) { btn.innerText = '' + t('astral.calcular') + ''; btn.disabled = false; }
  }
}

// === ANIMACIÓN DE CONSTELACIONES ===
function starShape(cx, cy, r, fill, cls, delay, dur) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.4;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    pts.push(`${px.toFixed(2)},${py.toFixed(2)}`);
  }
  const styleStr = dur ? `animation-delay:${delay}s;animation-duration:${dur}s` : `animation-delay:${delay}s`;
  return `<polygon points="${pts.join(' ')}" fill="${fill}" class="${cls}" style="${styleStr}"/>`;
}

// Constelaciones reales más reconocibles, normalizadas a viewport 100x100
const CONSTELACIONES_REALES = [
  {
    nombre: 'Osa Mayor',
    estrellas: [[30,25],[38,23],[46,24],[53,27],[50,34],[42,36],[35,32]],
    lineas: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0]]
  },
  {
    nombre: 'Orión',
    estrellas: [[42,18],[50,22],[58,18],[40,32],[50,32],[60,32],[38,46],[50,46],[62,46],[50,15]],
    lineas: [[0,1],[1,2],[0,3],[2,5],[3,4],[4,5],[3,6],[5,8],[6,7],[7,8],[1,9]]
  },
  {
    nombre: 'Casiopea',
    estrellas: [[25,25],[35,28],[45,24],[55,27],[65,23]],
    lineas: [[0,1],[1,2],[2,3],[3,4]]
  },
  {
    nombre: 'Cisne (Cruz del Norte)',
    estrellas: [[50,15],[50,26],[50,38],[50,50],[38,32],[62,32]],
    lineas: [[0,1],[1,2],[2,3],[1,4],[1,5]]
  },
  {
    nombre: 'León',
    estrellas: [[28,28],[35,22],[42,20],[50,24],[55,32],[48,38],[40,36],[33,34]],
    lineas: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0]]
  },
  {
    nombre: 'Escorpio',
    estrellas: [[20,20],[28,22],[36,25],[42,30],[46,38],[48,46],[45,54],[40,60],[33,62]],
    lineas: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]]
  },
  {
    nombre: 'Lyra',
    estrellas: [[48,22],[54,28],[44,30],[52,36],[42,34]],
    lineas: [[0,1],[1,3],[3,4],[4,2],[2,0]]
  },
  {
    nombre: 'Cruz del Sur',
    estrellas: [[50,30],[45,40],[55,40],[50,52],[50,24]],
    lineas: [[0,1],[0,2],[0,3],[0,4]]
  },
];

function mostrarAnimacionConstelaciones() {
  window.__constellationStartTime = Date.now();

  const overlay = document.createElement('div');
  overlay.className = 'constellation-overlay';
  overlay.id = 'constellation-overlay';

  // 3 constelaciones aleatorias
  const seleccionadas = [...CONSTELACIONES_REALES].sort(() => Math.random() - 0.5).slice(0, 3);

  let svgContent = '<svg class="constellation-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">';

  // Estrellas de fondo dispersas (evitar zona central donde van las constelaciones)
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const r = 0.15 + Math.random() * 0.25;
    const delay = (Math.random() * 2).toFixed(2);
    const dur = (2.5 + Math.random() * 2).toFixed(1);
    const isGold = Math.random() > 0.5;
    const fill = isGold ? '#e8c46a' : '#ffffff';
    svgContent += starShape(x, y, r, fill, 'constellation-bg-star', delay, dur);
  }

  // === POSICIONAMIENTO ESPACIAL ANTI-SOLAPAMIENTO ===
  // Calcula el bounding box de cada constelación (en sus coords originales 0-100)
  // y la coloca en una zona distinta del viewport usando una partición en 3 bandas
  // verticales (arriba, centro, abajo) con escalado individual para que quepa sin
  // salirse ni solaparse con las otras.

  function boundingBox(estrellas) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of estrellas) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
  }

  // 3 zonas del viewport (x_centro, y_centro) — distribuidas verticalmente
  const zonas = [
    { cx: 50, cy: 22, escala: 0.35 },  // arriba-centro
    { cx: 35, cy: 52, escala: 0.38 },  // centro-izquierda
    { cx: 65, cy: 78, escala: 0.33 },  // abajo-derecha
  ];

  // Mezclar zonas para que no siempre la misma constelación vaya al mismo sitio
  const zonasShuffled = [...zonas].sort(() => Math.random() - 0.5);

  seleccionadas.forEach((con, ci) => {
    const baseDelay = ci * 0.8;
    const bb = boundingBox(con.estrellas);
    const zona = zonasShuffled[ci];

    // Centro de la constelación en coords originales
    const conCX = bb.minX + bb.w / 2;
    const conCY = bb.minY + bb.h / 2;

    // Escalar y trasladar para que el centro de la constelación coincida con zona.cx/cy
    const esc = zona.escala;
    const escalar = ([x, y]) => [
      (x - conCX) * esc + zona.cx,
      (y - conCY) * esc + zona.cy
    ];

    const estrellasEsc = con.estrellas.map(escalar);

    svgContent += `<g class="const-group" style="animation-delay:${baseDelay.toFixed(1)}s">`;

    // Líneas de la constelación
    con.lineas.forEach(([a, b]) => {
      const [x1, y1] = estrellasEsc[a];
      const [x2, y2] = estrellasEsc[b];
      svgContent += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" class="constellation-line" style="animation-delay:${baseDelay.toFixed(1)}s"/>`;
    });

    // Estrellas en los vértices (radio proporcional a la escala)
    const starR = 0.6 + esc * 0.8;
    estrellasEsc.forEach(([x, y]) => {
      svgContent += starShape(x, y, starR, '#e8c46a', 'constellation-star', baseDelay.toFixed(1));
    });

    svgContent += '</g>';
  });

  svgContent += '</svg>';
  overlay.innerHTML = svgContent + '<div class="constellation-text">' + t('astral.descifrandoCielo') + '</div>';
  document.body.appendChild(overlay);
}

function ocultarAnimacionConstelaciones() {
  const overlay = document.getElementById('constellation-overlay');
  if (overlay) {
    overlay.classList.add('hide');
    setTimeout(() => overlay.remove(), 600);
  }
}

export function render(d) {
  // Sincronizar el estado global con la carta que se está renderizando,
  // para que las funciones interactivas (mostrarInfoPlaneta/Aspecto/Casa) y
  // copiar() — que consultan getUltimaCarta() — operen sobre ESTA carta,
  // tanto tras un cálculo nuevo como al cargar una carta guardada (👁️).
  setUltimaCarta(d);
  document.getElementById('astral-titulo').textContent = d.nombre ? t('astral.tituloCarta', {nombre: d.nombre}) : t('astral.tituloCartaSinNombre');
  document.getElementById('astral-subtitulo').textContent = d.fecha + ' · ' + (d.desconocida?t('astral.horaDesconocidaLabel'):d.hora) + ' · ' + d.ciudad.nombre + ' · UTC' + (d.tz>=0?'+':'') + d.tz;
  // Ocultar texto técnico e interpretación (datos integrados en tabla bonita)
  document.getElementById('astral-texto').style.display = 'none';
  document.getElementById('astral-interpretacion').style.display = 'none';
  // === Diagrama ===
  document.getElementById('astral-wheel').innerHTML = generarRuedaSVG(d);
  document.getElementById('astral-wheel-info').textContent = '' + t('astral.infoRueda') + '';
  // === TABLA UNIFICADA (planetas + casas + posiciones) ===
  const tabla = renderTablaUnificada(d);
  const tablaContainer = document.getElementById('astral-tabla');
  if (tablaContainer) {
    tablaContainer.innerHTML = tabla;
    tablaContainer.style.display = 'block';
  }
  // === Equilibrio Elemental ===
  const st = document.getElementById('astral-stats');
  if (st && d.estadisticas) st.innerHTML = renderStats(d.estadisticas);
  // === Part of Fortune & South Node ===
  const ex = document.getElementById('astral-extra');
  if (ex) ex.innerHTML = renderExtra(d);
  // === Aspectos Planetarios (colapsable, después de extra) ===
  const asp = document.getElementById('astral-aspectos');
  if (asp) asp.innerHTML = renderAspectosColapsable(d.aspectos);
  // Mostrar botón "Analizar carta astral" y limpiar análisis previo
  const btnAnalisis = document.getElementById('btn-analisis-astral');
  if (btnAnalisis) btnAnalisis.style.display = 'block';
  const interp = document.getElementById('astral-interpretacion');
  if (interp) { interp.innerHTML = ''; interp.style.display = 'none'; }
  // Ocultar botón "Copiar todo (con análisis)" hasta que se genere un análisis
  const btnCopiarTodoAstral = document.getElementById('btn-copiar-astral-todo');
  if (btnCopiarTodoAstral) btnCopiarTodoAstral.style.display = 'none';
  const btnCompartirTodoAstral = document.getElementById('btn-compartir-astral-todo');
  if (btnCompartirTodoAstral) btnCompartirTodoAstral.style.display = 'none';
  // Mostrar botón de análisis combinado si también hay tirada de Tarot
  import('../ui/tarot.js?v=17').then(mod => {
    const tirada = mod.getUltimaTirada();
    const btnCombinado = document.getElementById('btn-analisis-combinado');
    if (btnCombinado) btnCombinado.style.display = (tirada && d) ? 'block' : 'none';
  }).catch(() => {});
  // Scroll suave centrado en el diagrama
  document.getElementById('astral-output').classList.add('visible');
  setTimeout(()=> {
    const wheel = document.getElementById('astral-wheel');
    if (wheel) wheel.scrollIntoView({behavior:'smooth',block:'center'});
  }, 100);
}

// === TABLA UNIFICADA DE PLANETAS Y CASAS ===
// Helper: nombre del signo traducido (fallback al nombre del objeto SIGNOS)
function _nombreSigno(signoObj) {
  const idx = SIGNOS.indexOf(signoObj);
  if (idx >= 0) {
    const sT = tSigno(idx);
    if (sT?.nombre) return sT.nombre;
  }
  return signoObj.nombre;
}

function renderTablaUnificada(d) {
  if (!d.planetas || !d.planetas.length) return '';
  // Nombres de planetas según idioma
  const nombresPlanetarios = t('astral.nombresPlanetarios');
  const getNombrePlaneta = (nombre) => {
    if (nombresPlanetarios && typeof nombresPlanetarios === 'object' && nombresPlanetarios[nombre]) return nombresPlanetarios[nombre];
    return nombre;
  };
  const casasRom = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

  let h = '<div class="astral-table-wrap"><table class="astral-table"><thead><tr>';
  h += '<th>' + t('astral.tablaPlaneta') + '</th><th>' + t('astral.tablaSigno') + '</th><th>' + t('astral.tablaGrado') + '</th><th>' + t('astral.tablaCasa') + '</th><th>' + t('astral.tablaPosicion') + '</th>';
  h += '</tr></thead><tbody>';

  // Filas de planetas
  for (const p of d.planetas) {
    const nombreES = getNombrePlaneta(p.nombre);
    const retro = p.retro ? '<span class="retro-badge">R</span>' : '';
    const angulo = p.esAngulo ? ` <span class="retro-badge" style="background:rgba(232,196,106,0.15);color:var(--gold-bright);border-color:rgba(232,196,106,0.3)">${p.etiquetaAngulo}</span>` : '';
    const casaRom = casasRom[p.casa-1] || p.casa;
    const posAngulo = p.esAngulo ? ' ' + p.etiquetaAngulo : '';
    const nombreSigno = _nombreSigno(p.signo);
    h += `<tr>`;
    h += `<td><span class="planet-sym">${p.simbolo}</span> ${nombreES}</td>`;
    h += `<td><span class="sign-sym">${p.signo.simbolo}</span> ${nombreSigno}</td>`;
    h += `<td>${p.grados}°${p.minutos.toString().padStart(2,'0')}'</td>`;
    h += `<td><span class="house-num">${casaRom}</span></td>`;
    h += `<td>${t('astral.casa')} ${casaRom}${posAngulo}${retro}</td>`;
    h += `</tr>`;
  }

  // Separador
  h += `<tr class="table-divider"><td colspan="5"></td></tr>`;

  // Filas de casas
  if (d.casasInfo && d.casasInfo.length) {
    for (const c of d.casasInfo) {
      const etq = c.esAngulo ? c.etiqueta : casasRom[c.numero-1];
      const nombreSigno = _nombreSigno(c.signo);
      h += `<tr class="casa-row">`;
      h += `<td><span class="house-num">${etq}</span></td>`;
      h += `<td><span class="sign-sym">${c.signo.simbolo}</span> ${nombreSigno}</td>`;
      h += `<td>${c.grados}°${c.minutos.toString().padStart(2,'0')}'</td>`;
      h += `<td>—</td>`;
      h += `<td>${t('astral.cuspideCasa', {n: casasRom[c.numero-1]})}</td>`;
      h += `</tr>`;
    }
  }

  h += '</tbody></table></div>';
  return h;
}

// === ASPECTOS COLAPSABLE ===
function renderAspectosColapsable(a) {
  if (!a?.length) return '';
  let h = '<div class="aspectos-collapse-wrap">';
  h += '<h4 class="aspectos-titulo">' + t('astral.aspectosPlan') + '</h4>';
  h += '<button class="btn-aspectos-toggle" id="btn-toggle-aspectos" onclick="(function(b){var t=document.getElementById(\'aspectos-content\');if(t.style.display===\'none\'){t.style.display=\'block\';b.textContent=\'' + t('astral.ocultarTabla') + '\';}else{t.style.display=\'none\';b.textContent=\'' + t('astral.mostrarTabla') + '\';}})(this)">' + t('astral.mostrarTabla') + '</button>';
  h += '<div id="aspectos-content" style="display:none">';
  h += '<div class="aspectos-scroll"><table class="tabla-aspectos"><thead><tr><th>' + t('astral.tablaPlaneta') + '</th><th>' + t('astral.tablaAspecto') + '</th><th>' + t('astral.tablaPlaneta') + '</th><th>' + t('astral.tablaOrbe') + '</th></tr></thead><tbody>';
  for (const x of a) {
    const o = Math.floor(x.orb)+'°'+Math.floor((x.orb%1)*60).toString().padStart(2,'0')+"'";
    const np = t('astral.nombresPlanetarios');
    const p1n = (np && typeof np === 'object' && np[x.p1]) ? np[x.p1] : x.p1;
    const p2n = (np && typeof np === 'object' && np[x.p2]) ? np[x.p2] : x.p2;
    h += `<tr class="${x.clase}"><td>${p1n}</td><td>${x.simbolo} ${tAspecto(x.tipo)}</td><td>${p2n}</td><td>${o}</td></tr>`;
  }
  h += '</tbody></table></div></div></div>';
  return h;
}

function renderStats(s) {
  const items = [
    [t('astral.masculino'),'masc',s.masculine], [t('astral.femenino'),'fem',s.feminine],
    [t('astral.fuego'),'fire',s.fuego], [t('astral.tierra'),'earth',s.tierra],
    [t('astral.aire'),'air',s.aire], [t('astral.agua'),'water',s.agua],
    [t('astral.cardinal'),'',s.cardinal], [t('astral.fijo'),'',s.fixed], [t('astral.mutable'),'',s.mutable],
  ];
  return '<h4>' + t('astral.equilibrioElem') + '</h4><div class="stats-grid">' +
    items.map(([l,c,v])=>`<div class="stat-item"><span class="stat-label ${c}">${l}</span><span class="stat-val">${v}</span></div>`).join('') +
    '</div>';
}

function renderExtra(d) {
  let h = '<h4>' + t('astral.caminoFortuna') + '</h4><div class="extra-grid">';
  if (d.partOfFortune) {
    const p = d.partOfFortune;
    h += `<div class="extra-item"><span class="extra-label">${t('astral.caminoFortunaLabel')}</span><span class="extra-val">${p.signo.simbolo} ${_nombreSigno(p.signo)} ${p.grados}°${p.minutos.toString().padStart(2,'0')}'</span></div>`;
  }
  if (d.southNode) {
    const s = d.southNode;
    h += `<div class="extra-item"><span class="extra-label">${t('astral.nodoSurLabel')}</span><span class="extra-val">${s.signo.simbolo} ${_nombreSigno(s.signo)} ${s.grados}°${s.minutos.toString().padStart(2,'0')}'</span></div>`;
  }
  return h + '</div>';
}

// Genera el texto de copia de la carta astral (sin análisis)
function _textoCopiaCarta(c) {
  const np = t('astral.nombresPlanetarios');
  const getNP = (n) => (np && typeof np === 'object' && np[n]) ? np[n] : n;
  let txt = t('astral.copyHeader') + ' ' + (c.nombre||'').toUpperCase() + '\n' +
    t('astral.copyFecha') + ' ' + c.fecha + '\n' +
    t('astral.copyHora') + ' ' + c.hora + '\n' +
    t('astral.copyLugar') + ' ' + (c.ciudad?c.ciudad.nombre:'') + '\n\n' +
    generarTextoCarta(c) + '\n' + t('astral.copyAspectos') + '\n' +
    c.aspectos.map(a=>getNP(a.p1)+' '+a.simbolo+' '+getNP(a.p2)+' ('+tAspecto(a.tipo)+', orb '+a.orb.toFixed(1)+'°)').join('\n');
  if (c.partOfFortune) txt += "\n\n" + t('copiar.partOfFortune') + " " + _nombreSigno(c.partOfFortune.signo) + ' ' + c.partOfFortune.grados + '°' + c.partOfFortune.minutos + "'";
  if (c.southNode) txt += '\n' + t('copiar.southNode') + ' ' + _nombreSigno(c.southNode.signo) + ' ' + c.southNode.grados + '°' + c.southNode.minutos + "'";
  return txt;
}

// Copiar solo los datos de la carta astral
async function copiar() {
  const c = getUltimaCarta();
  if (!c) { alert('' + t('astral.calculaPrimero') + ''); return; }
  const txt = _textoCopiaCarta(c);
  await _copiarAlPortapapeles(txt);
  _mostrarCopiado('btn-copiar-astral');
}

// Copiar datos de la carta astral + análisis (IA o local)
async function copiarTodo() {
  const c = getUltimaCarta();
  if (!c) { alert('' + t('astral.calculaPrimero') + ''); return; }
  let txt = _textoCopiaCarta(c);
  // Añadir el análisis desde el contenedor astral-interpretacion (IA o local)
  const cont = document.getElementById('astral-interpretacion');
  if (cont && cont.innerText.trim()) {
    txt += '\n\n=== ANÁLISIS ASTRAL ===\n' + cont.innerText.trim();
  }
  await _copiarAlPortapapeles(txt);
  _mostrarCopiado('btn-copiar-astral-todo');
}

// === COMPARTIR CARTA ASTRAL ===
// Comparte solo los datos de la carta astral (sin análisis)
async function compartir() {
  const c = getUltimaCarta();
  if (!c) { alert('' + t('astral.calculaPrimero') + ''); return; }
  const txt = _textoCopiaCarta(c);
  await _compartirTexto(txt);
}

// Comparte datos de la carta astral + análisis (IA o local)
async function compartirTodo() {
  const c = getUltimaCarta();
  if (!c) { alert('' + t('astral.calculaPrimero') + ''); return; }
  let txt = _textoCopiaCarta(c);
  const cont = document.getElementById('astral-interpretacion');
  if (cont && cont.innerText.trim()) {
    txt += '\n\n=== ANÁLISIS ASTRAL ===\n' + cont.innerText.trim();
  }
  await _compartirTexto(txt);
}

// Abre el menú "Compartir" de Android (Intent.ACTION_SEND) con fallback a Web Share API
// y, si ninguno está disponible, copia al portapapeles como último recurso.
let _compartiendoAstral = false;
async function _compartirTexto(txt) {
  if (_compartiendoAstral) return; // Evita lanzar varios choosers apilados
  _compartiendoAstral = true;
  setTimeout(() => { _compartiendoAstral = false; }, 1500);
  // 1. Puente nativo Android (JavascriptInterface en MainActivity.java)
  try {
    if (window.AndroidShare && typeof window.AndroidShare.share === 'function') {
      window.AndroidShare.share(txt);
      return;
    }
  } catch (e) {
    console.warn('AndroidShare no disponible:', e);
  }
  // 2. Fallback: Web Share API
  if (navigator.share) {
    try { await navigator.share({ text: txt }); } catch (e) { console.warn('share cancelado:', e); }
    return;
  }
  // 3. Último recurso: copiar al portapapeles
  await _copiarAlPortapapeles(txt);
  _mostrarCopiado('btn-copiar-astral');
}

// Copia al portapapeles usando el puente nativo de Android (JavascriptInterface)
// con fallback a APIs web.
async function _copiarAlPortapapeles(txt) {
  // 1. Puente nativo Android (JavascriptInterface en MainActivity.java)
  try {
    if (window.AndroidClipboard && typeof window.AndroidClipboard.copy === 'function') {
      window.AndroidClipboard.copy(txt);
      return;
    }
  } catch (e) {
    console.warn('AndroidClipboard no disponible:', e);
  }
  // 2. Fallback: navigator.clipboard API
  try {
    await navigator.clipboard.writeText(txt);
    return;
  } catch (e2) {
    console.warn('navigator.clipboard no disponible:', e2);
  }
  // 3. Fallback final: textarea + execCommand
  try {
    const ta = document.createElement('textarea');
    ta.value = txt;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  } catch (e3) {
    console.error('No se pudo copiar al portapapeles:', e3);
  }
}

// Feedback visual de "✓ Copiado" en un botón (y también en el otro botón copiar)
function _mostrarCopiado(btnIdPrincipal) {
  const btns = ['btn-copiar-astral', 'btn-copiar-astral-todo'];
  btns.forEach(id => {
    const b = document.getElementById(id);
    if (b) {
      // Guardar el texto original solo si no estamos ya en estado "copiado"
      if (!b.dataset.originalTxt) {
        b.dataset.originalTxt = b.innerHTML;
      }
      b.innerHTML = t('astral.copiado') || '✓ Copiado';
      clearTimeout(b._copiadoTimer);
      b._copiadoTimer = setTimeout(() => {
        if (b.dataset.originalTxt) {
          b.innerHTML = b.dataset.originalTxt;
          delete b.dataset.originalTxt;
        }
      }, 2000);
    }
  });
}

// Info interactiva de la rueda
function mostrarInfoPlaneta(idx) {
  const c = getUltimaCarta(); if (!c) return;
  const p = c.planetas[idx]; if (!p) return;
  const np = t('astral.nombresPlanetarios');
  const nombreP = (np && typeof np === 'object' && np[p.nombre]) ? np[p.nombre] : p.nombre;
  const signoIdx = Math.floor(((p.signo.longitud || p.longitud) % 360 + 360) % 360 / 30);
  const sT = tSigno(signoIdx);
  const nombreS = sT?.nombre || p.signo.nombre;
  const elemS = sT?.elemento || p.signo.elemento;
  const modS = sT?.modalidad || p.signo.modalidad;
  document.getElementById('astral-wheel-info').innerHTML =
    `<div style="color:var(--gold);font-weight:bold;">${p.simbolo} ${nombreP} en ${p.signo.simbolo} ${nombreS}</div>` +
    `<div>${t('astral.posicion')}: ${p.grados}°${p.minutos.toString().padStart(2,'0')}' ${nombreS}${p.retro?' (R)':''}</div>` +
    `<div>${t('astral.casa')} ${p.casa}${p.esAngulo?' ('+p.etiquetaAngulo+')':''}</div>` +
    `<div>${t('astral.elemento')}: ${elemS} · ${t('astral.modalidad')}: ${modS}</div>`;
}
function mostrarInfoAspecto(idx) {
  const c = getUltimaCarta(); if (!c) return;
  const a = c.aspectos[idx]; if (!a) return;
  const np = t('astral.nombresPlanetarios');
  const p1n = (np && typeof np === 'object' && np[a.p1]) ? np[a.p1] : a.p1;
  const p2n = (np && typeof np === 'object' && np[a.p2]) ? np[a.p2] : a.p2;
  document.getElementById('astral-wheel-info').innerHTML =
    `<div style="color:var(--gold);font-weight:bold;">${p1n} ${a.simbolo} ${p2n}</div>` +
    `<div>${t('astral.tipo')}: ${tAspecto(a.tipo)} (${a.anguloExacto}°)</div><div>${t('astral.orbe')}: ${a.orb.toFixed(2)}°</div>`;
}
function mostrarInfoSigno(idx) {
  if (!SIGNOS[idx]) return;
  const s = SIGNOS[idx];
  const sT = tSigno(idx);
  document.getElementById('astral-wheel-info').innerHTML =
    `<div style="color:var(--gold);font-weight:bold;">${s.simbolo} ${sT?.nombre || s.nombre}</div>` +
    `<div>${t('astral.elemento')}: ${sT?.elemento || s.elemento}</div><div>${t('astral.modalidad')}: ${sT?.modalidad || s.modalidad}</div><div>${t('astral.regente')}: ${sT?.regente || s.regente}</div>`;
}
function mostrarInfoCasa(idx) {
  const c = getUltimaCarta(); if (!c) return;
  const ci = c.casasInfo[idx]; if (!ci) return;
  const ps = c.planetas.filter(p=>p.casa===ci.numero);
  const np = t('astral.nombresPlanetarios');
  const psNombres = ps.map(p => {
    const nombreP = (np && typeof np === 'object' && np[p.nombre]) ? np[p.nombre] : p.nombre;
    return p.simbolo + ' ' + nombreP;
  }).join(', ');
  document.getElementById('astral-wheel-info').innerHTML =
    `<div style="color:var(--gold);font-weight:bold;">${t('astral.casa')} ${CASAS_ROMANAS[idx]}${ci.esAngulo?' ('+ci.etiqueta+')':''}</div>` +
    `<div>${t('astral.cuspide')}: ${ci.signo.simbolo} ${_nombreSigno(ci.signo)} ${ci.grados}°${ci.minutos.toString().padStart(2,'0')}'</div>` +
    `<div>${t('astral.planetas')}: ${ps.length ? psNombres : t('astral.ninguno')}</div>`;
}