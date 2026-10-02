import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DIRECTEMAR · Plataforma Marítima Nacional",
  description:
    "Plataforma operativa y logística de la Autoridad Marítima de Chile — Control VTS, fiscalización, trámites en línea y normativa marítima consolidada bajo Decreto Supremo (M) N° 1/1941, estándares IALA V-103 y Ley N° 21.719.",
  keywords: [
    "DIRECTEMAR",
    "Autoridad Marítima Chile",
    "VTS",
    "IALA V-103",
    "SHOA",
    "SERVIMET",
    "Capitanía de Puerto",
    "Zarpe",
    "Ley 21.719",
  ],
  authors: [{ name: "DIRECTEMAR" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
