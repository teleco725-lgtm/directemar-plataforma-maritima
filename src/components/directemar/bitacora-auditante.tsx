"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Shield,
  Link2,
  Lock,
  Hash,
  CheckCircle2,
  Plus,
  Search,
  Download,
  Fingerprint,
  ServerCog,
  ArrowDown,
  Copy,
  CheckCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  INITIAL_AUDIT,
  generateHash,
  fmtDateTime,
  fmtTime,
  ZONAS_MARITIMAS,
  ALL_REGIONS_FILTER,
  type AuditEntry,
} from "@/lib/directemar-data";
import { RegionFilter } from "@/components/directemar/region-filter";
import { ExportModal } from "@/components/directemar/export-modal";
import type { ExportPayload } from "@/lib/export-utils";

const ACTIONS = [
  { action: "Emisión de zarpe", detail: "Zarpe aprobado para M/V Atlantic Trader rumbo San Antonio.", actor: "Tello, R.", role: "Oficial VTS" },
  { action: "Aplicación de restricción", detail: "Restricción de velocidad 10kn aplicada a zona TSS Valparaíso.", actor: "Vargas, M.", role: "Capitán de Puerto" },
  { action: "Detección automática", detail: "Alerta de exceso de velocidad generada por AIS para M/V Beagle.", actor: "Sistema Automático", role: "AIS Engine" },
  { action: "Recepción de parte meteorológico", detail: "Parte N° 268: viento 22kn, mar 2.1m en zona Puerto Montt.", actor: "Sistema Automático", role: "SERVIMET Adapter" },
  { action: "Infracción registrada", detail: "Acta de infracción N° 089/26 emitida por incumplimiento de restricción de calado.", actor: "Rojas, P.", role: "Fiscalizador" },
  { action: "Firma de certificado", detail: "Certificado de arqueo N° CA-2026-4471 firmado electrónicamente.", actor: "Tello, R.", role: "Oficial VTS" },
  { action: "Cambio de estado de puerto", detail: "Puerto Castro cambiado a CERRADO por alerta SERVIMET nivel rojo.", actor: "Sistema Automático", role: "SERVIMET Adapter" },
];

export function BitacoraAuditante() {
  const [entries, setEntries] = useState<AuditEntry[]>(INITIAL_AUDIT);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [selected, setSelected] = useState<AuditEntry | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [zonaFilter, setZonaFilter] = useState<string>(ALL_REGIONS_FILTER);
  const [exportOpen, setExportOpen] = useState(false);

  // Verificar integridad de la cadena — derivado del estado entries
  const chainValid = useMemo(() => {
    for (let i = 1; i < entries.length; i++) {
      if (entries[i].prevHash !== entries[i - 1].hash) {
        return false;
      }
    }
    return true;
  }, [entries]);

  // Filtrar entradas por zona marítima
  const filteredByZona = useMemo(() => {
    if (zonaFilter === ALL_REGIONS_FILTER) return entries;
    return entries.filter((e) => e.zonaMaritima === zonaFilter);
  }, [entries, zonaFilter]);

  const zonaLabel = useMemo(() => {
    if (zonaFilter === ALL_REGIONS_FILTER) return "Nacional — Todo Chile";
    const z = ZONAS_MARITIMAS.find((x) => x.code === zonaFilter);
    return z ? `${z.code} · ${z.name} (${z.hq})` : "Nacional";
  }, [zonaFilter]);

  const exportPayload: ExportPayload<AuditEntry> = {
    title: "Bitácora auditante",
    subtitle: "Cadena de eventos con hash criptográfico encadenado",
    zonaMaritimaLabel: zonaLabel,
    columns: [
      { key: "blockSeq", label: "Bloque #", format: (r) => String(r.blockSeq) },
      { key: "timestamp", label: "Timestamp", format: (r) => fmtDateTime(r.timestamp) },
      { key: "actor", label: "Actor" },
      { key: "role", label: "Rol" },
      { key: "action", label: "Acción" },
      { key: "target", label: "Objetivo" },
      { key: "detail", label: "Detalle" },
      { key: "zonaMaritima", label: "Zona Marítima" },
      { key: "hash", label: "Hash" },
      { key: "prevHash", label: "Hash anterior" },
    ],
    rows: filteredByZona,
    meta: {
      "Total bloques": String(filteredByZona.length),
      "Último bloque #": String(filteredByZona[0]?.blockSeq ?? 0),
      "Integridad de cadena": chainValid ? "100% — Íntegra" : "Comprometida",
      "Algoritmo": "SHA-256",
      "Nodos de consenso": "3 (CL-SCL, CL-ARI, CL-PUQ)",
    },
  };

  // Simular generación de nuevos eventos periódicamente
  useEffect(() => {
    const i = setInterval(() => {
      setTick((t) => t + 1);
      setEntries((prev) => {
        const lastEntry = prev[0];
        const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        const payload = `${action.action}${action.detail}${Date.now()}`;
        const newHash = generateHash(lastEntry.hash, payload);
        const newEntry: AuditEntry = {
          id: `AUD-${String(433 + (Date.now() % 5000)).padStart(5, "0")}`,
          timestamp: new Date().toISOString(),
          actor: action.actor,
          role: action.role,
          action: action.action,
          target: "Registro automático",
          detail: action.detail,
          hash: newHash,
          prevHash: lastEntry.hash,
          blockSeq: lastEntry.blockSeq + 1,
        };
        return [newEntry, ...prev].slice(0, 50);
      });
    }, 8000);
    return () => clearInterval(i);
  }, []);

  const filtered = filteredByZona.filter((e) => {
    if (filterAction !== "all" && !e.action.toLowerCase().includes(filterAction)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.action.toLowerCase().includes(q) ||
        e.actor.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q) ||
        e.hash.includes(q)
      );
    }
    return true;
  });

  const copyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopied(hash);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-accent" />
            Bitácora Auditante
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cadena inmutable de eventos · Hash criptográfico encadenado (SHA-256 equivalente)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold",
            chainValid
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/5 text-destructive",
          )}>
            {chainValid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
            {chainValid ? "Cadena íntegra" : "Cadena comprometida"}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setExportOpen(true)}>
            <Download className="h-3.5 w-3.5" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Region filter */}
      <RegionFilter value={zonaFilter} onChange={setZonaFilter} variant="full" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Hash} label="Bloques totales" value="8,247" sub="Desde 01-Ene-2026" />
        <StatCard icon={Plus} label="Eventos hoy" value="327" sub="+24 vs ayer" />
        <StatCard icon={ServerCog} label="Nodos de consenso" value="3" sub="CL-SCL · CL-ARI · CL-PUQ" />
        <StatCard icon={Lock} label="Cifrado" value="AES-256" sub="HSM backed" />
      </div>

      {/* Search + filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por acción, actor, hash…"
                className="h-9 pl-8 text-xs"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                { v: "all", l: "Todos" },
                { v: "zarpe", l: "Zarpes" },
                { v: "restricción", l: "Restricciones" },
                { v: "automático", l: "Automáticos" },
                { v: "infracción", l: "Infracciones" },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setFilterAction(opt.v)}
                  className={cn(
                    "px-2.5 py-1 rounded text-[11px] font-medium border transition-colors",
                    filterAction === opt.v
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blockchain visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chain */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="h-4 w-4 text-accent" />
                Cadena de Eventos
              </CardTitle>
              <span className="text-[10px] text-muted-foreground font-mono-tabular">
                Tick #{tick} · {filtered.length} bloques
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-[640px] overflow-y-auto scrollbar-thin space-y-0 pr-1">
              {filtered.map((entry, idx) => (
                <div key={entry.id}>
                  <button
                    onClick={() => setSelected(selected?.id === entry.id ? null : entry)}
                    className={cn(
                      "w-full text-left p-3 rounded-md border transition-all",
                      selected?.id === entry.id
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/50 hover:bg-muted/30",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0">
                        <div className="h-8 w-8 rounded-md bg-accent/10 flex items-center justify-center">
                          <span className="text-[10px] font-mono-tabular font-bold text-accent">
                            #{entry.blockSeq}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold">{entry.action}</span>
                          <Badge variant="outline" className="text-[9px]">{entry.role}</Badge>
                          {entry.actor.includes("Sistema") && (
                            <Badge variant="secondary" className="text-[9px] gap-1">
                              <ServerCog className="h-2.5 w-2.5" />
                              AUTO
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {entry.detail}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span className="font-mono-tabular">{entry.actor}</span>
                          <span>·</span>
                          <span className="font-mono-tabular">{fmtDateTime(entry.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1.5 text-[10px] font-mono-tabular text-muted-foreground/70">
                          <Fingerprint className="h-2.5 w-2.5" />
                          <span className="truncate">{entry.hash.slice(0, 32)}…</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyHash(entry.hash);
                            }}
                            className="ml-1 p-0.5 hover:text-foreground"
                          >
                            {copied === entry.hash ? <CheckCheck className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    </div>
                  </button>
                  {idx < filtered.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <ArrowDown className="h-3 w-3 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected detail / chain verify */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-accent" />
                Verificación de Bloque
              </CardTitle>
              <CardDescription className="text-xs">
                {selected ? `Bloque #${selected.blockSeq}` : "Selecciona un bloque para verificar"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {selected ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Hash del bloque</div>
                    <div className="font-mono-tabular text-[10px] p-2 rounded bg-muted break-all leading-relaxed">
                      {selected.hash}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Hash anterior</div>
                    <div className="font-mono-tabular text-[10px] p-2 rounded bg-muted break-all leading-relaxed">
                      {selected.prevHash}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Sello de tiempo</div>
                    <div className="font-mono-tabular">{fmtDateTime(selected.timestamp)}</div>
                  </div>
                  <div className="pt-2 border-t border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Algoritmo</span>
                      <Badge variant="outline" className="text-[10px] font-mono-tabular">SHA-256</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Nodo</span>
                      <span className="font-mono-tabular">CL-SCL-01</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Firma digital</span>
                      <span className="font-mono-tabular text-[10px]">Ed25519</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Validez probatoria</span>
                      <Badge className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Ley 19.799
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-8">
                  <Lock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  Selecciona un bloque para ver detalles criptográficos
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ServerCog className="h-4 w-4 text-accent" />
                Consenso Distribuido
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {[
                { node: "CL-SCL-01", loc: "Santiago", status: "ok", blocks: 8247 },
                { node: "CL-ARI-02", loc: "Arica", status: "ok", blocks: 8247 },
                { node: "CL-PUQ-03", loc: "Punta Arenas", status: "syncing", blocks: 8246 },
              ].map((node) => (
                <div key={node.node} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded border border-border bg-card">
                  <span className={cn(
                    "h-2 w-2 rounded-full",
                    node.status === "ok" ? "bg-emerald-500" : "bg-amber-500 pulse-dot",
                  )} />
                  <div className="flex-1">
                    <div className="font-mono-tabular font-semibold text-[11px]">{node.node}</div>
                    <div className="text-[10px] text-muted-foreground">{node.loc}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-tabular text-[11px]">{node.blocks}</div>
                    <div className="text-[9px] text-muted-foreground uppercase">
                      {node.status === "ok" ? "Sincronizado" : "Sincronizando"}
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-2 mt-1 border-t border-border text-[10px] text-muted-foreground text-center">
                Tolerancia a fallas: 1 nodo · Quórum: 2/3
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Export modal */}
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} payload={exportPayload} />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
            <div className="text-xl font-bold tabular-nums mt-0.5">{value}</div>
            {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
          </div>
          <div className="h-8 w-8 rounded-md bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
