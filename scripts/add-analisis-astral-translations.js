#!/usr/bin/env node
/**
 * add-analisis-astral-translations.js
 *
 * Adds the "analisisAstral" section to every datos-maestros-{lang}.json file
 * (es, en, pt, fr, de, it) in js/i18n/locales/.
 *
 * Source of truth: js/core/astrologia-analisis.js
 * Spanish (es) is the original; the rest are high-quality translations
 * with a psychological / spiritual / therapeutic tone.
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'js', 'i18n', 'locales');

// ─────────────────────────────────────────────────────────────────────────────
//  TRANSLATIONS
//  Keys are kept consistent across all languages:
//    - SQ keys: Spanish sign names (Aries, Tauro, Géminis, ...)
//    - PA keys: English planet names (Sun, Moon, ...)
//    - CT keys: house numbers as strings ("1".."12")
//    - SE/ET/EI keys: element names (translated per language)
//    - MT keys: modality names (translated per language)
// ─────────────────────────────────────────────────────────────────────────────

const T = {

// ════════════════════════════════════════════════════════════════════════════
//  ESPAÑOL  (source language — verbatim from the JS file)
// ════════════════════════════════════════════════════════════════════════════
es: {
  titulo: '✦ Análisis Astral Oracular ✦',
  subtitulo: 'Un viaje psicológico a través de tu mapa natal',
  secciones: {
    s1_titulo: '1. El Eje de tu Ser (Tu Gran Trío)',
    s2_titulo: '2. Tu Huella Energética',
    s3_titulo: '3. Los Escenarios de tu Vida',
    s4_titulo: '4. El Motor de tu Crecimiento',
    s5_titulo: '5. Tu Brújula Kármica',
    s6_titulo: '6. El Consejo del Oráculo'
  },
  SQ: {
    'Aries': 'iniciativa, valentía y un impulso pionero que abre camino donde otros ven muros',
    'Tauro': 'estabilidad, paciencia y una sensualidad arraigada a lo tangible y duradero',
    'Géminis': 'curiosidad, versatilidad mental y una sed insaciable de conectar ideas y personas',
    'Cáncer': 'sensibilidad protectora, memoria emocional y un vínculo profundo con la raíz y el cuidado',
    'Leo': 'orgallo creativo, calidez y una necesidad irrenunciable de brillar y ser reconocido',
    'Virgo': 'análisis, servicio y un afán perfeccionista que busca la maestría en lo práctico',
    'Libra': 'equilibrio, diplomacia y una búsqueda constante de armonía y belleza en los vínculos',
    'Escorpio': 'intensidad, penetración y una capacidad de sumergirse en lo oculto y renacer transformado',
    'Sagitario': 'expansión, fe y una búsqueda entusiasta de sentido, verdad y horizontes amplios',
    'Capricornio': 'ambición, disciplina y una voluntad de construir paso a paso hacia lo perdurable',
    'Acuario': 'originalidad, idealismo y una visión de futuro que desafía lo establecido por convicción',
    'Piscis': 'empatía, imaginación y una entrega a lo invisible y lo universal que borra las fronteras'
  },
  SE: {
    'Aries': 'Fuego', 'Leo': 'Fuego', 'Sagitario': 'Fuego',
    'Tauro': 'Tierra', 'Virgo': 'Tierra', 'Capricornio': 'Tierra',
    'Géminis': 'Aire', 'Libra': 'Aire', 'Acuario': 'Aire',
    'Cáncer': 'Agua', 'Escorpio': 'Agua', 'Piscis': 'Agua'
  },
  ET: {
    'Fuego': 'pasión, inspiración y un impulso de acción que necesita combustible',
    'Tierra': 'pragmatismo, estabilidad y un anclaje en lo concreto y duradero',
    'Aire': 'mentalidad, sociabilidad y un hambre de comunicación e ideas',
    'Agua': 'emocionalidad, intuición y una capacidad de sentir y conectar a profundidad'
  },
  EI: {
    'Fuego': 'la llama que baila',
    'Tierra': 'la montaña que perdura',
    'Aire': 'el viento que dispersa semillas',
    'Agua': 'el océano que todo lo acoge'
  },
  MT: {
    'Cardinal': 'iniciativa para emprender, liderazgo y un empuje que arranca los ciclos',
    'Fijo': 'perseverancia, estabilidad y una resistencia que sostiene cuando otros ceden',
    'Mutable': 'adaptabilidad, fluidez y un talento para transitar entre mundos y etapas'
  },
  PA: {
    'Sun': 'tu identidad esencial, la chispa vital y el propósito que te hace sentir auténtico',
    'Moon': 'tu mundo emocional, tus necesidades íntimas y la forma de nutrir y descansar',
    'Mercury': 'tu mente, tu palabra y la forma de tejer pensamientos y conectar ideas',
    'Venus': 'tu capacidad de amar, tus valores y tu sensibilidad para la belleza y el disfrute',
    'Mars': 'tu coraje, tu deseo y la energía que pones en perseguir lo que quieres',
    'Jupiter': 'tu fe, tu expansión y la búsqueda de sentido y verdad',
    'Saturn': 'tu disciplina, tus límites y las lecciones que estructuran tu madurez',
    'Uranus': 'tu originalidad, tu rebeldía y el destello de intuición que rompe lo establecido',
    'Neptune': 'tu imaginación, tu espiritualidad y el velo entre el sueño y la entrega',
    'Pluto': 'tu poder de transformación, tu sombra y la capacidad de morir y renacer',
    'N Node': 'tu camino kármico de crecimiento, la dirección que asusta pero expande',
    'Chiron': 'la herida que se vuelve sanadora y sabiduría',
    'Lilith': 'tu yo salvaje y oculto, lo instintivo que pide ser reconocido sin vergüenza'
  },
  CT: {
    '1': 'tu cuerpo y la forma en que el mundo te percibe al primer encuentro',
    '2': 'tus finanzas, tus recursos personales y el sentido de lo que te pertenece',
    '3': 'tu mente cotidiana, tu comunicación y el intercambio constante con tu entorno',
    '4': 'tu hogar, tus raíces y el refugio íntimo donde descansas la armadura',
    '5': 'tu creatividad, tu forma de jugar y enamorarte y el lugar donde te atreves a crear',
    '6': 'tu trabajo cotidiano, tu salud y los hábitos que sostienen tu vida día a día',
    '7': 'tus vínculos íntimos, tus parejas y los contratos que sellas con el otro',
    '8': 'la transformación, la intimidad profunda y todo lo que compartes y dejas ir',
    '9': 'tu búsqueda de sentido, los estudios que te ensanchan y los horizontes que te llaman',
    '10': 'tu vocación, tu carrera y el reconocimiento público que construyes paso a paso',
    '11': 'tus amigos, tus ideales y las comunidades donde tu visión se encuentra con la de otros',
    '12': 'tu intuición, tu inconsciente y los ciclos de cierre que preparan tu siguiente renacimiento'
  },
  aperturas: [
    'Tu ${area} busca la ${cualidadCorta} de ${signo}: ${cualidad}',
    'Cuando se trata de ${area}, ${signo} imprime su sello —${cualidad}—',
    'El espacio de ${area} respira en ${signo}, aportando ${cualidad}',
    'Tu carta sitúa ${area} bajo la firma de ${signo}: ${cualidad}',
    'En el terreno de ${area}, ${signo} deja su huella —${cualidad}—'
  ],
  conectores: [
    'aunque la presencia de ${planeta} en ${signo} lo matiza con ${cualidad}',
    'mientras que ${planeta} en ${signo} aporta ${cualidad}',
    'y se completa con ${planeta} en ${signo}, que trae ${cualidad}',
    'pero ${planeta} en ${signo} añade una capa de ${cualidad}',
    'donde ${planeta} en ${signo} introduce ${cualidad}'
  ],
  retroFrases: [
    ', una fuerza que primero se cocina a fuego lento dentro de ti antes de manifestarse al exterior',
    ' y, al estar retrogrado, se vive como un diálogo interior constante antes de volverse acción visible',
    ', retrogrado, lo que significa que esta cualidad se refina en la intimidad antes de proyectarse'
  ],
  grupos: [
    'La Identidad y la Materia (Casas 1, 2 y 3)',
    'El Refugio y el Servicio (Casas 4, 5 y 6)',
    'El Espejo y la Expansión (Casas 7, 8 y 9)',
    'La Cima y el Inconsciente (Casas 10, 11 y 12)'
  ],
  narrativa: {
    s1_asc: 'La primera impresión que ofreces al mundo viene marcada por tu <strong>Ascendente en ${ascS}</strong>: ${sqAsc}. ',
    s1_mascara: 'Es la máscara que vistes sin esfuerzo, tu envoltura visible, y también el cristal a través del cual filtras todo lo que la vida te trae. ',
    s1_sol: 'Detrás de esa máscara arde tu <strong>Sol en ${solS}</strong>, el núcleo irrenunciable de quien eres: ${sqSol}. ',
    s1_solLuz: 'Es la luz que buscas encarnar, la identidad esencial que te hace sentir auténtico cuando la vives plenamente. ',
    s1_lunaConj: 'Y lo realmente notable es que tu <strong>Luna también se encuentra en ${solS}</strong>, fundiéndose con tu Sol en una conjunción que se vive como una Luna Nueva natal. ',
    s1_lunaConj2: 'Tu identidad consciente y tus necesidades emocionales laten al unísono en ${solSLower}, creando una coherencia interior de una intensidad poco común: sabes lo que sientes y sientes lo que eres. ',
    s1_lunaConj3: 'Toda la fuerza de ${sqSol} se concentra en ti de manera masiva, lo que te da un autoconocimiento sólido pero también concentra la tensión evolutiva en un único signo. ',
    s1_contrasteAscSol: 'Sin embargo, el contraste con tu Ascendente es evidente: aunque por fuera proyectas ${eiAsc}, tu interior es ${eiSol}. ',
    s1_contrasteAscSol2: 'Esa distancia entre la apariencia y el núcleo es exactamente el terreno donde se juega tu evolución, el espacio donde te descubres a ti mismo y aprendes a reconciliar lo que muestras con lo que eres.',
    s1_coherencia: 'La coherencia entre tu apariencia y tu núcleo te da una presencia sólida y magnética, aunque a veces puede costarte sorprender o salirte de ti mismo.',
    s1_luna: 'En lo más hondo, tu <strong>Luna en ${lunaS}</strong> rige lo que no siempre muestras: ${sqLuna}. ',
    s1_lunaRefugio: 'Es el refugio emocional donde te nutres y descansas, la parte que gobierna tus reacciones instintivas y tus necesidades más íntimas. ',
    s1_contrasteSolLuna: 'El contraste entre tu centro y tu emocionalidad es vivo: tu Sol arde en ${etSol} mientras tu Luna fluye con ${etLuna}. ',
    s1_polaridad1: 'Esa polaridad interior es a la vez tu riqueza y tu tensión, pues una parte de ti busca ${buscaSol} mientras otra necesita ${necesitaLuna}. ',
    s1_triangulacion: 'A pesar de ello, la triangulación se completa con tu Ascendente: aunque muestras ${eiAsc} al mundo, por dentro vives entre ${eiSol} y ${eiLuna}. ',
    s1_triangulacion2: 'Ese contraste te da profundidad y misterio: no eres lo que pareces a primera vista, y el viaje de descubrirte a ti mismo es parte esencial de tu camino.',
    s1_eje: 'Estas tres energías dibujan el eje sobre el que se sostiene todo lo demás en tu carta: la máscara, el centro y el refugio, cada uno con su propio color pero formando una identidad única.',

    s2_predominio: 'Tu carácter está impregnado por el predominio del elemento <strong>${domEl}</strong> (${domElC} colocaciones), lo que se traduce en ${etDom}. ',
    s2_concentrado: 'Es una concentración tan intensa que ${eiDom} es prácticamente tu elemento natural, el espacio donde te sientes en casa y donde tu energía fluye sin esfuerzo. ',
    s2_tendencia: 'Es una tendencia clara que matiza tu forma de estar en el mundo. ',
    s2_ausencia: 'La ausencia total de <strong>${weakEl}</strong> es reveladora: ${etWeak} no viene de forma natural, así que tendrás que cultivarlo conscientemente a lo largo de tu vida. ',
    s2_debil: 'El elemento <strong>${weakEl}</strong> aparece apenas ${weakElC} vez, un punto sensible que merece cuidado y atención. ',
    s2_debil2: 'El elemento <strong>${weakEl}</strong> está presente aunque en menor medida (${weakElC}), aportando un contrapunto a tu tendencia dominante. ',
    s2_modalidad: 'Tu forma de moverte por la vida tiene un sello <strong>${domMod}</strong> (${domModC}): ${mtDom}. ',
    s2_yang: 'Predomina la energía yang (${masculine}/${feminine}), así que la acción y la exterioridad te resultan naturales, aunque deberás recordar que la verdadera fuerza también sabe detenerse y escuchar. ',
    s2_yin: 'Predomina la energía yin (${feminine}/${masculine}), así que la receptividad y la introspección son tu refugio, aunque deberás recordar salir al mundo y manifestar lo que se siembra en silencio. ',
    s2_equilibrio: 'El equilibrio entre yang y yin (${masculine}/${feminine}) te da una base estable desde la que puedes elegir conscientemente. ',

    s2_stellium: 'Curiosamente, gran parte de tu energía vital se concentra en el ámbito de ${areaStellium}, donde se reúnen ${numPlanetas} planetas: ${planetasLista}. ',
    s2_stellium2: 'Esta concentración convierte esa área en el motor principal de tu vida: es donde sientes la mayor presión, pero también donde reside tu mayor potencial. ',
    s2_stellium3: 'No es casualidad que tantas voces interiores apunten al mismo lugar —la carta te señala por dónde pasa tu transformación más profunda.',
    s2_noStellium: 'No hay concentraciones extremas en tu carta: tu energía está repartida entre varias áreas, lo que te da versatilidad y evita que una sola zona monopolice tu existencia.',

    s4_sinAspectos: 'No se detectan aspectos tensos estrechos en tu carta, lo que indica que tu energía fluye con una armonía predominante. Esto te da una base serena, aunque te invita a cultivar voluntariamente el empuje que la tensión suele regalar.',
    s4_conj1: '<strong>${p1} y ${p2} en conjunción</strong> (orbe ${orbStr}). ',
    s4_conj2: '${desc1Cap} y ${desc2} se funden en tu interior, creando una alianza inseparable. ',
    s4_conj3: 'Esta fusión te da una potencia poco común en ese terreno de tu vida, pero el verdadero desafío reside en integrar ambas voces sin que ninguna silencie a la otra.',
    s4_opp1: '<strong>${p1} en oposición a ${p2}</strong> (orbe ${orbStr}). ',
    s4_opp2: 'Sientes un tira y afloja constante entre ${desc1} y ${desc2}. ',
    s4_opp3: 'El desafío no es elegir un lado y reprimir el otro, sino sostener la tensión hasta que ambas fuerzas se alimenten mutuamente y aprendas a habitar la paradoja.',
    s4_sq1: '<strong>${p1} en cuadratura con ${p2}</strong> (orbe ${orbStr}). ',
    s4_sq2: 'La fricción entre ${desc1} y ${desc2} se siente como un roce constante en tu interior. ',
    s4_sq3: 'Sin embargo, esa incomodidad es el motor de tu crecimiento: lo que te cuesta integrar es exactamente lo que te madura y te da profundidad.',
    s4_tri1: '<strong>${p1} en trígono con ${p2}</strong> (orbe ${orbStr}). ',
    s4_tri2: '${desc1Cap} y ${desc2} fluyen en armonía natural. ',
    s4_tri3: 'Esta alianza es un don: ambas fuerzas se potencian sin esfuerzo, y tu desafío es no darlas por sentadas sino usarlas conscientemente.',
    s4_sex1: '<strong>${p1} en sextil con ${p2}</strong> (orbe ${orbStr}). ',
    s4_sex2: 'Hay un canal abierto entre ${desc1} y ${desc2}, una oportunidad que pide ser activada. ',
    s4_sex3: 'La facilidad está ahí, pero deberás tomar la iniciativa para aprovecharla.',

    s5_nodoN: 'Tu evolución te llama hacia el <strong>Nodo Norte en ${signo}</strong>: ${sqSigno}. ',
    s5_nodoN2: 'Es la dirección que asusta porque es nueva, pero es también la que te expande y te devuelve a quien estás llamado a ser. ',
    s5_nodoS: 'De ella te despides del <strong>Nodo Sur en ${signo}</strong>, la zona de confort que ya dominas y desde la que debes despegarte para no estancarte. ',
    s5_lilith: 'Tu poder instintivo y salvaje reside en <strong>Lilith en ${signo}</strong>: ${sqSigno}, la parte de ti que pide ser reconocida sin vergüenza ni domesticación. ',
    s5_fortuna: 'Y tu flujo de la suerte brilla en la <strong>Parte de la Fortuna en ${signo}</strong>, el ámbito donde la alegría natural te espera cuando alineas tu identidad, tu emoción y tu forma de presentarte al mundo. ',

    s6_yang: 'Tu carta arde en yang: recuerda que la verdadera fuerza también sabe detenerse y escucharse. ',
    s6_yin: 'Tu carta fluye en yin: recuerda que lo sembrado en silencio pide también ser manifestado en el mundo. ',
    s6_equil: 'Tu carta equilibra impulso y contención: elige conscientemente desde esa base sólida. ',
    s6_stellium: 'La concentración en el área de ${areaStellium} es tu brújula y tu carga: ahí está tu mayor potencial. ',
    s6_cierre: 'La carta es un mapa, no una condena —lo que parece tensión es materia prima para tu crecimiento, y la única magia verdadera es elegir, con conciencia plena, quién quieres ser.',

    avisoFinal: 'Este análisis es una interpretación simbólica de tu carta astral. Tómalo como espejo para la reflexión y el autoconocimiento, no como pronóstico determinista.'
  }
},

// ════════════════════════════════════════════════════════════════════════════
//  ENGLISH
// ════════════════════════════════════════════════════════════════════════════
en: {
  titulo: '✦ Oracular Astral Analysis ✦',
  subtitulo: 'A psychological journey through your natal chart',
  secciones: {
    s1_titulo: '1. The Axis of Your Being (Your Grand Trine)',
    s2_titulo: '2. Your Energetic Signature',
    s3_titulo: '3. The Scenarios of Your Life',
    s4_titulo: '4. The Engine of Your Growth',
    s5_titulo: '5. Your Karmic Compass',
    s6_titulo: '6. The Oracle\'s Counsel'
  },
  SQ: {
    'Aries': 'initiative, courage and a pioneering drive that opens paths where others see walls',
    'Tauro': 'stability, patience and a sensuality rooted in the tangible and the enduring',
    'Géminis': 'curiosity, mental versatility and an insatiable thirst to connect ideas and people',
    'Cáncer': 'protective sensitivity, emotional memory and a deep bond with roots and care',
    'Leo': 'creative pride, warmth and an unrenounceable need to shine and be recognised',
    'Virgo': 'analysis, service and a perfectionist drive that seeks mastery in the practical',
    'Libra': 'balance, diplomacy and a constant search for harmony and beauty in relationships',
    'Escorpio': 'intensity, penetration and a capacity to dive into the hidden and be reborn transformed',
    'Sagitario': 'expansion, faith and an enthusiastic search for meaning, truth and wide horizons',
    'Capricornio': 'ambition, discipline and a will to build step by step toward the lasting',
    'Acuario': 'originality, idealism and a vision of the future that challenges the established by conviction',
    'Piscis': 'empathy, imagination and a surrender to the invisible and the universal that dissolves boundaries'
  },
  SE: {
    'Aries': 'Fire', 'Leo': 'Fire', 'Sagitario': 'Fire',
    'Tauro': 'Earth', 'Virgo': 'Earth', 'Capricornio': 'Earth',
    'Géminis': 'Air', 'Libra': 'Air', 'Acuario': 'Air',
    'Cáncer': 'Water', 'Escorpio': 'Water', 'Piscis': 'Water'
  },
  ET: {
    'Fire': 'passion, inspiration and a drive to action that needs fuel',
    'Earth': 'pragmatism, stability and an anchoring in the concrete and the enduring',
    'Air': 'mentality, sociability and a hunger for communication and ideas',
    'Water': 'emotionality, intuition and a capacity to feel and connect deeply'
  },
  EI: {
    'Fire': 'the flame that dances',
    'Earth': 'the mountain that endures',
    'Air': 'the wind that scatters seeds',
    'Water': 'the ocean that embraces all'
  },
  MT: {
    'Cardinal': 'initiative to undertake, leadership and a drive that starts the cycles',
    'Fixed': 'perseverance, stability and a resistance that holds when others yield',
    'Mutable': 'adaptability, fluidity and a talent for moving between worlds and stages'
  },
  PA: {
    'Sun': 'your essential identity, the vital spark and the purpose that makes you feel authentic',
    'Moon': 'your emotional world, your intimate needs and the way you nurture and rest',
    'Mercury': 'your mind, your word and the way you weave thoughts and connect ideas',
    'Venus': 'your capacity to love, your values and your sensitivity to beauty and enjoyment',
    'Mars': 'your courage, your desire and the energy you put into pursuing what you want',
    'Jupiter': 'your faith, your expansion and the search for meaning and truth',
    'Saturn': 'your discipline, your limits and the lessons that structure your maturity',
    'Uranus': 'your originality, your rebellion and the flash of intuition that breaks the established',
    'Neptune': 'your imagination, your spirituality and the veil between dream and surrender',
    'Pluto': 'your power of transformation, your shadow and the capacity to die and be reborn',
    'N Node': 'your karmic path of growth, the direction that scares you yet expands you',
    'Chiron': 'the wound that becomes healing and wisdom',
    'Lilith': 'your wild and hidden self, the instinctive that asks to be recognised without shame'
  },
  CT: {
    '1': 'your body and the way the world perceives you at first encounter',
    '2': 'your finances, your personal resources and the sense of what belongs to you',
    '3': 'your everyday mind, your communication and the constant exchange with your environment',
    '4': 'your home, your roots and the intimate refuge where you set down your armour',
    '5': 'your creativity, your way of playing and falling in love and the place where you dare to create',
    '6': 'your daily work, your health and the habits that sustain your life day by day',
    '7': 'your intimate bonds, your partnerships and the contracts you seal with the other',
    '8': 'transformation, deep intimacy and everything you share and let go of',
    '9': 'your search for meaning, the studies that broaden you and the horizons that call you',
    '10': 'your vocation, your career and the public recognition you build step by step',
    '11': 'your friends, your ideals and the communities where your vision meets that of others',
    '12': 'your intuition, your unconscious and the closing cycles that prepare your next rebirth'
  },
  aperturas: [
    'Your ${area} seeks the ${cualidadCorta} of ${signo}: ${cualidad}',
    'When it comes to ${area}, ${signo} leaves its mark —${cualidad}—',
    'The space of ${area} breathes through ${signo}, bringing ${cualidad}',
    'Your chart places ${area} under the signature of ${signo}: ${cualidad}',
    'In the realm of ${area}, ${signo} leaves its imprint —${cualidad}—'
  ],
  conectores: [
    'although the presence of ${planeta} in ${signo} shades it with ${cualidad}',
    'while ${planeta} in ${signo} brings ${cualidad}',
    'and it is completed by ${planeta} in ${signo}, which carries ${cualidad}',
    'but ${planeta} in ${signo} adds a layer of ${cualidad}',
    'where ${planeta} in ${signo} introduces ${cualidad}'
  ],
  retroFrases: [
    ', a force that first simmers slowly within you before manifesting outward',
    ' and, being retrograde, it is lived as a constant inner dialogue before becoming visible action',
    ', retrograde, which means this quality is refined in intimacy before being projected outward'
  ],
  grupos: [
    'Identity and Matter (Houses 1, 2 and 3)',
    'Refuge and Service (Houses 4, 5 and 6)',
    'The Mirror and Expansion (Houses 7, 8 and 9)',
    'The Summit and the Unconscious (Houses 10, 11 and 12)'
  ],
  narrativa: {
    s1_asc: 'The first impression you offer the world is marked by your <strong>Ascendant in ${ascS}</strong>: ${sqAsc}. ',
    s1_mascara: 'It is the mask you wear effortlessly, your visible wrapping, and also the lens through which you filter everything life brings you. ',
    s1_sol: 'Behind that mask burns your <strong>Sun in ${solS}</strong>, the unrenounceable core of who you are: ${sqSol}. ',
    s1_solLuz: 'It is the light you seek to embody, the essential identity that makes you feel authentic when you live it fully. ',
    s1_lunaConj: 'And what is truly remarkable is that your <strong>Moon is also in ${solS}</strong>, merging with your Sun in a conjunction experienced as a natal New Moon. ',
    s1_lunaConj2: 'Your conscious identity and your emotional needs beat in unison in ${solSLower}, creating an inner coherence of uncommon intensity: you know what you feel and you feel what you are. ',
    s1_lunaConj3: 'All the force of ${sqSol} is concentrated in you massively, giving you solid self-knowledge but also concentrating the evolutionary tension in a single sign. ',
    s1_contrasteAscSol: 'However, the contrast with your Ascendant is evident: though outwardly you project ${eiAsc}, your inner world is ${eiSol}. ',
    s1_contrasteAscSol2: 'That distance between appearance and core is exactly the terrain where your evolution plays out, the space where you discover yourself and learn to reconcile what you show with what you are.',
    s1_coherencia: 'The coherence between your appearance and your core gives you a solid and magnetic presence, though at times it may be hard to surprise yourself or step outside of who you are.',
    s1_luna: 'In the deepest place, your <strong>Moon in ${lunaS}</strong> governs what you do not always show: ${sqLuna}. ',
    s1_lunaRefugio: 'It is the emotional refuge where you nurture and rest, the part that governs your instinctive reactions and your most intimate needs. ',
    s1_contrasteSolLuna: 'The contrast between your centre and your emotionality is vivid: your Sun burns in ${etSol} while your Moon flows with ${etLuna}. ',
    s1_polaridad1: 'That inner polarity is at once your wealth and your tension, for one part of you seeks ${buscaSol} while another needs ${necesitaLuna}. ',
    s1_triangulacion: 'Despite this, the triangulation is completed by your Ascendant: though you show ${eiAsc} to the world, inside you live between ${eiSol} and ${eiLuna}. ',
    s1_triangulacion2: 'That contrast gives you depth and mystery: you are not what you appear at first glance, and the journey of discovering yourself is an essential part of your path.',
    s1_eje: 'These three energies draw the axis on which everything else in your chart rests: the mask, the core and the refuge, each with its own colour yet forming a unique identity.',

    s2_predominio: 'Your character is steeped in the predominance of the <strong>${domEl}</strong> element (${domElC} placements), which translates into ${etDom}. ',
    s2_concentrado: 'It is such an intense concentration that ${eiDom} is practically your natural element, the space where you feel at home and where your energy flows effortlessly. ',
    s2_tendencia: 'It is a clear tendency that shades your way of being in the world. ',
    s2_ausencia: 'The total absence of <strong>${weakEl}</strong> is revealing: ${etWeak} does not come naturally, so you will have to cultivate it consciously throughout your life. ',
    s2_debil: 'The <strong>${weakEl}</strong> element appears barely ${weakElC} time, a sensitive point that deserves care and attention. ',
    s2_debil2: 'The <strong>${weakEl}</strong> element is present though to a lesser degree (${weakElC}), providing a counterpoint to your dominant tendency. ',
    s2_modalidad: 'The way you move through life bears a <strong>${domMod}</strong> stamp (${domModC}): ${mtDom}. ',
    s2_yang: 'Yang energy predominates (${masculine}/${feminine}), so action and outwardness come naturally to you, though you must remember that true strength also knows how to stop and listen. ',
    s2_yin: 'Yin energy predominates (${feminine}/${masculine}), so receptivity and introspection are your refuge, though you must remember to step out into the world and manifest what is sown in silence. ',
    s2_equilibrio: 'The balance between yang and yin (${masculine}/${feminine}) gives you a stable base from which you can choose consciously. ',

    s2_stellium: 'Curiously, much of your vital energy is concentrated in the realm of ${areaStellium}, where ${numPlanetas} planets gather: ${planetasLista}. ',
    s2_stellium2: 'This concentration turns that area into the main engine of your life: it is where you feel the greatest pressure, but also where your greatest potential resides. ',
    s2_stellium3: 'It is no coincidence that so many inner voices point to the same place —the chart shows you where your deepest transformation passes through.',
    s2_noStellium: 'There are no extreme concentrations in your chart: your energy is spread across several areas, giving you versatility and preventing any single zone from monopolising your existence.',

    s4_sinAspectos: 'No tight tense aspects are detected in your chart, which indicates your energy flows with a predominant harmony. This gives you a serene base, though it invites you to voluntarily cultivate the drive that tension usually grants.',
    s4_conj1: '<strong>${p1} and ${p2} in conjunction</strong> (orb ${orbStr}). ',
    s4_conj2: '${desc1Cap} and ${desc2} merge within you, creating an inseparable alliance. ',
    s4_conj3: 'This fusion gives you uncommon potency in that area of your life, but the true challenge lies in integrating both voices without either silencing the other.',
    s4_opp1: '<strong>${p1} in opposition to ${p2}</strong> (orb ${orbStr}). ',
    s4_opp2: 'You feel a constant tug-of-war between ${desc1} and ${desc2}. ',
    s4_opp3: 'The challenge is not to choose one side and repress the other, but to hold the tension until both forces feed each other and you learn to inhabit the paradox.',
    s4_sq1: '<strong>${p1} in square with ${p2}</strong> (orb ${orbStr}). ',
    s4_sq2: 'The friction between ${desc1} and ${desc2} feels like a constant rubbing within you. ',
    s4_sq3: 'Yet that discomfort is the engine of your growth: what is hard to integrate is exactly what matures you and gives you depth.',
    s4_tri1: '<strong>${p1} in trine with ${p2}</strong> (orb ${orbStr}). ',
    s4_tri2: '${desc1Cap} and ${desc2} flow in natural harmony. ',
    s4_tri3: 'This alliance is a gift: both forces empower each other effortlessly, and your challenge is not to take them for granted but to use them consciously.',
    s4_sex1: '<strong>${p1} in sextile with ${p2}</strong> (orb ${orbStr}). ',
    s4_sex2: 'There is an open channel between ${desc1} and ${desc2}, an opportunity that asks to be activated. ',
    s4_sex3: 'The ease is there, but you must take the initiative to seize it.',

    s5_nodoN: 'Your evolution calls you toward the <strong>North Node in ${signo}</strong>: ${sqSigno}. ',
    s5_nodoN2: 'It is the direction that scares you because it is new, but it is also the one that expands you and returns you to who you are called to be. ',
    s5_nodoS: 'From it you bid farewell to the <strong>South Node in ${signo}</strong>, the comfort zone you already master and from which you must detach so as not to stagnate. ',
    s5_lilith: 'Your instinctive and wild power resides in <strong>Lilith in ${signo}</strong>: ${sqSigno}, the part of you that asks to be recognised without shame or domestication. ',
    s5_fortuna: 'And your flow of luck shines in the <strong>Part of Fortune in ${signo}</strong>, the realm where natural joy awaits you when you align your identity, your emotion and your way of presenting yourself to the world. ',

    s6_yang: 'Your chart burns in yang: remember that true strength also knows how to stop and listen to itself. ',
    s6_yin: 'Your chart flows in yin: remember that what is sown in silence also asks to be manifested in the world. ',
    s6_equil: 'Your chart balances impulse and containment: choose consciously from that solid base. ',
    s6_stellium: 'The concentration in the area of ${areaStellium} is your compass and your load: your greatest potential lies there. ',
    s6_cierre: 'The chart is a map, not a sentence —what seems tension is raw material for your growth, and the only true magic is to choose, with full awareness, who you want to be.',

    avisoFinal: 'This analysis is a symbolic interpretation of your natal chart. Take it as a mirror for reflection and self-knowledge, not as a deterministic forecast.'
  }
},

// ════════════════════════════════════════════════════════════════════════════
//  PORTUGUÊS
// ════════════════════════════════════════════════════════════════════════════
pt: {
  titulo: '✦ Análise Astral Oracular ✦',
  subtitulo: 'Uma viagem psicológica através do seu mapa natal',
  secciones: {
    s1_titulo: '1. O Eixo do Seu Ser (Seu Grande Trígono)',
    s2_titulo: '2. Sua Assinatura Energética',
    s3_titulo: '3. Os Cenários da Sua Vida',
    s4_titulo: '4. O Motor do Seu Crescimento',
    s5_titulo: '5. Sua Bússola Kármica',
    s6_titulo: '6. O Conselho do Oráculo'
  },
  SQ: {
    'Aries': 'iniciativa, coragem e um impulso pioneiro que abre caminho onde outros veem muros',
    'Tauro': 'estabilidade, paciência e uma sensualidade enraizada no tangível e no duradouro',
    'Géminis': 'curiosidade, versatilidade mental e uma sede insaciável de conectar ideias e pessoas',
    'Cáncer': 'sensibilidade protetora, memória emocional e um vínculo profundo com a raiz e o cuidado',
    'Leo': 'orgulho criativo, calor e uma necessidade irrenunciável de brilhar e ser reconhecido',
    'Virgo': 'análise, serviço e uma vontade perfeccionista que busca a maestria no prático',
    'Libra': 'equilíbrio, diplomacia e uma busca constante de harmonia e beleza nos vínculos',
    'Escorpio': 'intensidade, penetração e uma capacidade de mergulhar no oculto e renascer transformado',
    'Sagitario': 'expansão, fé e uma busca entusiástica de sentido, verdade e horizontes amplos',
    'Capricornio': 'ambição, disciplina e uma vontade de construir passo a passo rumo ao duradouro',
    'Acuario': 'originalidade, idealismo e uma visão de futuro que desafia o estabelecido por convicção',
    'Piscis': 'empatia, imaginação e uma entrega ao invisível e ao universal que apaga as fronteiras'
  },
  SE: {
    'Aries': 'Fogo', 'Leo': 'Fogo', 'Sagitario': 'Fogo',
    'Tauro': 'Terra', 'Virgo': 'Terra', 'Capricornio': 'Terra',
    'Géminis': 'Ar', 'Libra': 'Ar', 'Acuario': 'Ar',
    'Cáncer': 'Água', 'Escorpio': 'Água', 'Piscis': 'Água'
  },
  ET: {
    'Fogo': 'paixão, inspiração e um impulso de ação que precisa de combustível',
    'Terra': 'pragmatismo, estabilidade e uma ancoragem no concreto e no duradouro',
    'Ar': 'mentalidade, sociabilidade e uma fome de comunicação e ideias',
    'Água': 'emocionalidade, intuição e uma capacidade de sentir e conectar profundamente'
  },
  EI: {
    'Fogo': 'a chama que dança',
    'Terra': 'a montanha que perdura',
    'Ar': 'o vento que dispersa sementes',
    'Água': 'o oceano que tudo acolhe'
  },
  MT: {
    'Cardinal': 'iniciativa para empreender, liderança e um impulso que inicia os ciclos',
    'Fixo': 'perseverança, estabilidade e uma resistência que sustenta quando outros cedem',
    'Mutável': 'adaptabilidade, fluidez e um talento para transitar entre mundos e etapas'
  },
  PA: {
    'Sun': 'sua identidade essencial, a faísca vital e o propósito que o faz sentir-se autêntico',
    'Moon': 'seu mundo emocional, suas necessidades íntimas e a forma de nutrir e descansar',
    'Mercury': 'sua mente, sua palavra e a forma de tecer pensamentos e conectar ideias',
    'Venus': 'sua capacidade de amar, seus valores e sua sensibilidade para a beleza e o desfrute',
    'Mars': 'sua coragem, seu desejo e a energia que você coloca em perseguir o que quer',
    'Jupiter': 'sua fé, sua expansão e a busca de sentido e verdade',
    'Saturn': 'sua disciplina, seus limites e as lições que estruturam sua maturidade',
    'Uranus': 'sua originalidade, sua rebeldia e o clarão de intuição que rompe o estabelecido',
    'Neptune': 'sua imaginação, sua espiritualidade e o véu entre o sonho e a entrega',
    'Pluto': 'seu poder de transformação, sua sombra e a capacidade de morrer e renascer',
    'N Node': 'seu caminho kármico de crescimento, a direção que assusta mas expande',
    'Chiron': 'a ferida que se torna curativa e sabedoria',
    'Lilith': 'seu eu selvagem e oculto, o instintivo que pede para ser reconhecido sem vergonha'
  },
  CT: {
    '1': 'seu corpo e a forma como o mundo o percebe no primeiro encontro',
    '2': 'suas finanças, seus recursos pessoais e o sentido daquilo que lhe pertence',
    '3': 'sua mente cotidiana, sua comunicação e a troca constante com seu entorno',
    '4': 'seu lar, suas raízes e o refúgio íntimo onde você descansa a armadura',
    '5': 'sua criatividade, sua forma de jogar e apaixonar-se e o lugar onde se atreve a criar',
    '6': 'seu trabalho cotidiano, sua saúde e os hábitos que sustentam sua vida dia a dia',
    '7': 'seus vínculos íntimos, suas parcerias e os contratos que você selar com o outro',
    '8': 'a transformação, a intimidade profunda e tudo o que você compartilha e deixa ir',
    '9': 'sua busca de sentido, os estudos que o ampliam e os horizontes que o chamam',
    '10': 'sua vocação, sua carreira e o reconhecimento público que você constrói passo a passo',
    '11': 'seus amigos, seus ideais e as comunidades onde sua visão se encontra com a dos outros',
    '12': 'sua intuição, seu inconsciente e os ciclos de fechamento que preparam seu próximo renascimento'
  },
  aperturas: [
    'Seu ${area} busca a ${cualidadCorta} de ${signo}: ${cualidad}',
    'Quando se trata de ${area}, ${signo} imprime sua marca —${cualidad}—',
    'O espaço de ${area} respira em ${signo}, trazendo ${cualidad}',
    'Seu mapa situa ${area} sob a assinatura de ${signo}: ${cualidad}',
    'No terreno de ${area}, ${signo} deixa sua impressão —${cualidad}—'
  ],
  conectores: [
    'embora a presença de ${planeta} em ${signo} o matize com ${cualidad}',
    'enquanto ${planeta} em ${signo} traz ${cualidad}',
    'e se completa com ${planeta} em ${signo}, que carrega ${cualidad}',
    'mas ${planeta} em ${signo} adiciona uma camada de ${cualidad}',
    'onde ${planeta} em ${signo} introduz ${cualidad}'
  ],
  retroFrases: [
    ', uma força que primeiro cozinha em fogo lento dentro de você antes de manifestar-se ao exterior',
    ' e, por estar retrógrado, é vivido como um diálogo interior constante antes de tornar-se ação visível',
    ', retrógrado, o que significa que esta qualidade se refine na intimidade antes de projetar-se'
  ],
  grupos: [
    'Identidade e Matéria (Casas 1, 2 e 3)',
    'Refúgio e Serviço (Casas 4, 5 e 6)',
    'O Espelho e a Expansão (Casas 7, 8 e 9)',
    'O Cume e o Inconsciente (Casas 10, 11 e 12)'
  ],
  narrativa: {
    s1_asc: 'A primeira impressão que você oferece ao mundo é marcada por seu <strong>Ascendente em ${ascS}</strong>: ${sqAsc}. ',
    s1_mascara: 'É a máscara que você veste sem esforço, seu envoltório visível, e também a lente através da qual você filtra tudo o que a vida lhe traz. ',
    s1_sol: 'Por trás dessa máscara arde seu <strong>Sol em ${solS}</strong>, o núcleo irrenunciável de quem você é: ${sqSol}. ',
    s1_solLuz: 'É a luz que você busca encarnar, a identidade essencial que o faz sentir-se autêntico quando a vive plenamente. ',
    s1_lunaConj: 'E o que é realmente notável é que sua <strong>Lua também se encontra em ${solS}</strong>, fundindo-se com seu Sol numa conjunção vivida como uma Lua Nova natal. ',
    s1_lunaConj2: 'Sua identidade consciente e suas necessidades emocionais batem em uníssono em ${solSLower}, criando uma coerência interior de uma intensidade incomum: você sabe o que sente e sente o que é. ',
    s1_lunaConj3: 'Toda a força de ${sqSol} se concentra em você de maneira massiva, o que lhe dá um autoconhecimento sólido mas também concentra a tensão evolutiva num único signo. ',
    s1_contrasteAscSol: 'No entanto, o contraste com seu Ascendente é evidente: embora por fora você projete ${eiAsc}, seu interior é ${eiSol}. ',
    s1_contrasteAscSol2: 'Essa distância entre a aparência e o núcleo é exatamente o terreno onde se joga sua evolução, o espaço onde você se descobre e aprende a reconciliar o que mostra com o que é.',
    s1_coherencia: 'A coerência entre sua aparência e seu núcleo lhe dá uma presença sólida e magnética, embora às vezes possa custar surpreender-se ou sair de si mesmo.',
    s1_luna: 'No mais profundo, sua <strong>Lua em ${lunaS}</strong> rege o que você nem sempre mostra: ${sqLuna}. ',
    s1_lunaRefugio: 'É o refúgio emocional onde você se nutre e descansa, a parte que governa suas reações instintivas e suas necessidades mais íntimas. ',
    s1_contrasteSolLuna: 'O contraste entre seu centro e sua emocionalidade é vivo: seu Sol arde em ${etSol} enquanto sua Lua flui com ${etLuna}. ',
    s1_polaridad1: 'Essa polaridade interior é ao mesmo tempo sua riqueza e sua tensão, pois uma parte de você busca ${buscaSol} enquanto outra precisa ${necesitaLuna}. ',
    s1_triangulacion: 'Apesar disso, a triangulação se completa com seu Ascendente: embora você mostre ${eiAsc} ao mundo, por dentro você vive entre ${eiSol} e ${eiLuna}. ',
    s1_triangulacion2: 'Esse contraste lhe dá profundidade e mistério: você não é o que parece à primeira vista, e a jornada de descobrir-se é parte essencial do seu caminho.',
    s1_eje: 'Essas três energias desenham o eixo sobre o qual se sustenta todo o resto em seu mapa: a máscara, o centro e o refúgio, cada um com sua própria cor mas formando uma identidade única.',

    s2_predominio: 'Seu caráter está impregnado pela predominância do elemento <strong>${domEl}</strong> (${domElC} posições), o que se traduz em ${etDom}. ',
    s2_concentrado: 'É uma concentração tão intensa que ${eiDom} é praticamente seu elemento natural, o espaço onde você se sente em casa e onde sua energia flui sem esforço. ',
    s2_tendencia: 'É uma tendência clara que matiza sua forma de estar no mundo. ',
    s2_ausencia: 'A ausência total de <strong>${weakEl}</strong> é reveladora: ${etWeak} não vem de forma natural, então você terá de cultivá-lo conscientemente ao longo de sua vida. ',
    s2_debil: 'O elemento <strong>${weakEl}</strong> aparece apenas ${weakElC} vez, um ponto sensível que merece cuidado e atenção. ',
    s2_debil2: 'O elemento <strong>${weakEl}</strong> está presente embora em menor medida (${weakElC}), oferecendo um contraponto à sua tendência dominante. ',
    s2_modalidad: 'Sua forma de mover-se pela vida tem um selo <strong>${domMod}</strong> (${domModC}): ${mtDom}. ',
    s2_yang: 'A energia yang predomina (${masculine}/${feminine}), então a ação e a exterioridade lhe são naturais, embora deva lembrar que a verdadeira força também sabe deter-se e escutar. ',
    s2_yin: 'A energia yin predomina (${feminine}/${masculine}), então a receptividade e a introspecção são seu refúgio, embora deva lembrar de sair ao mundo e manifestar o que se semeia em silêncio. ',
    s2_equilibrio: 'O equilíbrio entre yang e yin (${masculine}/${feminine}) lhe dá uma base estável de onde você pode escolher conscientemente. ',

    s2_stellium: 'Curiosamente, grande parte de sua energia vital se concentra no âmbito de ${areaStellium}, onde se reúnem ${numPlanetas} planetas: ${planetasLista}. ',
    s2_stellium2: 'Esta concentração converte essa área no motor principal de sua vida: é onde você sente a maior pressão, mas também onde reside seu maior potencial. ',
    s2_stellium3: 'Não é casualidade que tantas vozes interiores apontem ao mesmo lugar —o mapa indica por onde passa sua transformação mais profunda.',
    s2_noStellium: 'Não há concentrações extremas em seu mapa: sua energia está repartida entre várias áreas, o que lhe dá versatilidade e evita que uma única zona monopolize sua existência.',

    s4_sinAspectos: 'Não se detectam aspectos tensos estreitos em seu mapa, o que indica que sua energia flui com uma harmonia predominante. Isso lhe dá uma base serena, embora o convide a cultivar voluntariamente o impulso que a tensão costuma presentear.',
    s4_conj1: '<strong>${p1} e ${p2} em conjunção</strong> (orbe ${orbStr}). ',
    s4_conj2: '${desc1Cap} e ${desc2} fundem-se em seu interior, criando uma aliança inseparável. ',
    s4_conj3: 'Esta fusão lhe dá uma potência incomum naquele terreno de sua vida, mas o verdadeiro desafio reside em integrar ambas as vozes sem que nenhuma silencie a outra.',
    s4_opp1: '<strong>${p1} em oposição a ${p2}</strong> (orbe ${orbStr}). ',
    s4_opp2: 'Você sente um cabo de guerra constante entre ${desc1} e ${desc2}. ',
    s4_opp3: 'O desafio não é escolher um lado e reprimir o outro, mas sustentar a tensão até que ambas as forças se alimentem mutuamente e você aprenda a habitar o paradoxo.',
    s4_sq1: '<strong>${p1} em quadratura com ${p2}</strong> (orbe ${orbStr}). ',
    s4_sq2: 'O atrito entre ${desc1} e ${desc2} sente-se como um roce constante em seu interior. ',
    s4_sq3: 'No entanto, esse desconforto é o motor de seu crescimento: o que lhe custa integrar é exatamente o que o amadurece e lhe dá profundidade.',
    s4_tri1: '<strong>${p1} em trígono com ${p2}</strong> (orbe ${orbStr}). ',
    s4_tri2: '${desc1Cap} e ${desc2} fluem em harmonia natural. ',
    s4_tri3: 'Esta aliança é um dom: ambas as forças se potencializam sem esforço, e seu desafio é não dá-las por garantidas e sim usá-las conscientemente.',
    s4_sex1: '<strong>${p1} em sextil com ${p2}</strong> (orbe ${orbStr}). ',
    s4_sex2: 'Há um canal aberto entre ${desc1} e ${desc2}, uma oportunidade que pede para ser ativada. ',
    s4_sex3: 'A facilidade está aí, mas você deverá tomar a iniciativa para aproveitá-la.',

    s5_nodoN: 'Sua evolução o chama rumo ao <strong>Nodo Norte em ${signo}</strong>: ${sqSigno}. ',
    s5_nodoN2: 'É a direção que assusta porque é nova, mas é também a que o expande e o devolve a quem você é chamado a ser. ',
    s5_nodoS: 'Dela você se despede do <strong>Nodo Sul em ${signo}</strong>, a zona de conforto que já domina e da qual deve desapegar-se para não estagnar. ',
    s5_lilith: 'Seu poder instintivo e selvagem reside em <strong>Lilith em ${signo}</strong>: ${sqSigno}, a parte de você que pede para ser reconhecida sem vergonha nem domesticação. ',
    s5_fortuna: 'E seu fluxo de sorte brilha na <strong>Parte da Fortuna em ${signo}</strong>, o âmbito onde a alegria natural o espera quando você alinha sua identidade, sua emoção e sua forma de apresentar-se ao mundo. ',

    s6_yang: 'Seu mapa arde em yang: lembre-se de que a verdadeira força também sabe deter-se e escutar-se. ',
    s6_yin: 'Seu mapa flui em yin: lembre-se de que o semeado em silêncio também pede para ser manifestado no mundo. ',
    s6_equil: 'Seu mapa equilibra impulso e contenção: escolha conscientemente desde essa base sólida. ',
    s6_stellium: 'A concentração na área de ${areaStellium} é sua bússola e sua carga: aí está seu maior potencial. ',
    s6_cierre: 'O mapa é um mapa, não uma condenação —o que parece tensão é matéria-prima para seu crescimento, e a única magia verdadeira é escolher, com plena consciência, quem você quer ser.',

    avisoFinal: 'Esta análise é uma interpretação simbólica do seu mapa natal. Tome-a como espelho para a reflexão e o autoconhecimento, não como previsão determinista.'
  }
},

// ════════════════════════════════════════════════════════════════════════════
//  FRANÇAIS
// ════════════════════════════════════════════════════════════════════════════
fr: {
  titulo: '✦ Analyse Astrale Oraculaire ✦',
  subtitulo: 'Un voyage psychologique à travers votre thème natal',
  secciones: {
    s1_titulo: '1. L\'Axe de Votre Être (Votre Grand Trine)',
    s2_titulo: '2. Votre Empreinte Énergétique',
    s3_titulo: '3. Les Scénarios de Votre Vie',
    s4_titulo: '4. Le Moteur de Votre Croissance',
    s5_titulo: '5. Votre Boussole Karmique',
    s6_titulo: '6. Le Conseil de l\'Oracle'
  },
  SQ: {
    'Aries': 'initiative, courage et un élan pionnier qui ouvre un chemin là où d\'autres voient des murs',
    'Tauro': 'stabilité, patience et une sensualité enracinée dans le tangible et le durable',
    'Géminis': 'curiosité, polyvalence mentale et une soif insatiable de relier idées et personnes',
    'Cáncer': 'sensibilité protectrice, mémoire émotionnelle et un lien profond avec les racines et le soin',
    'Leo': 'fierté créative, chaleur et un besoin irrénonciable de briller et d\'être reconnu',
    'Virgo': 'analyse, service et un souci perfectionniste qui cherche la maîtrise dans le pratique',
    'Libra': 'équilibre, diplomatie et une recherche constante d\'harmonie et de beauté dans les liens',
    'Escorpio': 'intensité, pénétration et une capacité de plonger dans l\'occulte et de renaître transformé',
    'Sagitario': 'expansion, foi et une recherche enthousiaste de sens, de vérité et d\'horizons vastes',
    'Capricornio': 'ambition, discipline et une volonté de bâtir pas à pas vers ce qui dure',
    'Acuario': 'originalité, idéalisme et une vision d\'avenir qui défie l\'établi par conviction',
    'Piscis': 'empathie, imagination et un abandon à l\'invisible et à l\'universel qui efface les frontières'
  },
  SE: {
    'Aries': 'Feu', 'Leo': 'Feu', 'Sagitario': 'Feu',
    'Tauro': 'Terre', 'Virgo': 'Terre', 'Capricornio': 'Terre',
    'Géminis': 'Air', 'Libra': 'Air', 'Acuario': 'Air',
    'Cáncer': 'Eau', 'Escorpio': 'Eau', 'Piscis': 'Eau'
  },
  ET: {
    'Feu': 'passion, inspiration et un élan d\'action qui a besoin de carburant',
    'Terre': 'pragmatisme, stabilité et un ancrage dans le concret et le durable',
    'Air': 'mentalité, sociabilité et une faim de communication et d\'idées',
    'Eau': 'émotivité, intuition et une capacité de ressentir et de connecter en profondeur'
  },
  EI: {
    'Feu': 'la flamme qui danse',
    'Terre': 'la montagne qui perdure',
    'Air': 'le vent qui dissémine les graines',
    'Eau': 'l\'océan qui accueille tout'
  },
  MT: {
    'Cardinal': 'initiative pour entreprendre, leadership et un élan qui lance les cycles',
    'Fixe': 'persévérance, stabilité et une résistance qui tient quand les autres cèdent',
    'Mutable': 'adaptabilité, fluidité et un talent pour naviguer entre les mondes et les étapes'
  },
  PA: {
    'Sun': 'votre identité essentielle, l\'étincelle vitale et le dessein qui vous fait sentir authentique',
    'Moon': 'votre monde émotionnel, vos besoins intimes et la manière de vous nourrir et de vous reposer',
    'Mercury': 'votre esprit, votre parole et la façon de tisser des pensées et de relier des idées',
    'Venus': 'votre capacité d\'aimer, vos valeurs et votre sensibilité à la beauté et au plaisir',
    'Mars': 'votre courage, votre désir et l\'énergie que vous mettez à poursuivre ce que vous voulez',
    'Jupiter': 'votre foi, votre expansion et la recherche de sens et de vérité',
    'Saturn': 'votre discipline, vos limites et les leçons qui structurent votre maturité',
    'Uranus': 'votre originalité, votre rébellion et l\'éclair d\'intuition qui rompt l\'établi',
    'Neptune': 'votre imagination, votre spiritualité et le voile entre le rêve et l\'abandon',
    'Pluto': 'votre pouvoir de transformation, votre ombre et la capacité de mourir et de renaître',
    'N Node': 'votre chemin karmique de croissance, la direction qui effraie mais qui vous dilate',
    'Chiron': 'la blessure qui devient guérison et sagesse',
    'Lilith': 'votre moi sauvage et caché, l\'instinctif qui demande à être reconnu sans honte'
  },
  CT: {
    '1': 'votre corps et la façon dont le monde vous perçoit à la première rencontre',
    '2': 'vos finances, vos ressources personnelles et le sens de ce qui vous appartient',
    '3': 'votre esprit quotidien, votre communication et l\'échange constant avec votre environnement',
    '4': 'votre foyer, vos racines et le refuge intime où vous déposez votre armure',
    '5': 'votre créativité, votre façon de jouer et de vous éprendre et le lieu où vous osez créer',
    '6': 'votre travail quotidien, votre santé et les habitudes qui soutiennent votre vie jour après jour',
    '7': 'vos liens intimes, vos partenariats et les contrats que vous scellez avec l\'autre',
    '8': 'la transformation, l\'intimité profonde et tout ce que vous partagez et laissez aller',
    '9': 'votre recherche de sens, les études qui vous élargissent et les horizons qui vous appellent',
    '10': 'votre vocation, votre carrière et la reconnaissance publique que vous bâtissez pas à pas',
    '11': 'vos amis, vos idéaux et les communautés où votre vision rencontre celle des autres',
    '12': 'votre intuition, votre inconscient et les cycles de clôture qui préparent votre prochaine renaissance'
  },
  aperturas: [
    'Votre ${area} cherche la ${cualidadCorta} de ${signo} : ${cualidad}',
    'Quand il s\'agit de ${area}, ${signo} impose sa marque —${cualidad}—',
    'L\'espace de ${area} respire en ${signo}, apportant ${cualidad}',
    'Votre thème place ${area} sous la signature de ${signo} : ${cualidad}',
    'Dans le domaine de ${area}, ${signo} laisse son empreinte —${cualidad}—'
  ],
  conectores: [
    'bien que la présence de ${planeta} en ${signo} la nuance avec ${cualidad}',
    'tandis que ${planeta} en ${signo} apporte ${cualidad}',
    'et se complète avec ${planeta} en ${signo}, qui porte ${cualidad}',
    'mais ${planeta} en ${signo} ajoute une couche de ${cualidad}',
    'où ${planeta} en ${signo} introduit ${cualidad}'
  ],
  retroFrases: [
    ', une force qui d\'abord mijote à feu doux en vous avant de se manifester au-dehors',
    ' et, étant rétrograde, se vit comme un dialogue intérieur constant avant de devenir action visible',
    ', rétrograde, ce qui signifie que cette qualité s\'affine dans l\'intimité avant d\' être projetée'
  ],
  grupos: [
    'Identité et Matière (Maisons 1, 2 et 3)',
    'Refuge et Service (Maisons 4, 5 et 6)',
    'Le Miroir et l\'Expansion (Maisons 7, 8 et 9)',
    'Le Sommet et l\'Inconscient (Maisons 10, 11 et 12)'
  ],
  narrativa: {
    s1_asc: 'La première impression que vous offrez au monde est marquée par votre <strong>Ascendant en ${ascS}</strong> : ${sqAsc}. ',
    s1_mascara: 'C\'est le masque que vous portez sans effort, votre enveloppe visible, et aussi le prisme à travers lequel vous filtrez tout ce que la vie vous apporte. ',
    s1_sol: 'Derrière ce masque brûle votre <strong>Soleil en ${solS}</strong>, le noyau irrénonciable de qui vous êtes : ${sqSol}. ',
    s1_solLuz: 'C\'est la lumière que vous cherchez à incarner, l\'identité essentielle qui vous fait sentir authentique quand vous la vivez pleinement. ',
    s1_lunaConj: 'Et ce qui est vraiment remarquable, c\'est que votre <strong>Lune se trouve aussi en ${solS}</strong>, fusionnant avec votre Soleil dans une conjonction vécue comme une Nouvelle Lune natale. ',
    s1_lunaConj2: 'Votre identité consciente et vos besoins émotionnels battent à l\'unisson en ${solSLower}, créant une cohérence intérieure d\'une intensité peu commune : vous savez ce que vous ressentez et vous ressentez ce que vous êtes. ',
    s1_lunaConj3: 'Toute la force de ${sqSol} se concentre en vous de façon massive, ce qui vous donne une connaissance de vous solide mais concentre aussi la tension évolutive dans un seul signe. ',
    s1_contrasteAscSol: 'Cependant, le contraste avec votre Ascendant est évident : bien qu\'à l\'extérieur vous projetiez ${eiAsc}, votre intérieur est ${eiSol}. ',
    s1_contrasteAscSol2: 'Cette distance entre l\'apparence et le noyau est exactement le terrain où se joue votre évolution, l\'espace où vous vous découvrez et apprenez à réconcilier ce que vous montrez avec ce que vous êtes.',
    s1_coherencia: 'La cohérence entre votre apparence et votre noyau vous donne une présence solide et magnétique, bien qu\'il puisse parfois vous coûter de vous surprendre ou de sortir de vous-même.',
    s1_luna: 'Au plus profond, votre <strong>Lune en ${lunaS}</strong> régit ce que vous ne montrez pas toujours : ${sqLuna}. ',
    s1_lunaRefugio: 'C\'est le refuge émotionnel où vous vous nourrissez et vous reposez, la part qui gouverne vos réactions instinctives et vos besoins les plus intimes. ',
    s1_contrasteSolLuna: 'Le contraste entre votre centre et votre émotivité est vivant : votre Soleil brûle dans ${etSol} tandis que votre Lune coule avec ${etLuna}. ',
    s1_polaridad1: 'Cette polarité intérieure est à la fois votre richesse et votre tension, car une part de vous cherche ${buscaSol} tandis qu\'une autre a besoin de ${necesitaLuna}. ',
    s1_triangulacion: 'Malgré cela, la triangulation s\'achève avec votre Ascendant : bien que vous montriez ${eiAsc} au monde, à l\'intérieur vous vivez entre ${eiSol} et ${eiLuna}. ',
    s1_triangulacion2: 'Ce contraste vous donne profondeur et mystère : vous n\'êtes pas ce que vous paraissez au premier regard, et le voyage de vous découvrir est une part essentielle de votre chemin.',
    s1_eje: 'Ces trois énergies dessinent l\'axe sur lequel repose tout le reste de votre thème : le masque, le centre et le refuge, chacun avec sa propre couleur mais formant une identité unique.',

    s2_predominio: 'Votre caractère est imprégné par la prédominance de l\'élément <strong>${domEl}</strong> (${domElC} positions), ce qui se traduit par ${etDom}. ',
    s2_concentrado: 'C\'est une concentration si intense que ${eiDom} est pratiquement votre élément naturel, l\'espace où vous vous sentez chez vous et où votre énergie coule sans effort. ',
    s2_tendencia: 'C\'est une tendance claire qui nuance votre façon d\'être au monde. ',
    s2_ausencia: 'L\'absence totale de <strong>${weakEl}</strong> est révélatrice : ${etWeak} ne vient pas naturellement, vous devrez donc le cultiver consciemment tout au long de votre vie. ',
    s2_debil: 'L\'élément <strong>${weakEl}</strong> n\'apparaît qu\'une ${weakElC} fois, un point sensible qui mérite soin et attention. ',
    s2_debil2: 'L\'élément <strong>${weakEl}</strong> est présent bien qu\'en moindre mesure (${weakElC}), offrant un contrepoint à votre tendance dominante. ',
    s2_modalidad: 'Votre façon d\'avancer dans la vie porte une empreinte <strong>${domMod}</strong> (${domModC}) : ${mtDom}. ',
    s2_yang: 'L\'énergie yang prédomine (${masculine}/${feminine}), l\'action et l\'extériorité vous sont donc naturelles, mais vous devrez vous rappeler que la vraie force sait aussi s\'arrêter et écouter. ',
    s2_yin: 'L\'énergie yin prédomine (${feminine}/${masculine}), la réceptivité et l\'introspection sont donc votre refuge, mais vous devrez vous rappeler de sortir dans le monde et de manifester ce qui se sème en silence. ',
    s2_equilibrio: 'L\'équilibre entre yang et yin (${masculine}/${feminine}) vous donne une base stable depuis laquelle vous pouvez choisir consciemment. ',

    s2_stellium: 'Curieusement, une grande part de votre énergie vitale se concentre dans le domaine de ${areaStellium}, où se réunissent ${numPlanetas} planètes : ${planetasLista}. ',
    s2_stellium2: 'Cette concentration fait de ce domaine le moteur principal de votre vie : c\'est là que vous sentez la plus grande pression, mais aussi que réside votre plus grand potentiel. ',
    s2_stellium3: 'Ce n\'est pas un hasard si tant de voix intérieures pointent vers le même endroit —le thème vous indique par où passe votre transformation la plus profonde.',
    s2_noStellium: 'Il n\'y a pas de concentrations extrêmes dans votre thème : votre énergie est répartie entre plusieurs domaines, ce qui vous donne de la polyvalence et empêche qu\'une seule zone ne monopolise votre existence.',

    s4_sinAspectos: 'Aucun aspect tendu étroit n\'est détecté dans votre thème, ce qui indique que votre énergie coule avec une harmonie prédominante. Cela vous donne une base sereine, mais vous invite à cultiver volontairement l\'élan que la tension offre habituellement.',
    s4_conj1: '<strong>${p1} et ${p2} en conjonction</strong> (orbe ${orbStr}). ',
    s4_conj2: '${desc1Cap} et ${desc2} fusionnent en vous, créant une alliance inséparable. ',
    s4_conj3: 'Cette fusion vous donne une puissance peu commune dans ce domaine de votre vie, mais le vrai défi réside dans l\'intégration des deux voix sans qu\'aucune ne réduise l\'autre au silence.',
    s4_opp1: '<strong>${p1} en opposition à ${p2}</strong> (orbe ${orbStr}). ',
    s4_opp2: 'Vous sentez un tiraillement constant entre ${desc1} et ${desc2}. ',
    s4_opp3: 'Le défi n\'est pas de choisir un côté et de réprimer l\'autre, mais de tenir la tension jusqu\'à ce que les deux forces se nourrissent mutuellement et que vous appreniez à habiter le paradoxe.',
    s4_sq1: '<strong>${p1} en carré avec ${p2}</strong> (orbe ${orbStr}). ',
    s4_sq2: 'La friction entre ${desc1} et ${desc2} se sent comme un frottement constant en vous. ',
    s4_sq3: 'Cependant, cet inconfort est le moteur de votre croissance : ce qui vous coûte d\'intégrer est précisément ce qui vous mûrit et vous donne de la profondeur.',
    s4_tri1: '<strong>${p1} en trigone avec ${p2}</strong> (orbe ${orbStr}). ',
    s4_tri2: '${desc1Cap} et ${desc2} coulent en harmonie naturelle. ',
    s4_tri3: 'Cette alliance est un don : les deux forces se potentialisent sans effort, et votre défi est de ne pas les tenir pour acquises mais de les utiliser consciemment.',
    s4_sex1: '<strong>${p1} en sextil avec ${p2}</strong> (orbe ${orbStr}). ',
    s4_sex2: 'Il y a un canal ouvert entre ${desc1} et ${desc2}, une opportunité qui demande à être activée. ',
    s4_sex3: 'La facilité est là, mais vous devrez prendre l\'initiative pour en profiter.',

    s5_nodoN: 'Votre évolution vous appelle vers le <strong>Nœud Nord en ${signo}</strong> : ${sqSigno}. ',
    s5_nodoN2: 'C\'est la direction qui effraie parce qu\'elle est nouvelle, mais c\'est aussi celle qui vous dilate et vous ramène à qui vous êtes appelé à être. ',
    s5_nodoS: 'Vous en faites vos adieux au <strong>Nœud Sud en ${signo}</strong>, la zone de confort que vous maîtrisez déjà et dont vous devez vous détacher pour ne pas stagner. ',
    s5_lilith: 'Votre pouvoir instinctif et sauvage réside en <strong>Lilith en ${signo}</strong> : ${sqSigno}, la part de vous qui demande à être reconnue sans honte ni domestication. ',
    s5_fortuna: 'Et votre flux de chance brille dans la <strong>Part de Fortune en ${signo}</strong>, le domaine où la joie naturelle vous attend quand vous alignez votre identité, votre émotion et votre façon de vous présenter au monde. ',

    s6_yang: 'Votre thème brûle en yang : rappelez-vous que la vraie force sait aussi s\'arrêter et s\'écouter. ',
    s6_yin: 'Votre thème coule en yin : rappelez-vous que ce qui est semé en silence demande aussi à être manifesté dans le monde. ',
    s6_equil: 'Votre thème équilibre élan et retenue : choisissez consciemment depuis cette base solide. ',
    s6_stellium: 'La concentration dans le domaine de ${areaStellium} est votre boussole et votre fardeau : votre plus grand potentiel réside là. ',
    s6_cierre: 'Le thème est une carte, pas une condamnation —ce qui semble tension est matière première pour votre croissance, et la seule vraie magie est de choisir, en pleine conscience, qui vous voulez être.',

    avisoFinal: 'Cette analyse est une interprétation symbolique de votre thème natal. Prenez-la comme un miroir pour la réflexion et la connaissance de vous, non comme une prédiction déterministe.'
  }
},

// ════════════════════════════════════════════════════════════════════════════
//  DEUTSCH
// ════════════════════════════════════════════════════════════════════════════
de: {
  titulo: '✦ Orakulare Astralanalyse ✦',
  subtitulo: 'Eine psychologische Reise durch dein Geburtsrad',
  secciones: {
    s1_titulo: '1. Die Achse deines Seins (Dein großes Trigon)',
    s2_titulo: '2. Deine energetische Signatur',
    s3_titulo: '3. Die Szenarien deines Lebens',
    s4_titulo: '4. Der Motor deines Wachstums',
    s5_titulo: '5. Dein karmischer Kompass',
    s6_titulo: '6. Der Rat des Orakels'
  },
  SQ: {
    'Aries': 'Initiative, Mut und ein pionierhafter Drang, der Wege öffnet, wo andere Mauern sehen',
    'Tauro': 'Stabilität, Geduld und eine Sinnlichkeit, die im Greifbaren und Bleibenden verwurzelt ist',
    'Géminis': 'Neugier, mentale Vielseitigkeit und ein unstillbarer Durst, Ideen und Menschen zu verbinden',
    'Cáncer': 'beschützende Sensibilität, emotionales Gedächtnis und eine tiefe Bindung an Wurzeln und Fürsorge',
    'Leo': 'kreative Stolz, Wärme und ein unwiderrufliches Bedürfnis zu strahlen und anerkannt zu werden',
    'Virgo': 'Analyse, Dienst und ein perfektionistischer Drang, der nach Meisterschaft im Praktischen strebt',
    'Libra': 'Gleichgewicht, Diplomatie und eine ständige Suche nach Harmonie und Schönheit in Bindungen',
    'Escorpio': 'Intensität, Durchdringung und eine Fähigkeit, in das Verborgene einzutauchen und verwandelt wiederaufzuerstehen',
    'Sagitario': 'Expansion, Glaube und eine begeisterte Suche nach Sinn, Wahrheit und weiten Horizonten',
    'Capricornio': 'Ambition, Disziplin und ein Wille, Schritt für Schritt zum Bleibenden zu bauen',
    'Acuario': 'Originalität, Idealismus und eine Zukunftsvision, die das Bestehende aus Überzeugung herausfordert',
    'Piscis': 'Empathie, Vorstellungskraft und eine Hingabe ans Unsichtbare und Universale, die Grenzen verwischt'
  },
  SE: {
    'Aries': 'Feuer', 'Leo': 'Feuer', 'Sagitario': 'Feuer',
    'Tauro': 'Erde', 'Virgo': 'Erde', 'Capricornio': 'Erde',
    'Géminis': 'Luft', 'Libra': 'Luft', 'Acuario': 'Luft',
    'Cáncer': 'Wasser', 'Escorpio': 'Wasser', 'Piscis': 'Wasser'
  },
  ET: {
    'Feuer': 'Leidenschaft, Inspiration und ein Tatendrang, der Brennstoff braucht',
    'Erde': 'Pragmatismus, Stabilität und eine Verankerung im Konkreten und Bleibenden',
    'Luft': 'Mentalität, Geselligkeit und ein Hunger nach Kommunikation und Ideen',
    'Wasser': 'Emotionalität, Intuition und eine Fähigkeit, tief zu fühlen und zu verbinden'
  },
  EI: {
    'Feuer': 'die Flamme, die tanzt',
    'Erde': 'der Berg, der Bestand hat',
    'Luft': 'der Wind, der Samen streut',
    'Wasser': 'der Ozean, der alles umfängt'
  },
  MT: {
    'Cardinal': 'Initiative zum Unterfangen, Führung und ein Drang, der die Zyklen einleitet',
    'Fix': 'Beharrlichkeit, Stabilität und ein Widerstand, der hält, wenn andere nachgeben',
    'Mutable': 'Anpassungsfähigkeit, Fluidität und ein Talent, zwischen Welten und Etappen zu wechseln'
  },
  PA: {
    'Sun': 'dein wesentliches Ich, der Lebensfunke und der Zweck, der dich authentisch fühlen lässt',
    'Moon': 'deine emotionale Welt, deine intimen Bedürfnisse und die Art, wie du nährst und ruhst',
    'Mercury': 'dein Verstand, dein Wort und die Art, wie du Gedanken webst und Ideen verbindest',
    'Venus': 'deine Fähigkeit zu lieben, deine Werte und deine Sensibilität für Schönheit und Genuss',
    'Mars': 'dein Mut, dein Verlangen und die Energie, die du aufwendest, um dem nachzujagen, was du willst',
    'Jupiter': 'dein Glaube, deine Expansion und die Suche nach Sinn und Wahrheit',
    'Saturn': 'deine Disziplin, deine Grenzen und die Lektionen, die deine Reife strukturieren',
    'Uranus': 'deine Originalität, dein Aufbegehren und der Intuitionsschein, der das Bestehende bricht',
    'Neptune': 'deine Vorstellungskraft, deine Spiritualität und der Schleier zwischen Traum und Hingabe',
    'Pluto': 'deine Transformationskraft, dein Schatten und die Fähigkeit zu sterben und wiederaufzuerstehen',
    'N Node': 'dein karmischer Wachstumspfad, die Richtung, die dich erschreckt, dich aber erweitert',
    'Chiron': 'die Wunde, die zur Heilung und Weisheit wird',
    'Lilith': 'dein wildes und verborgenes Ich, das Instinktive, das ohne Scham anerkannt werden will'
  },
  CT: {
    '1': 'dein Körper und die Art, wie die Welt dich bei der ersten Begegnung wahrnimmt',
    '2': 'deine Finanzen, deine persönlichen Ressourcen und das Gefühl für das, was dir gehört',
    '3': 'dein alltäglicher Verstand, deine Kommunikation und der ständige Austausch mit deiner Umgebung',
    '4': 'dein Zuhause, deine Wurzeln und der intime Rückzugsort, wo du deine Rüstung ablegst',
    '5': 'deine Kreativität, deine Art zu spielen und dich zu verlieben und der Ort, wo du dich tröst, zu schaffen',
    '6': 'deine tägliche Arbeit, deine Gesundheit und die Gewohnheiten, die dein Leben Tag für Tag tragen',
    '7': 'deine intimen Bindungen, deine Partnerschaften und die Verträge, die du mit dem anderen besiegelst',
    '8': 'die Transformation, die tiefe Intimität und alles, was du teilst und loslässt',
    '9': 'deine Sinnsuche, die Studien, die dich erweitern, und die Horizonte, die dich rufen',
    '10': 'deine Berufung, deine Karriere und die öffentliche Anerkennung, die du Schritt für Schritt aufbaust',
    '11': 'deine Freunde, deine Ideale und die Gemeinschaften, in denen deine Vision auf die anderer trifft',
    '12': 'deine Intuition, dein Unbewusstes und die Abschlusszyklen, die deine nächste Wiedergeburt vorbereiten'
  },
  aperturas: [
    'Dein ${area} sucht die ${cualidadCorta} von ${signo}: ${cualidad}',
    'Wenn es um ${area} geht, prägt ${signo} seinen Stempel —${cualidad}—',
    'Der Raum von ${area} atmet in ${signo} und bringt ${cualidad} ein',
    'Dein Rad legt ${area} unter die Signatur von ${signo}: ${cualidad}',
    'Im Bereich von ${area} hinterlässt ${signo} seinen Abdruck —${cualidad}—'
  ],
  conectores: [
    'obwohl die Präsenz von ${planeta} in ${signo} es mit ${cualidad} nuanciert',
    'während ${planeta} in ${signo} ${cualidad} beiträgt',
    'und ergänzt wird durch ${planeta} in ${signo}, das ${cualidad} bringt',
    'aber ${planeta} in ${signo} fügt eine Schicht von ${cualidad} hinzu',
    'wo ${planeta} in ${signo} ${cualidad} einführt'
  ],
  retroFrases: [
    ', eine Kraft, die zuerst in dir bei kleiner Hitze reift, bevor sie sich nach außen manifestiert',
    ' und, da rückläufig, als ein beständiger innerer Dialog gelebt wird, bevor sie sichtbare Handlung wird',
    ', rückläufig, was bedeutet, dass diese Qualität in der Intimität verfeinert wird, bevor sie nach außen tritt'
  ],
  grupos: [
    'Identität und Materie (Häuser 1, 2 und 3)',
    'Rückzug und Dienst (Häuser 4, 5 und 6)',
    'Der Spiegel und die Expansion (Häuser 7, 8 und 9)',
    'Der Gipfel und das Unbewusste (Häuser 10, 11 und 12)'
  ],
  narrativa: {
    s1_asc: 'Der erste Eindruck, den du der Welt gibst, ist durch deinen <strong>Aszendenten in ${ascS}</strong> geprägt: ${sqAsc}. ',
    s1_mascara: 'Es ist die Maske, die du mühelos trägst, deine sichtbare Hülle und zugleich der Kristall, durch den du alles filterst, was das Leben dir bringt. ',
    s1_sol: 'Hinter dieser Maske brennt deine <strong>Sonne in ${solS}</strong>, der unwiderrufliche Kern dessen, wer du bist: ${sqSol}. ',
    s1_solLuz: 'Es ist das Licht, das du zu verkörpern suchst, die wesentliche Identität, die dich authentisch fühlen lässt, wenn du sie vollkommen lebst. ',
    s1_lunaConj: 'Und was wirklich bemerkenswert ist: Dein <strong>Mond steht ebenfalls in ${solS}</strong> und verschmilzt mit deiner Sonne in einer Konjunktion, die wie eine natale Neumondphase erlebt wird. ',
    s1_lunaConj2: 'Deine bewusste Identität und deine emotionalen Bedürfnisse schlagen im Einklang in ${solSLower} und schaffen eine innere Kohärenz von seltener Intensität: du weißt, was du fühlst, und fühlst, was du bist. ',
    s1_lunaConj3: 'Die gesamte Kraft von ${sqSol} konzentriert sich massiv in dir, was dir ein solides Selbstverständnis gibt, aber auch die evolutionäre Spannung in einem einzigen Zeichen bündelt. ',
    s1_contrasteAscSol: 'Jedoch ist der Kontrast zu deinem Aszendenten offensichtlich: obwohl du nach außen ${eiAsc} projizierst, ist dein Inneres ${eiSol}. ',
    s1_contrasteAscSol2: 'Diese Distanz zwischen Erscheinung und Kern ist genau das Terrain, auf dem sich deine Evolution abspielt, der Raum, in dem du dich selbst entdeckst und lernst, in Einklang zu bringen, was du zeigst, mit dem, was du bist.',
    s1_coherencia: 'Die Kohärenz zwischen deiner Erscheinung und deinem Kern verleiht dir eine solide und magnetische Präsenz, auch wenn es dir manchmal schwerfallen kann, dich selbst zu überraschen oder aus dir herauszutreten.',
    s1_luna: 'Ganz tief innen lenkt dein <strong>Mond in ${lunaS}</strong>, was du nicht immer zeigst: ${sqLuna}. ',
    s1_lunaRefugio: 'Es ist der emotionale Rückzugsort, wo du dich nährst und ausruhst, der Teil, der deine instinktiven Reaktionen und deine intimsten Bedürfnisse regiert. ',
    s1_contrasteSolLuna: 'Der Kontrast zwischen deinem Zentrum und deiner Emotionalität ist lebendig: deine Sonne brennt in ${etSol}, während dein Mond mit ${etLuna} fließt. ',
    s1_polaridad1: 'Diese innere Polarität ist zugleich dein Reichtum und deine Spannung, denn ein Teil von dir sucht ${buscaSol}, während ein anderer ${necesitaLuna} braucht. ',
    s1_triangulacion: 'Nichtsdestotrotz vollendet sich die Triangulation mit deinem Aszendenten: obwohl du der Welt ${eiAsc} zeigst, lebst du innen zwischen ${eiSol} und ${eiLuna}. ',
    s1_triangulacion2: 'Dieser Kontrast verleiht dir Tiefe und Geheimnis: du bist nicht, was du auf den ersten Blick zu sein scheinst, und die Reise, dich selbst zu entdecken, ist ein wesentlicher Teil deines Weges.',
    s1_eje: 'Diese drei Energien zeichnen die Achse, auf der alles andere in deinem Rad ruht: die Maske, das Zentrum und der Rückzugsort, jeder mit eigener Farbe, doch eine einzigartige Identität bildend.',

    s2_predominio: 'Dein Charakter ist von der Vorherrschaft des Elements <strong>${domEl}</strong> (${domElC} Platzierungen) durchdrungen, was sich in ${etDom} übersetzt. ',
    s2_concentrado: 'Es ist eine so intensive Konzentration, dass ${eiDom} praktisch dein natürliches Element ist, der Raum, in dem du dich zuhause fühlst und in dem deine Energie mühelos fließt. ',
    s2_tendencia: 'Es ist eine klare Tendenz, die deine Art, in der Welt zu sein, nuanciert. ',
    s2_ausencia: 'Das völlige Fehlen von <strong>${weakEl}</strong> ist aufschlussreich: ${etWeak} kommt nicht von selbst, du wirst es bewusst dein Leben lang kultivieren müssen. ',
    s2_debil: 'Das Element <strong>${weakEl}</strong> erscheint nur ${weakElC}-mal, ein sensibler Punkt, der Pflege und Aufmerksamkeit verdient. ',
    s2_debil2: 'Das Element <strong>${weakEl}</strong> ist vorhanden, wenn auch in geringerem Maße (${weakElC}), und bietet einen Kontrapunkt zu deiner vorherrschenden Tendenz. ',
    s2_modalidad: 'Deine Art, dich durchs Leben zu bewegen, trägt einen <strong>${domMod}</strong>-Stempel (${domModC}): ${mtDom}. ',
    s2_yang: 'Yang-Energie überwiegt (${masculine}/${feminine}), also kommen dir Handlung und Außenwirkung natürlich, doch du wirst dich erinnern müssen, dass wahre Stärke auch anzuhalten und zuzuhören weiß. ',
    s2_yin: 'Yin-Energie überwiegt (${feminine}/${masculine}), also sind Empfänglichkeit und Introspektion dein Rückzugsort, doch du wirst dich erinnern müssen, in die Welt hinauszutreten und das zu manifestieren, was in der Stille gesät wird. ',
    s2_equilibrio: 'Das Gleichgewicht zwischen Yang und Yin (${masculine}/${feminine}) gibt dir eine stabile Basis, von der aus du bewusst wählen kannst. ',

    s2_stellium: 'Kurioserweise konzentriert sich ein Großteil deiner Lebensenergie im Bereich von ${areaStellium}, wo sich ${numPlanetas} Planeten versammeln: ${planetasLista}. ',
    s2_stellium2: 'Diese Konzentration macht diesen Bereich zum Hauptmotor deines Lebens: dort spürst du den größten Druck, aber dort ruht auch dein größtes Potenzial. ',
    s2_stellium3: 'Es ist kein Zufall, dass so viele innere Stimmen an denselben Ort weisen —das Rad zeigt dir, wo deine tiefste Transformation verläuft.',
    s2_noStellium: 'Es gibt keine extremen Konzentrationen in deinem Rad: deine Energie ist über mehrere Bereiche verteilt, was dir Vielseitigkeit verleiht und verhindert, dass ein einziger Bereich deine Existenz monopolisiert.',

    s4_sinAspectos: 'In deinem Rad werden keine engen spannungsreichen Aspekte gefunden, was darauf hindeutet, dass deine Energie in vorwiegender Harmonie fließt. Das gibt dir eine ruhige Basis, lädt dich aber ein, bewusst den Antrieb zu kultivieren, den die Spannung meistens schenkt.',
    s4_conj1: '<strong>${p1} und ${p2} in Konjunktion</strong> (Orbis ${orbStr}). ',
    s4_conj2: '${desc1Cap} und ${desc2} verschmelzen in dir und schaffen eine untrennbare Allianz. ',
    s4_conj3: 'Diese Verschmelzung verleiht dir eine ungewöhnliche Kraft in diesem Bereich deines Lebens, aber die wahre Herausforderung besteht darin, beide Stimmen zu integrieren, ohne dass eine die andere zum Schweigen bringt.',
    s4_opp1: '<strong>${p1} in Opposition zu ${p2}</strong> (Orbis ${orbStr}). ',
    s4_opp2: 'Du spürst einen ständigen Widerstreit zwischen ${desc1} und ${desc2}. ',
    s4_opp3: 'Die Herausforderung besteht nicht darin, eine Seite zu wählen und die andere zu unterdrücken, sondern die Spannung zu halten, bis beide Kräfte sich gegenseitig nähren und du lernst, im Paradox zu leben.',
    s4_sq1: '<strong>${p1} im Quadrat mit ${p2}</strong> (Orbis ${orbStr}). ',
    s4_sq2: 'Die Reibung zwischen ${desc1} und ${desc2} fühlt sich wie ein ständiges Scheuern in dir an. ',
    s4_sq3: 'Doch dieses Unbehagen ist der Motor deines Wachstums: was dir schwerfällt zu integrieren, ist genau das, was dich reifen lässt und dir Tiefe gibt.',
    s4_tri1: '<strong>${p1} im Trigon mit ${p2}</strong> (Orbis ${orbStr}). ',
    s4_tri2: '${desc1Cap} und ${desc2} fließen in natürlicher Harmonie. ',
    s4_tri3: 'Diese Allianz ist ein Geschenk: beide Kräfte potenzieren sich mühelos, und deine Herausforderung ist, sie nicht als selbstverständlich hinzunehmen, sondern bewusst zu nutzen.',
    s4_sex1: '<strong>${p1} im Sextil mit ${p2}</strong> (Orbis ${orbStr}). ',
    s4_sex2: 'Es gibt einen offenen Kanal zwischen ${desc1} und ${desc2}, eine Gelegenheit, die aktiviert werden will. ',
    s4_sex3: 'Die Leichtigkeit ist da, aber du wirst die Initiative ergreifen müssen, um sie zu nutzen.',

    s5_nodoN: 'Deine Evolution ruft dich zum <strong>Nordknoten in ${signo}</strong>: ${sqSigno}. ',
    s5_nodoN2: 'Es ist die Richtung, die dich erschreckt, weil sie neu ist, aber auch die, die dich erweitert und dich zurückführt zu dem, der du werden sollst. ',
    s5_nodoS: 'Du nimmst Abschied vom <strong>Südknoten in ${signo}</strong>, der Komfortzone, die du bereits beherrschst und von der du dich lösen musst, um nicht zu erstarren. ',
    s5_lilith: 'Deine instinktive und wilde Kraft ruht in <strong>Lilith in ${signo}</strong>: ${sqSigno}, der Teil von dir, der ohne Scham und ohne Zähmung anerkannt werden will. ',
    s5_fortuna: 'Und dein Glücksfluss erstrahlt im <strong>Glückspunkt in ${signo}</strong>, dem Bereich, in dem die natürliche Freude auf dich wartet, wenn du deine Identität, deine Emotion und deine Art, dich der Welt zu zeigen, in Einklang bringst. ',

    s6_yang: 'Dein Rad brennt in Yang: erinnere dich, dass wahre Stärke auch anzuhalten und zuzuhören weiß. ',
    s6_yin: 'Dein Rad fließt in Yin: erinnere dich, dass das in der Stille Gesäte auch in der Welt manifestiert werden will. ',
    s6_equil: 'Dein Rad balanciert Impuls und Zurückhaltung: wähle bewusst von dieser soliden Basis aus. ',
    s6_stellium: 'Die Konzentration im Bereich von ${areaStellium} ist dein Kompass und deine Last: dort liegt dein größtes Potenzial. ',
    s6_cierre: 'Das Rad ist eine Karte, kein Urteil —was als Spannung erscheint, ist Rohstoff für dein Wachstum, und die einzig wahre Magie ist, mit vollem Bewusstsein zu wählen, wer du sein willst.',

    avisoFinal: 'Diese Analyse ist eine symbolische Deutung deines Geburtsrads. Verstehe sie als Spiegel zur Reflexion und Selbsterkenntnis, nicht als deterministische Vorhersage.'
  }
},

// ════════════════════════════════════════════════════════════════════════════
//  ITALIANO
// ════════════════════════════════════════════════════════════════════════════
it: {
  titulo: '✦ Analisi Astrale Oracolare ✦',
  subtitulo: 'Un viaggio psicologico attraverso la tua carta natale',
  secciones: {
    s1_titulo: '1. L\'Asse del Tuo Essere (Il Tuo Grande Trigono)',
    s2_titulo: '2. La Tua Impronta Energetica',
    s3_titulo: '3. Gli Scenari della Tua Vita',
    s4_titulo: '4. Il Motore della Tua Crescita',
    s5_titulo: '5. La Tua Bussola Karmica',
    s6_titulo: '6. Il Consiglio dell\'Oracolo'
  },
  SQ: {
    'Aries': 'iniziativa, coraggio e un impulso pionieristico che apre la via dove altri vedono muri',
    'Tauro': 'stabilità, pazienza e una sensualità radicata nel tangibile e nel durevole',
    'Géminis': 'curiosità, versatilità mentale e una sete insaziabile di collegare idee e persone',
    'Cáncer': 'sensibilità protettiva, memoria emotiva e un legame profondo con le radici e la cura',
    'Leo': 'orgoglio creativo, calore e un bisogno irrinunciabile di brillare ed essere riconosciuto',
    'Virgo': 'analisi, servizio e una spinta perfezionista che cerca la maestria nel pratico',
    'Libra': 'equilibrio, diplomazia e una ricerca costante di armonia e bellezza nei legami',
    'Escorpio': 'intensità, penetrazione e una capacità di immergersi nell\'occulto e rinascere trasformato',
    'Sagitario': 'espansione, fede e una ricerca entusiasta di senso, verità e orizzonti ampi',
    'Capricornio': 'ambizione, disciplina e una volontà di costruire passo dopo passo verso il durevole',
    'Acuario': 'originalità, idealismo e una visione del futuro che sfida il stabile per convinzione',
    'Piscis': 'empatia, immaginazione e un abbandono all\'invisibile e all\'universale che dissolve i confini'
  },
  SE: {
    'Aries': 'Fuoco', 'Leo': 'Fuoco', 'Sagitario': 'Fuoco',
    'Tauro': 'Terra', 'Virgo': 'Terra', 'Capricornio': 'Terra',
    'Géminis': 'Aria', 'Libra': 'Aria', 'Acuario': 'Aria',
    'Cáncer': 'Acqua', 'Escorpio': 'Acqua', 'Piscis': 'Acqua'
  },
  ET: {
    'Fuoco': 'passione, ispirazione e un impulso d\'azione che ha bisogno di combustibile',
    'Terra': 'pragmatismo, stabilità e un ancoraggio nel concreto e nel durevole',
    'Aria': 'mentalità, socievolezza e una fame di comunicazione e idee',
    'Acqua': 'emotività, intuizione e una capacità di sentire e connettersi profondamente'
  },
  EI: {
    'Fuoco': 'la fiamma che danza',
    'Terra': 'la montagna che dura',
    'Aria': 'il vento che disperde i semi',
    'Acqua': 'l\'oceano che tutto accoglie'
  },
  MT: {
    'Cardinal': 'iniziativa per intraprendere, leadership e uno slancio che avvia i cicli',
    'Fisso': 'perseveranza, stabilità e una resistenza che regge quando gli altri cedono',
    'Mutabile': 'adattabilità, fluidità e un talento per transitare tra mondi ed epoche'
  },
  PA: {
    'Sun': 'la tua identità essenziale, la scintilla vitale e il proposito che ti fa sentire autentico',
    'Moon': 'il tuo mondo emotivo, i tuoi bisogni intimi e il modo in cui nutri e riposi',
    'Mercury': 'la tua mente, la tua parola e il modo di tessere pensieri e collegare idee',
    'Venus': 'la tua capacità di amare, i tuoi valori e la tua sensibilità per la bellezza e il piacere',
    'Mars': 'il tuo coraggio, il tuo desiderio e l\'energia che metti nel perseguire ciò che vuoi',
    'Jupiter': 'la tua fede, la tua espansione e la ricerca di senso e verità',
    'Saturn': 'la tua disciplina, i tuoi limiti e le lezioni che strutturano la tua maturità',
    'Uranus': 'la tua originalità, la tua ribellione e il lampo d\'intuizione che spezza il stabile',
    'Neptune': 'la tua immaginazione, la tua spiritualità e il velo tra sogno e abbandono',
    'Pluto': 'il tuo potere di trasformazione, la tua ombra e la capacità di morire e rinascere',
    'N Node': 'il tuo cammino karmico di crescita, la direzione che spaventa ma ti espande',
    'Chiron': 'la ferita che diventa guarigione e saggezza',
    'Lilith': 'il tuo io selvaggio e nascosto, l\'istintivo che chiede di essere riconosciuto senza vergogna'
  },
  CT: {
    '1': 'il tuo corpo e il modo in cui il mondo ti percepisce al primo incontro',
    '2': 'le tue finanze, le tue risorse personali e il senso di ciò che ti appartiene',
    '3': 'la tua mente quotidiana, la tua comunicazione e lo scambio costante con l\'ambiente',
    '4': 'la tua casa, le tue radici e il rifugio intimo dove deponi l\'armatura',
    '5': 'la tua creatività, il tuo modo di giocare e innamorarti e il luogo dove osi creare',
    '6': 'il tuo lavoro quotidiano, la tua salute e le abitudini che sostengono la tua vita giorno per giorno',
    '7': 'i tuoi legami intimi, le tue relazioni e i contratti che stringi con l\'altro',
    '8': 'la trasformazione, l\'intimità profonda e tutto ciò che condividi e lasci andare',
    '9': 'la tua ricerca di senso, gli studi che ti ampliano e gli orizzonti che ti chiamano',
    '10': 'la tua vocazione, la tua carriera e il riconoscimento pubblico che costruisci passo dopo passo',
    '11': 'i tuoi amici, i tuoi ideali e le comunità dove la tua visione incontra quella degli altri',
    '12': 'la tua intuizione, il tuo inconscio e i cicli di chiusura che preparano la tua prossima rinascita'
  },
  aperturas: [
    'Il tuo ${area} cerca la ${cualidadCorta} di ${signo}: ${cualidad}',
    'Quando si tratta di ${area}, ${signo} imprime il suo sigillo —${cualidad}—',
    'Lo spazio di ${area} respira in ${signo}, portando ${cualidad}',
    'La tua carta pone ${area} sotto la firma di ${signo}: ${cualidad}',
    'Nel terreno di ${area}, ${signo} lascia la sua impronta —${cualidad}—'
  ],
  conectores: [
    'sebbene la presenza di ${planeta} in ${signo} lo sfumi con ${cualidad}',
    'mentre ${planeta} in ${signo} porta ${cualidad}',
    'e si completa con ${planeta} in ${signo}, che reca ${cualidad}',
    'ma ${planeta} in ${signo} aggiunge uno strato di ${cualidad}',
    'dove ${planeta} in ${signo} introduce ${cualidad}'
  ],
  retroFrases: [
    ', una forza che prima cuoce a fuoco lento dentro di te prima di manifestarsi all\'esterno',
    ' e, essendo retrogrado, si vive come un dialogo interiore costante prima di diventare azione visibile',
    ', retrogrado, il che significa che questa qualità si affina nell\'intimità prima di proiettarsi'
  ],
  grupos: [
    'Identità e Materia (Case 1, 2 e 3)',
    'Rifugio e Servizio (Case 4, 5 e 6)',
    'Lo Specchio e l\'Espansione (Case 7, 8 e 9)',
    'La Vetta e l\'Inconscio (Case 10, 11 e 12)'
  ],
  narrativa: {
    s1_asc: 'La prima impressione che offri al mondo è segnata dal tuo <strong>Ascendente in ${ascS}</strong>: ${sqAsc}. ',
    s1_mascara: 'È la maschera che indossi senza sforzo, il tuo involucro visibile, e anche il cristallo attraverso cui filtri tutto ciò che la vita ti porta. ',
    s1_sol: 'Dietro quella maschera arde il tuo <strong>Sole in ${solS}</strong>, il nucleo irrinunciabile di chi sei: ${sqSol}. ',
    s1_solLuz: 'È la luce che cerchi di incarnare, l\'identità essenziale che ti fa sentire autentico quando la vivi pienamente. ',
    s1_lunaConj: 'E ciò che è davvero notevole è che la tua <strong>Luna si trova anch\'essa in ${solS}</strong>, fondendosi con il tuo Sole in una congiunzione vissuta come una Luna Nuova natale. ',
    s1_lunaConj2: 'La tua identità conscia e i tuoi bisogni emotivi battono all\'unisono in ${solSLower}, creando una coerenza interiore di un\'intensità non comune: sai ciò che senti e senti ciò che sei. ',
    s1_lunaConj3: 'Tutta la forza di ${sqSol} si concentra in te in modo massiccio, il che ti dà una solida autocoscienza ma concentra anche la tensione evolutiva in un solo segno. ',
    s1_contrasteAscSol: 'Tuttavia, il contrasto con il tuo Ascendente è evidente: sebbene fuori proietti ${eiAsc}, il tuo interno è ${eiSol}. ',
    s1_contrasteAscSol2: 'Quella distanza tra apparenza e nucleo è esattamente il terreno dove si gioca la tua evoluzione, lo spazio in cui ti scopri e impari a riconciliare ciò che mostri con ciò che sei.',
    s1_coherencia: 'La coerenza tra la tua apparenza e il tuo nucleo ti dà una presenza solida e magnetica, anche se a volte può costarti sorprenderti o uscire da te stesso.',
    s1_luna: 'Nel profondo, la tua <strong>Luna in ${lunaS}</strong> governa ciò che non sempre mostri: ${sqLuna}. ',
    s1_lunaRefugio: 'È il rifugio emotivo dove ti nutri e riposi, la parte che governa le tue reazioni istintive e i tuoi bisogni più intimi. ',
    s1_contrasteSolLuna: 'Il contrasto tra il tuo centro e la tua emotività è vivo: il tuo Sole arde in ${etSol} mentre la tua Luna scorre con ${etLuna}. ',
    s1_polaridad1: 'Quella polarità interiore è insieme la tua ricchezza e la tua tensione, poiché una parte di te cerca ${buscaSol} mentre un\'altra ha bisogno di ${necesitaLuna}. ',
    s1_triangulacion: 'Ciononostante, la triangolazione si completa con il tuo Ascendente: sebbene tu mostri ${eiAsc} al mondo, dentro vivi tra ${eiSol} e ${eiLuna}. ',
    s1_triangulacion2: 'Quel contrasto ti dà profondità e mistero: non sei ciò che sembri a prima vista, e il viaggio di scoprire te stesso è parte essenziale del tuo cammino.',
    s1_eje: 'Queste tre energie disegnano l\'asse su cui poggia tutto il resto nella tua carta: la maschera, il centro e il rifugio, ciascuno con il proprio colore ma a formare un\'identità unica.',

    s2_predominio: 'Il tuo carattere è impregnato dalla prevalenza dell\'elemento <strong>${domEl}</strong> (${domElC} posizioni), il che si traduce in ${etDom}. ',
    s2_concentrado: 'È una concentrazione così intensa che ${eiDom} è praticamente il tuo elemento naturale, lo spazio in cui ti senti a casa e dove la tua energia scorre senza sforzo. ',
    s2_tendencia: 'È una tendenza chiara che sfuma il tuo modo di essere nel mondo. ',
    s2_ausencia: 'La totale assenza di <strong>${weakEl}</strong> è rivelatrice: ${etWeak} non viene in modo naturale, dovrai quindi coltivarlo coscientemente lungo tutta la vita. ',
    s2_debil: 'L\'elemento <strong>${weakEl}</strong> appare appena ${weakElC} volta, un punto sensibile che merita cura e attenzione. ',
    s2_debil2: 'L\'elemento <strong>${weakEl}</strong> è presente seppure in minor misura (${weakElC}), offrendo un contrappunto alla tua tendenza dominante. ',
    s2_modalidad: 'Il tuo modo di muoverti nella vita porta un marchio <strong>${domMod}</strong> (${domModC}): ${mtDom}. ',
    s2_yang: 'L\'energia yang prevale (${masculine}/${feminine}), dunque l\'azione e l\'esteriorità ti sono naturali, benché dovrai ricordare che la vera forza sa anche fermarsi e ascoltare. ',
    s2_yin: 'L\'energia yin prevale (${feminine}/${masculine}), dunque la ricettività e l\'introspezione sono il tuo rifugio, benché dovrai ricordare di uscire nel mondo e manifestare ciò che si semina in silenzio. ',
    s2_equilibrio: 'L\'equilibrio tra yang e yin (${masculine}/${feminine}) ti dà una base stabile da cui puoi scegliere coscientemente. ',

    s2_stellium: 'Curiosamente, gran parte della tua energia vitale si concentra nell\'ambito di ${areaStellium}, dove si riuniscono ${numPlanetas} pianeti: ${planetasLista}. ',
    s2_stellium2: 'Questa concentrazione converte quell\'area nel motore principale della tua vita: è dove senti la maggiore pressione, ma anche dove risiede il tuo maggiore potenziale. ',
    s2_stellium3: 'Non è un caso che tante voci interiori indichino lo stesso luogo —la carta ti indica dove passa la tua trasformazione più profonda.',
    s2_noStellium: 'Non ci sono concentrazioni estreme nella tua carta: la tua energia è ripartita tra diverse aree, il che ti dà versatilità ed evita che una sola zona monopolizzi la tua esistenza.',

    s4_sinAspectos: 'Non si rilevano aspetti tesi stretti nella tua carta, il che indica che la tua energia scorre con un\'armonia prevalente. Questo ti dà una base serena, ma t\'invita a coltivare volontariamente lo slancio che la tensione di solito dona.',
    s4_conj1: '<strong>${p1} e ${p2} in congiunzione</strong> (orbe ${orbStr}). ',
    s4_conj2: '${desc1Cap} e ${desc2} si fondono dentro di te, creando un\'alleanza inseparabile. ',
    s4_conj3: 'Questa fusione ti dà una potenza non comune in quel terreno della tua vita, ma la vera sfida sta nell\'integrare entrambe le voci senza che nessuna metta a tacere l\'altra.',
    s4_opp1: '<strong>${p1} in opposizione a ${p2}</strong> (orbe ${orbStr}). ',
    s4_opp2: 'Senti un tira e molla costante tra ${desc1} e ${desc2}. ',
    s4_opp3: 'La sfida non è scegliere un lato e reprimere l\'altro, ma reggere la tensione finché entrambe le forze si alimentino a vicenda e tu impari ad abitare il paradosso.',
    s4_sq1: '<strong>${p1} in quadratura con ${p2}</strong> (orbe ${orbStr}). ',
    s4_sq2: 'L\'attrito tra ${desc1} e ${desc2} si sente come un costante sfregamento dentro di te. ',
    s4_sq3: 'Tuttavia, quel disagio è il motore della tua crescita: ciò che ti costa integrare è esattamente ciò che ti matura e ti dà profondità.',
    s4_tri1: '<strong>${p1} in trigono con ${p2}</strong> (orbe ${orbStr}). ',
    s4_tri2: '${desc1Cap} e ${desc2} scorrono in armonia naturale. ',
    s4_tri3: 'Questa alleanza è un dono: entrambe le forze si potenziano senza sforzo, e la tua sfida è non darle per scontate ma usarle coscientemente.',
    s4_sex1: '<strong>${p1} in sestile con ${p2}</strong> (orbe ${orbStr}). ',
    s4_sex2: 'C\'è un canale aperto tra ${desc1} e ${desc2}, un\'opportunità che chiede di essere attivata. ',
    s4_sex3: 'La facilità è lì, ma dovrai prendere l\'iniziativa per coglierla.',

    s5_nodoN: 'La tua evoluzione ti chiama verso il <strong>Nodo Nord in ${signo}</strong>: ${sqSigno}. ',
    s5_nodoN2: 'È la direzione che spaventa perché è nuova, ma è anche quella che ti espande e ti restituisce a chi sei chiamato a essere. ',
    s5_nodoS: 'Da essa ti congedi dal <strong>Nodo Sud in ${signo}</strong>, la zona di comfort che già domini e da cui devi staccarti per non stagnare. ',
    s5_lilith: 'Il tuo potere istintivo e selvaggio risiede in <strong>Lilith in ${signo}</strong>: ${sqSigno}, la parte di te che chiede di essere riconosciuta senza vergogna né domesticazione. ',
    s5_fortuna: 'E il tuo flusso di fortuna brilla nella <strong>Parte di Fortuna in ${signo}</strong>, l\'ambito dove la gioia naturale ti attende quando allinei la tua identità, la tua emozione e il tuo modo di presentarti al mondo. ',

    s6_yang: 'La tua carta arde in yang: ricorda che la vera forza sa anche fermarsi e ascoltarsi. ',
    s6_yin: 'La tua carta scorre in yin: ricorda che ciò che è seminato in silenzio chiede anche di essere manifestato nel mondo. ',
    s6_equil: 'La tua carta equilibra impulso e contenimento: scegli coscientemente da quella base solida. ',
    s6_stellium: 'La concentrazione nell\'area di ${areaStellium} è la tua bussola e il tuo carico: lì sta il tuo maggiore potenziale. ',
    s6_cierre: 'La carta è una mappa, non una condanna —ciò che sembra tensione è materia prima per la tua crescita, e l\'unica vera magia è scegliere, con piena consapevolezza, chi vuoi essere.',

    avisoFinal: 'Questa analisi è un\'interpretazione simbolica della tua carta natale. Prendila come specchio per la riflessione e la conoscenza di te, non come previsione deterministica.'
  }
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

  // Add or replace the analisisAstral section
  data.analisisAstral = T[lang];

  // Write back with 2-space indentation
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`[OK]   ${lang} → ${path.basename(filePath)}`);
  ok++;
}

console.log(`\nDone. Updated ${ok} file(s).`);