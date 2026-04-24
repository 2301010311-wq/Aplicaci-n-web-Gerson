"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { Sidebar } from "./sidebar"

interface Session {
  id: string
  nombre: string
  email: string
  rol: string
}

export function ClientProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sesión usando la API
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        if (data.session) {
          setSession(data.session)
        } else {
          window.location.href = "/login"
        }
      })
      .catch(() => {
        window.location.href = "/login"
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1C1C1C]">
        <div className="text-[#EAEAEA]">Cargando...</div>
      </div>
    )
  }

  if (!session) {
    return null // Se redirigirá en el useEffect
  }

  return (
    <div className="flex min-h-screen bg-[#1C1C1C] overflow-hidden">
      <Sidebar session={session} />
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden pb-20 md:pb-0">{children}</main>
    </div>
  )
}