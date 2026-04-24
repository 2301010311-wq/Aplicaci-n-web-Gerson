"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Download } from "lucide-react"
import { useState } from "react"

export function GestionFacturas() {
  const [facturas] = useState([])

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Factura
        </Button>
        <Button variant="outline" className="border-[#C9A227] text-[#C9A227]">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      <Card className="bg-[#2F2F2F] border-[#C9A227] border-opacity-20 p-8">
        <div className="flex flex-col items-center justify-center text-center gap-4">
          <FileText className="w-12 h-12 text-[#C9A227]" />
          <div>
            <h3 className="text-[#EAEAEA] text-lg font-semibold">Gestión de Facturas</h3>
            <p className="text-[#C9A227] text-sm mt-1">
              Registra y gestiona todas tus facturas de venta
            </p>
          </div>
          <Button className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Primera Factura
          </Button>
        </div>
      </Card>
    </div>
  )
}
