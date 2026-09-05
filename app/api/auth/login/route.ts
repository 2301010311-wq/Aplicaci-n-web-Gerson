import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, createToken } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { loginSchema, validateSchema } from "@/lib/validations/auth"

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0].trim()
  return request.headers.get("x-real-ip") || "unknown"
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const allowed = await checkRateLimit(`login:${ip}`)
    if (!allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos. Intenta nuevamente en un minuto." },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => null)
    const validation = validateSchema(loginSchema, body)

    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", errors: validation.errors }, { status: 400 })
    }

    const { email: normalizedEmail, password: normalizedPassword } = validation.data

    const usuario = await prisma.usuarios.findUnique({
      where: { correo_user: normalizedEmail },
    })

    if (!usuario) {
      // Mismo mensaje/tiempo de respuesta que un password incorrecto:
      // evita que un atacante pueda enumerar qué emails existen.
      await verifyPassword(normalizedPassword, "$2a$10$invalidsaltinvalidsaltinvalidsaltuXG")
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

    const response = NextResponse.json({
      success: true,
      usuario: {
        id: usuario.id_user,
        nombre: `${usuario.nombre_user} ${usuario.apellido_user}`,
        email: usuario.correo_user,
        rol: usuario.rol,
      },
    })

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
