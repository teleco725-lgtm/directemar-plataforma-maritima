"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  X,
  Waves,
  Sparkles,
  Globe,
  Trash2,
  Bot,
  User,
  Loader2,
  Wind,
  BookOpen,
  Heart,
  ChevronDown,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  mood?: "calm" | "stressed" | "neutral";
  breathSuggested?: boolean;
  timestamp: number;
}

const STORAGE_KEY = "glauco-conversation";
const SESSION_KEY = "glauco-session-id";

const SUGGESTED_PROMPTS = [
  {
    icon: BookOpen,
    title: "Saludo de turno",
    prompt: "Hola Glauco, estoy iniciando el turno. ¿Cómo vas?",
  },
  {
    icon: Waves,
    title: "Consulta operativa",
    prompt: "¿Qué normativa regula la restricción de calado en Puerto Montt?",
  },
  {
    icon: Wind,
    title: "Turno difícil",
    prompt: "He tenido varias alertas críticas hoy. Ayúdame a bajar el estrés.",
  },
  {
    icon: Heart,
    title: "Acompañamiento espiritual",
    prompt: "Dame un salmo que sostenga el ánimo de mi equipo esta noche.",
  },
];

const BREATH_EXERCISE = `**Ejercicio de respiración 4-4-6**

Inhala por la nariz — **4 segundos**
Mantén el aire — **4 segundos**
Exhala por la boca — **6 segundos**

Repite tres ciclos antes de seguir. Esto activa el nervio vago y reduce el cortisol en minutos.`;

export function GlaucoChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [showSources, setShowSources] = useState<Record<string, boolean>>({});
  const [topicsLearned, setTopicsLearned] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Inicializar sesión y cargar conversación guardada
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Message[];
        setMessages(parsed);
      } catch {}
    }
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `glauco-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(SESSION_KEY, sid);
    }
    setSessionId(sid);
  }, []);

  // Persistir conversación (aprendizaje ilimitado en cliente)
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-100)));
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus en input al abrir
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading || !sessionId) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/glauco/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          sessionId,
          useWeb: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        sources: data.sources,
        mood: data.mood,
        breathSuggested: data.breathSuggested,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (data.topicLearned) {
        setTopicsLearned((prev) =>
          prev.includes(data.topicLearned) ? prev : [...prev, data.topicLearned],
        );
      }
    } catch (err) {
      const errMsg: Message = {
        id: `e-${Date.now()}`,
        role: "assistant",
        content:
          "Compañero, tuve un problema técnico procesando tu mensaje. ¿Puedes repetirlo? Si persiste, avísame y derivamos al equipo de soporte.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, sessionId]);

  const reset = useCallback(async () => {
    if (!sessionId) return;
    try {
      await fetch(`/api/glauco/chat?sessionId=${encodeURIComponent(sessionId)}`, {
        method: "DELETE",
      });
    } catch {}
    setMessages([]);
    setTopicsLearned([]);
    localStorage.removeItem(STORAGE_KEY);
    // Generar nuevo sessionId
    const newSid = `glauco-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(SESSION_KEY, newSid);
    setSessionId(newSid);
  }, [sessionId]);

  const toggleSources = (id: string) =>
    setShowSources((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir Glauco — Asistente espiritual y marítimo"
        className={cn(
          "fixed bottom-5 right-5 z-50 flex items-center justify-center",
          "h-14 w-14 rounded-full shadow-lg",
          "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground",
          "hover:scale-105 active:scale-95 transition-transform",
          "ring-2 ring-accent/30 ring-offset-2 ring-offset-background",
          open && "rotate-90",
        )}
      >
        <Waves className="h-6 w-6" strokeWidth={2.5} />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 pulse-dot ring-2 ring-background" />
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className={cn(
            "fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-5 z-50",
            "sm:w-[420px] sm:h-[640px] sm:max-h-[calc(100vh-7rem)]",
            "flex flex-col bg-card border border-border sm:rounded-xl shadow-2xl overflow-hidden",
            "animate-in slide-in-from-bottom-4 sm:animate-in sm:slide-in-from-bottom-2",
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-sidebar to-sidebar/90 text-sidebar-foreground border-b border-sidebar-border">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                <Waves className="h-5 w-5 text-accent-foreground" strokeWidth={2.5} />
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-sidebar pulse-dot" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm flex items-center gap-1.5">
                Glauco
                <Badge variant="secondary" className="text-[9px] bg-accent/20 text-accent-foreground">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                  Intermediario del mar
                </Badge>
              </div>
              <div className="text-[10px] text-sidebar-foreground/70">
                Capellanía · Sabiduría bíblica · Operación marítima
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Topics learned (chips) */}
          {topicsLearned.length > 0 && (
            <div className="px-3 py-2 border-b border-border bg-muted/30 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold shrink-0">
                Aprendido:
              </span>
              {topicsLearned.slice(-5).map((t) => (
                <Badge key={t} variant="outline" className="text-[9px] py-0 shrink-0">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3 bg-grid-pattern"
          >
            {messages.length === 0 ? (
              <WelcomeScreen onPrompt={(p) => send(p)} />
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  showSources={showSources[msg.id]}
                  onToggleSources={() => toggleSources(msg.id)}
                />
              ))
            )}
            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <Waves className="h-4 w-4 text-accent-foreground animate-pulse" />
                </div>
                <div className="flex items-center gap-1 px-3 py-2.5 rounded-lg bg-muted/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="px-3 py-2 border-t border-border bg-card/80 backdrop-blur-sm flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot" />
              <span>Glauco activo · Capellanía y operación marítima</span>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="h-6 gap-1 text-[10px] text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Reiniciar memoria
              </Button>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Escribe a Glauco — tu capellán del mar…"
                className="h-10 text-xs"
                disabled={loading}
              />
              <Button
                size="icon"
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className="h-10 w-10 shrink-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <div className="text-[9px] text-muted-foreground mt-1.5 px-1">
              Glauco recuerda toda tu conversación en este dispositivo. Aprende contigo en cada sesión.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function WelcomeScreen({ onPrompt }: { onPrompt: (p: string) => void }) {
  return (
    <div className="flex flex-col items-center text-center py-8 px-4">
      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mb-3 ring-4 ring-accent/20">
        <Waves className="h-8 w-8 text-accent-foreground" strokeWidth={2} />
      </div>
      <h2 className="text-lg font-bold">Glauco</h2>
      <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
        Como el dios del mar que intermediaba entre el mundo terrestre y el abismo,
        te acompaño en tu travesía operativa. Sabiduría bíblica del Antiguo y Nuevo Testamento,
        datos en tiempo real y cuidado pastoral para tu turno.
      </p>

      <div className="mt-5 w-full space-y-1.5">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold text-left mb-2">
          ¿Por dónde comenzamos?
        </div>
        {SUGGESTED_PROMPTS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.title}
              onClick={() => onPrompt(p.prompt)}
              className="w-full flex items-start gap-2.5 p-2.5 rounded-md border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors text-left"
            >
              <div className="h-7 w-7 rounded-md bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold">{p.title}</div>
                <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                  {p.prompt}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 p-2.5 rounded-md bg-amber-500/5 border border-amber-500/20 text-left w-full">
        <div className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold mb-1 flex items-center gap-1">
          <Wind className="h-3 w-3" />
          Pausa de respiración
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Antes de comenzar: inhala 4s, sostén 4s, exhala 6s. Repite tres veces.
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  showSources,
  onToggleSources,
}: {
  message: Message;
  showSources: boolean;
  onToggleSources: () => void;
}) {
  const isUser = message.role === "user";
  const time = new Date(message.timestamp).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex items-start gap-2.5", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Waves className="h-4 w-4" />}
      </div>
      <div className={cn("flex-1 min-w-0", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "inline-block max-w-full px-3 py-2 rounded-lg text-xs leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted/60 text-foreground rounded-tl-sm",
            message.mood === "stressed" && !isUser && "border-l-2 border-amber-500",
          )}
        >
          <FormattedContent content={message.content} />

          {message.breathSuggested && !isUser && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold mb-1">
                <Wind className="h-3 w-3" />
                Te sugiero una pausa
              </div>
              <div className="text-[10px] text-muted-foreground whitespace-pre-line">
                {BREATH_EXERCISE}
              </div>
            </div>
          )}

          {message.sources && message.sources.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <button
                onClick={onToggleSources}
                className="flex items-center gap-1 text-[10px] text-accent hover:underline font-semibold"
              >
                <Globe className="h-3 w-3" />
                {showSources ? "Ocultar" : "Mostrar"} {message.sources.length} fuente(s) web
              </button>
              {showSources && (
                <div className="mt-1.5 space-y-1.5">
                  {message.sources.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-1.5 rounded border border-border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-[10px] font-semibold text-accent truncate">
                        [{i + 1}] {s.title}
                      </div>
                      <div className="text-[9px] text-muted-foreground line-clamp-2 mt-0.5">
                        {s.snippet}
                      </div>
                      <div className="text-[9px] text-muted-foreground/70 truncate mt-0.5 font-mono-tabular">
                        {s.url}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className={cn("text-[9px] text-muted-foreground mt-0.5 px-1", isUser && "text-right")}>
          {time}
          {message.mood === "stressed" && !isUser && " · 💙"}
        </div>
      </div>
    </div>
  );
}

// Renderiza contenido con formato básico markdown (negritas, cursivas, citas bíblicas)
function FormattedContent({ content }: { content: string }) {
  // Split por párrafos
  const paragraphs = content.split(/\n\n+/);

  return (
    <div className="space-y-1.5">
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {renderInline(p)}
        </p>
      ))}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Render **bold** y *italic* y `citas`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono-tabular">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
