"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
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
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair as CenterIcon,
  Palette,
  Camera,
  Video,
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
  CAMARAS,
  ZONAS_MARITIMAS,
  ALL_REGIONS_FILTER,
  fmtTime,
  type Vessel,
  type MaritimeAlert,
  type Camara,
} from "@/lib/directemar-data";
import { RegionFilter } from "@/components/directemar/region-filter";

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
  // Generar buques dinámicos (datos que cambian cada carga)
  const [vessels, setVessels] = useState<Vessel[]>(() => generateVessels(18 + Math.floor(Math.random() * 8), true));
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [alerts, setAlerts] = useState<MaritimeAlert[]>(INITIAL_ALERTS);
  const [tickCount, setTickCount] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showPalette, setShowPalette] = useState(false);
  const [zonaFilter, setZonaFilter] = useState<string>(ALL_REGIONS_FILTER);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [lastRefresh, setLastRefresh] = useState<string>(new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

  // Refrescar datos AIS cada 30 segundos (datos completamente nuevos)
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        setVessels(generateVessels(18 + Math.floor(Math.random() * 8), true));
        setLastRefresh(new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      } catch {
        // Si falla, mantener datos actuales
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Movimiento de buques cada 2 segundos (animación suave)
  useEffect(() => {
    if (vessels.length === 0) return;
    const interval = setInterval(() => {
      setVessels((prev) => prev.map(moveVessel));
      setTickCount((t) => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [vessels.length]);

  // Filtrar alertas por zona marítima
  const filteredAlerts = useMemo(() => {
    if (zonaFilter === ALL_REGIONS_FILTER) return alerts;
    return alerts.filter((a) => a.zonaMaritima === zonaFilter);
  }, [alerts, zonaFilter]);

  const filtered = useMemo(() => {
    // Primero filtra por zona marítima
    let v = vessels;
    if (zonaFilter !== ALL_REGIONS_FILTER) {
      v = v.filter((x) => x.zonaMaritima === zonaFilter);
    }
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
  }, [vessels, filter, search, zonaFilter]);

  const selected = vessels.find((v) => v.mmsi === selectedMmsi);

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Radar className="h-6 w-6 text-accent" />
            Operación VTS
          </h1>
          <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-accent/90">
            Software de Control de Tráfico Marítimo e Integrador de Radar AIS y Cámaras
          </p>
          <p className="text-xs text-muted-foreground">
            Consola táctica · IALA V-103 · Tick #{tickCount}
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
          {/* Selector Paleta — estilo toggle compacto (círculo + icono) */}
          <button
            onClick={() => setShowPalette((v) => !v)}
            aria-label="Alternar paleta de colores"
            aria-pressed={showPalette}
            className={cn(
              "h-9 w-auto flex items-center gap-2 pl-1 pr-3 rounded-md border transition-all",
              showPalette
                ? "border-accent bg-accent/10 shadow-sm"
                : "border-border hover:border-accent/50 hover:bg-muted/30",
            )}
          >
            {/* Círculo de color sólido (estado activo) */}
            <span
              className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center transition-all",
                showPalette ? "scale-110" : "scale-100",
              )}
              style={{
                background: showPalette
                  ? "radial-gradient(circle at 30% 30%, #5dd5e0, #1a3a5c 70%)"
                  : "radial-gradient(circle at 30% 30%, #4a5a6c, #1a1a1a 70%)",
                boxShadow: showPalette ? "0 0 8px rgba(62, 132, 138, 0.5)" : "none",
              }}
            />
            {/* Icono paleta outline */}
            <Palette
              className={cn(
                "h-4 w-4 transition-colors",
                showPalette ? "text-accent" : "text-muted-foreground",
              )}
              strokeWidth={1.5}
            />
            <span className={cn("text-xs font-medium", showPalette ? "text-accent" : "text-muted-foreground")}>
              Paleta
            </span>
          </button>
        </div>
      </div>

      {/* Region filter */}
      <RegionFilter value={zonaFilter} onChange={setZonaFilter} variant="full" />

      {/* Color palette panel */}
      {showPalette && <ColorPalettePanel />}

      {/* Tactical view */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Map */}
        <Card className="xl:col-span-3 overflow-hidden border-cyan-500/20 flex flex-col">
          <CardContent className="p-0 flex-1">
            <TacticalMap
              vessels={filtered}
              selectedMmsi={selectedMmsi}
              onSelect={setSelectedMmsi}
              showLabels={showLabels}
              showTrails={showTrails}
              zoom={zoom}
              onZoomChange={setZoom}
              pan={pan}
              onPanChange={setPan}
              lastRefresh={lastRefresh}
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

      {/* CCTV integrator panel */}
      <CctvPanel
        vessels={filtered}
        selectedMmsi={selectedMmsi}
        zonaFilter={zonaFilter}
      />

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
              <Badge variant="secondary" className="text-[10px]">{filteredAlerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-[360px] overflow-y-auto scrollbar-thin space-y-2 pr-1">
              {filteredAlerts.map((alert) => {
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
  zoom,
  onZoomChange,
  pan,
  onPanChange,
  lastRefresh,
}: {
  vessels: Vessel[];
  selectedMmsi: string | null;
  onSelect: (mmsi: string) => void;
  showLabels: boolean;
  showTrails: boolean;
  zoom: number;
  onZoomChange: (z: number) => void;
  pan: { x: number; y: number };
  onPanChange: (p: { x: number; y: number }) => void;
  lastRefresh?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: string; lng: string } | null>(null);

  const project = useCallback((lat: number, lng: number) => {
    const baseX = ((lng - (-75)) / ((-69) - (-75))) * 100;
    const baseY = ((lat - (-17)) / ((-56) - (-17))) * 100;
    const cx = 50;
    const cy = 65;
    const x = cx + (baseX - cx) * zoom + pan.x;
    const y = cy + (baseY - cy) * zoom + pan.y;
    return { x, y };
  }, [zoom, pan]);

  const unproject = useCallback((sx: number, sy: number) => {
    const cx = 50;
    const cy = 65;
    const baseX = (sx - cx - pan.x) / zoom + cx;
    const baseY = (sy - cy - pan.y) / zoom + cy;
    const lng = -75 + (baseX / 100) * ((-69) - (-75));
    const lat = -17 + (baseY / 100) * ((-56) - (-17));
    return { lat, lng };
  }, [zoom, pan]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    const newZoom = Math.max(0.5, Math.min(6, zoom + delta));
    onZoomChange(Math.round(newZoom * 100) / 100);
  }, [zoom, onZoomChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const dx = (e.clientX - dragStart.current.x) / 8;
      const dy = (e.clientY - dragStart.current.y) / 8;
      onPanChange({
        x: panStart.current.x + dx,
        y: panStart.current.y + dy,
      });
    }
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const sx = ((e.clientX - rect.left) / rect.width) * 100;
      const sy = ((e.clientY - rect.top) / rect.height) * 130;
      const { lat, lng } = unproject(sx, sy);
      if (lat >= -57 && lat <= -16 && lng >= -76 && lng <= -68) {
        setCoords({
          lat: lat.toFixed(4) + "°",
          lng: lng.toFixed(4) + "°",
        });
      } else {
        setCoords(null);
      }
    }
  }, [isDragging, onPanChange, unproject]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setHovered(null);
    setCoords(null);
  }, []);

  const zoomIn = () => onZoomChange(Math.min(6, Math.round((zoom + 0.5) * 100) / 100));
  const zoomOut = () => onZoomChange(Math.max(0.5, Math.round((zoom - 0.5) * 100) / 100));
  const resetView = () => {
    onZoomChange(1);
    onPanChange({ x: 0, y: 0 });
  };

  return (
    <div
      className="relative w-full h-[70vh] min-h-[500px] xl:h-[calc(100vh-220px)] overflow-hidden select-none"
      style={{
        background: "radial-gradient(ellipse at center, #0a1929 0%, #050d18 70%, #020608 100%)",
        cursor: isDragging ? "grabbing" : "crosshair",
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 130"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="vesselGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="vtsGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="radarGrid" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#1a3a5c" strokeWidth="0.08" opacity="0.4" />
          </pattern>
          <pattern id="radarGridMajor" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2a5a8c" strokeWidth="0.15" opacity="0.5" />
          </pattern>
          <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3e848a" stopOpacity="0" />
            <stop offset="100%" stopColor="#3e848a" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="vtsFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3e848a" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#3e848a" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Fondo con grids */}
        <rect x="0" y="0" width="100" height="130" fill="url(#radarGrid)" />
        <rect x="0" y="0" width="100" height="130" fill="url(#radarGridMajor)" />

        {/* === RNG (Range Rings) — anillos de distancia con etiquetas === */}
        {[8, 16, 24, 32, 40].map((r) => (
          <g key={`rng-${r}`}>
            <circle
              cx={50}
              cy={65}
              r={r}
              fill="none"
              stroke="#2a5a8c"
              strokeWidth="0.1"
              strokeDasharray="0.5 0.8"
              opacity="0.6"
            />
            {/* Etiqueta de distancia RNG */}
            <text
              x={50 + r + 0.5}
              y={65 + 0.4}
              fontSize="1.2"
              fill="#5dd5e0"
              opacity="0.7"
              fontFamily="monospace"
              fontWeight="600"
            >
              {Math.round(r * 2.5)}NM
            </text>
          </g>
        ))}

        {/* === BRG (Bearing lines) — líneas de azimut cada 30° === */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = i * 30;
          const rad = (angle * Math.PI) / 180;
          const len = 42;
          const ex = 50 + Math.sin(rad) * len;
          const ey = 65 - Math.cos(rad) * len;
          return (
            <g key={`brg-${angle}`}>
              <line
                x1={50}
                y1={65}
                x2={ex}
                y2={ey}
                stroke="#2a5a8c"
                strokeWidth="0.06"
                opacity="0.35"
                strokeDasharray="0.3 0.5"
              />
              {/* Etiqueta BRG en grados */}
              <text
                x={50 + Math.sin(rad) * (len + 2.5)}
                y={65 - Math.cos(rad) * (len + 2.5) + 0.4}
                fontSize="1"
                fill="#5dd5e0"
                opacity="0.6"
                fontFamily="monospace"
                textAnchor="middle"
                fontWeight="600"
              >
                {String(angle).padStart(3, "0")}
              </text>
            </g>
          );
        })}

        {/* Cross-hair central */}
        <line x1="0" y1="65" x2="100" y2="65" stroke="#2a5a8c" strokeWidth="0.08" strokeDasharray="0.4 0.6" opacity="0.4" />
        <line x1="50" y1="0" x2="50" y2="130" stroke="#2a5a8c" strokeWidth="0.08" strokeDasharray="0.4 0.6" opacity="0.4" />

        {/* === Zona VTS dibujada (sector de vigilancia) === */}
        <g filter="url(#vtsGlow)">
          {/* Sector VTS — polígono cubriendo el litoral chileno */}
          <path
            d="M 70 5 L 30 5 L 25 30 L 22 55 L 24 80 L 22 110 L 28 125 L 70 125 L 78 95 L 75 65 L 78 35 Z"
            fill="url(#vtsFill)"
            stroke="#3e848a"
            strokeWidth="0.3"
            strokeDasharray="0.8 0.4"
            opacity="0.7"
          />
          {/* Etiqueta VTS zona */}
          <text
            x={48}
            y={20}
            fontSize="1.5"
            fill="#3e848a"
            opacity="0.85"
            fontFamily="monospace"
            fontWeight="700"
            textAnchor="middle"
          >
            VTS · ZONA CONTROL
          </text>
          {/* Marca de límite VTS Norte */}
          <text
            x={28}
            y={8}
            fontSize="0.9"
            fill="#5dd5e0"
            opacity="0.7"
            fontFamily="monospace"
            fontWeight="600"
          >
            ◀ VTS-N
          </text>
          {/* Marca de límite VTS Sur */}
          <text
            x={28}
            y={123}
            fontSize="0.9"
            fill="#5dd5e0"
            opacity="0.7"
            fontFamily="monospace"
            fontWeight="600"
          >
            ◀ VTS-S
          </text>
        </g>

        {/* Costa — tierra */}
        <path
          d="M 75 5 L 65 15 L 55 25 L 50 35 L 48 45 L 50 55 L 52 65 L 50 75 L 48 85 L 50 95 L 55 105 L 50 115 L 45 125 L 100 125 L 100 5 Z"
          fill="#1a2a3a"
          stroke="#0a1525"
          strokeWidth="0.1"
        />
        <path
          d="M 75 5 L 65 15 L 55 25 L 50 35 L 48 45 L 50 55 L 52 65 L 50 75 L 48 85 L 50 95 L 55 105 L 50 115 L 45 125"
          fill="none"
          stroke="#3e848a"
          strokeWidth="0.25"
          opacity="0.8"
        />

        {/* === Radar sweep animado === */}
        <g style={{ transformOrigin: "50px 65px" }}>
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 65"
              to="360 50 65"
              dur="8s"
              repeatCount="indefinite"
            />
            <path
              d="M 50 65 L 50 25 A 40 40 0 0 1 78 35 Z"
              fill="url(#sweepGrad)"
              opacity="0.5"
            />
            <line x1="50" y1="65" x2="50" y2="25" stroke="#3e848a" strokeWidth="0.15" opacity="0.7" />
          </g>
        </g>

        {/* ZEE — Zona Económica Exclusiva */}
        <path
          d="M 75 5 L 30 5 L 30 125 L 45 125 L 50 115 L 55 105 L 50 95 L 48 85 L 50 75 L 52 65 L 50 55 L 48 45 L 50 35 L 55 25 L 65 15 L 75 5 Z"
          fill="oklch(0.62 0.13 185 / 0.05)"
          stroke="oklch(0.62 0.13 185 / 0.55)"
          strokeWidth="0.25"
          strokeDasharray="1.2 0.8"
        />

        {PORTS.map((port) => {
          const { x, y } = project(port.lat, port.lng);
          const color = port.status === "open" ? "#3fb950" : port.status === "restricted" ? "#d29922" : "#f85149";
          return (
            <g key={port.code}>
              {port.status !== "open" && (
                <circle cx={x} cy={y} r={1.5 / zoom} fill={color} opacity="0.3">
                  <animate attributeName="r" values={`${0.8 / zoom};${2.5 / zoom};${0.8 / zoom}`} dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <rect
                x={x - 0.5 / zoom}
                y={y - 0.5 / zoom}
                width={1 / zoom}
                height={1 / zoom}
                fill={color}
                stroke="#fff"
                strokeWidth={0.1 / zoom}
              />
              {showLabels && zoom > 1.2 && (
                <text
                  x={x + 1.2 / zoom}
                  y={y + 0.4 / zoom}
                  fontSize={1.2 / zoom}
                  fill="#c9d1d9"
                  opacity="0.75"
                  fontFamily="monospace"
                >
                  {port.name}
                </text>
              )}
            </g>
          );
        })}

        {vessels.map((v) => {
          const { x, y } = project(v.lat, v.lng);
          const color = VESSEL_COLORS[v.type];
          const isSelected = v.mmsi === selectedMmsi;
          const isHovered = v.mmsi === hovered;
          const isHigh = v.risk === "high";
          const sizeFactor = 1 / zoom;

          // VEC (Velocity Vector) — vector de velocidad con longitud proporcional al SOG
          // Estilo militar: línea sólida + punta de flecha + tiempo de proyección
          const rad = (v.cogDeg * Math.PI) / 180;
          const vecLength = v.sogKn > 0 ? Math.max(1.5, v.sogKn * 0.18) * (zoom > 1.5 ? 1.2 : 1) : 0;
          const vecX = x + Math.sin(rad) * vecLength;
          const vecY = y - Math.cos(rad) * vecLength;
          // Punta de flecha del VEC
          const arrowSize = 0.5 * sizeFactor;
          const arrowAngle1 = (v.cogDeg + 35) * Math.PI / 180;
          const arrowAngle2 = (v.cogDeg - 35) * Math.PI / 180;
          const a1x = vecX - Math.sin(arrowAngle1) * arrowSize * 2;
          const a1y = vecY + Math.cos(arrowAngle1) * arrowSize * 2;
          const a2x = vecX - Math.sin(arrowAngle2) * arrowSize * 2;
          const a2y = vecY + Math.cos(arrowAngle2) * arrowSize * 2;

          // TRK (Track label) — bloque de texto compacto con datos del track
          const showTrackLabel = showLabels || isHovered || isSelected || isHigh || zoom > 1.8;

          // Bearing desde el centro del radar al buque (para BRG label)
          const dx = x - 50;
          const dy = 65 - y;
          const bearing = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
          const range = Math.sqrt(dx * dx + dy * dy);

          return (
            <g
              key={v.mmsi}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(v.mmsi);
              }}
              onMouseEnter={() => setHovered(v.mmsi)}
              onMouseLeave={() => setHovered(null)}
              filter={isSelected ? "url(#vesselGlow)" : undefined}
            >
              {/* LIB (Limited Information Buffer) — halo tenue alrededor del target */}
              {v.sogKn > 0 && (
                <circle
                  cx={x}
                  cy={y}
                  r={1.5 * sizeFactor}
                  fill={color}
                  opacity="0.08"
                />
              )}

              {/* Estela / TRK trail (track history) */}
              {showTrails && v.sogKn > 0 && (
                <line
                  x1={x - Math.sin(rad) * 3}
                  y1={y + Math.cos(rad) * 3}
                  x2={x}
                  y2={y}
                  stroke={color}
                  strokeWidth={0.18 * sizeFactor}
                  opacity="0.4"
                  strokeDasharray="0.5 0.4"
                />
              )}

              {/* Selection ring (animado) */}
              {isSelected && (
                <circle cx={x} cy={y} r={2.5 * sizeFactor} fill="none" stroke="#5dd5e0" strokeWidth={0.4 * sizeFactor}>
                  <animate attributeName="r" values={`${1.5 * sizeFactor};${3.5 * sizeFactor};${1.5 * sizeFactor}`} dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Hover ring */}
              {isHovered && !isSelected && (
                <circle cx={x} cy={y} r={2 * sizeFactor} fill="none" stroke="#c9d1d9" strokeWidth={0.2 * sizeFactor} opacity="0.6" />
              )}

              {/* High risk pulse (rojo) */}
              {isHigh && (
                <circle cx={x} cy={y} r={1.8 * sizeFactor} fill="#f85149" opacity="0.35">
                  <animate attributeName="r" values={`${1 * sizeFactor};${3 * sizeFactor};${1 * sizeFactor}`} dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* === VEC (Velocity Vector) — vector de velocidad militar === */}
              {v.sogKn > 0 && (
                <g>
                  {/* Línea principal del vector */}
                  <line
                    x1={x}
                    y1={y}
                    x2={vecX}
                    y2={vecY}
                    stroke={isHigh ? "#f85149" : "#5dd5e0"}
                    strokeWidth={0.35 * sizeFactor}
                    opacity="0.85"
                  />
                  {/* Punta de flecha del VEC */}
                  <polygon
                    points={`${vecX},${vecY} ${a1x},${a1y} ${a2x},${a2y}`}
                    fill={isHigh ? "#f85149" : "#5dd5e0"}
                    opacity="0.9"
                  />
                  {/* Tick marks cada 6 minutos de proyección (estilo radar militar) */}
                  {[0.33, 0.66].map((t) => (
                    <line
                      key={t}
                      x1={x + Math.sin(rad) * vecLength * t - Math.cos(rad) * 0.3 * sizeFactor}
                      y1={y - Math.cos(rad) * vecLength * t - Math.sin(rad) * 0.3 * sizeFactor}
                      x2={x + Math.sin(rad) * vecLength * t + Math.cos(rad) * 0.3 * sizeFactor}
                      y2={y - Math.cos(rad) * vecLength * t + Math.sin(rad) * 0.3 * sizeFactor}
                      stroke={isHigh ? "#f85149" : "#5dd5e0"}
                      strokeWidth={0.15 * sizeFactor}
                      opacity="0.6"
                    />
                  ))}
                </g>
              )}

              {/* Marcador del buque — triángulo orientado por COG */}
              <polygon
                points={`0,${-1.2 * sizeFactor} ${-0.7 * sizeFactor},${0.7 * sizeFactor} ${0.7 * sizeFactor},${0.7 * sizeFactor}`}
                fill={color}
                stroke={isSelected ? "#ffffff" : "#0a1525"}
                strokeWidth={(isSelected ? 0.25 : 0.12) * sizeFactor}
                transform={`translate(${x} ${y}) rotate(${v.cogDeg})`}
              />

              {/* === TRK (Track Label) — bloque de datos tácticos === */}
              {showTrackLabel && (isSelected || isHovered || isHigh || zoom > 1.8) && (
                <g>
                  {/* Conector al track label */}
                  <line
                    x1={x}
                    y1={y}
                    x2={x + 2 * sizeFactor}
                    y2={y - 2 * sizeFactor}
                    stroke={isHigh ? "#f85149" : "#5dd5e0"}
                    strokeWidth={0.15 * sizeFactor}
                    opacity="0.6"
                  />
                  {/* Caja del track label */}
                  <rect
                    x={x + 2 * sizeFactor}
                    y={y - 3.5 * sizeFactor}
                    width={showLabels ? 14 / zoom : 11 / zoom}
                    height={3.5 * sizeFactor}
                    fill="#000000"
                    opacity="0.7"
                    stroke={isHigh ? "#f85149" : color}
                    strokeWidth={0.15 * sizeFactor}
                    rx="0.2"
                  />
                  {/* Nombre del buque */}
                  <text
                    x={x + 2.3 * sizeFactor}
                    y={y - 2.2 * sizeFactor}
                    fontSize={1.1 / zoom}
                    fill={isHigh ? "#f85149" : "#ffffff"}
                    fontFamily="monospace"
                    fontWeight="700"
                  >
                    {v.name.slice(0, 14)}
                  </text>
                  {/* Datos: SOG · COG · BRG · RNG */}
                  <text
                    x={x + 2.3 * sizeFactor}
                    y={y - 1.1 * sizeFactor}
                    fontSize={0.9 / zoom}
                    fill="#5dd5e0"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {v.sogKn}KN {String(v.cogDeg).padStart(3, "0")}°
                  </text>
                  {/* BRG y RNG desde el centro VTS */}
                  {(isSelected || isHovered) && (
                    <text
                      x={x + 2.3 * sizeFactor}
                      y={y - 0.4 * sizeFactor}
                      fontSize={0.85 / zoom}
                      fill="#8b949e"
                      fontFamily="monospace"
                    >
                      BRG {String(Math.round(bearing)).padStart(3, "0")}° RNG {Math.round(range * 2.5)}NM
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-2.5 py-1.5 border border-cyan-500/30">
        <div className="flex items-center gap-1.5">
          <Radar className="h-3 w-3 text-cyan-400" />
          <span className="font-mono text-[10px] font-bold text-cyan-400 tracking-wider">VTS · CHL</span>
          <span className="text-[8px] text-cyan-400/60 font-mono">|</span>
          <span className="text-[8px] text-cyan-400/60 font-mono">IALA V-103</span>
        </div>
        <div className="text-[8px] text-cyan-400/60 font-mono mt-0.5">
          ARMADA DE CHILE · DIRECTEMAR
        </div>
      </div>

      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-md px-2.5 py-1.5 border border-cyan-500/30 font-mono text-[9px]">
        <div className="flex items-center gap-2 text-cyan-300">
          <span className="flex items-center gap-0.5">
            <Filter className="h-2.5 w-2.5" />
            <span className="font-bold text-white">{vessels.length}</span>
            <span className="text-cyan-400/60">targets</span>
          </span>
        </div>
        {coords && (
          <div className="mt-0.5 text-cyan-400/80">
            <div>LAT {coords.lat}</div>
            <div>LNG {coords.lng}</div>
          </div>
        )}
      </div>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        <button
          onClick={zoomIn}
          disabled={zoom >= 6}
          className="h-7 w-7 rounded-md bg-black/60 backdrop-blur-sm border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors text-cyan-400 flex items-center justify-center disabled:opacity-30"
          aria-label="Acercar"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={zoomOut}
          disabled={zoom <= 0.5}
          className="h-7 w-7 rounded-md bg-black/60 backdrop-blur-sm border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors text-cyan-400 flex items-center justify-center disabled:opacity-30"
          aria-label="Alejar"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={resetView}
          className="h-7 w-7 rounded-md bg-black/60 backdrop-blur-sm border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors text-cyan-400 flex items-center justify-center"
          aria-label="Centrar"
        >
          <CenterIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-2.5 py-1.5 border border-cyan-500/30">
        <div className="text-[8px] text-cyan-400/70 font-mono uppercase tracking-wider mb-1">Tipos de Buque</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          {Object.entries(VESSEL_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-sm" style={{ background: color }} />
              <span className="text-[8px] text-cyan-100/90 font-mono">{VESSEL_TYPE_LABELS[type as Vessel["type"]]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* === Leyenda militar: RNG / BRG / VEC / TRK / LIB === */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-md px-3 py-1.5 border border-cyan-500/30 hidden md:block">
        <div className="text-[8px] text-cyan-400/70 font-mono uppercase tracking-wider mb-1 text-center">Anotaciones Tácticas</div>
        <div className="flex items-center gap-3 text-[9px] font-mono">
          <span className="flex items-center gap-1 text-cyan-300">
            <span className="inline-block w-3 h-3 rounded-full border border-dashed border-cyan-400/60" />
            <span><strong className="text-white">RNG</strong> Range</span>
          </span>
          <span className="text-cyan-500/40">·</span>
          <span className="flex items-center gap-1 text-cyan-300">
            <span className="inline-block w-3 h-px bg-cyan-400/60" style={{ transform: "rotate(30deg)" }} />
            <span><strong className="text-white">BRG</strong> Bearing</span>
          </span>
          <span className="text-cyan-500/40">·</span>
          <span className="flex items-center gap-1 text-cyan-300">
            <span className="inline-block w-3 h-2" style={{
              background: "linear-gradient(90deg, transparent 0%, #5dd5e0 100%)",
              clipPath: "polygon(0 40%, 80% 40%, 100% 50%, 80% 60%, 0 60%)",
            }} />
            <span><strong className="text-white">VEC</strong> Vector</span>
          </span>
          <span className="text-cyan-500/40">·</span>
          <span className="flex items-center gap-1 text-cyan-300">
            <span className="inline-block w-2.5 h-2 border border-cyan-400 bg-black/60" />
            <span><strong className="text-white">TRK</strong> Track</span>
          </span>
          <span className="text-cyan-500/40">·</span>
          <span className="flex items-center gap-1 text-cyan-300">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400/15" />
            <span><strong className="text-white">LIB</strong> Buffer</span>
          </span>
        </div>
      </div>

      <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
        <div className="bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 border border-cyan-500/30 font-mono text-[9px] text-cyan-400">
          ZOOM <span className="text-white font-bold">{zoom.toFixed(2)}x</span>
        </div>
        <div className="bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 border border-emerald-500/30 font-mono text-[9px]">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-emerald-400">AIS LIVE</span>
          </div>
          {lastRefresh && (
            <div className="text-emerald-400/60 mt-0.5">
              ÚPDATE {lastRefresh}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-md px-2.5 py-1 border border-cyan-500/30 hidden md:block">
        <div className="flex items-center gap-3 text-[8px] font-mono">
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            RADAR
          </span>
          <span className="text-cyan-400/40">|</span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            AIS
          </span>
          <span className="text-cyan-400/40">|</span>
          <span className="flex items-center gap-1 text-cyan-400">
            <Camera className="h-2.5 w-2.5" />
            CAM-01
          </span>
          <span className="text-cyan-400/40">|</span>
          <span className="flex items-center gap-1 text-cyan-400">
            <Video className="h-2.5 w-2.5" />
            CAM-02
          </span>
        </div>
      </div>

      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, transparent 48%, rgba(62, 132, 138, 0.4) 50%, transparent 52%, transparent 100%)",
          backgroundSize: "100% 8px",
          animation: "scanlines 8s linear infinite",
        }}
      />
      <style>{`
        @keyframes scanlines {
          0% { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }
      `}</style>
    </div>
  );
}

// === CCTV Panel — Integrator of cameras synced with radar ===
function CctvPanel({
  vessels,
  selectedMmsi,
  zonaFilter,
}: {
  vessels: Vessel[];
  selectedMmsi: string | null;
  zonaFilter: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const [primaryCam, setPrimaryCam] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Tick for simulated live feed indicators
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  // Filter cameras by zone
  const camaras = useMemo(() => {
    if (zonaFilter === ALL_REGIONS_FILTER) return CAMARAS;
    return CAMARAS.filter((c) => c.zonaMaritima === zonaFilter);
  }, [zonaFilter]);

  // Selected vessel for tracking
  const selectedVessel = vessels.find((v) => v.mmsi === selectedMmsi);

  // When a vessel is selected, find the closest camera and mark as tracking
  const trackingCams = useMemo(() => {
    if (!selectedVessel) return new Set<string>();
    const nearby = camaras
      .filter((c) => c.status !== "offline")
      .map((c) => ({
        cam: c,
        dist: Math.sqrt(
          Math.pow(c.lat - selectedVessel.lat, 2) +
            Math.pow(c.lng - selectedVessel.lng, 2),
        ),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 2);
    return new Set(nearby.map((n) => n.cam.id));
  }, [selectedVessel, camaras]);

  const online = camaras.filter((c) => c.status !== "offline").length;
  const offline = camaras.filter((c) => c.status === "offline").length;
  const recording = camaras.filter((c) => c.status === "recording").length;
  const ptzTracking = camaras.filter((c) => c.status === "ptz-tracking" || trackingCams.has(c.id)).length;

  const now = new Date();
  const timestamp = now.toLocaleString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  return (
    <Card className="border-cyan-500/30 bg-black">
      <CardHeader className="pb-3 border-b border-cyan-500/20 bg-gradient-to-r from-[#0a1929] to-[#050d18]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Video className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-bold text-cyan-400 tracking-wide font-mono">
                CCTV · INTEGRADOR DE CÁMARAS
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono-tabular bg-cyan-500/10 border-cyan-500/30 text-cyan-300">
              {camaras.length} cámaras
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                {online} ONLINE
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 pulse-dot" />
                {recording} REC
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 pulse-dot" />
                {ptzTracking} PTZ
              </span>
              {offline > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                  {offline} OFF
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded((v) => !v)}
              className="text-cyan-400 hover:bg-cyan-500/10 text-xs"
            >
              {expanded ? "Contraer" : "Expandir"}
            </Button>
          </div>
        </div>
        <div className="text-[10px] font-mono text-cyan-400/60 mt-1">
          {timestamp} · Sincronizado con radar táctico · IALA V-103
          {selectedVessel && (
            <span className="text-cyan-300 ml-2">
              · Trackeando: <strong>{selectedVessel.name}</strong> (MMSI {selectedVessel.mmsi})
            </span>
          )}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="p-3 space-y-3 bg-[#020608]">
          {/* Grid 2x4 (8 cámaras) o 2x2 si hay pocas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {camaras.map((cam) => (
              <CameraFeed
                key={cam.id}
                cam={cam}
                vessel={selectedVessel}
                isTracking={trackingCams.has(cam.id)}
                isPrimary={primaryCam === cam.id}
                onSelect={() => setPrimaryCam(primaryCam === cam.id ? null : cam.id)}
                tick={tick}
              />
            ))}
          </div>

          {/* Bottom bar: camera info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-cyan-500/20">
            <div className="bg-[#0a1929] rounded p-2 border border-cyan-500/20">
              <div className="text-[9px] uppercase tracking-wider text-cyan-400/60 font-mono mb-1">Resolución promedio</div>
              <div className="text-xs font-mono font-bold text-cyan-300">4K · 30 FPS</div>
            </div>
            <div className="bg-[#0a1929] rounded p-2 border border-cyan-500/20">
              <div className="text-[9px] uppercase tracking-wider text-cyan-400/60 font-mono mb-1">Latencia</div>
              <div className="text-xs font-mono font-bold text-cyan-300">142 ms</div>
            </div>
            <div className="bg-[#0a1929] rounded p-2 border border-cyan-500/20">
              <div className="text-[9px] uppercase tracking-wider text-cyan-400/60 font-mono mb-1">Almacenamiento</div>
              <div className="text-xs font-mono font-bold text-cyan-300">7 días · 24/7</div>
            </div>
            <div className="bg-[#0a1929] rounded p-2 border border-cyan-500/20">
              <div className="text-[9px] uppercase tracking-wider text-cyan-400/60 font-mono mb-1">Visión nocturna IR</div>
              <div className="text-xs font-mono font-bold text-cyan-300">
                {camaras.filter((c) => c.irNight).length}/{camaras.length} activas
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function CameraFeed({
  cam,
  vessel,
  isTracking,
  isPrimary,
  onSelect,
  tick,
}: {
  cam: Camara;
  vessel?: Vessel;
  isTracking: boolean;
  isPrimary: boolean;
  onSelect: () => void;
  tick: number;
}) {
  const isOffline = cam.status === "offline";
  const isRecording = cam.status === "recording" || (isTracking && !isOffline);
  const showIr = isOffline ? false : (new Date().getHours() >= 19 || new Date().getHours() < 6) && cam.irNight;

  // Simular buque visible en feed cuando trackea
  const showVesselInFeed = isTracking && vessel;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative aspect-video rounded overflow-hidden border transition-all text-left",
        isOffline
          ? "border-destructive/40 bg-[#0a0a0a]"
          : isPrimary
          ? "border-accent ring-2 ring-accent/40 bg-[#0a1929]"
          : isTracking
          ? "border-amber-500/60 ring-1 ring-amber-500/30 bg-[#0a1929]"
          : "border-cyan-500/20 hover:border-cyan-500/50 bg-[#0a1929]",
      )}
    >
      {/* Simulated camera feed */}
      <div
        className="absolute inset-0"
        style={{
          background: isOffline
            ? "repeating-linear-gradient(45deg, #1a1a1a, #1a1a1a 4px, #0a0a0a 4px, #0a0a0a 8px)"
            : showIr
            ? "radial-gradient(circle at 50% 50%, rgba(255,200,100,0.15), rgba(0,0,0,0.9) 80%)"
            : "linear-gradient(180deg, #1a3a5c 0%, #0a1929 50%, #020608 100%)",
        }}
      />

      {/* Water surface simulation (when not offline) */}
      {!isOffline && (
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-x-0 bottom-0 h-1/2"
            style={{
              background: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(62, 132, 138, 0.15) 2px, rgba(62, 132, 138, 0.15) 3px)",
              animation: `water-${cam.id} ${3 + (parseInt(cam.id.slice(-1)) % 3)}s ease-in-out infinite`,
            }}
          />
          <style>{`
            @keyframes water-${cam.id} {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-2px); }
            }
          `}</style>
        </div>
      )}

      {/* Vessel marker in feed when tracking */}
      {showVesselInFeed && (
        <div className="absolute" style={{ left: "30%", top: "45%" }}>
          <div className="relative">
            {/* Crosshair tracking */}
            <svg width="40" height="40" viewBox="0 0 40 40" className="absolute -inset-2">
              <line x1="20" y1="0" x2="20" y2="14" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="20" y1="26" x2="20" y2="40" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="0" y1="20" x2="14" y2="20" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="26" y1="20" x2="40" y2="20" stroke="#f59e0b" strokeWidth="1.5" />
              <rect x="14" y="14" width="12" height="12" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            </svg>
            {/* Vessel silhouette */}
            <div
              className="w-3 h-6 bg-cyan-300"
              style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
            />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono text-amber-400 whitespace-nowrap">
              {vessel?.name.slice(0, 12)}
            </div>
          </div>
        </div>
      )}

      {/* Scanlines overlay (CRT effect) */}
      {!isOffline && (
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: "repeating-linear-gradient(0deg, transparent 0, transparent 1px, rgba(255,255,255,0.3) 1px, rgba(255,255,255,0.3) 2px)",
          }}
        />
      )}

      {/* HUD overlay */}
      <div className="absolute top-1 left-1 right-1 flex items-center justify-between text-[8px] font-mono">
        <span className={cn(
          "px-1 rounded font-bold",
          isOffline ? "bg-destructive/30 text-destructive" : "bg-black/60 text-cyan-300",
        )}>
          {cam.id}
        </span>
        <span className={cn("font-bold", isOffline ? "text-destructive" : "text-cyan-300")}>
          {cam.type}
        </span>
      </div>

      <div className="absolute bottom-1 left-1 right-1 flex items-end justify-between text-[8px] font-mono">
        <div className={cn(
          "px-1 rounded max-w-[70%]",
          isOffline ? "text-destructive" : "text-cyan-300 bg-black/60",
        )}>
          {cam.name}
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className={cn("px-1 rounded bg-black/60", isOffline ? "text-destructive" : "text-cyan-300")}>
            {cam.resolution}
          </span>
          {isRecording && (
            <span className="flex items-center gap-0.5 px-1 rounded bg-red-900/60 text-red-400">
              <span className="h-1 w-1 rounded-full bg-red-500 pulse-dot" />
              REC
            </span>
          )}
          {showIr && (
            <span className="px-1 rounded bg-amber-900/40 text-amber-400">IR</span>
          )}
          {isTracking && (
            <span className="flex items-center gap-0.5 px-1 rounded bg-amber-900/40 text-amber-400">
              <Crosshair className="h-1.5 w-1.5" />
              PTZ
            </span>
          )}
        </div>
      </div>

      {/* Live timestamp */}
      {!isOffline && (
        <div className="absolute top-1 right-1 mt-3 mr-1 text-[7px] font-mono text-cyan-400/70">
          {new Date(Date.now() + tick * 1000).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
      )}

      {/* Offline message */}
      {isOffline && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-destructive text-[10px] font-bold font-mono mb-1">SEÑAL PERDIDA</div>
            <div className="text-destructive/60 text-[8px] font-mono">{cam.lastMotion}</div>
          </div>
        </div>
      )}

      {/* Primary indicator */}
      {isPrimary && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 mt-7 px-1.5 py-0.5 rounded bg-accent text-accent-foreground text-[8px] font-mono font-bold">
          PRIMARIO
        </div>
      )}
    </button>
  );
}

function ColorPalettePanel() {
  // Temas cromáticos predefinidos estilo "DISEÑO VISUAL" de la imagen
  const [selectedTheme, setSelectedTheme] = useState<string>("maritimo-profundo");

  const themes: Array<{
    id: string;
    name: string;
    description: string;
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
  }> = [
    {
      id: "maritimo-profundo",
      name: "Marítimo Profundo",
      description: "Sobrio · Institucional · Armada",
      primary: "#1A2B3A",
      secondary: "#3E848A",
      accent: "#5DD5E0",
      bg: "#0A1929",
    },
    {
      id: "teal_operacional",
      name: "Teal Operacional",
      description: "Profesional · Confiable · VTS",
      primary: "#0F3460",
      secondary: "#3E848A",
      accent: "#5DD5E0",
      bg: "#051828",
    },
    {
      id: "cyan_radar",
      name: "Cyan Radar",
      description: "Tecnológico · Táctico · Nocturno",
      primary: "#0D1B2A",
      secondary: "#00B4D8",
      accent: "#48CAE4",
      bg: "#03070E",
    },
    {
      id: "verde_mar",
      name: "Verde Mar",
      description: "Natural · Sereno · Operativo",
      primary: "#1B3A2F",
      secondary: "#2D6A4F",
      accent: "#52B788",
      bg: "#081411",
    },
    {
      id: "ambar_alerta",
      name: "Ámbar Alerta",
      description: "Cálido · Atención · Fiscalización",
      primary: "#3D2817",
      secondary: "#B47A2D",
      accent: "#F4A261",
      bg: "#1A0F05",
    },
    {
      id: "grafito_ejecutivo",
      name: "Grafito Ejecutivo",
      description: "Neutro · Minimalista · Documentos",
      primary: "#2D3142",
      secondary: "#4F5D75",
      accent: "#8E9AAF",
      bg: "#0B0E14",
    },
  ];

  // Paleta de referencia de colores operativos (informativa, siempre visible)
  const operationalColors = [
    { label: "Carga", color: VESSEL_COLORS.Cargo },
    { label: "Petrolero", color: VESSEL_COLORS.Tanker },
    { label: "Pesca", color: VESSEL_COLORS.Fishing },
    { label: "Pasajeros", color: VESSEL_COLORS.Passenger },
    { label: "Práctico", color: VESSEL_COLORS.Pilot },
    { label: "Remolcador", color: VESSEL_COLORS.Tug },
    { label: "Naval", color: VESSEL_COLORS.Naval },
  ];

  const statusColors = [
    { label: "Operativo", color: "#3fb950" },
    { label: "Restringido", color: "#d29922" },
    { label: "Cerrado", color: "#f85149" },
  ];

  const selected = themes.find((t) => t.id === selectedTheme) || themes[0];

  return (
    <Card className="border-accent/20 overflow-hidden">
      <CardContent className="p-0">
        {/* Header del panel */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-sidebar to-sidebar/90 border-b border-sidebar-border">
          <Palette className="h-4 w-4 text-accent" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-sidebar-foreground tracking-wide">DISEÑO VISUAL</h3>
            <p className="text-[10px] text-sidebar-foreground/60">Selecciona el esquema cromático del radar</p>
          </div>
          <button
            onClick={() => setSelectedTheme("maritimo_profundo")}
            className="text-[10px] text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Selector de temas — lista vertical estilo la imagen */}
        <div className="bg-[#0a0f1a] p-3 space-y-1">
          {themes.map((theme) => {
            const isSelected = theme.id === selectedTheme;
            return (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-left",
                  isSelected
                    ? "bg-white/5 ring-1 ring-white/10"
                    : "hover:bg-white/[0.03]",
                )}
              >
                {/* Círculo de color sólido (swatch) */}
                <div className="relative shrink-0">
                  <span
                    className="block h-7 w-7 rounded-full ring-2 ring-white/10"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${theme.accent}, ${theme.primary} 70%)`,
                      boxShadow: isSelected ? `0 0 12px ${theme.accent}80` : "none",
                    }}
                  />
                </div>

                {/* Nombre + descripción */}
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "text-sm font-semibold",
                    isSelected ? "text-white" : "text-gray-300",
                  )}>
                    {theme.name}
                  </div>
                  <div className="text-[10px] text-gray-500 leading-tight">
                    {theme.description}
                  </div>
                </div>

                {/* Checkmark verde si está seleccionado */}
                {isSelected && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#0a0f1a] border-t border-white/5 text-center">
          <span className="text-[9px] text-gray-500 font-mono-tabular">
            {themes.length} temas disponibles · Estándar DIRECTEMAR · IALA V-103
          </span>
        </div>

        {/* Preview de la paleta seleccionada */}
        <div className="p-3 bg-muted/30 border-t border-border space-y-2">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
            Vista previa · {selected.name}
          </div>
          <div className="flex items-center gap-2">
            {[
              { name: "Fondo", color: selected.bg },
              { name: "Primario", color: selected.primary },
              { name: "Secundario", color: selected.secondary },
              { name: "Acento", color: selected.accent },
            ].map((c) => (
              <div key={c.name} className="flex-1 text-center">
                <div
                  className="h-8 rounded-md mb-1 border border-border"
                  style={{ background: c.color }}
                />
                <div className="text-[9px] text-muted-foreground">{c.name}</div>
                <div className="text-[8px] font-mono-tabular text-muted-foreground/70">{c.color}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Paleta operativa de referencia (siempre visible, compacta) */}
        <div className="p-3 border-t border-border bg-card/50">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
            Colores operativos VTS
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            <div className="space-y-1">
              <div className="text-[9px] text-muted-foreground/70 uppercase tracking-wider">Tipos de buque</div>
              <div className="flex flex-wrap gap-1.5">
                {operationalColors.map((c) => (
                  <div key={c.label} className="flex items-center gap-1" title={c.label}>
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.color }} />
                    <span className="text-[9px] text-muted-foreground">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[9px] text-muted-foreground/70 uppercase tracking-wider">Estado de puerto</div>
              <div className="flex flex-wrap gap-1.5">
                {statusColors.map((c) => (
                  <div key={c.label} className="flex items-center gap-1" title={c.label}>
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.color }} />
                    <span className="text-[9px] text-muted-foreground">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
