"use client";

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

export function DatosEstadisticas() {
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
        <Button variant="outline" className="gap-1.5">
          <Download className="h-4 w-4" />
          Exportar dataset
        </Button>
      </div>

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
