import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { ProductoForm } from "@/components/producto-form"
import { prisma } from "@/lib/prisma"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const productoRaw = await prisma.productos.findUnique({
    where: { id_produc: parseInt(id) },
  })

  if (!productoRaw) {
    notFound()
  }

  // Mapear a la estructura esperada por el frontend
  const producto = {
    id: productoRaw.id_produc.toString(),
    nombre: productoRaw.nombre_produc,
    descripcion: productoRaw.descripcion_produc,
    precio: parseFloat(productoRaw.precio_produc.toString()),
    categoria: productoRaw.categoria_produc,
    estado: productoRaw.estado_produc === "Activo",
    fechaVencimiento: productoRaw.vencimiento_produc,
    stock: productoRaw.stock_produc || 0,
    controlarStock: productoRaw.controlar_stock,
  }

  return (
    <ClientProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/productos" className="text-[#C9A227] hover:text-[#a88820]">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#EAEAEA]">Editar Producto</h1>
            <p className="text-[#C9A227] mt-1">{producto.nombre}</p>
          </div>
        </div>

        <ProductoForm producto={producto} />
      </div>
    </ClientProtectedLayout>
  )
}
