"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { useState } from "react"

export function CuentasPorCobrar() {
  const [cuentas] = useState([])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#2F2F2F] border-[#C9A227] border-opacity-20 p-6">
          <p className="text-[#C9A227] text-sm">Total por Cobrar</p>
          <p className="text-[#EAEAEA] text-3xl font-bold mt-2">S/ 0.00</p>
        </Card>
        <Card className="bg-[#2F2F2F] border-[#C9A227] border-opacity-20 p-6">
          <p className="text-[#C9A227] text-sm">Vencidas</p>
          <p className="text-red-400 text-3xl font-bold mt-2">S/ 0.00</p>
        </Card>
        <Card className="bg-[#2F2F2F] border-[#C9A227] border-opacity-20 p-6">
          <p className="text-[#C9A227] text-sm">Clientes</p>
          <p className="text-[#EAEAEA] text-3xl font-bold mt-2">0</p>
        </Card>
      </div>

      <Card className="bg-[#2F2F2F] border-[#C9A227] border-opacity-20 p-8">
        <div className="flex flex-col items-center justify-center text-center gap-4">
          <Users className="w-12 h-12 text-[#C9A227]" />
          <div>
            <h3 className="text-[#EAEAEA] text-lg font-semibold">Cuentas por Cobrar</h3>
            <p className="text-[#C9A227] text-sm mt-1">
              Gestiona los pagos pendientes de tus clientes
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
