// test/patch-datos-maestros.mjs — inserta las nuevas claves narrativa de FASE 1.2
// en los 6 datos-maestros, tras la línea "s6_cierre" (nivel 3 de indentación).
import { readFileSync, writeFileSync } from 'fs';

const NUEVAS = {
  es: {
    s2b_stelliumSigno: "Casi todos los caminos de tu carta convergen en <strong>${signo}</strong>: ${planetasLista}. Toda esa energía se tiñe de ${sqSigno}, convirtiendo este signo en el acento dominante de tu personalidad.",
    s2b_tsquare: "Tu carta dibuja una <strong>T-cuadrada</strong> entre ${p1} y ${p2}, con ${p3} en el vértice: un triángulo de tensión que te sacude para no dormirte y que, bien vivida, se convierte en tu mayor motor de realización.",
    s2b_granTrigono: "También hay un <strong>gran trígono de ${elemento}</strong> formado por ${planetasLista}: un círculo de gracia donde tu energía fluye sin obstáculos; tu reto es no dormirte en la comodidad y poner ese don al servicio de algo concreto.",
    s4_don: "🎁 <strong>Don natural:</strong>",
    s4_motor: "🔥 <strong>Motor de crecimiento:</strong>",
    s4_desc_asc: "la forma en que te muestras al mundo",
    s4_desc_mc: "tus metas y tu imagen pública",
    s5_nodoNCasa: "Y ese camino evolutivo se juega sobre todo en el terreno de ${area}, la zona de tu vida donde se te pide crecer aunque al principio incomode.",
    s5_quiron: "Tu herida y tu don sanador viven en <strong>Quirón en ${signo}</strong>: ${sqSigno}. Lo que una vez dolió en ${area} es exactamente donde puedes ayudar a sanar a otros.",
    s6_weak: "Cultiva conscientemente el elemento ${weakEl} (${etWeak}): es tu asignatura pendiente energética.",
    s6_tenso: "Y recuerda que la fricción entre ${p1} y ${p2} no es tu enemiga: es el filo que te hace crecer.",
  },
  en: {
    s2b_stelliumSigno: "Almost every path in your chart converges on <strong>${signo}</strong>: ${planetasLista}. All that energy is colored by ${sqSigno}, making this sign the dominant accent of your personality.",
    s2b_tsquare: "Your chart draws a <strong>T-square</strong> between ${p1} and ${p2}, with ${p3} at the apex: a triangle of tension that shakes you awake and, well lived, becomes your greatest engine of achievement.",
    s2b_granTrigono: "There is also a <strong>grand ${elemento} trine</strong> formed by ${planetasLista}: a circle of grace where your energy flows without obstacles; your challenge is not to fall asleep in comfort but to put that gift to work on something concrete.",
    s4_don: "🎁 <strong>Natural gift:</strong>",
    s4_motor: "🔥 <strong>Growth engine:</strong>",
    s4_desc_asc: "the way you show yourself to the world",
    s4_desc_mc: "your goals and public image",
    s5_nodoNCasa: "And that evolutionary path plays out mainly in the realm of ${area}, the zone of your life where you are asked to grow, even when it feels uncomfortable at first.",
    s5_quiron: "Your wound and your healing gift live in <strong>Chiron in ${signo}</strong>: ${sqSigno}. What once hurt in ${area} is exactly where you can help others heal.",
    s6_weak: "Consciously cultivate the ${weakEl} element (${etWeak}): it is your pending energetic assignment.",
    s6_tenso: "And remember that the friction between ${p1} and ${p2} is not your enemy: it is the edge that makes you grow.",
  },
  pt: {
    s2b_stelliumSigno: "Quase todos os caminhos do seu mapa convergem para <strong>${signo}</strong>: ${planetasLista}. Toda essa energia se tinge de ${sqSigno}, tornando este signo o sotaque dominante da sua personalidade.",
    s2b_tsquare: "O seu mapa desenha um <strong>T-quadrado</strong> entre ${p1} e ${p2}, com ${p3} no vértice: um triângulo de tensão que o sacode para não adormecer e que, bem vivido, se torna o seu maior motor de realização.",
    s2b_granTrigono: "Há também um <strong>grande trígono de ${elemento}</strong> formado por ${planetasLista}: um círculo de graça onde a sua energia flui sem obstáculos; o seu desafio é não adormecer no conforto e colocar esse dom ao serviço de algo concreto.",
    s4_don: "🎁 <strong>Dom natural:</strong>",
    s4_motor: "🔥 <strong>Motor de crescimento:</strong>",
    s4_desc_asc: "a forma como você se mostra ao mundo",
    s4_desc_mc: "as suas metas e a sua imagem pública",
    s5_nodoNCasa: "E esse caminho evolutivo joga-se sobretudo no terreno de ${area}, a zona da sua vida onde lhe é pedido crescer, mesmo que no início incomode.",
    s5_quiron: "A sua ferida e o seu dom de cura vivem em <strong>Quíron em ${signo}</strong>: ${sqSigno}. O que um dia doeu em ${area} é exatamente onde você pode ajudar a curar os outros.",
    s6_weak: "Cultive conscientemente o elemento ${weakEl} (${etWeak}): é a sua tarefa energética pendente.",
    s6_tenso: "E lembre-se de que a fricção entre ${p1} e ${p2} não é sua inimiga: é o fio que o faz crescer.",
  },
  fr: {
    s2b_stelliumSigno: "Presque tous les chemins de ta carte convergent vers <strong>${signo}</strong> : ${planetasLista}. Toute cette énergie se teinte de ${sqSigno}, faisant de ce signe l'accent dominant de ta personnalité.",
    s2b_tsquare: "Ta carte dessine un <strong>carré en T</strong> entre ${p1} et ${p2}, avec ${p3} au sommet : un triangle de tension qui te secoue pour ne pas t'endormir et qui, bien vécu, devient ton plus grand moteur de réalisation.",
    s2b_granTrigono: "Il y a aussi un <strong>grand trigone de ${elemento}</strong> formé par ${planetasLista} : un cercle de grâce où ton énergie coule sans obstacle ; ton défi est de ne pas t'endormir dans le confort et de mettre ce don au service de quelque chose de concret.",
    s4_don: "🎁 <strong>Don naturel :</strong>",
    s4_motor: "🔥 <strong>Moteur de croissance :</strong>",
    s4_desc_asc: "la manière dont tu te montres au monde",
    s4_desc_mc: "tes objectifs et ton image publique",
    s5_nodoNCasa: "Et ce chemin évolutif se joue surtout sur le terrain de ${area}, la zone de ta vie où l'on te demande de grandir, même si cela dérange au début.",
    s5_quiron: "Ta blessure et ton don de guérison vivent en <strong>Chiron en ${signo}</strong> : ${sqSigno}. Ce qui a un jour fait mal dans ${area} est exactement l'endroit où tu peux aider les autres à guérir.",
    s6_weak: "Cultive consciemment l'élément ${weakEl} (${etWeak}) : c'est ton devoir énergétique en suspens.",
    s6_tenso: "Et souviens-toi que la friction entre ${p1} et ${p2} n'est pas ton ennemie : c'est le fil qui te fait grandir.",
  },
  de: {
    s2b_stelliumSigno: "Fast alle Wege deiner Karte laufen in <strong>${signo}</strong> zusammen: ${planetasLista}. All diese Energie färbt sich mit ${sqSigno} — dieses Zeichen wird zum dominanten Akzent deiner Persönlichkeit.",
    s2b_tsquare: "Deine Karte zeichnet ein <strong>T-Quadrat</strong> zwischen ${p1} und ${p2}, mit ${p3} am Scheitel: ein Spannungsdreieck, das dich wachrüttelt und — gut gelebt — zu deinem größten Motor der Verwirklichung wird.",
    s2b_granTrigono: "Es gibt außerdem ein <strong>großes ${elemento}-Trigon</strong>, gebildet von ${planetasLista}: ein Kreis der Gnade, in dem deine Energie ohne Hindernisse fließt; deine Herausforderung ist, nicht in Bequemlichkeit einzuschlafen, sondern diese Gabe für etwas Konkretes zu nutzen.",
    s4_don: "🎁 <strong>Natürliche Gabe:</strong>",
    s4_motor: "🔥 <strong>Wachstumsmotor:</strong>",
    s4_desc_asc: "die Art, wie du dich der Welt zeigst",
    s4_desc_mc: "deine Ziele und dein öffentliches Bild",
    s5_nodoNCasa: "Und dieser Entwicklungsweg spielt sich vor allem auf dem Gebiet von ${area} ab — der Zone deines Lebens, in der du wachsen sollst, auch wenn es sich anfangs unbequem anfühlt.",
    s5_quiron: "Deine Wunde und deine heilende Gabe leben in <strong>Chiron in ${signo}</strong>: ${sqSigno}. Was einst wehtat in ${area}, ist genau der Ort, an dem du anderen helfen kannst zu heilen.",
    s6_weak: "Kultiviere bewusst das Element ${weakEl} (${etWeak}): Es ist deine ausstehende energetische Aufgabe.",
    s6_tenso: "Und denk daran: Die Reibung zwischen ${p1} und ${p2} ist nicht dein Feind — sie ist die Schneide, die dich wachsen lässt.",
  },
  it: {
    s2b_stelliumSigno: "Quasi tutti i cammini della tua carta convergono in <strong>${signo}</strong>: ${planetasLista}. Tutta questa energia si tinge di ${sqSigno}, rendendo questo segno l'accento dominante della tua personalità.",
    s2b_tsquare: "La tua carta disegna un <strong>quadrato a T</strong> tra ${p1} e ${p2}, con ${p3} al vertice: un triangolo di tensione che ti scuote per non farti addormentare e che, ben vissuto, diventa il tuo più grande motore di realizzazione.",
    s2b_granTrigono: "C'è anche un <strong>grande trigono di ${elemento}</strong> formato da ${planetasLista}: un cerchio di grazia in cui la tua energia scorre senza ostacoli; la tua sfida è non addormentarti nella comodità e mettere quel dono al servizio di qualcosa di concreto.",
    s4_don: "🎁 <strong>Dono naturale:</strong>",
    s4_motor: "🔥 <strong>Motore di crescita:</strong>",
    s4_desc_asc: "il modo in cui ti mostri al mondo",
    s4_desc_mc: "i tuoi obiettivi e la tua immagine pubblica",
    s5_nodoNCasa: "E quel cammino evolutivo si gioca soprattutto sul terreno di ${area}, la zona della tua vita in cui ti si chiede di crescere, anche se all'inizio risulta scomodo.",
    s5_quiron: "La tua ferita e il tuo dono di guarigione vivono in <strong>Chirone in ${signo}</strong>: ${sqSigno}. Ciò che un tempo ha fatto male in ${area} è esattamente dove puoi aiutare gli altri a guarire.",
    s6_weak: "Coltiva consapevolmente l'elemento ${weakEl} (${etWeak}): è il tuo compito energetico in sospeso.",
    s6_tenso: "E ricorda che l'attrito tra ${p1} e ${p2} non è tuo nemico: è il filo che ti fa crescere.",
  },
};

const esc = (s) => JSON.stringify(s); // escapa comillas correctamente

for (const loc of Object.keys(NUEVAS)) {
  const p = `js/i18n/locales/datos-maestros-${loc}.json`;
  const lines = readFileSync(p, 'utf8').split('\n');
  const idx = lines.findIndex(l => l.includes('"s6_cierre"'));
  if (idx < 0) { console.error(loc, 'NO s6_cierre'); process.exit(1); }
  const nuevas = Object.entries(NUEVAS[loc]).map(([k, v]) => `      "${k}": ${esc(v)},`);
  lines.splice(idx + 1, 0, ...nuevas);
  const out = lines.join('\n');
  JSON.parse(out); // valida
  writeFileSync(p, out);
  console.log(loc, 'OK +', nuevas.length, 'claves');
}
console.log('FIN: todas las claves FASE 1.2 insertadas y JSON válido');
