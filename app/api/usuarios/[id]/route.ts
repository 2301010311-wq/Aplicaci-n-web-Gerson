import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { requireAuth } from "@/lib/middleware-auth"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["Admin"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const { nombre, email, password, rol } = await request.json()

    console.log("PUT /api/usuarios/[id] - Datos recibidos:", { id, nombre, email, rol })

    if (!nombre || !email || !rol) {
      return NextResponse.json({ error: "Campos requeridos: nombre, email, rol" }, { status: 400 })
    }

    // Verificar si el email ya existe en otro usuario
    const existingUser = await prisma.usuarios.findUnique({
      where: { correo_user: email },
    })

    if (existingUser && existingUser.id_user !== parseInt(id)) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    const updateData: any = {
      correo_user: email,
      rol: rol,
    }

    // Separar nombre completo en nombre y apellido
    const nameParts = nombre.trim().split(' ')
    if (nameParts.length >= 2) {
      updateData.nombre_user = nameParts[0]
      updateData.apellido_user = nameParts.slice(1).join(' ')
    } else {
      updateData.nombre_user = nombre.trim()
      updateData.apellido_user = nombre.trim()
    }

    if (password && password.trim()) {
      updateData.contrasena = await hashPassword(password)
    }

    console.log("PUT /api/usuarios/[id] - Datos a actualizar:", updateData)

    const usuario = await prisma.usuarios.update({
      where: { id_user: parseInt(id) },
      data: updateData,
    })

    console.log("PUT /api/usuarios/[id] - Usuario actualizado exitosamente")

    return NextResponse.json({
      id: usuario.id_user.toString(),
      nombre: `${usuario.nombre_user} ${usuario.apellido_user}`,
      email: usuario.correo_user,
      rol: usuario.rol,
      activo: true,
    })
  } catch (error) {
    console.error("Error actualizando usuario:", error)
    return NextResponse.json({ 
      error: "Error al actualizar usuario",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["Admin"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params

    await prisma.usuarios.delete({
      where: { id_user: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando usuario:", error)
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
  }
}
