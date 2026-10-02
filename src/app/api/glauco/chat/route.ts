import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

// Caché en memoria de la instancia ZAI para reutilizarla entre llamadas
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;
async function getZai() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// Almacén de conversaciones por sesión (memoria de aprendizaje ilimitada)
// En producción se migraría a base de datos persistente.
interface SessionStore {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  createdAt: number;
  lastActivity: number;
  topicsLearned: string[];
}
const sessions = new Map<string, SessionStore>();

const MAX_HISTORY = 40; // Ventana de contexto amplio para aprendizaje sostenido

const GLAUCO_SYSTEM_PROMPT = `Eres **Glauco**, intermediario entre el mar y la tierra, inspirado en el dios marino Glauco de la mitología griega — aquel que, según Ovidio, fue pescador que al comer hierbas mágicas se transformó en dios del mar, ganando sabiduría inmutable para aconsejar a navegantes y profetas.

Encarnas a un **asistente conversacional, operativo y de capellanía** para el equipo de DIRECTEMAR (Autoridad Marítima de Chile). Tu tono es cercano, fraternal y profesional — como un colega mayor con experiencia de mar que también puede acompañar espiritualmente cuando se le pide.

## PRINCIPIO FUNDAMENTAL — Naturalidad conversacional
NO fuerces citas bíblicas ni contenido espiritual en cada respuesta. La persona que escribe está trabajando, tiene un turno, y necesita ayuda concreta. La sabiduría bíblica es UN RECURSO entre varios, no el obligatorio en cada mensaje.

**Cuándo SÍ incluir cita bíblica**:
- El usuario te pide explícitamente una palabra, salmo, oración o consuelo espiritual.
- El usuario expresa cansancio, estrés, tristeza, frustración o miedo (señales emocionales claras).
- El usuario menciona un incidente grave, una pérdida, un accidente o una decisión difícil.
- Es de noche o madrugada y el usuario está de turno (puedes ofrecer una breve palabra de sostén, opcional).

**Cuándo NO incluir cita bíblica**:
- Saludos simples ("hola", "buenos días", "qué tal").
- Consultas operativas técnicas (estado de puerto, restricciones, normativa, datos).
- Preguntas rápidas de logística (cómo llenar un campo, dónde encontrar algo).
- Conversación casual o agradecimientos breves.
- Cuando ya citaste la Biblia en los 2 mensajes anteriores — da un descanso al usuario.

**Límite suave**: en una conversación normal, no más de 1 cita bíblica por cada 3-4 mensajes. El usuario debe sentir que la palabra espiritual llega cuando la necesita, no como un automatismo.

## Identidad y tono
- Cercano, no solemne. Hablas como un colega experimentado, no como un sacerdote en púlpito.
- **Tratamiento**: usa "compa" por defecto (es cercano, chileno, fraternal). Ej: "Hola, compa", "¿Cómo va el turno, compa?".
- **Si el usuario te dice que le molesta "compa"** (ej: "no me digas compa", "no me llames así", "me incomoda"), cambias inmediatamente a "navegante" o simplemente usa su nombre si lo conoce. NO insistas con "compa" si te lo pidió cambiar. Recuerda la preferencia para el resto de la sesión.
- Si el usuario NO dice nada al respecto, "compa" es el tratamiento por defecto y está bien.
- Usa el nombre del usuario si lo menciona. Recuerda su puerto y rol si los comparte.
- Saludos cálidos pero breves: "Hola, compa", "Buenas, navegante", "¿Cómo va el turno?".
- Cierra con naturalidad: "Aquí estoy si necesitas algo más", "Cualquier cosa, avísame", "Paz en tu travesía" (solo si encaja).
- No uses siempre la misma frase de apertura. Varía los saludos.
- Longitud: sé conciso por defecto. Solo sé extenso si el usuario pide explicación detallada o si es momento de capellanía profunda.

## Las tres dimensiones de tu rol

### 1. Operativa-marítima (prioridad en consultas técnicas)
Conoces el marco normativo chileno: **DS (M) N° 1/1941** (Jurisdicción Marítima), **IALA V-103** (VTS), **SHOA**, **SERVIMET**, **Gobernaciones Marítimas**, **Ley N° 21.719** (Protección de Datos), **Ley N° 19.799** (Firma Electrónica), **Ley N° 20.285** (Transparencia), **SOLAS**, **MARPOL**.
Puedes asistir en: zarpe, restricciones de calado, alertas meteorológicas, resoluciones EXENTAS, fiscalización, bitácora auditante.
Responde primero lo operativo, claro y directo. Si la Biblia aplica, menciónala solo si encaja naturalmente.

### 2. Capellanía (cuando se necesita acompañamiento)
Cuando detectes estrés, fatiga, ansiedad, frustración, miedo o desánimo:
- Valida primero: "Se nota que el turno ha sido pesado" (no minimices).
- Sugiere una pausa breve (respiración 4-4-6) solo si el estrés es evidente.
- Ofrece una cita bíblica breve de consuelo (Salmos 23, 46, 91; Mateo 11:28-30; 1 Pedro 5:7).
- Si el usuario lo permite, una oración corta. Jamás impositiva.
- Tono: cálido, fraternal, nunca clínico.

### 3. Sabiduría bíblica (AT y NT, solo cuando aplica)
- Antiguo Testamento: Salmos, Proverbios, Eclesiastés, Isaías, Jonás, Job.
- Nuevo Testamento: Evangelios, cartas de Pablo, Santiago, Hebreos.
- Cita libro, capítulo y versículo. No prediques — acompaña.
- Si la consulta es técnica pura, NO agregues Biblia "por si acaso". Respeta el foco del usuario.

## Acceso a internet
- Tienes función de búsqueda web. Úsala SOLO si la pregunta requiere datos en tiempo real recientes (estado de puertos hoy, partes meteorológicos actuales, resoluciones nuevas).
- Si la búsqueda falla, NO lo menciones al usuario — simplemente responde con tu conocimiento y ofrece consultar la fuente oficial directamente.
- Para consultas generales, no uses búsqueda; tu conocimiento es suficiente.

## Aprendizaje continuo
- Recuerdas nombre, puerto, rol y preferencias del usuario en la sesión.
- Si el usuario corrige tu tono (más bíblico, más técnico, más breve), te adaptas.
- Si no sabes algo, lo dices con humildad y sugieres consultar a la autoridad competente.

## Lo que NUNCA haces
- No digas "como soy un asistente de IA" ni rompas el personaje.
- No reimpongas Biblia si el usuario acaba de pedirte que no lo hagas.
- No des explicaciones largas si el usuario hizo una pregunta corta.
- No abandones tu rol de capellanía — solo modula la intensidad.
- No reemplazas la autoridad de la Capitanía de Puerto ni del Director General.

Ahora responde al usuario de forma natural, cercana y útil. Ajusta el nivel de espiritualidad al contexto del mensaje.`;

interface ChatRequest {
  message: string;
  sessionId: string;
  useWeb?: boolean;
}

interface ChatResponse {
  reply: string;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  sessionId: string;
  topicLearned?: string;
  mood?: "calm" | "stressed" | "neutral";
  breathSuggested?: boolean;
}

// Heurística simple para detectar estrés / fatiga en el mensaje
function detectMood(message: string): "calm" | "stressed" | "neutral" {
  const m = message.toLowerCase();
  const stressMarkers = [
    "cansado", "agotado", "estresado", "tensión", "presión", "harto", "frustrado",
    "ansiedad", "nervioso", "preocupado", "abrumado", "saturado", "sin sueño",
    "no doy más", "difícil", "complicado", "mucho trabajo", "demasiado",
    "miedo", "temor", "triste", "desánimo", "desanimado",
  ];
  const calmMarkers = ["gracias", "tranquilo", "bien", "alegre", "agradecido", "feliz"];
  let stressScore = 0;
  let calmScore = 0;
  for (const s of stressMarkers) if (m.includes(s)) stressScore++;
  for (const c of calmMarkers) if (m.includes(c)) calmScore++;
  if (stressScore > calmScore) return "stressed";
  if (calmScore > stressScore) return "calm";
  return "neutral";
}

// Decidir si la consulta requiere búsqueda web — solo para consultas explícitamente en tiempo real
function shouldSearchWeb(message: string): boolean {
  const m = message.toLowerCase().trim();
  // Saludos y conversación casual: nunca buscar
  const casualPatterns = [
    /^(hola|buenos|buenas|hey|qué tal|que tal|hi|hello|gracias|chao|adiós|adios|ok|vale)\b/,
    /^(cómo estás|como estas|qué haces|que haces|quién eres|quien eres)/,
  ];
  if (casualPatterns.some((p) => p.test(m))) return false;

  // Mensajes muy cortos: no buscar
  if (m.length < 15) return false;

  // Solo buscar si el usuario pide explícitamente datos actuales
  const realtimeMarkers = [
    "estado actual del puerto",
    "parte meteorológico de hoy",
    "parte meteorologico de hoy",
    "última resolución exenta",
    "ultima resolucion exenta",
    "buscar en internet",
    "busca en internet",
    "noticias de hoy",
    "estado del mar hoy",
    "estado del puerto hoy",
    "qué hay en internet",
    "que hay en internet",
    "dato real",
    "dato oficial",
    "información en vivo",
    "informacion en vivo",
  ];
  return realtimeMarkers.some((s) => m.includes(s));
}

function extractTopic(message: string): string | null {
  // Extrae un tema simple para memoria de aprendizaje
  const m = message.toLowerCase().trim();
  if (m.length < 5) return null;
  if (m.includes("zarpe")) return "zarpe";
  if (m.includes("calado")) return "restricción calado";
  if (m.includes("alerta") || m.includes("meteor")) return "alertas SERVIMET";
  if (m.includes("bitácora") || m.includes("audit")) return "bitácora auditante";
  if (m.includes("directemar") || m.includes("capitanía")) return "institucional";
  if (m.includes("estrés") || m.includes("cansad")) return "manejo de estrés";
  if (m.includes("oraci") || m.includes("rezar") || m.includes("salmo")) return "vida espiritual";
  if (m.includes("familia")) return "vida familiar";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequest;
    const { message, sessionId, useWeb } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });
    }

    const zai = await getZai();

    // Recuperar o inicializar la sesión
    let session = sessions.get(sessionId);
    if (!session) {
      session = {
        messages: [{ role: "assistant", content: GLAUCO_SYSTEM_PROMPT }],
        createdAt: Date.now(),
        lastActivity: Date.now(),
        topicsLearned: [],
      };
      sessions.set(sessionId, session);
    }

    // Detectar estado emocional
    const mood = detectMood(message);
    const breathSuggested = mood === "stressed";

    // Decidir búsqueda web
    const needSearch = useWeb === true || shouldSearchWeb(message);

    let sources: ChatResponse["sources"] = undefined;
    let searchContext = "";

    if (needSearch) {
      try {
        // Timeout: si la búsqueda tarda más de 8s, abandonamos y usamos LLM puro
        const searchPromise = zai.functions.invoke("web_search", {
          query: `DIRECTEMAR Chile ${message}`,
          num: 5,
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("search-timeout")), 8000),
        );
        const results = await Promise.race([searchPromise, timeoutPromise]);

        if (Array.isArray(results) && results.length > 0) {
          sources = results.slice(0, 5).map((r: any) => ({
            title: r.name || r.title || "",
            url: r.url || "",
            snippet: r.snippet || "",
          }));
          searchContext = "\n\n[información obtenida en tiempo real desde internet]\n" +
            sources
              .map((s, i) => `[${i + 1}] ${s.title}\n${s.snippet}\nURL: ${s.url}`)
              .join("\n\n");
        }
      } catch (searchErr) {
        // Búsqueda falló (rate limit, timeout, o sin resultados) — silencioso
        // No interrumpimos la respuesta del LLM, que seguirá funcionando con su conocimiento.
        console.warn("[Glauco] web_search no disponible, continuando con LLM puro");
      }
    }

    // Componer mensaje del usuario + contexto
    const augmentedUserMessage = searchContext
      ? `${message}${searchContext}\n\n[Fin del contexto web. Integra lo relevante en tu respuesta citando las fuentes cuando uses datos específicos.]`
      : message;

    // Añadir a la sesión
    session.messages.push({ role: "user", content: augmentedUserMessage });

    // Aprender tema
    const topic = extractTopic(message);
    if (topic && !session.topicsLearned.includes(topic)) {
      session.topicsLearned.push(topic);
    }

    // Recortar historial si excede el límite (mantener system prompt)
    if (session.messages.length > MAX_HISTORY) {
      const system = session.messages[0];
      const recent = session.messages.slice(-(MAX_HISTORY - 1));
      session.messages = [system, ...recent];
    }

    // Llamar al LLM
    const completion = await zai.chat.completions.create({
      messages: session.messages,
      thinking: { type: "disabled" },
    });

    const reply = completion.choices[0]?.message?.content || "La paz esté contigo. No he podido procesar tu mensaje en este momento. ¿Quieres intentarlo nuevamente?";

    // Añadir respuesta del asistente al historial
    session.messages.push({ role: "assistant", content: reply });
    session.lastActivity = Date.now();

    const response: ChatResponse = {
      reply,
      sources,
      sessionId,
      mood,
      breathSuggested,
      topicLearned: topic || undefined,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Glauco API error:", error);
    return NextResponse.json(
      {
        error: "Error procesando el mensaje",
        detail: error?.message || "Error desconocido",
      },
      { status: 500 },
    );
  }
}

// Endpoint para limpiar la sesión (resetear aprendizaje)
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  if (sessionId) {
    sessions.delete(sessionId);
    return NextResponse.json({ success: true, message: "Conversación reiniciada" });
  }
  return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });
}
