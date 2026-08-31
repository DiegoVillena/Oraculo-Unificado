// core/sinastria-dictionary.js — Diccionario de interpretaciones para el fallback local
// Mapeos de textos descriptivos para aspectos clave, planetas en casas, y dimensiones del radar.
// Las claves son nombres canónicos en inglés (Sun, Moon, Conjunction, etc.) y se traducen al idioma activo.

import { t, tAspecto } from '../i18n/i18n.js?v=72';

// Helper: nombre de planeta traducido
function _pn(nombreEN) {
  const np = t('astral.nombresPlanetarios');
  return (np && typeof np === 'object' && np[nombreEN]) ? np[nombreEN] : nombreEN;
}

// Nombres canónicos de planeta en inglés que pueden aparecer embebidos en las
// frases del diccionario (que están escritas en español). Se reemplazan por su
// traducción al idioma activo para que el texto sea consistente con la UI.
const _PLANETAS_EN = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
function _localizarPlanetas(texto) {
  if (!texto) return texto;
  let out = texto;
  for (const en of _PLANETAS_EN) {
    const tr = _pn(en);
    if (tr && tr !== en) {
      out = out.replace(new RegExp('\\b' + en + '\\b', 'g'), tr);
    }
  }
  return out;
}

// ============================================================
// 1. DICCIONARIO DE ASPECTOS CLAVE
// Clave: "PlanetaA-PlanetaB-TipoAspecto" (ej: "Venus-Mars-Conjunction")
// El orden de planetas es indiferente (se busca en ambas direcciones).
// ============================================================

const DICC_ASPECTOS = {
  // === Venus-Marte: química y pasión ===
  'Venus-Mars-Conjunction': 'Existe una atracción magnética e intensa vibración física entre ustedes. La química sensorial fluye casi sin esfuerzo, creando un magnetismo que difícilmente pasa desapercibido. Es el contacto Venus-Marte en su forma más pura: deseo, afecto y atracción se funden en un solo canal.',
  'Venus-Mars-Trine': 'La pasión fluye con naturalidad y armonía. El deseo y el afecto se complementan sin fricción, generando una química sostenida que no se apaga. Hay una sintonía corporal y emocional que hace que estar juntos se sienta como un instinto compartido.',
  'Venus-Mars-Sextile': 'Existe una oportunidad de sintonía sensual y afectuosa que, si se cultiva conscientemente, puede convertirse en una química duradera. La atracción es sutil pero real, pidiendo ser despertada con pequeños gestos de conexión.',
  'Venus-Mars-Square': 'La atracción es intensa pero puede verse atravesada por tensiones entre el dar y el recibir, entre el deseo y el afecto. Hay magnetismo, pero también desafíos para armonizar los ritmos emocionales. Consciencia y paciencia transforman la fricción en crecimiento.',
  'Venus-Mars-Opposition': 'Existe una polaridad magnética entre el deseo y el amor. La tensión es creativa: ustedes se atraen mutuamente desde lugares distintos, y ese contraste puede generar tanto fascinación como momentos de desencuentro. Integrar los opuestos es el camino.',

  // === Sol-Luna: identidad y emociones ===
  'Sun-Moon-Conjunction': 'Sus esencias más íntimas —la identidad y la emocionalidad— están alineadas. Hay una comprensión instintiva, un sentirse "vistos" por el otro en lo más profundo. Es uno de los aspectos más unificadores de la sinastría.',
  'Sun-Moon-Trine': 'El fluir entre la identidad y la emoción es natural y armónico. Se sienten cómodos siendo ellos mismos, sin necesidad de filtrar lo que sienten. Hay una sensación de hogar emocional al estar juntos.',
  'Sun-Moon-Sextile': 'Existe una sintonía sutil entre la identidad y la emoción que, si se nutre, crea una base de comprensión. No es algo que se imponga por sí solo, pero se activa con la confianza y la intimidad.',
  'Sun-Moon-Square': 'Hay tensión entre la identidad y la emoción, entre lo que uno quiere proyectar y lo que el otro necesita sentir. Puede haber momentos de incomprensión, pero también de crecimiento profundo si se aprende a sostener las diferencias.',
  'Sun-Moon-Opposition': 'Existe una polaridad entre la identidad y la emoción que genera atracción y complementariedad. Uno ofrece lo que al otro le falta, pero integrar esos opuestos requiere consciencia. Es un aspecto clásico de atracción complementaria.',

  // === Luna-Luna: vínculo emocional ===
  'Moon-Moon-Conjunction': 'Sus mundos emocionales están en sintonía profunda. Comparten necesidades emocionales similares y responden al entorno de forma afín. Hay una sensación inmediata de familiaridad, como de reconocerse en el otro.',
  'Moon-Moon-Trine': 'La comprensión emocional fluye con facilidad. Comparten un lenguaje interior hecho de silencios cómplices y gestos que no necesitan explicación. Es uno de los apoyos emocionales más estables.',
  'Moon-Moon-Square': 'Hay diferencias en sus necesidades emocionales que pueden generar momentos de incomprensión. No es falta de amor, sino de idiomas emocionales distintos. Reconocer y respetar esas diferencias fortalece el vínculo.',
  'Moon-Moon-Opposition': 'Sus mundos emocionales son distintos y complementarios. Uno siente lo que al otro le cuesta expresar. Esta polaridad puede ser enriquecedora si se evita el juego de culpas y se busca integrar.',

  // === Mercurio-Mercurio: comunicación ===
  'Mercury-Mercury-Conjunction': 'La comunicación fluye con una naturalidad sorprendente. Sus mentes procesan la información de forma similar, y compartir ideas se siente como un juego reflejo. Es uno de los aspectos más unificadores para la afinidad mental.',
  'Mercury-Mercury-Trine': 'La sintonía mental es fluida. Comprenden lo que el otro quiere decir antes de que termine la frase. Hay un placer compartido en conversar, explorar ideas y debatir.',
  'Mercury-Mercury-Sextile': 'Existe una compatibilidad comunicativa que, si se activa con curiosidad mutua, genera diálogos enriquecedores. No es automática, pero se cultiva con facilidad.',
  'Mercury-Mercury-Square': 'Hay diferencias en los estilos de comunicación que pueden generar malentendidos. No es falta de entendimiento, sino de codificación. Con paciencia y escucha activa, estas diferencias se transforman en complementariedad.',

  // === Saturno: estabilidad y compromiso ===
  'Sun-Saturn-Conjunction': 'La relación tiene un tono de seriedad y compromiso profundo. Saturno aporta estructura y longevidad al vínculo, pero también puede sentirse restrictivo. Es un aspecto que construye a largo plazo, con paciencia.',
  'Saturn-Saturn-Conjunction': 'Comparten una estructura vital similar, un sentido del deber y la responsabilidad que se reconoce mutuamente. Hay una sensación de "compañeros de camino" ante los desafíos de la vida.',
  'Venus-Saturn-Conjunction': 'El amor en esta relación tiene un tono de compromiso duradero. Venus aporta ternura, Saturno aporta permanencia. Puede haber momentos de frialdad, pero la lealtad es profunda.',
  'Venus-Saturn-Trine': 'El amor se construye sobre cimientos sólidos. Hay una sensación de seguridad y compromiso que se sostiene en el tiempo. La estabilidad emocional es una fortaleza del vínculo.',
  'Venus-Saturn-Square': 'Hay tensión entre el deseo de libertad afectiva y la necesidad de estructura. Saturno puede parecer restrictivo para Venus, pero esta tensión, bien gestionada, genera un amor maduro y consciente.',

  // === Neptuno: espiritualidad y sueños ===
  'Sun-Neptune-Conjunction': 'Existe una conexión que trasciende lo terrenal. Neptuno aporta un tono idealista y espiritual a la relación. Hay fascinación mutua, pero también riesgo de idealización. Es importante anclar la fantasía en la realidad.',
  'Moon-Neptune-Conjunction': 'La empatía entre ustedes es casi telepática. Hay una sensibilidad compartida que capta matices invisibles para otros. Cuidado con los límites emocionales: la fusión puede ser hermosa pero desorientadora.',
  'Venus-Neptune-Conjunction': 'El amor adquiere un tono idealista y romántico. Hay una sensación de amor eterno, de destino compartido. Es hermoso, pero requiere anclar la idealización en la realidad cotidiana para no decepcionarse.',
  'Saturn-Neptune-Conjunction': 'La estructura y la espiritualidad se unen. Saturno aporta disciplina a los sueños de Neptuno, y Neptuno aporta inspiración a la estructura de Saturno. Es una alianza entre lo terrenal y lo trascendente.',
  'Mars-Neptune-Square': 'Pueden surgir malentendidos en la acción, idealizaciones excesivas, o dificultad para alinear la voluntad con la inspiración. La acción directa choca con la sutileza neptuniana. Consciencia y honestidad son las herramientas para navegarlo.',

  // === Plutón: transformación ===
  'Sun-Pluto-Conjunction': 'La relación tiene un poder transformador profundo. Plutón irrumpe en la identidad del Sol, generando un vínculo intenso que puede cambiar a ambos. No es una conexión superficial: es alquimia pura.',
  'Venus-Pluto-Conjunction': 'El amor aquí es intenso, posesivo y transformador. Hay una pasión que no se conforma con la superficie. El vínculo puede atravesar crisis que, bien vividas, profundizan la intimidad hasta niveles extraordinarios.',
  'Venus-Pluto-Trine': 'La pasión se canaliza con madurez. Hay un erotismo profundo y una capacidad de transformar juntos, sin que la intensidad destruya. Es un aspecto de química sostenida y evolutiva.',

  // === Nodo Norte: destino kármico ===
  'N Node-Sun-Conjunction': 'Hay una sensación de destino compartido. El Sol activa el camino evolutivo del Nodo Norte, como si esta relación fuera parte de un aprendizaje kármico. Uno siente que el otro "llega en el momento correcto".',
  'N Node-Moon-Conjunction': 'El vínculo emocional tiene un tono kármico. Hay una sensación de reconocerse desde antes, como si las almas ya se conocieran. La Luna nutre el camino evolutivo del Nodo.',
  'N Node-Venus-Conjunction': 'El amor tiene un tono de destino. Venus activa el camino de crecimiento del Nodo Norte, como si esta relación fuera una escuela de amor. Hay un sentido de "esto tenía que pasar".',

  // === Júpiter: expansión y crecimiento ===
  'Jupiter-Pluto-Trine': 'La expansión y la transformación se apoyan mutuamente. Júpiter aporta visión, Plutón aporta profundidad. Juntos, pueden generar cambios profundos y duraderos con un sentido de propósito.',
  'Sun-Jupiter-Conjunction': 'La relación tiene un tono expansivo y generoso. Júpiter amplifica la identidad del Sol, generando entusiasmo y confianza. Hay una sensación de "crecer juntos" que es muy nutritiva.',
};

// ============================================================
// 2. DICCIONARIO DE PLANETAS EN CASAS
// Clave: "Planeta-CasaN" (ej: "Sun-4", "Venus-5")
// ============================================================

const DICC_CASAS = {
  'Sun-1': 'El Sol ilumina la identidad del otro, aportando confianza y vitalidad a su forma de ser.',
  'Sun-4': 'El Sol aporta calidez al hogar y las raíces emocionales, creando un sentido de pertenencia compartida.',
  'Sun-5': 'El Sol enciende el romance, la creatividad y el juego. Hay alegría de vivir juntos.',
  'Sun-7': 'El Sol ilumina el compromiso y la pareja, generando un sentido natural de "nosotros".',
  'Sun-10': 'El Sol apoya los propósitos y el reconocimiento público, aportando visión al camino profesional.',
  'Moon-1': 'La Luna nutre la identidad del otro, creando una sensación de seguridad emocional al estar juntos.',
  'Moon-4': 'La Luna profundiza el hogar emocional compartido. Hay un instinto de cuidado y protección mutua.',
  'Moon-5': 'La Luna aporta ternura al romance y la creatividad. Hay una conexión emocional que se expresa con dulzura.',
  'Moon-7': 'La Luna nutre el compromiso. Hay una necesidad emocional de estar juntos, de construir un "nosotros" estable.',
  'Moon-10': 'La Luna apoya los propósitos desde la intuición. Hay una sensibilidad que guía las decisiones importantes.',
  'Mercury-3': 'La comunicación cotidiana fluye con naturalidad. Hay placer en conversar de lo simple y lo cotidiano.',
  'Mercury-4': 'La comunicación nutre el hogar. Hay conversaciones profundas en la intimidad, un lenguaje privado compartido.',
  'Mercury-7': 'La comunicación es el puente del compromiso. Hay un diálogo constante que sostiene la relación.',
  'Venus-5': 'Venus enciende el romance, la creatividad y el placer compartido. Es el amor en su forma más luminosa.',
  'Venus-7': 'Venus nutre el compromiso y la armonía de pareja. Hay un amor que se construye con elegancia y equilibrio.',
  'Venus-4': 'Venus aporta belleza y dulzura al hogar. Hay un sentido de aestética compartida en el espacio íntimo.',
  'Venus-1': 'Venus embellece la identidad del otro, aportando admiración y deseo de agradar.',
  'Mars-1': 'Marte activa la identidad del otro, aportando energía y impulso. Hay un dinamismo que se contagia.',
  'Mars-3': 'Mars dinamiza la comunicación. Hay debates vivos, intercambios directos y una mente que se activa con la tensión creativa.',
  'Mars-5': 'Mars enciende la pasión, el juego y el deseo. Hay una química creativa que se expresa con intensidad.',
  'Mars-7': 'Mars activa el compromiso, a veces con tensión. Hay un deseo de construir juntos, aunque los ritmos puedan chocar.',
  'Mars-10': 'Mars impulsa los propósitos y la ambición. Hay una energía compartida que se dirige hacia metas concretas.',
  'Jupiter-4': 'Jupiter expande el hogar y las raíces. Hay una sensación de abundancia y crecimiento en el espacio íntimo.',
  'Jupiter-7': 'Jupiter expande el compromiso con generosidad. Hay un sentido de "crecer juntos" que es muy nutritivo.',
  'Jupiter-10': 'Jupiter amplía los propósitos y el reconocimiento. Hay una visión compartida del futuro que inspira.',
  'Saturn-4': 'Saturn aporta estabilidad al hogar. Hay un sentido de raíces profundas, de construir algo que dure.',
  'Saturn-7': 'Saturn aporta permanencia al compromiso. Hay un amor que se construye con paciencia, estructura y lealtad.',
  'Saturn-10': 'Saturn estructura los propósitos. Hay una ambición compartida que se construye paso a paso, con disciplina.',
  'Neptune-5': 'Neptune aporta magia al romance y la creatividad. Hay una inspiración compartida, pero cuidado con idealizar.',
  'Neptune-7': 'Neptune aporta un tono idealista al compromiso. Hay un amor que trasciende, pero requiere límites claros.',
  'Neptune-12': 'Neptune activa el vínculo espiritual y kármico. Hay una conexión que se siente más allá de lo visible.',
  'Pluto-4': 'Pluto transforma el hogar y las raíces. Hay un vínculo profundo que puede reestructurar la familia y el espacio íntimo.',
  'Pluto-8': 'Pluto intensifica la intimidad y la transformación compartida. Hay un vínculo que no teme las profundidades.',
  'Pluto-10': 'Pluto transforma los propósitos y el reconocimiento. Hay un poder compartido que puede cambiar el destino.',
  'N Node-4': 'El Nodo Norte activa el hogar como camino evolutivo. Hay un sentido de destino compartido en las raíces.',
  'N Node-7': 'El Nodo Norte activa el compromiso como camino evolutivo. La relación es parte del aprendizaje kármico.',
  'N Node-10': 'El Nodo Norte activa los propósitos como camino evolutivo. Hay un destino profesional que se entrelaza.',
  'N Node-12': 'El Nodo Norte activa el vínculo espiritual. Hay una conexión que trasciende lo terrenal, un karma que se resuelve.',
};

// ============================================================
// 3. DICCIONARIO DE DIMENSIONES DEL RADAR
// ============================================================

const DICC_RADAR_NIVELES = {
  quimicaPasion: {
    Alta: 'La química física y la pasión entre ustedes son intensas. Hay un magnetismo que se siente en el cuerpo, una atracción que no necesita palabras. La intimidad sensorial es un terreno donde fluyen con naturalidad.',
    Media: 'Existe una química sensual que, aunque presente, no es abrumadora. Hay atracción y deseo, pero requiere ser cultivada y expresada conscientemente para sostenerse en el tiempo.',
    Baja: 'La química física es sutil. La pasión no es el motor principal de la relación, pero puede activarse con gestos conscientes de conexión y afecto.',
    MuyBaja: 'La química sensoril es tenue. La conexión no se basa en la pasión, sino en otros planos. Es importante reconocerlo sin juicio y nutrir la intimidad desde otros canales.',
  },
  afinidadMental: {
    Alta: 'La afinidad mental es extraordinaria. Comparten un lenguaje, una forma de procesar el mundo. Los diálogos son fluidos, estimulantes y enriquecedores. Conversar es un placer compartido.',
    Media: 'La comunicación fluye con naturalidad, aunque hay matices que pulir. Comprenden lo esencial, pero los detalles a veces requieren aclaración. La afinidad mental es buena base para crecer.',
    Baja: 'La afinidad mental tiene matices. No es que no se entiendan, sino que procesan la información de forma distinta. La paciencia y la escucha activa son clave para el diálogo.',
    MuyBaja: 'Los estilos de comunicación son muy distintos. Lo que para uno es claro, para el otro es confuso. Requiere esfuerzo consciente de traducción y empatía mental.',
  },
  conexionEmocional: {
    Alta: 'La conexión emocional es profunda. Se sienten vistos, sostenidos y comprendidos en lo más íntimo. Hay un lenguaje de silencios y gestos que no necesita palabras. Es un hogar emocional compartido.',
    Media: 'La conexión emocional es buena, con momentos de gran sintonía y otros de incomprensión. Se aman, pero a veces hablan idiomas emocionales distintos. Reconocer eso fortalece el vínculo.',
    Baja: 'La conexión emocional requiere trabajo. No es falta de amor, sino de sintonía. Cada uno procesa sus emociones de forma distinta, y eso puede generar momentos de soledad compartida.',
    MuyBaja: 'Los mundos emocionales son muy distintos. Lo que para uno es necesidad, para el otro es exceso. Requiere mucha compasión y voluntad de entender al otro sin imponer el propio lenguaje.',
  },
  sintoniaEspiritual: {
    Alta: 'La sintonía espiritual es notable. Hay una sensación de destino compartido, como si las almas se reconocieran. Comparten valores profundos y una visión trascendente de la vida.',
    Media: 'La sintonía espiritual es sutil pero presente. Hay momentos en los que sienten algo más grande que ellos, pero no es algo que llene toda la relación. Se cultiva con prácticas compartidas.',
    Baja: 'La sintonía espiritual es tenue. No es que no exista, sino que se expresa en canales distintos. Cada uno conecta con lo trascendente a su manera, y eso es válido.',
    MuyBaja: 'Las visiones espirituales son muy distintas. No es falta de profundidad, sino de código. Requiere respetar el camino del otro sin imponer el propio.',
  },
  estabilidadFuturo: {
    Alta: 'La estabilidad del vínculo es notable. Hay un compromiso que se sostiene con solidez, una sensación de "esto dura". Saturno y los cimientos de la relación son firmes.',
    Media: 'La estabilidad es buena, con momentos de solidez y otros de ajuste. La relación tiene cimientos, pero requiere mantenimiento consciente para sostenerse en el tiempo.',
    Baja: 'La estabilidad requiere trabajo. No es que la relación sea frágil, sino que los compromisos pueden sentirse restrictivos para uno y necesarios para el otro. Requiere diálogo sobre expectativas.',
    MuyBaja: 'La estabilidad es un desafío. La estructura del vínculo puede sentirse rígida para uno e inestable para el otro. Requiere mucha consciencia y compromiso voluntario para construir cimientos.',
  },
};

// ============================================================
// 3b. DICCIONARIO POR SECTOR (8 factores) Y NIVEL
// (Facilidad / Matiz / Intenso con fricción / Desafío)
// ============================================================

const DICC_FACTOR_NIVEL = {
  quimica: {
    facilidad: 'La atracción y la pasión fluyen con naturalidad. Hay un magnetismo que se siente en el cuerpo y una intimidad que no necesita palabras.',
    matiz: 'La química está presente pero con matices: hay deseo y atracción, aunque conviene cultivarlos con consciencia para que se sostengan en el tiempo.',
    intenso: 'La atracción es intensa y electiva, y la tensión (cuadratura/oposición Venus-Marte/Marte-Marte/Marte-Plutón) añade fricción: excita, aunque a veces enciende discusiones. Canalizarla bien hace el vínculo más vivo.',
    desafio: 'La química física es sutil o requiere trabajo. La pasión no es el motor principal de la relación, pero puede activarse con gestos conscientes de conexión y afecto.',
  },
  emocional: {
    facilidad: 'La conexión emocional es profunda y estable: se sienten vistos, sostenidos y comprendidos en lo más íntimo. Es un hogar emocional compartido.',
    matiz: 'La conexión emocional es buena, con momentos de gran sintonía y otros de incomprensión. Reconocer los distintos idiomas emocionales fortalece el vínculo.',
    intenso: 'La conexión emocional es intensa y de fondo: la emoción lo inunda todo, a veces con altibajos. Aprender a regular el caudal mutuo estabiliza el vínculo.',
    desafio: 'La conexión emocional requiere trabajo. No es falta de amor, sino de sintonía: cada uno procesa sus emociones de forma distinta y eso puede generar soledad compartida.',
  },
  mental: {
    facilidad: 'La afinidad mental es notable: comparten un lenguaje y una forma de procesar el mundo. Conversar es un placer compartido y estimulante.',
    matiz: 'La comunicación fluye con naturalidad, aunque hay matices que pulir. La afinidad mental es una buena base para crecer.',
    intenso: 'Las mentes se estimulan con intensidad: hay diálogos vivos y a veces chispa, incluso discusiones. Convertir la fricción intelectual en aprendizaje enriquece la pareja.',
    desafio: 'Los estilos de comunicación son distintos: procesan la información de forma diferente. La paciencia y la escucha activa son la clave del diálogo.',
  },
  espiritual: {
    facilidad: 'Hay una sintonía espiritual y de valores profunda: comparten una visión de la vida que los conecta más allá de lo cotidiano.',
    matiz: 'La sintonía espiritual es sutil pero presente: se cultiva con prácticas, valores y momentos compartidos de sentido.',
    intenso: 'El vínculo espiritual es intenso y trascendente, casi kármico. Puede idealizarse; anclar la magia en la realidad los protege.',
    desafio: 'Las visiones espirituales y de sentido son distintas. No es falta de profundidad, sino de código: respetar el camino del otro es clave.',
  },
  estabilidad: {
    facilidad: 'El vínculo se sostiene con solidez: hay compromiso y cimientos firmes para el largo plazo, una sensación de "esto dura".',
    matiz: 'La estabilidad es buena, con cimientos que requieren mantenimiento y diálogo sobre expectativas para sostenerse.',
    intenso: 'La relación es intensa y los compromisos pueden sentirse restrictivos para uno y necesarios para el otro. Dialogar sobre el ritmo lo equilibra.',
    desafio: 'La estabilidad requiere esfuerzo: la estructura del vínculo puede sentirse rígida para uno e inestable para el otro. Requiere consciencia y compromiso voluntario.',
  },
  valores: {
    facilidad: 'Comparten estilo de vida y valores afectivos: se quieren de forma parecida y esperan lo mismo, lo que da coherencia a la relación.',
    matiz: 'Los valores y el estilo de amor tienen diferencias: coinciden en lo esencial, pero difieren en cómo expresan el cariño y qué esperar. Hablarlo armoniza.',
    intenso: 'El modo de querer es intenso y apasionado, pero con diferencias en cómo demostrar amor. Alinear expectativas evita malentendidos.',
    desafio: 'Los valores y estilos de amor (Venus) difieren: cómo quieren y qué esperan puede no encajar. Requiere un diálogo honesto para alinear el camino de querer.',
  },
  transformacion: {
    facilidad: 'La intensidad compartida se canaliza bien: hay una capacidad de transformarse juntos que genera evolución profunda sin daño.',
    matiz: 'La transformación está presente, pero requiere gestionar la intensidad y los límites para no desbordarse.',
    intenso: 'El vínculo es intenso y transformador: la tensión de Plutón (cuadratura/oposición) no resta, es fuego que puede purificar o quemar. Establecer límites sanos es esencial.',
    desafio: 'El eje de poder y transformación es delicado: pueden aparecer dinámicas de control, celos o miedo a la pérdida. Consciencia y límites claros son la clave.',
  },
  compromiso: {
    facilidad: 'El eje de compromiso (Casa 7 / Descendente) está muy activado: hay planetas personales cerca del Descendente, lo que favorece construir el "nosotros".',
    matiz: 'El eje de compromiso está presente, aunque requiere dedicar tiempo e intención a construir el "nosotros".',
    intenso: 'El compromiso está activado con intensidad: la Casa 7 se carga de energía, tanto para unir como para crear tensión en la pareja. Gestionar el "nosotros" es el reto.',
    desafio: 'El eje de compromiso está poco activado: no hay muchas conexiones cerca del Descendente, así que el "nosotros" debe construirse con más intención y dedicación.',
  },
};

// ============================================================
// 4. FUNCIONES DE CONSULTA
// ============================================================

export function fraseAspecto(p1EN, p2EN, tipoEN) {
  // Buscar clave directa
  const key = `${p1EN}-${p2EN}-${tipoEN}`;
  if (DICC_ASPECTOS[key]) return _localizarPlanetas(DICC_ASPECTOS[key]);
  // Buscar clave inversa
  const keyRev = `${p2EN}-${p1EN}-${tipoEN}`;
  if (DICC_ASPECTOS[keyRev]) return _localizarPlanetas(DICC_ASPECTOS[keyRev]);
  // Fallback genérico por tipo de aspecto
  const p1 = _pn(p1EN);
  const p2 = _pn(p2EN);
  const tipoT = tAspecto(tipoEN);
  if (tipoEN === 'Conjunction') return `La conjunción entre ${p1} y ${p2} fusiona sus energías, generando un vínculo intenso y unificador que potencia ambas partes.`;
  if (tipoEN === 'Trine') return `El trígono entre ${p1} y ${p2} crea un fluir armonioso que facilita la comprensión y el apoyo mutuo de forma natural.`;
  if (tipoEN === 'Sextile') return `El sextil entre ${p1} y ${p2} abre una oportunidad de sintonía que, si se cultiva, genera una conexión estable y nutritia.`;
  if (tipoEN === 'Square') return `La cuadratura entre ${p1} y ${p2} genera tensión creativa que requiere paciencia y consciencia. Es un desafío que, bien gestionado, produce crecimiento.`;
  if (tipoEN === 'Opposition') return `La oposición entre ${p1} y ${p2} crea una polaridad magnética que pide ser integrada. La tensión es creativa si se evita el juego de culpas.`;
  return `El aspecto entre ${p1} y ${p2} (${tipoT}) activa una dinámica significativa en la relación.`;
}

export function frasePlanetaEnCasa(planetaEN, casa) {
  const key = `${planetaEN}-${casa}`;
  if (DICC_CASAS[key]) return _localizarPlanetas(DICC_CASAS[key]);
  // Fallback genérico
  const planeta = _pn(planetaEN);
  return `El planeta ${planeta} activa el área de la casa ${casa} en la vida del otro, generando una dinámica significativa en esa área de experiencia.`;
}

export function fraseDimensionRadar(dimKey, score) {
  const nivel = score >= 70 ? 'Alta' : score >= 50 ? 'Media' : 'Baja';
  // Traducción del locale activo (si existe), con fallback al diccionario en español
  const clave = `sinastria.diccionario.radar.${dimKey}.${nivel}`;
  const loc = t(clave);
  if (loc && loc !== clave) return _localizarPlanetas(loc);
  const dict = DICC_RADAR_NIVELES[dimKey];
  if (dict && dict[nivel]) return _localizarPlanetas(dict[nivel]);
  // Fallback genérico
  if (score >= 70) return 'Conexión intensa en esta dimensión.';
  if (score >= 50) return 'Buena sintonía con matices a pulir.';
  return 'Conexión moderada que requiere atención.';
}

// Frase por sector (8 factores) según su nivel cualitativo.
// nivel ∈ facilidad | matiz | intenso | desafio (lo que produce el motor).
// Primero intenta la traducción del locale (sinastria.factorFase_<k>_<nivel>);
// si no existe, cae al diccionario español.
export function fraseFactor(key, score, nivel) {
  const clave = `sinastria.factorFase_${key}_${nivel}`;
  const loc = t(clave);
  if (loc && typeof loc === 'string' && loc !== clave) return _localizarPlanetas(loc);
  const d = DICC_FACTOR_NIVEL[key];
  const nv = d && (d[nivel] || d.matiz);
  if (nv) return _localizarPlanetas(nv);
  // Fallback genérico según el nivel
  if (nivel === 'intenso') return 'Sector intenso: hay mucha energía, con fricción que requiere gestión consciente.';
  if (nivel === 'matiz') return 'Sector con buena sintonía, aunque con matices que merecen atención.';
  if (nivel === 'facilidad') return 'Sector que fluye con naturalidad: es una fortaleza del vínculo.';
  return 'Sector que requiere trabajo consciente para construir armonía.';
}

export function fraseCompatibilidad(score, label) {
  // Traducción del locale activo (si existe), con fallback al español
  const bucket = score >= 85 ? '85' : score >= 70 ? '70' : score >= 55 ? '55' : score >= 40 ? '40' : '0';
  const clave = `sinastria.diccionario.compat.${bucket}`;
  const loc = t(clave);
  if (loc && loc !== clave) {
    return _localizarPlanetas(loc.replace('{score}', score).replace('{label}', label));
  }
  if (score >= 85) return `Esta relación tiene una resonancia excepcional (${score}%). ${label}. Es un vínculo que se siente como un destino compartido, donde las energías se potencian mutuamente en la mayoría de las dimensiones.`;
  if (score >= 70) return `Esta relación tiene una afinidad sólida (${score}%). ${label}. Hay cimientos firmes y una conexión que, con consciencia, puede sostenerse y crecer en el tiempo.`;
  if (score >= 55) return `Esta relación tiene una atracción con matices (${score}%). ${label}. Hay química y conexión, pero también áreas que pedirán trabajo. Es un vínculo que enseña tanto como une.`;
  if (score >= 40) return `Esta relación es un desafío formativo (${score}%). ${label}. No es una conexión fácil, pero es una escuela. Lo que se construye aquí, se construye con esfuerzo y profundidad.`;
  return `Esta relación sigue caminos en divergencia (${score}%). ${label}. No es falta de valor, sino de resonancia natural. Lo que se comparte, se comparte desde la diferencia.`;
}