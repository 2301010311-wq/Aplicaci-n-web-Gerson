import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { AlertProvider } from "@/contexts/alert-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pollería Gerson",
  description: "Aplicación de gestión para la Pollería Gerson",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AlertProvider>
          {children}
          <SpeedInsights />
          <Analytics />
        </AlertProvider>
      </body>
    </html>
  );
}