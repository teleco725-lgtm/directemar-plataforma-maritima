# DIRECTEMAR · Plataforma Marítima Nacional

Sistema web operativo y logístico para la Autoridad Marítima de Chile, alineado al marco normativo chileno e internacional (Decreto Supremo (M) N° 1/1941, IALA V-103, Ley N° 21.719, SOLAS, MARPOL, Ley 20.285 y Ley 19.799).

## 🌊 Características principales

- **Panel General** — Dashboard con KPIs en tiempo real, mapa del litoral chileno con semaforización de 12 puertos, alertas activas y bitácora reciente.
- **Operación VTS** — Consola táctica de control de tráfico marítimo conforme IALA V-103:
  - **SOFTWARE DE CONTROL DE TRÁFICO MARÍTIMO E INTEGRADOR DE RADAR AIS Y CÁMARAS**
  - Radar profesional estilo Armada con zoom interactivo (scroll + botones) y pan con drag
  - 18 buques simulados moviéndose en tiempo real con vectores de velocidad y estelas
  - Anillos de distancia tipo radar, retícula, sweep animado, scan lines
  - 5 Zonas Marítimas oficiales con direcciones reales de Gobernación Marítima
  - Paleta de colores VTS completa (tipos de buque, estados, severidad, riesgo, rumbo)
- **Bitácora Auditante** — Cadena inmutable de eventos con hash criptográfico encadenado (blockchain privado, SHA-256, consenso distribuido en 3 nodos).
- **Trámites y Logística** — Portal de autogestión con ClaveÚnica, firma electrónica Ley 19.799, modal de nuevo trámite y 4 sub-pestañas (Lista, Tipos, Estadísticas, Pagos).
- **Gobernanza Marítima** — Compilación del marco legal aplicable (DS, Leyes, Resoluciones EXENTAS, Convenios Internacionales).
- **Datos y Estadísticas** — Datos abiertos conforme Ley 20.285, gráficos, indicadores de cumplimiento y catálogo de datasets exportables.
- **Glauco** — Chatbot capellán del mar con sabiduría bíblica (AT y NT), búsqueda web y función anti-cortisol.
- **Exportación multi-formato** — PDF, XLSX, DOCX y PPTX con selector interactivo.

## 🚀 Stack tecnológico

- **Next.js 16** con App Router + TypeScript estricto
- **Tailwind CSS 4** + **shadcn/ui** (New York style)
- **z-ai-web-dev-sdk** para LLM y búsqueda web (Glauco)
- **xlsx, jspdf, jspdf-autotable, docx, pptxgenjs** para exportación
- Soporte **dark mode** completo
- 100% responsive (mobile-first con sidebar colapsable)

## 🛠️ Desarrollo local

```bash
# Instalar dependencias
bun install

# Modo desarrollo
bun run dev

# Build de producción
bun run build

# Lint
bun run lint
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📦 Deploy en Vercel

1. Fork del repositorio en GitHub
2. Importar el repositorio en [vercel.com/new](https://vercel.com/new)
3. Vercel detecta automáticamente Next.js (ver `vercel.json`)
4. No requiere variables de entorno adicionales para el modo demo (datos mock en memoria)
5. Deploy ✅

## 📁 Estructura del proyecto

```
src/
  app/
    api/glauco/chat/route.ts  # API route del chatbot Glauco
    globals.css               # Tema Mariner Command Center
    layout.tsx                # Layout con metadata DIRECTEMAR
    page.tsx                  # Página única con switching de módulos
  components/
    directemar/               # 11 componentes modulares
      header.tsx
      sidebar.tsx
      footer.tsx
      panel-general.tsx
      operacion-vts.tsx       # Radar estilo Armada + zoom + paleta
      bitacora-auditante.tsx
      tramites-logistica.tsx
      normativa-maritima.tsx  # Gobernanza Marítima
      datos-estadisticas.tsx
      glauco-chat.tsx         # Chatbot capellán
      region-filter.tsx       # Filtro por Zonas Marítimas
      export-modal.tsx        # Export PDF/XLSX/DOCX/PPTX
  lib/
    directemar-data.ts        # Mock data + estructura regional
    export-utils.ts           # Generadores de archivos
```

## 🎖️ Marco normativo aplicado

| Norma | Aplicación |
|-------|-----------|
| DS (M) N° 1/1941 | Marco fundacional de jurisdicción marítima |
| Ley N° 21.719 | Protección de datos personales |
| IALA V-103 | Estándares para centros VTS |
| Ley N° 20.285 | Transparencia y datos abiertos |
| Ley N° 19.799 | Firma electrónica avanzada |
| SOLAS Cap. V | Seguridad de la navegación |
| MARPOL | Prevención de contaminación marítima |

## 🏛️ Estructura regional DIRECTEMAR

5 Zonas Marítimas mayores con sus direcciones oficiales:

- **ZM-1** — Primera Zona Marítima · Valparaíso (Plaza Sotomayor 532)
- **ZM-2** — Segunda Zona Marítima · Talcahuano (Av. Jorge Alessandri 2500)
- **ZM-3** — Tercera Zona Marítima · Puerto Montt (Av. Angelmó 1655)
- **ZM-4** — Cuarta Zona Marítima · Punta Arenas (Av. Colón 1098)
- **ZM-5** — Quinta Zona Marítima · Iquique (Aníbal Pinto 595)

---

© DIRECTEMAR · Dirección General del Territorio Marítimo y de Marina Mercante · Autoridad Marítima de Chile
