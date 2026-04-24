"use client"
import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { UsuariosTable } from "@/components/usuarios-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function UsuariosPage() {
  return (
    <ClientProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#EAEAEA]">Usuarios</h1>
            <p className="text-[#C9A227] mt-1">Gestión de empleados del sistema</p>
          </div>
          <Link href="/usuarios/nuevo">
            <Button className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </Link>
        </div>

        <UsuariosTable />
      </div>
    </ClientProtectedLayout>
  )
}
