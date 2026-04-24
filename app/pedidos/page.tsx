"use client"
import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { PedidosTable } from "@/components/pedidos-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function PedidosPage() {
  return (
    <ClientProtectedLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-[#EAEAEA]">Pedidos</h1>
            <p className="text-[#C9A227] mt-1 text-xs md:text-sm">Gestión de pedidos</p>
          </div>
          <Link href="/pedidos/nuevo">
            <Button className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] font-semibold text-xs md:text-sm px-3 md:px-4 py-2">
              <Plus className="w-3 md:w-4 h-3 md:h-4 mr-1" />
              Nuevo
            </Button>
          </Link>
        </div>

        <PedidosTable />
      </div>
    </ClientProtectedLayout>
  )
}
