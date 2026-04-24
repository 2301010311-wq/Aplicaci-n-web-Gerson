import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { NuevoPedidoForm } from "@/components/nuevo-pedido-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NuevoPedidoPage() {
  return (
    <ClientProtectedLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/pedidos" className="text-[#C9A227] hover:text-[#a88820] flex-shrink-0">
            <ArrowLeft className="w-5 md:w-6 h-5 md:h-6" />
          </Link>
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-[#EAEAEA]">Nuevo Pedido</h1>
            <p className="text-[#C9A227] mt-1 text-xs md:text-sm">Crear un nuevo pedido</p>
          </div>
        </div>

        <NuevoPedidoForm />
      </div>
    </ClientProtectedLayout>
  )
}
