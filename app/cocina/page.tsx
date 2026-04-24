"use client"

import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { CocinaTable } from "@/components/cocina-table"


export default function CocinaPage() {
  return (
    <ClientProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#EAEAEA]">
            Cocina - Gestión de Pedidos
          </h1>
        </div>
        
        <CocinaTable />
      </div>
    </ClientProtectedLayout>
  )
}