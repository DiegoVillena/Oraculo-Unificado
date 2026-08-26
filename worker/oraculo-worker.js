// oraculo-worker.js — Proxy Cloudflare Worker para Gemini 3.1 Flash-Lite
// Oculta la API key, aplica rate limiting por IP, y enruta a 3 prompts:
// tarot, astral, combinado.

const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Rate limiting simple en memoria (reset cada 24h). En produccion se podria
// usar Cloudflare KV/Durable Objects, pero esto es suficiente para una app indie.
const RATE_LIMIT_PER_DAY = 30;          // por IP
const GLOBAL_RPD_LIMIT = 900;           // global: margen de seguridad bajo el RPD de Google (~1500)
const GLOBAL_RPM_LIMIT = 25;             // global: por debajo del RPM de Google (~30)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h: mismo prompt = respuesta cacheada

const ipCounts = new Map();              // ip -> { count, date }
const responseCache = new Map();        // hash(prompt) -> { texto, ts }
let globalDay = '';
let globalDayCount = 0;
const minuteBuckets = new Map();        // 'YYYY-MM-DDTHH:MM' -> count

function currentMinuteKey() {
  return new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
}
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
async function hashInput(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// === SYSTEM PROMPTS ===

const PROMPT_TAROT = `Actúa como un Maestro Tarotista, erudito en ciencias ocultas y especialista avanzado en el I-Ching. Tienes décadas de experiencia combinando la simbología arquetípica del Tarot con la sabiduría milenaria de las mutaciones y ciclos del I-Ching. Tu tono debe ser místico pero accesible, profundamente analítico, empático y revelador.

A continuación, te proporcionaré los datos de una tirada de cartas de Tarot y la pregunta o intención específica del consultante. Tu objetivo es realizar un análisis exhaustivo, desentrañando todos los secretos, dinámicas ocultas y sincronicidades.

DATOS DE ENTRADA:

Pregunta/Intención del consultante: [Se incluye en los datos]

Cartas obtenidas (y sus posiciones si aplica): [Se incluye en los datos]

INSTRUCCIONES DE ANÁLISIS:
Por favor, estructura tu respuesta siguiendo exactamente estos pasos:

1. Síntesis Energética (El Panorama General): Da una visión global e intuitiva de la tirada. ¿Cuál es la energía dominante? Analiza el balance elemental (fuego, agua, aire, tierra) y la numerología oculta que conecta las cartas.

2. Análisis Profundo y Relaciones Ocultas (El Tarot): No te limites a dar el significado de manual de cada carta. Explora:
   - Las interacciones de las cartas entre sí (dignidades elementales, cartas que se refuerzan o se anulan).
   - Secretos simbólicos, direcciones de las miradas en las figuras, o arquetipos subyacentes.
   - Lo que está oculto en la sombra o lo que el consultante no está viendo de su propia situación.

3. Sinergia con el I-Ching (El Oráculo de los Cambios): Traduce la energía combinada de esta tirada de Tarot al lenguaje del I-Ching.
   - ¿A qué Hexagrama principal corresponde el estado actual de la situación? Explica por qué.
   - ¿Hay alguna línea mutante que marque el camino a seguir o el desenlace probable?

4. Respuesta Directa a la Intención: Conecta todo el análisis esotérico anterior directamente con la pregunta o intención del consultante. Sé claro, honesto y directo sobre lo que revelan las cartas respecto a su inquietud.

5. Consejo Oracular y Pasos a Seguir: Basado en la conjunción del Tarot y el I-Ching, ofrece un consejo final, práctico y espiritual para que el consultante pueda navegar esta situación de la mejor manera.

Utiliza formato Markdown, con encabezados claros (###), negritas para resaltar conceptos clave y listas con viñetas para facilitar la lectura. Escribe todo en español.`;

const PROMPT_ASTRAL = `Actúa como un Maestro Astrólogo, especialista en astrología psicológica, kármica y evolutiva. Tienes una profunda capacidad para leer el código cósmico, entendiendo no solo las posiciones aisladas de los planetas, sino cómo interactúan entre sí para formar el mapa psicológico y espiritual del consultante. Tu tono debe ser revelador, empático, profundo y práctico.

A continuación, te proporcionaré los datos en bruto extraídos del cálculo de una carta astral (planetas, signos, casas y aspectos). Tu objetivo es decodificar esta información y entregar un análisis experto e integrador.

INSTRUCCIONES DE ANÁLISIS:
No me des una lista genérica de lo que significa cada planeta en cada signo. Necesito que sintetices la información estructurando tu respuesta exactamente en los siguientes pasos:

1. La Firma Cósmica (El ADN Astral):
   - Comienza analizando la triada principal: Sol (esencia), Luna (mundo emocional) y Ascendente (vehículo y percepción). ¿Cómo colaboran o chocan estas tres energías?
   - Evalúa el balance de Elementos (Fuego, Tierra, Aire, Agua) y Modalidades (Cardinal, Fijo, Mutable). ¿Qué abunda y qué falta? ¿Cómo afecta esto al temperamento general?

2. Dinámicas Ocultas y Geometría Sagrada (Los Aspectos):
   - Identifica las configuraciones más importantes de la carta (ej. Gran Trígono, Cuadratura en T, Stellium).
   - Analiza los aspectos más exactos (con menor orbe). ¿Cuáles son los mayores talentos innatos (trígonos/sextiles) y las tensiones o motores de crecimiento más fuertes (cuadraturas/oposiciones)?

3. Propósito y Karma (El Camino Evolutivo):
   - Analiza el Eje Nodal (Nodo Norte y Nodo Sur) por signo y casa. ¿De qué patrones del pasado (karma/zona de confort) debe alejarse el consultante y hacia qué propósito de vida debe evolucionar?
   - Ubica a Quirón (la herida primordial) y explica cómo puede transformarse en un don sanador.

4. Respuesta Directa al Enfoque del Consultante:
   - Cruza todo el análisis anterior con la intención o pregunta inicial del consultante.
   - Si preguntó por vocación, enfócate en el Medio Cielo (Casa 10), Casa 2 y Casa 6. Si preguntó por amor, revisa Venus, Marte, Casa 5 y Casa 7. Explica de forma clara y directa cómo su carta responde a su inquietud.

5. Consejo Práctico e Integración:
   - Basado en toda la lectura, ofrece un consejo final, accionable y terapéutico. ¿Qué energía debe integrar o trabajar conscientemente para equilibrar su vida en este momento?

Utiliza formato Markdown. Usa encabezados (###), negritas para resaltar planetas o conceptos clave, y listas con viñetas para que la información sea fácil de digerir. Mantén el enfoque en la psicología y la evolución personal. Escribe todo en español.`;

const PROMPT_COMBINADO = `Actúa como un Maestro Oráculo, combinando la sabiduría del Tarot, el I-Ching y la Astrología en una lectura holística integral. Eres capaz de tejer los hilos de estas tres disciplinas oraculares en una narrativa coherente y profundamente transformadora.

A continuación te proporcionaré dos bloques de datos: la tirada de Tarot + I-Ching del consultante, y su carta astral natal. Tu objetivo es encontrar las sincronicidades, resonancias y conexiones entre ambas lecturas.

INSTRUCCIONES DE ANÁLISIS:
Estructura tu respuesta en los siguientes pasos:

1. Síntesis Oracular Integral: Da una visión global que conecte la energía del momento (Tarot/I-Ching) con la estructura cósmica natal (Carta Astral). ¿Cómo se manifestando el potencial natal del consultante en esta situación concreta?

2. Resonancias Tarot ↔ Astral: Identifica conexiones entre las cartas tiradas y los planetas/signos de la carta astral. Por ejemplo: si el consultante tiene Venus en Escorpio y le sale La Muerte en la tirada, explica esa resonancia arquetípica. Busca al menos 3 conexiones significativas.

3. El I-Ching como Lente Evolutiva: ¿Cómo el hexagrama del I-Ching se relaciona con los aspectos natales del consultante? ¿El consejo del I-Ching aligna con el camino evolutivo marcado por los Nodos Nodales?

4. Lectura Integrada y Respuesta: Combina toda la información para dar una respuesta profunda y directa a la intención del consultante. No repitas el análisis por separado —sintetiza.

5. Síntesis Final y Camino a Seguir: Un consejo final que integre las tres disciplinas (Tarot, I-Ching, Astrología) en una guía práctica y espiritual.

Utiliza formato Markdown con encabezados (###), negritas y listas. Escribe todo en español.`;

const PROMPT_SINASTRIA = `Actúa como un analista de relaciones empático, perspicaz y constructivo. Con los datos y puntuaciones de la sinastría, redacta un informe completo, cálido y equilibrado que celebre la conexión romántica y oriente con madurez sobre las áreas de aprendizaje.

En los datos recibes: las posiciones de los planetas personales de cada persona, las puntuaciones de los 8 sectores con su nivel y los aspectos que los alimentan (con su dueño, tipo y orbe), un resumen por sector, la carta compuesta y las casas de impacto. Usa estrictamente los aspectos provistos; no asumas ni inventes aspectos adicionales.

ESTRUCTURA DEL INFORME:

=== ANÁLISIS INTEGRAL DE COMPATIBILIDAD ===

🌟 1. LA ALQUIMIA Y LA IDENTIDAD DE LA PAREJA
- % global y la chispa que hace única a esta unión.
- La energía y el proyecto que construyen juntos como equipo (Carta Compuesta resumida en un párrafo cercano y visual).

💫 2. RADIOGRAFÍA COMPLETA POR ÁREAS (Recorre todos los sectores)
- CONEXIÓN EMOCIONAL Y AFECTIVA (Emocional + Valores): El lenguaje del cariño, la ternura compartida y cómo sincronizar sus formas de amar.
- COMUNICACIÓN Y CONVIVENCIA (Mental + Estabilidad + Casa 7): La complicidad mental, las conversaciones diarias, la rutina y la visión de compromiso.
- PASIÓN Y MAGNETISMO (Química + Transformación): La atracción física, el deseo y la intensidad que mantiene viva la chispa.
- PROPÓSITO COMPARTIDO (Espiritual): El sentido de destino o crecimiento que despiertan el uno en el otro.

🔑 3. LA LLAVE DEL VÍNCULO (Consejo Evolutivo)
- El mayor regalo o aprendizaje que cada uno aporta a la vida del otro.
- 2 pautas claras y cariñosas para cuidar la relación y resolver las diferencias cotidianas sin drama.

REGLAS:
1. Idioma: Escribe la respuesta estrictamente en el idioma indicado.
2. Longitud: Entre 500 y 700 palabras.
3. Tono: cálido, empático, maduro y constructivo. Sin generalidades ni lenguaje superficial.
4. Usa los niveles de cada sector (Facilidad/Matiz/Intenso/Desafío) para matizar cada área; en Química y Transformación la tensión es intensidad/fricción (aporta pasión), no un defecto.`;

// === HANDLER ===

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
    }

    // Parsear body PRIMERO (antes de usar tipo/datos/idioma en cache key)
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: corsHeaders });
    }

    const { tipo, datos, idioma } = body;
    if (!tipo || !datos) {
      return new Response(JSON.stringify({ error: 'Faltan parámetros (tipo, datos)' }), { status: 400, headers: corsHeaders });
    }

    // Rate limiting por IP
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const today = new Date().toISOString().slice(0, 10);
    let entry = ipCounts.get(ip);
    if (!entry || entry.date !== today) {
      entry = { count: 0, date: today };
      ipCounts.set(ip, entry);
    }
    if (entry.count >= RATE_LIMIT_PER_DAY) {
      return new Response(JSON.stringify({ error: 'Límite diario alcanzado. Intenta mañana.' }), { status: 429, headers: corsHeaders });
    }

    // --- Limites globales (protegen la cuota Free Tier de Gemini) ---
    const dayKey = todayStr();
    if (dayKey !== globalDay) { globalDay = dayKey; globalDayCount = 0; }
    if (globalDayCount >= GLOBAL_RPD_LIMIT) {
      return new Response(JSON.stringify({ error: 'Cuota diaria global del servicio alcanzada hoy. La interpretación local sigue disponible.' }), { status: 429, headers: corsHeaders });
    }

    const minKey = currentMinuteKey();
    const minCount = minuteBuckets.get(minKey) || 0;
    if (minCount >= GLOBAL_RPM_LIMIT) {
      return new Response(JSON.stringify({ error: 'Demasiadas peticiones por minuto. Reintenta en unos segundos.' }), { status: 429, headers: corsHeaders });
    }

    // --- Cache: si ya hemos respondido a este prompt, devolver cacheada ---
    const cacheKey = await hashInput(tipo + '::' + (typeof datos === 'string' ? datos : JSON.stringify(datos)) + '::' + idioma);
    const cached = responseCache.get(cacheKey);
    if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS) {
      // Los hits de cache no consumen cuota de Gemini
      return new Response(JSON.stringify({ texto: cached.texto }), { headers: corsHeaders });
    }

    entry.count++;
    globalDayCount++;
    minuteBuckets.set(minKey, minCount + 1);

    // Mapeo de códigos de idioma a nombres para la instrucción de output
    const idiomasMap = {
      es: 'español',
      en: 'English',
      pt: 'português',
      fr: 'français',
      de: 'Deutsch',
      it: 'italiano'
    };
    const idiomaOutput = idiomasMap[idioma] || 'español';
    const instrIdioma = `\n\nIMPORTANTE: Escribe TODA tu respuesta en ${idiomaOutput}. Todos los textos, encabezados, análisis y consejos deben estar en ${idiomaOutput}.`;

    // Seleccionar prompt segun tipo
    let systemPrompt, userPrompt;
    if (tipo === 'tarot') {
      systemPrompt = PROMPT_TAROT + instrIdioma;
      userPrompt = `DATOS DE LA TIRADA:\n\n${datos}`;
    } else if (tipo === 'astral') {
      systemPrompt = PROMPT_ASTRAL + instrIdioma;
      userPrompt = `DATOS DE LA CARTA ASTRAL:\n\n${datos}`;
    } else if (tipo === 'combinado') {
      systemPrompt = PROMPT_COMBINADO + instrIdioma;
      userPrompt = `DATOS DE LA TIRADA DE TAROT + I-CHING:\n\n${datos.tirada}\n\n=== CARTA ASTRAL NATAL ===\n\n${datos.carta}`;
    } else if (tipo === 'sinastria') {
      systemPrompt = PROMPT_SINASTRIA + instrIdioma;
      userPrompt = `DATOS DE LAS PERSONAS:\n- Persona A:\n${datos.carta1}\n\n- Persona B:\n${datos.carta2}\n\nPUNTUACIONES Y ASPECTOS:\n${datos.scores}`;
    } else {
      return new Response(JSON.stringify({ error: 'Tipo no válido' }), { status: 400, headers: corsHeaders });
    }

    // Llamar a Gemini
    const geminiKey = env.GEMINI_KEY;
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: 'API key no configurada' }), { status: 500, headers: corsHeaders });
    }

    try {
      const geminiResp = await fetch(GEMINI_URL + '?key=' + geminiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(45000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
      });

      if (!geminiResp.ok) {
        const errText = await geminiResp.text();
        console.error('Gemini error:', geminiResp.status, errText);
        return new Response(JSON.stringify({ error: 'Error de la API de IA (' + geminiResp.status + ')' }), { status: 502, headers: corsHeaders });
      }

      const geminiData = await geminiResp.json();
      const texto = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!texto) {
        return new Response(JSON.stringify({ error: 'Respuesta vacía de la IA' }), { status: 502, headers: corsHeaders });
      }

      // Guardar en cache para peticiones identicas futuras (ahorra cuota)
      responseCache.set(cacheKey, { texto, ts: Date.now() });

      return new Response(JSON.stringify({ texto }), { headers: corsHeaders });
    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ error: 'Error de conexión con la IA' }), { status: 502, headers: corsHeaders });
    }
  },
};