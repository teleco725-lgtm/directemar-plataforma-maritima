"use client";

import { useState } from "react";
import {
  Book,
  Search,
  FileText,
  Scale,
  Globe,
  CheckCircle2,
  Download,
  ExternalLink,
  Calendar,
  Building2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NORMATIVA, fmtDate, type NormaItem } from "@/lib/directemar-data";

const TYPE_CONFIG: Record<NormaItem["tipo"], { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  "Decreto Supremo": { icon: FileText, color: "bg-accent/10 text-accent" },
  "Resolución EXENTA": { icon: FileText, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  "Ley": { icon: Scale, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  "Convenio Internacional": { icon: Globe, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  "Circular": { icon: FileText, color: "bg-muted text-muted-foreground" },
};

export function NormativaMaritima() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<NormaItem | null>(NORMATIVA[0]);

  const filtered = NORMATIVA.filter((n) => {
    if (typeFilter !== "all" && n.tipo !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        n.numero.toLowerCase().includes(q) ||
        n.materia.toLowerCase().includes(q) ||
        n.resumen.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const types = ["all", ...Array.from(new Set(NORMATIVA.map((n) => n.tipo)))];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Book className="h-6 w-6 text-accent" />
          Gobernanza Marítima
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Marco de gobernanza normativo aplicable · Vigente al {fmtDate(new Date().toISOString())}
        </p>
      </div>

      {/* Banner */}
      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-md bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Cumplimiento normativo integral del sistema</div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Esta plataforma ha sido diseñada bajo el marco normativo chileno e internacional vigente.
                Toda funcionalidad, registro y emisión de documentos cumple con las normas referenciadas a continuación,
                garantizando seguridad jurídica, validez probatoria y trazabilidad completa para auditorías internas y externas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número, materia, contenido…"
                className="h-9 pl-8 text-xs"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    "px-2.5 py-1 rounded text-[11px] font-medium border transition-colors whitespace-nowrap",
                    typeFilter === t
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {t === "all" ? "Todas" : t}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Documentos vigentes</CardTitle>
              <Badge variant="secondary" className="text-[10px]">{filtered.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-[600px] overflow-y-auto scrollbar-thin space-y-1.5 pr-1">
              {filtered.map((n) => {
                const cfg = TYPE_CONFIG[n.tipo];
                const Icon = cfg.icon;
                const isSelected = selected?.id === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setSelected(n)}
                    className={cn(
                      "w-full text-left p-3 rounded-md border transition-all",
                      isSelected
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/50 hover:bg-muted/30",
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={cn("h-7 w-7 rounded-md flex items-center justify-center shrink-0", cfg.color)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs">{n.numero}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{n.materia}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="outline" className="text-[9px] py-0">{n.tipo}</Badge>
                          {n.vigente && (
                            <span className="flex items-center gap-0.5 text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              Vigente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detail */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px]">{selected?.tipo}</Badge>
                  {selected?.vigente && (
                    <Badge className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Vigente
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{selected?.numero}</CardTitle>
                <CardDescription className="text-sm">{selected?.materia}</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs shrink-0">
                <Download className="h-3.5 w-3.5" />
                PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/30">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Promulgación</div>
                  <div className="font-mono-tabular">{selected && fmtDate(selected.fecha)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/30">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Emisor</div>
                  <div className="text-[11px] font-medium">DIRECTEMAR / Congreso / OMI</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Resumen</div>
              <p className="text-sm leading-relaxed">{selected?.resumen}</p>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Aplicación en el sistema</div>
              <div className="space-y-1.5">
                {selected && getAplicacionNorma(selected.id).map((app, i) => (
                  <div key={i} className="flex items-start gap-2 px-2.5 py-1.5 rounded-md border border-border text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs">{app}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Documentos relacionados</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { name: "Texto oficial", size: "PDF · 2.3 MB" },
                  { name: "Guía de aplicación", size: "PDF · 1.1 MB" },
                  { name: "Formato de cumplimiento", size: "XLSX · 145 KB" },
                  { name: "Histórico de modificaciones", size: "PDF · 680 KB" },
                ].map((doc) => (
                  <button
                    key={doc.name}
                    className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-muted/50 transition-colors text-left"
                  >
                    <FileText className="h-3.5 w-3.5 text-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{doc.name}</div>
                      <div className="text-[10px] text-muted-foreground">{doc.size}</div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getAplicacionNorma(id: string): string[] {
  const apps: Record<string, string[]> = {
    "N-001": [
      "Marco habilitante para todas las funciones de fiscalización y jurisdicción marítima del sistema.",
      "Define procedimientos administrativos aplicables a sanciones, instrucciones y resoluciones emitidas desde la plataforma.",
      "Habilita la validez de la bitácora auditante como registro oficial de actos administrativos.",
    ],
    "N-002": [
      "Cifrado de datos personales de tripulantes, patrones y postulantes a trámites.",
      "Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición) implementados en portal de usuario.",
      "Minimización de datos en formularios y consentimiento explícito para tratamiento.",
      "Registro de accesos a datos personales auditable y exportable.",
    ],
    "N-003": [
      "Consola VTS diseñada bajo estándar IALA V-103 para interoperabilidad con otros centros VTS.",
      "Formato de datos AIS conforme a la recomendación para intercambio internacional.",
      "Procedimientos operativos del operador VTS alineados a la guía V-103.",
    ],
    "N-004": [
      "Restricción de calado aplicada automáticamente a operaciones de zarpe en Puerto Montt.",
      "Validación cruzada con sistema AIS para denegar autorizaciones que excedan el calado máximo.",
      "Notificación automática a armadores y Capitanía de Puerto cuando se aplica la restricción.",
    ],
    "N-005": [
      "Recepción y procesamiento de datos AIS conforme a Capítulo V de SOLAS.",
      "Habilitación de comunicaciones GMDSS y registración en bitácora.",
      "Integración con sistemas de búsqueda y rescate (SAR) para respuesta coordinada.",
    ],
    "N-006": [
      "Registro de residuos en bitácora ambiental para buques tanque y de carga.",
      "Reporte automático de incidentes de contaminación a autoridad competente.",
      "Validación de certificados de aseguramiento P&I antes de autorizar zarpe.",
    ],
    "N-007": [
      "Publicación automática de resoluciones EXENTAS en portal de datos abiertos.",
      "API pública para consumo de datos operativos no sensibles.",
      "Plan de cumplimiento de transparencia publicado y actualizado mensualmente.",
    ],
    "N-008": [
      "Emisión de certificados y resoluciones con firma electrónica avanzada.",
      "Validez probatoria de documentos digitales en procedimientos administrativos y judiciales.",
      "Sellado de tiempo certificado para todos los actos administrativos emitidos.",
    ],
  };
  return apps[id] || [];
}
