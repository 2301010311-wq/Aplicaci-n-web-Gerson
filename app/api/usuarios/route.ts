import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { requireAuth } from "@/lib/middleware-auth"

export async function GET() {
  const auth = await requireAuth(["Admin"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const usuariosRaw = await prisma.usuarios.findMany({
      select: {
        id_user: true,
        nombre_user: true,
        apellido_user: true,
        correo_user: true,
        rol: true,
      },
      orderBy: { id_user: "desc" },
    })

    // Mapear a la estructura esperada por el frontend
    const usuarios = usuariosRaw.map((user: any) => ({
      id: user.id_user.toString(),
      nombre: `${user.nombre_user} ${user.apellido_user}`,
      email: user.correo_user,
      rol: user.rol,
      activo: true, // Por defecto true, después podemos agregar este campo a la DB
      createdAt: new Date().toISOString(), // Fecha actual por defecto
    }))

    return NextResponse.json(usuarios)
  } catch (error) {
    console.error("Error obteniendo usuarios:", error)
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(["Admin"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { nombre, apellido, email, password, rol } = await request.json()

    if (!nombre || !email || !password || !rol) {
      return NextResponse.json({ error: "Campos requeridos: nombre, email, password, rol" }, { status: 400 })
    }

    const existingUser = await prisma.usuarios.findUnique({
      where: { correo_user: email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const usuario = await prisma.usuarios.create({
      data: {
        nombre_user: nombre,
        apellido_user: apellido || nombre,
        correo_user: email,
        contrasena: hashedPassword,
        rol: rol,
      },
    })

    return NextResponse.json({
      id: usuario.id_user.toString(),
      nombre: `${usuario.nombre_user} ${usuario.apellido_user}`,
      email: usuario.correo_user,
      rol: usuario.rol,
      activo: true,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error creando usuario:", error)
    return NextResponse.json({ 
      error: "Error al crear usuario",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}


