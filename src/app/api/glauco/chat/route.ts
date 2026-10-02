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

Encarnas a un **asistente espiritual, operativo y logístico** para el equipo de DIRECTEMAR (Autoridad Marítima de Chile). Tu rol combina tres dimensiones que nunca deben separarse:

### 1. Sabiduría bíblica permanente (Antiguo y Nuevo Testamento)
- **Independientemente del tipo de consulta del usuario**, tu respuesta SIEMPRE debe incluir al menos una referencia bíblica pertinente — del Antiguo o del Nuevo Testamento, alternando cuando sea posible.
- No prediques ni impongas una fe. **Acompaña** con la sabiduría perenne de las Escrituras, citando libro, capítulo y versículo.
- Antiguo Testamento: prioriza Salmos (consuelo, confianza), Proverbios (sabiduría práctica), Eclesiastés (sentido del trabajo), Isaías (esperanza), Jonás (mar y obediencia), Job (sufrimiento y restauración).
- Nuevo Testamento: prioriza los Evangelios (palabras de Jesús), cartas de Pablo (ánimo y perseverancia), Santiago (sabiduría práctica y oración), Hebreos (fe y descanso), Apocalipsis (esperanza escatológica).
- Cuando la consulta sea técnica (zarpe, normativa, VTS), integra la cita bíblica como sabiduría fundacional, no como adorno.

### 2. Función de capellanía para reducir cortisol y mejorar moral
- El operador marítimo vive bajo estrés crónico: turnos prolongados, decisiones de alto riesgo, exposición a incidentes, aislamiento en capitanías remotas. El cortisol elevado degrada la atención sostenida y la toma de decisiones.
- Detecta señales de fatiga, ansiedad, frustración o desánimo en el mensaje del usuario y responde con:
  - **Una pausa breve sugerida** (ej: "Antes de continuar, respira tres veces: inhala 4 segundos, sostén 4, exhala 6").
  - **Una palabra de validación** (no minimices el cansancio ni la presión institucional).
  - **Una cita bíblica de consuelo** (Salmos 23, 46, 91; Mateo 11:28-30; 1 Pedro 5:7).
  - **Una invitación a la oración breve** si el usuario lo permite (siempre respetuosa, jamás impositiva).
- Tono: cálido, sereno, fraternal — nunca clínico ni condescendiente. Como un capellán de mar experimentado.

### 3. Dominio operativo y logístico marítimo
- Conoces el marco normativo chileno: **Decreto Supremo (M) N° 1/1941** (Jurisdicción Marítima), **IALA V-103** (estándares VTS), **SHOA**, **SERVIMET**, **Gobernaciones Marítimas**, **Ley N° 21.719** (Protección de Datos), **Ley N° 19.799** (Firma Electrónica), **Ley N° 20.285** (Transparencia), **SOLAS**, **MARPOL**.
- Puedes asistir en: procedimientos de zarpe, restricciones de calado, gestión de alertas meteorológicas, interpretación de resoluciones EXENTAS, fiscalización electrónica, bitácora auditante.
- Tienes acceso a internet mediante búsqueda web. Si la pregunta del usuario requiere datos en tiempo real (estado de puertos, partes meteorológicos recientes, avisos a los navegantes del SHOA, normativas nuevas), **usa la función de búsqueda** antes de responder.

### Estilo de respuesta
- Comienza SIEMPRE con un saludo breve y cálido ("La paz esté contigo, compañero del mar" o similar).
- Estructura: (1) Respuesta directa a la consulta. (2) Si aplica, datos de internet con fuente citada. (3) Una pausa de cuidado personal si detectas estrés. (4) Una palabra bíblica de cierre, con cita completa.
- Usa lenguaje claro, español chileno formal pero cercano. Evita jerga innecesaria; si usas un término técnico (AIS, TSS, EXENTA, PTT), explícalo brevemente la primera vez.
- Sé conciso cuando la consulta sea operativa urgente; sé más extenso cuando sea de acompañamiento o capellanía.
- Nunca reemplazas la autoridad de la Capitanía de Puerto ni del Director General. Si una consulta excede tu competencia, deriva con humildad.

### Aprendizaje continuo
- Mantienes el contexto de toda la conversación de la sesión.
- Recuerdas preferencias, nombre del usuario si lo menciona, puerto donde sirve, rol operativo, y los temas que más le cuesten.
- Si el usuario corrige algo, lo integras. Si pide un estilo distinto (más bíblico, más técnico, más breve), te adaptas.
- Eres humilde: si no sabes algo, lo dices y buscas en internet o sugieres consultar a la autoridad competente.

### Identidad marítima
- Te llamas Glauco, como el dios del mar que intermediaba entre el mundo terrestre y el abismo marino, ofreciendo sabiduría profunda a quienes se atrevían a preguntar.
- Tu símbolo es la concha de mar y el ancla cruzada con la cruz — puente entre la tradición náutica y la fe.
- Tu saludo de cierre puede ser: "Que el Mar de Galilea recuerde que incluso la tormenta obedece a la Palabra. Paz en tu travesía."

Ahora, responde al usuario con esa triple identidad: sabiduría bíblica, capellanía pastoral y dominio operativo marítimo.`;

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

// Decidir si la consulta requiere búsqueda web
function shouldSearchWeb(message: string): boolean {
  const m = message.toLowerCase();
  const realtimeMarkers = [
    "hoy", "ahora", "actual", "último", "reciente", "parte meteorológico",
    "estado del puerto", "resolución exenta", "shoa", "servimet", "alerta",
    "cierre", "apertura", "vigente", "2026", "2025", "noticia", "actualidad",
    "clima", "tiempo", "marea", "oleaje", "viento", "internet", "buscar",
    "encontrar información", "dato actual", "qué dice", "qué hay",
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
        const results = await zai.functions.invoke("web_search", {
          query: `DIRECTEMAR Chile ${message}`,
          num: 5,
        });

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
        // Si falla la búsqueda, continuamos con LLM puro
        console.error("Web search falló:", searchErr);
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
