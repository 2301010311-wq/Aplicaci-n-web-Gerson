import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AlertProvider } from "@/contexts/alert-context"
import { AlertsContainer } from "@/components/alerts-container"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Pollería Gerson - Sistema de Gestión",
  description: "Sistema completo de gestión para restaurante",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <AlertProvider>
          {children}
          <AlertsContainer />
        </AlertProvider>
      </body>
    </html>
  )
}
