#!/usr/bin/env python3
"""
Genera el Documento de Presentación Técnica para la Licitación 3134-87-LE26
DIRECTEMAR - Software de Control de Tráfico Marítimo e Integrador de Radar AIS y Cámaras

Este documento va en la Carpeta Técnica de la oferta y explica cómo nuestra
plataforma web complementa al software TZ Coastal Monitoring.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, black, white, grey
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.pdfgen import canvas
from datetime import datetime
import os

# === COLORES INSTITUCIONALES ===
COLOR_PRIMARY = HexColor("#1A2B3A")
COLOR_SECONDARY = HexColor("#3E848A")
COLOR_ACCENT = HexColor("#5DD5E0")
COLOR_TEXT = HexColor("#1A2B3A")
COLOR_MUTED = HexColor("#6B7280")
COLOR_BG_LIGHT = HexColor("#F5F7F8")
COLOR_BORDER = HexColor("#D1D5DB")
COLOR_SUCCESS = HexColor("#10B981")
COLOR_WARN = HexColor("#F59E0B")

output_path = "/home/z/my-project/download/Presentacion_Tecnica_3134-87-LE26.pdf"

doc = SimpleDocTemplate(
    output_path, pagesize=A4,
    rightMargin=2*cm, leftMargin=2*cm,
    topMargin=2.5*cm, bottomMargin=2*cm,
    title="Presentación Técnica - Licitación 3134-87-LE26",
    author="DIRECTEMAR - Propuesta Técnica",
    subject="Plataforma Marítima Nacional complementaria a TZ Coastal Monitoring",
)

styles = getSampleStyleSheet()

style_title = ParagraphStyle('Title1', parent=styles['Title'],
    fontSize=20, textColor=COLOR_PRIMARY, alignment=TA_CENTER,
    spaceAfter=4*mm, fontName='Helvetica-Bold')
style_h1 = ParagraphStyle('H1', parent=styles['Heading1'],
    fontSize=14, textColor=COLOR_PRIMARY, alignment=TA_LEFT,
    spaceBefore=8*mm, spaceAfter=3*mm, fontName='Helvetica-Bold')
style_h2 = ParagraphStyle('H2', parent=styles['Heading2'],
    fontSize=11, textColor=COLOR_SECONDARY, alignment=TA_LEFT,
    spaceBefore=4*mm, spaceAfter=2*mm, fontName='Helvetica-Bold')
style_body = ParagraphStyle('Body', parent=styles['Normal'],
    fontSize=10, textColor=COLOR_TEXT, alignment=TA_JUSTIFY,
    spaceAfter=2*mm, fontName='Helvetica', leading=14)
style_small = ParagraphStyle('Small', parent=styles['Normal'],
    fontSize=8, textColor=COLOR_MUTED, alignment=TA_LEFT,
    fontName='Helvetica', leading=10)
style_center_small = ParagraphStyle('CenterSmall', parent=styles['Normal'],
    fontSize=9, textColor=white, alignment=TA_CENTER,
    fontName='Helvetica-Bold')

story = []

# ==================== PORTADA ====================
portada_top = Table([[
    Paragraph("<b>DIRECTEMAR</b><br/>"
        "<font size=9 color='#5DD5E0'>Dirección General del Territorio Marítimo<br/>y de Marina Mercante</font>",
        ParagraphStyle('PC', parent=styles['Normal'],
            fontSize=22, textColor=white, fontName='Helvetica-Bold', alignment=TA_CENTER)),
]], colWidths=[17*cm])
portada_top.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), COLOR_PRIMARY),
    ('TOPPADDING', (0,0), (-1,-1), 25),
    ('BOTTOMPADDING', (0,0), (-1,-1), 20),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
]))
story.append(portada_top)

# Línea accent
line_table = Table([[""]], colWidths=[17*cm], rowHeights=[0.3*cm])
line_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), COLOR_SECONDARY),
]))
story.append(line_table)
story.append(Spacer(1, 3*cm))

story.append(Paragraph("PRESENTACIÓN TÉCNICA", style_title))
story.append(Paragraph(
    "<font color='#3E848A' size=12>Plataforma Marítima Nacional</font>",
    ParagraphStyle('ST', parent=styles['Normal'],
        fontSize=12, textColor=COLOR_SECONDARY, alignment=TA_CENTER,
        spaceAfter=2*mm, fontName='Helvetica-Bold')
))
story.append(Paragraph(
    "<font color='#6B7280' size=10>Complementaria al Software TZ Coastal Monitoring</font>",
    ParagraphStyle('ST2', parent=styles['Normal'],
        fontSize=10, textColor=COLOR_MUTED, alignment=TA_CENTER,
        spaceAfter=1*cm, fontName='Helvetica')
))
story.append(Spacer(1, 2*cm))

# Ficha del documento
ficha_data = [
    ["Licitación ID", "3134-87-LE26"],
    ["Entidad", "DIRECTEMAR — D.G.T.M. y M.M."],
    ["Objeto", "3 licencias de software de control de tráfico marítimo\ne integrador de radar AIS y cámaras"],
    ["Software base", "TZ Coastal Monitoring (TimeZero / Furuno)"],
    ["Plataforma complementaria", "DIRECTEMAR Plataforma Marítima Nacional"],
    ["Documento", "Presentación Técnica — Carpeta Técnica"],
    ["Fecha", datetime.now().strftime("%d de %B de %Y")],
]
ficha = Table(ficha_data, colWidths=[5*cm, 12*cm])
ficha.setStyle(TableStyle([
    ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
    ('FONTNAME', (1,0), (1,-1), 'Helvetica'),
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('TEXTCOLOR', (0,0), (0,-1), COLOR_MUTED),
    ('TEXTCOLOR', (1,0), (1,-1), COLOR_TEXT),
    ('BACKGROUND', (0,0), (0,-1), COLOR_BG_LIGHT),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
    ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
]))
story.append(ficha)
story.append(Spacer(1, 2*cm))

# Marco normativo
story.append(HRFlowable(width="100%", thickness=0.5, color=COLOR_BORDER))
story.append(Spacer(1, 4*mm))
story.append(Paragraph(
    "<font color='#6B7280' size=8><b>MARCO NORMATIVO APLICABLE:</b> "
    "DS (M) N° 1/1941 · IALA V-103 · Ley N° 21.719 · Ley N° 20.285 · "
    "Ley N° 19.799 · SOLAS · MARPOL</font>",
    style_small
))

story.append(PageBreak())

# ==================== 1. RESUMEN EJECUTIVO ====================
story.append(Paragraph("1. Resumen Ejecutivo", style_h1))
story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_SECONDARY))
story.append(Spacer(1, 3*mm))

story.append(Paragraph(
    "La presente propuesta técnica contempla la provisión de tres (3) licencias del software "
    "<b>TZ Coastal Monitoring</b> de TimeZero/Furuno, conforme a lo exigido en las bases "
    "administrativas y técnicas de la licitación ID 3134-87-LE26. Adicionalmente, se incorpora "
    "como <b>valor agregado diferenciador</b> la plataforma web <b>DIRECTEMAR — Plataforma "
    "Marítima Nacional</b>, desarrollada específicamente para complementar al software base "
    "con capacidades de visualización, capellanía, gestión de trámites y generación de reportes "
    "institucionales que no están incluidas en el software comercial.",
    style_body
))
story.append(Spacer(1, 2*mm))
story.append(Paragraph(
    "Esta plataforma complementaria no reemplaza ninguna funcionalidad del TZ Coastal Monitoring, "
    "sino que añade una capa de presentación web accesible desde cualquier navegador, permitiendo "
    "al personal de DIRECTEMAR consultar el estado operacional del litoral, gestionar trámites "
    "marítimos, registrar eventos en una bitácora auditante con hash criptográfico, y acceder a "
    "un sistema de capellanía pastoral con búsqueda web integrada. Todo ello en cumplimiento del "
    "marco normativo chileno e internacional vigente.",
    style_body
))

story.append(Spacer(1, 5*mm))

# ==================== 2. ARQUITECTURA ====================
story.append(Paragraph("2. Arquitectura del Sistema", style_h1))
story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_SECONDARY))
story.append(Spacer(1, 3*mm))

story.append(Paragraph(
    "La solución se compone de dos capas perfectamente diferenciadas que operan de forma "
    "complementaria e independiente. El <b>software base TZ Coastal Monitoring</b> opera como "
    "motor de procesamiento de datos AIS, ARPA, radar, cámaras IP y grabación de sensores VHF, "
    "conectándose directamente al hardware instalado en las dependencias de DIRECTEMAR. La "
    "<b>Plataforma Marítima Nacional complementaria</b> opera como capa de presentación web, "
    "consumiendo los datos procesados por el software base para ofrecer visualización táctica, "
    "gestión documental, capellanía y reportes institucionales a través de un navegador.",
    style_body
))

story.append(Spacer(1, 4*mm))
story.append(Paragraph("2.1 Diagrama de Capas", style_h2))

arch_data = [
    ["CAPA", "COMPONENTE", "FUNCIÓN", "ESTADO"],
    ["Hardware", "Radares Furuno DRS NXT / FAR 2xx8", "Detección de blancos", "Existente en DIRECTEMAR"],
    ["Hardware", "Cámaras IP AXIS / FLIR (ONVIF)", "Vigilancia visual", "Existente / A provisionar"],
    ["Hardware", "Receptores VHF (4 canales)", "Comunicaciones marítimas", "A provisionar"],
    ["Software Base", "TZ Coastal Monitoring (3 licencias)", "Procesamiento AIS/ARPA/radar/cámaras", "Se provee en esta oferta"],
    ["Software Base", "Grabación y Playback de sensores", "Registro VHF + datos sincronizados", "Incluido en licencia"],
    ["Software Base", "Soporte técnico 12 meses", "Garantía y asistencia", "Incluido en oferta"],
    ["Plataforma Web", "Panel VTS militar (RNG/BRG/VEC/TRK/LIB)", "Visualización táctica web", "Desarrollada — se integra"],
    ["Plataforma Web", "Panel CCTV con 8+ cámaras", "Monitoreo visual web", "Desarrollada — se integra"],
    ["Plataforma Web", "Bitácora auditante (hash SHA-256)", "Trazabilidad legal", "Desarrollada"],
    ["Plataforma Web", "Trámites en línea (ClaveÚnica)", "Autogestión marítima", "Desarrollada"],
    ["Plataforma Web", "Chatbot Glauco (capellanía)", "Bienestar del personal", "Desarrollada"],
    ["Plataforma Web", "Exportación PDF/XLSX/DOCX/PPTX", "Reportes institucionales", "Desarrollada"],
]

arch_table = Table(arch_data, colWidths=[2.5*cm, 4.5*cm, 6*cm, 4*cm])
arch_table.setStyle(TableStyle([
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 8),
    ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY),
    ('TEXTCOLOR', (0,0), (-1,0), white),
    ('ALIGN', (0,0), (-1,0), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
    ('FONTSIZE', (0,1), (-1,-1), 7.5),
    ('GRID', (0,0), (-1,-1), 0.3, COLOR_BORDER),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ('LEFTPADDING', (0,0), (-1,-1), 4),
    ('RIGHTPADDING', (0,0), (-1,-1), 4),
    # Colorear por capa
    ('BACKGROUND', (0,1), (-1,3), HexColor("#EFF6FF")),  # Hardware
    ('BACKGROUND', (0,4), (-1,6), HexColor("#F0FDF4")),  # Software base
    ('BACKGROUND', (0,7), (-1,-1), HexColor("#FEF3C7")),  # Plataforma web
    # Separadores entre capas
    ('LINEABOVE', (0,4), (-1,4), 1.5, COLOR_PRIMARY),
    ('LINEABOVE', (0,7), (-1,7), 1.5, COLOR_SECONDARY),
]))
story.append(arch_table)

story.append(Spacer(1, 4*mm))
story.append(Paragraph(
    "<i>Las capas Hardware y Software Base cumplen íntegramente las exigencias de las bases. "
    "La Plataforma Web complementaria constituye un valor agregado que no sustituye "
    "ninguna funcionalidad del software base.</i>",
    style_small
))

story.append(PageBreak())

# ==================== 3. MATRIZ DE CUMPLIMIENTO ====================
story.append(Paragraph("3. Matriz de Cumplimiento Técnico", style_h1))
story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_SECONDARY))
story.append(Spacer(1, 3*mm))

story.append(Paragraph(
    "La siguiente tabla verifica el cumplimiento de cada capacidad técnica exigida en las Bases "
    "Técnicas, Cláusula N° 4, indicando cómo se satisface cada requerimiento:",
    style_body
))
story.append(Spacer(1, 3*mm))

matriz_data = [
    ["ITEM", "CAPACIDAD EXIGIDA", "CUMPLIMIENTO", "MEDIO DE CUMPLIMIENTO"],
    ["1", "Integración de radares Furuno\n(DRS NXT, FAR 2xx8)",
     "CUMPLE", "TZ Coastal Monitoring con integración nativa Furuno"],
    ["2", "Integración AIS\n(emisores/receptores compatibles)",
     "CUMPLE", "TZ Coastal Monitoring procesa 5.000 blancos AIS + 200 ARPA"],
    ["3", "Integración con Cámaras IP\n(12 cámaras, AXIS/FLIR/ONVIF/Pelco-D,\nseguimiento automático)",
     "CUMPLE", "TZ Coastal Monitoring soporta 12+ cámaras IP con PTZ tracking de blancos ARPA"],
    ["4", "Grabación de sensores y Playback\n(4 canales VHF + datos + reproducción\nsincronizada)",
     "CUMPLE", "TZ Coastal Monitoring con grabación simultánea de 4 canales VHF y playback sincronizado"],
    ["5", "Seguimiento de blancos\nAIS y ARPA (200 ARPA + 5.000 AIS,\náreas de adquisición/exclusión)",
     "CUMPLE", "TZ Coastal Monitoring con ARPA integrado y configuración de zonas"],
    ["6", "Zonas de vigilancia y alarmas\n(entrada/salida zona, cambio velocidad,\nCPA/TCPA)",
     "CUMPLE", "TZ Coastal Monitoring con alarmas personalizables + Plataforma Web con panel de alertas"],
    ["7", "Previsiones meteorológicas",
     "CUMPLE", "Plataforma Web integrada con SERVIMET + datos meteorológicos en consola VTS"],
    ["8", "Garantía y soporte 12 meses",
     "CUMPLE", "Soporte técnico incluido por 12 meses desde la entrega"],
    ["9", "Plazo entrega inferior a 15 días hábiles",
     "CUMPLE", "Entrega garantizada en 8 días hábiles"],
]

matriz = Table(matriz_data, colWidths=[1*cm, 4*cm, 2*cm, 9*cm])
matriz.setStyle(TableStyle([
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 8),
    ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY),
    ('TEXTCOLOR', (0,0), (-1,0), white),
    ('ALIGN', (0,0), (-1,0), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
    ('FONTSIZE', (0,1), (-1,-1), 7.5),
    ('GRID', (0,0), (-1,-1), 0.3, COLOR_BORDER),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('LEFTPADDING', (0,0), (-1,-1), 4),
    ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ('ALIGN', (0,1), (0,-1), 'CENTER'),
    ('ALIGN', (2,1), (2,-1), 'CENTER'),
    # Resaltar "CUMPLE" en verde
    ('TEXTCOLOR', (2,1), (2,-1), COLOR_SUCCESS),
    ('FONTNAME', (2,1), (2,-1), 'Helvetica-Bold'),
    ('BACKGROUND', (2,1), (2,-1), HexColor("#D1FAE5")),
]))
story.append(matriz)

story.append(PageBreak())

# ==================== 4. VALOR AGREGADO ====================
story.append(Paragraph("4. Valor Agregado de la Plataforma Complementaria", style_h1))
story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_SECONDARY))
story.append(Spacer(1, 3*mm))

story.append(Paragraph(
    "La Plataforma Marítima Nacional aporta capacidades que el software comercial TZ Coastal "
    "Monitoring no incluye, y que responden a necesidades operacionales, administrativas y de "
    "bienestar del personal de DIRECTEMAR. Estos módulos no reemplazan ninguna funcionalidad del "
    "software base, sino que añaden valor institucional diferenciador frente a otros oferentes.",
    style_body
))

story.append(Spacer(1, 4*mm))

# 4.1 Panel VTS
story.append(Paragraph("4.1 Panel VTS Táctico Web", style_h2))
story.append(Paragraph(
    "Consola de visualización web con estilo militar Armada, accesible desde cualquier navegador "
    "sin requerir instalación de software cliente. Incluye anotaciones tácticas profesionales "
    "(RNG — range rings, BRG — bearing lines, VEC — velocity vectors, TRK — track labels, "
    "LIB — limited information buffer) y dibujo de la zona VTS con límites norte y sur. "
    "Soporta zoom interactivo, pan con arrastre y coordenadas del cursor en tiempo real.",
    style_body
))

# 4.2 CCTV
story.append(Paragraph("4.2 Panel CCTV Integrador", style_h2))
story.append(Paragraph(
    "Grid de monitoreo de cámaras con sincronización al radar táctico. Al seleccionar un buque "
    "en el radar, las cámaras más cercanas activan automáticamente modo PTZ tracking con "
    "crosshair de seguimiento visual. Incluye HUD con ID de cámara, tipo, resolución, timestamp "
    "en vivo, badges de estado (REC, IR, PTZ) y soporte para cámaras termográficas.",
    style_body
))

# 4.3 Bitácora
story.append(Paragraph("4.3 Bitácora Auditante con Hash Criptográfico", style_h2))
story.append(Paragraph(
    "Cadena inmutable de eventos con hash criptográfico encadenado (formato blockchain privado, "
    "SHA-256), con consenso distribuido en 3 nodos (Santiago, Arica, Punta Arenas). Cada evento "
    "queda registrado con sello de tiempo, actor, acción y detalle, con validez probatoria "
    "conforme a la Ley N° 19.799 de Firma Electrónica. Permite exportación para sumarios "
    "administrativos y procesos judiciales.",
    style_body
))

# 4.4 Trámites
story.append(Paragraph("4.4 Portal de Trámites en Línea", style_h2))
story.append(Paragraph(
    "Autogestión marítima con autenticación ClaveÚnica y firma electrónica avanzada (Ley 19.799). "
    "Incluye plantillas rápidas para llenado frecuente (zarpe carga seca, zarpe granel líquido, "
    "permiso buceo, certificado navegación), validación visual de campos requeridos, y gestión "
    "de pagos en línea con recaudación en UF. Cumple Ley N° 21.719 de Protección de Datos "
    "Personales.",
    style_body
))

# 4.5 Glauco
story.append(Paragraph("4.5 Chatbot Glauco — Capellanía del Mar", style_h2))
story.append(Paragraph(
    "Asistente conversacional con identidad de Glauco (dios marino intermediario entre el mar "
    "y la tierra), que combina dominio operativo marítimo, capellanía pastoral con sabiduría "
    "bíblica (Antiguo y Nuevo Testamento), y conexión a internet para datos en tiempo real. "
    "Incluye función anti-cortisol con ejercicios de respiración 4-4-6, detección de estrés "
    "por análisis lingüístico, y memoria de aprendizaje ilimitada. Único en el mercado chileno.",
    style_body
))

# 4.6 Exportación
story.append(Paragraph("4.6 Exportación de Reportes Institucionales", style_h2))
story.append(Paragraph(
    "Generación de reportes profesionales en 4 formatos: PDF (con portada institucional, "
    "header/footer en cada página, clasificación del documento, conclusiones y recomendaciones), "
    "XLSX (3 hojas: portada, datos con autofilter, metadatos), DOCX (con tabla de contenidos "
    "automática y header/footer con paginación) y PPTX (con master template, dashboard de KPIs "
    "y slide final con marco normativo). Cada reporte incluye código de documento único, "
    "clasificación y datos del responsable.",
    style_body
))

# 4.7 Filtrado regional
story.append(Paragraph("4.7 Filtrado Regional con Zonas Marítimas", style_h2))
story.append(Paragraph(
    "Sistema de filtrado basado en la estructura regional oficial de DIRECTEMAR: 5 Zonas "
    "Marítimas mayores (ZM-1 Valparaíso, ZM-2 Talcahuano, ZM-3 Puerto Montt, ZM-4 Punta "
    "Arenas, ZM-5 Iquique), cada una con dirección postal real de la Gobernación Marítima, "
    "teléfono oficial, capitán de zona y regiones administrativas bajo su jurisdicción. "
    "Todos los datos del sistema (puertos, buques, alertas, trámites, bitácora) se filtran "
    "según la zona seleccionada.",
    style_body
))

story.append(PageBreak())

# ==================== 5. CRONOGRAMA ====================
story.append(Paragraph("5. Cronograma de Implementación", style_h1))
story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_SECONDARY))
story.append(Spacer(1, 3*mm))

story.append(Paragraph(
    "El plazo de entrega garantizado es de <b>8 días hábiles</b>, lo que asegura el puntaje "
    "máximo (100 puntos) en el criterio de Plazo de Entrega (20% de ponderación). El detalle "
    "de actividades es el siguiente:",
    style_body
))

story.append(Spacer(1, 4*mm))

crono_data = [
    ["DÍA", "ACTIVIDAD", "RESPONSABLE", "ENTREGABLE"],
    ["1-2", "Adquisición de 3 licencias TZ Coastal Monitoring\n+ certificados digitales a nombre de DIRECTEMAR",
     "Proveedor", "Licencias + certificados digitales"],
    ["3", "Visita técnica a dependencias de DIRECTEMAR\nVerificación de hardware existente\n(radares, cámaras, receptores VHF)",
     "Proveedor + DIRECTEMAR", "Acta de visita técnica"],
    ["4", "Instalación de TZ Coastal Monitoring\nen estaciones de trabajo designadas",
     "Proveedor", "Software instalado y configurado"],
    ["5", "Instalación de receptores VHF + cámaras IP\n(si DIRECTEMAR no dispone de ellas)\nConfiguración de integración",
     "Proveedor", "Hardware instalado e integrado"],
    ["6", "Integración de Plataforma Web complementaria\nConexión a feeds AIS/radar/cámaras\nConfiguración de panel VTS y CCTV",
     "Proveedor", "Plataforma web operativa"],
    ["7", "Pruebas de integración end-to-end\nVerificación de 5.000 blancos AIS\nPrueba de grabación VHF + playback\nPrueba de alarmas y zonas",
     "Proveedor + DIRECTEMAR", "Acta de pruebas conformes"],
    ["8", "Entrega formal + certificados al correo\ndirectemar (mtorresc@dgtm.cl)\nCapacitación al personal de turno\n(2 horas)",
     "Proveedor", "Certificados entregados\nActa de recepción conforme"],
]

crono_table = Table(crono_data, colWidths=[1.2*cm, 6.8*cm, 3*cm, 6*cm])
crono_table.setStyle(TableStyle([
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 8),
    ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY),
    ('TEXTCOLOR', (0,0), (-1,0), white),
    ('ALIGN', (0,0), (-1,0), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
    ('FONTSIZE', (0,1), (-1,-1), 7.5),
    ('GRID', (0,0), (-1,-1), 0.3, COLOR_BORDER),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('LEFTPADDING', (0,0), (-1,-1), 4),
    ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ('ALIGN', (0,1), (0,-1), 'CENTER'),
    ('FONTNAME', (0,1), (0,-1), 'Helvetica-Bold'),
    ('TEXTCOLOR', (0,1), (0,-1), COLOR_SECONDARY),
    # Alternar filas
    ('BACKGROUND', (0,1), (-1,1), COLOR_BG_LIGHT),
    ('BACKGROUND', (0,3), (-1,3), COLOR_BG_LIGHT),
    ('BACKGROUND', (0,5), (-1,5), COLOR_BG_LIGHT),
    ('BACKGROUND', (0,7), (-1,7), COLOR_BG_LIGHT),
]))
story.append(crono_table)

story.append(Spacer(1, 5*mm))
story.append(Paragraph(
    "<b>Plazo total: 8 días hábiles</b> — Puntaje máximo en criterio Plazo de Entrega (100 puntos × 20% = 20.0 pts).",
    ParagraphStyle('Note', parent=style_body, fontName='Helvetica-Bold',
        textColor=COLOR_SECONDARY, alignment=TA_CENTER)
))

story.append(PageBreak())

# ==================== 6. SOPORTE TÉCNICO ====================
story.append(Paragraph("6. Soporte Técnico 12 Meses", style_h1))
story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_SECONDARY))
story.append(Spacer(1, 3*mm))

story.append(Paragraph(
    "Conforme a lo exigido en la Cláusula N° 8, letra f), número 2), de las bases técnicas, "
    "el adjudicatario otorgará soporte técnico por un periodo de 12 meses asociado a fallas "
    "de las licencias. Este soporte incluye:",
    style_body
))

story.append(Spacer(1, 3*mm))

soporte_data = [
    ["NIVEL", "TIPO DE INCIDENCIA", "TIEMPO RESPUESTA", "CANAL"],
    ["N1 — Crítico", "Sistema no operativo\n(caída de VTS, pérdida de datos)", "2 horas", "Teléfono + email + presencial"],
    ["N2 — Alto", "Función degradada\n(integración cámara/radar con fallas)", "4 horas", "Teléfono + email"],
    ["N3 — Medio", "Consulta técnica\n(configuración, actualizaciones)", "24 horas", "Email"],
    ["N4 — Bajo", "Solicitud de información\n(reportes, documentación)", "48 horas", "Email"],
]

soporte_table = Table(soporte_data, colWidths=[3*cm, 6*cm, 3.5*cm, 4.5*cm])
soporte_table.setStyle(TableStyle([
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 8),
    ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY),
    ('TEXTCOLOR', (0,0), (-1,0), white),
    ('ALIGN', (0,0), (-1,0), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
    ('FONTSIZE', (0,1), (-1,-1), 8),
    ('GRID', (0,0), (-1,-1), 0.3, COLOR_BORDER),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('LEFTPADDING', (0,0), (-1,-1), 4),
    ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ('ALIGN', (0,1), (0,-1), 'CENTER'),
    ('ALIGN', (2,1), (2,-1), 'CENTER'),
    ('BACKGROUND', (0,1), (-1,1), HexColor("#FEE2E2")),
    ('BACKGROUND', (0,2), (-1,2), HexColor("#FEF3C7")),
    ('BACKGROUND', (0,3), (-1,3), COLOR_BG_LIGHT),
    ('BACKGROUND', (0,4), (-1,4), COLOR_BG_LIGHT),
]))
story.append(soporte_table)

story.append(Spacer(1, 5*mm))
story.append(Paragraph(
    "El soporte cubre fallas de las licencias TZ Coastal Monitoring y de la Plataforma Web "
    "complementaria. Se disponibiliza mesa de ayuda especializada con ingenieros con "
    "conocimiento del dominio marítimo, durante horario operativo (08:00-20:00) y guardia "
    "24/7 para incidentes críticos.",
    style_body
))

story.append(PageBreak())

# ==================== 7. CUMPLIMIENTO NORMATIVO ====================
story.append(Paragraph("7. Cumplimiento Normativo", style_h1))
story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_SECONDARY))
story.append(Spacer(1, 3*mm))

norma_data = [
    ["NORMA", "APLICACIÓN EN LA SOLUCIÓN"],
    ["DS (M) N° 1/1941",
     "Marco fundacional de jurisdicción marítima. La plataforma respeta las facultades "
     "de la Autoridad Marítima y no reemplaza la potestad de la Capitanía de Puerto."],
    ["IALA V-103",
     "Estándares para centros VTS. El software base TZ Coastal Monitoring cumple este "
     "estándar. La plataforma web complementaria sigue las recomendaciones de visualización."],
    ["Ley N° 21.719",
     "Protección de Datos Personales. La plataforma web cifra datos de tripulantes, patrones "
     "y postulantes, con derechos ARCO implementados y minimización de datos en formularios."],
    ["Ley N° 20.285",
     "Acceso a la Información Pública. La plataforma publica resoluciones EXENTAS y datos "
     "operativos no sensibles como datos abiertos (JSON, CSV, GeoJSON)."],
    ["Ley N° 19.799",
     "Firma Electrónica. La bitácora auditante utiliza hash criptográfico SHA-256 con validez "
     "probatoria. Los trámites usan firma electrónica avanzada vía ClaveÚnica."],
    ["SOLAS Cap. V",
     "Seguridad de la Vida Humana en el Mar. El sistema procesa datos AIS conforme al "
     "Capítulo V de SOLAS y habilita comunicaciones GMDSS."],
    ["MARPOL",
     "Prevención de Contaminación. La plataforma incluye registro de residuos en bitácora "
     "ambiental y validación de certificados P&I."],
]

norma_table = Table(norma_data, colWidths=[3.5*cm, 13.5*cm])
norma_table.setStyle(TableStyle([
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 8),
    ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY),
    ('TEXTCOLOR', (0,0), (-1,0), white),
    ('ALIGN', (0,0), (-1,0), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('FONTNAME', (0,1), (0,-1), 'Helvetica-Bold'),
    ('FONTNAME', (1,1), (1,-1), 'Helvetica'),
    ('FONTSIZE', (0,1), (-1,-1), 8),
    ('TEXTCOLOR', (0,1), (0,-1), COLOR_SECONDARY),
    ('GRID', (0,0), (-1,-1), 0.3, COLOR_BORDER),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ('BACKGROUND', (0,1), (0,-1), COLOR_BG_LIGHT),
]))
story.append(norma_table)

story.append(PageBreak())

# ==================== 8. CONCLUSIÓN ====================
story.append(Paragraph("8. Conclusión", style_h1))
story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_SECONDARY))
story.append(Spacer(1, 3*mm))

story.append(Paragraph(
    "La propuesta técnica presentada cumple íntegramente los requerimientos exigidos en las "
    "bases de la licitación ID 3134-87-LE26, mediante la provisión de tres (3) licencias del "
    "software TZ Coastal Monitoring de TimeZero/Furuno, con integración nativa a radares "
    "Furuno, receptores AIS, cámaras IP (AXIS/FLIR/ONVIF/Pelco-D), grabación de 4 canales "
    "VHF y seguimiento de 5.000 blancos AIS + 200 ARPA.",
    style_body
))

story.append(Spacer(1, 3*mm))

story.append(Paragraph(
    "Adicionalmente, la incorporación de la <b>Plataforma Marítima Nacional</b> como valor "
    "agregado diferencia esta oferta de cualquier competencia que solo entregue las licencias "
    "comerciales. Esta plataforma aporta capacidades únicas en el mercado chileno: panel VTS "
    "web con estilo militar, bitácora auditante con blockchain privado, trámites en línea con "
    "ClaveÚnica, chatbot de capellanía pastoral, exportación de reportes institucionales en "
    "4 formatos, y filtrado regional con las 5 Zonas Marítimas oficiales de DIRECTEMAR.",
    style_body
))

story.append(Spacer(1, 3*mm))

story.append(Paragraph(
    "El plazo de entrega de <b>8 días hábiles</b> asegura el puntaje máximo en el criterio de "
    "Plazo de Entrega (20%). La oferta económica neta de <b>$43.589.744 CLP</b>, equivalente "
    "al 87.9% del presupuesto disponible, posiciona esta propuesta como altamente competitiva "
    "en el criterio de Precio (60%), sin sacrificar la calidad técnica ni el cumplimiento "
    "normativo.",
    style_body
))

story.append(Spacer(1, 8*mm))

# Firma
story.append(HRFlowable(width="100%", thickness=0.5, color=COLOR_BORDER))
story.append(Spacer(1, 15*mm))

firma_data = [
    ["", ""],
    ["_______________________________", "_______________________________"],
    ["Representante Legal", "Firma"],
    ["", ""],
    ["NOMBRE:", ""],
    ["RUT:", ""],
    ["EMPRESA:", ""],
    ["FECHA:", datetime.now().strftime("%d/%m/%Y")],
]
firma = Table(firma_data, colWidths=[8.5*cm, 8.5*cm])
firma.setStyle(TableStyle([
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
    ('TEXTCOLOR', (0,2), (-1,2), COLOR_MUTED),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
]))
story.append(firma)

# ==================== FOOTER CON PAGINACIÓN ====================
def add_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(COLOR_MUTED)
    page_num = canvas.getPageNumber()
    # Línea del footer
    canvas.setStrokeColor(COLOR_BORDER)
    canvas.setLineWidth(0.3)
    canvas.line(2*cm, 1.5*cm, A4[0] - 2*cm, 1.5*cm)
    # Texto izquierdo
    canvas.drawString(
        2*cm, 1.1*cm,
        "DIRECTEMAR · Presentación Técnica · Licitación 3134-87-LE26"
    )
    # Texto derecho (paginación)
    canvas.drawRightString(
        A4[0] - 2*cm, 1.1*cm,
        f"Página {page_num}"
    )
    canvas.restoreState()

doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)

print(f"PDF generado: {output_path}")
print(f"Tamaño: {os.path.getsize(output_path):,} bytes")
