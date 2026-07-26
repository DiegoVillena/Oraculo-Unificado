// === KNOWLEDGE BASE DE LOS 64 HEXAGRAMAS DEL I CHING ===
// Cada entrada: nombre, trigramas (sup+inf), elemento asociado, keywords,
// significado del hexagrama y consejo.
// Sirve para el análisis holístico Tarot + I Ching.

export const KB_ICHING = {
  "1": {
    nombre: "El Cielo (Lo Creativo)",
    trigSup: "Cielo", trigInf: "Cielo", elemento: "fuego",
    kw: ["creación", "fuerza", "iniciativa", "energía original", "persistencia"],
    sig: "Energía creativa primordial en su estado puro. Es el momento de actuar con firmeza y claridad, alineándose con el orden natural. La persistencia constante produce obras duraderas.",
    consejo: "Sé activo, creativo y persistente. No fuerces; deja que la energía fluya como el cielo despliega su vastidad."
  },
  "2": {
    nombre: "La Tierra (Lo Receptivo)",
    trigSup: "Tierra", trigInf: "Tierra", elemento: "tierra",
    kw: ["recepción", "devoción", "paciencia", "nutrición", "pasividad fértil"],
    sig: "Principio receptivo que acoge y nutre. No es pasividad inerte sino disponibilidad activa para sostener lo que se gesta. La paciencia da fruto.",
    consejo: "No empujes, acoge. Sigue en lugar de liderar. Lo que se siembra ahora germinará."
  },
  "3": {
    nombre: "La Dificultad Inicial (Chun)",
    trigSup: "Agua", trigInf: "Trueno", elemento: "agua",
    kw: ["comienzo difícil", "obstáculos", "gestación", "caos inicial"],
    sig: "Todo comienzo es difícil. Las energías se encuentran en estado embrionario y deben abrirse camino entre obstáculos. La confusión es propia del nacimiento.",
    consejo: "No te rindas ante el caos inicial. Busca ayuda, organiza poco a poco y acepta que las cosas tardan en cuajar."
  },
  "4": {
    nombre: "La Inexperiencia Juvenil (Meng)",
    trigSup: "Montaña", trigInf: "Agua", elemento: "tierra",
    kw: ["inexperiencia", "aprendizaje", "humildad", "búsqueda de guía"],
    sig: "Como un joven que busca aprender, hay que admitir la propia inexperiencia y buscar guía. La inocencia bien orientada se convierte en sabiduría.",
    consejo: "Reconoce lo que no sabes. Busca un maestro o consejo. No actúes con soberbia."
  },
  "5": {
    nombre: "La Espera (Xu)",
    trigSup: "Agua", trigInf: "Cielo", elemento: "agua",
    kw: ["espera", "confianza", "paciencia activa", "preparación"],
    sig: "No es momento de actuar sino de esperar con confianza. La espera consciente prepara el momento justo para la acción.",
    consejo: "Espera sin ansiedad. Confía en que la oportunidad llegará. Prepárate mientras tanto."
  },
  "6": {
    nombre: "El Conflicto (Song)",
    trigSup: "Cielo", trigInf: "Agua", elemento: "fuego",
    kw: ["conflicto", "disputa", "confrontación", "caución"],
    sig: "Hay desencuentro entre fuerzas. El conflicto puede escalar si se insiste. Conviene buscar mediación y no empujar hasta el final.",
    consejo: "No lleves el conflicto al extremo. Busca un tercero imparcial. Cede en lo secundario para ganar en lo esencial."
  },
  "7": {
    nombre: "El Ejército (Shi)",
    trigSup: "Tierra", trigInf: "Agua", elemento: "tierra",
    kw: ["disciplina", "organización", "liderazgo colectivo", "estructura"],
    sig: "Como un ejército bien mandado, la situación requiere disciplina, orden y un liderazgo firme pero compasivo. La fuerza colectiva organizada supera al individualismo.",
    consejo: "Organiza, establece jerarquías claras y disciplina. El líder sirve al grupo, no se sirve de él."
  },
  "8": {
    nombre: "La Solidaridad (Bi)",
    trigSup: "Agua", trigInf: "Tierra", elemento: "agua",
    kw: ["unión", "alianza", "cooperación", "pertenencia"],
    sig: "Las aguas confluyen. Es momento de unirse, buscar alianzas y fortalecer vínculos. La soledad no es el camino ahora.",
    consejo: "Acércate a quienes comparten tus valores. Forma equipo. La unión multiplica fuerzas."
  },
  "9": {
    nombre: "La Fuerza Domesticadora Pequeña (Xiao Xu)",
    trigSup: "Viento", trigInf: "Cielo", elemento: "aire",
    kw: ["moderación", "pequeños pasos", "paciencia", "contención"],
    sig: "Fuerza suave que contiene sin reprimir. Los pequeños esfuerzos sostenidos logran más que los grandes impulsos efímeros.",
    consejo: "No pretendas grandes avances. Acumula pequeños logros. La constancia modesta es tu aliada."
  },
  "10": {
    nombre: "El Porte (Lu)",
    trigSup: "Cielo", trigInf: "Lago", elemento: "fuego",
    kw: ["conducta", "etiqueta", "prudencia", "ritual"],
    sig: "Cómo comportarse ante el poder o la diferencia. La conducta adecuada, prudente y respetuosa permite avanzar incluso en terrenos delicados.",
    consejo: "Mide tus pasos, sé respetuoso, actúa con elegancia. La forma importa tanto como el fondo."
  },
  "11": {
    nombre: "La Paz (Tai)",
    trigSup: "Tierra", trigInf: "Cielo", elemento: "tierra",
    kw: ["paz", "armonía", "prosperidad", "fluir"],
    sig: "El cielo y la tierra se encuentran y se comunican. Es momento de prosperidad, armonía y fluidez. Todo se acomoda con naturalidad.",
    consejo: "Disfruta la armonía pero no te duermas. Aprovecha para consolidar lo que ahora fluye fácil."
  },
  "12": {
    nombre: "El Estancamiento (Pi)",
    trigSup: "Cielo", trigInf: "Tierra", elemento: "fuego",
    kw: ["estancamiento", "bloqueo", "comunicación rota", "inercia"],
    sig: "El cielo se aleja de la tierra. Las fuerzas no se comunican y todo se estanca. Hay bloqueo energético.",
    consejo: "No fuerces. Acepta el estancamiento y prepárate para cuando el ciclo cambie. Cultiva tu interior mientras tanto."
  },
  "13": {
    nombre: "La Comunidad con los Hombres (Tong Ren)",
    trigSup: "Cielo", trigInf: "Fuego", elemento: "fuego",
    kw: ["comunidad", "fraternidad", "propósito común", "apertura"],
    sig: "Unión con otros en torno a un propósito amplio y generoso. No es unión por interés sino por afinidad de valores.",
    consejo: "Busca aliados en torno a un ideal. Sé abierto y transparente. La comunidad amplía horizontes."
  },
  "14": {
    nombre: "La Posesión de lo Grande (Da You)",
    trigSup: "Fuego", trigInf: "Cielo", elemento: "fuego",
    kw: ["abundancia", "posesión", "éxito", "magnanimidad"],
    sig: "Gran posesión, éxito visible. La abundancia requiere generosidad y magnanimidad para no corromperse.",
    consejo: "Disfruta lo alcanzado con generosidad. Comparte. La riqueza bien administrada multiplica."
  },
  "15": {
    nombre: "La Modestia (Qian)",
    trigSup: "Tierra", trigInf: "Montaña", elemento: "tierra",
    kw: ["modestia", "humildad", "equilibrio", "discreción"],
    sig: "La montaña se oculta bajo la tierra. La verdadera grandeza no necesita exhibirse. La modestia es la virtud que equilibra todo.",
    consejo: "Baja el perfil, reconoce a los demás, no te vanaglories. La modestia abre puertas que el orgullo cierra."
  },
  "16": {
    nombre: "El Entusiasmo (Yu)",
    trigSup: "Trueno", trigInf: "Tierra", elemento: "fuego",
    kw: ["entusiasmo", "motivación colectiva", "energía contagiosa", "música"],
    sig: "Energía entusiasta que mueve multitudes. El entusiasmo bien dirigido puede inspirar grandes empresas.",
    consejo: "Canaliza el entusiasmo. Inspira a otros con tu motivación. Pero cuidado con la exaltación ciega."
  },
  "17": {
    nombre: "El Seguimiento (Sui)",
    trigSup: "Lago", trigInf: "Trueno", elemento: "aire",
    kw: ["adaptación", "seguir el momento", "flexibilidad", "alinearse"],
    sig: "Saber seguir el momento y adaptarse a las circunstancias cambiantes. No es sumisión sino inteligencia adaptativa.",
    consejo: "Adáptate al flujo de los acontecimientos. Sigue lo que funciona, suelta lo que se resiste."
  },
  "18": {
    nombre: "El Trabajo en lo Echado a Perder (Gu)",
    trigSup: "Montaña", trigInf: "Viento", elemento: "tierra",
    kw: ["reparación", "limpieza", "trabajo duro", "sanar lo dañado"],
    sig: "Algo se ha corrompido por descuido y debe ser reparado. Requiere valentía para afrontar lo deteriorado y trabajar en su sanación.",
    consejo: "Afronta lo estropeado sin miedo. Limpia, repara, sana. Es trabajo duro pero necesario."
  },
  "19": {
    nombre: "El Acercamiento (Lin)",
    trigSup: "Tierra", trigInf: "Lago", elemento: "tierra",
    kw: ["avance", "oportunidad cercana", "crecimiento", "aproximación"],
    sig: "Una oportunidad se acerca. Es momento de avance con confianza, pero sin precipitarse. La energía está a favor.",
    consejo: "Avanza con decisión pero sin prisa. Aprovecha la coyuntura favorable mientras dure."
  },
  "20": {
    nombre: "La Contemplación (Guan)",
    trigSup: "Viento", trigInf: "Tierra", elemento: "aire",
    kw: ["observación", "contemplación", "perspectiva", "testigo"],
    sig: "Observar antes de actuar. Como en una atalía, contemplar el panorama completo permite entender lo que de otra forma pasaría desapercibido.",
    consejo: "Detente y observa. No actúes todavía. La comprensión profunda precede a la acción certera."
  },
  "21": {
    nombre: "La Mordedura Tajante (Shi He)",
    trigSup: "Fuego", trigInf: "Trueno", elemento: "fuego",
    kw: ["decisión", "cortar", "resolución", "justicia expeditiva"],
    sig: "Hay un obstáculo que debe ser cortado con decisión. Como morder carne dura, requiere fuerza y determinación para superar lo que bloquea.",
    consejo: "Actúa con decisión y claridad. Corta de raíz lo que estorba. Las medias tintas prolongan el problema."
  },
  "22": {
    nombre: "La Gracia (Bi)",
    trigSup: "Montaña", trigInf: "Fuego", elemento: "tierra",
    kw: ["belleza", "forma", "estética", "adorno"],
    sig: "La belleza de la forma. Lo superficial tiene su lugar pero no debe confundirse con la sustancia. La gracia adorna sin ocultar.",
    consejo: "Cuida la forma y la presentación. Lo bello armoniza. Pero no confundas envoltorio con contenido."
  },
  "23": {
    nombre: "La Desintegración (Bo)",
    trigSup: "Montaña", trigInf: "Tierra", elemento: "tierra",
    kw: ["derrumbe", "pérdida", "cierre de ciclo", "despojo"],
    sig: "Todo se desmorona desde la base. Lo viejo se desintegra para que lo nuevo pueda nacer. No resistir, dejar caer.",
    consejo: "No te aferres a lo que cae. Acepta el despojo. Lo que sobreviva será lo auténtico."
  },
  "24": {
    nombre: "El Retorno (Fu)",
    trigSup: "Tierra", trigInf: "Trueno", elemento: "tierra",
    kw: ["retorno", "renacer", "vuelta", "primavera"],
    sig: "Tras el invierno llega el retorno de la luz. Lo que parecía perdido renace. Es el momento del solsticio, del giro favorable.",
    consejo: "Confía en el renacer. Lo que se fue vuelve transformado. Permítete empezar de nuevo."
  },
  "25": {
    nombre: "La Inocencia (Wu Wang)",
    trigSup: "Cielo", trigInf: "Trueno", elemento: "fuego",
    kw: ["inocencia", "espontaneidad", "naturalidad", "sinceridad"],
    sig: "Actuar desde la espontaneidad natural, sin segundas intenciones. La inocencia conecta con el orden esencial de las cosas.",
    consejo: "Sé natural, no calcules. Actúa desde la intención limpia. Lo espontáneo ahora es lo correcto."
  },
  "26": {
    nombre: "La Fuerza Domesticadora Grande (Da Chu)",
    trigSup: "Montaña", trigInf: "Cielo", elemento: "tierra",
    kw: ["acumulación", "energía contenida", "doma potente", "fuerza mayor"],
    sig: "Gran energía contenida y domesticada. Como un caballo salvaje amansado, la fuerza bruta se canaliza hacia propósitos constructivos.",
    consejo: "Acumula energía sin dispersar. Domestica tus impulsos. La fuerza bien canalizada es imparable."
  },
  "27": {
    nombre: "Las Comisuras de la Boca (Yi)",
    trigSup: "Montaña", trigInf: "Trueno", elemento: "tierra",
    kw: ["nutrición", "alimento", "cuidado", "lo que se asimila"],
    sig: "Lo que nutre, lo que se asimila. Tanto el alimento físico como el mental y espiritual. Cuidar lo que entra y lo que se sostiene.",
    consejo: "Vigila lo que nutres en ti: alimentos, ideas, relaciones. Lo que asimilas te construye o te destruye."
  },
  "28": {
    nombre: "La Preponderancia de lo Grande (Da Guo)",
    trigSup: "Lago", trigInf: "Viento", elemento: "aire",
    kw: ["exceso", "carga pesada", "tensión extrema", "situación crítica"],
    sig: "Una carga superior a las fuerzas disponibles. La situación es crítica y requiere medidas extraordinarias. No se puede mantener mucho tiempo.",
    consejo: "Reconoce la sobrecarga. Toma medidas excepcionales. Reduce lo que pesa antes de que ceda."
  },
  "29": {
    nombre: "Lo Abismal (El Agua, Kan)",
    trigSup: "Agua", trigInf: "Agua", elemento: "agua",
    kw: ["peligro", "abismo", "miedo", "fluir en la dificultad"],
    sig: "Doble agua, peligro repetido. Como el agua que fluye sin detenerse, hay que atravesar el peligro manteniendo la integridad.",
    consejo: "No te paralices ante el peligro. Fluye como el agua, mantén tu esencia. El abismo se cruza, no se evita."
  },
  "30": {
    nombre: "Lo Adherente (El Fuego, Li)",
    trigSup: "Fuego", trigInf: "Fuego", elemento: "fuego",
    kw: ["claridad", "luz", "comprensión", "iluminación"],
    sig: "Doble fuego, claridad que ilumina. El fuego necesita combustible; la claridad requiere de algo a lo que adherirse. Brilla con propósito.",
    consejo: "Busca la claridad. Ilumina lo que te rodea. La comprensión es tu antorcha ahora."
  },
  "31": {
    nombre: "El Influjo (Xian)",
    trigSup: "Lago", trigInf: "Montaña", elemento: "aire",
    kw: ["atracción", "influencia mutua", "encuentro", "magnetismo"],
    sig: "Atracción recíproca entre opuestos. La montaña y el lago se influyen mutuamente. Es el hexagrama del enamoramiento y la influencia sutil.",
    consejo: "Permítete ser influido e influir. La atracción mutua abre puertas. La química es real."
  },
  "32": {
    nombre: "La Duración (Heng)",
    trigSup: "Trueno", trigInf: "Viento", elemento: "fuego",
    kw: ["duración", "constancia", "permanencia", "ciclos estables"],
    sig: "Lo que dura porque sigue su naturaleza. La duración no es rigidez sino constancia en el cambio. Como el sol que sale cada día.",
    consejo: "Mantén la constancia en lo esencial. La duración nace de la coherencia, no del estancamiento."
  },
  "33": {
    nombre: "La Retirada (Dun)",
    trigSup: "Cielo", trigInf: "Montaña", elemento: "fuego",
    kw: ["retirada", "apartarse", "prudencia", "no confrontar"],
    sig: "Retirada estratégica ante fuerzas superiores. No es cobardía sino sabiduría: apartarse a tiempo para preservar lo esencial.",
    consejo: "Retírate con elegancia. No confrontes lo que te supera. Hoy la prudencia es valentía."
  },
  "34": {
    nombre: "El Poder de lo Grande (Da Zhuang)",
    trigSup: "Trueno", trigInf: "Cielo", elemento: "fuego",
    kw: ["poder", "fuerza", "vitalidad", "imponerse"],
    sig: "Gran poder, fuerza imponente. Pero el verdadero poder no se impone con violencia sino que se manifiesta con rectitud.",
    consejo: "Usa tu poder con rectitud. La fuerza sin ética se vuelve contra ti. Imponerse es fácil; persuadir es sabio."
  },
  "35": {
    nombre: "El Progreso (Jin)",
    trigSup: "Fuego", trigInf: "Tierra", elemento: "fuego",
    kw: ["progreso", "avance visible", "reconocimiento", "ascenso"],
    sig: "Como el sol que asciende en el cielo, el progreso es visible y luminoso. Momento de avance con reconocimiento.",
    consejo: "Avanza con confianza. Tu progreso será reconocido. Brilla sin deslumbrar."
  },
  "36": {
    nombre: "El Oscurecimiento de la Luz (Ming Yi)",
    trigSup: "Tierra", trigInf: "Fuego", elemento: "tierra",
    kw: ["adversidad", "ocultamiento", "prudencia", "guardar la luz"],
    sig: "La luz se oculta bajo la tierra. Tiempos adversos donde conviene guardar la propia luz y no exhibirla. Proteger lo esencial.",
    consejo: "Oculta tu luz por ahora. No te expongas. Protege tu esencia hasta que la luz vuelva."
  },
  "37": {
    nombre: "La Familia (Jia Ren)",
    trigSup: "Viento", trigInf: "Fuego", elemento: "aire",
    kw: ["familia", "hogar", "roles", "estructura interna"],
    sig: "El orden dentro de la familia. Cada miembro en su rol. La armonía doméstica es la base de toda empresa externa.",
    consejo: "Atiende tu casa y tus cercanías. Cada quien en su papel. La armonía interna sostiene lo externo."
  },
  "38": {
    nombre: "La Oposición (Kui)",
    trigSup: "Fuego", trigInf: "Lago", elemento: "fuego",
    kw: ["oposición", "contraste", "malentendido", "diferencia"],
    sig: "Fuerzas opuestas que no se reconcilian fácilmente. La oposición puede ser creativa si se respeta la diferencia sin intentar anularla.",
    consejo: "Acepta la diferencia. No intentes uniformar. A veces los opuestos se complementan desde la distancia."
  },
  "39": {
    nombre: "El Impedimento (Jian)",
    trigSup: "Agua", trigInf: "Montaña", elemento: "agua",
    kw: ["obstáculo", "dificultad", "bloqueo", "pausa forzada"],
    sig: "El camino está bloqueado. Avanzar directamente es imposible. Conviene buscar ayuda o una ruta alternativa.",
    consejo: "No fuerces el obstáculo. Busca un atajo o un aliado. A veces conviene volver atrás para encontrar otra vía."
  },
  "40": {
    nombre: "La Liberación (Xie)",
    trigSup: "Trueno", trigInf: "Agua", elemento: "fuego",
    kw: ["liberación", "alivio", "solución", "desbloqueo"],
    sig: "Tras el impedimento llega la liberación. Las tensiones se aflojan y el camino se despeja. Momento de respirar y dejar ir.",
    consejo: "Aprovecha el alivio. Suelta lo que estaba tenso. No te quedes atrapado en lo que ya cedió."
  },
  "41": {
    nombre: "La Merma (Sun)",
    trigSup: "Montaña", trigInf: "Lago", elemento: "tierra",
    kw: ["merma", "reducción", "simplificación", "desapego"],
    sig: "Reducir lo superfluo para fortalecer lo esencial. La merma consciente es una forma de riqueza: menos cosas, más sustancia.",
    consejo: "Simplifica. Reduce lo innecesario. Lo esencial se fortalece cuando se quita lo accesorio."
  },
  "42": {
    nombre: "El Aumento (Yi)",
    trigSup: "Viento", trigInf: "Trueno", elemento: "aire",
    kw: ["aumento", "crecimiento", "expansión", "ganancia"],
    sig: "Lo que se ha dado vuelve multiplicado. Es momento de crecimiento y expansión, especialmente cuando se comparte.",
    consejo: "Aprovecha el crecimiento. Comparte lo ganado. Lo que se incrementa con generosidad perdura."
  },
  "43": {
    nombre: "El Desbordamiento (Guai)",
    trigSup: "Lago", trigInf: "Cielo", elemento: "aire",
    kw: ["resolución", "irrupción", "decisión firme", "romper"],
    sig: "Hay que romper de una vez con lo que se viene arrastrando. La resolución firme y decidida, pero sin violencia innecesaria.",
    consejo: "Toma la decisión que llevas postergando. Sé firme y claro. Pero no pierdas la compostura."
  },
  "44": {
    nombre: "El Ir al Encuentro (Gou)",
    trigSup: "Cielo", trigInf: "Viento", elemento: "fuego",
    kw: ["encuentro", "atracción peligrosa", "tentación", "seducción"],
    sig: "Un encuentro inesperado, a veces con algo o alguien tentador. Hay que discernir si conviene o es una trampa.",
    consejo: "Mira bien con quién o qué te encuentras. No te dejes seducir por apariencias. Discierne antes de comprometerte."
  },
  "45": {
    nombre: "La Reunión (Cui)",
    trigSup: "Lago", trigInf: "Tierra", elemento: "aire",
    kw: ["reunión", "congregación", "encuentro colectivo", "síntesis"],
    sig: "Las fuerzas se congregan en torno a un centro. Es momento de reunir, agrupar, sintetizar lo disperso.",
    consejo: "Convoca, reúne, organiza. Lo disperso encuentra su centro. Pero cuida quién lidera la congregación."
  },
  "46": {
    nombre: "La Subida (Sheng)",
    trigSup: "Tierra", trigInf: "Viento", elemento: "tierra",
    kw: ["ascenso", "subida", "crecimiento vertical", "elevación"],
    sig: "Como un árbol que crece hacia arriba, es momento de ascender, de subir de nivel. El crecimiento es orgánico y sostenido.",
    consejo: "Sube con paciencia, como el árbol. Cada paso te eleva. No te saltes etapas; crece desde la raíz."
  },
  "47": {
    nombre: "La Desazón (Kun)",
    trigSup: "Lago", trigInf: "Agua", elemento: "aire",
    kw: ["agotamiento", "opresión", "desazón", "estrechura"],
    sig: "Sensación de agotamiento y estrechez. Las palabras no convencen y la energía falta. Hay que buscar recursos internos.",
    consejo: "No te desanimes. La opresión es temporal. Busca en tu interior los recursos que el exterior te niega."
  },
  "48": {
    nombre: "El Pozo (Jing)",
    trigSup: "Agua", trigInf: "Viento", elemento: "agua",
    kw: ["pozo", "fuente", "nutrición profunda", "lo esencial"],
    sig: "El pozo comunal que nutre a todos. Las estructuras cambian pero el pozo permanece. Conectar con la fuente esencial.",
    consejo: "Vuelve a la fuente. Bebe de lo esencial. Limpia el pozo de tu vida para que el agua vuelva a ser potable."
  },
  "49": {
    nombre: "La Revolución (Ge)",
    trigSup: "Lago", trigInf: "Fuego", elemento: "aire",
    kw: ["revolución", "cambio radical", "transformación", "mudanza de piel"],
    sig: "Cambio radical y profundo. Como la muda de una serpiente, lo viejo debe ser abandonado para que nazca lo nuevo. El cambio es necesario.",
    consejo: "Atrévete al cambio profundo. No patches, transformación real. Lo viejo ya no sirve; suéltalo con valentía."
  },
  "50": {
    nombre: "El Caldero (Ding)",
    trigSup: "Fuego", trigInf: "Viento", elemento: "fuego",
    kw: ["caldero", "transformación alquímica", "cocimiento", "nutrición superior"],
    sig: "El caldero donde se cocinan los alimentos sagrados. Transformación alquímica de lo crudo en cocido, de lo bruto en cultivado.",
    consejo: "Cocina a fuego lento lo que quieres transformar. La alquimia requiere paciencia. Lo crudo se hace sabio en el caldero."
  },
  "51": {
    nombre: "Lo Suscitativo (El Trueno, Zhen)",
    trigSup: "Trueno", trigInf: "Trueno", elemento: "fuego",
    kw: ["trueno", "sobresalto", "despertar", "conmoción"],
    sig: "Doble trueno, sobresalto que despierta. Las conmociones sacuden lo establecido y revelan lo verdaderamente importante.",
    consejo: "Deja que el sobresalto te despierte. Lo sacudido te muestra lo esencial. No te aterre; agradécete."
  },
  "52": {
    nombre: "El Aquietamiento (La Montaña, Gen)",
    trigSup: "Montaña", trigInf: "Montaña", elemento: "tierra",
    kw: ["quietud", "meditación", "detención", "presencia"],
    sig: "Doble montaña, quietud profunda. Detenerse en el momento justo. La meditación y la presencia plena son el camino ahora.",
    consejo: "Detente. Medita. Aquíeta tu mente. La quietud no es inacción sino presencia plena."
  },
  "53": {
    nombre: "El Desarrollo (Jian)",
    trigSup: "Viento", trigInf: "Montaña", elemento: "aire",
    kw: ["desarrollo gradual", "progreso lento", "evolución", "paso a paso"],
    sig: "Como un árbol que crece en una ladera, el desarrollo es lento pero firme. Lo gradual bien hecho conduce a la solidez.",
    consejo: "Avanza paso a paso, sin prisa. Lo gradual perdura. Cada pequeña mejora cuenta."
  },
  "54": {
    nombre: "La Muchacha que se Casa (Gui Mei)",
    trigSup: "Trueno", trigInf: "Lago", elemento: "fuego",
    kw: ["unión desigual", "matrimonio", "relación asimétrica", "compromiso"],
    sig: "Una unión donde los roles son desiguales. Hay que aceptar las asimetrías con humildad, sabiendo que cada relación tiene su lógica.",
    consejo: "Acepta las diferencias de rol. No todas las uniones son simétricas. Ajusta tus expectativas a la realidad."
  },
  "55": {
    nombre: "La Abundancia (Feng)",
    trigSup: "Trueno", trigInf: "Fuego", elemento: "fuego",
    kw: ["abundancia", "plenitud", "cumbre", "apogeo"],
    sig: "Momento de plenitud y abundancia. Como el sol al mediodía, todo resplandece. Hay que aprovechar porque toda cumbre precede al declive.",
    consejo: "Disfruta la plenitud sin aferrarte. Aprovecha la abundancia mientras dure. Comparte para que dure más."
  },
  "56": {
    nombre: "El Andariego (Lu)",
    trigSup: "Fuego", trigInf: "Montaña", elemento: "fuego",
    kw: ["viaje", "transición", "exilio", "caminante"],
    sig: "Como un viajero en tierra extraña, hay que mantenerse ligero y prudente. No es momento de arraigarse sino de transitar.",
    consejo: "Mantente ligero. No te aferres. Estás de paso. Sé prudente como quien viaja por tierras ajenas."
  },
  "57": {
    nombre: "Lo Suave (El Viento, Xun)",
    trigSup: "Viento", trigInf: "Viento", elemento: "aire",
    kw: ["penetración", "influencia sutil", "flexibilidad", "persuasión"],
    sig: "Doble viento, influencia sutil y penetrante. Lo suave penetra donde lo fuerte no puede. La persuasión silenciosa es poderosa.",
    consejo: "Influye sin imponer. La suavidad penetra. Como el viento que se cuela por todas las rendijas."
  },
  "58": {
    nombre: "Lo Sereno (El Lago, Dui)",
    trigSup: "Lago", trigInf: "Lago", elemento: "aire",
    kw: ["serenidad", "alegría", "comunicación", "gozo compartido"],
    sig: "Doble lago, serenidad y alegría. El gozo compartido fortalece los vínculos. La comunicación fluye con naturalidad.",
    consejo: "Cultiva la alegría compartida. Comunica con serenidad. El gozo es contagioso y sanador."
  },
  "59": {
    nombre: "La Disolución (Huan)",
    trigSup: "Viento", trigInf: "Agua", elemento: "aire",
    kw: ["disolución", "desbloqueo", "fluidez", "descongelar"],
    sig: "Lo rígido se disuelve y vuelve a fluir. Como el hielo que se funde en agua. Las tensiones se aflojan y la energía recupera su flujo.",
    consejo: "Deja que las rigideces se disuelvan. No te aferres a estructuras que ya no fluyen. La fluidez recupera."
  },
  "60": {
    nombre: "La Restricción (Jie)",
    trigSup: "Agua", trigInf: "Lago", elemento: "agua",
    kw: ["límites", "reglas", "moderación", "contención"],
    sig: "Establecer límites claros y moderación. Sin restricciones todo se desborda, pero con exceso de límites todo se asfixia.",
    consejo: "Pon límites sanos. Ni desbordes ni rigidez. La moderación es la libertad bien entendida."
  },
  "61": {
    nombre: "La Verdad Interior (Zhong Fu)",
    trigSup: "Viento", trigInf: "Lago", elemento: "aire",
    kw: ["verdad interior", "sinceridad", "integridad", "fe"],
    sig: "La verdad que reside en el interior. Cuando hay sinceridad profunda, las acciones externas se vuelven eficaces sin esfuerzo.",
    consejo: "Conecta con tu verdad interior. Sé íntegro. La sinceridad mueve montañas sin necesidad de empujar."
  },
  "62": {
    nombre: "La Preponderancia de lo Pequeño (Xiao Guo)",
    trigSup: "Trueno", trigInf: "Montaña", elemento: "fuego",
    kw: ["detalles", "pequeñeces", "prudencia", "humildad"],
    sig: "Hay que atender a los pequeños detalles. No es momento de grandes gestos sino de cuidado en lo modesto.",
    consejo: "Atiende los detalles. Sé humilde. Las pequeñas acciones bien hechas valen más que las grandes mal hechas."
  },
  "63": {
    nombre: "Después de la Consumación (Ji Ji)",
    trigSup: "Agua", trigInf: "Fuego", elemento: "agua",
    kw: ["consumación", "orden logrado", "equilibrio", "peligro de relajarse"],
    sig: "Todo está en su lugar, el orden se ha logrado. Pero el peligro ahora es relajarse y dar por hecho lo conquistado. Hay que mantener la vigilancia.",
    consejo: "Disfruta lo logrado pero no te relajes. Mantén la vigilancia. Lo conquistado puede perderse si te confías."
  },
  "64": {
    nombre: "Antes de la Consumación (Wei Ji)",
    trigSup: "Fuego", trigInf: "Agua", elemento: "fuego",
    kw: ["transición", "umbral", "casi listo", "antes del logro"],
    sig: "Estás en el umbral, casi pero todavía no. Es un momento de máxima potencialidad. Hay que mantener el esfuerzo hasta el final.",
    consejo: "No te rindas en el último tramo. Estás a punto pero aún no has llegado. Mantén el esfuerzo y la atención."
  }
};

// === TRIGRAMAS: significado y elemento asociado ===
const TRIGRAMAS = {
  "Cielo":   { elemento: "fuego",  atributo: "creativo, fuerte, cielo, padre" },
  "Tierra":  { elemento: "tierra", atributo: "receptivo, devoto, tierra, madre" },
  "Trueno":  { elemento: "fuego",  atributo: "suscitativo, movilizador, hijo mayor" },
  "Agua":    { elemento: "agua",   atributo: "abismal, peligroso, hijo medio" },
  "Montaña": { elemento: "tierra", atributo: "aquietador, reposo, hijo menor" },
  "Viento":  { elemento: "aire",   atributo: "suave, penetrante, hija mayor" },
  "Fuego":   { elemento: "fuego",  atributo: "adherente, luminoso, hija media" },
  "Lago":    { elemento: "aire",   atributo: "sereno, gozoso, hija menor" }
};
