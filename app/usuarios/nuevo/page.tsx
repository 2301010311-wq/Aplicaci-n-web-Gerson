"use client"
import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { UsuarioForm } from "@/components/usuario-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NuevoUsuarioPage() {
  return (
    <ClientProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/usuarios" className="text-[#C9A227] hover:text-[#a88820]">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#EAEAEA]">Nuevo Usuario</h1>
            <p className="text-[#C9A227] mt-1">Agregar un nuevo empleado al sistema</p>
          </div>
        </div>

        <UsuarioForm />
      </div>
    </ClientProtectedLayout>
  )
}
