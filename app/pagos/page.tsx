"use client"
import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { PagosTable } from "@/components/pagos-table"

export default function PagosPage() {
  return (
    <ClientProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#EAEAEA]">Pagos</h1>
            <p className="text-[#C9A227] mt-1">Procesamiento de pagos de pedidos servidos</p>
          </div>
        </div>

        <PagosTable />
      </div>
    </ClientProtectedLayout>
  )
}