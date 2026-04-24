import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { InsumoForm } from "@/components/insumo-form"
import { prisma } from "@/lib/prisma"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function EditarInsumoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const insumoRaw = await prisma.insumos.findUnique({
    where: { id_insumo: parseInt(id) },
  })

  if (!insumoRaw) {
    notFound()
  }

  // Mapear a la estructura esperada por el frontend
  const insumo = {
    id: insumoRaw.id_insumo.toString(),
    nombre: insumoRaw.nombre_insu,
    unidadMedida: insumoRaw.unidadmedida_insu,
    stockActual: parseFloat(insumoRaw.stock_act_insu?.toString() || "0"),
    stockMinimo: parseFloat(insumoRaw.stock_min_insu?.toString() || "0"),
    fechaVencimiento: insumoRaw.vencimiento_insu,
  }

  return (
    <ClientProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/insumos" className="text-[#C9A227] hover:text-[#a88820]">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#EAEAEA]">Editar Insumo</h1>
            <p className="text-[#C9A227] mt-1">{insumo.nombre}</p>
          </div>
        </div>

        <InsumoForm insumo={insumo} />
      </div>
    </ClientProtectedLayout>
  )
}
