// test/patch-tarot-i18n.mjs — FASE 3 i18n: claves nuevas en el bloque
// analisisTarot de los 6 datos-maestros. Inserta cada clave tras la apertura
// de su sub-bloque (visionGeneral, iching, dinamicas, dignidades, narrativa,
// recomendacion). Idempotente (salta claves ya existentes).
import { readFileSync, writeFileSync } from 'fs';

const P = {
  es: {
    visionGeneral: {
      cruceKw: 'Estas cartas hablan directamente de tu pregunta: ${cartas}.',
      elDominante: 'El elemento ${el} domina la tirada (${c} de ${total} cartas): ${texto}.',
      elCarencia: 'La ausencia de ${el} (${texto}) señala lo que la situación te pide cultivar conscientemente.',
      elTexto: {
        fuego: { label: 'Fuego', texto: 'acción, impulso e iniciativa' },
        aire: { label: 'Aire', texto: 'mente, palabra e ideas' },
        agua: { label: 'Agua', texto: 'emoción, intuición y vínculos' },
        tierra: { label: 'Tierra', texto: 'lo concreto, el cuerpo y lo material' },
      },
    },
    iching: { temas: ' Temas del hexagrama: ${kw}.' },
    dinamicas: {
      sotas: 'Varias Sotas: mensajes y aprendizajes en marcha; la curiosidad está activa.',
      caballeros: 'Varios Caballeros: movimiento y acción; las cosas avanzan rápido.',
      secuencia: 'Secuencia arquetípica: ${a} → ${b} — ${frase}',
      numeroSig: {
        '2': 'dualidad, cooperación y equilibrio', '3': 'expansión, creatividad y expresión',
        '4': 'estructura, orden y cimientos', '5': 'cambio, crisis y aprendizaje por la tensión',
        '6': 'armonía, responsabilidad y cuidado', '7': 'introspección, búsqueda y saber interior',
        '8': 'poder, manifestación y gestión', '9': 'cierre, culminación y entrega',
        '10': 'completitud que reinicia el ciclo',
      },
      secuencias: {
        'La Torre>La Estrella': 'tras la ruina, la esperanza se reconstruye',
        'La Torre>El Sol': 'la caída de lo viejo abre paso a la claridad',
        'La Muerte>La Estrella': 'el final precede a una renovación serena',
        'El Diablo>La Templanza': 'de la atadura se pasa al equilibrio que sana',
        'El Diablo>La Estrella': 'reconocer la atadura es el primer paso hacia la liberación',
        'El Colgado>La Muerte': 'lo que soltaste culmina en transformación real',
        'La Luna>El Sol': 'de la confusión se desemboca en plena claridad',
        'La Luna>El Juicio': 'lo difuso madura hasta un llamado claro',
        'El Ermitaño>La Rueda de la Fortuna': 'la retirada prepara un giro del destino',
        '10 de Espadas>As de Copas': 'tras tocar fondo, nace un sentimiento nuevo',
      },
    },
    dignidades: {
      parPosAmigable: 'En el eje ${pos1} ↔ ${pos2} hay apoyo elemental (${a} + ${b}): ${c1} y ${c2} se refuerzan mutuamente.',
      parPosTenso: 'En el eje ${pos1} ↔ ${pos2} hay roce elemental (${a} vs ${b}): ${c1} y ${c2} piden integración.',
      nuanceInv: ' Con la inversión presente, ese matiz se vive primero por dentro.',
    },
    narrativa: {
      arcoTres: 'El hilo conecta tres tiempos: ${c0} deja como herencia que "${s0}"; en el ahora, ${c1} declara que "${s1}"; y la tendencia que se abre es ${c2}: "${s2}".',
      cruzNucleo: 'Tu corazón ahora es ${c1} —"${s1}"—, y la fuerza que se cruza es ${c2} —"${s2}"—: ahí se libra la cuestión central.',
      cruzRaiz: 'Vienes de ${c4} —"${s4}"—, y lo que ya se aproxima es ${c6} —"${s6}"—.',
      cruzMeta: 'Tu meta consciente apunta a ${c5} —"${s5}"—, mientras la dirección de fondo desemboca en ${c10} —"${s10}"—.',
      cruzMetaInv: ' La inversión de ${c10} sugiere que ese desenlace pide primero un ajuste interior.',
      unaArquetipo: 'Su arquetipo, ${arq}, condensa la energía del momento.',
    },
    recomendacion: {
      base: {
        love: 'En lo afectivo, la respuesta pasa por honestar lo que sientes en voz alta.',
        money: 'En lo material, traduce la intuición en un paso concreto y medible.',
        conflict: 'Ante el conflicto, gana claridad interior antes que razón: nombra el fondo real.',
        work: 'En lo laboral, alinea la acción visible con lo que la carta de resultado señala.',
        decision: 'Ante la encrucijada, elige la opción más cercana a tu eje y suelta el resto.',
        health: 'Para tu bienestar, escucha al cuerpo antes que al deber.',
        change: 'En plena transición, no fuerces el viejo molde: acompaña el movimiento.',
        fear: 'Ante el miedo, nómbralo: lo que se nombra pierde fuerza.',
        general: 'Actúa combinando la escucha interior con un paso práctico pequeño y visible.',
      },
      matizAlta: ' Con tantas invertidas (${pct}%), primero integras por dentro y luego actúas fuera.',
      matizMedia: ' Las invertidas presentes avisan de que alguna energía aún se está acomodando.',
      accion: ' La energía que te pide el día: ${kw1} y ${kw2}.',
      consejoHex: ' El hexagrama futuro añade: ${consejo}.',
    },
  },
  en: {
    visionGeneral: {
      cruceKw: 'These cards speak directly to your question: ${cartas}.',
      elDominante: 'The ${el} element dominates the reading (${c} of ${total} cards): ${texto}.',
      elCarencia: 'The absence of ${el} (${texto}) shows what the situation asks you to consciously cultivate.',
      elTexto: {
        fuego: { label: 'Fire', texto: 'action, drive and initiative' },
        aire: { label: 'Air', texto: 'mind, words and ideas' },
        agua: { label: 'Water', texto: 'emotion, intuition and bonds' },
        tierra: { label: 'Earth', texto: 'the concrete, the body and the material' },
      },
    },
    iching: { temas: ' Hexagram themes: ${kw}.' },
    dinamicas: {
      sotas: 'Several Pages: messages and learning in motion; curiosity is active.',
      caballeros: 'Several Knights: movement and action; things advance quickly.',
      secuencia: 'Archetypal sequence: ${a} → ${b} — ${frase}',
      numeroSig: {
        '2': 'duality, cooperation and balance', '3': 'expansion, creativity and expression',
        '4': 'structure, order and foundations', '5': 'change, crisis and learning through tension',
        '6': 'harmony, responsibility and care', '7': 'introspection, searching and inner knowing',
        '8': 'power, manifestation and management', '9': 'closure, culmination and surrender',
        '10': 'completeness that restarts the cycle',
      },
      secuencias: {
        'La Torre>La Estrella': 'after the ruin, hope rebuilds itself',
        'La Torre>El Sol': 'the fall of the old makes way for clarity',
        'La Muerte>La Estrella': 'the ending precedes a serene renewal',
        'El Diablo>La Templanza': 'from bondage into healing balance',
        'El Diablo>La Estrella': 'naming the chain is the first step to freedom',
        'El Colgado>La Muerte': 'what you released culminates in real transformation',
        'La Luna>El Sol': 'out of confusion, full clarity emerges',
        'La Luna>El Juicio': 'the hazy matures into a clear calling',
        'El Ermitaño>La Rueda de la Fortuna': 'retreat prepares a turn of destiny',
        '10 de Espadas>As de Copas': 'after hitting bottom, a new feeling is born',
      },
    },
    dignidades: {
      parPosAmigable: 'Across ${pos1} ↔ ${pos2} there is elemental support (${a} + ${b}): ${c1} and ${c2} strengthen each other.',
      parPosTenso: 'Across ${pos1} ↔ ${pos2} there is elemental friction (${a} vs ${b}): ${c1} and ${c2} ask for integration.',
      nuanceInv: ' With the reversal present, that nuance is lived inwardly first.',
    },
    narrativa: {
      arcoTres: 'The thread connects three times: ${c0} leaves as its legacy that "${s0}"; in the now, ${c1} states that "${s1}"; and the rising trend is ${c2}: "${s2}".',
      cruzNucleo: 'Your heart right now is ${c1} —"${s1}"— and the crossing force is ${c2} —"${s2}"—: that is where the central question is fought.',
      cruzRaiz: 'You come from ${c4} —"${s4}"— and what is already approaching is ${c6} —"${s6}"—.',
      cruzMeta: 'Your conscious aim points to ${c5} —"${s5}"—, while the underlying direction flows into ${c10} —"${s10}"—.',
      cruzMetaInv: ' The reversal of ${c10} suggests that outcome first asks for an inner adjustment.',
      unaArquetipo: 'Its archetype, ${arq}, distills the energy of the moment.',
    },
    recomendacion: {
      base: {
        love: 'In matters of love, the answer passes through voicing what you truly feel.',
        money: 'In material matters, translate intuition into one concrete, measurable step.',
        conflict: 'Facing conflict, win inner clarity before being right: name the real depth.',
        work: 'In work, align visible action with what the outcome card indicates.',
        decision: 'At the crossroads, choose the option closest to your core and release the rest.',
        health: 'For your wellbeing, listen to your body before your duty.',
        change: 'Mid-transition, do not force the old mold: accompany the movement.',
        fear: 'Facing fear, name it: what is named loses its grip.',
        general: 'Act by combining inner listening with one small, visible practical step.',
      },
      matizAlta: ' With so many reversals (${pct}%), first integrate within, then act outside.',
      matizMedia: ' The reversals present warn that some energy is still settling.',
      accion: ' The energy the day asks of you: ${kw1} and ${kw2}.',
      consejoHex: ' The future hexagram adds: ${consejo}.',
    },
  },
  pt: {
    visionGeneral: {
      cruceKw: 'Estas cartas falam diretamente da sua pergunta: ${cartas}.',
      elDominante: 'O elemento ${el} domina a tiragem (${c} de ${total} cartas): ${texto}.',
      elCarencia: 'A ausência de ${el} (${texto}) mostra o que a situação pede para cultivar conscientemente.',
      elTexto: {
        fuego: { label: 'Fogo', texto: 'ação, impulso e iniciativa' },
        aire: { label: 'Ar', texto: 'mente, palavra e ideias' },
        agua: { label: 'Água', texto: 'emoção, intuição e vínculos' },
        tierra: { label: 'Terra', texto: 'o concreto, o corpo e o material' },
      },
    },
    iching: { temas: ' Temas do hexagrama: ${kw}.' },
    dinamicas: {
      sotas: 'Várias Pajens: mensagens e aprendizagens em marcha; a curiosidade está ativa.',
      caballeros: 'Vários Cavaleiros: movimento e ação; as coisas avançam rápido.',
      secuencia: 'Sequência arquetípica: ${a} → ${b} — ${frase}',
      numeroSig: {
        '2': 'dualidade, cooperação e equilíbrio', '3': 'expansão, criatividade e expressão',
        '4': 'estrutura, ordem e fundações', '5': 'mudança, crise e aprendizado pela tensão',
        '6': 'harmonia, responsabilidade e cuidado', '7': 'introspecção, busca e saber interior',
        '8': 'poder, manifestação e gestão', '9': 'fecho, culminação e entrega',
        '10': 'completude que reinicia o ciclo',
      },
      secuencias: {
        'La Torre>La Estrella': 'depois da ruína, a esperança se reconstrói',
        'La Torre>El Sol': 'a queda do velho abre caminho à clareza',
        'La Muerte>La Estrella': 'o final precede uma renovação serena',
        'El Diablo>La Templanza': 'da prisão ao equilíbrio que sara',
        'El Diablo>La Estrella': 'reconhecer a prisão é o primeiro passo para a libertação',
        'El Colgado>La Muerte': 'o que você soltou culmina em transformação real',
        'La Luna>El Sol': 'da confusão desemboca-se em plena clareza',
        'La Luna>El Juicio': 'o difuso amadurece até um chamado claro',
        'El Ermitaño>La Rueda de la Fortuna': 'o recolhimento prepara um giro do destino',
        '10 de Espadas>As de Copas': 'após tocar o fundo, nasce um sentimento novo',
      },
    },
    dignidades: {
      parPosAmigable: 'No eixo ${pos1} ↔ ${pos2} há apoio elemental (${a} + ${b}): ${c1} e ${c2} se reforçam mutuamente.',
      parPosTenso: 'No eixo ${pos1} ↔ ${pos2} há atrito elemental (${a} vs ${b}): ${c1} e ${c2} pedem integração.',
      nuanceInv: ' Com a inversão presente, essa nuance vive-se primeiro por dentro.',
    },
    narrativa: {
      arcoTres: 'O fio conecta três tempos: ${c0} deixa como herança que "${s0}"; no agora, ${c1} declara que "${s1}"; e a tendência que se abre é ${c2}: "${s2}".',
      cruzNucleo: 'Seu coração agora é ${c1} —"${s1}"— e a força que se cruza é ${c2} —"${s2}"—: aí se disputa a questão central.',
      cruzRaiz: 'Você vem de ${c4} —"${s4}"—, e o que já se aproxima é ${c6} —"${s6}"—.',
      cruzMeta: 'Sua meta consciente aponta para ${c5} —"${s5}"—, enquanto a direção de fundo desemboca em ${c10} —"${s10}"—.',
      cruzMetaInv: ' A inversão de ${c10} sugere que esse desfecho pede primeiro um ajuste interior.',
      unaArquetipo: 'Seu arquétipo, ${arq}, condensa a energia do momento.',
    },
    recomendacion: {
      base: {
        love: 'No afeto, a resposta passa por honestar em voz alta o que você sente.',
        money: 'No material, traduza a intuição num passo concreto e mensurável.',
        conflict: 'Diante do conflito, ganhe clareza interna antes de ter razão: nomeie o fundo real.',
        work: 'No trabalho, alinhe a ação visível com o que a carta de resultado aponta.',
        decision: 'Na encruzilhada, escolha a opção mais próxima do seu eixo e solte o resto.',
        health: 'Para o seu bem-estar, ouça o corpo antes do dever.',
        change: 'Em plena transição, não force o velho molde: acompanhe o movimento.',
        fear: 'Diante do medo, nomeie-o: o que se nomeia perde força.',
        general: 'Atue combinando a escuta interior com um passo prático pequeno e visível.',
      },
      matizAlta: ' Com tantas invertidas (${pct}%), primeiro você integra por dentro, depois age fora.',
      matizMedia: ' As invertidas presentes avisam que alguma energia ainda está se acomodando.',
      accion: ' A energia que o dia lhe pede: ${kw1} e ${kw2}.',
      consejoHex: ' O hexagrama futuro acrescenta: ${consejo}.',
    },
  },
  fr: {
    visionGeneral: {
      cruceKw: 'Ces cartes parlent directement de ta question : ${cartas}.',
      elDominante: "L'élément ${el} domine le tirage (${c} cartes sur ${total}) : ${texto}.",
      elCarencia: "L'absence de ${el} (${texto}) signale ce que la situation te demande de cultiver consciemment.",
      elTexto: {
        fuego: { label: 'Feu', texto: 'action, élan et initiative' },
        aire: { label: 'Air', texto: 'mental, parole et idées' },
        agua: { label: 'Eau', texto: 'émotion, intuition et liens' },
        tierra: { label: 'Terre', texto: 'le concret, le corps et le matériel' },
      },
    },
    iching: { temas: " Thèmes de l'hexagramme : ${kw}." },
    dinamicas: {
      sotas: "Plusieurs Valets : messages et apprentissages en cours ; la curiosité est active.",
      caballeros: 'Plusieurs Cavaliers : mouvement et action ; les choses avancent vite.',
      secuencia: 'Séquence archétypale : ${a} → ${b} — ${frase}',
      numeroSig: {
        '2': 'dualité, coopération et équilibre', '3': 'expansion, créativité et expression',
        '4': 'structure, ordre et fondations', '5': 'changement, crise et apprentissage par la tension',
        '6': 'harmonie, responsabilité et soin', '7': 'introspection, quête et savoir intérieur',
        '8': 'pouvoir, manifestation et gestion', '9': 'clôture, accomplissement et abandon',
        '10': 'accomplissement complet qui relance le cycle',
      },
      secuencias: {
        'La Torre>La Estrella': "après la ruine, l'espérance se reconstruit",
        'La Torre>El Sol': 'la chute du vieux ouvre la voie à la clarté',
        'La Muerte>La Estrella': 'la fin précède un renouveau serein',
        'El Diablo>La Templanza': "de l'attachement, on passe à l'équilibre qui guérit",
        'El Diablo>La Estrella': 'reconnaître la chaîne est le premier pas vers la libération',
        'El Colgado>La Muerte': 'ce que tu as lâché culmine en transformation réelle',
        'La Luna>El Sol': 'de la confusion, on débouche en pleine clarté',
        'La Luna>El Juicio': "le diffus mûrit jusqu'à un appel clair",
        'El Ermitaño>La Rueda de la Fortuna': 'le retrait prépare un tournant du destin',
        '10 de Espadas>As de Copas': 'après avoir touché le fond, un sentiment nouveau naît',
      },
    },
    dignidades: {
      parPosAmigable: "Sur l'axe ${pos1} ↔ ${pos2}, il y a un soutien élémentaire (${a} + ${b}) : ${c1} et ${c2} se renforcent mutuellement.",
      parPosTenso: "Sur l'axe ${pos1} ↔ ${pos2}, il y a une friction élémentaire (${a} vs ${b}) : ${c1} et ${c2} demandent à être intégrées.",
      nuanceInv: " Avec la carte inversée, cette nuance se vit d'abord à l'intérieur.",
    },
    narrativa: {
      arcoTres: 'Le fil relie trois temps : ${c0} laisse en héritage que « ${s0} » ; dans le présent, ${c1} déclare que « ${s1} » ; et la tendance qui s\u2019ouvre est ${c2} : « ${s2} ».',
      cruzNucleo: "Ton cœur maintenant est ${c1} —« ${s1} »—, et la force qui traverse est ${c2} —« ${s2} »— : c'est là que se joue la question centrale.",
      cruzRaiz: 'Tu viens de ${c4} —« ${s4} »—, et ce qui approche déjà est ${c6} —« ${s6} »—.',
      cruzMeta: 'Ton but conscient vise ${c5} —« ${s5} »—, tandis que la direction de fond débouche sur ${c10} —« ${s10} »—.',
      cruzMetaInv: " L'inversion de ${c10} suggère que ce dénouement demande d'abord un ajustement intérieur.",
      unaArquetipo: "Son archétype, ${arq}, condense l'énergie du moment.",
    },
    recomendacion: {
      base: {
        love: 'En amour, la réponse passe par dire à voix haute ce que tu ressens vraiment.',
        money: "Sur le plan matériel, traduis l'intuition en un pas concret et mesurable.",
        conflict: "Face au conflit, gagne en clarté intérieure avant d'avoir raison : nomme le fond réel.",
        work: "Au travail, aligne l'action visible avec ce que la carte du résultat indique.",
        decision: "À la croisée des chemins, choisis l'option la plus proche de ton axe et lâche le reste.",
        health: 'Pour ton bien-être, écoute le corps avant le devoir.',
        change: 'En pleine transition, ne force pas le vieux moule : accompagne le mouvement.',
        fear: 'Face à la peur, nomme-la : ce qui est nommé perd sa prise.',
        general: "Agis en combinant l'écoute intérieure avec un petit pas pratique et visible.",
      },
      matizAlta: " Avec tant de cartes inversées (${pct}%), tu intègres d'abord à l'intérieur, puis tu agis à l'extérieur.",
      matizMedia: " Les cartes inversées présentes avertissent qu'une énergie se met encore en place.",
      accion: " L'énergie que le jour te demande : ${kw1} et ${kw2}.",
      consejoHex: " L'hexagramme futur ajoute : ${consejo}.",
    },
  },
  de: {
    visionGeneral: {
      cruceKw: 'Diese Karten sprechen direkt von deiner Frage: ${cartas}.',
      elDominante: 'Das Element ${el} dominiert die Legung (${c} von ${total} Karten): ${texto}.',
      elCarencia: 'Die Abwesenheit von ${el} (${texto}) zeigt, was die Situation bewusst zu kultivieren verlangt.',
      elTexto: {
        fuego: { label: 'Feuer', texto: 'Handlung, Impuls und Initiative' },
        aire: { label: 'Luft', texto: 'Geist, Wort und Ideen' },
        agua: { label: 'Wasser', texto: 'Gefühl, Intuition und Bindungen' },
        tierra: { label: 'Erde', texto: 'das Konkrete, der Körper und das Materielle' },
      },
    },
    iching: { temas: ' Themen des Hexagramms: ${kw}.' },
    dinamicas: {
      sotas: 'Mehrere Buben: Botschaften und Lernen sind in Bewegung; die Neugier ist aktiv.',
      caballeros: 'Mehrere Ritter: Bewegung und Tatkraft; die Dinge gehen schnell voran.',
      secuencia: 'Archetypische Sequenz: ${a} → ${b} — ${frase}',
      numeroSig: {
        '2': 'Dualität, Zusammenarbeit und Ausgleich', '3': 'Expansion, Kreativität und Ausdruck',
        '4': 'Struktur, Ordnung und Fundamente', '5': 'Wandel, Krise und Lernen durch Spannung',
        '6': 'Harmonie, Verantwortung und Fürsorge', '7': 'Introspektion, Suche und inneres Wissen',
        '8': 'Kraft, Manifestation und Gestaltung', '9': 'Abschluss, Vollendung und Hingabe',
        '10': 'Vollständigkeit, die den Zyklus neu startet',
      },
      secuencias: {
        'La Torre>La Estrella': 'nach dem Einsturz baut sich die Hoffnung neu auf',
        'La Torre>El Sol': 'der Fall des Alten macht den Weg zur Klarheit frei',
        'La Muerte>La Estrella': 'dem Ende geht eine gelassene Erneuerung voraus',
        'El Diablo>La Templanza': 'aus der Fessel wächst das heilsame Gleichgewicht',
        'El Diablo>La Estrella': 'die Kette zu benennen ist der erste Schritt zur Befreiung',
        'El Colgado>La Muerte': 'was du losgelassen hast, gipfelt in echter Transformation',
        'La Luna>El Sol': 'aus der Verwirrung mündet volle Klarheit',
        'La Luna>El Juicio': 'das Verschwommene reift zu einem klaren Ruf',
        'El Ermitaño>La Rueda de la Fortuna': 'der Rückzug bereitet eine Wendung des Schicksals vor',
        '10 de Espadas>As de Copas': 'nach dem Tiefpunkt wird ein neues Gefühl geboren',
      },
    },
    dignidades: {
      parPosAmigable: 'Auf der Achse ${pos1} ↔ ${pos2} gibt es elementare Unterstützung (${a} + ${b}): ${c1} und ${c2} stärken einander.',
      parPosTenso: 'Auf der Achse ${pos1} ↔ ${pos2} gibt es elementare Reibung (${a} vs ${b}): ${c1} und ${c2} verlangen Integration.',
      nuanceInv: ' Mit der umgekehrten Karte wird diese Nuance zuerst nach innen gelebt.',
    },
    narrativa: {
      arcoTres: 'Der Faden verbindet drei Zeiten: ${c0} hinterlässt als Erbe, dass "${s0}"; im Jetzt erklärt ${c1}, dass "${s1}"; und die aufkommende Tendenz ist ${c2}: "${s2}".',
      cruzNucleo: 'Dein Herz ist jetzt ${c1} —"${s1}"—, und die kreuzende Kraft ist ${c2} —"${s2}"—: dort wird die zentrale Frage ausgetragen.',
      cruzRaiz: 'Du kommst von ${c4} —"${s4}"—, und was sich schon nähert, ist ${c6} —"${s6}"—.',
      cruzMeta: 'Dein bewusstes Ziel weist auf ${c5} —"${s5}"—, während die zugreifende Richtung in ${c10} mündet —"${s10}"—.',
      cruzMetaInv: ' Die Umkehrung von ${c10} deutet an, dass dieser Ausgang zuerst eine innere Anpassung verlangt.',
      unaArquetipo: 'Ihr Archetyp, ${arq}, verdichtet die Energie des Moments.',
    },
    recomendacion: {
      base: {
        love: 'In der Liebe führt die Antwort darüber, laut auszusprechen, was du wirklich fühlst.',
        money: 'In materiellen Fragen übersetze die Intuition in einen konkreten, messbaren Schritt.',
        conflict: 'Im Konflikt gewinne innere Klarheit, bevor du recht hast: Benenne den wahren Kern.',
        work: 'In der Arbeit bringe sichtbares Handeln mit dem in Einklang, was die Ergebniskarte zeigt.',
        decision: 'An der Weggabelung wähle die Option, die deinem Kern am nächsten ist, und lass den Rest los.',
        health: 'Für dein Wohlbefinden höre auf den Körper vor der Pflicht.',
        change: 'Mitten im Übergang zwinge nicht die alte Form: Begleite die Bewegung.',
        fear: 'Angesichts der Angst benenne sie: Was benannt ist, verliert seinen Griff.',
        general: 'Handle, indem du inneres Lauschen mit einem kleinen, sichtbaren praktischen Schritt verbindest.',
      },
      matizAlta: ' Bei so vielen umgekehrten Karten (${pct}%) integrierst du zuerst innen, dann handelst du außen.',
      matizMedia: ' Die vorhandenen Umkehrungen warnen, dass sich eine Energie noch einordnet.',
      accion: ' Die Energie, die der Tag von dir verlangt: ${kw1} und ${kw2}.',
      consejoHex: ' Das zukünftige Hexagramm fügt hinzu: ${consejo}.',
    },
  },
  it: {
    visionGeneral: {
      cruceKw: 'Queste carte parlano direttamente della tua domanda: ${cartas}.',
      elDominante: "L'elemento ${el} domina la stesa (${c} carte su ${total}): ${texto}.",
      elCarencia: "L'assenza di ${el} (${texto}) segnala ciò che la situazione ti chiede di coltivare consapevolmente.",
      elTexto: {
        fuego: { label: 'Fuoco', texto: 'azione, slancio e iniziativa' },
        aire: { label: 'Aria', texto: 'mente, parola e idee' },
        agua: { label: 'Acqua', texto: 'emozione, intuizione e legami' },
        tierra: { label: 'Terra', texto: 'il concreto, il corpo e il materiale' },
      },
    },
    iching: { temas: " Temi dell'esagramma: ${kw}." },
    dinamicas: {
      sotas: 'Diverse Fantine: messaggi e apprendimenti in cammino; la curiosità è attiva.',
      caballeros: 'Diversi Cavalieri: movimento e azione; le cose avanzano in fretta.',
      secuencia: 'Sequenza archetipica: ${a} → ${b} — ${frase}',
      numeroSig: {
        '2': 'dualità, cooperazione ed equilibrio', '3': 'espansione, creatività ed espressione',
        '4': 'struttura, ordine e fondamenta', '5': 'cambiamento, crisi e apprendimento attraverso la tensione',
        '6': 'armonia, responsabilità e cura', '7': 'introspezione, ricerca e sapere interiore',
        '8': 'potere, manifestazione e gestione', '9': 'chiusura, culmine e resa',
        '10': 'completezza che riavvia il ciclo',
      },
      secuencias: {
        'La Torre>La Estrella': 'dopo la rovina, la speranza si ricostruisce',
        'La Torre>El Sol': 'la caduta del vecchio apre la via alla chiarezza',
        'La Muerte>La Estrella': 'alla fine segue un rinnovamento sereno',
        'El Diablo>La Templanza': "dalla prigionia si passa all'equilibrio che sana",
        'El Diablo>La Estrella': 'riconoscere la catena è il primo passo verso la liberazione',
        'El Colgado>La Muerte': 'ciò che hai lasciato culmina in vera trasformazione',
        'La Luna>El Sol': 'dalla confusione si sbocca in piena chiarezza',
        'La Luna>El Juicio': 'il vago matura fino a una chiamata chiara',
        'El Ermitaño>La Rueda de la Fortuna': 'il ritiro prepara una svolta del destino',
        '10 de Espadas>As de Copas': 'dopo aver toccato il fondo, nasce un sentimento nuovo',
      },
    },
    dignidades: {
      parPosAmigable: "Sull'asse ${pos1} ↔ ${pos2} c'è sostegno elementare (${a} + ${b}): ${c1} e ${c2} si rafforzano a vicenda.",
      parPosTenso: "Sull'asse ${pos1} ↔ ${pos2} c'è attrito elementare (${a} vs ${b}): ${c1} e ${c2} chiedono integrazione.",
      nuanceInv: ' Con la carta rovesciata, quella sfumatura si vive prima dentro.',
    },
    narrativa: {
      arcoTres: 'Il filo collega tre tempi: ${c0} lascia in eredità che "${s0}"; nell\u2019ora, ${c1} dichiara che "${s1}"; e la tendenza che si apre è ${c2}: "${s2}".',
      cruzNucleo: 'Il tuo cuore ora è ${c1} —"${s1}"—, e la forza che si incrocia è ${c2} —"${s2}"—: lì si gioca la questione centrale.',
      cruzRaiz: 'Vieni da ${c4} —"${s4}"—, e ciò che già si avvicina è ${c6} —"${s6}"—.',
      cruzMeta: 'Il tuo scopo conscio punta a ${c5} —"${s5}"—, mentre la direzione di fondo sfocia in ${c10} —"${s10}"—.',
      cruzMetaInv: " L'inversione di ${c10} suggerisce che quell'esito chiede prima un aggiustamento interiore.",
      unaArquetipo: "Il suo archetipo, ${arq}, condensa l'energia del momento.",
    },
    recomendacion: {
      base: {
        love: 'In amore, la risposta passa per dire ad alta voce ciò che senti davvero.',
        money: "Sul piano materiale, traduci l'intuizione in un passo concreto e misurabile.",
        conflict: 'Di fronte al conflitto, conquista chiarezza interiore prima di avere ragione: nomina il fondo reale.',
        work: "Nel lavoro, allinea l'azione visibile con ciò che indica la carta dell'esito.",
        decision: "Al bivio, scegli l'opzione più vicina al tuo asse e lascia andare il resto.",
        health: 'Per il tuo benessere, ascolta il corpo prima del dovere.',
        change: 'In piena transizione, non forzare il vecchio stampo: accompagna il movimento.',
        fear: 'Di fronte alla paura, nominala: ciò che viene nominato perde presa.',
        general: "Agisci combinando l'ascolto interiore con un piccolo passo pratico e visibile.",
      },
      matizAlta: " Con tante carte rovesciate (${pct}%), prima integri dentro, poi agisci fuori.",
      matizMedia: " Le carte rovesciate presenti avvisano che un'energia si sta ancora assestando.",
      accion: " L'energia che il giorno ti chiede: ${kw1} e ${kw2}.",
      consejoHex: " L'esagramma futuro aggiunge: ${consejo}.",
    },
  },
};

const esc = (v) => JSON.stringify(v);
function valorJS(v) {
  return typeof v === 'object' ? JSON.stringify(v) : esc(v);
}

let fallo = false;
for (const loc of Object.keys(P)) {
  const p = `js/i18n/locales/datos-maestros-${loc}.json`;
  const lines = readFileSync(p, 'utf8').split('\n');
  const iAT = lines.findIndex(l => /"analisisTarot"\s*:\s*\{/.test(l));
  if (iAT < 0) { console.error(loc, 'sin analisisTarot'); fallo = true; continue; }
  const resto = lines.slice(iAT).join('\n');
  for (const [sub, kvs] of Object.entries(P[loc])) {
    const iSub = lines.findIndex((l, i) => i > iAT && new RegExp('"' + sub + '"\\s*:\\s*\\{').test(l));
    if (iSub < 0) { console.error(loc, 'sin subbloque', sub); fallo = true; continue; }
    const nuevas = Object.entries(kvs)
      .filter(([k]) => !resto.includes(`"${k}"`))
      .map(([k, v]) => `      "${k}": ${valorJS(v)},`);
    lines.splice(iSub + 1, 0, ...nuevas);
  }
  const out = lines.join('\n');
  try { JSON.parse(out); } catch (e) { console.error(loc, 'JSON INVÁLIDO:', e.message); fallo = true; continue; }
  writeFileSync(p, out);
  console.log(loc, 'OK');
}
if (fallo) process.exit(1);
console.log('FIN FASE 3 i18n tarot');
