import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, createToken, setSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const normalizedEmail = String(email || "").trim().toLowerCase()
    const normalizedPassword = String(password || "")

    if (!normalizedEmail || !normalizedPassword) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { correo_user: normalizedEmail },
    })

    if (!usuario) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const isValid = await verifyPassword(normalizedPassword, usuario.contrasena)

    if (!isValid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const token = await createToken({
      id: usuario.id_user.toString(),
      nombre: `${usuario.nombre_user} ${usuario.apellido_user}`,
      email: usuario.correo_user || '',
      rol: usuario.rol,
    })

    await setSession(token)

    return NextResponse.json({
      success: true,
      usuario: {
        id: usuario.id_user,
        nombre: `${usuario.nombre_user} ${usuario.apellido_user}`,
        email: usuario.correo_user,
        rol: usuario.rol,
      },
    })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}


