"use client";

import { Clock, Anchor, Bell, Search, ChevronDown, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { USER_ROLES } from "@/lib/directemar-data";

interface HeaderProps {
  activeRole: string;
  onRoleChange: (roleId: string) => void;
  alertsCount: number;
}

export function Header({ activeRole, onRoleChange, alertsCount }: HeaderProps) {
  const [now, setNow] = useState<string>("");
  const [utc, setUtc] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(
        d.toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
      const utcStr = `${d.getUTCHours().toString().padStart(2, "0")}${d.getUTCMinutes().toString().padStart(2, "0")}Z`;
      setUtc(utcStr);
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  const role = USER_ROLES.find((r) => r.id === activeRole) || USER_ROLES[0];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-3 px-3 sm:px-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Anchor className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold leading-none tracking-tight">
              DIRECTEMAR
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
              Plataforma Marítima Nacional
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative hidden md:block ml-4 flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar buque, MMSI, folio, resolución…"
            className="h-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40 pl-8"
          />
        </div>

        {/* Status pills */}
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md bg-sidebar-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-sidebar-foreground/70">
              Sist. Operativo
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-sidebar-accent font-mono-tabular">
            <Radio className="h-3 w-3 text-accent" />
            <span className="text-[11px] font-semibold">{utc}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-sidebar-accent font-mono-tabular">
            <Clock className="h-3 w-3 text-sidebar-foreground/60" />
            <span className="text-[11px] font-semibold">{now}</span>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-sidebar-accent text-sidebar-foreground"
              >
                <Bell className="h-4 w-4" />
                {alertsCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white px-1">
                    {alertsCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                Alertas activas
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                <span className="flex-1">Castro — Cierre temporal puerto</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="flex-1">Puerto Montt — Restricción calado</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="flex-1">Talcahuano — Intrusión zona prohibida</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Role switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 px-2 hover:bg-sidebar-accent text-sidebar-foreground"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-accent text-accent-foreground text-[11px] font-bold">
                    {role.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold">{role.label}</span>
                  <span className="text-[10px] text-sidebar-foreground/60">Capitanía de Puerto Valparaíso</span>
                </div>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                Cambiar perfil operativo
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {USER_ROLES.map((r) => (
                <DropdownMenuItem
                  key={r.id}
                  onClick={() => onRoleChange(r.id)}
                  className="gap-2 cursor-pointer"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] font-bold">
                      {r.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{r.label}</span>
                  {activeRole === r.id && (
                    <Badge variant="secondary" className="ml-auto text-[10px]">Activo</Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
