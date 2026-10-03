"use client";

import { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  File as FileIcon,
  Loader2,
  Download,
  CheckCircle2,
  X,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  exportData,
  type ExportFormat,
  type ExportPayload,
} from "@/lib/export-utils";

interface ExportModalProps<T> {
  open: boolean;
  onClose: () => void;
  payload: ExportPayload<T>;
}

const FORMATS: Array<{
  id: ExportFormat;
  label: string;
  description: string;
  ext: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    id: "pdf",
    label: "Documento PDF",
    description: "Reporte formateado con tabla, encabezado y pie de página institucional. Ideal para imprimir o adjuntar.",
    ext: ".pdf",
    icon: FileText,
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  {
    id: "xlsx",
    label: "Hoja de cálculo Excel",
    description: "Datos tabulares editables con metadatos. Ideal para análisis posterior o filtros personalizados.",
    ext: ".xlsx",
    icon: FileSpreadsheet,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "docx",
    label: "Documento Word",
    description: "Documento editable con título, tabla e información institucional. Ideal para anexar a informes.",
    ext: ".docx",
    icon: FileIcon,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "pptx",
    label: "Presentación PowerPoint",
    description: "Slides con portada, tabla resumida y cierre institucional. Ideal para comités o reuniones.",
    ext: ".pptx",
    icon: Presentation,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
];

export function ExportModal<T>({ open, onClose, payload }: ExportModalProps<T>) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleExport = async () => {
    if (!selectedFormat) return;
    setStatus("generating");
    setErrorMsg("");
    try {
      await exportData(selectedFormat, payload);
      setStatus("done");
      setTimeout(() => {
        setStatus("idle");
        setSelectedFormat(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Export error:", err);
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido al generar el archivo");
      setTimeout(() => {
        setStatus("idle");
        setSelectedFormat(null);
      }, 3000);
    }
  };

  const handleClose = () => {
    if (status === "generating") return;
    setSelectedFormat(null);
    setStatus("idle");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Download className="h-4 w-4 text-accent" />
            Exportar datos
          </DialogTitle>
          <DialogDescription className="text-xs">
            Selecciona el formato de exportación. El archivo se descargará automáticamente.
          </DialogDescription>
        </DialogHeader>

        {/* Resumen del dataset */}
        <div className="rounded-md border border-border bg-muted/30 p-3 text-xs">
          <div className="flex items-start gap-2">
            <Info className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground">{payload.title}</div>
              {payload.subtitle && (
                <div className="text-muted-foreground mt-0.5">{payload.subtitle}</div>
              )}
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                <span>
                  <strong className="text-foreground">{payload.rows.length}</strong> registros
                </span>
                <span>·</span>
                <span>
                  <strong className="text-foreground">{payload.columns.length}</strong> columnas
                </span>
                {payload.zonaMaritimaLabel && (
                  <>
                    <span>·</span>
                    <span className="truncate">
                      Filtro: <strong className="text-foreground">{payload.zonaMaritimaLabel}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selector de formato */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FORMATS.map((fmt) => {
            const Icon = fmt.icon;
            const isSelected = selectedFormat === fmt.id;
            const isGenerating = status === "generating" && isSelected;
            const isDone = status === "done" && isSelected;
            return (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                disabled={status === "generating"}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-md border text-left transition-all",
                  isSelected
                    ? "border-accent bg-accent/5 shadow-sm"
                    : "border-border hover:border-accent/50 hover:bg-muted/30",
                  status === "generating" && "opacity-50 cursor-not-allowed",
                )}
              >
                <div className={cn("h-9 w-9 rounded-md flex items-center justify-center shrink-0", fmt.color)}>
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">{fmt.label}</span>
                    <span className="text-[10px] font-mono-tabular text-muted-foreground uppercase">{fmt.ext}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                    {fmt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {status === "error" && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
            {errorMsg}
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={status === "generating"}
            className="text-xs"
          >
            <X className="h-3.5 w-3.5" />
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={!selectedFormat || status === "generating"}
            className="gap-1.5 text-xs"
          >
            {status === "generating" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generando…
              </>
            ) : status === "done" ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Descargado
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                Exportar{selectedFormat ? ` ${selectedFormat.toUpperCase()}` : ""}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
