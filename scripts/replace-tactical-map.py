import re

with open('/home/z/my-project/src/components/directemar/operacion-vts.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the TacticalMap function and replace it entirely
start_marker = "function TacticalMap({"
start_idx = content.find(start_marker)
if start_idx < 0:
    print("ERROR: start marker not found")
    exit(1)

# Find end: next "^}" at column 0 after start_idx
end_pattern = re.compile(r'^\}', re.MULTILINE)
end_match = end_pattern.search(content, start_idx)
if not end_match:
    print("ERROR: end marker not found")
    exit(1)

old_func = content[start_idx:end_match.end()]
print(f"Old function length: {len(old_func)} chars, {old_func.count(chr(10))} lines")

new_func = '''function TacticalMap({
  vessels,
  selectedMmsi,
  onSelect,
  showLabels,
  showTrails,
  zoom,
  onZoomChange,
  pan,
  onPanChange,
}: {
  vessels: Vessel[];
  selectedMmsi: string | null;
  onSelect: (mmsi: string) => void;
  showLabels: boolean;
  showTrails: boolean;
  zoom: number;
  onZoomChange: (z: number) => void;
  pan: { x: number; y: number };
  onPanChange: (p: { x: number; y: number }) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: string; lng: string } | null>(null);

  const project = useCallback((lat: number, lng: number) => {
    const baseX = ((lng - (-75)) / ((-69) - (-75))) * 100;
    const baseY = ((lat - (-17)) / ((-56) - (-17))) * 100;
    const cx = 50;
    const cy = 65;
    const x = cx + (baseX - cx) * zoom + pan.x;
    const y = cy + (baseY - cy) * zoom + pan.y;
    return { x, y };
  }, [zoom, pan]);

  const unproject = useCallback((sx: number, sy: number) => {
    const cx = 50;
    const cy = 65;
    const baseX = (sx - cx - pan.x) / zoom + cx;
    const baseY = (sy - cy - pan.y) / zoom + cy;
    const lng = -75 + (baseX / 100) * ((-69) - (-75));
    const lat = -17 + (baseY / 100) * ((-56) - (-17));
    return { lat, lng };
  }, [zoom, pan]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    const newZoom = Math.max(0.5, Math.min(6, zoom + delta));
    onZoomChange(Math.round(newZoom * 100) / 100);
  }, [zoom, onZoomChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const dx = (e.clientX - dragStart.current.x) / 8;
      const dy = (e.clientY - dragStart.current.y) / 8;
      onPanChange({
        x: panStart.current.x + dx,
        y: panStart.current.y + dy,
      });
    }
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const sx = ((e.clientX - rect.left) / rect.width) * 100;
      const sy = ((e.clientY - rect.top) / rect.height) * 130;
      const { lat, lng } = unproject(sx, sy);
      if (lat >= -57 && lat <= -16 && lng >= -76 && lng <= -68) {
        setCoords({
          lat: lat.toFixed(4) + "°",
          lng: lng.toFixed(4) + "°",
        });
      } else {
        setCoords(null);
      }
    }
  }, [isDragging, onPanChange, unproject]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setHovered(null);
    setCoords(null);
  }, []);

  const zoomIn = () => onZoomChange(Math.min(6, Math.round((zoom + 0.5) * 100) / 100));
  const zoomOut = () => onZoomChange(Math.max(0.5, Math.round((zoom - 0.5) * 100) / 100));
  const resetView = () => {
    onZoomChange(1);
    onPanChange({ x: 0, y: 0 });
  };

  return (
    <div
      className="relative aspect-[3/4] sm:aspect-[2/3] max-h-[680px] overflow-hidden select-none"
      style={{
        background: "radial-gradient(ellipse at center, #0a1929 0%, #050d18 70%, #020608 100%)",
        cursor: isDragging ? "grabbing" : "crosshair",
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 130"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="vesselGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDevation="0.4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="radarGrid" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#1a3a5c" strokeWidth="0.08" opacity="0.4" />
          </pattern>
          <pattern id="radarGridMajor" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2a5a8c" strokeWidth="0.15" opacity="0.5" />
          </pattern>
          <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3e848a" stopOpacity="0" />
            <stop offset="100%" stopColor="#3e848a" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="100" height="130" fill="url(#radarGrid)" />
        <rect x="0" y="0" width="100" height="130" fill="url(#radarGridMajor)" />

        {[10, 20, 30, 40].map((r) => (
          <circle
            key={r}
            cx={50}
            cy={65}
            r={r}
            fill="none"
            stroke="#2a5a8c"
            strokeWidth="0.1"
            strokeDasharray="0.5 0.8"
            opacity="0.5"
          />
        ))}

        <line x1="0" y1="65" x2="100" y2="65" stroke="#2a5a8c" strokeWidth="0.08" strokeDasharray="0.4 0.6" opacity="0.4" />
        <line x1="50" y1="0" x2="50" y2="130" stroke="#2a5a8c" strokeWidth="0.08" strokeDasharray="0.4 0.6" opacity="0.4" />

        <g style={{ transformOrigin: "50px 65px" }}>
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 65"
              to="360 50 65"
              dur="8s"
              repeatCount="indefinite"
            />
            <path
              d="M 50 65 L 50 25 A 40 40 0 0 1 78 35 Z"
              fill="url(#sweepGrad)"
              opacity="0.5"
            />
            <line x1="50" y1="65" x2="50" y2="25" stroke="#3e848a" strokeWidth="0.15" opacity="0.7" />
          </g>
        </g>

        <path
          d="M 75 5 L 30 5 L 30 125 L 45 125 L 50 115 L 55 105 L 50 95 L 48 85 L 50 75 L 52 65 L 50 55 L 48 45 L 50 35 L 55 25 L 65 15 L 75 5 Z"
          fill="oklch(0.62 0.13 185 / 0.05)"
          stroke="oklch(0.62 0.13 185 / 0.55)"
          strokeWidth="0.25"
          strokeDasharray="1.2 0.8"
        />

        <path
          d="M 75 5 L 65 15 L 55 25 L 50 35 L 48 45 L 50 55 L 52 65 L 50 75 L 48 85 L 50 95 L 55 105 L 50 115 L 45 125 L 100 125 L 100 5 Z"
          fill="#1a2a3a"
          stroke="#0a1525"
          strokeWidth="0.1"
        />
        <path
          d="M 75 5 L 65 15 L 55 25 L 50 35 L 48 45 L 50 55 L 52 65 L 50 75 L 48 85 L 50 95 L 55 105 L 50 115 L 45 125"
          fill="none"
          stroke="#3e848a"
          strokeWidth="0.25"
          opacity="0.8"
        />

        {PORTS.map((port) => {
          const { x, y } = project(port.lat, port.lng);
          const color = port.status === "open" ? "#3fb950" : port.status === "restricted" ? "#d29922" : "#f85149";
          return (
            <g key={port.code}>
              {port.status !== "open" && (
                <circle cx={x} cy={y} r={1.5 / zoom} fill={color} opacity="0.3">
                  <animate attributeName="r" values={`${0.8 / zoom};${2.5 / zoom};${0.8 / zoom}`} dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <rect
                x={x - 0.5 / zoom}
                y={y - 0.5 / zoom}
                width={1 / zoom}
                height={1 / zoom}
                fill={color}
                stroke="#fff"
                strokeWidth={0.1 / zoom}
              />
              {showLabels && zoom > 1.2 && (
                <text
                  x={x + 1.2 / zoom}
                  y={y + 0.4 / zoom}
                  fontSize={1.2 / zoom}
                  fill="#c9d1d9"
                  opacity="0.75"
                  fontFamily="monospace"
                >
                  {port.name}
                </text>
              )}
            </g>
          );
        })}

        {vessels.map((v) => {
          const { x, y } = project(v.lat, v.lng);
          const color = VESSEL_COLORS[v.type];
          const isSelected = v.mmsi === selectedMmsi;
          const isHovered = v.mmsi === hovered;
          const isHigh = v.risk === "high";
          const sizeFactor = 1 / zoom;

          const rad = (v.cogDeg * Math.PI) / 180;
          const arrowLen = (v.sogKn > 0 ? 2 : 0) * (zoom > 1.5 ? 1.2 : 1);
          const ax = x + Math.sin(rad) * arrowLen;
          const ay = y - Math.cos(rad) * arrowLen;

          return (
            <g
              key={v.mmsi}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(v.mmsi);
              }}
              onMouseEnter={() => setHovered(v.mmsi)}
              onMouseLeave={() => setHovered(null)}
              filter={isSelected ? "url(#vesselGlow)" : undefined}
            >
              {showTrails && v.sogKn > 0 && (
                <line
                  x1={x - Math.sin(rad) * 3}
                  y1={y + Math.cos(rad) * 3}
                  x2={x}
                  y2={y}
                  stroke={color}
                  strokeWidth={0.18 * sizeFactor}
                  opacity="0.35"
                  strokeDasharray="0.5 0.4"
                />
              )}

              {isSelected && (
                <circle cx={x} cy={y} r={2.5 * sizeFactor} fill="none" stroke="#3e848a" strokeWidth={0.35 * sizeFactor}>
                  <animate attributeName="r" values={`${1.5 * sizeFactor};${3.5 * sizeFactor};${1.5 * sizeFactor}`} dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              {isHovered && !isSelected && (
                <circle cx={x} cy={y} r={2 * sizeFactor} fill="none" stroke="#c9d1d9" strokeWidth={0.2 * sizeFactor} opacity="0.6" />
              )}

              {isHigh && (
                <circle cx={x} cy={y} r={1.8 * sizeFactor} fill="#f85149" opacity="0.35">
                  <animate attributeName="r" values={`${1 * sizeFactor};${3 * sizeFactor};${1 * sizeFactor}`} dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              {v.sogKn > 0 && (
                <line
                  x1={x}
                  y1={y}
                  x2={ax}
                  y2={ay}
                  stroke={color}
                  strokeWidth={0.3 * sizeFactor}
                  opacity="0.9"
                />
              )}

              <polygon
                points={`0,${-1 * sizeFactor} ${-0.6 * sizeFactor},${0.6 * sizeFactor} ${0.6 * sizeFactor},${0.6 * sizeFactor}`}
                fill={color}
                stroke={isSelected ? "#ffffff" : "#0a1525"}
                strokeWidth={(isSelected ? 0.25 : 0.12) * sizeFactor}
                transform={`translate(${x} ${y}) rotate(${v.cogDeg})`}
              />

              {(showLabels || isHovered || isSelected || isHigh) && (isSelected || isHovered || isHigh || zoom > 2) && (
                <text
                  x={x + 1.5 * sizeFactor}
                  y={y - 0.8 * sizeFactor}
                  fontSize={1.4 / zoom}
                  fill={isHigh ? "#f85149" : "#e6edf3"}
                  opacity="0.95"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {v.name}
                </text>
              )}
              {(isSelected || isHovered) && (
                <text
                  x={x + 1.5 * sizeFactor}
                  y={y - 0.8 * sizeFactor + 1.6 / zoom}
                  fontSize={1.1 / zoom}
                  fill="#8b949e"
                  fontFamily="monospace"
                >
                  {v.sogKn}kn · {v.cogDeg}°
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-2.5 py-1.5 border border-cyan-500/30">
        <div className="flex items-center gap-1.5">
          <Radar className="h-3 w-3 text-cyan-400" />
          <span className="font-mono text-[10px] font-bold text-cyan-400 tracking-wider">VTS · CHL</span>
          <span className="text-[8px] text-cyan-400/60 font-mono">|</span>
          <span className="text-[8px] text-cyan-400/60 font-mono">IALA V-103</span>
        </div>
        <div className="text-[8px] text-cyan-400/60 font-mono mt-0.5">
          ARMADA DE CHILE · DIRECTEMAR
        </div>
      </div>

      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-md px-2.5 py-1.5 border border-cyan-500/30 font-mono text-[9px]">
        <div className="flex items-center gap-2 text-cyan-300">
          <span className="flex items-center gap-0.5">
            <Filter className="h-2.5 w-2.5" />
            <span className="font-bold text-white">{vessels.length}</span>
            <span className="text-cyan-400/60">targets</span>
          </span>
        </div>
        {coords && (
          <div className="mt-0.5 text-cyan-400/80">
            <div>LAT {coords.lat}</div>
            <div>LNG {coords.lng}</div>
          </div>
        )}
      </div>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        <button
          onClick={zoomIn}
          disabled={zoom >= 6}
          className="h-7 w-7 rounded-md bg-black/60 backdrop-blur-sm border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors text-cyan-400 flex items-center justify-center disabled:opacity-30"
          aria-label="Acercar"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={zoomOut}
          disabled={zoom <= 0.5}
          className="h-7 w-7 rounded-md bg-black/60 backdrop-blur-sm border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors text-cyan-400 flex items-center justify-center disabled:opacity-30"
          aria-label="Alejar"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={resetView}
          className="h-7 w-7 rounded-md bg-black/60 backdrop-blur-sm border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors text-cyan-400 flex items-center justify-center"
          aria-label="Centrar"
        >
          <CenterIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-2.5 py-1.5 border border-cyan-500/30">
        <div className="text-[8px] text-cyan-400/70 font-mono uppercase tracking-wider mb-1">Tipos de Buque</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          {Object.entries(VESSEL_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-sm" style={{ background: color }} />
              <span className="text-[8px] text-cyan-100/90 font-mono">{VESSEL_TYPE_LABELS[type as Vessel["type"]]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
        <div className="bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 border border-cyan-500/30 font-mono text-[9px] text-cyan-400">
          ZOOM <span className="text-white font-bold">{zoom.toFixed(2)}x</span>
        </div>
        <div className="bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 border border-emerald-500/30 font-mono text-[9px]">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-emerald-400">AIS LIVE</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-md px-2.5 py-1 border border-cyan-500/30 hidden md:block">
        <div className="flex items-center gap-3 text-[8px] font-mono">
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            RADAR
          </span>
          <span className="text-cyan-400/40">|</span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            AIS
          </span>
          <span className="text-cyan-400/40">|</span>
          <span className="flex items-center gap-1 text-cyan-400">
            <Camera className="h-2.5 w-2.5" />
            CAM-01
          </span>
          <span className="text-cyan-400/40">|</span>
          <span className="flex items-center gap-1 text-cyan-400">
            <Video className="h-2.5 w-2.5" />
            CAM-02
          </span>
        </div>
      </div>

      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, transparent 48%, rgba(62, 132, 138, 0.4) 50%, transparent 52%, transparent 100%)",
          backgroundSize: "100% 8px",
          animation: "scanlines 8s linear infinite",
        }}
      />
      <style>{`
        @keyframes scanlines {
          0% { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }
      `}</style>
    </div>
  );
}

function ColorPalettePanel() {
  const palettes: Array<{
    title: string;
    items: Array<{ label: string; color: string; description?: string }>;
  }> = [
    {
      title: "Tipos de Buque",
      items: [
        { label: "Carga (Cargo)", color: VESSEL_COLORS.Cargo, description: "Buques mercantes portacontenedores, graneleros" },
        { label: "Petrolero (Tanker)", color: VESSEL_COLORS.Tanker, description: "Carga líquida/peligrosa" },
        { label: "Pesca (Fishing)", color: VESSEL_COLORS.Fishing, description: "Buques pesqueros industriales y artesanales" },
        { label: "Pasajeros", color: VESSEL_COLORS.Passenger, description: "Cruceros, ferrys, transbordadores" },
        { label: "Práctico (Pilot)", color: VESSEL_COLORS.Pilot, description: "Lanchas de prácticos de puerto" },
        { label: "Remolcador (Tug)", color: VESSEL_COLORS.Tug, description: "Tugboats y asistencia portuaria" },
        { label: "Naval", color: VESSEL_COLORS.Naval, description: "Unidades de la Armada" },
      ],
    },
    {
      title: "Estado de Puerto",
      items: [
        { label: "Operativo", color: "#3fb950", description: "Puerto abierto a operaciones normales" },
        { label: "Restringido", color: "#d29922", description: "Operaciones limitadas por condiciones" },
        { label: "Cerrado", color: "#f85149", description: "Cierre temporal por alerta crítica" },
      ],
    },
    {
      title: "Severidad de Alerta",
      items: [
        { label: "Info", color: "#3e848a", description: "Información operativa rutinaria" },
        { label: "Advertencia", color: "#d29922", description: "Requiere atención del operador" },
        { label: "Crítica", color: "#f85149", description: "Intervención inmediata del Capitán de Puerto" },
      ],
    },
    {
      title: "Nivel de Riesgo",
      items: [
        { label: "Bajo", color: "#3fb950", description: "Cumplimiento normativo completo" },
        { label: "Medio", color: "#d29922", description: "Vigilancia reforzada" },
        { label: "Alto", color: "#f85149", description: "Infracción o peligro inminente" },
      ],
    },
    {
      title: "Rumbo Náutico (COG)",
      items: [
        { label: "Norte (000°)", color: "#58a6ff" },
        { label: "Este (090°)", color: "#3fb950" },
        { label: "Sur (180°)", color: "#f85149" },
        { label: "Oeste (270°)", color: "#bc8cff" },
      ],
    },
  ];

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold">Paleta de Colores VTS</h3>
          <span className="text-[10px] text-muted-foreground ml-auto">
            Estándar IALA V-103 · Maritime VTS Color Scheme
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {palettes.map((p) => (
            <div key={p.title} className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                {p.title}
              </div>
              <div className="space-y-1">
                {p.items.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-3 w-3 rounded-sm shrink-0 border border-border"
                      style={{ background: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-[10px] text-muted-foreground leading-tight">{item.description}</div>
                      )}
                    </div>
                    <code className="text-[9px] font-mono text-muted-foreground shrink-0">{item.color}</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}'''

content = content[:start_idx] + new_func + content[end_match.end():]

with open('/home/z/my-project/src/components/directemar/operacion-vts.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"New function length: {len(new_func)} chars")
print("Done")
