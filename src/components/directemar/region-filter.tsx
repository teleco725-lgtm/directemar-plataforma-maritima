"use client";

import { MapPin, ChevronDown, Building2, Phone, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ZONAS_MARITIMAS,
  ALL_REGIONS_FILTER,
  type ZonaMaritima,
} from "@/lib/directemar-data";

interface RegionFilterProps {
  value: string;
  onChange: (zonaCode: string) => void;
  variant?: "compact" | "full";
  className?: string;
}

export function RegionFilter({ value, onChange, variant = "compact", className }: RegionFilterProps) {
  const [showDetail, setShowDetail] = useState(false);
  const selected = ZONAS_MARITIMAS.find((z) => z.code === value);

  if (variant === "full") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onChange(ALL_REGIONS_FILTER)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
              value === ALL_REGIONS_FILTER
                ? "bg-accent text-accent-foreground border-accent shadow-sm"
                : "border-border hover:border-accent/50 hover:bg-muted/50",
            )}
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Todo Chile
            </span>
          </button>
          {ZONAS_MARITIMAS.map((z) => (
            <button
              key={z.code}
              onClick={() => onChange(z.code)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium border transition-all text-left",
                value === z.code
                  ? "bg-accent text-accent-foreground border-accent shadow-sm"
                  : "border-border hover:border-accent/50 hover:bg-muted/50",
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-mono-tabular font-bold">{z.code}</span>
                <span className="truncate">{z.hq}</span>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="rounded-md border border-accent/30 bg-accent/5 p-3">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-md bg-accent/15 text-accent flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{selected.name}</span>
                  <Badge variant="outline" className="text-[10px] font-mono-tabular">{selected.code}</Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {selected.capitanias} capitanías
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-[11px] text-muted-foreground">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold">Dirección</div>
                    <div className="text-foreground">{selected.hqAddress}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold">Teléfono</div>
                    <div className="text-foreground font-mono-tabular flex items-center gap-1">
                      <Phone className="h-2.5 w-2.5" />
                      {selected.hqPhone}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold">Capitán de Zona</div>
                    <div className="text-foreground">{selected.governor}</div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-accent/20">
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-1">Regiones administrativas</div>
                  <div className="flex flex-wrap gap-1">
                    {selected.regions.map((r) => (
                      <Badge key={r} variant="outline" className="text-[9px] py-0">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Compact variant: dropdown-style
  return (
    <div className={cn("relative inline-flex", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-8 pl-3 pr-8 text-xs font-medium rounded-md border border-border bg-card",
          "appearance-none cursor-pointer hover:bg-muted/50 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-accent/30",
        )}
      >
        <option value={ALL_REGIONS_FILTER}>🌍 Todo Chile</option>
        {ZONAS_MARITIMAS.map((z) => (
          <option key={z.code} value={z.code}>
            {z.code} · {z.hq}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
