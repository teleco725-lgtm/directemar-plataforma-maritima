"use client";

import { Anchor, Globe, Shield, Server } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-sidebar text-sidebar-foreground/70">
      <div className="px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[11px]">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Anchor className="h-4 w-4 text-accent" />
              <span className="text-sm font-bold text-sidebar-foreground">DIRECTEMAR</span>
            </div>
            <p className="text-sidebar-foreground/60 leading-relaxed">
              Dirección General del Territorio Marítimo y de Marina Mercante.
              Autoridad Marítima de Chile.
            </p>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 font-semibold mb-2">
              Marco Normativo
            </div>
            <ul className="space-y-1">
              <li>DS (M) N° 1/1941</li>
              <li>Ley N° 21.719</li>
              <li>IALA V-103</li>
              <li>SOLAS / MARPOL</li>
            </ul>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 font-semibold mb-2">
              Fuentes Oficiales
            </div>
            <ul className="space-y-1">
              <li className="flex items-center gap-1.5"><Globe className="h-3 w-3" />SHOA</li>
              <li className="flex items-center gap-1.5"><Globe className="h-3 w-3" />SERVIMET</li>
              <li className="flex items-center gap-1.5"><Globe className="h-3 w-3" />Gobernaciones Marítimas</li>
              <li className="flex items-center gap-1.5"><Globe className="h-3 w-3" />Datos Abiertos</li>
            </ul>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 font-semibold mb-2">
              Seguridad
            </div>
            <ul className="space-y-1">
              <li className="flex items-center gap-1.5"><Shield className="h-3 w-3 text-emerald-400" />Cifrado AES-256</li>
              <li className="flex items-center gap-1.5"><Shield className="h-3 w-3 text-emerald-400" />Firma electrónica</li>
              <li className="flex items-center gap-1.5"><Server className="h-3 w-3 text-emerald-400" />Datacenter CL</li>
              <li className="flex items-center gap-1.5"><Shield className="h-3 w-3 text-emerald-400" />ISO 27001</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-sidebar-border flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-sidebar-foreground/50">
          <div>
            © {new Date().getFullYear()} DIRECTEMAR · Armada de Chile. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-3 font-mono-tabular">
            <span>Uptime 99.97%</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">RTO 15min</span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              Operativo
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
