#!/usr/bin/env python3
"""
Genera el Anexo C (Oferta Económica) para la Licitación 3134-87-LE26
DIRECTEMAR - Software de Control de Tráfico Marítimo e Integrador de Radar AIS y Cámaras
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, black, white, grey
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, HRFlowable
)
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from datetime import datetime
import os

# === COLORES INSTITUCIONALES ===
COLOR_PRIMARY = HexColor("#1A2B3A")     # Azul marino profundo
COLOR_SECONDARY = HexColor("#3E848A")    # Teal
COLOR_ACCENT = HexColor("#5DD5E0")        # Cyan claro
COLOR_TEXT = HexColor("#1A2B3A")
COLOR_MUTED = HexColor("#6B7280")
COLOR_BG_LIGHT = HexColor("#F5F7F8")
COLOR_BORDER = HexColor("#D1D5DB")

# === DATOS DE LA OFERTA ===
OFERTA_NETA = 43589744
IVA = 8282051
OFERTA_CON_IVA = 51871795
VALOR_POR_LICENCIA = 14529915
PRESUPUESTO = 59040660

output_path = "/home/z/my-project/download/Anexo_C_Oferta_Economica_3134-87-LE26.pdf"

# === DOCUMENTO ===
doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2.5*cm,
    bottomMargin=2*cm,
    title="Anexo C - Oferta Económica - Licitación 3134-87-LE26",
    author="DIRECTEMAR - Propuesta de Licitación",
    subject="Oferta Económica para Licencias de Software de Control de Tráfico Marítimo",
)

styles = getSampleStyleSheet()

style_title = ParagraphStyle(
    'CustomTitle', parent=styles['Title'],
    fontSize=18, textColor=COLOR_PRIMARY, alignment=TA_CENTER,
    spaceAfter=6*mm, fontName='Helvetica-Bold'
)
style_subtitle = ParagraphStyle(
    'CustomSubtitle', parent=styles['Normal'],
    fontSize=11, textColor=COLOR_MUTED, alignment=TA_CENTER,
    spaceAfter=8*mm, fontName='Helvetica'
)
style_h2 = ParagraphStyle(
    'CustomH2', parent=styles['Heading2'],
    fontSize=13, textColor=COLOR_PRIMARY, alignment=TA_LEFT,
    spaceBefore=6*mm, spaceAfter=3*mm, fontName='Helvetica-Bold'
)
style_body = ParagraphStyle(
    'CustomBody', parent=styles['Normal'],
    fontSize=10, textColor=COLOR_TEXT, alignment=TA_JUSTIFY,
    spaceAfter=2*mm, fontName='Helvetica', leading=14
)
style_small = ParagraphStyle(
    'CustomSmall', parent=styles['Normal'],
    fontSize=8, textColor=COLOR_MUTED, alignment=TA_LEFT,
    fontName='Helvetica', leading=10
)
style_mono = ParagraphStyle(
    'CustomMono', parent=styles['Normal'],
    fontSize=10, textColor=COLOR_TEXT, alignment=TA_RIGHT,
    fontName='Courier-Bold', leading=14
)

story = []

# === HEADER INSTITUCIONAL ===
header_table = Table([
    [Paragraph("<b>DIRECTEMAR</b>", ParagraphStyle('H', parent=styles['Normal'],
        fontSize=16, textColor=white, fontName='Helvetica-Bold')),
     Paragraph("ANEXO C<br/>OFERTA ECONÓMICA<br/>LIC. ID 3134-87-LE26",
        ParagraphStyle('H2', parent=styles['Normal'],
        fontSize=9, textColor=COLOR_ACCENT, alignment=TA_RIGHT, fontName='Helvetica-Bold'))]
], colWidths=[10*cm, 7*cm])
header_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (0, 0), COLOR_PRIMARY),
    ('BACKGROUND', (1, 0), (1, 0), COLOR_PRIMARY),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (0, 0), 12),
    ('RIGHTPADDING', (1, 0), (1, 0), 12),
    ('TOPPADDING', (0, 0), (-1, -1), 10),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ('LINEBELOW', (0, 0), (-1, -1), 3, COLOR_SECONDARY),
]))
story.append(header_table)
story.append(Spacer(1, 6*mm))

# === INFORMACIÓN DE LA LICITACIÓN ===
info_data = [
    ["Licitación ID:", "3134-87-LE26"],
    ["Entidad Licitante:", "DIRECTEMAR - D.G.T.M. y M.M."],
    ["RUT Entidad:", "61.102.014-7"],
    ["Objeto:", "3 licencias de software de control de tráfico marítimo\ne integrador de radar AIS y cámaras"],
    ["Software:", "TZ Coastal Monitoring (TimeZero / Furuno)"],
    ["Fecha:", datetime.now().strftime("%d/%m/%Y")],
    ["Validez oferta:", "100 días corridos (mínimo requerido)"],
]
info_table = Table(info_data, colWidths=[5*cm, 12*cm])
info_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('TEXTCOLOR', (0, 0), (0, -1), COLOR_MUTED),
    ('TEXTCOLOR', (1, 0), (1, -1), COLOR_TEXT),
    ('BACKGROUND', (0, 0), (0, -1), COLOR_BG_LIGHT),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
]))
story.append(info_table)
story.append(Spacer(1, 8*mm))

# === TABLA DE OFERTA ECONÓMICA ===
story.append(Paragraph("DATOS ECONÓMICOS PARA CRITERIOS DE EVALUACIÓN", style_h2))
story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_SECONDARY))
story.append(Spacer(1, 4*mm))

story.append(Paragraph(
    "Este anexo deberá ser completado con la información mínima necesaria para realizar "
    "la correspondiente evaluación y determinar el puntaje que obtendrá cada oferente, "
    "de acuerdo a lo establecido en la Cláusula N° 8 de las bases administrativas.",
    style_body
))
story.append(Spacer(1, 5*mm))

# Tabla principal de oferta
oferta_data = [
    ["CANT.", "DESCRIPCIÓN", "VALOR NETO\nPOR LICENCIA", "VALOR TOTAL\nNETO"],
    [
        "3",
        "LICENCIAS DE SOFTWARE DE CONTROL DE TRÁFICO MARÍTIMO\n"
        "E INTEGRADOR DE RADAR AIS Y CÁMARAS\n"
        "(TZ Coastal Monitoring - TimeZero/Furuno)\n"
        "Incluye: soporte técnico 12 meses, instalación,\n"
        "certificados digitales y configuración",
        f"$ 14.529.915",
        f"$ 43.589.744",
    ],
    ["", "VALOR TOTAL NETO DE LA OFERTA", "", f"$ 43.589.744"],
    ["", "IVA (19%)", "", f"$ 8.282.051"],
    ["", "VALOR TOTAL CON IVA", "", f"$ 51.871.795"],
]

oferta_table = Table(oferta_data, colWidths=[1.5*cm, 8.5*cm, 3.5*cm, 3.5*cm])
oferta_table.setStyle(TableStyle([
    # Header
    ('BACKGROUND', (0, 0), (-1, 0), COLOR_PRIMARY),
    ('TEXTCOLOR', (0, 0), (-1, 0), white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 9),
    ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
    ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, 0), 8),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),

    # Datos
    ('FONTNAME', (0, 1), (-1, 1), 'Helvetica'),
    ('FONTSIZE', (0, 1), (-1, 1), 9),
    ('TEXTCOLOR', (0, 1), (-1, 1), COLOR_TEXT),
    ('ALIGN', (0, 1), (0, 1), 'CENTER'),
    ('ALIGN', (2, 1), (3, 1), 'RIGHT'),
    ('VALIGN', (0, 1), (-1, 1), 'TOP'),
    ('BACKGROUND', (0, 1), (-1, 1), COLOR_BG_LIGHT),
    ('TOPPADDING', (0, 1), (-1, 1), 8),
    ('BOTTOMPADDING', (0, 1), (-1, 1), 8),

    # Totales
    ('FONTNAME', (0, 2), (-1, 4), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 2), (-1, 4), 9),
    ('ALIGN', (2, 2), (3, 4), 'RIGHT'),
    ('VALIGN', (0, 2), (-1, 4), 'MIDDLE'),
    ('TEXTCOLOR', (1, 2), (1, 2), COLOR_MUTED),
    ('TEXTCOLOR', (1, 3), (1, 3), COLOR_MUTED),

    # Línea total con IVA destacada
    ('BACKGROUND', (0, 4), (-1, 4), COLOR_SECONDARY),
    ('TEXTCOLOR', (0, 4), (-1, 4), white),
    ('FONTSIZE', (0, 4), (-1, 4), 10),

    # Bordes
    ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
    ('LINEBELOW', (0, 0), (-1, 0), 2, COLOR_ACCENT),
    ('LINEABOVE', (0, 4), (-1, 4), 1.5, COLOR_PRIMARY),

    # Padding
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 2), (-1, 4), 6),
    ('BOTTOMPADDING', (0, 2), (-1, 4), 6),
]))
story.append(oferta_table)
story.append(Spacer(1, 4*mm))

story.append(Paragraph(
    "<b>Nota:</b> La oferta se formula en moneda pesos chilenos, valor neto y sin reajuste. "
    "El precio regirá durante toda la vigencia del contrato. "
    "Validez mínima: 100 días corridos desde el cierre de recepción de ofertas.",
    style_small
))
story.append(Spacer(1, 8*mm))

# === DESGLOSE DE COSTOS ===
story.append(Paragraph("DESGLOSE DE COSTOS (Informativo)", style_h2))
story.append(HRFlowable(width="100%", thickness=1, color=COLOR_SECONDARY))
story.append(Spacer(1, 3*mm))

desglose_data = [
    ["ITEM", "DESCRIPCIÓN", "MONTO NETO (CLP)"],
    ["1", "3 licencias TZ Coastal Monitoring (USD $10.000 c/u × TC 950)", "$ 28.500.000"],
    ["2", "Soporte técnico 12 meses (garantía y asistencia)", "$ 3.000.000"],
    ["3", "Instalación y configuración en sitio", "$ 2.000.000"],
    ["4", "Certificados digitales de licencia", "$ 500.000"],
    ["", "SUBTOTAL COSTOS DIRECTOS", "$ 34.000.000"],
    ["5", "Margen de utilidad (22%)", "$ 9.589.744"],
    ["", "OFERTA NETA TOTAL", "$ 43.589.744"],
    ["", "IVA (19%)", "$ 8.282.051"],
    ["", "OFERTA TOTAL CON IVA", "$ 51.871.795"],
]

desglose_table = Table(desglose_data, colWidths=[1.2*cm, 10.3*cm, 5.5*cm])
desglose_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 8),
    ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
    ('TEXTCOLOR', (0, 0), (-1, 0), white),
    ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 1), (-1, -1), 8),
    ('ALIGN', (0, 1), (0, -1), 'CENTER'),
    ('ALIGN', (2, 1), (2, -1), 'RIGHT'),
    ('TEXTCOLOR', (0, 1), (-1, 4), COLOR_TEXT),
    ('BACKGROUND', (0, 1), (-1, 4), COLOR_BG_LIGHT),
    ('GRID', (0, 0), (-1, -1), 0.3, COLOR_BORDER),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    # Subtotal
    ('FONTNAME', (0, 6), (-1, 6), 'Helvetica-Bold'),
    ('BACKGROUND', (0, 6), (-1, 6), HexColor("#E5E7EB")),
    # Oferta neta
    ('FONTNAME', (0, 7), (-1, 7), 'Helvetica-Bold'),
    ('BACKGROUND', (0, 7), (-1, 7), HexColor("#D1D5DB")),
    # Total con IVA
    ('FONTNAME', (0, 9), (-1, 9), 'Helvetica-Bold'),
    ('BACKGROUND', (0, 9), (-1, 9), COLOR_PRIMARY),
    ('TEXTCOLOR', (0, 9), (-1, 9), white),
    ('FONTSIZE', (0, 9), (-1, 9), 10),
]))
story.append(desglose_table)
story.append(Spacer(1, 6*mm))

# === ANÁLISIS FINANCIERO ===
story.append(Paragraph("ANÁLISIS FINANCIERO", style_h2))
story.append(HRFlowable(width="100%", thickness=1, color=COLOR_SECONDARY))
story.append(Spacer(1, 3*mm))

financiero_data = [
    ["CONCEPTO", "MONTO (CLP)", "OBSERVACIÓN"],
    ["Presupuesto disponible (con IVA)", "$ 59.040.660", "Tope de la licitación"],
    ["Oferta total (con IVA)", "$ 51.871.795", "12.1% bajo presupuesto"],
    ["Diferencia a favor de DIRECTEMAR", "$ 7.168.865", "Ahorro para la entidad"],
    ["Utilidad bruta", "$ 9.589.744", "Margen 22%"],
    ["Impuesto 1ª categoría (27%)", "$ 2.589.231", "Sobre utilidad"],
    ["Utilidad neta después de impuestos", "$ 7.000.513", "Margen neto 16.1%"],
    ["Boleta de garantía (3%)", "$ 1.307.692", "Recuperable al término"],
    ["Plazo de pago", "30 días", "Ley N° 21.131"],
    ["Multa diaria por atraso", "$ 130.769", "0.9% valor neto ítem"],
    ["Tope multas", "$ 13.076.923", "30% del contrato"],
]

financiero_table = Table(financiero_data, colWidths=[6.5*cm, 4.5*cm, 6*cm])
financiero_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 8),
    ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
    ('TEXTCOLOR', (0, 0), (-1, 0), white),
    ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 1), (-1, -1), 8),
    ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
    ('TEXTCOLOR', (0, 1), (-1, -1), COLOR_TEXT),
    ('GRID', (0, 0), (-1, -1), 0.3, COLOR_BORDER),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ('BACKGROUND', (0, 1), (-1, -1), COLOR_BG_LIGHT),
    # Destacar diferencia a favor
    ('BACKGROUND', (0, 3), (-1, 3), HexColor("#D1FAE5")),
    ('FONTNAME', (0, 3), (-1, 3), 'Helvetica-Bold'),
    ('TEXTCOLOR', (0, 3), (-1, 3), HexColor("#065F46")),
    # Destacar utilidad neta
    ('BACKGROUND', (0, 6), (-1, 6), HexColor("#FEF3C7")),
    ('FONTNAME', (0, 6), (-1, 6), 'Helvetica-Bold'),
]))
story.append(financiero_table)
story.append(Spacer(1, 6*mm))

# === CRITERIOS DE EVALUACIÓN Y PUNTAJE ESTIMADO ===
story.append(Paragraph("PUNTAJE ESTIMADO DE EVALUACIÓN", style_h2))
story.append(HRFlowable(width="100%", thickness=1, color=COLOR_SECONDARY))
story.append(Spacer(1, 3*mm))

puntaje_data = [
    ["CRITERIO", "PONDERACIÓN", "PUNTAJE\nESTIMADO", "PUNTAJE\nPONDERADO"],
    ["Requisitos formales", "8%", "100", "8.0"],
    ["Comportamiento contractual anterior", "10%", "100", "10.0"],
    ["Programa de integridad", "2%", "100", "2.0"],
    ["Plazo de entrega (1-8 días hábiles)", "20%", "100", "20.0"],
    ["Precio (menor precio ofertado)", "60%", "100", "60.0"],
    ["PUNTAJE TOTAL", "100%", "", "100.0"],
]

puntaje_table = Table(puntaje_data, colWidths=[7*cm, 3*cm, 3*cm, 3.5*cm])
puntaje_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 8),
    ('BACKGROUND', (0, 0), (-1, 0), COLOR_PRIMARY),
    ('TEXTCOLOR', (0, 0), (-1, 0), white),
    ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
    ('FONTNAME', (0, 1), (-1, -2), 'Helvetica'),
    ('FONTSIZE', (0, 1), (-1, -1), 9),
    ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
    ('TEXTCOLOR', (0, 1), (-1, -2), COLOR_TEXT),
    ('GRID', (0, 0), (-1, -1), 0.3, COLOR_BORDER),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('BACKGROUND', (0, 1), (-1, -2), COLOR_BG_LIGHT),
    # Fila total destacada
    ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ('BACKGROUND', (0, -1), (-1, -1), COLOR_SECONDARY),
    ('TEXTCOLOR', (0, -1), (-1, -1), white),
    ('FONTSIZE', (0, -1), (-1, -1), 11),
    ('TOPPADDING', (0, -1), (-1, -1), 8),
    ('BOTTOMPADDING', (0, -1), (-1, -1), 8),
]))
story.append(puntaje_table)
story.append(Spacer(1, 4*mm))

story.append(Paragraph(
    "<i>Nota: El puntaje estimado asume que nuestra oferta es la de menor precio "
    "(100 puntos en criterio precio) y que cumple con todos los requisitos técnicos "
    "y administrativos. El puntaje real dependerá de las ofertas de los demás competidores.</i>",
    style_small
))
story.append(Spacer(1, 8*mm))

# === FIRMA ===
story.append(HRFlowable(width="100%", thickness=0.5, color=COLOR_BORDER))
story.append(Spacer(1, 10*mm))

firma_data = [
    ["", ""],
    ["_______________________________", "_______________________________"],
    ["FIRMA REPRESENTANTE LEGAL", "FIRMA"],
    ["NOMBRE:", ""],
    ["RUT:", ""],
    ["EMPRESA:", ""],
    ["FECHA:", datetime.now().strftime("%d/%m/%Y")],
]
firma_table = Table(firma_data, colWidths=[8.5*cm, 8.5*cm])
firma_table.setStyle(TableStyle([
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
    ('TEXTCOLOR', (0, 2), (-1, 2), COLOR_MUTED),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(firma_table)
story.append(Spacer(1, 6*mm))

story.append(Paragraph(
    "<b>NOTA:</b> Este anexo deberá ser elevado al Portal Mercado Público "
    "como antecedente económico. Es de carácter obligatorio.",
    style_small
))

# === FOOTER CON PAGINACIÓN ===
def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(COLOR_MUTED)
    page_num = canvas.getPageNumber()
    canvas.drawRightString(
        A4[0] - 2*cm, 1.2*cm,
        f"Anexo C · Licitación 3134-87-LE26 · Página {page_num}"
    )
    canvas.drawString(
        2*cm, 1.2*cm,
        "DIRECTEMAR · Oferta Económica"
    )
    # Línea del footer
    canvas.setStrokeColor(COLOR_BORDER)
    canvas.setLineWidth(0.3)
    canvas.line(2*cm, 1.5*cm, A4[0] - 2*cm, 1.5*cm)
    canvas.restoreState()

doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)

print(f"PDF generado: {output_path}")
print(f"Tamaño: {os.path.getsize(output_path)} bytes")
