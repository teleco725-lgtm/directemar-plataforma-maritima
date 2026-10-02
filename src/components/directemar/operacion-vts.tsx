"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Ship,
  Radar,
  Radio,
  AlertTriangle,
  Wind,
  Waves,
  Eye,
  Filter,
  Search,
  CheckCircle2,
  Volume2,
  Crosshair,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  generateVessels,
  moveVessel,
  INITIAL_ALERTS,
  PORTS,
  fmtTime,
  type Vessel,
  type MaritimeAlert,
} from "@/lib/directemar-data";

const VESSEL_TYPE_LABELS: Record<Vessel["type"], string> = {
  Cargo: "Carga",
  Tanker: "Petrolero",
  Fishing: "Pesca",
  Passenger: "Pasajeros",
  Pilot: "Práctico",
  Tug: "Remolcador",
  Naval: "Naval",
};

const VESSEL_COLORS: Record<Vessel["type"], string> = {
  Cargo: "oklch(0.62 0.13 185)",
  Tanker: "oklch(0.65 0.22 25)",
  Fishing: "oklch(0.7 0.18 145)",
  Passenger: "oklch(0.78 0.16 70)",
  Pilot: "oklch(0.65 0.13 220)",
  Tug: "oklch(0.55 0.18 280)",
  Naval: "oklch(0.4 0.04 200)",
};

const SEVERITY_CONFIG: Record<MaritimeAlert["severity"], { color: string; bg: string; label: string }> = {
  info: { color: "text-accent", bg: "bg-accent/5 border-accent/20", label: "Info" },
  warning: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/5 border-amber-500/30", label: "Advertencia" },
  critical: { color: "text-destructive", bg: "bg-destructive/5 border-destructive/30", label: "Crítica" },
};

export function OperacionVTS() {
  const [vessels, setVessels] = useState<Vessel[]>(() => generateVessels(18));
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [alerts, setAlerts] = useState<MaritimeAlert[]>(INITIAL_ALERTS);
  const [tickCount, setTickCount] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const [showTrails, setShowTrails] = useState(true);

  // Real-time vessel movement simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setVessels((prev) => prev.map(moveVessel));
      setTickCount((t) => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    let v = vessels;
    if (filter !== "all") {
      if (filter === "high") v = v.filter((x) => x.risk === "high");
      else if (filter === "underway") v = v.filter((x) => x.status === "Under way");
      else v = v.filter((x) => x.type.toLowerCase() === filter);
    }
    if (search) {
      const q = search.toLowerCase();
      v = v.filter((x) =>
        x.name.toLowerCase().includes(q) ||
        x.mmsi.includes(q) ||
        x.imo.includes(q) ||
        x.destination.toLowerCase().includes(q),
      );
    }
    return v;
  }, [vessels, filter, search]);

  const selected = vessels.find((v) => v.mmsi === selectedMmsi);

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Radar className="h-6 w-6 text-accent" />
            Operación VTS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Consola táctica de control de tráfico marítimo · IALA V-103 · Tick #{tickCount}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showLabels ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setShowLabels((v) => !v)}
          >
            <Layers className="h-3.5 w-3.5" />
            Etiquetas
          </Button>
          <Button
            variant={showTrails ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setShowTrails((v) => !v)}
          >
            <Crosshair className="h-3.5 w-3.5" />
            Estelas
          </Button>
        </div>
      </div>

      {/* Tactical view */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Map */}
        <Card className="xl:col-span-3 overflow-hidden">
          <CardContent className="p-0">
            <TacticalMap
              vessels={filtered}
              selectedMmsi={selectedMmsi}
              onSelect={setSelectedMmsi}
              showLabels={showLabels}
              showTrails={showTrails}
            />
          </CardContent>
        </Card>

        {/* Vessel list */}
        <Card className="xl:col-span-1 flex flex-col">
          <CardHeader className="pb-3 space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Ship className="h-4 w-4 text-accent" />
                Buques
                <Badge variant="secondary" className="text-[10px]">{filtered.length}</Badge>
              </CardTitle>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, MMSI, destino…"
                className="h-8 pl-7 text-xs"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                { v: "all", l: "Todos" },
                { v: "high", l: "Riesgo" },
                { v: "underway", l: "En ruta" },
                { v: "cargo", l: "Carga" },
                { v: "tanker", l: "Petrolero" },
                { v: "fishing", l: "Pesca" },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setFilter(opt.v)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-medium border transition-colors",
                    filter === opt.v
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-0 flex-1 overflow-hidden">
            <div className="max-h-[480px] overflow-y-auto scrollbar-thin space-y-1 pr-1">
              {filtered.map((v) => {
                const isSelected = v.mmsi === selectedMmsi;
                const color = VESSEL_COLORS[v.type];
                return (
                  <button
                    key={v.mmsi}
                    onClick={() => setSelectedMmsi(isSelected ? null : v.mmsi)}
                    className={cn(
                      "w-full text-left px-2.5 py-2 rounded-md border text-xs transition-colors",
                      isSelected
                        ? "border-accent bg-accent/5"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ background: color }}
                      />
                      <span className="font-semibold truncate flex-1">{v.name}</span>
                      {v.risk === "high" && (
                        <span className="text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                      <span className="font-mono-tabular">{v.mmsi}</span>
                      <span>{VESSEL_TYPE_LABELS[v.type]}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <span className="font-mono-tabular">{v.sogKn}kn</span>
                      <span>·</span>
                      <span className="font-mono-tabular">{v.cogDeg}°</span>
                      <span>·</span>
                      <span className="truncate">{v.zone}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected vessel + alerts + comms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Selected vessel detail */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-accent" />
              {selected ? "Buque Seleccionado" : "Sin selección"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {selected ? (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: VESSEL_COLORS[selected.type] }}
                    />
                    <span className="font-bold text-sm">{selected.name}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono-tabular">
                    MMSI {selected.mmsi} · IMO {selected.imo} · {selected.flag}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <DetailItem label="Tipo" value={VESSEL_TYPE_LABELS[selected.type]} />
                  <DetailItem label="Eslora" value={`${selected.lengthM} m`} />
                  <DetailItem label="Calado" value={`${selected.draftM} m`} />
                  <DetailItem label="Estado" value={selected.status} />
                  <DetailItem label="Velocidad" value={`${selected.sogKn} kn`} mono />
                  <DetailItem label="Rumbo" value={`${selected.cogDeg}°`} mono />
                  <DetailItem label="Origen" value={selected.lastPort} />
                  <DetailItem label="Destino" value={selected.destination} />
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">ETA</div>
                  <div className="text-sm font-mono-tabular font-semibold">{selected.eta}</div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Button size="sm" variant="default" className="gap-1.5 text-xs flex-1">
                    <Radio className="h-3 w-3" />
                    Contactar VHF
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    Histórico
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground text-center py-6">
                Seleccione un buque del mapa o lista para ver detalles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active alerts */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Panel de Alertas
              <Badge variant="secondary" className="text-[10px]">{alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-[360px] overflow-y-auto scrollbar-thin space-y-2 pr-1">
              {alerts.map((alert) => {
                const cfg = SEVERITY_CONFIG[alert.severity];
                return (
                  <div key={alert.id} className={cn("rounded-md border p-2.5", cfg.bg)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        alert.severity === "critical" ? "bg-destructive" : alert.severity === "warning" ? "bg-amber-500" : "bg-accent",
                        alert.severity === "critical" && !alert.acknowledged && "blink",
                      )} />
                      <span className="font-semibold text-xs flex-1 truncate">{alert.title}</span>
                      <Badge variant="outline" className={cn("text-[9px] font-mono-tabular", cfg.color)}>
                        {alert.source}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {alert.description}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 text-[10px]">
                      <span className="text-muted-foreground font-mono-tabular">
                        {alert.zone} · {fmtTime(alert.issuedAt)}
                      </span>
                      {alert.acknowledged ? (
                        <span className={cn("flex items-center gap-1 font-medium", cfg.color)}>
                          <CheckCircle2 className="h-3 w-3" />
                          Reconocida
                        </span>
                      ) : (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="text-[10px] text-accent hover:underline font-medium"
                        >
                          Reconocer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* PTT communications */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="h-4 w-4 text-accent" />
              Transcripción PTT · VHF
              <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot" />
                EN VIVO
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-[360px] overflow-y-auto scrollbar-thin space-y-1.5 pr-1 font-mono-tabular text-[11px]">
              <PttEntry time="07:42:18" channel="16" speaker="Cap. Puerto VAP" msg="Pacific Star, autorizado zarpe rumbo 180, velocidad máxima 12 nudos en zona TSS." />
              <PttEntry time="07:42:32" channel="16" speaker="M/V Pacific Star" msg="Entendido, autorizado zarpe. Rumbo 180, velocidad 12 nudos. Cambio." />
              <PttEntry time="07:38:01" channel="13" speaker="SERVIMET" msg="Aviso meteorológico: viento sur 38 nudos en Castro. Cierre temporal puerto." />
              <PttEntry time="07:31:48" channel="16" speaker="Práctico VAP" msg="Capitanía, Nordic Breeze atracado sitio 4 ESPB. Maniobra completa." />
              <PttEntry time="07:15:30" channel="16" speaker="Sistema VTS" msg="Detección automática: Don Matías en zona de fondeo prohibido Talcahuano." />
              <PttEntry time="07:08:14" channel="09" speaker="Remolcador Bahía" msg="Confirmado asistencia a M/V Beagle en zona de maniobra." />
              <PttEntry time="07:02:11" channel="16" speaker="Práctico VAP" msg="Nordic Breeze, comience aproximación a sitio 4 con rumbo 095." />
              <PttEntry time="06:55:43" channel="13" speaker="Gobernación Puerto Montt" msg="Restricción de calado a 8 metros activada. Resolver EXENTA 1247/26." />
            </div>
            <div className="pt-2 mt-2 border-t border-border flex items-center gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 text-[11px] flex-1">
                <Volume2 className="h-3 w-3" />
                Reproducir última
              </Button>
              <Button size="sm" variant="default" className="gap-1.5 text-[11px]">
                PTT
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className={cn("text-sm", mono && "font-mono-tabular")}>{value}</div>
    </div>
  );
}

function PttEntry({ time, channel, speaker, msg }: { time: string; channel: string; speaker: string; msg: string }) {
  return (
    <div className="px-2 py-1.5 rounded border border-border/50 bg-muted/30 hover:bg-muted/60 transition-colors">
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-[9px] text-muted-foreground">{time}</span>
        <span className="text-[9px] px-1 rounded bg-accent/20 text-accent font-semibold">CH{channel}</span>
        <span className="text-[10px] font-semibold text-foreground">{speaker}</span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-snug">{msg}</p>
    </div>
  );
}

// Tactical map with vessel positions
function TacticalMap({
  vessels,
  selectedMmsi,
  onSelect,
  showLabels,
  showTrails,
}: {
  vessels: Vessel[];
  selectedMmsi: string | null;
  onSelect: (mmsi: string) => void;
  showLabels: boolean;
  showTrails: boolean;
}) {
  // Project lat/lng to SVG coordinates
  const project = (lat: number, lng: number) => {
    const x = ((lng - (-75)) / ((-69) - (-75))) * 100;
    const y = ((lat - (-17)) / ((-56) - (-17))) * 100;
    return { x, y };
  };

  return (
    <div className="relative aspect-[3/4] sm:aspect-[2/3] max-h-[640px] bg-grid-pattern">
      <svg viewBox="0 0 100 130" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* ZEE */}
        <path
          d="M 75 5 L 30 5 L 30 125 L 45 125 L 50 115 L 55 105 L 50 95 L 48 85 L 50 75 L 52 65 L 50 55 L 48 45 L 50 35 L 55 25 L 65 15 L 75 5 Z"
          fill="oklch(0.62 0.13 185 / 0.06)"
          stroke="oklch(0.62 0.13 185 / 0.5)"
          strokeWidth="0.3"
          strokeDasharray="1.5 1"
        />

        {/* Costa */}
        <path
          d="M 75 5 L 65 15 L 55 25 L 50 35 L 48 45 L 50 55 L 52 65 L 50 75 L 48 85 L 50 95 L 55 105 L 50 115 L 45 125"
          fill="oklch(0.92 0.01 180 / 0.4)"
          stroke="oklch(0.3 0.04 200)"
          strokeWidth="0.4"
        />

        {/* Puertos */}
        {PORTS.map((port) => {
          const { x, y } = project(port.lat, port.lng);
          const color = port.status === "open" ? "oklch(0.7 0.18 145)" : port.status === "restricted" ? "oklch(0.75 0.16 70)" : "oklch(0.6 0.22 25)";
          return (
            <g key={port.code}>
              {port.status !== "open" && (
                <circle cx={x} cy={y} r="2.5" fill={color} opacity="0.3">
                  <animate attributeName="r" values="1.5;3.5;1.5" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={y} r="0.8" fill={color} stroke="white" strokeWidth="0.2" />
              {showLabels && (
                <text x={x + 1.5} y={y + 0.5} className="text-[1.5px]" fill="currentColor" opacity="0.6">
                  {port.name}
                </text>
              )}
            </g>
          );
        })}

        {/* Buques */}
        {vessels.map((v) => {
          const { x, y } = project(v.lat, v.lng);
          const color = VESSEL_COLORS[v.type];
          const isSelected = v.mmsi === selectedMmsi;
          const isHigh = v.risk === "high";

          // Arrow direction based on COG
          const rad = (v.cogDeg * Math.PI) / 180;
          const arrowLen = v.sogKn > 0 ? 2 : 0;
          const ax = x + Math.sin(rad) * arrowLen;
          const ay = y - Math.cos(rad) * arrowLen;

          return (
            <g key={v.mmsi} className="cursor-pointer" onClick={() => onSelect(v.mmsi)}>
              {/* Trail */}
              {showTrails && v.sogKn > 0 && (
                <line
                  x1={x - Math.sin(rad) * 3}
                  y1={y + Math.cos(rad) * 3}
                  x2={x}
                  y2={y}
                  stroke={color}
                  strokeWidth="0.15"
                  opacity="0.3"
                  strokeDasharray="0.5 0.5"
                />
              )}

              {/* Selection ring */}
              {isSelected && (
                <circle cx={x} cy={y} r="3" fill="none" stroke="oklch(0.62 0.13 185)" strokeWidth="0.4">
                  <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* High risk pulse */}
              {isHigh && (
                <circle cx={x} cy={y} r="2" fill="oklch(0.6 0.22 25)" opacity="0.4">
                  <animate attributeName="r" values="1;3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Velocity vector */}
              {v.sogKn > 0 && (
                <line
                  x1={x}
                  y1={y}
                  x2={ax}
                  y2={ay}
                  stroke={color}
                  strokeWidth="0.3"
                />
              )}

              {/* Vessel marker (triangle) */}
              <polygon
                points={`${x},${y - 0.8} ${x - 0.5},${y + 0.5} ${x + 0.5},${y + 0.5}`}
                fill={color}
                stroke={isSelected ? "white" : "oklch(0.2 0.02 200)"}
                strokeWidth={isSelected ? "0.2" : "0.1"}
                transform={`rotate(${v.cogDeg} ${x} ${y})`}
              />

              {showLabels && (isSelected || isHigh) && (
                <text
                  x={x + 1.5}
                  y={y - 0.8}
                  className="text-[1.5px]"
                  fill={isHigh ? "oklch(0.6 0.22 25)" : "currentColor"}
                  opacity="0.85"
                  fontWeight="600"
                >
                  {v.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Overlay HUD */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px]">
        <div className="bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 border border-border">
          <div className="flex items-center gap-1.5">
            <Radar className="h-3 w-3 text-accent" />
            <span className="font-mono-tabular font-semibold">VTS · CHILE</span>
          </div>
        </div>
        <div className="bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 border border-border flex items-center gap-3 font-mono-tabular">
          <span><Wind className="inline h-3 w-3 mr-0.5" />SERVIMET</span>
          <span><Filter className="inline h-3 w-3 mr-0.5" />{vessels.length} targets</span>
        </div>
      </div>

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px]">
        <div className="bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 border border-border">
          <div className="text-[8px] text-muted-foreground mb-0.5">Tipos</div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {Object.entries(VESSEL_COLORS).slice(0, 4).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                <span className="text-[9px]">{VESSEL_TYPE_LABELS[type as Vessel["type"]]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 border border-border font-mono-tabular">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot" />
            <span className="text-[9px]">AIS Activo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
