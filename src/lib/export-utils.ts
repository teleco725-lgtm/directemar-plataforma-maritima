// Utilidad de generación de archivos de exportación
// Soporta: PDF, XLSX, DOCX, PPTX
// Genera archivos en el navegador y los descarga automáticamente.

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
} from "docx";
import pptxgen from "pptxgenjs";

export type ExportFormat = "pdf" | "xlsx" | "docx" | "pptx";

export interface ExportColumn<T> {
  key: keyof T | string;
  label: string;
  format?: (row: T) => string;
}

export interface ExportPayload<T> {
  title: string;
  subtitle?: string;
  zonaMaritimaLabel?: string; // Filtro regional aplicado
  columns: ExportColumn<T>[];
  rows: T[];
  meta?: Record<string, string>; // Información adicional (total, fecha, etc.)
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

// =============== XLSX ===============
export async function exportXlsx<T>(payload: ExportPayload<T>): Promise<void> {
  const { title, columns, rows, meta } = payload;

  const headers = columns.map((c) => c.label);
  const data = rows.map((row) =>
    columns.map((c) => {
      if (c.format) return c.format(row);
      const val = (row as Record<string, unknown>)[c.key as string];
      return val == null ? "" : String(val);
    }),
  );

  // Cabecera informativa
  const infoRows: (string | number)[][] = [
    [title],
    ...(payload.subtitle ? [[payload.subtitle]] : []),
    ...(payload.zonaMaritimaLabel ? [[`Filtro regional: ${payload.zonaMaritimaLabel}`]] : []),
    [`Generado: ${formatDate()}`],
    [],
  ];

  const wsInfo = XLSX.utils.aoa_to_sheet(infoRows);
  const wsData = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Combinar ambas hojas en una sola
  const ws = XLSX.utils.aoa_to_sheet([
    ...infoRows,
    headers,
    ...data,
  ]);

  // Aplicar anchos de columna
  ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 2, 14) }));

  // Merge título
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
  ];

  // Meta info al final
  if (meta) {
    const metaStartRow = infoRows.length + data.length + 2;
    Object.entries(meta).forEach(([k, v], i) => {
      const cellRef = XLSX.utils.encode_cell({ r: metaStartRow + i, c: 0 });
      ws[cellRef] = { t: "s", v: `${k}: ${v}` };
    });
  }

  void wsInfo;
  void wsData;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Exportación");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  downloadBlob(blob, `${sanitizeFilename(payload.title)}.xlsx`);
}

// =============== PDF ===============
export async function exportPdf<T>(payload: ExportPayload<T>): Promise<void> {
  const { title, subtitle, zonaMaritimaLabel, columns, rows, meta } = payload;

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  // Encabezado
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 40, 40);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(subtitle, 40, 58);
    doc.setTextColor(0);
  }

  // Filtro regional
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  const filterLine = zonaMaritimaLabel
    ? `Filtro regional: ${zonaMaritimaLabel}  ·  Generado: ${formatDate()}  ·  ${rows.length} registros`
    : `Generado: ${formatDate()}  ·  ${rows.length} registros`;
  doc.text(filterLine, 40, subtitle ? 76 : 58);

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
    startY: subtitle ? 90 : 72,
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [62, 132, 138], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 245, 245] },
    margin: { left: 40, right: 40 },
  });

  // Meta info al final
  if (meta) {
    const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 200;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    let y = finalY + 30;
    Object.entries(meta).forEach(([k, v]) => {
      doc.text(`${k}:`, 40, y);
      doc.setFont("helvetica", "normal");
      doc.text(v, 120, y);
      doc.setFont("helvetica", "bold");
      y += 14;
    });
  }

  // Footer con paginación
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `DIRECTEMAR · Plataforma Marítima Nacional · Página ${i} de ${pageCount}`,
      40,
      doc.internal.pageSize.getHeight() - 20,
    );
  }

  doc.save(`${sanitizeFilename(title)}.pdf`);
}

// =============== DOCX ===============
export async function exportDocx<T>(payload: ExportPayload<T>): Promise<void> {
  const { title, subtitle, zonaMaritimaLabel, columns, rows, meta } = payload;

  // Encabezado
  const headerParagraphs: InstanceType<typeof DocxParagraph>[] = [
    new DocxParagraph({
      heading: DocxHeadingLevel.HEADING_1,
      children: [new DocxTextRun({ text: title, bold: true })],
    }),
  ];

  if (subtitle) {
    headerParagraphs.push(
      new DocxParagraph({
        children: [new DocxTextRun({ text: subtitle, italics: true, color: "666666" })],
      }),
    );
  }

  headerParagraphs.push(
    new DocxParagraph({
      children: [
        new DocxTextRun({
          text: zonaMaritimaLabel
            ? `Filtro regional: ${zonaMaritimaLabel}`
            : "Alcance: Nacional",
          bold: true,
        }),
        new DocxTextRun({
          text: `   ·   Generado: ${formatDate()}   ·   ${rows.length} registros`,
        }),
      ],
    }),
  );

  headerParagraphs.push(new DocxParagraph({ text: "" }));

  // Tabla
  const headerRow = new DocxTableRow({
    tableHeader: true,
    children: columns.map(
      (c) =>
        new DocxTableCell({
          children: [
            new DocxParagraph({
              children: [new DocxTextRun({ text: c.label, bold: true })],
              alignment: DocxAlignmentType.LEFT,
            }),
          ],
          width: { size: Math.floor(100 / columns.length), type: DocxWidthType.PERCENTAGE },
        }),
    ),
  });

  const dataRows = rows.map(
    (row) =>
      new DocxTableRow({
        children: columns.map(
          (c) =>
            new DocxTableCell({
              children: [
                new DocxParagraph({
                  children: [
                    new DocxTextRun({
                      text: (() => {
                        if (c.format) return c.format(row);
                        const val = (row as Record<string, unknown>)[c.key as string];
                        return val == null ? "" : String(val);
                      })(),
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
  });

  // Footer meta
  const metaParagraphs: InstanceType<typeof DocxParagraph>[] = [];
  if (meta) {
    metaParagraphs.push(new DocxParagraph({ text: "" }));
    metaParagraphs.push(
      new DocxParagraph({
        heading: DocxHeadingLevel.HEADING_3,
        children: [new DocxTextRun({ text: "Información adicional", bold: true })],
      }),
    );
    Object.entries(meta).forEach(([k, v]) => {
      metaParagraphs.push(
        new DocxParagraph({
          children: [
            new DocxTextRun({ text: `${k}: `, bold: true }),
            new DocxTextRun({ text: v }),
          ],
        }),
      );
    });
  }

  // Footer institucional
  metaParagraphs.push(new DocxParagraph({ text: "" }));
  metaParagraphs.push(
    new DocxParagraph({
      children: [
        new DocxTextRun({
          text: "DIRECTEMAR · Dirección General del Territorio Marítimo y de Marina Mercante · Autoridad Marítima de Chile",
          italics: true,
          color: "888888",
          size: 18,
        }),
      ],
      alignment: DocxAlignmentType.CENTER,
    }),
  );

  const doc = new DocxDocument({
    sections: [
      {
        children: [...headerParagraphs, table, ...metaParagraphs],
      },
    ],
  });

  const blob = await DocxPacker.toBlob(doc);
  downloadBlob(blob, `${sanitizeFilename(title)}.docx`);
}

// =============== PPTX ===============
export async function exportPptx<T>(payload: ExportPayload<T>): Promise<void> {
  const { title, subtitle, zonaMaritimaLabel, columns, rows, meta } = payload;

  const pptx = new pptxgen();
  pptx.defineLayout({ name: "DIRECTEMAR", width: 13.33, height: 7.5 });
  pptx.layout = "DIRECTEMAR";

  // ====== Slide 1: Cover ======
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: "1A2B3A" };

  coverSlide.addText("DIRECTEMAR", {
    x: 0.5,
    y: 2.5,
    w: 12.33,
    h: 0.6,
    fontSize: 18,
    color: "3E848A",
    bold: true,
    align: "center",
  });

  coverSlide.addText(title, {
    x: 0.5,
    y: 3.1,
    w: 12.33,
    h: 1.0,
    fontSize: 36,
    color: "FFFFFF",
    bold: true,
    align: "center",
  });

  if (subtitle) {
    coverSlide.addText(subtitle, {
      x: 0.5,
      y: 4.1,
      w: 12.33,
      h: 0.5,
      fontSize: 16,
      color: "B0BEC5",
      italic: true,
      align: "center",
    });
  }

  coverSlide.addText(
    zonaMaritimaLabel ? `Filtro regional: ${zonaMaritimaLabel}` : "Alcance: Nacional",
    {
      x: 0.5,
      y: 5.0,
      w: 12.33,
      h: 0.4,
      fontSize: 12,
      color: "3E848A",
      align: "center",
    },
  );

  coverSlide.addText(`Generado: ${formatDate()}   ·   ${rows.length} registros`, {
    x: 0.5,
    y: 5.5,
    w: 12.33,
    h: 0.3,
    fontSize: 11,
    color: "90A4AE",
    align: "center",
  });

  // ====== Slide 2: Tabla de datos (máx 12 filas) ======
  if (rows.length > 0) {
    const dataSlide = pptx.addSlide();
    dataSlide.background = { color: "F5F7F8" };

    dataSlide.addText("Datos del reporte", {
      x: 0.3,
      y: 0.2,
      w: 12.7,
      h: 0.5,
      fontSize: 18,
      color: "1A2B3A",
      bold: true,
    });

    const tableRows: pptxgen.SlideObject[][] = [
      columns.map((c) => ({
        text: c.label,
        options: { bold: true, color: "FFFFFF", fill: { color: "3E848A" } },
      })),
      ...rows.slice(0, 12).map((row) =>
        columns.map((c) => ({
          text: (() => {
            if (c.format) return c.format(row);
            const val = (row as Record<string, unknown>)[c.key as string];
            return val == null ? "" : String(val);
          })(),
          options: { color: "1A2B3A" },
        })),
      ),
    ];

    dataSlide.addTable(tableRows as unknown as pptxgen.TableRow[], {
      x: 0.3,
      y: 0.9,
      w: 12.7,
      colW: columns.map(() => 12.7 / columns.length),
      border: { type: "solid", pt: 0.5, color: "B0BEC5" },
      rowH: 0.35,
      valign: "middle",
      fontSize: 9,
      autoPage: true,
    });

    if (rows.length > 12) {
      dataSlide.addText(`Mostrando 12 de ${rows.length} registros. Exporta en XLSX o PDF para ver el detalle completo.`, {
        x: 0.3,
        y: 6.9,
        w: 12.7,
        h: 0.4,
        fontSize: 9,
        color: "607D8B",
        italic: true,
      });
    }
  }

  // ====== Slide 3: Resumen / Meta ======
  if (meta && Object.keys(meta).length > 0) {
    const metaSlide = pptx.addSlide();
    metaSlide.background = { color: "F5F7F8" };

    metaSlide.addText("Resumen del reporte", {
      x: 0.3,
      y: 0.2,
      w: 12.7,
      h: 0.5,
      fontSize: 18,
      color: "1A2B3A",
      bold: true,
    });

    const metaRows: pptxgen.SlideObject[][] = Object.entries(meta).map(([k, v], i) => [
      {
        text: k,
        options: { bold: true, color: "1A2B3A", fill: { color: i % 2 === 0 ? "FFFFFF" : "ECEFF1" } },
      },
      {
        text: v,
        options: { color: "1A2B3A", fill: { color: i % 2 === 0 ? "FFFFFF" : "ECEFF1" } },
      },
    ]);

    metaSlide.addTable(metaRows as unknown as pptxgen.TableRow[], {
      x: 0.5,
      y: 1.0,
      w: 12.3,
      colW: [4, 8.3],
      border: { type: "solid", pt: 0.5, color: "B0BEC5" },
      rowH: 0.5,
      valign: "middle",
      fontSize: 12,
    });
  }

  // ====== Slide final: Footer institucional ======
  const footerSlide = pptx.addSlide();
  footerSlide.background = { color: "1A2B3A" };

  footerSlide.addText("DIRECTEMAR", {
    x: 0.5,
    y: 3.0,
    w: 12.33,
    h: 0.6,
    fontSize: 24,
    color: "3E848A",
    bold: true,
    align: "center",
  });

  footerSlide.addText("Dirección General del Territorio Marítimo y de Marina Mercante", {
    x: 0.5,
    y: 3.6,
    w: 12.33,
    h: 0.5,
    fontSize: 14,
    color: "FFFFFF",
    align: "center",
  });

  footerSlide.addText("Autoridad Marítima de Chile", {
    x: 0.5,
    y: 4.1,
    w: 12.33,
    h: 0.4,
    fontSize: 12,
    color: "B0BEC5",
    italic: true,
    align: "center",
  });

  await pptx.writeFile({ fileName: `${sanitizeFilename(title)}.pptx` });
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
