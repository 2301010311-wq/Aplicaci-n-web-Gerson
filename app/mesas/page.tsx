"use client"
import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { MesasGrid } from "@/components/mesas-grid"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Session {
  id: string
  nombre: string
  email: string
  rol: string
}

export default function MesasPage() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        if (data.session) {
          setSession(data.session)
        }
      })
  }, [])

  return (
    <ClientProtectedLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-[#EAEAEA]">Mesas</h1>
            <p className="text-[#C9A227] mt-1 text-xs md:text-sm">Gestión de mesas</p>
          </div>
          <Link href="/mesas/nueva">
            <Button className="bg-[#C9A227] hover:bg-[#d9af25] text-[#1C1C1C] font-semibold text-xs md:text-sm px-3 md:px-4 py-2">
              <Plus className="w-3 md:w-4 h-3 md:h-4 mr-1" />
              Nueva
            </Button>
          </Link>
        </div>

        <MesasGrid userRole={session?.rol} />
      </div>
    </ClientProtectedLayout>
  )
}
