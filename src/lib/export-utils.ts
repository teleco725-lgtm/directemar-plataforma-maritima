// Utilidad de generación de archivos de exportación
// Soporta: PDF, XLSX, DOCX, PPTX
// Genera archivos en el navegador y los descarga automáticamente.
// Estilo: reporte institucional profesional DIRECTEMAR.

import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Document as DocxDocument,
  Packer as DocxPacker,
  Paragraph as DocxParagraph,
  HeadingLevel as DocxHeadingLevel,
  Table as DocxTable,
  TableRow as DocxTableRow,
  TableCell as DocxTableCell,
  TextRun as DocxTextRun,
  WidthType as DocxWidthType,
  AlignmentType as DocxAlignmentType,
  Header as DocxHeader,
  Footer as DocxFooter,
  PageNumber as DocxPageNumber,
  TableOfContents as DocxTableOfContents,
  BorderStyle as DocxBorderStyle,
  ShadingType as DocxShadingType,
  TabStopType as DocxTabStopType,
  TabStopPosition as DocxTabStopPosition,
} from "docx";
import pptxgen from "pptxgenjs";

export type ExportFormat = "pdf" | "xlsx" | "docx" | "pptx";

export interface ExportColumn<T> {
  key: keyof T | string;
  label: string;
  format?: (row: T) => string;
  width?: number; // ancho relativo en columnas (PDF/XLSX)
}

export interface ExportPayload<T> {
  title: string;
  subtitle?: string;
  zonaMaritimaLabel?: string; // Filtro regional aplicado
  columns: ExportColumn<T>[];
  rows: T[];
  meta?: Record<string, string>; // Métricas y datos adicionales
  // Campos para reporte profesional:
  classification?: string; // Ej: "RESERVADO", "CONFIDENCIAL", "PÚBLICO"
  documentCode?: string; // Ej: "INFORME-VTS-2026-0042"
  preparedBy?: string; // Nombre del oficial que prepara
  reviewedBy?: string; // Nombre del revisor (opcional)
  executiveSummary?: string; // Resumen ejecutivo (1-2 párrafos)
  conclusions?: string[]; // Conclusiones numeradas
  recommendations?: string[]; // Recomendaciones
  // Datos para gráficos (PPTX)
  chartData?: Array<{ label: string; value: number; color?: string }>;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function sanitizeFilename(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 60);
}

function formatDate(): string {
  return new Date().toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateLong(): string {
  return new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(): string {
  return new Date().toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Constantes institucionales DIRECTEMAR
const INSTITUCION = {
  nombre: "DIRECTEMAR",
  nombreCompleto: "Dirección General del Territorio Marítimo y de Marina Mercante",
  nombreCompleto2: "Armada de Chile · Autoridad Marítima Nacional",
  // Colores institucionales (paleta marítima)
  colorPrimario: "#1A2B3A",      // Azul marino profundo
  colorSecundario: "#3E848A",    // Teal (acento)
  colorAcento: "#5DD5E0",        // Cyan claro
  colorTexto: "#1A2B3A",         // Texto principal
  colorTextoClaro: "#6B7280",    // Texto secundario
  colorFondoClaro: "#F5F7F8",    // Fondo claro
  colorBorde: "#D1D5DB",         // Bordes
  // Tipografía
  fontHeading: "helvetica",
  fontBody: "helvetica",
  fontMono: "courier",
};

// Generar código de documento automático
function generateDocumentCode(title: string): string {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 20)
    .toUpperCase();
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 9000 + 1000);
  return `${slug}-${year}-${seq}`;
}

// =============== XLSX ===============
export async function exportXlsx<T>(payload: ExportPayload<T>): Promise<void> {
  const { title, columns, rows, meta } = payload;
  const docCode = payload.documentCode || generateDocumentCode(title);
  const classification = payload.classification || "PÚBLICO";

  const headers = columns.map((c) => c.label);
  const data = rows.map((row) =>
    columns.map((c) => {
      if (c.format) return c.format(row);
      const val = (row as Record<string, unknown>)[c.key as string];
      return val == null ? "" : String(val);
    }),
  );

  // === Hoja 1: Portada institucional ===
  const portadaAoa: (string | number)[][] = [
    [INSTITUCION.nombre],
    [INSTITUCION.nombreCompleto],
    [INSTITUCION.nombreCompleto2],
    [""],
    [classification],
    [""],
    [title],
    ...(payload.subtitle ? [[payload.subtitle]] : []),
    [""],
    ["Código de documento:", docCode],
    ["Fecha de generación:", formatDateLong()],
    ["Hora de generación:", formatTime()],
    ...(payload.zonaMaritimaLabel ? [["Alcance:", payload.zonaMaritimaLabel]] : []),
    ["Total de registros:", String(rows.length)],
    ...(payload.preparedBy ? [["Preparado por:", payload.preparedBy]] : []),
    ...(payload.reviewedBy ? [["Revisado por:", payload.reviewedBy]] : []),
    [""],
    ["MARCO NORMATIVO APLICABLE"],
    ["DS (M) N° 1/1941 — Jurisdicción Marítima"],
    ["IALA V-103 — Estándares para Centros VTS"],
    ["Ley N° 21.719 — Protección de Datos Personales"],
    ["Ley N° 20.285 — Acceso a Información Pública"],
    [""],
    ["CLASIFICACIÓN: " + classification + " — Distribución controlada"],
  ];
  const wsPortada = XLSX.utils.aoa_to_sheet(portadaAoa);
  wsPortada["!cols"] = [{ wch: 30 }, { wch: 50 }];
  wsPortada["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } },
    { s: { r: 6, c: 0 }, e: { r: 6, c: 1 } },
  ];

  // === Hoja 2: Datos ===
  const wsData = XLSX.utils.aoa_to_sheet([headers, ...data]);
  wsData["!cols"] = headers.map((h, i) => ({
    wch: Math.max(h.length + 4, (columns[i]?.width || 14) + 4, 12),
  }));
  wsData["!autofilter"] = { ref: `A1:${XLSX.utils.encode_cell({ r: 0, c: headers.length - 1 })}` };

  // === Hoja 3: Metadatos y resumen ejecutivo ===
  const metaAoa: (string | number)[][] = [
    ["METADATOS DEL DOCUMENTO"],
    [""],
    ["Código", docCode],
    ["Clasificación", classification],
    ["Título", title],
    ...(payload.subtitle ? [["Subtítulo", payload.subtitle]] : []),
    ...(payload.zonaMaritimaLabel ? [["Alcance territorial", payload.zonaMaritimaLabel]] : []),
    ["Fecha de generación", formatDateLong()],
    ["Hora", formatTime()],
    ["Total de registros", String(rows.length)],
    ["Total de columnas", String(columns.length)],
    ...(payload.preparedBy ? [["Preparado por", payload.preparedBy]] : []),
    ...(payload.reviewedBy ? [["Revisado por", payload.reviewedBy]] : []),
    [""],
    ["MÉTRICAS PRINCIPALES"],
    [""],
  ];
  if (meta) {
    Object.entries(meta).forEach(([k, v]) => metaAoa.push([k, v]));
  }
  if (payload.executiveSummary) {
    metaAoa.push([""], ["RESUMEN EJECUTIVO"], [""], [payload.executiveSummary]);
  }
  if (payload.conclusions && payload.conclusions.length > 0) {
    metaAoa.push([""], ["CONCLUSIONES"], [""]);
    payload.conclusions.forEach((c, i) => metaAoa.push([`${i + 1}.`, c]));
  }
  if (payload.recommendations && payload.recommendations.length > 0) {
    metaAoa.push([""], ["RECOMENDACIONES"], [""]);
    payload.recommendations.forEach((r, i) => metaAoa.push([`${i + 1}.`, r]));
  }
  const wsMeta = XLSX.utils.aoa_to_sheet(metaAoa);
  wsMeta["!cols"] = [{ wch: 30 }, { wch: 80 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsPortada, "Portada");
  XLSX.utils.book_append_sheet(wb, wsData, "Datos");
  XLSX.utils.book_append_sheet(wb, wsMeta, "Metadatos");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  downloadBlob(blob, `${docCode}.xlsx`);
}

// =============== PDF ===============
export async function exportPdf<T>(payload: ExportPayload<T>): Promise<void> {
  const { title, subtitle, zonaMaritimaLabel, columns, rows, meta } = payload;
  const docCode = payload.documentCode || generateDocumentCode(title);
  const classification = payload.classification || "PÚBLICO";
  const preparedBy = payload.preparedBy || "Oficial VTS de turno";
  const pageWidth = 842; // A4 landscape
  const pageHeight = 595;
  const margin = 40;
  const contentWidth = pageWidth - 2 * margin;

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  // ============ PÁGINA 1: PORTADA INSTITUCIONAL ============
  // Fondo superior — banda navy con acento teal
  doc.setFillColor(26, 43, 58); // #1A2B3A
  doc.rect(0, 0, pageWidth, 180, "F");
  // Línea acento teal
  doc.setFillColor(62, 132, 138); // #3E848A
  doc.rect(0, 180, pageWidth, 4, "F");

  // Logo placeholder — ancla simulada
  doc.setDrawColor(93, 213, 224);
  doc.setLineWidth(2);
  doc.circle(80, 90, 28);
  doc.setLineWidth(1.5);
  doc.line(80, 62, 80, 118);
  doc.line(66, 80, 94, 80); // travesaño
  doc.setFontSize(7);
  doc.setTextColor(93, 213, 224);
  doc.setFont("helvetica", "bold");
  doc.text("ANCHOR", 80, 138, { align: "center" });

  // Texto institucional
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(INSTITUCION.nombre, 140, 80);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 200, 210);
  doc.text(INSTITUCION.nombreCompleto, 140, 100);
  doc.text(INSTITUCION.nombreCompleto2, 140, 114);

  // Clasificación del documento
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(93, 213, 224);
  doc.text("CLASIFICACIÓN:", 140, 138);
  doc.setTextColor(255, 255, 255);
  doc.text(classification, 220, 138);

  // Cuerpo de portada
  let y = 240;
  doc.setTextColor(26, 43, 58);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, y);

  y += 28;
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(subtitle, margin, y);
    y += 20;
  }

  // Línea separadora
  doc.setDrawColor(62, 132, 138);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  // Tabla de metadatos del documento
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 43, 58);

  const metaRows: Array<[string, string]> = [
    ["Código de documento", docCode],
    ["Fecha de generación", formatDateLong()],
    ["Hora", formatTime()],
    ["Alcance territorial", zonaMaritimaLabel || "Nacional — Todo Chile"],
    ["Total de registros", String(rows.length)],
    ["Total de columnas", String(columns.length)],
    ["Preparado por", preparedBy],
    ...(payload.reviewedBy ? [["Revisado por", payload.reviewedBy] as [string, string]] : []),
  ];

  metaRows.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(107, 114, 128);
    doc.text(k + ":", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(26, 43, 58);
    doc.text(v, margin + 160, y);
    y += 18;
  });

  // Resumen ejecutivo en portada
  if (payload.executiveSummary) {
    y += 14;
    doc.setDrawColor(62, 132, 138);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 18;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 43, 58);
    doc.text("RESUMEN EJECUTIVO", margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(payload.executiveSummary, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 10;
  }

  // Marco normativo al pie de portada
  y = pageHeight - 100;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "bold");
  doc.text("MARCO NORMATIVO APLICABLE", margin, y);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.text("DS (M) N° 1/1941 · IALA V-103 · Ley N° 21.719 · Ley N° 20.285 · Ley N° 19.799 · SOLAS · MARPOL", margin, y);
  y += 10;
  doc.setFont("helvetica", "italic");
  doc.text(`Documento generado automáticamente por la Plataforma Marítima Nacional — ${formatDate()}`, margin, y);

  // ============ PÁGINA 2: TABLA DE DATOS ============
  doc.addPage();

  // Encabezado institucional en cada página
  const drawHeader = () => {
    doc.setFillColor(26, 43, 58);
    doc.rect(0, 0, pageWidth, 36, "F");
    doc.setFillColor(62, 132, 138);
    doc.rect(0, 36, pageWidth, 2, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(INSTITUCION.nombre, margin, 22);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 200, 210);
    doc.text(docCode, pageWidth - margin, 22, { align: "right" });
    doc.text(classification, pageWidth - margin, 32, { align: "right" });
  };
  drawHeader();

  // Título de sección
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 43, 58);
  doc.text(title, margin, 60);
  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(subtitle, margin, 74);
  }

  // Línea de filtros
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(107, 114, 128);
  const filterLine = `Alcance: ${zonaMaritimaLabel || "Nacional"}   ·   Generado: ${formatDateLong()} ${formatTime()}   ·   ${rows.length} registros`;
  doc.text(filterLine, margin, 88);

  // Tabla
  const head = [columns.map((c) => c.label)];
  const body = rows.map((row) =>
    columns.map((c) => {
      if (c.format) return c.format(row);
      const val = (row as Record<string, unknown>)[c.key as string];
      return val == null ? "" : String(val);
    }),
  );

  autoTable(doc, {
    head,
    body,
    startY: 100,
    styles: {
      fontSize: 8,
      cellPadding: 4,
      lineColor: [220, 220, 220],
      lineWidth: 0.3,
      textColor: [26, 43, 58],
    },
    headStyles: {
      fillColor: [62, 132, 138],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 248],
    },
    margin: { left: margin, right: margin, top: 110 },
    didDrawPage: () => {
      drawHeader();
    },
  });

  // ============ PÁGINA FINAL: MÉTRICAS Y CONCLUSIONES ============
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 100;
  const needsNewPage = finalY > pageHeight - 200;

  if (meta || payload.conclusions || payload.recommendations) {
    if (needsNewPage) doc.addPage();
    let metaY = needsNewPage ? 100 : finalY + 30;

    // Métricas principales
    if (meta) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 43, 58);
      doc.text("MÉTRICAS PRINCIPALES", margin, metaY);
      metaY += 16;

      doc.setFontSize(9);
      Object.entries(meta).forEach(([k, v]) => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(107, 114, 128);
        doc.text(k, margin, metaY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(26, 43, 58);
        doc.text(String(v), margin + 180, metaY);
        metaY += 14;
      });
      metaY += 16;
    }

    // Conclusiones
    if (payload.conclusions && payload.conclusions.length > 0) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 43, 58);
      doc.text("CONCLUSIONES", margin, metaY);
      metaY += 16;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      payload.conclusions.forEach((c, i) => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(62, 132, 138);
        doc.text(`${i + 1}.`, margin, metaY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        const lines = doc.splitTextToSize(c, contentWidth - 20);
        doc.text(lines, margin + 20, metaY);
        metaY += lines.length * 12 + 4;
      });
      metaY += 16;
    }

    // Recomendaciones
    if (payload.recommendations && payload.recommendations.length > 0) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 43, 58);
      doc.text("RECOMENDACIONES", margin, metaY);
      metaY += 16;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      payload.recommendations.forEach((r, i) => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(62, 132, 138);
        doc.text(`${i + 1}.`, margin, metaY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        const lines = doc.splitTextToSize(r, contentWidth - 20);
        doc.text(lines, margin + 20, metaY);
        metaY += lines.length * 12 + 4;
      });
    }
  }

  // ============ FOOTER EN TODAS LAS PÁGINAS ============
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 24, pageWidth - margin, pageHeight - 24);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${INSTITUCION.nombreCompleto} · ${classification}`,
      margin,
      pageHeight - 12,
    );
    doc.setFont("helvetica", "italic");
    doc.text(
      `${docCode} · Página ${i} de ${pageCount}`,
      pageWidth - margin,
      pageHeight - 12,
      { align: "right" },
    );
  }

  doc.save(`${docCode}.pdf`);
}

// =============== DOCX ===============
export async function exportDocx<T>(payload: ExportPayload<T>): Promise<void> {
  const { title, subtitle, zonaMaritimaLabel, columns, rows, meta } = payload;
  const docCode = payload.documentCode || generateDocumentCode(title);
  const classification = payload.classification || "PÚBLICO";
  const preparedBy = payload.preparedBy || "Oficial VTS de turno";
  const COL_PRIMARY = "1A2B3A";
  const COL_SECONDARY = "3E848A";
  const COL_TEXT_MUTED = "6B7280";

  // ============ Sección 1: Portada ============
  const portadaParagraphs: InstanceType<typeof DocxParagraph>[] = [
    // Banda institucional superior
    new DocxParagraph({
      alignment: DocxAlignmentType.CENTER,
      shading: { type: DocxShadingType.SOLID, color: COL_PRIMARY, fill: COL_PRIMARY },
      children: [
        new DocxTextRun({ text: " ", color: "FFFFFF", size: 28 }),
      ],
      spacing: { before: 200, after: 0 },
    }),
    new DocxParagraph({
      alignment: DocxAlignmentType.CENTER,
      shading: { type: DocxShadingType.SOLID, color: COL_PRIMARY, fill: COL_PRIMARY },
      children: [
        new DocxTextRun({
          text: INSTITUCION.nombre,
          bold: true,
          color: "FFFFFF",
          size: 36,
          font: "Helvetica",
        }),
      ],
      spacing: { before: 0, after: 80 },
    }),
    new DocxParagraph({
      alignment: DocxAlignmentType.CENTER,
      shading: { type: DocxShadingType.SOLID, color: COL_PRIMARY, fill: COL_PRIMARY },
      children: [
        new DocxTextRun({
          text: INSTITUCION.nombreCompleto,
          color: "B0C8D8",
          size: 20,
        }),
      ],
      spacing: { before: 0, after: 0 },
    }),
    new DocxParagraph({
      alignment: DocxAlignmentType.CENTER,
      shading: { type: DocxShadingType.SOLID, color: COL_PRIMARY, fill: COL_PRIMARY },
      children: [
        new DocxTextRun({
          text: INSTITUCION.nombreCompleto2,
          color: "B0C8D8",
          size: 18,
          italics: true,
        }),
      ],
      spacing: { before: 0, after: 200 },
    }),
    // Clasificación
    new DocxParagraph({
      alignment: DocxAlignmentType.CENTER,
      children: [
        new DocxTextRun({
          text: `[ ${classification} ]`,
          bold: true,
          color: COL_SECONDARY,
          size: 22,
        }),
      ],
      spacing: { before: 400, after: 600 },
    }),
    // Título principal
    new DocxParagraph({
      alignment: DocxAlignmentType.CENTER,
      heading: DocxHeadingLevel.TITLE,
      children: [
        new DocxTextRun({
          text: title,
          bold: true,
          color: COL_PRIMARY,
          size: 48,
        }),
      ],
      spacing: { before: 0, after: 200 },
    }),
    // Subtítulo
    ...(subtitle
      ? [
          new DocxParagraph({
            alignment: DocxAlignmentType.CENTER,
            children: [
              new DocxTextRun({
                text: subtitle,
                color: COL_TEXT_MUTED,
                size: 24,
                italics: true,
              }),
            ],
            spacing: { before: 0, after: 400 },
          }),
        ]
      : []),
    // Línea divisora
    new DocxParagraph({
      alignment: DocxAlignmentType.CENTER,
      border: {
        bottom: { color: COL_SECONDARY, style: DocxBorderStyle.SINGLE, size: 12 },
      },
      children: [new DocxTextRun({ text: "" })],
      spacing: { before: 0, after: 300 },
    }),
    // Metadatos del documento — tabla centrada
    new DocxParagraph({
      alignment: DocxAlignmentType.CENTER,
      children: [
        new DocxTextRun({ text: "FICHA DEL DOCUMENTO", bold: true, color: COL_PRIMARY, size: 22 }),
      ],
      spacing: { before: 0, after: 200 },
    }),
  ];

  // Tabla de metadatos
  const metaDocRows: Array<[string, string]> = [
    ["Código de documento", docCode],
    ["Clasificación", classification],
    ["Fecha de generación", formatDateLong()],
    ["Hora", formatTime()],
    ["Alcance territorial", zonaMaritimaLabel || "Nacional — Todo Chile"],
    ["Total de registros", String(rows.length)],
    ["Total de columnas", String(columns.length)],
    ["Preparado por", preparedBy],
    ...(payload.reviewedBy ? [["Revisado por", payload.reviewedBy] as [string, string]] : []),
  ];

  const metaDocTable = new DocxTable({
    rows: metaDocRows.map(
      ([k, v]) =>
        new DocxTableRow({
          children: [
            new DocxTableCell({
              width: { size: 40, type: DocxWidthType.PERCENTAGE },
              shading: { type: DocxShadingType.SOLID, color: "F5F7F8", fill: "F5F7F8" },
              children: [
                new DocxParagraph({
                  children: [new DocxTextRun({ text: k, bold: true, color: COL_PRIMARY, size: 20 })],
                }),
              ],
            }),
            new DocxTableCell({
              width: { size: 60, type: DocxWidthType.PERCENTAGE },
              children: [
                new DocxParagraph({
                  children: [new DocxTextRun({ text: v, color: COL_PRIMARY, size: 20 })],
                }),
              ],
            }),
          ],
        }),
    ),
    width: { size: 80, type: DocxWidthType.PERCENTAGE },
    alignment: DocxAlignmentType.CENTER,
  });

  // Marco normativo al pie de portada
  const marcoNormativo: InstanceType<typeof DocxParagraph>[] = [
    new DocxParagraph({
      alignment: DocxAlignmentType.CENTER,
      border: {
        top: { color: "D1D5DB", style: DocxBorderStyle.SINGLE, size: 6 },
      },
      children: [new DocxTextRun({ text: "" })],
      spacing: { before: 400, after: 200 },
    }),
    new DocxParagraph({
      alignment: DocxAlignmentType.CENTER,
      children: [
        new DocxTextRun({ text: "MARCO NORMATIVO APLICABLE", bold: true, color: COL_TEXT_MUTED, size: 18 }),
      ],
      spacing: { before: 0, after: 80 },
    }),
    new DocxParagraph({
      alignment: DocxAlignmentType.CENTER,
      children: [
        new DocxTextRun({
          text: "DS (M) N° 1/1941  ·  IALA V-103  ·  Ley N° 21.719  ·  Ley N° 20.285  ·  Ley N° 19.799  ·  SOLAS  ·  MARPOL",
          color: COL_TEXT_MUTED, size: 16,
        }),
      ],
      spacing: { before: 0, after: 0 },
    }),
  ];

  // ============ Sección 2: Cuerpo del documento ============

  // Encabezado institucional (Header de página)
  const headerSection = new DocxHeader({
    children: [
      new DocxParagraph({
        alignment: DocxAlignmentType.LEFT,
        border: {
          bottom: { color: COL_SECONDARY, style: DocxBorderStyle.SINGLE, size: 8 },
        },
        children: [
          new DocxTextRun({ text: INSTITUCION.nombre, bold: true, color: COL_PRIMARY, size: 16 }),
          new DocxTextRun({ text: "\t\t", color: COL_TEXT_MUTED }),
          new DocxTextRun({ text: docCode, color: COL_TEXT_MUTED, size: 14 }),
        ],
        tabStops: [
          { type: DocxTabStopType.RIGHT, position: DocxTabStopPosition.MAX },
        ],
      }),
    ],
  });

  // Footer con paginación
  const footerSection = new DocxFooter({
    children: [
      new DocxParagraph({
        alignment: DocxAlignmentType.LEFT,
        border: {
          top: { color: "D1D5DB", style: DocxBorderStyle.SINGLE, size: 6 },
        },
        children: [
          new DocxTextRun({
            text: `${INSTITUCION.nombreCompleto}  ·  ${classification}`,
            color: COL_TEXT_MUTED, size: 14, italics: true,
          }),
          new DocxTextRun({ text: "\t\t", color: COL_TEXT_MUTED }),
          new DocxTextRun({ text: "Página ", color: COL_TEXT_MUTED, size: 14 }),
          new DocxTextRun({ children: [DocxPageNumber.CURRENT], color: COL_TEXT_MUTED, size: 14 }),
          new DocxTextRun({ text: " de ", color: COL_TEXT_MUTED, size: 14 }),
          new DocxTextRun({ children: [DocxPageNumber.TOTAL_PAGES], color: COL_TEXT_MUTED, size: 14 }),
        ],
        tabStops: [
          { type: DocxTabStopType.RIGHT, position: DocxTabStopPosition.MAX },
        ],
      }),
    ],
  });

  // Resumen ejecutivo
  const cuerpoParagraphs: InstanceType<typeof DocxParagraph>[] = [];

  if (payload.executiveSummary) {
    cuerpoParagraphs.push(
      new DocxParagraph({
        heading: DocxHeadingLevel.HEADING_1,
        children: [new DocxTextRun({ text: "Resumen Ejecutivo", bold: true, color: COL_PRIMARY })],
        spacing: { before: 200, after: 120 },
      }),
      new DocxParagraph({
        alignment: DocxAlignmentType.JUSTIFIED,
        children: [
          new DocxTextRun({
            text: payload.executiveSummary,
            size: 22,
            color: "333333",
          }),
        ],
        spacing: { after: 200 },
      }),
    );
  }

  // Tabla de contenidos
  cuerpoParagraphs.push(
    new DocxParagraph({
      heading: DocxHeadingLevel.HEADING_1,
      children: [new DocxTextRun({ text: "Índice", bold: true, color: COL_PRIMARY })],
      spacing: { before: 200, after: 120 },
    }),
    new DocxTableOfContents("Tabla de Contenidos", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    new DocxParagraph({ text: "", spacing: { after: 200 } }),
  );

  // Sección de datos
  cuerpoParagraphs.push(
    new DocxParagraph({
      heading: DocxHeadingLevel.HEADING_1,
      children: [new DocxTextRun({ text: "Datos del Reporte", bold: true, color: COL_PRIMARY })],
      spacing: { before: 200, after: 80 },
    }),
    new DocxParagraph({
      children: [
        new DocxTextRun({
          text: zonaMaritimaLabel
            ? `Alcance territorial: ${zonaMaritimaLabel}.  `
            : "Alcance: Nacional.  ",
          bold: true, color: COL_TEXT_MUTED, size: 20,
        }),
        new DocxTextRun({
          text: `Total de registros: ${rows.length}.`,
          color: COL_TEXT_MUTED, size: 20,
        }),
      ],
      spacing: { after: 200 },
    }),
  );

  // Tabla de datos
  const headerRow = new DocxTableRow({
    tableHeader: true,
    children: columns.map(
      (c) =>
        new DocxTableCell({
          shading: { type: DocxShadingType.SOLID, color: COL_SECONDARY, fill: COL_SECONDARY },
          children: [
            new DocxParagraph({
              children: [new DocxTextRun({ text: c.label, bold: true, color: "FFFFFF", size: 18 })],
              alignment: DocxAlignmentType.LEFT,
            }),
          ],
          width: { size: Math.floor(100 / columns.length), type: DocxWidthType.PERCENTAGE },
        }),
    ),
  });

  const dataRows = rows.map(
    (row, idx) =>
      new DocxTableRow({
        children: columns.map(
          (c) =>
            new DocxTableCell({
              shading: idx % 2 === 0
                ? { type: DocxShadingType.SOLID, color: "F5F7F8", fill: "F5F7F8" }
                : undefined,
              children: [
                new DocxParagraph({
                  children: [
                    new DocxTextRun({
                      text: (() => {
                        if (c.format) return c.format(row);
                        const val = (row as Record<string, unknown>)[c.key as string];
                        return val == null ? "" : String(val);
                      })(),
                      size: 18,
                      color: COL_PRIMARY,
                    }),
                  ],
                }),
              ],
              width: { size: Math.floor(100 / columns.length), type: DocxWidthType.PERCENTAGE },
            }),
        ),
      }),
  );

  const table = new DocxTable({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: DocxWidthType.PERCENTAGE },
    borders: {
      top: { color: COL_SECONDARY, style: DocxBorderStyle.SINGLE, size: 4 },
      bottom: { color: COL_SECONDARY, style: DocxBorderStyle.SINGLE, size: 4 },
      left: { color: "D1D5DB", style: DocxBorderStyle.SINGLE, size: 2 },
      right: { color: "D1D5DB", style: DocxBorderStyle.SINGLE, size: 2 },
      insideHorizontal: { color: "D1D5DB", style: DocxBorderStyle.SINGLE, size: 2 },
      insideVertical: { color: "D1D5DB", style: DocxBorderStyle.SINGLE, size: 2 },
    },
  });

  cuerpoParagraphs.push(table, new DocxParagraph({ text: "", spacing: { after: 200 } }));

  // Métricas
  if (meta) {
    cuerpoParagraphs.push(
      new DocxParagraph({
        heading: DocxHeadingLevel.HEADING_1,
        children: [new DocxTextRun({ text: "Métricas Principales", bold: true, color: COL_PRIMARY })],
        spacing: { before: 300, after: 120 },
      }),
    );
    Object.entries(meta).forEach(([k, v]) => {
      cuerpoParagraphs.push(
        new DocxParagraph({
          children: [
            new DocxTextRun({ text: `• ${k}: `, bold: true, color: COL_PRIMARY, size: 20 }),
            new DocxTextRun({ text: String(v), color: "333333", size: 20 }),
          ],
          spacing: { after: 60 },
        }),
      );
    });
  }

  // Conclusiones
  if (payload.conclusions && payload.conclusions.length > 0) {
    cuerpoParagraphs.push(
      new DocxParagraph({
        heading: DocxHeadingLevel.HEADING_1,
        children: [new DocxTextRun({ text: "Conclusiones", bold: true, color: COL_PRIMARY })],
        spacing: { before: 300, after: 120 },
      }),
    );
    payload.conclusions.forEach((c, i) => {
      cuerpoParagraphs.push(
        new DocxParagraph({
          alignment: DocxAlignmentType.JUSTIFIED,
          children: [
            new DocxTextRun({ text: `${i + 1}. `, bold: true, color: COL_SECONDARY, size: 22 }),
            new DocxTextRun({ text: c, color: "333333", size: 22 }),
          ],
          spacing: { after: 100 },
        }),
      );
    });
  }

  // Recomendaciones
  if (payload.recommendations && payload.recommendations.length > 0) {
    cuerpoParagraphs.push(
      new DocxParagraph({
        heading: DocxHeadingLevel.HEADING_1,
        children: [new DocxTextRun({ text: "Recomendaciones", bold: true, color: COL_PRIMARY })],
        spacing: { before: 300, after: 120 },
      }),
    );
    payload.recommendations.forEach((r, i) => {
      cuerpoParagraphs.push(
        new DocxParagraph({
          alignment: DocxAlignmentType.JUSTIFIED,
          children: [
            new DocxTextRun({ text: `${i + 1}. `, bold: true, color: COL_SECONDARY, size: 22 }),
            new DocxTextRun({ text: r, color: "333333", size: 22 }),
          ],
          spacing: { after: 100 },
        }),
      );
    });
  }

  // ============ Documento con dos secciones ============
  const doc = new DocxDocument({
    creator: INSTITUCION.nombre,
    title: title,
    description: subtitle || "Reporte institucional DIRECTEMAR",
    sections: [
      // Sección 1: Portada (sin headers/footers)
      {
        properties: {
          page: {
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
        children: [...portadaParagraphs, metaDocTable, ...marcoNormativo],
      },
      // Sección 2: Cuerpo con header y footer institucional
      {
        properties: {
          page: {
            margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 },
          },
        },
        headers: { default: headerSection },
        footers: { default: footerSection },
        children: cuerpoParagraphs,
      },
    ],
  });

  const blob = await DocxPacker.toBlob(doc);
  downloadBlob(blob, `${docCode}.docx`);
}

// =============== PPTX ===============
export async function exportPptx<T>(payload: ExportPayload<T>): Promise<void> {
  const { title, subtitle, zonaMaritimaLabel, columns, rows, meta } = payload;
  const docCode = payload.documentCode || generateDocumentCode(title);
  const classification = payload.classification || "PÚBLICO";
  const preparedBy = payload.preparedBy || "Oficial VTS de turno";

  const pptx = new pptxgen();
  pptx.defineLayout({ name: "DIRECTEMAR_16x9", width: 13.33, height: 7.5 });
  pptx.layout = "DIRECTEMAR_16x9";
  pptx.author = INSTITUCION.nombre;
  pptx.title = title;
  pptx.subject = subtitle || "Reporte institucional";

  // Definir master template con header y footer en cada slide
  pptx.defineSlideMaster({
    title: "DIRECTEMAR_MASTER",
    background: { color: "FFFFFF" },
    objects: [
      // Banda superior teal
      { rect: { x: 0, y: 0, w: 13.33, h: 0.18, fill: { color: "3E848A" } } },
      // Header izquierda — nombre institución
      {
        text: {
          text: INSTITUCION.nombre,
          options: {
            x: 0.4, y: 0.04, w: 6, h: 0.15,
            fontSize: 9, color: "1A2B3A", bold: true,
            fontFace: "Arial",
          },
        },
      },
      // Header derecha — código + clasificación
      {
        text: {
          text: `${docCode}  ·  ${classification}`,
          options: {
            x: 7, y: 0.04, w: 5.93, h: 0.15,
            fontSize: 8, color: "6B7280", align: "right",
            fontFace: "Arial",
          },
        },
      },
      // Footer línea separadora
      { rect: { x: 0.4, y: 7.18, w: 12.53, h: 0.005, fill: { color: "D1D5DB" } } },
      // Footer izquierda — institución
      {
        text: {
          text: INSTITUCION.nombreCompleto,
          options: {
            x: 0.4, y: 7.2, w: 8, h: 0.2,
            fontSize: 8, color: "6B7280", italic: true,
            fontFace: "Arial",
          },
        },
      },
      // Footer derecha — paginación
      {
        text: {
          text: "Página ",
          options: {
            x: 10, y: 7.2, w: 2.93, h: 0.2,
            fontSize: 8, color: "6B7280", align: "right",
            fontFace: "Arial",
          },
        },
      },
    ],
    slideNumber: { x: 12.5, y: 7.2, w: 0.5, h: 0.2, fontSize: 8, color: "6B7280", align: "right" },
  });

  // ============ Slide 1: PORTADA INSTITUCIONAL ============
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: "1A2B3A" };

  // Banda teal superior
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.4,
    fill: { color: "3E848A" },
    line: { color: "3E848A", width: 0 },
  });
  // Banda cyan inferior
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.1, w: 13.33, h: 0.4,
    fill: { color: "5DD5E0" },
    line: { color: "5DD5E0", width: 0 },
  });

  // Logo placeholder — círculo con ancla
  coverSlide.addShape(pptx.ShapeType.ellipse, {
    x: 5.92, y: 1.0, w: 1.5, h: 1.5,
    fill: { color: "3E848A" },
    line: { color: "5DD5E0", width: 2 },
  });
  coverSlide.addText("⚓", {
    x: 5.92, y: 1.0, w: 1.5, h: 1.5,
    fontSize: 36, color: "FFFFFF", align: "center", valign: "middle",
  });

  // Nombre institución
  coverSlide.addText(INSTITUCION.nombre, {
    x: 0.5, y: 2.6, w: 12.33, h: 0.5,
    fontSize: 28, color: "5DD5E0", bold: true,
    align: "center", fontFace: "Arial",
  });

  coverSlide.addText(INSTITUCION.nombreCompleto, {
    x: 0.5, y: 3.1, w: 12.33, h: 0.4,
    fontSize: 14, color: "B0C8D8",
    align: "center", fontFace: "Arial",
  });

  coverSlide.addText(INSTITUCION.nombreCompleto2, {
    x: 0.5, y: 3.5, w: 12.33, h: 0.3,
    fontSize: 11, color: "B0C8D8", italic: true,
    align: "center", fontFace: "Arial",
  });

  // Línea separadora
  coverSlide.addShape(pptx.ShapeType.line, {
    x: 4, y: 4.0, w: 5.33, h: 0,
    line: { color: "3E848A", width: 1 },
  });

  // Título del documento
  coverSlide.addText(title, {
    x: 0.5, y: 4.15, w: 12.33, h: 0.9,
    fontSize: 32, color: "FFFFFF", bold: true,
    align: "center", fontFace: "Arial",
  });

  if (subtitle) {
    coverSlide.addText(subtitle, {
      x: 0.5, y: 5.05, w: 12.33, h: 0.4,
      fontSize: 14, color: "B0C8D8", italic: true,
      align: "center", fontFace: "Arial",
    });
  }

  // Clasificación
  coverSlide.addText(`[ ${classification} ]`, {
    x: 0.5, y: 5.5, w: 12.33, h: 0.3,
    fontSize: 12, color: "5DD5E0", bold: true,
    align: "center", fontFace: "Arial",
  });

  // Metadatos del documento
  coverSlide.addText(
    `${docCode}   ·   ${formatDateLong()} ${formatTime()}   ·   ${rows.length} registros`,
    {
      x: 0.5, y: 6.0, w: 12.33, h: 0.3,
      fontSize: 10, color: "90A4AE",
      align: "center", fontFace: "Arial",
    },
  );

  // Preparado por
  coverSlide.addText(`Preparado por: ${preparedBy}`, {
    x: 0.5, y: 6.3, w: 12.33, h: 0.25,
    fontSize: 9, color: "607D8B",
    align: "center", fontFace: "Arial",
  });

  // ============ Slide 2: RESUMEN EJECUTIVO ============
  if (payload.executiveSummary) {
    const summarySlide = pptx.addSlide({ masterName: "DIRECTEMAR_MASTER" });
    summarySlide.addText("Resumen Ejecutivo", {
      x: 0.5, y: 0.5, w: 12.33, h: 0.6,
      fontSize: 24, color: "1A2B3A", bold: true,
      fontFace: "Arial",
    });
    summarySlide.addShape(pptx.ShapeType.line, {
      x: 0.5, y: 1.15, w: 12.33, h: 0,
      line: { color: "3E848A", width: 1.5 },
    });
    summarySlide.addText(payload.executiveSummary, {
      x: 0.8, y: 1.4, w: 11.73, h: 5.5,
      fontSize: 13, color: "333333",
      align: "left", valign: "top", fontFace: "Arial",
      lineSpacingMultiple: 1.5,
    });
  }

  // ============ Slide 3: KPIs / MÉTRICAS (Dashboard) ============
  if (meta && Object.keys(meta).length > 0) {
    const kpiSlide = pptx.addSlide({ masterName: "DIRECTEMAR_MASTER" });
    kpiSlide.addText("Métricas Principales", {
      x: 0.5, y: 0.5, w: 12.33, h: 0.6,
      fontSize: 24, color: "1A2B3A", bold: true,
      fontFace: "Arial",
    });
    kpiSlide.addShape(pptx.ShapeType.line, {
      x: 0.5, y: 1.15, w: 12.33, h: 0,
      line: { color: "3E848A", width: 1.5 },
    });

    // Grid de tarjetas KPI (3 columnas x N filas)
    const metaEntries = Object.entries(meta).slice(0, 9); // máximo 9 KPIs
    const cardsPerRow = 3;
    const cardW = 3.85;
    const cardH = 1.5;
    const gapX = 0.25;
    const gapY = 0.25;
    const startX = 0.5;
    const startY = 1.4;

    metaEntries.forEach(([k, v], i) => {
      const row = Math.floor(i / cardsPerRow);
      const col = i % cardsPerRow;
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);

      // Tarjeta fondo
      kpiSlide.addShape(pptx.ShapeType.rect, {
        x, y, w: cardW, h: cardH,
        fill: { color: "F5F7F8" },
        line: { color: "D1D5DB", width: 0.5 },
      });
      // Banda teal superior
      kpiSlide.addShape(pptx.ShapeType.rect, {
        x, y, w: cardW, h: 0.1,
        fill: { color: "3E848A" },
        line: { color: "3E848A", width: 0 },
      });
      // Etiqueta
      kpiSlide.addText(k.toUpperCase(), {
        x: x + 0.15, y: y + 0.2, w: cardW - 0.3, h: 0.3,
        fontSize: 10, color: "6B7280", bold: true,
        align: "left", fontFace: "Arial",
      });
      // Valor
      kpiSlide.addText(String(v), {
        x: x + 0.15, y: y + 0.55, w: cardW - 0.3, h: 0.8,
        fontSize: 22, color: "1A2B3A", bold: true,
        align: "left", valign: "top", fontFace: "Arial",
      });
    });

    // Si hay más de 9 métricas, mostrar nota
    if (Object.keys(meta).length > 9) {
      kpiSlide.addText(
        `+ ${Object.keys(meta).length - 9} métricas adicionales — ver documento XLSX/DOCX para detalle completo`,
        {
          x: 0.5, y: 6.5, w: 12.33, h: 0.3,
          fontSize: 9, color: "6B7280", italic: true,
          align: "center", fontFace: "Arial",
        },
      );
    }
  }

  // ============ Slide 4: TABLA DE DATOS ============
  if (rows.length > 0) {
    const dataSlide = pptx.addSlide({ masterName: "DIRECTEMAR_MASTER" });
    dataSlide.addText("Datos del Reporte", {
      x: 0.5, y: 0.5, w: 12.33, h: 0.6,
      fontSize: 24, color: "1A2B3A", bold: true,
      fontFace: "Arial",
    });

    dataSlide.addText(
      `${zonaMaritimaLabel ? "Alcance: " + zonaMaritimaLabel + "  ·  " : ""}${rows.length} registros  ·  ${columns.length} columnas`,
      {
        x: 0.5, y: 1.05, w: 12.33, h: 0.3,
        fontSize: 11, color: "6B7280", italic: true,
        fontFace: "Arial",
      },
    );

    dataSlide.addShape(pptx.ShapeType.line, {
      x: 0.5, y: 1.4, w: 12.33, h: 0,
      line: { color: "3E848A", width: 1.5 },
    });

    const tableRows: pptxgen.TableRow[] = [
      columns.map((c) => ({
        text: c.label,
        options: {
          bold: true, color: "FFFFFF",
          fill: { color: "1A2B3A" },
          fontSize: 9, fontFace: "Arial",
          align: "left", valign: "middle",
        },
      })),
      ...rows.slice(0, 12).map((row, idx) =>
        columns.map((c) => ({
          text: (() => {
            if (c.format) return c.format(row);
            const val = (row as Record<string, unknown>)[c.key as string];
            return val == null ? "" : String(val);
          })(),
          options: {
            color: "1A2B3A",
            fill: { color: idx % 2 === 0 ? "FFFFFF" : "F5F7F8" },
            fontSize: 9, fontFace: "Arial",
            align: "left", valign: "middle",
          },
        })),
      ),
    ];

    dataSlide.addTable(tableRows, {
      x: 0.5,
      y: 1.6,
      w: 12.33,
      colW: columns.map(() => 12.33 / columns.length),
      border: { type: "solid", pt: 0.5, color: "D1D5DB" },
      rowH: 0.4,
      valign: "middle",
    });

    if (rows.length > 12) {
      dataSlide.addText(
        `Mostrando 12 de ${rows.length} registros — exporte en XLSX o PDF para el detalle completo`,
        {
          x: 0.5, y: 6.7, w: 12.33, h: 0.3,
          fontSize: 9, color: "6B7280", italic: true,
          align: "center", fontFace: "Arial",
        },
      );
    }
  }

  // ============ Slide N: CONCLUSIONES ============
  if (payload.conclusions && payload.conclusions.length > 0) {
    const concSlide = pptx.addSlide({ masterName: "DIRECTEMAR_MASTER" });
    concSlide.addText("Conclusiones", {
      x: 0.5, y: 0.5, w: 12.33, h: 0.6,
      fontSize: 24, color: "1A2B3A", bold: true,
      fontFace: "Arial",
    });
    concSlide.addShape(pptx.ShapeType.line, {
      x: 0.5, y: 1.15, w: 12.33, h: 0,
      line: { color: "3E848A", width: 1.5 },
    });

    payload.conclusions.slice(0, 6).forEach((c, i) => {
      const y = 1.5 + i * 0.85;
      // Bullet con número
      concSlide.addShape(pptx.ShapeType.ellipse, {
        x: 0.5, y: y + 0.05, w: 0.45, h: 0.45,
        fill: { color: "3E848A" },
        line: { color: "3E848A", width: 0 },
      });
      concSlide.addText(String(i + 1), {
        x: 0.5, y: y + 0.05, w: 0.45, h: 0.45,
        fontSize: 14, color: "FFFFFF", bold: true,
        align: "center", valign: "middle", fontFace: "Arial",
      });
      // Texto
      concSlide.addText(c, {
        x: 1.15, y: y, w: 11.68, h: 0.7,
        fontSize: 12, color: "333333",
        align: "left", valign: "top", fontFace: "Arial",
        lineSpacingMultiple: 1.2,
      });
    });
  }

  // ============ Slide N: RECOMENDACIONES ============
  if (payload.recommendations && payload.recommendations.length > 0) {
    const recSlide = pptx.addSlide({ masterName: "DIRECTEMAR_MASTER" });
    recSlide.addText("Recomendaciones", {
      x: 0.5, y: 0.5, w: 12.33, h: 0.6,
      fontSize: 24, color: "1A2B3A", bold: true,
      fontFace: "Arial",
    });
    recSlide.addShape(pptx.ShapeType.line, {
      x: 0.5, y: 1.15, w: 12.33, h: 0,
      line: { color: "3E848A", width: 1.5 },
    });

    payload.recommendations.slice(0, 6).forEach((r, i) => {
      const y = 1.5 + i * 0.85;
      // Bullet con número
      recSlide.addShape(pptx.ShapeType.rect, {
        x: 0.5, y: y + 0.05, w: 0.45, h: 0.45,
        fill: { color: "5DD5E0" },
        line: { color: "5DD5E0", width: 0 },
      });
      recSlide.addText(String(i + 1), {
        x: 0.5, y: y + 0.05, w: 0.45, h: 0.45,
        fontSize: 14, color: "1A2B3A", bold: true,
        align: "center", valign: "middle", fontFace: "Arial",
      });
      // Texto
      recSlide.addText(r, {
        x: 1.15, y: y, w: 11.68, h: 0.7,
        fontSize: 12, color: "333333",
        align: "left", valign: "top", fontFace: "Arial",
        lineSpacingMultiple: 1.2,
      });
    });
  }

  // ============ Slide FINAL: MARCO NORMATIVO ============
  const normSlide = pptx.addSlide({ masterName: "DIRECTEMAR_MASTER" });
  normSlide.background = { color: "1A2B3A" };

  // Banda teal superior
  normSlide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.4,
    fill: { color: "3E848A" },
    line: { color: "3E848A", width: 0 },
  });

  normSlide.addText("Marco Normativo Aplicable", {
    x: 0.5, y: 1.5, w: 12.33, h: 0.6,
    fontSize: 24, color: "5DD5E0", bold: true,
    align: "center", fontFace: "Arial",
  });

  normSlide.addShape(pptx.ShapeType.line, {
    x: 4, y: 2.3, w: 5.33, h: 0,
    line: { color: "3E848A", width: 1 },
  });

  const normas = [
    "DS (M) N° 1/1941 — Reglamento General de Jurisdicción Marítima",
    "IALA V-103 — Estándares para Centros de Servicio de Tráfico Marítimo",
    "Ley N° 21.719 — Protección de Datos Personales",
    "Ley N° 20.285 — Acceso a la Información Pública",
    "Ley N° 19.799 — Documentos Electrónicos y Firma Electrónica",
    "SOLAS Cap. V — Seguridad de la Vida Humana en el Mar",
    "MARPOL — Prevención de Contaminación por Buques",
  ];

  normas.forEach((norma, i) => {
    normSlide.addText(norma, {
      x: 1.5, y: 2.7 + i * 0.45, w: 10.33, h: 0.4,
      fontSize: 12, color: "B0C8D8",
      align: "center", fontFace: "Arial",
    });
  });

  // Cierre institucional
  normSlide.addShape(pptx.ShapeType.line, {
    x: 4, y: 6.2, w: 5.33, h: 0,
    line: { color: "5DD5E0", width: 0.5 },
  });

  normSlide.addText(INSTITUCION.nombreCompleto, {
    x: 0.5, y: 6.4, w: 12.33, h: 0.3,
    fontSize: 11, color: "FFFFFF", bold: true,
    align: "center", fontFace: "Arial",
  });
  normSlide.addText("Armada de Chile · Autoridad Marítima Nacional", {
    x: 0.5, y: 6.7, w: 12.33, h: 0.3,
    fontSize: 10, color: "B0C8D8", italic: true,
    align: "center", fontFace: "Arial",
  });

  await pptx.writeFile({ fileName: `${docCode}.pptx` });
}

// =============== Dispatch ===============
export async function exportData<T>(
  format: ExportFormat,
  payload: ExportPayload<T>,
): Promise<void> {
  switch (format) {
    case "pdf":
      return exportPdf(payload);
    case "xlsx":
      return exportXlsx(payload);
    case "docx":
      return exportDocx(payload);
    case "pptx":
      return exportPptx(payload);
    default:
      throw new Error(`Formato no soportado: ${format}`);
  }
}
