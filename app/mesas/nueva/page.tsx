"use client"

import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { MesaForm } from "@/components/mesa-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NuevaMesaPage() {
  return (
    <ClientProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/mesas" className="text-[#C9A227] hover:text-[#a88820]">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#EAEAEA]">Nueva Mesa</h1>
            <p className="text-[#C9A227] mt-1">Crear una nueva mesa en el restaurante</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <MesaForm />
        </div>
      </div>
    </ClientProtectedLayout>
  )
}
