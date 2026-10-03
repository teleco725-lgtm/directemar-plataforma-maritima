"use client";

import { useState, useMemo } from "react";
import {
  Ship,
  Anchor,
  AlertTriangle,
  FileText,
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  Wind,
  Waves,
  Eye,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Download,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  PORTS,
  KPI_STATS,
  INITIAL_ALERTS,
  INITIAL_AUDIT,
  ZONAS_MARITIMAS,
  ALL_REGIONS_FILTER,
  getZonaByRegion,
  fmtTime,
  type Port,
  type PortStatus,
} from "@/lib/directemar-data";
import { RegionFilter } from "@/components/directemar/region-filter";
import { ExportModal } from "@/components/directemar/export-modal";
import type { ExportPayload } from "@/lib/export-utils";

interface PanelGeneralProps {
  onNavigate: (section: string) => void;
}

const statusConfig: Record<PortStatus, { label: string; color: string; dot: string }> = {
  open: { label: "Operativo", color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  restricted: { label: "Restringido", color: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  closed: { label: "Cerrado", color: "text-destructive", dot: "bg-destructive" },
};

export function PanelGeneral({ onNavigate }: PanelGeneralProps) {
  const [zonaFilter, setZonaFilter] = useState<string>(ALL_REGIONS_FILTER);
  const [exportOpen, setExportOpen] = useState(false);

  // Filtra puertos por zona marítima
  const filteredPorts = useMemo(() => {
    if (zonaFilter === ALL_REGIONS_FILTER) return PORTS;
    const zona = ZONAS_MARITIMAS.find((z) => z.code === zonaFilter);
    if (!zona) return PORTS;
    return PORTS.filter((p) => zona.regions.includes(p.region));
  }, [zonaFilter]);

  // Filtra alertas por zona marítima
  const filteredAlerts = useMemo(() => {
    if (zonaFilter === ALL_REGIONS_FILTER) return INITIAL_ALERTS;
    return INITIAL_ALERTS.filter((a) => a.zonaMaritima === zonaFilter);
  }, [zonaFilter]);

  // Filtra bitácora por zona marítima
  const filteredAudit = useMemo(() => {
    if (zonaFilter === ALL_REGIONS_FILTER) return INITIAL_AUDIT;
    return INITIAL_AUDIT.filter((a) => a.zonaMaritima === zonaFilter);
  }, [zonaFilter]);

  const openPorts = filteredPorts.filter((p) => p.status === "open").length;
  const restrictedPorts = filteredPorts.filter((p) => p.status === "restricted").length;
  const closedPorts = filteredPorts.filter((p) => p.status === "closed").length;
  const criticalAlerts = filteredAlerts.filter((a) => a.severity === "critical").length;

  const zonaLabel = useMemo(() => {
    if (zonaFilter === ALL_REGIONS_FILTER) return "Nacional — Todo Chile";
    const z = ZONAS_MARITIMAS.find((x) => x.code === zonaFilter);
    return z ? `${z.code} · ${z.name} (${z.hq})` : "Nacional";
  }, [zonaFilter]);

  const exportPayload: ExportPayload<Port> = {
    title: "Estado operacional del litoral",
    subtitle: "Panel General · DIRECTEMAR",
    zonaMaritimaLabel: zonaLabel,
    columns: [
      { key: "code", label: "Código" },
      { key: "name", label: "Puerto" },
      { key: "region", label: "Región" },
      { key: "status", label: "Estado" },
      { key: "windKn", label: "Viento (kn)" },
      { key: "waveM", label: "Ola (m)" },
      { key: "visibilityNm", label: "Visibilidad (nm)" },
      { key: "restriction", label: "Restricción" },
    ],
    rows: filteredPorts,
    meta: {
      "Total puertos": String(filteredPorts.length),
      "Operativos": String(openPorts),
      "Restringidos": String(restrictedPorts),
      "Cerrados": String(closedPorts),
      "Alertas activas": String(filteredAlerts.length),
      "Alertas críticas": String(criticalAlerts),
    },
  };

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel General</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Estado operacional del litoral chileno · Sincronizado con fuentes SHOA, SERVIMET y Gobernaciones Marítimas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Integridad: <span className="font-mono-tabular font-semibold text-foreground">100%</span></span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Region filter */}
      <RegionFilter value={zonaFilter} onChange={setZonaFilter} variant="full" />

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={Ship}
          label="Buques en seguimiento"
          value={KPI_STATS.vesselsTracked}
          delta="+3 vs ayer"
          trend="up"
        />
        <KpiCard
          icon={Anchor}
          label="Puertos monitoreados"
          value={`${openPorts}/${filteredPorts.length}`}
          subValue={`${restrictedPorts} restrict. · ${closedPorts} cerrados`}
          trend="flat"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Alertas activas"
          value={filteredAlerts.length}
          subValue={`${criticalAlerts} críticas`}
          trend="up"
          alert
        />
        <KpiCard
          icon={FileText}
          label="Trámites hoy"
          value={KPI_STATS.tramitesToday}
          delta="+12 vs ayer"
          trend="up"
        />
      </div>

      {/* Mapa + Estado puertos */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Mapa */}
        <Card className="lg:col-span-3 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  Estado Operacional del Litoral
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Chile continental · Zona Económica Exclusiva
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("operacion")} className="gap-1 text-xs">
                Ver consola <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ChileMap ports={PORTS} />
          </CardContent>
        </Card>

        {/* Estado puertos */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Estado de Puertos</CardTitle>
            <CardDescription className="text-xs">Última actualización automática · fuente Gobernación Marítima</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-80 overflow-y-auto scrollbar-thin pr-1 space-y-1.5">
              {filteredPorts.map((port) => {
                const cfg = statusConfig[port.status];
                return (
                  <div
                    key={port.code}
                    className="flex items-center gap-3 px-3 py-2 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative">
                      <span className={cn("block h-2 w-2 rounded-full", cfg.dot, port.status !== "open" && "blink")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold truncate">{port.name}</span>
                        <span className="text-[10px] font-mono-tabular text-muted-foreground">{port.code}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Wind className="h-3 w-3" />{port.windKn}kn</span>
                        <span className="flex items-center gap-1"><Waves className="h-3 w-3" />{port.waveM}m</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{port.visibilityNm}nm</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] font-semibold shrink-0", cfg.color)}>
                      {cfg.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alertas recientes */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Alertas Activas
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("operacion")} className="gap-1 text-xs">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {filteredAlerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 px-3 py-2 rounded-md border text-sm",
                  alert.severity === "critical"
                    ? "border-destructive/30 bg-destructive/5"
                    : alert.severity === "warning"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-border bg-card",
                )}
              >
                <span
                  className={cn(
                    "mt-1 h-2 w-2 rounded-full shrink-0",
                    alert.severity === "critical" ? "bg-destructive" : alert.severity === "warning" ? "bg-amber-500" : "bg-accent",
                    alert.severity === "critical" && !alert.acknowledged && "blink",
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{alert.title}</span>
                    <Badge variant="outline" className="text-[10px] font-mono-tabular">{alert.source}</Badge>
                    {alert.acknowledged && (
                      <Badge variant="secondary" className="text-[10px]">Reconocida</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{alert.description}</p>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {alert.zone} · {fmtTime(alert.issuedAt)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actividad bitácora */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" />
                Bitácora Reciente
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("bitacora")} className="gap-1 text-xs">
                Ver <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {filteredAudit.slice(0, 4).map((entry) => (
              <div key={entry.id} className="flex items-start gap-2.5 px-2 py-1.5 text-xs">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{entry.action}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{entry.target}</div>
                  <div className="text-[10px] text-muted-foreground font-mono-tabular">
                    Bloque #{entry.blockSeq} · {fmtTime(entry.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-border">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Bloques hoy</span>
                <span className="font-mono-tabular font-semibold text-foreground">{KPI_STATS.auditBlocksToday}</span>
              </div>
              <Progress value={87} className="h-1.5 mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            Métricas de Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricItem label="Tiempo de respuesta" value={`${KPI_STATS.responseTimeMs} ms`} good />
            <MetricItem label="Integridad de datos" value={`${KPI_STATS.dataIntegrity}%`} good />
            <MetricItem label="Disponibilidad mensual" value={`${KPI_STATS.systemUptime}%`} good />
            <MetricItem label="Datacenter" value="Chile · CL-SCL" good />
          </div>
        </CardContent>
      </Card>

      {/* Export modal */}
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} payload={exportPayload} />
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  subValue,
  trend,
  alert,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  delta?: string;
  subValue?: string;
  trend: "up" | "down" | "flat";
  alert?: boolean;
}) {
  return (
    <Card className={cn(alert && "border-destructive/30")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
            <div className="text-2xl font-bold tabular-nums mt-1">{value}</div>
            {subValue && <div className="text-[10px] text-muted-foreground mt-0.5">{subValue}</div>}
            {delta && (
              <div className={cn(
                "text-[11px] mt-1 flex items-center gap-1 font-medium",
                trend === "up" ? "text-emerald-600 dark:text-emerald-400" : trend === "down" ? "text-destructive" : "text-muted-foreground",
              )}>
                {trend === "up" && <TrendingUp className="h-3 w-3" />}
                {trend === "down" && <TrendingDown className="h-3 w-3" />}
                {delta}
              </div>
            )}
          </div>
          <div className={cn(
            "h-9 w-9 rounded-md flex items-center justify-center shrink-0",
            alert ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent",
          )}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricItem({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="flex items-center gap-1.5 mt-1">
        <span className={cn("h-1.5 w-1.5 rounded-full", good ? "bg-emerald-500" : "bg-amber-500")} />
        <span className="text-sm font-mono-tabular font-semibold">{value}</span>
      </div>
    </div>
  );
}

// Mapa estilizado de Chile con puertos (SVG simplificado)
function ChileMap({ ports }: { ports: Port[] }) {
  // Proyección simple de coordenadas a SVG
  // Lat: -17 a -56 → 0 a 100 (invertido porque SVG Y va hacia abajo)
  // Lng: -75 a -69 → 100 a 0
  const project = (lat: number, lng: number) => {
    const x = ((lng - (-75)) / ((-69) - (-75))) * 100;
    const y = ((lat - (-17)) / ((-56) - (-17))) * 100;
    return { x, y };
  };

  const colorByStatus: Record<PortStatus, string> = {
    open: "oklch(0.7 0.18 145)",
    restricted: "oklch(0.75 0.16 70)",
    closed: "oklch(0.6 0.22 25)",
  };

  return (
    <div className="relative aspect-[3/5] sm:aspect-[2/3] max-h-[480px] bg-grid-pattern rounded-md border border-border overflow-hidden">
      <svg viewBox="0 0 100 130" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Línea de costa aproximada */}
        <path
          d="M 75 5 L 65 15 L 55 25 L 50 35 L 48 45 L 50 55 L 52 65 L 50 75 L 48 85 L 50 95 L 55 105 L 50 115 L 45 125"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          className="text-foreground/30"
          strokeDasharray="2 1"
        />
        {/* Zona Económica Exclusiva */}
        <path
          d="M 75 5 L 75 5 L 30 5 L 30 125 L 45 125 L 50 115 L 55 105 L 50 95 L 48 85 L 50 75 L 52 65 L 50 55 L 48 45 L 50 35 L 55 25 L 65 15 L 75 5 Z"
          fill="oklch(0.62 0.13 185 / 0.08)"
          stroke="oklch(0.62 0.13 185 / 0.4)"
          strokeWidth="0.3"
          strokeDasharray="1 1"
        />

        {/* Puertos */}
        {ports.map((port) => {
          const { x, y } = project(port.lat, port.lng);
          const color = colorByStatus[port.status];
          const isAlert = port.status !== "open";
          return (
            <g key={port.code}>
              {isAlert && (
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                  opacity="0.3"
                  className="blink"
                >
                  <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={x}
                cy={y}
                r={isAlert ? 1.5 : 1}
                fill={color}
                stroke="white"
                strokeWidth="0.3"
              />
            </g>
          );
        })}
      </svg>

      {/* Leyenda overlay */}
      <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1.5 text-[10px] border border-border">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="h-2 w-2 rounded-full" style={{ background: colorByStatus.open }} />
          <span>Operativo ({ports.filter(p => p.status === "open").length})</span>
        </div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="h-2 w-2 rounded-full" style={{ background: colorByStatus.restricted }} />
          <span>Restringido ({ports.filter(p => p.status === "restricted").length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: colorByStatus.closed }} />
          <span>Cerrado ({ports.filter(p => p.status === "closed").length})</span>
        </div>
      </div>

      {/* Compass */}
      <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-[10px] font-mono-tabular border border-border">
        <div className="text-center text-[8px] text-muted-foreground">N</div>
        <div className="text-center">↑</div>
      </div>

      {/* Scale */}
      <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-[10px] font-mono-tabular border border-border">
        <div className="flex items-center gap-1.5">
          <Wind className="h-3 w-3 text-accent" />
          <span>Fuente: SERVIMET</span>
        </div>
      </div>
    </div>
  );
}
