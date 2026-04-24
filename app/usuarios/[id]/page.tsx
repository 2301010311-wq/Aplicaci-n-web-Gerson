import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { UsuarioForm } from "@/components/usuario-form"
import { prisma } from "@/lib/prisma"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const usuarioRaw = await prisma.usuarios.findUnique({
    where: { id_user: parseInt(id) },
  })

  if (!usuarioRaw) {
    notFound()
  }

  // Mapear a la estructura esperada por el frontend
  const usuario = {
    id: usuarioRaw.id_user.toString(),
    nombre: `${usuarioRaw.nombre_user} ${usuarioRaw.apellido_user}`,
    email: usuarioRaw.correo_user || "",
    rol: usuarioRaw.rol,
    activo: true,
  }

  return (
    <ClientProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/usuarios" className="text-[#C9A227] hover:text-[#a88820]">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#EAEAEA]">Editar Usuario</h1>
            <p className="text-[#C9A227] mt-1">{usuario.nombre}</p>
          </div>
        </div>

        <UsuarioForm usuario={usuario} />
      </div>
    </ClientProtectedLayout>
  )
}
