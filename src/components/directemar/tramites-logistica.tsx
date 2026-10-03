"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Ship,
  Award,
  Anchor,
  RefreshCw,
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Send,
  ArrowRight,
  Wallet,
  TrendingUp,
  CalendarDays,
  Filter,
  Download,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  INITIAL_TRAMITES,
  PORTS,
  ZONAS_MARITIMAS,
  ALL_REGIONS_FILTER,
  fmtDateTime,
  type Tramite,
} from "@/lib/directemar-data";
import { RegionFilter } from "@/components/directemar/region-filter";
import { ExportModal } from "@/components/directemar/export-modal";
import type { ExportPayload } from "@/lib/export-utils";

const STATUS_CONFIG: Record<Tramite["status"], { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  "Borrador": { label: "Borrador", color: "text-muted-foreground border-border", icon: FileText },
  "Ingresado": { label: "Ingresado", color: "text-accent border-accent/30", icon: Send },
  "En Revisión": { label: "En Revisión", color: "text-amber-600 dark:text-amber-400 border-amber-500/30", icon: Loader2 },
  "Aprobado": { label: "Aprobado", color: "text-emerald-600 dark:text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  "Rechazado": { label: "Rechazado", color: "text-destructive border-destructive/30", icon: XCircle },
  "Pagado": { label: "Pagado", color: "text-emerald-600 dark:text-emerald-400 border-emerald-500/30", icon: CreditCard },
};

const TRAMITE_TYPES = [
  { id: "zarpe", label: "Solicitud de Zarpe", icon: Ship, desc: "Permiso de zarpe para navegar desde puerto chileno", cost: "3.0 UF", time: "2-4 horas" },
  { id: "certificado", label: "Certificado de Navegación", icon: Award, desc: "Emisión o renovación de certificado vigente", cost: "1.5 UF", time: "24 horas" },
  { id: "permiso", label: "Permiso Especial", icon: Anchor, desc: "Operaciones especiales: buceo, izaje, remolque", cost: "8.2 UF", time: "48 horas" },
  { id: "inscripcion", label: "Inscripción de Nave", icon: FileText, desc: "Inscripción en Registro de Naves Menores", cost: "12.5 UF", time: "5 días" },
];

export function TramitesLogistica() {
  const [tramites, setTramites] = useState<Tramite[]>(INITIAL_TRAMITES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewForm, setShowNewForm] = useState(false);
  const [formType, setFormType] = useState("zarpe");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [zonaFilter, setZonaFilter] = useState<string>(ALL_REGIONS_FILTER);
  const [exportOpen, setExportOpen] = useState(false);

  // Campos del formulario controlados (fáciles de llenar)
  const [formData, setFormData] = useState({
    vessel: "Atlantic Trader",
    rut: "76.123.456-7",
    originPort: "Valparaíso",
    destinationPort: "San Antonio",
    cargo: "",
    draft: "",
    crew: "",
    observations: "",
  });

  const setField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Plantillas rápidas para llenado frecuente
  const quickTemplates = [
    {
      id: "zarpe-carga",
      label: "Zarpe carga seca",
      icon: Ship,
      data: {
        formType: "zarpe",
        vessel: "Pacific Star",
        rut: "76.123.456-7",
        originPort: "Valparaíso",
        destinationPort: "San Antonio",
        cargo: "Carga seca · 24 TEU contenedores",
        draft: "8.5",
        crew: "18",
        observations: "Zarpe rutinario, sin restricciones especiales",
      },
    },
    {
      id: "zarpe-granel",
      label: "Zarpe granel líquido",
      icon: Anchor,
      data: {
        formType: "zarpe",
        vessel: "Atlantic Trader",
        rut: "78.345.678-9",
        originPort: "Concepción — Talcahuano",
        destinationPort: "Puerto Montt",
        cargo: "Granel líquido · combustible",
        draft: "9.2",
        crew: "22",
        observations: "Operación sujeta a inspección ambiental",
      },
    },
    {
      id: "permiso-buceo",
      label: "Permiso buceo",
      icon: Anchor,
      data: {
        formType: "permiso",
        vessel: "Calypso II",
        rut: "79.987.654-3",
        originPort: "Iquique",
        destinationPort: "Iquique",
        cargo: "N/A",
        draft: "3.5",
        crew: "8",
        observations: "Operación de buceo profesional · 4 buzos · zona costera",
      },
    },
    {
      id: "certificado-navegacion",
      label: "Cert. navegación",
      icon: FileText,
      data: {
        formType: "certificado",
        vessel: "Beagle",
        rut: "77.555.666-7",
        originPort: "Valparaíso",
        destinationPort: "Valparaíso",
        cargo: "N/A",
        draft: "5.0",
        crew: "12",
        observations: "Renovación certificado de navegación anual",
      },
    },
  ];

  const applyTemplate = (template: typeof quickTemplates[0]) => {
    setFormType(template.data.formType);
    setFormData({
      vessel: template.data.vessel,
      rut: template.data.rut,
      originPort: template.data.originPort,
      destinationPort: template.data.destinationPort,
      cargo: template.data.cargo,
      draft: template.data.draft,
      crew: template.data.crew,
      observations: template.data.observations,
    });
  };

  // Filtrar trámites por zona marítima
  const filteredByZona = tramites.filter((t) => {
    if (zonaFilter === ALL_REGIONS_FILTER) return true;
    return t.zonaMaritima === zonaFilter;
  });

  const filtered = filteredByZona.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.folio.toLowerCase().includes(q) ||
        t.applicant.toLowerCase().includes(q) ||
        t.vessel.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalValue = filteredByZona.reduce((s, t) => s + t.amount, 0);
  const approvedCount = filteredByZona.filter((t) => t.status === "Aprobado").length;
  const pendingCount = filteredByZona.filter((t) => t.status === "En Revisión" || t.status === "Ingresado").length;

  const zonaLabel = useMemo(() => {
    if (zonaFilter === ALL_REGIONS_FILTER) return "Nacional — Todo Chile";
    const z = ZONAS_MARITIMAS.find((x) => x.code === zonaFilter);
    return z ? `${z.code} · ${z.name} (${z.hq})` : "Nacional";
  }, [zonaFilter]);

  const exportPayload: ExportPayload<Tramite> = {
    title: "Trámites marítimos",
    subtitle: "Portal de autogestión · ClaveÚnica · Ley 19.799",
    zonaMaritimaLabel: zonaLabel,
    columns: [
      { key: "folio", label: "Folio" },
      { key: "type", label: "Tipo" },
      { key: "applicant", label: "Postulante" },
      { key: "applicantRut", label: "RUT" },
      { key: "vessel", label: "Embarcación" },
      { key: "port", label: "Puerto" },
      { key: "region", label: "Región" },
      { key: "zonaMaritima", label: "ZM" },
      { key: "status", label: "Estado" },
      { key: "amount", label: "Monto (UF)", format: (r) => r.amount.toFixed(1) },
      { key: "progress", label: "Progreso", format: (r) => `${r.progress}%` },
      { key: "submittedAt", label: "Ingresado", format: (r) => fmtDateTime(r.submittedAt) },
    ],
    rows: filteredByZona,
    meta: {
      "Total trámites": String(filteredByZona.length),
      "Aprobados": String(approvedCount),
      "En proceso": String(pendingCount),
      "Recaudado UF": totalValue.toFixed(1),
      "Promedio UF/trámite": (totalValue / Math.max(filteredByZona.length, 1)).toFixed(2),
    },
  };

  const submitTramite = () => {
    setFormSubmitted(true);
    setTimeout(() => {
      const folioNum = 4413 + tramites.length;
      const newTramite: Tramite = {
        folio: `T-2026-0${folioNum}`,
        type: TRAMITE_TYPES.find((t) => t.id === formType)?.label.split(" ")[0] as Tramite["type"] || "Zarpe",
        applicant: "Compañía Marítima del Pacífico SpA",
        applicantRut: "76.123.456-7",
        vessel: "Atlantic Trader",
        status: "Ingresado",
        submittedAt: new Date().toISOString(),
        amount: 3.0,
        port: "Valparaíso",
        progress: 5,
      };
      setTramites((prev) => [newTramite, ...prev]);
      setFormSubmitted(false);
      setShowNewForm(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-accent" />
            Trámites y Logística
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Portal de autogestión marítima · ClaveÚnica · Firma electrónica Ley 19.799
          </p>
        </div>
        <Button onClick={() => setShowNewForm(true)} className="gap-1.5">
          <FileText className="h-4 w-4" />
          Nuevo Trámite
        </Button>
        <Button variant="outline" onClick={() => setExportOpen(true)} className="gap-1.5">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Region filter */}
      <RegionFilter value={zonaFilter} onChange={setZonaFilter} variant="full" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={FileText} label="Trámites (filtro)" value={filteredByZona.length} sub={`${pendingCount} en proceso`} />
        <StatCard icon={CheckCircle2} label="Aprobados" value={approvedCount} sub="En filtro actual" tone="success" />
        <StatCard icon={Clock} label="Tiempo prom." value="2.4 h" sub="Resolución" />
        <StatCard icon={Wallet} label="Recaudado (filtro)" value={`${totalValue.toFixed(1)} UF`} sub="≈ $" tone="accent" />
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
          <TabsTrigger value="list" className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" /> Lista
          </TabsTrigger>
          <TabsTrigger value="types" className="gap-1.5 text-xs">
            <Ship className="h-3.5 w-3.5" /> Tipos
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5 text-xs">
            <TrendingUp className="h-3.5 w-3.5" /> Estadísticas
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-1.5 text-xs">
            <CreditCard className="h-3.5 w-3.5" /> Pagos
          </TabsTrigger>
        </TabsList>

        {/* List */}
        <TabsContent value="list" className="space-y-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar folio, postulante, embarcación…"
                    className="h-9 pl-8 text-xs"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-full sm:w-44 text-xs">
                    <Filter className="h-3.5 w-3.5 mr-1.5" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="Borrador">Borrador</SelectItem>
                    <SelectItem value="Ingresado">Ingresado</SelectItem>
                    <SelectItem value="En Revisión">En Revisión</SelectItem>
                    <SelectItem value="Aprobado">Aprobado</SelectItem>
                    <SelectItem value="Rechazado">Rechazado</SelectItem>
                    <SelectItem value="Pagado">Pagado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Folio</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Tipo</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Postulante</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Embarcación</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Puerto</th>
                      <th className="text-right px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Monto</th>
                      <th className="text-center px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Estado</th>
                      <th className="text-right px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Progreso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => {
                      const cfg = STATUS_CONFIG[t.status];
                      const StatusIcon = cfg.icon;
                      return (
                        <tr key={t.folio} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-3 py-2.5">
                            <div className="font-mono-tabular font-semibold text-[11px]">{t.folio}</div>
                            <div className="text-[10px] text-muted-foreground">{fmtDateTime(t.submittedAt)}</div>
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge variant="outline" className="text-[10px]">{t.type}</Badge>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="font-medium truncate max-w-[180px]">{t.applicant}</div>
                            <div className="text-[10px] text-muted-foreground font-mono-tabular">{t.applicantRut}</div>
                          </td>
                          <td className="px-3 py-2.5 text-[11px]">{t.vessel}</td>
                          <td className="px-3 py-2.5 text-[11px]">{t.port}</td>
                          <td className="px-3 py-2.5 text-right font-mono-tabular font-semibold text-[11px]">{t.amount.toFixed(1)} UF</td>
                          <td className="px-3 py-2.5">
                            <div className="flex justify-center">
                              <Badge variant="outline" className={cn("text-[10px] gap-1", cfg.color)}>
                                <StatusIcon className={cn("h-2.5 w-2.5", t.status === "En Revisión" && "animate-spin")} />
                                {cfg.label}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2 justify-end">
                              <Progress value={t.progress} className="h-1.5 w-16" />
                              <span className="font-mono-tabular text-[10px] text-muted-foreground w-8 text-right">{t.progress}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-border">
                {filtered.map((t) => {
                  const cfg = STATUS_CONFIG[t.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={t.folio} className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-mono-tabular font-semibold text-[11px]">{t.folio}</div>
                          <div className="text-sm font-semibold mt-0.5">{t.vessel}</div>
                          <div className="text-[10px] text-muted-foreground">{t.applicant}</div>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] gap-1 shrink-0", cfg.color)}>
                          <StatusIcon className={cn("h-2.5 w-2.5", t.status === "En Revisión" && "animate-spin")} />
                          {cfg.label}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span><Badge variant="outline" className="text-[10px]">{t.type}</Badge></span>
                        <span className="font-mono-tabular">{t.amount.toFixed(1)} UF · {t.port}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={t.progress} className="h-1.5 flex-1" />
                        <span className="font-mono-tabular text-[10px] text-muted-foreground">{t.progress}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No se encontraron trámites con los filtros aplicados
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Types */}
        <TabsContent value="types">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TRAMITE_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.id} className="hover:border-accent/50 transition-colors cursor-pointer" onClick={() => { setFormType(type.id); setShowNewForm(true); }}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-md bg-accent/10 text-accent flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{type.label}</div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{type.desc}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px]">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Wallet className="h-3 w-3" />
                            <span className="font-mono-tabular font-semibold text-foreground">{type.cost}</span>
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {type.time}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Stats */}
        <TabsContent value="stats" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Trámites por tipo</CardTitle>
                <CardDescription className="text-xs">Distribución del último mes</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-2.5">
                {[
                  { label: "Zarpe", value: 247, pct: 52 },
                  { label: "Certificados", value: 134, pct: 28 },
                  { label: "Permisos Especiales", value: 58, pct: 12 },
                  { label: "Inscripciones", value: 24, pct: 5 },
                  { label: "Renovaciones", value: 12, pct: 3 },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">{s.label}</span>
                      <span className="font-mono-tabular text-muted-foreground">{s.value} ({s.pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tiempo de resolución</CardTitle>
                <CardDescription className="text-xs">Mediana por tipo (horas)</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-2.5">
                {[
                  { label: "Zarpe", value: 2.4, target: 4 },
                  { label: "Certificados", value: 18, target: 24 },
                  { label: "Permisos Especiales", value: 36, target: 48 },
                  { label: "Inscripciones", value: 96, target: 120 },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-32 shrink-0">{s.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full", s.value < s.target ? "bg-emerald-500" : "bg-amber-500")}
                        style={{ width: `${Math.min((s.value / s.target) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="font-mono-tabular text-xs w-12 text-right">{s.value}h</span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-border text-[10px] text-muted-foreground">
                  Objetivo SLA: <span className="font-mono-tabular text-foreground">100% dentro de tiempo objetivo</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-accent" />
                Volumen semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-end gap-2 h-32">
                {[
                  { day: "Lun", val: 38 },
                  { day: "Mar", val: 42 },
                  { day: "Mié", val: 51 },
                  { day: "Jue", val: 47 },
                  { day: "Vie", val: 56 },
                  { day: "Sáb", val: 18 },
                  { day: "Dom", val: 12 },
                ].map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full bg-accent/20 rounded-t-sm relative" style={{ height: `${(d.val / 56) * 100}%` }}>
                      <div className="absolute inset-x-0 bottom-0 bg-accent rounded-t-sm" style={{ height: "100%" }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                    <span className="text-[10px] font-mono-tabular font-semibold">{d.val}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment */}
        <TabsContent value="payment" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Recaudado hoy</div>
                <div className="text-2xl font-bold tabular-nums mt-1">{totalValue.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">UF</span></div>
                <div className="text-[11px] text-muted-foreground mt-0.5">≈ $ {(totalValue * 38000).toLocaleString("es-CL")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Pendiente de pago</div>
                <div className="text-2xl font-bold tabular-nums mt-1">{tramites.filter((t) => t.status === "Ingresado").length} <span className="text-sm font-normal text-muted-foreground">trámites</span></div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Total: {tramites.filter((t) => t.status === "Ingresado").reduce((s, t) => s + t.amount, 0).toFixed(1)} UF</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Métodos habilitados</div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <Badge variant="outline" className="text-[10px]">WebPay</Badge>
                  <Badge variant="outline" className="text-[10px]">Transferencia</Badge>
                  <Badge variant="outline" className="text-[10px]">Tesorería</Badge>
                  <Badge variant="outline" className="text-[10px]">ClaveÚnica</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Transacciones recientes</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5">
                {tramites.filter((t) => t.status === "Pagado" || t.status === "Aprobado").map((t) => (
                  <div key={t.folio} className="flex items-center gap-3 px-3 py-2 rounded-md border border-border text-xs">
                    <div className="h-8 w-8 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono-tabular text-[11px] font-semibold">{t.folio}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{t.applicant}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono-tabular font-semibold text-[11px]">{t.amount.toFixed(1)} UF</div>
                      <div className="text-[10px] text-muted-foreground">{t.port}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New trámite dialog */}
      {showNewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <CardHeader className="pb-3 sticky top-0 bg-card border-b border-border z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-accent" />
                    Nuevo Trámite Marítimo
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Autenticado como: Compañía Marítima del Pacífico SpA · ClaveÚnica verificado · Ley 19.799
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowNewForm(false)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* === Plantillas rápidas === */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-3.5 w-3.5 text-accent" />
                  <Label className="text-xs font-semibold uppercase tracking-wider">Plantillas rápidas</Label>
                  <span className="text-[10px] text-muted-foreground ml-auto">Un clic llena el formulario</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {quickTemplates.map((tpl) => {
                    const Icon = tpl.icon;
                    return (
                      <button
                        key={tpl.id}
                        onClick={() => applyTemplate(tpl)}
                        className="flex flex-col items-center gap-1 p-2.5 rounded-md border border-border hover:border-accent/50 hover:bg-accent/5 transition-all text-center"
                      >
                        <div className="h-8 w-8 rounded-md bg-accent/10 text-accent flex items-center justify-center">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-medium leading-tight">{tpl.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-border pt-3" />

              {/* === Tipo de trámite === */}
              <div>
                <Label className="text-xs font-semibold">Tipo de trámite <span className="text-destructive">*</span></Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAMITE_TYPES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* === Datos del postulante === */}
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                  Datos del postulante
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">RUT <span className="text-destructive">*</span></Label>
                    <Input
                      value={formData.rut}
                      onChange={(e) => setField("rut", e.target.value)}
                      placeholder="76.123.456-7"
                      className="mt-1.5 text-xs font-mono-tabular"
                    />
                    <p className="text-[9px] text-muted-foreground mt-1">RUT de la empresa o persona postulante</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Embarcación <span className="text-destructive">*</span></Label>
                    <Input
                      value={formData.vessel}
                      onChange={(e) => setField("vessel", e.target.value)}
                      placeholder="Nombre de la nave"
                      className="mt-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* === Datos operativos === */}
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                  Datos operativos
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Puerto de zarpe / operación <span className="text-destructive">*</span></Label>
                    <Select value={formData.originPort} onValueChange={(v) => setField("originPort", v)}>
                      <SelectTrigger className="mt-1.5 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PORTS.map((p) => (
                          <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Puerto destino</Label>
                    <Input
                      value={formData.destinationPort}
                      onChange={(e) => setField("destinationPort", e.target.value)}
                      placeholder="Puerto de destino"
                      className="mt-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Calado (metros)</Label>
                    <Input
                      value={formData.draft}
                      onChange={(e) => setField("draft", e.target.value)}
                      placeholder="Ej: 8.5"
                      type="number"
                      step="0.1"
                      className="mt-1.5 text-xs font-mono-tabular"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Tripulación (n°)</Label>
                    <Input
                      value={formData.crew}
                      onChange={(e) => setField("crew", e.target.value)}
                      placeholder="Ej: 18"
                      type="number"
                      className="mt-1.5 text-xs font-mono-tabular"
                    />
                  </div>
                </div>
              </div>

              {/* === Carga y observaciones === */}
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                  Carga y observaciones
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold">Tipo de carga</Label>
                    <Input
                      value={formData.cargo}
                      onChange={(e) => setField("cargo", e.target.value)}
                      placeholder="Contenedor, granel, carga general, etc."
                      className="mt-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Observaciones</Label>
                    <textarea
                      value={formData.observations}
                      onChange={(e) => setField("observations", e.target.value)}
                      placeholder="Información adicional, restricciones, notas operativas…"
                      rows={3}
                      className="mt-1.5 w-full text-xs px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* === Resumen de costos === */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-border bg-muted/30 -mx-4 px-4 py-3">
                <div className="text-xs">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Costo</div>
                  <div className="font-mono-tabular font-bold mt-0.5">{TRAMITE_TYPES.find((t) => t.id === formType)?.cost}</div>
                </div>
                <div className="text-xs">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tiempo estimado</div>
                  <div className="font-bold mt-0.5">{TRAMITE_TYPES.find((t) => t.id === formType)?.time}</div>
                </div>
                <div className="text-xs">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Firma</div>
                  <div className="font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">Avanzada ✓</div>
                </div>
              </div>

              {/* === Validación de campos requeridos === */}
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className={cn("h-1.5 w-1.5 rounded-full", formData.rut && formData.vessel && formData.originPort ? "bg-emerald-500" : "bg-amber-500")} />
                <span>
                  {formData.rut && formData.vessel && formData.originPort
                    ? "Listo para enviar — todos los campos requeridos completos"
                    : "Completa los campos marcados con * para enviar"}
                </span>
              </div>

              {/* === Acciones === */}
              <div className="flex items-center gap-2 pt-2 border-t border-border sticky bottom-0 bg-card">
                <Button variant="outline" className="gap-1.5 text-xs flex-1">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Guardar borrador
                </Button>
                <Button
                  onClick={submitTramite}
                  disabled={formSubmitted || !formData.rut || !formData.vessel || !formData.originPort}
                  className="gap-1.5 text-xs flex-1"
                >
                  {formSubmitted ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enviando…</>
                  ) : (
                    <><Send className="h-3.5 w-3.5" /> Ingresar y Firmar</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  tone?: "success" | "accent";
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
          <div className={cn(
            "h-8 w-8 rounded-md flex items-center justify-center shrink-0",
            tone === "success" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : tone === "accent" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground",
          )}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
