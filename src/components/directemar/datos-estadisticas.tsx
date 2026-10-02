"use client";

import { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Ship,
  AlertTriangle,
  FileText,
  Download,
  Globe,
  Database,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ZONAS_MARITIMAS,
  ALL_REGIONS_FILTER,
  INITIAL_TRAMITES,
  INITIAL_ALERTS,
  INITIAL_AUDIT,
  PORTS,
  fmtDateTime,
  type Tramite,
  type MaritimeAlert,
  type AuditEntry,
  type Port,
} from "@/lib/directemar-data";
import { RegionFilter } from "@/components/directemar/region-filter";
import { ExportModal } from "@/components/directemar/export-modal";
import type { ExportPayload } from "@/lib/export-utils";

interface DatasetRow {
  categoria: string;
  descripcion: string;
  registros: string;
  actualizado: string;
  formato: string;
  fuente: string;
}

const DATASETS: DatasetRow[] = [
  { categoria: "Resoluciones", descripcion: "Resoluciones EXENTAS vigentes", registros: "1,247", actualizado: "hace 2 min", formato: "JSON", fuente: "DIRECTEMAR" },
  { categoria: "Puertos", descripcion: "Estado de puertos en tiempo real", registros: "12", actualizado: "hace 1 min", formato: "JSON", fuente: "Gobernación Marítima" },
  { categoria: "Meteorología", descripcion: "Partes meteorológicos SERVIMET", registros: "8,760", actualizado: "hace 5 min", formato: "CSV", fuente: "SERVIMET" },
  { categoria: "Zarpes", descripcion: "Zarpes registrados (histórico)", registros: "428K", actualizado: "diario 03:00", formato: "CSV", fuente: "Capitanías de Puerto" },
  { categoria: "Cartografía", descripcion: "Cartas náuticas disponibles SHOA", registros: "342", actualizado: "semanal", formato: "GeoJSON", fuente: "SHOA" },
  { categoria: "Fiscalización", descripcion: "Estadísticas de fiscalización", registros: "12,470", actualizado: "mensual", formato: "CSV", fuente: "DIRECTEMAR" },
];

const TRAFFIC_MONTHLY = [
  { m: "Ene", v: 3200 }, { m: "Feb", v: 3100 }, { m: "Mar", v: 3400 },
  { m: "Abr", v: 3600 }, { m: "May", v: 3300 }, { m: "Jun", v: 3500 },
  { m: "Jul", v: 3800 }, { m: "Ago", v: 4100 }, { m: "Sep", v: 3900 },
  { m: "Oct", v: 4230, current: true },
];

const INCIDENTS_BY_ZONE = [
  { zone: "Valparaíso — San Antonio", count: 8, color: "bg-destructive" },
  { zone: "Talcahuano", count: 5, color: "bg-amber-500" },
  { zone: "Puerto Montt — Chiloé", count: 6, color: "bg-destructive" },
  { zone: "Punta Arenas", count: 3, color: "bg-amber-500" },
  { zone: "Antofagasta — Iquique", count: 3, color: "bg-amber-500" },
  { zone: "Arica", count: 2, color: "bg-accent" },
];

const INCIDENTS_BY_TYPE = [
  { type: "Intrusión zona restr.", count: 11, dot: "bg-destructive" },
  { type: "Exceso velocidad", count: 6, dot: "bg-amber-500" },
  { type: "Calado excedido", count: 4, dot: "bg-amber-500" },
  { type: "Comunicación fallida", count: 3, dot: "bg-accent" },
  { type: "Otro", count: 3, dot: "bg-muted-foreground" },
];

export function DatosEstadisticas() {
  const [zonaFilter, setZonaFilter] = useState<string>(ALL_REGIONS_FILTER);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<"datasets" | "tramites" | "alertas" | "audit" | "ports">("datasets");

  // Datos filtrados por zona marítima
  const filteredTramites = useMemo(() => {
    if (zonaFilter === ALL_REGIONS_FILTER) return INITIAL_TRAMITES;
    return INITIAL_TRAMITES.filter((t) => t.zonaMaritima === zonaFilter);
  }, [zonaFilter]);

  const filteredAlerts = useMemo(() => {
    if (zonaFilter === ALL_REGIONS_FILTER) return INITIAL_ALERTS;
    return INITIAL_ALERTS.filter((a) => a.zonaMaritima === zonaFilter);
  }, [zonaFilter]);

  const filteredAudit = useMemo(() => {
    if (zonaFilter === ALL_REGIONS_FILTER) return INITIAL_AUDIT;
    return INITIAL_AUDIT.filter((a) => a.zonaMaritima === zonaFilter);
  }, [zonaFilter]);

  const filteredPorts = useMemo(() => {
    if (zonaFilter === ALL_REGIONS_FILTER) return PORTS;
    const zona = ZONAS_MARITIMAS.find((z) => z.code === zonaFilter);
    if (!zona) return PORTS;
    return PORTS.filter((p) => zona.regions.includes(p.region));
  }, [zonaFilter]);

  const zonaLabel = useMemo(() => {
    if (zonaFilter === ALL_REGIONS_FILTER) return "Nacional — Todo Chile";
    const z = ZONAS_MARITIMAS.find((x) => x.code === zonaFilter);
    return z ? `${z.code} · ${z.name} (${z.hq})` : "Nacional";
  }, [zonaFilter]);

  // Adaptadores para los ExportPayload genéricos
  const datasetsRows: DatasetRow[] = DATASETS;
  const tramiteRows: Tramite[] = filteredTramites;
  const alertRows: MaritimeAlert[] = filteredAlerts;
  const auditRows: AuditEntry[] = filteredAudit;
  const portRows: Port[] = filteredPorts;

  const exportPayload: ExportPayload<DatasetRow | Tramite | MaritimeAlert | AuditEntry | Port> =
    exportTarget === "datasets"
      ? {
          title: "Datasets abiertos DIRECTEMAR",
          subtitle: "Catálogo de datos públicos · Ley N° 20.285",
          zonaMaritimaLabel: zonaLabel,
          columns: [
            { key: "categoria", label: "Categoría" },
            { key: "descripcion", label: "Descripción" },
            { key: "registros", label: "Registros" },
            { key: "actualizado", label: "Actualizado" },
            { key: "formato", label: "Formato" },
            { key: "fuente", label: "Fuente" },
          ],
          rows: datasetsRows as Array<DatasetRow | Tramite | MaritimeAlert | AuditEntry | Port>,
          meta: {
            "Total datasets": String(datasetsRows.length),
            "Datasets en tiempo real": "2",
            "Formatos disponibles": "JSON, CSV, GeoJSON",
          },
        }
      : exportTarget === "tramites"
      ? {
          title: "Trámites registrados",
          subtitle: "Portal de autogestión marítima",
          zonaMaritimaLabel: zonaLabel,
          columns: [
            { key: "folio", label: "Folio" },
            { key: "type", label: "Tipo" },
            { key: "applicant", label: "Postulante" },
            { key: "applicantRut", label: "RUT" },
            { key: "vessel", label: "Embarcación" },
            { key: "port", label: "Puerto" },
            { key: "status", label: "Estado" },
            { key: "amount", label: "Monto (UF)", format: (r) => String((r as Tramite).amount) },
            { key: "submittedAt", label: "Ingresado", format: (r) => fmtDateTime((r as Tramite).submittedAt) },
          ],
          rows: tramiteRows as Array<DatasetRow | Tramite | MaritimeAlert | AuditEntry | Port>,
          meta: {
            "Total trámites": String(tramiteRows.length),
            "Aprobados": String(tramiteRows.filter((t) => t.status === "Aprobado").length),
            "En proceso": String(tramiteRows.filter((t) => t.status === "En Revisión" || t.status === "Ingresado").length),
            "Recaudado UF": tramiteRows.reduce((s, t) => s + t.amount, 0).toFixed(1),
          },
        }
      : exportTarget === "alertas"
      ? {
          title: "Alertas marítimas activas",
          subtitle: "Panel de alertas integradas",
          zonaMaritimaLabel: zonaLabel,
          columns: [
            { key: "id", label: "ID" },
            { key: "severity", label: "Severidad" },
            { key: "source", label: "Fuente" },
            { key: "title", label: "Título" },
            { key: "zone", label: "Zona" },
            { key: "region", label: "Región" },
            { key: "zonaMaritima", label: "ZM" },
            { key: "issuedAt", label: "Emitida", format: (r) => fmtDateTime((r as MaritimeAlert).issuedAt) },
            { key: "acknowledged", label: "Reconocida", format: (r) => ((r as MaritimeAlert).acknowledged ? "Sí" : "No") },
          ],
          rows: alertRows as Array<DatasetRow | Tramite | MaritimeAlert | AuditEntry | Port>,
          meta: {
            "Total alertas": String(alertRows.length),
            "Críticas": String(alertRows.filter((a) => a.severity === "critical").length),
            "Advertencias": String(alertRows.filter((a) => a.severity === "warning").length),
            "Reconocidas": String(alertRows.filter((a) => a.acknowledged).length),
          },
        }
      : exportTarget === "audit"
      ? {
          title: "Bitácora auditante",
          subtitle: "Cadena de eventos con hash criptográfico",
          zonaMaritimaLabel: zonaLabel,
          columns: [
            { key: "blockSeq", label: "Bloque #", format: (r) => String((r as AuditEntry).blockSeq) },
            { key: "timestamp", label: "Timestamp", format: (r) => fmtDateTime((r as AuditEntry).timestamp) },
            { key: "actor", label: "Actor" },
            { key: "role", label: "Rol" },
            { key: "action", label: "Acción" },
            { key: "target", label: "Objetivo" },
            { key: "zonaMaritima", label: "ZM" },
            { key: "hash", label: "Hash", format: (r) => (r as AuditEntry).hash.slice(0, 16) + "…" },
          ],
          rows: auditRows as Array<DatasetRow | Tramite | MaritimeAlert | AuditEntry | Port>,
          meta: {
            "Total bloques": String(auditRows.length),
            "Último bloque #": String(auditRows[0]?.blockSeq ?? 0),
            "Integridad de cadena": "100%",
            "Algoritmo": "SHA-256",
          },
        }
      : {
          // ports
          title: "Estado de puertos",
          subtitle: "Sincronizado con Gobernaciones Marítimas",
          zonaMaritimaLabel: zonaLabel,
          columns: [
            { key: "code", label: "Código" },
            { key: "name", label: "Puerto" },
            { key: "region", label: "Región" },
            { key: "status", label: "Estado" },
            { key: "windKn", label: "Viento (kn)" },
            { key: "waveM", label: "Ola (m)" },
            { key: "visibilityNm", label: "Visibilidad (nm)" },
            { key: "lastUpdate", label: "Últ. actualización" },
          ],
          rows: portRows as Array<DatasetRow | Tramite | MaritimeAlert | AuditEntry | Port>,
          meta: {
            "Total puertos": String(portRows.length),
            "Operativos": String(portRows.filter((p) => p.status === "open").length),
            "Restringidos": String(portRows.filter((p) => p.status === "restricted").length),
            "Cerrados": String(portRows.filter((p) => p.status === "closed").length),
          },
        };

  const openExport = (target: typeof exportTarget) => {
    setExportTarget(target);
    setExportOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-accent" />
            Datos y Estadísticas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Datos abiertos · Ley N° 20.285 · Actualización continua desde fuentes oficiales
          </p>
        </div>
        <Button variant="outline" className="gap-1.5" onClick={() => openExport("datasets")}>
          <Download className="h-4 w-4" />
          Exportar dataset
        </Button>
      </div>

      {/* Region filter */}
      <RegionFilter value={zonaFilter} onChange={setZonaFilter} variant="full" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi icon={Ship} label="Buques registrados" value="3,847" delta="+128" trend="up" />
        <Kpi icon={FileText} label="Trámites año 2026" value="42,318" delta="+8.4%" trend="up" />
        <Kpi icon={AlertTriangle} label="Incidentes" value="27" delta="-12" trend="down" good />
        <Kpi icon={Activity} label="Operación VTS h/yr" value="8,760" sub="24/7 · 365 días" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tráfico mensual */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tráfico marítimo mensual</CardTitle>
            <CardDescription className="text-xs">Número de zarpes registrados por mes</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-end gap-1.5 h-44 mb-2">
              {[
                { m: "Ene", v: 3200 }, { m: "Feb", v: 3100 }, { m: "Mar", v: 3400 },
                { m: "Abr", v: 3600 }, { m: "May", v: 3300 }, { m: "Jun", v: 3500 },
                { m: "Jul", v: 3800 }, { m: "Ago", v: 4100 }, { m: "Sep", v: 3900 },
                { m: "Oct", v: 4230, current: true },
              ].map((d) => (
                <div key={d.m} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative" style={{ height: `${(d.v / 4230) * 100}%` }}>
                    <div
                      className={cn(
                        "absolute inset-x-0 bottom-0 rounded-t-sm transition-all",
                        d.current ? "bg-accent" : "bg-accent/30 hover:bg-accent/50",
                      )}
                      style={{ height: "100%" }}
                    />
                    {d.current && (
                      <div className="absolute -top-5 inset-x-0 text-center text-[9px] font-mono-tabular font-bold">
                        {d.v}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground">{d.m}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
              <span>Acumulado: <span className="font-mono-tabular font-semibold text-foreground">36,530</span></span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <TrendingUp className="h-3 w-3" />
                +8.4% vs 2025
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Distribución por tipo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Distribución por tipo de nave</CardTitle>
            <CardDescription className="text-xs">Flota activa en aguas jurisdiccionales chilenas</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-center mb-4">
              <div className="relative h-32 w-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="35" fill="none" stroke="oklch(0.95 0.01 180)" strokeWidth="14" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="oklch(0.62 0.13 185)" strokeWidth="14" strokeDasharray={`${2 * Math.PI * 35 * 0.45} ${2 * Math.PI * 35}`} strokeLinecap="butt" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="oklch(0.65 0.22 25)" strokeWidth="14" strokeDasharray={`${2 * Math.PI * 35 * 0.22} ${2 * Math.PI * 35}`} strokeDashoffset={`${-2 * Math.PI * 35 * 0.45}`} />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="oklch(0.7 0.18 145)" strokeWidth="14" strokeDasharray={`${2 * Math.PI * 35 * 0.18} ${2 * Math.PI * 35}`} strokeDashoffset={`${-2 * Math.PI * 35 * 0.67}`} />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="oklch(0.78 0.16 70)" strokeWidth="14" strokeDasharray={`${2 * Math.PI * 35 * 0.15} ${2 * Math.PI * 35}`} strokeDashoffset={`${-2 * Math.PI * 35 * 0.85}`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold tabular-nums">3,847</span>
                  <span className="text-[10px] text-muted-foreground">Total</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "Carga", pct: 45, color: "oklch(0.62 0.13 185)", count: "1,731" },
                { label: "Petrolero", pct: 22, color: "oklch(0.65 0.22 25)", count: "847" },
                { label: "Pesca", pct: 18, color: "oklch(0.7 0.18 145)", count: "693" },
                { label: "Pasajeros", pct: 15, color: "oklch(0.78 0.16 70)", count: "576" },
              ].map((d) => (
                <div key={d.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="flex-1">{d.label}</span>
                  <span className="font-mono-tabular text-muted-foreground">{d.pct}%</span>
                  <span className="font-mono-tabular font-semibold">{d.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cumplimiento */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Indicadores de cumplimiento</CardTitle>
            <CardDescription className="text-xs">Mes en curso</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {[
              { label: "Zarpes con fiscalización electrónica", value: 98.7, target: 95 },
              { label: "Trámites resueltos en SLA", value: 94.2, target: 90 },
              { label: "Cobertura AIS zonas críticas", value: 99.4, target: 98 },
              { label: "Tiempo medio respuesta alertas", value: 87.5, target: 80, suffix: "min" },
              { label: "Disponibilidad del sistema", value: 99.97, target: 99.5 },
            ].map((ind) => (
              <div key={ind.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium truncate pr-2">{ind.label}</span>
                  <span className={cn(
                    "font-mono-tabular font-bold",
                    ind.value >= ind.target ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
                  )}>
                    {ind.value}{ind.suffix || "%"}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden relative">
                  <div
                    className={cn("h-full", ind.value >= ind.target ? "bg-emerald-500" : "bg-amber-500")}
                    style={{ width: `${Math.min(ind.value, 100)}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-px bg-foreground/40"
                    style={{ left: `${ind.target}%` }}
                  />
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">Meta: {ind.target}{ind.suffix || "%"}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Datos abiertos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-accent" />
              Datos abiertos disponibles
            </CardTitle>
            <CardDescription className="text-xs">API REST pública · Formatos: JSON / CSV / GeoJSON</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5">
              {[
                { name: "Resoluciones EXENTAS vigentes", rows: "1,247", updated: "hace 2 min", format: "JSON" },
                { name: "Estado de puertos en tiempo real", rows: "12", updated: "hace 1 min", format: "JSON" },
                { name: "Partes meteorológicos SERVIMET", rows: "8,760", updated: "hace 5 min", format: "CSV" },
                { name: "Zarpes registrados (histórico)", rows: "428K", updated: "diario 03:00", format: "CSV" },
                { name: "Cartas náuticas disponibles SHOA", rows: "342", updated: "semanal", format: "GeoJSON" },
                { name: "Estadísticas de fiscalización", rows: "12,470", updated: "mensual", format: "CSV" },
              ].map((d) => (
                <div key={d.name} className="flex items-center gap-3 p-2 rounded-md border border-border text-xs hover:bg-muted/30 transition-colors">
                  <Globe className="h-3.5 w-3.5 text-accent shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{d.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono-tabular">
                      {d.rows} registros · actualizado {d.updated}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono-tabular">{d.format}</Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incidents map */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Incidentes registrados · Últimos 30 días</CardTitle>
              <CardDescription className="text-xs">Distribución por zona y tipo</CardDescription>
            </div>
            <Badge variant="secondary" className="text-[10px]">27 incidentes</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Por zona</div>
              <div className="space-y-2">
                {[
                  { zone: "Valparaíso — San Antonio", count: 8, color: "bg-destructive" },
                  { zone: "Talcahuano", count: 5, color: "bg-amber-500" },
                  { zone: "Puerto Montt — Chiloé", count: 6, color: "bg-destructive" },
                  { zone: "Punta Arenas", count: 3, color: "bg-amber-500" },
                  { zone: "Antofagasta — Iquique", count: 3, color: "bg-amber-500" },
                  { zone: "Arica", count: 2, color: "bg-accent" },
                ].map((z) => (
                  <div key={z.zone} className="flex items-center gap-2">
                    <span className="text-xs font-medium w-44 truncate">{z.zone}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full", z.color)} style={{ width: `${(z.count / 8) * 100}%` }} />
                    </div>
                    <span className="font-mono-tabular text-xs w-6 text-right">{z.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Por tipo</div>
              <div className="space-y-1.5">
                {[
                  { type: "Intrusión zona restr.", count: 11, dot: "bg-destructive" },
                  { type: "Exceso velocidad", count: 6, dot: "bg-amber-500" },
                  { type: "Calado excedido", count: 4, dot: "bg-amber-500" },
                  { type: "Comunicación fallida", count: 3, dot: "bg-accent" },
                  { type: "Otro", count: 3, dot: "bg-muted-foreground" },
                ].map((t) => (
                  <div key={t.type} className="flex items-center gap-2 text-xs">
                    <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
                    <span className="flex-1 truncate">{t.type}</span>
                    <span className="font-mono-tabular font-semibold">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export modal */}
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} payload={exportPayload} />
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  delta,
  trend,
  sub,
  good,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  sub?: string;
  good?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
            <div className="text-xl font-bold tabular-nums mt-1">{value}</div>
            {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
            {delta && (
              <div className={cn(
                "text-[11px] mt-1 flex items-center gap-1 font-medium",
                (trend === "up" && !good) || (trend === "down" && !good)
                  ? "text-destructive"
                  : "text-emerald-600 dark:text-emerald-400",
              )}>
                {trend === "up" && <TrendingUp className="h-3 w-3" />}
                {trend === "down" && <TrendingDown className="h-3 w-3" />}
                {delta}
              </div>
            )}
          </div>
          <div className="h-8 w-8 rounded-md bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
