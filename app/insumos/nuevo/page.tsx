"use client"
import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { InsumoForm } from "@/components/insumo-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NuevoInsumoPage() {
  return (
    <ClientProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/insumos" className="text-[#C9A227] hover:text-[#a88820]">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#EAEAEA]">Nuevo Insumo</h1>
            <p className="text-[#C9A227] mt-1">Agregar un nuevo insumo al inventario</p>
          </div>
        </div>

        <InsumoForm />
      </div>
    </ClientProtectedLayout>
  )
}
