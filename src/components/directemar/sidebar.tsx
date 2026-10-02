"use client";

import {
  Gauge,
  Radar,
  Shield,
  FileText,
  Book,
  BarChart3,
  Anchor,
  X,
} from "lucide-react";
import { NAV_SECTIONS } from "@/lib/directemar-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  gauge: Gauge,
  radar: Radar,
  shield: Shield,
  "file-text": FileText,
  book: Book,
  "bar-chart": BarChart3,
};

interface SidebarProps {
  active: string;
  onNavigate: (sectionId: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ active, onNavigate, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed md:sticky top-0 md:top-14 left-0 z-50 md:z-30",
          "w-60 h-screen md:h-[calc(100vh-3.5rem)]",
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
          "flex flex-col transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Mobile header */}
        <div className="flex md:hidden items-center justify-between px-4 h-14 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Anchor className="h-5 w-5 text-accent" />
            <span className="text-sm font-bold">DIRECTEMAR</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onCloseMobile} className="text-sidebar-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 px-2 py-3 overflow-y-auto scrollbar-thin">
          <div className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/40 font-semibold">
            Módulos
          </div>
          <ul className="space-y-0.5">
            {NAV_SECTIONS.map((section) => {
              const Icon = ICON_MAP[section.icon] || Gauge;
              const isActive = active === section.id;
              return (
                <li key={section.id}>
                  <button
                    onClick={() => {
                      onNavigate(section.id);
                      onCloseMobile();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group",
                      isActive
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{section.label}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-foreground/80" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="px-3 mt-6 pt-4 pb-2 text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/40 font-semibold border-t border-sidebar-border">
            Cumplimiento
          </div>
          <div className="px-3 space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2 text-sidebar-foreground/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>IALA V-103</span>
            </div>
            <div className="flex items-center gap-2 text-sidebar-foreground/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>DS (M) N° 1/1941</span>
            </div>
            <div className="flex items-center gap-2 text-sidebar-foreground/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Ley N° 21.719</span>
            </div>
            <div className="flex items-center gap-2 text-sidebar-foreground/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>ISO/IEC 27001</span>
            </div>
          </div>
        </nav>

        <div className="px-3 py-3 border-t border-sidebar-border text-[10px] text-sidebar-foreground/50">
          <div className="flex items-center justify-between">
            <span>v3.2.1 · Build 26.10.03</span>
            <span className="font-mono-tabular">SN-001</span>
          </div>
        </div>
      </aside>
    </>
  );
}
