// scripts/test-timezone.js — Tests de offset horario histórico (DST)
// Valida que obtenerOffsetTZ maneja correctamente los cambios de horario
// de verano/invierno en distintas épocas.
//
// Ejecutar: node scripts/test-timezone.js

// Implementación de obtenerOffsetTZ (idéntica a js/data/sqlite-db.js)
function obtenerOffsetTZ(tzIANA, ano, mes, dia, hora, min) {
  if (!tzIANA || typeof Intl === 'undefined') return null;

  try {
    const fecha = new Date(Date.UTC(ano, mes, dia, hora, min, 0));
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tzIANA,
      timeZoneName: 'shortOffset'
    });
    const parts = dtf.formatToParts(fecha);
    const offsetPart = parts.find(p => p.type === 'timeZoneName');
    if (offsetPart) {
      const val = offsetPart.value;
      const m = val.match(/(?:GMT|UTC)([+-])(\d{1,2})(?::(\d{2}))?/);
      if (m) {
        const sign = m[1] === '+' ? 1 : -1;
        const h = parseInt(m[2]);
        const min2 = m[3] ? parseInt(m[3]) : 0;
        return sign * (h + min2 / 60);
      }
    }
  } catch (e) { /* fallback */ }

  const fecha = new Date(Date.UTC(ano, mes, dia, hora, min, 0));
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tzIANA,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
  const parts = dtf.formatToParts(fecha);
  const obj = {};
  parts.forEach(p => { if (p.type !== 'literal') obj[p.type] = p.value; });
  let hourVal = parseInt(obj.hour);
  if (hourVal === 24) hourVal = 0;
  const localUTC = Date.UTC(
    parseInt(obj.year), parseInt(obj.month) - 1, parseInt(obj.day),
    hourVal, parseInt(obj.minute), parseInt(obj.second)
  );
  const offsetMs = localUTC - fecha.getTime();
  return offsetMs / (1000 * 60 * 60);
}

// === CASOS DE PRUEBA ===

const tests = [
  {
    nombre: 'Madrid, verano 1985 (CEST = UTC+2)',
    tzIANA: 'Europe/Madrid',
    ano: 1985, mes: 6, dia: 15, hora: 12, min: 0,  // 15 julio 1985
    esperado: 2.0,
    descripcion: 'En verano, España usa CEST (Central European Summer Time) = UTC+2'
  },
  {
    nombre: 'Madrid, invierno 2010 (CET = UTC+1)',
    tzIANA: 'Europe/Madrid',
    ano: 2010, mes: 0, dia: 15, hora: 12, min: 0,  // 15 enero 2010
    esperado: 1.0,
    descripcion: 'En invierno, España usa CET (Central European Time) = UTC+1'
  },
  {
    nombre: 'Londres, verano 1990 (BST = UTC+1)',
    tzIANA: 'Europe/London',
    ano: 1990, mes: 6, dia: 15, hora: 12, min: 0,  // 15 julio 1990
    esperado: 1.0,
    descripcion: 'En verano, Reino Unido usa BST (British Summer Time) = UTC+1'
  }
];

// === EJECUCIÓN ===

console.log('=== Tests de Timezone Histórico (DST) ===\n');

let pasados = 0;
let fallidos = 0;

tests.forEach(t => {
  const resultado = obtenerOffsetTZ(t.tzIANA, t.ano, t.mes, t.dia, t.hora, t.min);
  const ok = Math.abs(resultado - t.esperado) < 0.01;

  if (ok) {
    pasados++;
    console.log(`✅ ${t.nombre}`);
    console.log(`   Offset: +${resultado}h (esperado +${t.esperado}h) — ${t.descripcion}\n`);
  } else {
    fallidos++;
    console.log(`❌ ${t.nombre}`);
    console.log(`   Offset: ${resultado}h (esperado ${t.esperado}h) — ${t.descripcion}\n`);
  }
});

console.log('=== Resumen ===');
console.log(`✅ Pasados: ${pasados}/${tests.length}`);
console.log(`❌ Fallidos: ${fallidos}/${tests.length}`);

if (fallidos > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 Todos los tests pasan correctamente.');
}