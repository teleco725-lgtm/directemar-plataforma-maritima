// Simulación de datos operacionales DIRECTEMAR
// Todos los datos son sintéticos pero realistas, basados en la operación real
// de la Autoridad Marítima de Chile.

export type PortStatus = "open" | "restricted" | "closed";
export type AlertSeverity = "info" | "warning" | "critical";
export type AlertSource = "SERVIMET" | "SHOA" | "AIS" | "GOUMAR" | "SISTEMA";

export interface Port {
  code: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  status: PortStatus;
  windKn: number;
  waveM: number;
  visibilityNm: number;
  lastUpdate: string;
  restriction?: string;
}

export interface Vessel {
  mmsi: string;
  imo: string;
  name: string;
  flag: string;
  type: "Cargo" | "Tanker" | "Fishing" | "Passenger" | "Pilot" | "Tug" | "Naval";
  lat: number;
  lng: number;
  sogKn: number;
  cogDeg: number;
  draftM: number;
  lengthM: number;
  destination: string;
  eta: string;
  status: "Under way" | "At anchor" | "Moored" | "Restricted";
  zone: string;
  lastPort: string;
  risk: "low" | "medium" | "high";
}

export interface MaritimeAlert {
  id: string;
  severity: AlertSeverity;
  source: AlertSource;
  title: string;
  description: string;
  zone: string;
  issuedAt: string;
  validUntil: string;
  acknowledged: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  detail: string;
  hash: string;
  prevHash: string;
  blockSeq: number;
}

export interface Tramite {
  folio: string;
  type: "Zarpe" | "Certificado" | "Permiso Especial" | "Inscripción" | "Renovación";
  applicant: string;
  applicantRut: string;
  vessel: string;
  status: "Borrador" | "Ingresado" | "En Revisión" | "Aprobado" | "Rechazado" | "Pagado";
  submittedAt: string;
  amount: number;
  port: string;
  progress: number;
}

export interface NormaItem {
  id: string;
  tipo: "Decreto Supremo" | "Resolución EXENTA" | "Ley" | "Convenio Internacional" | "Circular";
  numero: string;
  materia: string;
  fecha: string;
  vigente: boolean;
  resumen: string;
}

export const PORTS: Port[] = [
  { code: "CLVAP", name: "Valparaíso", region: "Valparaíso", lat: -33.0458, lng: -71.6267, status: "open", windKn: 12, waveM: 1.2, visibilityNm: 10, lastUpdate: "hace 4 min" },
  { code: "CLSAI", name: "San Antonio", region: "Valparaíso", lat: -33.5936, lng: -71.6106, status: "open", windKn: 14, waveM: 1.5, visibilityNm: 9, lastUpdate: "hace 6 min" },
  { code: "CLPNT", name: "Punta Arenas", region: "Magallanes", lat: -53.1633, lng: -70.9178, status: "restricted", windKn: 32, waveM: 3.8, visibilityNm: 2, lastUpdate: "hace 2 min", restriction: "Viento > 30 nudos — Solo naves > 500 TR con práctico" },
  { code: "CLCNY", name: "Concepción — Talcahuano", region: "Biobío", lat: -36.7054, lng: -73.1167, status: "open", windKn: 10, waveM: 1.0, visibilityNm: 10, lastUpdate: "hace 8 min" },
  { code: "CLANF", name: "Antofagasta", region: "Antofagasta", lat: -23.6594, lng: -70.3978, status: "open", windKn: 8, waveM: 0.9, visibilityNm: 10, lastUpdate: "hace 5 min" },
  { code: "CLIQE", name: "Iquique", region: "Tarapacá", lat: -20.2133, lng: -70.1506, status: "open", windKn: 11, waveM: 1.1, visibilityNm: 10, lastUpdate: "hace 7 min" },
  { code: "CLCJA", name: "Caldera", region: "Atacama", lat: -27.0667, lng: -70.8167, status: "open", windKn: 9, waveM: 0.8, visibilityNm: 10, lastUpdate: "hace 9 min" },
  { code: "CLPMO", name: "Puerto Montt", region: "Los Lagos", lat: -41.4706, lng: -72.9422, status: "restricted", windKn: 24, waveM: 2.4, visibilityNm: 4, lastUpdate: "hace 3 min", restriction: "Oleaje cruzado — Restricción de calado a 8m" },
  { code: "CLCHA", name: "Chañaral", region: "Atacama", lat: -26.3481, lng: -70.6217, status: "open", windKn: 7, waveM: 0.7, visibilityNm: 10, lastUpdate: "hace 11 min" },
  { code: "CLCGS", name: "Castro — Chiloé", region: "Los Lagos", lat: -42.4667, lng: -73.7667, status: "closed", windKn: 38, waveM: 4.2, visibilityNm: 1, lastUpdate: "hace 1 min", restriction: "Cierre temporal — Alerta SERVIMET nivel rojo" },
  { code: "CLCNL", name: "Arica", region: "Arica y Parinacota", lat: -18.4783, lng: -70.3128, status: "open", windKn: 10, waveM: 1.0, visibilityNm: 10, lastUpdate: "hace 6 min" },
  { code: "CLCOQ", name: "Coquimbo", region: "Coquimbo", lat: -29.9511, lng: -71.3436, status: "open", windKn: 11, waveM: 1.1, visibilityNm: 10, lastUpdate: "hace 7 min" },
];

const VESSEL_NAMES = [
  "Pacific Star", "Don Matías", "Río Aysén", "Monte Sarmiento", "Atlantic Trader",
  "Nordic Breeze", "San José", "Llanquihue", "Magallanes Express", "Calypso II",
  "Patagonia", "Antárctic Pride", "Valiente", "Cabo de Hornos", "Beagle",
];

const FLAGS = ["CL", "PA", "LR", "MT", "SG", "HK", "US", "CA", "DE", "JP"];
const VESSEL_TYPES: Vessel["type"][] = ["Cargo", "Tanker", "Fishing", "Passenger", "Pilot", "Tug", "Naval"];

// Coordenadas aproximadas de la costa chilena para ubicar los buques
const COAST_POINTS = [
  { lat: -18.4783, lng: -70.3128, zone: "Arica" },
  { lat: -20.2133, lng: -70.1506, zone: "Iquique" },
  { lat: -23.6594, lng: -70.3978, zone: "Antofagasta" },
  { lat: -27.0667, lng: -70.8167, zone: "Caldera" },
  { lat: -29.9511, lng: -71.3436, zone: "Coquimbo" },
  { lat: -33.0458, lng: -71.6267, zone: "Valparaíso" },
  { lat: -33.5936, lng: -71.6106, zone: "San Antonio" },
  { lat: -36.7054, lng: -73.1167, zone: "Talcahuano" },
  { lat: -41.4706, lng: -72.9422, zone: "Puerto Montt" },
  { lat: -42.4667, lng: -73.7667, zone: "Chiloé" },
  { lat: -53.1633, lng: -70.9178, zone: "Punta Arenas" },
];

function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateVessels(count = 18): Vessel[] {
  const rng = seedRandom(42);
  const vessels: Vessel[] = [];
  for (let i = 0; i < count; i++) {
    const point = COAST_POINTS[Math.floor(rng() * COAST_POINTS.length)];
    const lat = point.lat + (rng() - 0.5) * 0.6;
    const lng = point.lng + (rng() - 0.5) * 0.4;
    const name = VESSEL_NAMES[i % VESSEL_NAMES.length];
    const type = VESSEL_TYPES[Math.floor(rng() * VESSEL_TYPES.length)];
    const sog = type === "Passenger" ? rng() * 18 + 8 : rng() * 14 + 4;
    const cog = Math.floor(rng() * 360);
    vessels.push({
      mmsi: `725${Math.floor(rng() * 900000 + 100000)}`,
      imo: `${9000000 + Math.floor(rng() * 999999)}`,
      name: type === "Naval" ? "Cabo Raso" : type === "Pilot" ? "Práctico 03" : type === "Tug" ? "Remolcador Bahía" : `${name}`,
      flag: FLAGS[Math.floor(rng() * FLAGS.length)],
      type,
      lat,
      lng,
      sogKn: Math.round(sog * 10) / 10,
      cogDeg: cog,
      draftM: Math.round((rng() * 12 + 4) * 10) / 10,
      lengthM: Math.floor(rng() * 200 + 30),
      destination: COAST_POINTS[Math.floor(rng() * COAST_POINTS.length)].zone,
      eta: `${Math.floor(rng() * 23)}:${Math.floor(rng() * 60).toString().padStart(2, "0")}h`,
      status: sog > 1 ? "Under way" : rng() > 0.5 ? "At anchor" : "Moored",
      zone: point.zone,
      lastPort: COAST_POINTS[Math.floor(rng() * COAST_POINTS.length)].zone,
      risk: rng() > 0.85 ? "high" : rng() > 0.6 ? "medium" : "low",
    });
  }
  return vessels;
}

export function moveVessel(v: Vessel): Vessel {
  const speedFactor = v.sogKn > 0 ? v.sogKn / 600 : 0;
  const rad = (v.cogDeg * Math.PI) / 180;
  const newLat = v.lat + Math.cos(rad) * speedFactor;
  const newLng = v.lng + Math.sin(rad) * speedFactor;
  // Si se acerca a los límites, invertir rumbo
  const newCog = (newLat < -56 || newLat > -17 || newLng < -75 || newLng > -69)
    ? (v.cogDeg + 180) % 360
    : v.cogDeg;
  return { ...v, lat: newLat, lng: newLng, cogDeg: newCog };
}

export const INITIAL_ALERTS: MaritimeAlert[] = [
  {
    id: "ALT-2026-0042",
    severity: "critical",
    source: "SERVIMET",
    title: "Alerta Roja — Viento Sur 38 nudos",
    description: "Viento sostenido sur de 38 nudos con ráfagas a 45 nudos. Mar de fondo 4.2 m. Se mantiene cierre temporal del puerto de Castro.",
    zone: "Chiloé — Castro",
    issuedAt: "2026-10-03T05:30:00-03:00",
    validUntil: "2026-10-03T18:00:00-03:00",
    acknowledged: true,
  },
  {
    id: "ALT-2026-0041",
    severity: "warning",
    source: "GOUMAR",
    title: "Restricción de calado — Puerto Montt",
    description: "Por condiciones de oleaje cruzado, restricción máxima de calado a 8.0 m para naves en operaciones de atraque.",
    zone: "Puerto Montt",
    issuedAt: "2026-10-03T04:15:00-03:00",
    validUntil: "2026-10-03T20:00:00-03:00",
    acknowledged: true,
  },
  {
    id: "ALT-2026-0040",
    severity: "warning",
    source: "SHOA",
    title: "Aviso a los Navegantes N° 42/26",
    description: "Boya de marca temporal desplazada en baliza San Antonio. Coordenadas actualizadas. Carta náutica vigente: SHOA 30000.",
    zone: "San Antonio",
    issuedAt: "2026-10-03T02:00:00-03:00",
    validUntil: "2026-10-10T23:59:00-03:00",
    acknowledged: false,
  },
  {
    id: "ALT-2026-0039",
    severity: "info",
    source: "AIS",
    title: "Tráfico denso — Zona Valparaíso",
    description: "Detección de 14 naves en zona de espera Valparaíso. Se recomienda coordinación con Prácticos para espaciamiento.",
    zone: "Valparaíso",
    issuedAt: "2026-10-03T06:45:00-03:00",
    validUntil: "2026-10-03T12:00:00-03:00",
    acknowledged: false,
  },
  {
    id: "ALT-2026-0038",
    severity: "critical",
    source: "AIS",
    title: "Intrusión en zona restringida",
    description: "Buque pesquero 'Don Matías' ingresó a zona de fondeo prohibido norte Talcahuano. Contacto VHF canal 16 solicitado.",
    zone: "Talcahuano",
    issuedAt: "2026-10-03T07:12:00-03:00",
    validUntil: "2026-10-03T09:00:00-03:00",
    acknowledged: false,
  },
];

export const INITIAL_AUDIT: AuditEntry[] = [
  {
    id: "AUD-00432",
    timestamp: "2026-10-03T07:42:18-03:00",
    actor: "Tello, R.",
    role: "Oficial VTS",
    action: "Emisión de zarpe",
    target: "M/V Pacific Star (IMO 9123456)",
    detail: "Zarpe aprobado desde Valparaíso hacia San Antonio con restricción de velocidad 12kn en zona TSS.",
    hash: "0000a7f3c2b1d4e8f5a9c0b3d2e1f4a8",
    prevHash: "0000b2e4f1a9c3d7e5b8a0f2c4d6e9a1",
    blockSeq: 432,
  },
  {
    id: "AUD-00431",
    timestamp: "2026-10-03T07:38:02-03:00",
    actor: "Sistema Automático",
    role: "SERVIMET Adapter",
    action: "Recepción de parte meteorológico",
    target: "Puerto Castro",
    detail: "Parte meteorológico N° 267 recibido: viento 38kn, mar 4.2m. Trigger automático de cierre.",
    hash: "0000b2e4f1a9c3d7e5b8a0f2c4d6e9a1",
    prevHash: "0000c5d6e9a1b3f2a7c8d0e4f5a9b2c1",
    blockSeq: 431,
  },
  {
    id: "AUD-00430",
    timestamp: "2026-10-03T07:31:44-03:00",
    actor: "Vargas, M.",
    role: "Capitán de Puerto — Puerto Montt",
    action: "Aplicación de restricción",
    target: "Zona de atraque Puerto Montt",
    detail: "Restricción de calado a 8.0 m emitida por Resolución EXENTA DGTM N° 1247/26.",
    hash: "0000c5d6e9a1b3f2a7c8d0e4f5a9b2c1",
    prevHash: "0000d8e9a2b1c4f3a6d5e7b0c9d2e1f4",
    blockSeq: 430,
  },
  {
    id: "AUD-00429",
    timestamp: "2026-10-03T07:15:30-03:00",
    actor: "Sistema Automático",
    role: "AIS Engine",
    action: "Detección de intrusión",
    target: "Don Matías (MMSI 725456789)",
    detail: "Intrusión detectada en zona de fondeo prohibido. Alerta ALT-2026-0038 generada.",
    hash: "0000d8e9a2b1c4f3a6d5e7b0c9d2e1f4",
    prevHash: "0000e1f4a5b2c8d6e9a3b4c5d6e7f8a9",
    blockSeq: 429,
  },
  {
    id: "AUD-00428",
    timestamp: "2026-10-03T07:02:11-03:00",
    actor: "Rojas, P.",
    role: "Práctico — Valparaíso",
    action: "Confirmación de maniobra",
    target: "M/V Nordic Breeze (IMO 9234567)",
    detail: "Maniobra de atraque confirmada en sitio 4 de ESPB. Tránsito asistido registrado.",
    hash: "0000e1f4a5b2c8d6e9a3b4c5d6e7f8a9",
    prevHash: "0000f5a9b3c2d1e7f4a6b8c0d2e4f6a8",
    blockSeq: 428,
  },
];

export const INITIAL_TRAMITES: Tramite[] = [
  { folio: "T-2026-04412", type: "Zarpe", applicant: "Compañía Marítima del Pacífico SpA", applicantRut: "76.123.456-7", vessel: "Pacific Star", status: "En Revisión", submittedAt: "2026-10-03T07:12:00-03:00", amount: 3, port: "Valparaíso", progress: 45 },
  { folio: "T-2026-04411", type: "Certificado", applicant: "Naviera Austral S.A.", applicantRut: "78.345.678-9", vessel: "Patagonia", status: "Aprobado", submittedAt: "2026-10-03T06:45:00-03:00", amount: 1.5, port: "Puerto Montt", progress: 100 },
  { folio: "T-2026-04410", type: "Permiso Especial", applicant: "Pesquera Antares Ltda.", applicantRut: "79.987.654-3", vessel: "Calypso II", status: "Pagado", submittedAt: "2026-10-03T05:30:00-03:00", amount: 8.2, port: "Iquique", progress: 85 },
  { folio: "T-2026-04409", type: "Zarpe", applicant: "Sudamericana de Transportes", applicantRut: "77.234.567-8", vessel: "Magallanes Express", status: "Ingresado", submittedAt: "2026-10-03T04:15:00-03:00", amount: 3, port: "San Antonio", progress: 15 },
  { folio: "T-2026-04408", type: "Renovación", applicant: "Marítima del Norte", applicantRut: "76.876.543-2", vessel: "San José", status: "Rechazado", submittedAt: "2026-10-02T22:00:00-03:00", amount: 2.1, port: "Antofagasta", progress: 0 },
  { folio: "T-2026-04407", type: "Inscripción", applicant: "Sociedad Ballenera Edén", applicantRut: "78.111.222-3", vessel: "Cabo de Hornos", status: "Aprobado", submittedAt: "2026-10-02T19:45:00-03:00", amount: 12.5, port: "Punta Arenas", progress: 100 },
  { folio: "T-2026-04406", type: "Certificado", applicant: "Transpacific Chile", applicantRut: "77.555.666-7", vessel: "Beagle", status: "Borrador", submittedAt: "2026-10-02T17:20:00-03:00", amount: 1.5, port: "Valparaíso", progress: 5 },
];

export const NORMATIVA: NormaItem[] = [
  {
    id: "N-001",
    tipo: "Decreto Supremo",
    numero: "DS (M) N° 1/1941",
    materia: "Reglamento General de Jurisdiccición Marítima",
    fecha: "1941-07-04",
    vigente: true,
    resumen: "Marco normativo fundacional de la Autoridad Marítima. Define jurisdicción, facultades, sanciones y procedimientos aplicables al territorio marítimo nacional.",
  },
  {
    id: "N-002",
    tipo: "Ley",
    numero: "Ley N° 21.719",
    materia: "Protección de Datos Personales",
    fecha: "2024-12-13",
    vigente: true,
    resumen: "Establece el régimen de protección de datos personales en Chile. Aplicable a toda información de tripulantes, patrones y armadores procesada por sistemas marítimos.",
  },
  {
    id: "N-003",
    tipo: "Convenio Internacional",
    numero: "IALA V-103",
    materia: "Estándares para Centros VTS",
    fecha: "2017-06-01",
    vigente: true,
    resumen: "Recomendación de la International Association of Marine Aids to Navigation and Lighthouse Authorities para el diseño, operación y certificación de servicios de tráfico marítimo (VTS).",
  },
  {
    id: "N-004",
    tipo: "Resolución EXENTA",
    numero: "Res. EXENTA DGTM N° 1247/26",
    materia: "Restricción de calado Puerto Montt",
    fecha: "2026-10-02",
    vigente: true,
    resumen: "Establece restricción temporal de calado máximo a 8.0 m en zona de atraque de Puerto Montt por condiciones de oleaje cruzado.",
  },
  {
    id: "N-005",
    tipo: "Convenio Internacional",
    numero: "SOLAS 1974 (Cap. V)",
    materia: "Seguridad de la Vida Humana en el Mar",
    fecha: "1974-11-01",
    vigente: true,
    resumen: "Convenio internacional ratificado por Chile. Capítulo V regula seguridad de la navegación, incluyendo servicios VTS, equipos AIS y comunicaciones.",
  },
  {
    id: "N-006",
    tipo: "Convenio Internacional",
    numero: "MARPOL Anexos I-VI",
    materia: "Prevención de Contaminación Marítima",
    fecha: "1973-02-17",
    vigente: true,
    resumen: "Convenio internacional para prevenir la contaminación por buques. Aplicable a residuos oleosos, sustancias líquidas, basuras y emisiones atmosféricas.",
  },
  {
    id: "N-007",
    tipo: "Ley",
    numero: "Ley N° 20.285",
    materia: "Acceso a la Información Pública",
    fecha: "2008-08-20",
    vigente: true,
    resumen: "Ley de Transparencia. Aplicable a la difusión pública de resoluciones, partes meteorológicos y datos operativos de la Autoridad Marítima.",
  },
  {
    id: "N-008",
    tipo: "Ley",
    numero: "Ley N° 19.799",
    materia: "Documentos Electrónicos y Firma Electrónica",
    fecha: "2002-04-12",
    vigente: true,
    resumen: "Da validez legal a documentos electrónicos y firmas digitales. Habilita la emisión de certificados y resoluciones firmadas electrónicamente.",
  },
];

export const KPI_STATS = {
  vesselsTracked: 18,
  portsMonitored: 12,
  activeAlerts: 5,
  tramitesToday: 47,
  auditBlocksToday: 327,
  responseTimeMs: 142,
  dataIntegrity: 100,
  systemUptime: 99.97,
};

export const USER_ROLES = [
  { id: "operador", label: "Operador VTS", initials: "OP", color: "accent" },
  { id: "capitan", label: "Capitán de Puerto", initials: "CP", color: "primary" },
  { id: "fiscalizador", label: "Fiscalizador", initials: "FS", color: "secondary" },
  { id: "ciudadano", label: "Usuario Marítimo", initials: "UM", color: "muted" },
];

export const NAV_SECTIONS = [
  { id: "panel", label: "Panel General", short: "Panel", icon: "gauge" },
  { id: "operacion", label: "Operación VTS", short: "Operación", icon: "radar" },
  { id: "bitacora", label: "Bitácora Auditante", short: "Bitácora", icon: "shield" },
  { id: "tramites", label: "Trámites y Logística", short: "Trámites", icon: "file-text" },
  { id: "normativa", label: "Normativa Marítima", short: "Normativa", icon: "book" },
  { id: "datos", label: "Datos y Estadísticas", short: "Datos", icon: "bar-chart" },
];

// Función para generar hash simulado (formato blockchain privado)
export function generateHash(prevHash: string, payload: string): string {
  // Hash simulado de 32 bytes — formato hexadecimal
  const seed = (prevHash + payload).split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 0xffffffff, 1);
  let h = seed.toString(16).padStart(8, "0");
  while (h.length < 32) {
    h += ((parseInt(h.slice(-8), 16) * 1103515245 + 12345) % 0xffffffff).toString(16).padStart(8, "0");
  }
  return "0000" + h.slice(4, 32);
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function fmtDateTime(iso: string): string {
  return `${fmtDate(iso)} ${fmtTime(iso)}`;
}
