#!/usr/bin/env node
/**
 * add-analisis-tarot-translations.js
 *
 * Adds the "analisisTarot" section to every datos-maestros-{lang}.json file
 * (es, en, pt, fr, de, it) in js/i18n/locales/.
 *
 * Source of truth: js/core/analysis.js — Motor de análisis holístico Tarot + I Ching
 * Spanish (es) is the original; the rest are high-quality translations
 * with a psychological / spiritual / therapeutic tone.
 *
 * Key conventions:
 *   - lexicon keys: English category codes (love, money, conflict, ...)
 *   - tematicas keys: Spanish suit names (copas, oros, espadas, bastos)
 *   - esperado keys: English category codes; values: Spanish suit names
 *     (kept in Spanish because the code compares against KB card names which
 *      use Spanish suit names)
 *   - plantilla: array of 10 strings, index 0 is null
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'js', 'i18n', 'locales');

// ─────────────────────────────────────────────────────────────────────────────
//  TRANSLATIONS
// ─────────────────────────────────────────────────────────────────────────────

const T = {

// ════════════════════════════════════════════════════════════════════════════
//  ESPAÑOL  (source language — verbatim from the JS file)
// ════════════════════════════════════════════════════════════════════════════
es: {
  titulo: '✦ Análisis Holístico ✦',
  subtitulo: 'Lectura integral de Tarot e I Ching · dignidades elementales · numerología · narrativa · resonancias cruzadas',
  headers: {
    visionGeneral: '🌌 Visión General',
    tematica: '🌟 Temática Dominante en el Tarot',
    alineacion: '🎯 Alineación Pregunta ↔ Tirada',
    lecturaIching: '☯️ Lectura del I Ching',
    dinamicas: '⚙️ Dinámicas y Patrones del Tarot',
    dignidades: '⚡ Relaciones Elementales entre Cartas',
    posicional: '📍 Lectura Posicional Detallada',
    narrativa: '🌀 Síntesis Narrativa del Tarot',
    holistico: '🔮 Análisis Holístico Tarot ↔ I Ching',
    recomendacion: '✨ Recomendación Integrada'
  },
  exportHeaders: {
    visionGeneral: 'VISIÓN GENERAL',
    tematica: 'TEMÁTICA TAROT',
    alineacion: 'ALINEACIÓN PREGUNTA ↔ TIRADA',
    lecturaIching: 'LECTURA DEL I CHING',
    dinamicas: 'DINÁMICAS Y PATRONES TAROT',
    dignidades: 'DIGNIDADES ELEMENTALES ENTRE CARTAS',
    posicional: 'LECTURA POSICIONAL DETALLADA',
    narrativa: 'SÍNTESIS NARRATIVA TAROT',
    holistico: 'ANÁLISIS HOLÍSTICO TAROT ↔ I CHING',
    recomendacion: 'RECOMENDACIÓN INTEGRADA'
  },
  lexicon: {
    love:    ['amor','pareja','relacion','relación','novio','novia','esposo','esposa','matrimonio','ex','amante','enamorado','enamorar','corazon','corazón','sentimiento','afecto','amistad','amigo','amiga','romantico','romántico'],
    money:   ['dinero','trabajo','empleo','sueldo','economia','economía','finanzas','ricos','rico','pobreza','pobre','herencia','inversion','inversión','negocio','empresa','comercio','venta','comprar','vender','deuda','credito','crédito','banco','ahorro','coste','precio'],
    conflict:['conflicto','pelea','discusion','discusión','pleito','juicio','demandar','denuncia','reyerta','enfrentamiento','rival','enemigo','odio','rencor','venganza','perdonar','perdon','disculpa','ruptura','separacion','separación'],
    work:    ['trabajo','empleo','carrera','profesion','profesión','ascenso','jefe','companero','compañero','oficina','proyecto','negocio','vocacion','vocación','estudio','examen','universidad','escuela','aprendizaje','tarea','labor','funcion','función','puesto','cargo'],
    decision:['decidir','decision','decisión','elegir','eleccion','elección','duda','dudar','opcion','opción','alternativa','camino','ruta','encrucijada','escoger','seleccionar','sopesar','dilema','cruce','bifurcacion','bifurcación'],
    health:  ['salud','enfermedad','enfermo','cuerpo','fisico','físico','dolor','cura','sanar','sanacion','sanación','medico','médico','tratamiento','hospital','clinica','clínica','bienestar','energia','energía','vitalidad','cansancio','agotamiento'],
    change:  ['cambio','cambiar','transformacion','transformación','mudanza','mudar','viaje','mover','nuevo','nueva','comienzo','empezar','iniciar','dejar','soltar','abandonar','final','terminar','cierre','etapa','ciclo','paso','fase','transicion','transición'],
    fear:    ['miedo','temor','asustado','asustada','preocupacion','preocupación','preocupar','angustia','ansiedad','inseguridad','duda','incertidumbre','inquietud','panico','pánico','fobia','amenaza','peligro','riesgo'],
    fire:    ['pasión','pasion','fuego','entusiasmo','energia','energía','impulso','accion','acción','iniciativa','creatividad','motivacion','motivación','ardor','furia','rabia','ira','coraje','valentia','valentía','apasionar'],
    water:   ['emocion','emoción','sentir','sentimiento','lagrima','lágrima','llanto','tristeza','alegria','alegría','felicidad','amor','corazon','corazón','intuicion','intuición','sueño','sueno','sensible','sensibilidad','ternura','compasion','compasión'],
    air:     ['pensar','pensamiento','idea','razon','razón','logica','lógica','comunicacion','comunicación','hablar','decir','palabra','mensaje','claridad','confusion','confusión','mentir','verdad','explicar','analizar','estudiar','aprender','discernir'],
    earth:   ['cuerpo','casa','hogar','familia','tierra','naturaleza','estabilidad','seguridad','raiz','raíz','base','cimientos','patrimonio','bienes','posesion','posesión','campo','cultivar','construir','edificar','asentar','establecer']
  },
  descripciones: {
    love: 'relaciones afectivas o amorosas',
    money: 'temas materiales, económicos o financieros',
    conflict: 'conflictos, disputas o tensiones',
    work: 'trabajo, profesión o estudios',
    decision: 'decisiones y encrucijadas',
    health: 'salud física o bienestar',
    change: 'cambios, transiciones o transformaciones',
    fear: 'miedos, preocupaciones o inseguridades'
  },
  tematicas: {
    copas: 'El palo de Copas (Agua) domina la tirada, lo que sitúa el foco en el terreno emocional, los vínculos afectivos y la intuición.',
    oros: 'El palo de Oros (Tierra) domina, señalando que el centro de gravedad está en lo material, laboral o físico.',
    espadas: 'El palo de Espadas (Aire) domina, poniendo el acento en la mente, la comunicación y los conflictos.',
    bastos: 'El palo de Bastos (Fuego) domina, indicando un momento de acción, pasión e iniciativa.'
  },
  esperado: {
    love: 'copas', fear: 'copas',
    money: 'oros', work: 'oros', health: 'oros',
    conflict: 'espadas', decision: 'espadas',
    change: 'bastos'
  },
  plantilla: [
    null,
    'El Presente muestra la energía central.',
    'El Desafío representa la fuerza que se cruza.',
    'La Base es la raíz inconsciente.',
    'El Pasado Reciente aporta el antecedente.',
    'La Corona es lo consciente.',
    'El Futuro Cercano señala la tendencia.',
    'Tu Actitud, lo que aportas.',
    'El Entorno, personas y circunstancias.',
    'Esperanzas y Temores.',
    'El Resultado Final, hacia donde se dirige la energía.'
  ],
  visionGeneral: {
    preguntaLabel: 'Pregunta/intención:',
    sinPregunta: '(No se especificó ninguna pregunta — lectura general del momento)',
    contextoDestacado: 'Tu pregunta/intención versa sobre',
    contextoDestacadoFallback: 'tu situación',
    contextoSinCategoria: 'Tu pregunta/intención se enfoca en un tema general sin una categoría temática dominante clara.',
    contextoNoPregunta: 'No se formuló una pregunta explícita, por lo que la lectura se ofrece como radiografía general del momento vital actual.',
    cartaSingular: 'carta',
    cartasPlural: 'cartas',
    arcanoSingular: 'arcano',
    arcanosPlural: 'arcanos',
    mayorSingular: 'mayor',
    mayoresPlural: 'mayores',
    menorSingular: 'menor',
    menoresPlural: 'menores',
    invertidaSingular: 'invertida',
    invertidasPlural: 'invertidas',
    tiradaNarrativa: 'Esta tirada de ${total} ${cartaWord} muestra ${mayores} ${arcanoWord} ${mayorWord} (${pctMayores}%) y ${menores} ${menorWord}.',
    pctMayoresAlto: 'La presencia mayoritaria de arcanos mayores indica un momento de fuerte calado vital: fuerzas arquetípicas profundas están en juego y los eventos tienen un peso que trasciende lo cotidiano.',
    pctMayoresMedio: 'El equilibrio entre arcanos mayores y menores sugiere una mezcla de lo cotidiano con lo significativo.',
    pctMayoresBajo: 'El predominio de arcanos menores señala que la situación se desarrolla principalmente en el plano práctico y cotidiano.',
    invertidasNarrativa: 'Hay ${invertidas} ${invertidaWord} (${pctInvertidas}%).',
    pctInvertidasAlto: 'El alto número de invertidas indica energías bloqueadas o aspectos internos que aún no se han integrado.',
    pctInvertidasBajo: 'Las cartas invertidas señalan zonas donde la energía se expresa con dificultad.',
    pctInvertidasCero: 'Todas las cartas al derecho indican que las energías fluyen con relativa facilidad.',
    tematicaConcentracion: 'La concentración en este palo es notable.',
    tematicaEquilibrada: 'Los palos están equilibrados, lo que indica que la situación toca varios planos a la vez.'
  },
  cruce: {
    resuena: 'El palo dominante (${paloDom}) resuena directamente con la temática de tu pregunta (${catDom}).',
    noResuena: 'El palo dominante (${paloDom}) no es el esperado para ${catDom}. La respuesta viene por un ángulo distinto.'
  },
  iching: {
    principal: 'El hexagrama principal es ${nombreHex} (nº ${numP}), formado por ${trigInf} y ${trigSup}. ${sig} El consejo es: ${consejo}',
    mutantes: 'Las líneas mutantes (${lineas}) indican evolución hacia ${nombreHexF} (nº ${numFuturo}). ${sigFuturo}',
    sinMutantes: 'Sin líneas mutantes, la situación se presenta estable.',
    errorHex: 'No se pudo cargar el hexagrama.'
  },
  dinamicas: {
    ases: 'Presencia de ${ases} Ases: varias semillas de nuevos comienzos.',
    corte: 'Hay ${figTotal} cartas de corte: otras personas juegan un papel relevante.',
    reyes: 'Varios Reyes: autoridades masculinas influyen.',
    reinas: 'Varias Reinas: figuras femeninas son centrales.',
    numero: 'El número ${n} aparece ${c} veces: su cualidad numerológica se refuerza.',
    invertidas: 'Alto porcentaje de invertidas (${pctInvertidas}%): bloqueos internos.'
  },
  dignidades: {
    amigable: '${c1Ref} y ${c2Ref} están en dignidad amigable (${el1} + ${el2}).',
    tension: '${c1Ref} y ${c2Ref} están en tensión (${el1} vs ${el2}).',
    neutro: 'No se observan dinámicas elementales significativas entre cartas adyacentes.'
  },
  posicional: {
    una: '${nombre} ${orientacion}: ${sig} Palabras clave: ${kw}.',
    tresPasado: 'El pasado ha dejado esta energía como herencia.',
    tresPresente: 'En el presente, esta carta describe la energía actual.',
    tresFuturo: 'En el futuro cercano, esta energía se vislumbra como tendencia.',
    tresCard: '${nombre} ${orientacion}. ${contexto} ${sig}',
    cruzCard: '${nombre} ${orientacion}. ${plantilla} ${sig}'
  },
  narrativa: {
    cruz: 'Desde el pasado (${c4}), el presente está marcado por ${c1}, con desafío ${c2}. El futuro apunta a ${c6}, y el resultado a ${c10}.',
    tres: 'El arco temporal va de ${c0} (pasado) a ${c1} (presente), hacia ${c2} (futuro).',
    una: 'La carta única condensa pasado, presente y futuro en una sola energía.'
  },
  holistico: {
    resonanciaTitulo: '1. Resonancia elemental:',
    resonanciaArmonia: 'El elemento del Tarot (${paloDomCanonico}) está en armonía con el del I Ching (${elHexP}).',
    resonanciaTension: 'El elemento del Tarot (${paloDomCanonico}) está en tensión con el del I Ching (${elHexP}).',
    resonanciaNeutro: 'Los elementos son neutros entre sí.',
    resonanciaSinPalo: 'No hay palo dominante claro; el I Ching aporta ${elHexP} como cualidad de fondo.',
    convergenciaTitulo: '2. Convergencia del resultado:',
    convergenciaBase: 'La carta resultado (${cartaResultado}) y el hexagrama (${nombreHex}) se complementan.',
    convergenciaCierre: 'Ambos coinciden en marcar un cierre de ciclo.',
    convergenciaInicio: 'Ambos coinciden en señalar un inicio.',
    convergenciaTransformacion: 'La carta invertida y las líneas mutantes indican transformación en curso.',
    convergenciaCarta: 'La carta apunta a: "${sigCarta}." El hexagrama aconseja: "${consejo}"',
    trayectoriaTitulo: '3. Trayectoria evolutiva:',
    trayectoria: 'El hexagrama futuro (${nombreHexF}) y la carta del futuro (${cartaFuturo}) marcan la dirección.',
    sintesisTitulo: '4. Síntesis kármica:',
    sintesisKarmica: 'Arcanos mayores + hexagrama arquetípico: la situación toca capas kármicas profundas.',
    sintesisDificultad: 'Invertidas + hexagrama de dificultad: se pide trabajo interior antes que acción externa.',
    sintesisAvance: 'Cartas al derecho + hexagrama de avance: momento favorable, aprovecha el impulso.',
    sintesisMixto: 'La combinación pinta un cuadro matizado: ni todo favorable ni todo adverso.'
  },
  recomendacion: {
    r1: 'Ante tantas invertidas y hexagrama de dificultad, no forzar. Escucha y nombra qué sientes. La acción se volverá evidente cuando las energías cedan.',
    r2: 'El agua domina. Actúa desde el sentir, no desde el cálculo. Las emociones son información valiosa ahora.',
    r3: 'La tierra pide concreción. Traduce intuiciones en pasos prácticos. La abundancia se materializa cuando se estructura.',
    r4: 'El fuego pide movimiento. La claridad vendrá con la acción. Avanza con decisión sin quemar puentes.',
    r5: 'El aire pide claridad mental. Define qué comunicar y a quién. Una palabra bien elegida vale más que varias acciones.',
    r6: 'La situación tiene peso kármico. Alinéate con el ciclo. Lo que parece obstáculo puede ser la puerta.',
    r7: 'La situación está viva, en evolución. Sé flexible para ajustar el rumbo cuando la energía gire.',
    r8: 'Tirada equilibrada sin extremos. Combina escucha interior con acción práctica. La estabilidad es una base, no un destino.'
  },
  aviso: 'Este análisis es una interpretación simbólica. Tómalo como espejo para la reflexión, no como pronóstico determinista.'
},

// ════════════════════════════════════════════════════════════════════════════
//  ENGLISH
// ════════════════════════════════════════════════════════════════════════════
en: {
  titulo: '✦ Holistic Analysis ✦',
  subtitulo: 'Integral reading of Tarot and I Ching · elemental dignities · numerology · narrative · cross-resonances',
  headers: {
    visionGeneral: '🌌 General Overview',
    tematica: '🌟 Dominant Theme in the Tarot',
    alineacion: '🎯 Question ↔ Spread Alignment',
    lecturaIching: '☯️ I Ching Reading',
    dinamicas: '⚙️ Tarot Dynamics and Patterns',
    dignidades: '⚡ Elemental Relations between Cards',
    posicional: '📍 Detailed Positional Reading',
    narrativa: '🌀 Tarot Narrative Synthesis',
    holistico: '🔮 Holistic Analysis Tarot ↔ I Ching',
    recomendacion: '✨ Integrated Recommendation'
  },
  exportHeaders: {
    visionGeneral: 'GENERAL OVERVIEW',
    tematica: 'TAROT THEME',
    alineacion: 'QUESTION ↔ SPREAD ALIGNMENT',
    lecturaIching: 'I CHING READING',
    dinamicas: 'TAROT DYNAMICS AND PATTERNS',
    dignidades: 'ELEMENTAL DIGNITIES BETWEEN CARDS',
    posicional: 'DETAILED POSITIONAL READING',
    narrativa: 'TAROT NARRATIVE SYNTHESIS',
    holistico: 'HOLISTIC ANALYSIS TAROT ↔ I CHING',
    recomendacion: 'INTEGRATED RECOMMENDATION'
  },
  lexicon: {
    love:    ['love','couple','partner','relationship','boyfriend','girlfriend','husband','wife','marriage','ex','lover','in love','falling in love','heart','feeling','affection','friendship','friend','romantic'],
    money:   ['money','work','job','salary','economy','finances','rich','wealth','poverty','poor','inheritance','investment','business','company','trade','sale','buy','sell','debt','credit','bank','savings','cost','price'],
    conflict:['conflict','fight','argument','dispute','lawsuit','trial','sue','complaint','clash','confrontation','rival','enemy','hate','grudge','revenge','forgive','forgiveness','apology','breakup','separation'],
    work:    ['work','job','career','profession','promotion','boss','colleague','office','project','business','vocation','study','exam','university','school','learning','task','labor','function','position','role'],
    decision:['decide','decision','choose','choice','doubt','option','alternative','path','route','crossroads','pick','select','weigh','dilemma','cross','fork','bifurcation'],
    health:  ['health','illness','sick','body','physical','pain','cure','heal','healing','doctor','treatment','hospital','clinic','wellness','energy','vitality','exhaustion','fatigue'],
    change:  ['change','transform','transformation','move','moving','journey','new','beginning','start','initiate','leave','let go','abandon','end','finish','closure','stage','cycle','step','phase','transition'],
    fear:    ['fear','dread','scared','worry','concern','anguish','anxiety','insecurity','doubt','uncertainty','restlessness','panic','phobia','threat','danger','risk'],
    fire:    ['passion','fire','enthusiasm','energy','drive','action','initiative','creativity','motivation','ardor','fury','rage','anger','courage','bravery','impassion'],
    water:   ['emotion','feeling','tear','crying','sadness','joy','happiness','love','heart','intuition','dream','sensitive','sensitivity','tenderness','compassion'],
    air:     ['think','thought','idea','reason','logic','communication','speak','say','word','message','clarity','confusion','lie','truth','explain','analyse','study','learn','discern'],
    earth:   ['body','house','home','family','earth','nature','stability','security','root','base','foundation','heritage','goods','possession','field','cultivate','build','settle','establish']
  },
  descripciones: {
    love: 'affective or romantic relationships',
    money: 'material, economic or financial matters',
    conflict: 'conflicts, disputes or tensions',
    work: 'work, profession or studies',
    decision: 'decisions and crossroads',
    health: 'physical health or wellbeing',
    change: 'changes, transitions or transformations',
    fear: 'fears, worries or insecurities'
  },
  tematicas: {
    copas: 'The suit of Cups (Water) dominates the spread, placing the focus on the emotional realm, affective bonds and intuition.',
    oros: 'The suit of Pentacles (Earth) dominates, signalling that the centre of gravity lies in the material, professional or physical.',
    espadas: 'The suit of Swords (Air) dominates, emphasising the mind, communication and conflicts.',
    bastos: 'The suit of Wands (Fire) dominates, indicating a moment of action, passion and initiative.'
  },
  esperado: {
    love: 'copas', fear: 'copas',
    money: 'oros', work: 'oros', health: 'oros',
    conflict: 'espadas', decision: 'espadas',
    change: 'bastos'
  },
  plantilla: [
    null,
    'The Present shows the central energy.',
    'The Challenge represents the force that crosses.',
    'The Base is the unconscious root.',
    'The Recent Past provides the antecedent.',
    'The Crown is what is conscious.',
    'The Near Future signals the trend.',
    'Your Attitude, what you bring.',
    'The Environment, people and circumstances.',
    'Hopes and Fears.',
    'The Final Outcome, where the energy is heading.'
  ],
  visionGeneral: {
    preguntaLabel: 'Question/intention:',
    sinPregunta: '(No question was specified — general reading of the moment)',
    contextoDestacado: 'Your question/intention concerns',
    contextoDestacadoFallback: 'your situation',
    contextoSinCategoria: 'Your question/intention focuses on a general theme without a clearly dominant thematic category.',
    contextoNoPregunta: 'No explicit question was asked, so the reading is offered as a general snapshot of the current life moment.',
    cartaSingular: 'card',
    cartasPlural: 'cards',
    arcanoSingular: 'arcana',
    arcanosPlural: 'arcana',
    mayorSingular: 'major',
    mayoresPlural: 'major',
    menorSingular: 'minor',
    menoresPlural: 'minor',
    invertidaSingular: 'reversed',
    invertidasPlural: 'reversed',
    tiradaNarrativa: 'This spread of ${total} ${cartaWord} shows ${mayores} ${arcanoWord} ${mayorWord} (${pctMayores}%) and ${menores} ${menorWord}.',
    pctMayoresAlto: 'The majority presence of major arcana indicates a moment of deep life significance: profound archetypal forces are at play and events carry a weight that transcends the everyday.',
    pctMayoresMedio: 'The balance between major and minor arcana suggests a blend of the everyday with the meaningful.',
    pctMayoresBajo: 'The predominance of minor arcana signals that the situation unfolds mainly on the practical, everyday plane.',
    invertidasNarrativa: 'There ${invertidaWord} ${invertidas} (${pctInvertidas}%).',
    pctInvertidasAlto: 'The high number of reversed cards indicates blocked energies or inner aspects that have not yet been integrated.',
    pctInvertidasBajo: 'The reversed cards point to areas where the energy expresses itself with difficulty.',
    pctInvertidasCero: 'All cards upright indicate that energies flow with relative ease.',
    tematicaConcentracion: 'The concentration in this suit is remarkable.',
    tematicaEquilibrada: 'The suits are balanced, indicating that the situation touches several planes at once.'
  },
  cruce: {
    resuena: 'The dominant suit (${paloDom}) resonates directly with the theme of your question (${catDom}).',
    noResuena: 'The dominant suit (${paloDom}) is not the one expected for ${catDom}. The answer comes from a different angle.'
  },
  iching: {
    principal: 'The principal hexagram is ${nombreHex} (nº ${numP}), formed by ${trigInf} and ${trigSup}. ${sig} The counsel is: ${consejo}',
    mutantes: 'The mutating lines (${lineas}) indicate evolution toward ${nombreHexF} (nº ${numFuturo}). ${sigFuturo}',
    sinMutantes: 'No mutating lines; the situation presents itself as stable.',
    errorHex: 'The hexagram could not be loaded.'
  },
  dinamicas: {
    ases: 'Presence of ${ases} Aces: several seeds of new beginnings.',
    corte: 'There are ${figTotal} court cards: other people play a relevant role.',
    reyes: 'Several Kings: masculine authorities exert influence.',
    reinas: 'Several Queens: feminine figures are central.',
    numero: 'The number ${n} appears ${c} times: its numerological quality is reinforced.',
    invertidas: 'High percentage of reversed cards (${pctInvertidas}%): inner blocks.'
  },
  dignidades: {
    amigable: '${c1Ref} and ${c2Ref} are in friendly dignity (${el1} + ${el2}).',
    tension: '${c1Ref} and ${c2Ref} are in tension (${el1} vs ${el2}).',
    neutro: 'No significant elemental dynamics observed between adjacent cards.'
  },
  posicional: {
    una: '${nombre} ${orientacion}: ${sig} Keywords: ${kw}.',
    tresPasado: 'The past has left this energy as a legacy.',
    tresPresente: 'In the present, this card describes the current energy.',
    tresFuturo: 'In the near future, this energy looms as a tendency.',
    tresCard: '${nombre} ${orientacion}. ${contexto} ${sig}',
    cruzCard: '${nombre} ${orientacion}. ${plantilla} ${sig}'
  },
  narrativa: {
    cruz: 'From the past (${c4}), the present is marked by ${c1}, with challenge ${c2}. The future points to ${c6}, and the outcome to ${c10}.',
    tres: 'The temporal arc runs from ${c0} (past) to ${c1} (present), toward ${c2} (future).',
    una: 'The single card condenses past, present and future into one energy.'
  },
  holistico: {
    resonanciaTitulo: '1. Elemental resonance:',
    resonanciaArmonia: 'The Tarot element (${paloDomCanonico}) is in harmony with that of the I Ching (${elHexP}).',
    resonanciaTension: 'The Tarot element (${paloDomCanonico}) is in tension with that of the I Ching (${elHexP}).',
    resonanciaNeutro: 'The elements are neutral toward each other.',
    resonanciaSinPalo: 'No dominant suit is clear; the I Ching contributes ${elHexP} as a background quality.',
    convergenciaTitulo: '2. Convergence of the result:',
    convergenciaBase: 'The outcome card (${cartaResultado}) and the hexagram (${nombreHex}) complement each other.',
    convergenciaCierre: 'Both coincide in marking a cycle closing.',
    convergenciaInicio: 'Both coincide in pointing to a beginning.',
    convergenciaTransformacion: 'The reversed card and the mutating lines indicate transformation underway.',
    convergenciaCarta: 'The card points to: "${sigCarta}." The hexagram counsels: "${consejo}"',
    trayectoriaTitulo: '3. Evolutionary trajectory:',
    trayectoria: 'The future hexagram (${nombreHexF}) and the future card (${cartaFuturo}) mark the direction.',
    sintesisTitulo: '4. Karmic synthesis:',
    sintesisKarmica: 'Major arcana + archetypal hexagram: the situation touches deep karmic layers.',
    sintesisDificultad: 'Reversed cards + hexagram of difficulty: inner work is called for before outer action.',
    sintesisAvance: 'Upright cards + hexagram of advance: a favourable moment, seize the momentum.',
    sintesisMixto: 'The combination paints a nuanced picture: neither all favourable nor all adverse.'
  },
  recomendacion: {
    r1: 'With so many reversed cards and a hexagram of difficulty, do not force. Listen and name what you feel. The action will become evident when the energies yield.',
    r2: 'Water dominates. Act from feeling, not from calculation. Emotions are valuable information right now.',
    r3: 'Earth asks for concreteness. Translate intuitions into practical steps. Abundance materialises when it is structured.',
    r4: 'Fire asks for movement. Clarity will come with action. Move forward decisively without burning bridges.',
    r5: 'Air asks for mental clarity. Define what to communicate and to whom. A well-chosen word is worth more than several actions.',
    r6: 'The situation carries karmic weight. Align with the cycle. What seems an obstacle may be the door.',
    r7: 'The situation is alive, evolving. Be flexible to adjust course when the energy shifts.',
    r8: 'A balanced spread without extremes. Combine inner listening with practical action. Stability is a base, not a destination.'
  },
  aviso: 'This analysis is a symbolic interpretation. Take it as a mirror for reflection, not as a deterministic forecast.'
},

// ════════════════════════════════════════════════════════════════════════════
//  PORTUGUÊS
// ════════════════════════════════════════════════════════════════════════════
pt: {
  titulo: '✦ Análise Holística ✦',
  subtitulo: 'Leitura integral de Tarot e I Ching · dignidades elementais · numerologia · narrativa · ressonâncias cruzadas',
  headers: {
    visionGeneral: '🌌 Visão Geral',
    tematica: '🌟 Temática Dominante no Tarot',
    alineacion: '🎯 Alinhamento Pergunta ↔ Tirada',
    lecturaIching: '☯️ Leitura do I Ching',
    dinamicas: '⚙️ Dinâmicas e Padrões do Tarot',
    dignidades: '⚡ Relações Elementais entre Cartas',
    posicional: '📍 Leitura Posicional Detalhada',
    narrativa: '🌀 Síntese Narrativa do Tarot',
    holistico: '🔮 Análise Holística Tarot ↔ I Ching',
    recomendacion: '✨ Recomendação Integrada'
  },
  exportHeaders: {
    visionGeneral: 'VISÃO GERAL',
    tematica: 'TEMÁTICA TAROT',
    alineacion: 'ALINHAMENTO PERGUNTA ↔ TIRADA',
    lecturaIching: 'LEITURA DO I CHING',
    dinamicas: 'DINÂMICAS E PADRÕES TAROT',
    dignidades: 'DIGNIDADES ELEMENTAIS ENTRE CARTAS',
    posicional: 'LEITURA POSICIONAL DETALHADA',
    narrativa: 'SÍNTESE NARRATIVA TAROT',
    holistico: 'ANÁLISE HOLÍSTICA TAROT ↔ I CHING',
    recomendacion: 'RECOMENDAÇÃO INTEGRADA'
  },
  lexicon: {
    love:    ['amor','casal','parceiro','relacionamento','namorado','namorada','marido','esposa','matrimonio','ex','amante','apaixonado','apaixonar','coracao','coração','sentimento','afeto','amizade','amigo','amiga','romantico','romântico'],
    money:   ['dinheiro','trabalho','emprego','salario','salário','economia','finanças','rico','riqueza','pobreza','pobre','heranca','herança','investimento','negocio','negócio','empresa','comercio','comércio','venda','comprar','vender','divida','dívida','credito','crédito','banco','poupanca','poupança','custo','preço','preco'],
    conflict:['conflito','briga','discussao','discussão','pleito','processo','processar','denuncia','denúncia','confronto','embate','rival','inimigo','ódio','odo','rancor','vinganca','vingança','perdoar','perdao','perdão','desculpa','ruptura','separacao','separação'],
    work:    ['trabalho','emprego','carreira','profissao','profissão','promocao','promoção','chefe','colega','escritorio','escritório','projeto','negocio','negócio','vocacao','vocação','estudo','exame','universidade','escola','aprendizagem','tarefa','labor','funcao','função','cargo','posto'],
    decision:['decidir','decisao','decisão','escolher','escolha','duvida','dúvida','duvidar','opcao','opção','alternativa','caminho','rota','encruzilhada','selecionar','escolher','sopesar','dilema','cruz','bifurcacao','bifurcação'],
    health:  ['saude','saúde','doença','doente','corpo','fisico','físico','dor','cura','curar','sanhemento','sanhamento','medico','médico','tratamento','hospital','clinica','clínica','bem-estar','energia','vitalidade','cansaco','cansaço','esgotamento'],
    change:  ['mudanca','mudança','mudar','transformacao','transformação','mudanca','viagem','mover','novo','nova','começo','comeco','comecar','começar','iniciar','deixar','soltar','abandonar','final','terminar','fechamento','etapa','ciclo','passo','fase','transicao','transição'],
    fear:    ['medo','temor','assustado','assustada','preocupacao','preocupação','preocupar','angustia','angústia','ansiedade','inseguranca','insegurança','duvida','dúvida','incerteza','inquietude','panico','pânico','fobia','ameaca','ameaça','perigo','risco'],
    fire:    ['paixao','paixão','fogo','entusiasmo','energia','impulso','acao','ação','iniciativa','criatividade','motivacao','motivação','ardor','furia','fúria','raiva','ira','coragem','bravura','apaixonar'],
    water:   ['emocao','emoção','sentir','sentimento','lagrima','lágrima','choro','tristeza','alegria','felicidade','amor','coracao','coração','intuicao','intuição','sonho','sensível','sensibilidade','ternura','compaixao','compaixão','compaixão'],
    air:     ['pensar','pensamento','ideia','razao','razão','logica','lógica','comunicacao','comunicação','falar','dizer','palavra','mensagem','clareza','confusao','confusão','mentir','verdade','explicar','analisar','estudar','aprender','discernir'],
    earth:   ['corpo','casa','lar','familia','família','terra','natureza','estabilidade','seguranca','segurança','raiz','base','alicerce','patrimonio','patrimônio','bens','posse','campo','cultivar','construir','edificar','assentar','estabelecer']
  },
  descripciones: {
    love: 'relações afetivas ou amorosas',
    money: 'questões materiais, econômicas ou financeiras',
    conflict: 'conflitos, disputas ou tensões',
    work: 'trabalho, profissão ou estudos',
    decision: 'decisões e encruzilhadas',
    health: 'saúde física ou bem-estar',
    change: 'mudanças, transições ou transformações',
    fear: 'medos, preocupações ou inseguranças'
  },
  tematicas: {
    copas: 'O naipe de Copas (Água) domina a tirada, o que coloca o foco no terreno emocional, nos vínculos afetivos e na intuição.',
    oros: 'O naipe de Ouros (Terra) domina, sinalizando que o centro de gravidade está no material, no laboral ou no físico.',
    espadas: 'O naipe de Espadas (Ar) domina, enfatizando a mente, a comunicação e os conflitos.',
    bastos: 'O naipe de Bastos (Fogo) domina, indicando um momento de ação, paixão e iniciativa.'
  },
  esperado: {
    love: 'copas', fear: 'copas',
    money: 'oros', work: 'oros', health: 'oros',
    conflict: 'espadas', decision: 'espadas',
    change: 'bastos'
  },
  plantilla: [
    null,
    'O Presente mostra a energia central.',
    'O Desafio representa a força que se cruza.',
    'A Base é a raiz inconsciente.',
    'O Passado Recente traz o antecedente.',
    'A Coroa é o que é consciente.',
    'O Futuro Próximo sinaliza a tendência.',
    'Sua Atitude, o que você aporta.',
    'O Entorno, pessoas e circunstâncias.',
    'Esperanças e Temores.',
    'O Resultado Final, para onde se dirige a energia.'
  ],
  visionGeneral: {
    preguntaLabel: 'Pergunta/intenção:',
    sinPregunta: '(Nenhuma pergunta foi especificada — leitura geral do momento)',
    contextoDestacado: 'Sua pergunta/intenção versa sobre',
    contextoDestacadoFallback: 'sua situação',
    contextoSinCategoria: 'Sua pergunta/intenção se concentra em um tema geral sem uma categoria temática dominante clara.',
    contextoNoPregunta: 'Nenhuma pergunta explícita foi formulada, portanto a leitura é oferecida como radiografia geral do momento vital atual.',
    cartaSingular: 'carta',
    cartasPlural: 'cartas',
    arcanoSingular: 'arcano',
    arcanosPlural: 'arcanos',
    mayorSingular: 'maior',
    mayoresPlural: 'maiores',
    menorSingular: 'menor',
    menoresPlural: 'menores',
    invertidaSingular: 'invertida',
    invertidasPlural: 'invertidas',
    tiradaNarrativa: 'Esta tirada de ${total} ${cartaWord} mostra ${mayores} ${arcanoWord} ${mayorWord} (${pctMayores}%) e ${menores} ${menorWord}.',
    pctMayoresAlto: 'A presença majoritária de arcanos maiores indica um momento de forte calado vital: forças arquetípicas profundas estão em jogo e os eventos têm um peso que transcende o cotidiano.',
    pctMayoresMedio: 'O equilíbrio entre arcanos maiores e menores sugere uma mistura do cotidiano com o significativo.',
    pctMayoresBajo: 'O predomínio de arcanos menores sinaliza que a situação se desenvolve principalmente no plano prático e cotidiano.',
    invertidasNarrativa: 'Há ${invertidas} ${invertidaWord} (${pctInvertidas}%).',
    pctInvertidasAlto: 'O alto número de invertidas indica energias bloqueadas ou aspectos internos que ainda não foram integrados.',
    pctInvertidasBajo: 'As cartas invertidas sinalizam zonas onde a energia se expressa com dificuldade.',
    pctInvertidasCero: 'Todas as cartas ao direito indicam que as energias fluem com relativa facilidade.',
    tematicaConcentracion: 'A concentração neste naipe é notável.',
    tematicaEquilibrada: 'Os naipes estão equilibrados, o que indica que a situação toca vários planos ao mesmo tempo.'
  },
  cruce: {
    resuena: 'O naipe dominante (${paloDom}) ressoa diretamente com a temática da sua pergunta (${catDom}).',
    noResuena: 'O naipe dominante (${paloDom}) não é o esperado para ${catDom}. A resposta vem por um ângulo distinto.'
  },
  iching: {
    principal: 'O hexagrama principal é ${nombreHex} (nº ${numP}), formado por ${trigInf} e ${trigSup}. ${sig} O conselho é: ${consejo}',
    mutantes: 'As linhas mutantes (${lineas}) indicam evolução rumo a ${nombreHexF} (nº ${numFuturo}). ${sigFuturo}',
    sinMutantes: 'Sem linhas mutantes, a situação se apresenta estável.',
    errorHex: 'Não foi possível carregar o hexagrama.'
  },
  dinamicas: {
    ases: 'Presença de ${ases} Ases: várias sementes de novos começos.',
    corte: 'Há ${figTotal} cartas de corte: outras pessoas desempenham um papel relevante.',
    reyes: 'Vários Reis: autoridades masculinas influenciam.',
    reinas: 'Várias Rainhas: figuras femininas são centrais.',
    numero: 'O número ${n} aparece ${c} vezes: sua qualidade numerológica se reforça.',
    invertidas: 'Alto percentual de invertidas (${pctInvertidas}%): bloqueios internos.'
  },
  dignidades: {
    amigable: '${c1Ref} e ${c2Ref} estão em dignidade amigável (${el1} + ${el2}).',
    tension: '${c1Ref} e ${c2Ref} estão em tensão (${el1} vs ${el2}).',
    neutro: 'Não se observam dinâmicas elementais significativas entre cartas adjacentes.'
  },
  posicional: {
    una: '${nombre} ${orientacion}: ${sig} Palavras-chave: ${kw}.',
    tresPasado: 'O passado deixou esta energia como herança.',
    tresPresente: 'No presente, esta carta descreve a energia atual.',
    tresFuturo: 'No futuro próximo, esta energia se vislumbra como tendência.',
    tresCard: '${nombre} ${orientacion}. ${contexto} ${sig}',
    cruzCard: '${nombre} ${orientacion}. ${plantilla} ${sig}'
  },
  narrativa: {
    cruz: 'Do passado (${c4}), o presente está marcado por ${c1}, com desafio ${c2}. O futuro aponta para ${c6}, e o resultado para ${c10}.',
    tres: 'O arco temporal vai de ${c0} (passado) a ${c1} (presente), rumo a ${c2} (futuro).',
    una: 'A carta única condensa passado, presente e futuro numa só energia.'
  },
  holistico: {
    resonanciaTitulo: '1. Ressonância elemental:',
    resonanciaArmonia: 'O elemento do Tarot (${paloDomCanonico}) está em harmonia com o do I Ching (${elHexP}).',
    resonanciaTension: 'O elemento do Tarot (${paloDomCanonico}) está em tensão com o do I Ching (${elHexP}).',
    resonanciaNeutro: 'Os elementos são neutros entre si.',
    resonanciaSinPalo: 'Não há naipe dominante claro; o I Ching aporta ${elHexP} como qualidade de fundo.',
    convergenciaTitulo: '2. Convergência do resultado:',
    convergenciaBase: 'A carta resultado (${cartaResultado}) e o hexagrama (${nombreHex}) se complementam.',
    convergenciaCierre: 'Ambos coincidem em marcar um fechamento de ciclo.',
    convergenciaInicio: 'Ambos coincidem em assinalar um início.',
    convergenciaTransformacion: 'A carta invertida e as linhas mutantes indicam transformação em curso.',
    convergenciaCarta: 'A carta aponta para: "${sigCarta}." O hexagrama aconselha: "${consejo}"',
    trayectoriaTitulo: '3. Trajetória evolutiva:',
    trayectoria: 'O hexagrama futuro (${nombreHexF}) e a carta do futuro (${cartaFuturo}) marcam a direção.',
    sintesisTitulo: '4. Síntese kármica:',
    sintesisKarmica: 'Arcanos maiores + hexagrama arquetípico: a situação toca camadas kármicas profundas.',
    sintesisDificultad: 'Invertidas + hexagrama de dificuldade: pede-se trabalho interior antes que ação externa.',
    sintesisAvance: 'Cartas ao direito + hexagrama de avanço: momento favorável, aproveite o impulso.',
    sintesisMixto: 'A combinação pinta um quadro matizado: nem tudo favorável nem tudo adverso.'
  },
  recomendacion: {
    r1: 'Diante de tantas invertidas e hexagrama de dificuldade, não force. Escute e nomeie o que sente. A ação se tornará evidente quando as energias cederem.',
    r2: 'A água domina. Aja desde o sentir, não desde o cálculo. As emoções são informação valiosa agora.',
    r3: 'A terra pede concreção. Traduza intuições em passos práticos. A abundância se materializa quando se estrutura.',
    r4: 'O fogo pede movimento. A clareza virá com a ação. Avance com decisão sem queimar pontes.',
    r5: 'O ar pede clareza mental. Defina o que comunicar e a quem. Uma palavra bem escolhida vale mais que várias ações.',
    r6: 'A situação tem peso kármico. Alinhe-se com o ciclo. O que parece obstáculo pode ser a porta.',
    r7: 'A situação está viva, em evolução. Seja flexível para ajustar o rumo quando a energia mudar.',
    r8: 'Tirada equilibrada sem extremos. Combine escuta interior com ação prática. A estabilidade é uma base, não um destino.'
  },
  aviso: 'Esta análise é uma interpretação simbólica. Tome-a como espelho para a reflexão, não como previsão determinista.'
},

// ════════════════════════════════════════════════════════════════════════════
//  FRANÇAIS
// ════════════════════════════════════════════════════════════════════════════
fr: {
  titulo: '✦ Analyse Holistique ✦',
  subtitulo: 'Lecture intégrale du Tarot et du I Ching · dignités élémentaires · numérologie · récit · résonances croisées',
  headers: {
    visionGeneral: '🌌 Vue Générale',
    tematica: '🌟 Thématique Dominante dans le Tarot',
    alineacion: '🎯 Alignement Question ↔ Tirage',
    lecturaIching: '☯️ Lecture du I Ching',
    dinamicas: '⚙️ Dynamiques et Motifs du Tarot',
    dignidades: '⚡ Relations Élémentaires entre Cartes',
    posicional: '📍 Lecture Positionnelle Détaillée',
    narrativa: '🌀 Synthèse Narrative du Tarot',
    holistico: '🔮 Analyse Holistique Tarot ↔ I Ching',
    recomendacion: '✨ Recommandation Intégrée'
  },
  exportHeaders: {
    visionGeneral: 'VUE GÉNÉRALE',
    tematica: 'THÉMATIQUE TAROT',
    alineacion: 'ALIGNEMENT QUESTION ↔ TIRAGE',
    lecturaIching: 'LECTURE DU I CHING',
    dinamicas: 'DYNAMIQUES ET MOTIFS TAROT',
    dignidades: 'DIGNITÉS ÉLÉMENTAIRES ENTRE CARTES',
    posicional: 'LECTURE POSITIONNELLE DÉTAILLÉE',
    narrativa: 'SYNTHÈSE NARRATIVE TAROT',
    holistico: 'ANALYSE HOLISTIQUE TAROT ↔ I CHING',
    recomendacion: 'RECOMMANDATION INTÉGRÉE'
  },
  lexicon: {
    love:    ['amour','couple','partenaire','relation','petit ami','petite amie','mari','époux','épouse','mariage','ex','amant','amoureuse','amoureux','tomber amoureux','cœur','coeur','sentiment','affection','amitié','ami','amie','romantique'],
    money:   ['argent','travail','emploi','salaire','économie','économie','finances','riche','richesse','pauvreté','pauvre','héritage','investissement','affaire','entreprise','commerce','vente','acheter','vendre','dette','crédit','banque','épargne','coût','cout','prix'],
    conflict:['conflit','dispute','querelle','litige','procès','proces','poursuivre','plainte','affrontement','rival','ennemi','haine','rancune','vengeance','pardonner','pardon','excuse','rupture','séparation','separation'],
    work:    ['travail','emploi','carrière','carriere','profession','promotion','patron','collègue','collegue','bureau','projet','affaire','vocation','étude','etude','examen','université','universite','école','ecole','apprentissage','tâche','tache','fonction','poste','charge'],
    decision:['décider','decision','décision','choisir','choix','doute','douter','option','alternative','chemin','route','croisée','croisee','sélectionner','selectionner','peser','dilemme','carrefour','bifurcation'],
    health:  ['santé','sante','maladie','malade','corps','physique','douleur','guérison','guerison','guérir','guerir','médecin','medecin','traitement','hôpital','hopital','clinique','bien-être','bien-etre','énergie','energie','vitalité','vitalite','fatigue','épuisement','epuisement'],
    change:  ['changement','changer','transformation','déménagement','demenagement','déménager','demenager','voyage','mouvoir','nouveau','nouvelle','commencement','commencer','initier','laisser','lâcher','lacher','abandonner','fin','terminer','clôture','cloture','étape','etape','cycle','pas','phase','transition'],
    fear:    ['peur','crainte','effrayé','effraye','inquiétude','inquietude','s\'inquiéter','s\'inquieter','angoisse','anxiété','anxiete','insécurité','insecurite','doute','incertitude','agitation','panique','phobie','menace','danger','risque'],
    fire:    ['passion','feu','enthousiasme','énergie','energie','impulsion','action','initiative','créativité','creativite','motivation','ardeur','fureur','rage','colère','colere','courage','bravoure','passionner'],
    water:   ['émotion','emotion','ressentir','sentiment','larme','pleurs','tristesse','joie','bonheur','amour','cœur','coeur','intuition','rêve','reve','sensible','sensibilité','sensibilite','tendresse','compassion'],
    air:     ['penser','pensée','pensée','idée','idee','raison','logique','communication','parler','dire','mot','message','clarté','clarte','confusion','mentir','vérité','verite','expliquer','analyser','étudier','etudier','apprendre','discerner'],
    earth:   ['corps','maison','foyer','famille','terre','nature','stabilité','stabilite','sécurité','securite','racine','base','fondation','patrimoine','biens','possession','champ','cultiver','construire','édifier','edifier','asseoir','établir','etablir']
  },
  descripciones: {
    love: 'relations affectives ou amoureuses',
    money: 'questions matérielles, économiques ou financières',
    conflict: 'conflits, disputes ou tensions',
    work: 'travail, profession ou études',
    decision: 'décisions et carrefours',
    health: 'santé physique ou bien-être',
    change: 'changements, transitions ou transformations',
    fear: 'peurs, soucis ou insécurités'
  },
  tematicas: {
    copas: 'La coupe de Coupes (Eau) domine le tirage, ce qui place le focus sur le terrain émotionnel, les liens affectifs et l\'intuition.',
    oros: 'La coupe de Deniers (Terre) domine, signalant que le centre de gravité se trouve dans le matériel, le professionnel ou le physique.',
    espadas: 'La coupe d\'Épées (Air) domine, mettant l\'accent sur l\'esprit, la communication et les conflits.',
    bastos: 'La coupe de Bâtons (Feu) domine, indiquant un moment d\'action, de passion et d\'initiative.'
  },
  esperado: {
    love: 'copas', fear: 'copas',
    money: 'oros', work: 'oros', health: 'oros',
    conflict: 'espadas', decision: 'espadas',
    change: 'bastos'
  },
  plantilla: [
    null,
    'Le Présent montre l\'énergie centrale.',
    'Le Défi représente la force qui se croise.',
    'La Base est la racine inconsciente.',
    'Le Passé Récent apporte l\'antécédent.',
    'La Couronne est ce qui est conscient.',
    'Le Futur Proche signale la tendance.',
    'Votre Attitude, ce que vous apportez.',
    'L\'Environnement, personnes et circonstances.',
    'Espoirs et Craintes.',
    'Le Résultat Final, vers où se dirige l\'énergie.'
  ],
  visionGeneral: {
    preguntaLabel: 'Question/intention :',
    sinPregunta: '(Aucune question spécifiée — lecture générale du moment)',
    contextoDestacado: 'Votre question/intention porte sur',
    contextoDestacadoFallback: 'votre situation',
    contextoSinCategoria: 'Votre question/intention se concentre sur un thème général sans catégorie thématique dominante claire.',
    contextoNoPregunta: 'Aucune question explicite n\'a été formulée, aussi la lecture est-elle offerte comme radiographie générale du moment vital actuel.',
    cartaSingular: 'carte',
    cartasPlural: 'cartes',
    arcanoSingular: 'arcane',
    arcanosPlural: 'arcanes',
    mayorSingular: 'majeur',
    mayoresPlural: 'majeurs',
    menorSingular: 'mineur',
    menoresPlural: 'mineurs',
    invertidaSingular: 'renversée',
    invertidasPlural: 'renversées',
    tiradaNarrativa: 'Ce tirage de ${total} ${cartaWord} montre ${mayores} ${arcanoWord} ${mayorWord} (${pctMayores}%) et ${menores} ${menorWord}.',
    pctMayoresAlto: 'La présence majoritaire d\'arcanes majeurs indique un moment à forte résonance vitale : des forces archétypiques profondes sont en jeu et les événements ont un poids qui transcende le quotidien.',
    pctMayoresMedio: 'L\'équilibre entre arcanes majeurs et mineurs suggère un mélange du quotidien avec le significatif.',
    pctMayoresBajo: 'La prédominance d\'arcanes mineurs signale que la situation se développe principalement sur le plan pratique et quotidien.',
    invertidasNarrativa: 'Il y a ${invertidas} ${invertidaWord} (${pctInvertidas}%).',
    pctInvertidasAlto: 'Le nombre élevé de renversées indique des énergies bloquées ou des aspects internes qui ne sont pas encore intégrés.',
    pctInvertidasBajo: 'Les cartes renversées signalent des zones où l\'énergie s\'exprime avec difficulté.',
    pctInvertidasCero: 'Toutes les cartes à l\'endroit indiquent que les énergies coulent avec une relative facilité.',
    tematicaConcentracion: 'La concentration dans cette coupe est notable.',
    tematicaEquilibrada: 'Les coupes sont équilibrées, ce qui indique que la situation touche plusieurs plans à la fois.'
  },
  cruce: {
    resuena: 'La coupe dominante (${paloDom}) résonne directement avec la thématique de votre question (${catDom}).',
    noResuena: 'La coupe dominante (${paloDom}) n\'est pas celle attendue pour ${catDom}. La réponse vient par un angle différent.'
  },
  iching: {
    principal: 'L\'hexagramme principal est ${nombreHex} (nº ${numP}), formé par ${trigInf} et ${trigSup}. ${sig} Le conseil est : ${consejo}',
    mutantes: 'Les lignes mutantes (${lineas}) indiquent une évolution vers ${nombreHexF} (nº ${numFuturo}). ${sigFuturo}',
    sinMutantes: 'Sans lignes mutantes, la situation se présente stable.',
    errorHex: 'L\'hexagramme n\'a pas pu être chargé.'
  },
  dinamicas: {
    ases: 'Présence de ${ases} As : plusieurs graines de nouveaux commencements.',
    corte: 'Il y a ${figTotal} cartes de cour : d\'autres personnes jouent un rôle pertinent.',
    reyes: 'Plusieurs Rois : des autorités masculines exercent une influence.',
    reinas: 'Plusieurs Reines : des figures féminines sont centrales.',
    numero: 'Le nombre ${n} apparaît ${c} fois : sa qualité numérologique se renforce.',
    invertidas: 'Pourcentage élevé de renversées (${pctInvertidas}%) : blocages internes.'
  },
  dignidades: {
    amigable: '${c1Ref} et ${c2Ref} sont en dignité amicale (${el1} + ${el2}).',
    tension: '${c1Ref} et ${c2Ref} sont en tension (${el1} vs ${el2}).',
    neutro: 'Aucune dynamique élémentaire significative n\'est observée entre les cartes adjacentes.'
  },
  posicional: {
    una: '${nombre} ${orientacion} : ${sig} Mots-clés : ${kw}.',
    tresPasado: 'Le passé a laissé cette énergie en héritage.',
    tresPresente: 'Au présent, cette carte décrit l\'énergie actuelle.',
    tresFuturo: 'Dans un futur proche, cette énergie se devine comme tendance.',
    tresCard: '${nombre} ${orientacion}. ${contexto} ${sig}',
    cruzCard: '${nombre} ${orientacion}. ${plantilla} ${sig}'
  },
  narrativa: {
    cruz: 'Depuis le passé (${c4}), le présent est marqué par ${c1}, avec le défi ${c2}. Le futur pointe vers ${c6}, et le résultat vers ${c10}.',
    tres: 'L\'arc temporel va de ${c0} (passé) à ${c1} (présent), vers ${c2} (futur).',
    una: 'La carte unique condense passé, présent et futur en une seule énergie.'
  },
  holistico: {
    resonanciaTitulo: '1. Résonance élémentaire :',
    resonanciaArmonia: 'L\'élément du Tarot (${paloDomCanonico}) est en harmonie avec celui du I Ching (${elHexP}).',
    resonanciaTension: 'L\'élément du Tarot (${paloDomCanonico}) est en tension avec celui du I Ching (${elHexP}).',
    resonanciaNeutro: 'Les éléments sont neutres entre eux.',
    resonanciaSinPalo: 'Aucune coupe dominante claire ; le I Ching apporte ${elHexP} comme qualité de fond.',
    convergenciaTitulo: '2. Convergence du résultat :',
    convergenciaBase: 'La carte résultat (${cartaResultado}) et l\'hexagramme (${nombreHex}) se complètent.',
    convergenciaCierre: 'Tous deux coïncident à marquer une fermeture de cycle.',
    convergenciaInicio: 'Tous deux coïncident à signaler un commencement.',
    convergenciaTransformacion: 'La carte renversée et les lignes mutantes indiquent une transformation en cours.',
    convergenciaCarta: 'La carte pointe vers : « ${sigCarta}. » L\'hexagramme conseille : « ${consejo} »',
    trayectoriaTitulo: '3. Trajectoire évolutive :',
    trayectoria: 'L\'hexagramme futur (${nombreHexF}) et la carte du futur (${cartaFuturo}) marquent la direction.',
    sintesisTitulo: '4. Synthèse karmique :',
    sintesisKarmica: 'Arcanes majeurs + hexagramme archétypique : la situation touche des couches karmiques profondes.',
    sintesisDificultad: 'Renversées + hexagramme de difficulté : un travail intérieur est demandé avant l\'action extérieure.',
    sintesisAvance: 'Cartes à l\'endroit + hexagramme d\'avancée : moment favorable, saisissez l\'élan.',
    sintesisMixto: 'La combinaison peint un tableau nuancé : ni tout favorable ni tout adverse.'
  },
  recomendacion: {
    r1: 'Face à tant de renversées et un hexagramme de difficulté, ne forcez pas. Écoutez et nommez ce que vous ressentez. L\'action deviendra évidente quand les énergies céderont.',
    r2: 'L\'eau domine. Agissez depuis le ressenti, non depuis le calcul. Les émotions sont une information précieuse maintenant.',
    r3: 'La terre demande de la concrétude. Traduisez les intuitions en étapes pratiques. L\'abondance se matérialise quand elle se structure.',
    r4: 'Le feu demande du mouvement. La clarté viendra avec l\'action. Avancez avec décision sans brûler les ponts.',
    r5: 'L\'air demande de la clarté mentale. Définissez quoi communiquer et à qui. Un mot bien choisi vaut plus que plusieurs actions.',
    r6: 'La situation a un poids karmique. Alignez-vous avec le cycle. Ce qui semble un obstacle peut être la porte.',
    r7: 'La situation est vivante, en évolution. Soyez flexible pour ajuster le cap quand l\'énergie tournera.',
    r8: 'Tirage équilibré sans extrêmes. Combinez l\'écoute intérieure avec l\'action pratique. La stabilité est une base, non une destination.'
  },
  aviso: 'Cette analyse est une interprétation symbolique. Prenez-la comme un miroir pour la réflexion, non comme une prédiction déterministe.'
},

// ════════════════════════════════════════════════════════════════════════════
//  DEUTSCH
// ════════════════════════════════════════════════════════════════════════════
de: {
  titulo: '✦ Ganzheitliche Analyse ✦',
  subtitulo: 'Integrale Lesung von Tarot und I Ching · elementare Würden · Numerologie · Erzählung · Kreuzresonanzen',
  headers: {
    visionGeneral: '🌌 Allgemeine Übersicht',
    tematica: '🌟 Dominantes Thema im Tarot',
    alineacion: '🎯 Frage ↔ Legung Ausrichtung',
    lecturaIching: '☯️ I-Ching-Lesung',
    dinamicas: '⚙️ Tarot-Dynamiken und Muster',
    dignidades: '⚡ Elementare Beziehungen zwischen Karten',
    posicional: '📍 Detaillierte Positionslesung',
    narrativa: '🌀 Tarot-Ezählungssynthese',
    holistico: '🔮 Ganzheitliche Analyse Tarot ↔ I Ching',
    recomendacion: '✨ Integrierte Empfehlung'
  },
  exportHeaders: {
    visionGeneral: 'ALLGEMEINE ÜBERSICHT',
    tematica: 'TAROT-THEMA',
    alineacion: 'AUSRICHTUNG FRAGE ↔ LEGUNG',
    lecturaIching: 'I-CHING-LESUNG',
    dinamicas: 'TAROT-DYNAMIKEN UND MUSTER',
    dignidades: 'ELEMENTARE WÜRDEN ZWISCHEN KARTEN',
    posicional: 'DETAILLIERTE POSITIONSLESUNG',
    narrativa: 'TAROT-ERZÄHLUNGSSYNTHESE',
    holistico: 'GANZHEITLICHE ANALYSE TAROT ↔ I CHING',
    recomendacion: 'INTEGRIERTE EMPFEHLUNG'
  },
  lexicon: {
    love:    ['liebe','partner','paar','beziehung','freund','freundin','freundin','mann','ehemann','frau','ehefrau','ehe','ex','geliebter','verliebt','sich verlieben','herz','gefühl','affection','zuneigung','freundschaft','freund','romantisch'],
    money:   ['geld','arbeit','beschäftigung','gehalt','wirtschaft','finanzen','reich','reichtum','armut','arm','erbschaft','investition','geschäft','unternehmen','handel','verkauf','kaufen','verkaufen','schuld','kredit','bank','ersparnisse','kosten','preis'],
    conflict:['konflikt','streit','disput','streitigkeit','prozess','klage','verklagen','beschwerde','auseinandersetzung','rivale','feind','hass','groll','rache','verzeihen','vergebung','entschuldigung','trennung','scheidung'],
    work:    ['arbeit','beschäftigung','karriere','beruf','beförderung','chef','kollege','büro','projekt','geschäft','berufung','studium','prüfung','universität','schule','lernen','aufgabe','tätigkeit','funktion','stelle','position'],
    decision:['entscheiden','entscheidung','wählen','wahl','zweifel','option','alternative','weg','route','kreuzung','auswählen','abwägen','dilemma','kreuz','gabelung'],
    health:  ['gesundheit','krankheit','krank','körper','körperlich','schmerz','heilung','heilen','arzt','behandlung','krankenhaus','klinik','wohlbefinden','energie','vitalität','ermüdung','erschöpfung'],
    change:  ['wandel','verändern','verwandlung','umzug','umziehen','reise','bewegen','neu','neuanfang','beginnen','initiieren','lassen','loslassen','aufgeben','ende','beenden','abschluss','etappe','zyklus','schritt','phase','übergang'],
    fear:    ['angst','furcht','erschrocken','sorge','besorgnis','beklemmung','angst','unsicherheit','zweifel','ungewissheit','unruhe','panik','phobie','bedrohung','gefahr','risiko'],
    fire:    ['leidenschaft','feuer','begeisterung','energie','antrieb','aktion','initiative','kreativität','motivation','inbrunst','furia','wut','zorn','mut','tapferkeit','begeistern'],
    water:   ['emotion','gefühl','fühlen','träne','weinen','trauer','freude','glück','liebe','herz','intuition','traum','sensibel','sensibilität','zärtlichkeit','mitgefühl'],
    air:     ['denken','gedanke','idee','vernunft','logik','kommunikation','sprechen','sagen','wort','botschaft','klarheit','verwirrung','lügen','wahrheit','erklären','analysieren','studieren','lernen','unterscheiden'],
    earth:   ['körper','haus','zuhause','familie','erde','natur','stabilität','sicherheit','wurzel','basis','fundament','erbe','güter','besitz','feld','kultivieren','bauen','errichten','niederlassen','etablieren']
  },
  descripciones: {
    love: 'affektive oder romantische Beziehungen',
    money: 'materielle, wirtschaftliche oder finanzielle Themen',
    conflict: 'Konflikte, Streitigkeiten oder Spannungen',
    work: 'Arbeit, Beruf oder Studium',
    decision: 'Entscheidungen und Kreuzungen',
    health: 'körperliche Gesundheit oder Wohlbefinden',
    change: 'Veränderungen, Übergänge oder Transformationen',
    fear: 'Ängste, Sorgen oder Unsicherheiten'
  },
  tematicas: {
    copas: 'Die Farbe Kelche (Wasser) dominiert die Legung, was den Fokus auf das emotionale Terrain, die affektiven Bindungen und die Intuition richtet.',
    oros: 'Die Farbe Münzen (Erde) dominiert und signalisiert, dass der Schwerpunkt im Materiellen, Beruflichen oder Physischen liegt.',
    espadas: 'Die Farbe Schwerter (Luft) dominiert und betont den Verstand, die Kommunikation und die Konflikte.',
    bastos: 'Die Farbe Stäbe (Feuer) dominiert und deutet auf einen Moment des Handelns, der Leidenschaft und der Initiative.'
  },
  esperado: {
    love: 'copas', fear: 'copas',
    money: 'oros', work: 'oros', health: 'oros',
    conflict: 'espadas', decision: 'espadas',
    change: 'bastos'
  },
  plantilla: [
    null,
    'Die Gegenwart zeigt die zentrale Energie.',
    'Die Herausforderung repräsentiert die gekreuzte Kraft.',
    'Die Basis ist die unbewusste Wurzel.',
    'Die nahe Vergangenheit liefert den Vorlauf.',
    'Die Krone ist das Bewusste.',
    'Die nahe Zukunft signalisiert den Trend.',
    'Deine Haltung, was du einbringst.',
    'Das Umfeld, Personen und Umstände.',
    'Hoffnungen und Befürchtungen.',
    'Das Endergebnis, wohin die Energie strebt.'
  ],
  visionGeneral: {
    preguntaLabel: 'Frage/Absicht:',
    sinPregunta: '(Keine Frage angegeben — allgemeine Lesung des Moments)',
    contextoDestacado: 'Deine Frage/Absicht bezieht sich auf',
    contextoDestacadoFallback: 'deine Situation',
    contextoSinCategoria: 'Deine Frage/Absicht konzentriert sich auf ein allgemeines Thema ohne klar dominante thematische Kategorie.',
    contextoNoPregunta: 'Es wurde keine ausdrückliche Frage gestellt, daher wird die Lesung als allgemeine Bestandsaufnahme des aktuellen Lebensmoments angeboten.',
    cartaSingular: 'Karte',
    cartasPlural: 'Karten',
    arcanoSingular: 'Arkana',
    arcanosPlural: 'Arkana',
    mayorSingular: 'große',
    mayoresPlural: 'große',
    menorSingular: 'kleine',
    menoresPlural: 'kleine',
    invertidaSingular: 'umgekehrte',
    invertidasPlural: 'umgekehrte',
    tiradaNarrativa: 'Diese Legung von ${total} ${cartaWord} zeigt ${mayores} ${arcanoWord} ${mayorWord} (${pctMayores}%) und ${menores} ${menorWord}.',
    pctMayoresAlto: 'Die Mehrheit großer Arkana weist auf einen Moment tiefer Lebensbedeutung hin: tiefgreifende archetypische Kräfte sind im Spiel und die Ereignisse tragen ein Gewicht, das das Alltägliche übersteigt.',
    pctMayoresMedio: 'Das Gleichgewicht zwischen großen und kleinen Arkana deutet auf eine Mischung aus Alltäglichem und Bedeutsamem.',
    pctMayoresBajo: 'Die Vorherrschaft kleiner Arkana signalisiert, dass sich die Situation hauptsächlich auf der praktischen, alltäglichen Ebene abspielt.',
    invertidasNarrativa: 'Es gibt ${invertidas} ${invertidaWord} (${pctInvertidas}%).',
    pctInvertidasAlto: 'Die hohe Anzahl umgekehrter Karten weist auf blockierte Energien oder innere Aspekte hin, die noch nicht integriert sind.',
    pctInvertidasBajo: 'Die umgekehrten Karten deuten auf Bereiche, in denen sich die Energie schwer ausdrückt.',
    pctInvertidasCero: 'Alle Karten aufrecht zeigen, dass die Energien mit relativer Leichtigkeit fließen.',
    tematicaConcentracion: 'Die Konzentration in dieser Farbe ist bemerkenswert.',
    tematicaEquilibrada: 'Die Farben sind ausgeglichen, was anzeigt, dass die Situation mehrere Ebenen zugleich berührt.'
  },
  cruce: {
    resuena: 'Die dominante Farbe (${paloDom}) resont direkt mit dem Thema deiner Frage (${catDom}).',
    noResuena: 'Die dominante Farbe (${paloDom}) ist nicht die für ${catDom} erwartete. Die Antwort kommt aus einem anderen Blickwinkel.'
  },
  iching: {
    principal: 'Das Haupt-Hexagramm ist ${nombreHex} (Nr. ${numP}), gebildet aus ${trigInf} und ${trigSup}. ${sig} Der Rat lautet: ${consejo}',
    mutantes: 'Die mutierenden Linien (${lineas}) deuten auf eine Entwicklung hin zu ${nombreHexF} (Nr. ${numFuturo}). ${sigFuturo}',
    sinMutantes: 'Keine mutierenden Linien; die Situation präsentiert sich stabil.',
    errorHex: 'Das Hexagramm konnte nicht geladen werden.'
  },
  dinamicas: {
    ases: 'Vorhandensein von ${ases} Assen: mehrere Keime für neue Anfänge.',
    corte: 'Es gibt ${figTotal} Hofkarten: andere Personen spielen eine relevante Rolle.',
    reyes: 'Mehrere Könige: männliche Autoritäten üben Einfluss aus.',
    reinas: 'Mehrere Königinnen: weibliche Figuren stehen im Mittelpunkt.',
    numero: 'Die Zahl ${n} erscheint ${c}-mal: ihre numerologische Qualität wird verstärkt.',
    invertidas: 'Hoher Anteil an umgekehrten Karten (${pctInvertidas}%): innere Blockaden.'
  },
  dignidades: {
    amigable: '${c1Ref} und ${c2Ref} stehen in freundlicher Würde (${el1} + ${el2}).',
    tension: '${c1Ref} und ${c2Ref} stehen in Spannung (${el1} vs ${el2}).',
    neutro: 'Keine signifikanten elementaren Dynamiken zwischen benachbarten Karten beobachtet.'
  },
  posicional: {
    una: '${nombre} ${orientacion}: ${sig} Schlüsselwörter: ${kw}.',
    tresPasado: 'Die Vergangenheit hat diese Energie als Erbe hinterlassen.',
    tresPresente: 'In der Gegenwart beschreibt diese Karte die aktuelle Energie.',
    tresFuturo: 'In der nahen Zukunft zeichnet sich diese Energie als Tendenz ab.',
    tresCard: '${nombre} ${orientacion}. ${contexto} ${sig}',
    cruzCard: '${nombre} ${orientacion}. ${plantilla} ${sig}'
  },
  narrativa: {
    cruz: 'Von der Vergangenheit (${c4}) ist die Gegenwart durch ${c1} markiert, mit der Herausforderung ${c2}. Die Zukunft weist auf ${c6}, und das Ergebnis auf ${c10}.',
    tres: 'Der zeitliche Bogen spannt sich von ${c0} (Vergangenheit) zu ${c1} (Gegenwart), hin zu ${c2} (Zukunft).',
    una: 'Die einzelne Karte verdichtet Vergangenheit, Gegenwart und Zukunft in einer einzigen Energie.'
  },
  holistico: {
    resonanciaTitulo: '1. Elementare Resonanz:',
    resonanciaArmonia: 'Das Tarot-Element (${paloDomCanonico}) steht in Harmonie mit dem des I Ching (${elHexP}).',
    resonanciaTension: 'Das Tarot-Element (${paloDomCanonico}) steht in Spannung mit dem des I Ching (${elHexP}).',
    resonanciaNeutro: 'Die Elemente sind neutral zueinander.',
    resonanciaSinPalo: 'Keine dominante Farbe klar; das I Ching bringt ${elHexP} als Hintergrundqualität ein.',
    convergenciaTitulo: '2. Konvergenz des Ergebnisses:',
    convergenciaBase: 'Die Ergebniskarte (${cartaResultado}) und das Hexagramm (${nombreHex}) ergänzen sich.',
    convergenciaCierre: 'Beide deuten übereinstimmend auf einen Zyklusabschluss.',
    convergenciaInicio: 'Beide deuten übereinstimmend auf einen Anfang.',
    convergenciaTransformacion: 'Die umgekehrte Karte und die mutierenden Linien weisen auf eine Transformation im Gange.',
    convergenciaCarta: 'Die Karte weist auf: „${sigCarta}.“ Das Hexagramm rät: „${consejo}“',
    trayectoriaTitulo: '3. Evolutionäre Bahn:',
    trayectoria: 'Das zukünftige Hexagramm (${nombreHexF}) und die Karte der Zukunft (${cartaFuturo}) markieren die Richtung.',
    sintesisTitulo: '4. Karmische Synthese:',
    sintesisKarmica: 'Große Arkana + archetypisches Hexagramm: die Situation berührt tiefe karmische Schichten.',
    sintesisDificultad: 'Umgekehrte Karten + Hexagramm der Schwierigkeit: innere Arbeit wird vor äußeren Handeln verlangt.',
    sintesisAvance: 'Karten aufrecht + Hexagramm des Fortschritts: günstiger Moment, nutze den Schwung.',
    sintesisMixto: 'Die Kombination malt ein nuanciertes Bild: weder alles günstig noch alles abträchtig.'
  },
  recomendacion: {
    r1: 'Angesichts so vieler umgekehrter Karten und eines Hexagramms der Schwierigkeit, nichts erzwingen. Höre und benenne, was du fühlst. Die Handlung wird offensichtlich, wenn die Energien nachgeben.',
    r2: 'Wasser dominiert. Handle aus dem Fühlen, nicht aus dem Kalkül. Emotionen sind jetzt wertvolle Information.',
    r3: 'Die Erde fordert Konkretheit. Übersetze Intuitionen in praktische Schritte. Fülle materialisiert sich, wenn sie Struktur annimmt.',
    r4: 'Das Feuer fordert Bewegung. Klarheit wird mit dem Handeln kommen. Trete entschieden voran, ohne Brücken zu verbrennen.',
    r5: 'Die Luft fordert mentale Klarheit. Definiere, was du wem mitteilst. Ein gut gewähltes Wort wiegt mehr als mehrere Handlungen.',
    r6: 'Die Situation hat karmisches Gewicht. Richte dich auf den Zyklus aus. Was wie ein Hindernis scheint, kann die Tür sein.',
    r7: 'Die Situation ist lebendig, in Entwicklung. Sei flexibel, um den Kurs anzupassen, wenn die Energie sich wendet.',
    r8: 'Ausgeglichene Legung ohne Extreme. Verbinde innere Achtsamkeit mit praktischem Handeln. Stabilität ist eine Basis, kein Ziel.'
  },
  aviso: 'Diese Analyse ist eine symbolische Interpretation. Verstehe sie als Spiegel zur Reflexion, nicht als deterministische Vorhersage.'
},

// ════════════════════════════════════════════════════════════════════════════
//  ITALIANO
// ════════════════════════════════════════════════════════════════════════════
it: {
  titulo: '✦ Analisi Olistica ✦',
  subtitulo: 'Lettura integrale di Tarocchi e I Ching · dignità elementali · numerologia · narrazione · risonanze incrociate',
  headers: {
    visionGeneral: '🌌 Visione Generale',
    tematica: '🌟 Tematica Dominante nei Tarocchi',
    alineacion: '🎯 Allineamento Domanda ↔ Stesura',
    lecturaIching: '☯️ Lettura dell\'I Ching',
    dinamicas: '⚙️ Dinamiche e Pattern dei Tarocchi',
    dignidades: '⚡ Relazioni Elementali tra Carte',
    posicional: '📍 Lettura Posizionale Dettagliata',
    narrativa: '🌀 Sintesi Narrativa dei Tarocchi',
    holistico: '🔮 Analisi Olistica Tarocchi ↔ I Ching',
    recomendacion: '✨ Raccomandazione Integrata'
  },
  exportHeaders: {
    visionGeneral: 'VISIONE GENERALE',
    tematica: 'TEMATICA TAROCCHI',
    alineacion: 'ALLINEAMENTO DOMANDA ↔ STESURA',
    lecturaIching: 'LETTURA DELL\'I CHING',
    dinamicas: 'DINAMICHE E PATTERN TAROCCHI',
    dignidades: 'DIGNITÀ ELEMENTALI TRA CARTE',
    posicional: 'LETTURA POSIZIONALE DETTAGLIATA',
    narrativa: 'SINTESI NARRATIVA TAROCCHI',
    holistico: 'ANALISI OLISTICA TAROCCHI ↔ I CHING',
    recomendacion: 'RACCOMANDAZIONE INTEGRATA'
  },
  lexicon: {
    love:    ['amore','coppia','partner','relazione','fidanzato','fidanzata','marito','moglie','matrimonio','ex','amante','innamorato','innamorarsi','cuore','cuore','sentimento','affetto','amicizia','amico','amica','romantico'],
    money:   ['soldi','denaro','lavoro','impiego','stipendio','economia','finanze','ricco','ricchezza','povertà','povero','eredità','investimento','affare','impresa','commercio','vendita','comprare','vendere','debito','credito','banca','risparmio','costo','prezzo'],
    conflict:['conflitto','lite','discussione','disputa','causa','processo','citare','denuncia','scontro','confronto','rivale','nemico','odio','rancore','vendetta','perdonare','perdono','scusa','rottura','separazione'],
    work:    ['lavoro','impiego','carriera','professione','promozione','capo','collega','ufficio','progetto','affare','vocazione','studio','esame','università','scuola','apprendimento','compito','lavoro','funzione','ruolo','posizione'],
    decision:['decidere','decisione','scegliere','scelta','dubbio','dubitare','opzione','alternativa','percorso','strada','bivio','selezionare','pesare','dilemma','crocevia','biforcazione'],
    health:  ['salute','malattia','malato','corpo','fisico','dolore','cura','curare','guarigione','medico','trattamento','ospedale','clinica','benessere','energia','vitalità','stanchezza','spossatezza'],
    change:  ['cambio','cambiare','trasformazione','trasloco','traslocare','viaggio','muovere','nuovo','nuova','inizio','iniziare','avviare','lasciare','lasciar andare','abbandonare','fine','terminare','chiusura','tappa','ciclo','passo','fase','transizione'],
    fear:    ['paura','timore','spaventato','preoccupazione','preoccuparsi','angoscia','ansia','insicurezza','dubbio','incertezza','inquietudine','panico','fobia','minaccia','pericolo','rischio'],
    fire:    ['passione','fuoco','entusiasmo','energia','impulso','azione','iniziativa','creatività','motivazione','ardore','furia','rabbia','ira','coraggio','prodezza','appassionare'],
    water:   ['emozione','sentire','sentimento','lacrima','pianto','tristezza','gioia','felicità','amore','cuore','intuizione','sogno','sensibile','sensibilità','tenerezza','compassione'],
    air:     ['pensare','pensiero','idea','ragione','logica','comunicazione','parlare','dire','parola','messaggio','chiarezza','confusione','mentire','verità','spiegare','analizzare','studiare','imparare','discernere'],
    earth:   ['corpo','casa','focolare','famiglia','terra','natura','stabilità','sicurezza','radice','base','fondamenta','patrimonio','beni','possesso','campo','coltivare','costruire','edificare','insediare','stabilire']
  },
  descripciones: {
    love: 'relazioni affettive o amorose',
    money: 'temi materiali, economici o finanziari',
    conflict: 'conflitti, dispute o tensioni',
    work: 'lavoro, professione o studi',
    decision: 'decisioni e bivi',
    health: 'salute fisica o benessere',
    change: 'cambiamenti, transizioni o trasformazioni',
    fear: 'paure, preoccupazioni o insicurezze'
  },
  tematicas: {
    copas: 'Il seme di Coppe (Acqua) domina la stesura, ponendo il focus sul terreno emotivo, i legami affettivi e l\'intuizione.',
    oros: 'Il seme di Denari (Terra) domina, segnalando che il centro di gravità è nel materiale, nel lavorativo o nel fisico.',
    espadas: 'Il seme di Spade (Aria) domina, ponendo l\'accento sulla mente, la comunicazione e i conflitti.',
    bastos: 'Il seme di Bastoni (Fuoco) domina, indicando un momento di azione, passione e iniziativa.'
  },
  esperado: {
    love: 'copas', fear: 'copas',
    money: 'oros', work: 'oros', health: 'oros',
    conflict: 'espadas', decision: 'espadas',
    change: 'bastos'
  },
  plantilla: [
    null,
    'Il Presente mostra l\'energia centrale.',
    'La Sfida rappresenta la forza che si incrocia.',
    'La Base è la radice inconscia.',
    'Il Passato Recente apporta l\'antecedente.',
    'La Corona è ciò che è cosciente.',
    'Il Futuro Prossimo segnala la tendenza.',
    'Il Tuo Atteggiamento, ciò che porti.',
    'L\'Ambiente, persone e circostanze.',
    'Speranze e Timori.',
    'Il Risultato Finale, verso dove si dirige l\'energia.'
  ],
  visionGeneral: {
    preguntaLabel: 'Domanda/intenzione:',
    sinPregunta: '(Nessuna domanda specificata — lettura generale del momento)',
    contextoDestacado: 'La tua domanda/intenzione verte su',
    contextoDestacadoFallback: 'la tua situazione',
    contextoSinCategoria: 'La tua domanda/intenzione si concentra su un tema generale senza una categoria tematica dominante chiara.',
    contextoNoPregunta: 'Non è stata formulata una domanda esplicita, pertanto la lettura è offerta come radiografia generale dell\'attuale momento vitale.',
    cartaSingular: 'carta',
    cartasPlural: 'carte',
    arcanoSingular: 'arcano',
    arcanosPlural: 'arcani',
    mayorSingular: 'maggiore',
    mayoresPlural: 'maggiori',
    menorSingular: 'minore',
    menoresPlural: 'minori',
    invertidaSingular: 'rovesciata',
    invertidasPlural: 'rovesciate',
    tiradaNarrativa: 'Questa stesura di ${total} ${cartaWord} mostra ${mayores} ${arcanoWord} ${mayorWord} (${pctMayores}%) e ${menores} ${menorWord}.',
    pctMayoresAlto: 'La presenza maggioritaria di arcani maggiori indica un momento di forte spessore vitale: forze archetipiche profonde sono in gioco e gli eventi hanno un peso che trascende il quotidiano.',
    pctMayoresMedio: 'L\'equilibrio tra arcani maggiori e minori suggerisce un misto del quotidiano con il significativo.',
    pctMayoresBajo: 'Il predominio di arcani minori segnala che la situazione si sviluppa principalmente sul piano pratico e quotidiano.',
    invertidasNarrativa: 'Vi sono ${invertidas} ${invertidaWord} (${pctInvertidas}%).',
    pctInvertidasAlto: 'L\'alto numero di rovesciate indica energie bloccate o aspetti interni non ancora integrati.',
    pctInvertidasBajo: 'Le carte rovesciate segnalano zone dove l\'energia si esprime con difficoltà.',
    pctInvertidasCero: 'Tutte le carte al dritto indicano che le energie fluiscono con relativa facilità.',
    tematicaConcentracion: 'La concentrazione in questo seme è notevole.',
    tematicaEquilibrada: 'I semi sono equilibrati, il che indica che la situazione tocca diversi piani in una volta.'
  },
  cruce: {
    resuena: 'Il seme dominante (${paloDom}) risuena direttamente con la tematica della tua domanda (${catDom}).',
    noResuena: 'Il seme dominante (${paloDom}) non è quello atteso per ${catDom}. La risposta arriva da un\'angolazione diversa.'
  },
  iching: {
    principal: 'L\'esagramma principale è ${nombreHex} (nº ${numP}), formato da ${trigInf} e ${trigSup}. ${sig} Il consiglio è: ${consejo}',
    mutantes: 'Le linee mutanti (${lineas}) indicano evoluzione verso ${nombreHexF} (nº ${numFuturo}). ${sigFuturo}',
    sinMutanti: 'Senza linee mutanti, la situazione si presenta stabile.',
    errorHex: 'Non è stato possibile caricare l\'esagramma.'
  },
  dinamicas: {
    ases: 'Presenza di ${ases} Assi: diversi semi di nuovi inizi.',
    corte: 'Vi sono ${figTotal} carte di corte: altre persone giocano un ruolo rilevante.',
    reyes: 'Diversi Re: autorità maschili influenzano.',
    reinas: 'Diverse Regine: figure femminili sono centrali.',
    numero: 'Il numero ${n} appare ${c} volte: la sua qualità numerologica si rafforza.',
    invertidas: 'Alta percentuale di rovesciate (${pctInvertidas}%): blocchi interni.'
  },
  dignidades: {
    amigable: '${c1Ref} e ${c2Ref} sono in dignità amichevole (${el1} + ${el2}).',
    tension: '${c1Ref} e ${c2Ref} sono in tensione (${el1} vs ${el2}).',
    neutro: 'Non si osservano dinamiche elementali significative tra carte adiacenti.'
  },
  posicional: {
    una: '${nombre} ${orientacion}: ${sig} Parole chiave: ${kw}.',
    tresPasado: 'Il passato ha lasciato questa energia come eredità.',
    tresPresente: 'Nel presente, questa carta descrive l\'energia attuale.',
    tresFuturo: 'Nel futuro prossimo, questa energia si profila come tendenza.',
    tresCard: '${nombre} ${orientacion}. ${contexto} ${sig}',
    cruzCard: '${nombre} ${orientacion}. ${plantilla} ${sig}'
  },
  narrativa: {
    cruz: 'Dal passato (${c4}), il presente è segnato da ${c1}, con sfida ${c2}. Il futuro punta a ${c6}, e il risultato a ${c10}.',
    tres: 'L\'arco temporale va da ${c0} (passato) a ${c1} (presente), verso ${c2} (futuro).',
    una: 'La carta unica condensa passato, presente e futuro in una sola energia.'
  },
  holistico: {
    resonanciaTitulo: '1. Risonanza elementale:',
    resonanciaArmonia: 'L\'elemento dei Tarocchi (${paloDomCanonico}) è in armonia con quello dell\'I Ching (${elHexP}).',
    resonanciaTension: 'L\'elemento dei Tarocchi (${paloDomCanonico}) è in tensione con quello dell\'I Ching (${elHexP}).',
    resonanciaNeutro: 'Gli elementi sono neutri tra loro.',
    resonanciaSinPalo: 'Nessun seme dominante chiaro; l\'I Ching apporta ${elHexP} come qualità di fondo.',
    convergenciaTitulo: '2. Convergenza del risultato:',
    convergenciaBase: 'La carta risultato (${cartaResultado}) e l\'esagramma (${nombreHex}) si completano.',
    convergenciaCierre: 'Entrambi coincidono nel segnare una chiusura di ciclo.',
    convergenciaInicio: 'Entrambi coincidono nel segnalare un inizio.',
    convergenciaTransformacion: 'La carta rovesciata e le linee mutanti indicano trasformazione in corso.',
    convergenciaCarta: 'La carta punta a: «${sigCarta}.» L\'esagramma consiglia: «${consejo}»',
    trayectoriaTitulo: '3. Traiettoria evolutiva:',
    trayectoria: 'L\'esagramma futuro (${nombreHexF}) e la carta del futuro (${cartaFuturo}) segnando la direzione.',
    sintesisTitulo: '4. Sintesi karmica:',
    sintesisKarmica: 'Arcani maggiori + esagramma archetipico: la situazione tocca strati karmici profondi.',
    sintesisDificultad: 'Rovesciate + esagramma di difficoltà: si richiede lavoro interiore prima dell\'azione esteriore.',
    sintesisAvance: 'Carte al dritto + esagramma di avanzamento: momento favorevole, cogli lo slancio.',
    sintesisMixto: 'La combinazione dipinge un quadro sfumato: né tutto favorevole né tutto avverso.'
  },
  recomendacion: {
    r1: 'Di fronte a tante rovesciate ed esagramma di difficoltà, non forzare. Ascolta e nomina ciò che senti. L\'azione diventerà evidente quando le energie cederanno.',
    r2: 'L\'acqua domina. Agisci dal sentire, non dal calcolo. Le emozioni sono informazione preziosa ora.',
    r3: 'La terra chiede concretezza. Traduci intuizioni in passi pratici. L\'abbondanza si materializza quando si struttura.',
    r4: 'Il fuoco chiede movimento. La chiarezza verrà con l\'azione. Avanza con decisione senza bruciare ponti.',
    r5: 'L\'aria chiede chiarezza mentale. Definisci cosa comunicare e a chi. Una parola ben scelta vale più di diverse azioni.',
    r6: 'La situazione ha peso karmico. Allineati con il ciclo. Ciò che sembra ostacolo può essere la porta.',
    r7: 'La situazione è viva, in evoluzione. Sii flessibile per aggiustare la rotta quando l\'energia gira.',
    r8: 'Stesura equilibrata senza estremi. Combina ascolto interiore con azione pratica. La stabilità è una base, non una destinazione.'
  },
  aviso: 'Questa analisi è un\'interpretazione simbolica. Prendila come specchio per la riflessione, non come previsione deterministica.'
}

}; // end T

// ─────────────────────────────────────────────────────────────────────────────
//  WRITE TO FILES
// ─────────────────────────────────────────────────────────────────────────────

const langs = ['es', 'en', 'pt', 'fr', 'de', 'it'];

let ok = 0, skip = 0;
for (const lang of langs) {
  const filePath = path.join(LOCALES_DIR, `datos-maestros-${lang}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`[WARN] File not found: ${filePath}`);
    continue;
  }

  // Read existing content
  const raw = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`[ERROR] Could not parse ${filePath}: ${e.message}`);
    continue;
  }

  // Add or replace the analisisTarot section
  data.analisisTarot = T[lang];

  // Write back with 2-space indentation
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`[OK]   ${lang} → ${path.basename(filePath)}`);
  ok++;
}

console.log(`\nDone. Updated ${ok} file(s).`);