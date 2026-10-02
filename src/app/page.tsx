"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Header } from "@/components/directemar/header";
import { Sidebar } from "@/components/directemar/sidebar";
import { Footer } from "@/components/directemar/footer";
import { PanelGeneral } from "@/components/directemar/panel-general";
import { OperacionVTS } from "@/components/directemar/operacion-vts";
import { BitacoraAuditante } from "@/components/directemar/bitacora-auditante";
import { TramitesLogistica } from "@/components/directemar/tramites-logistica";
import { NormativaMaritima } from "@/components/directemar/normativa-maritima";
import { DatosEstadisticas } from "@/components/directemar/datos-estadisticas";
import { GlaucoChat } from "@/components/directemar/glauco-chat";
import { Button } from "@/components/ui/button";
import { INITIAL_ALERTS } from "@/lib/directemar-data";

export default function Home() {
  const [activeSection, setActiveSection] = useState("panel");
  const [activeRole, setActiveRole] = useState("operador");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const alertsCount = INITIAL_ALERTS.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        alertsCount={alertsCount}
      />

      <div className="flex flex-1 w-full">
        <Sidebar
          active={activeSection}
          onNavigate={setActiveSection}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />

        <main className="flex-1 min-w-0 flex flex-col">
          {/* Mobile nav trigger */}
          <div className="md:hidden sticky top-14 z-30 bg-background/90 backdrop-blur-sm border-b border-border px-3 py-2 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileNavOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Menu className="h-4 w-4" />
              Módulos
            </Button>
            <div className="text-xs text-muted-foreground font-medium">
              {
                {
                  panel: "Panel General",
                  operacion: "Operación VTS",
                  bitacora: "Bitácora Auditante",
                  tramites: "Trámites y Logística",
                  normativa: "Gobernanza Marítima",
                  datos: "Datos y Estadísticas",
                }[activeSection]
              }
            </div>
          </div>

          <div className="flex-1 p-3 sm:p-4 lg:p-6">
            {activeSection === "panel" && <PanelGeneral onNavigate={setActiveSection} />}
            {activeSection === "operacion" && <OperacionVTS />}
            {activeSection === "bitacora" && <BitacoraAuditante />}
            {activeSection === "tramites" && <TramitesLogistica />}
            {activeSection === "normativa" && <NormativaMaritima />}
            {activeSection === "datos" && <DatosEstadisticas />}
          </div>

          <Footer />
        </main>
      </div>

      {/* Glauco — Asistente espiritual y operativo del mar */}
      <GlaucoChat />
    </div>
  );
}
