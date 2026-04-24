"use client"
import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { RegistrosTable } from "@/components/registros-table"
import { BarChart3 } from "lucide-react"

export default function RegistrosPage() {
  return (
    <ClientProtectedLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 md:gap-3">
              <BarChart3 className="w-6 md:w-8 h-6 md:h-8 text-[#C9A227] flex-shrink-0" />
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-[#EAEAEA]">Registros</h1>
                <p className="text-[#C9A227] mt-1 text-xs md:text-sm">Historial de pedidos completados y pagados</p>
              </div>
            </div>
          </div>
        </div>

        <RegistrosTable />
      </div>
    </ClientProtectedLayout>
  )
}
