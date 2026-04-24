"use client"
import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { ProductosTable } from "@/components/productos-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ProductosPage() {
  return (
    <ClientProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#EAEAEA]">Productos</h1>
            <p className="text-[#C9A227] mt-1">Gestión del menú y productos</p>
          </div>
          <Link href="/productos/nuevo">
            <Button className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </Link>
        </div>

        <ProductosTable />
      </div>
    </ClientProtectedLayout>
  )
}
