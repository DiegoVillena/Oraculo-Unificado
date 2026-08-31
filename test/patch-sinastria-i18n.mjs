// test/patch-sinastria-i18n.mjs — FASE 2B i18n, defensivo e idempotente.
// 1) datos-maestros-{loc}.json: astrologia.aspectos.Quincunx + glosario.aspectos.Quincunx
// 2) {loc}.json: sinastria.horaDesconocida + sinastria.disclaimerScore
// Uso: node test/patch-sinastria-i18n.mjs [--write]
import { readFileSync, writeFileSync } from 'fs';

const WRITE = process.argv.includes('--write');
const esc = (s) => JSON.stringify(s);

const DM = {
  es: { asp: 'Quincuncio', glo: 'Ajuste incómodo (150°): energías que se rozan y piden adaptación constante.' },
  en: { asp: 'Quincunx',  glo: 'Awkward adjustment (150°): energies that rub and demand constant adaptation.' },
  pt: { asp: 'Quincúncio', glo: 'Ajuste incômodo (150°): energias que se roçam e pedem adaptação constante.' },
  fr: { asp: 'Quinconce', glo: 'Ajustement inconfortable (150°) : des énergies qui se frottent et demandent une adaptation constante.' },
  de: { asp: 'Quinkunx',  glo: 'Unbequeme Anpassung (150°): Energien, die aneinander reiben und ständige Anpassung verlangen.' },
  it: { asp: 'Quinconce', glo: 'Aggiustamento scomodo (150°): energie che si sfregano e chiedono adattamento costante.' },
};

const SIN = {
  es: {
    horaDesconocida: '⚠️ Hora de nacimiento aproximada o desconocida en al menos una carta: se muestran solo los aspectos entre planetas (sin casas, Ascendente ni Compromiso Casa 7), y la carta compuesta se limita a los planetas. Para máxima precisión, calcula ambas cartas con la hora exacta.',
    disclaimerScore: 'Índice orientativo: resume cómo dialogan las dos cartas; la relación real depende de vosotros.',
  },
  en: {
    horaDesconocida: '⚠️ Approximate or unknown birth time in at least one chart: only planet-to-planet aspects are shown (no houses, Ascendant or House-7 Commitment), and the composite chart is limited to planets. For maximum precision, calculate both charts with the exact time.',
    disclaimerScore: 'Indicative index: it summarizes how the two charts dialogue; the real relationship depends on you both.',
  },
  pt: {
    horaDesconocida: '⚠️ Hora de nascimento aproximada ou desconhecida em pelo menos um mapa: são mostrados apenas os aspectos entre planetas (sem casas, Ascendente nem Compromisso Casa 7), e o mapa composto limita-se aos planetas. Para máxima precisão, calcule ambos com a hora exata.',
    disclaimerScore: 'Índice orientativo: resume como os dois mapas dialogam; a relação real depende de vocês.',
  },
  fr: {
    horaDesconocida: "⚠️ Heure de naissance approximative ou inconnue pour au moins une carte : seuls les aspects entre planètes sont affichés (sans maisons, Ascendant ni Engagement Maison 7), et la carte composite se limite aux planètes. Pour une précision maximale, calculez les deux cartes avec l'heure exacte.",
    disclaimerScore: "Indice indicatif : il résume le dialogue des deux cartes ; la vraie relation dépend de vous deux.",
  },
  de: {
    horaDesconocida: '⚠️ Ungefähre oder unbekannte Geburtszeit in mindestens einer Karte: Es werden nur Aspekte zwischen Planeten gezeigt (keine Häuser, kein Aszendent, kein Commitment Haus 7), und die Composit-Karte beschränkt sich auf Planeten. Für maximale Präzision beide Karten mit der exakten Uhrzeit berechnen.',
    disclaimerScore: 'Orientierender Index: Er fasst zusammen, wie die beiden Karten miteinander sprechen; die echte Beziehung liegt bei euch.',
  },
  it: {
    horaDesconocida: "⚠️ Ora di nascita approssimata o sconosciuta in almeno una carta: vengono mostrati solo gli aspetti tra pianeti (senza case, Ascendente né Impegno Casa 7) e la carta composta è limitata ai pianeti. Per la massima precisione, calcola entrambe le carte con l'ora esatta.",
    disclaimerScore: 'Indice orientativo: riassume come dialogano le due carte; la relazione reale dipende da voi.',
  },
};

// Inserta una clave "K": V en el objeto que empieza en la línea iStart,
// justo antes de su llave de cierre. Devuelve [lines, ok].
function insertarEnObjeto(lines, iStart, clave, valor, indent) {
  if (lines.slice(iStart).join('\n').slice(0, 4000).includes(`"${clave}"`)) return [lines, 'ya-existe'];
  let depth = 0;
  for (let i = iStart; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{') depth++;
      if (ch === '}') {
        depth--;
        if (depth === 0) {
          // La llave de cierre está en la línea i. Insertar antes de ella.
          const linea = lines[i];
          const j = linea.indexOf('}');
          let antes = linea.slice(0, j).replace(/\s+$/, '');
          // Asegurar coma al final del contenido previo
          const iPrev = antes.trimEnd().length - 1;
          const ultimaLineaConContenido = antes.trimEnd();
          if (ultimaLineaConContenido && !ultimaLineaConContenido.endsWith('{') && !ultimaLineaConContenido.endsWith(',')) {
            lines[i - (linea === antes ? 1 : 0)] = lines[i]; // noop
          }
          const pre = linea.slice(0, j);
          // Si todo el objeto cabe en la misma línea ({...}), añadir inline
          if (pre.includes('{')) {
            let base = pre.trimEnd();
            if (!base.endsWith('{') && !base.endsWith(',')) base += ',';
            lines[i] = `${base} "${clave}": ${esc(valor)}${linea.slice(j)}`;
          } else {
            // multilínea: la coma la lleva la entrada anterior (línea i-1)
            let k = i - 1;
            while (k > iStart && !lines[k].trim()) k--;
            if (!lines[k].trimEnd().endsWith(',')) lines[k] = lines[k].trimEnd() + ',';
            lines.splice(i, 0, `${indent}"${clave}": ${esc(valor)}`);
          }
          return [lines, 'ok'];
        }
      }
    }
  }
  return [lines, 'no-cierre'];
}

let fallo = false;

for (const loc of Object.keys(DM)) {
  const p = `js/i18n/locales/datos-maestros-${loc}.json`;
  let lines = readFileSync(p, 'utf8').split('\n');
  // Bloque astrologia.aspectos
  let iAst = lines.findIndex(l => /"astrologia"\s*:\s*\{/.test(l));
  let iAsp = lines.findIndex((l, i) => i > iAst && /"aspectos"\s*:\s*\{/.test(l));
  let r1 = insertarEnObjeto(lines, iAsp, 'Quincunx', DM[loc].asp, '      ');
  lines = r1[0];
  // Bloque glosario.aspectos
  let iGlo = lines.findIndex(l => /"glosario"\s*:\s*\{/.test(l));
  let iGA = lines.findIndex((l, i) => i > iGlo && /"aspectos"\s*:\s*\{/.test(l));
  let r2 = insertarEnObjeto(lines, iGA, 'Quincunx', DM[loc].glo, '        ');
  lines = r2[0];
  const out = lines.join('\n');
  try { JSON.parse(out); } catch (e) { console.error(loc, 'JSON INVÁLIDO:', e.message); fallo = true; continue; }
  if (WRITE) writeFileSync(p, out);
  console.log(loc, 'datos-maestros:', r1[1], r2[1], WRITE ? '(escrito)' : '(dry)');
}

for (const loc of Object.keys(SIN)) {
  const p = `js/i18n/locales/${loc}.json`;
  let lines = readFileSync(p, 'utf8').split('\n');
  let iS = lines.findIndex(l => /"sinastria"\s*:\s*\{/.test(l));
  let r3 = insertarEnObjeto(lines, iS, 'horaDesconocida', SIN[loc].horaDesconocida, '    ');
  lines = r3[0];
  iS = lines.findIndex(l => /"sinastria"\s*:\s*\{/.test(l));
  let r4 = insertarEnObjeto(lines, iS, 'disclaimerScore', SIN[loc].disclaimerScore, '    ');
  lines = r4[0];
  const out = lines.join('\n');
  try { JSON.parse(out); } catch (e) { console.error(loc, 'JSON INVÁLIDO:', e.message); fallo = true; continue; }
  if (WRITE) writeFileSync(p, out);
  console.log(loc, 'locale sinastria:', r3[1], r4[1], WRITE ? '(escrito)' : '(dry)');
}
if (fallo) process.exit(1);
console.log('FIN', WRITE ? '— CAMBIOS ESCRITOS' : '— DRY RUN (sin escribir)');
