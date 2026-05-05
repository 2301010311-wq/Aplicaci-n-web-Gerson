// EJEMPLO: app/api/auth/login/route.ts - Versión mejorada con validaciones
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, createToken, setSession } from "@/lib/auth"
import { loginSchema, validateSchema } from "@/lib/validations/auth"
import { simpleRateLimit } from "@/lib/rate-limit"
import logger from "@/lib/logger"

export async function POST(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown'

  // 1️⃣ RATE LIMITING - Prevenir ataques de fuerza bruta
  if (!simpleRateLimit.check(`login:${clientIP}`, 5, 60000)) { // 5 intentos por minuto
    logger.warn({
      event: 'rate_limit_exceeded',
      ip: clientIP,
      endpoint: 'login'
    }, 'Rate limit exceeded for login attempts')

    return NextResponse.json(
      { error: "Demasiados intentos. Intente nuevamente en unos minutos." },
      { status: 429 }
    )
  }

  try {
    // 2️⃣ VALIDACIÓN DE INPUTS con Zod
    const body = await request.json()
    const validation = validateSchema(loginSchema, body)

    if (!validation.success) {
      logger.warn({
        event: 'login_validation_failed',
        ip: clientIP,
        errors: validation.errors
      }, 'Login validation failed')

      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // 3️⃣ BUSCAR USUARIO (timing-safe)
    const usuario = await prisma.usuarios.findUnique({
      where: { correo_user: email },
    })

    // 4️⃣ VERIFICAR CONTRASEÑA (timing-safe con bcrypt)
    let isValid = false
    if (usuario) {
      isValid = await verifyPassword(password, usuario.contrasena)
    }

    // 5️⃣ LOGGING DE SEGURIDAD
    if (!usuario || !isValid) {
      logger.warn({
        event: 'login_failed',
        ip: clientIP,
        email: email,
        userExists: !!usuario,
        reason: !usuario ? 'user_not_found' : 'invalid_password'
      }, 'Login attempt failed')

      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      )
    }

    // 6️⃣ CREAR SESIÓN SEGURA
    const token = await createToken({
      id: usuario.id_user.toString(),
      nombre: `${usuario.nombre_user} ${usuario.apellido_user}`,
      email: usuario.correo_user || '',
      rol: usuario.rol,
    })

    await setSession(token)

    // 7️⃣ LOG DE ÉXITO
    logger.info({
      event: 'login_success',
      userId: usuario.id_user,
      ip: clientIP,
      rol: usuario.rol
    }, `Usuario ${usuario.nombre_user} inició sesión exitosamente`)

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
    // 8️⃣ LOG DE ERROR (sin exponer detalles sensibles)
    logger.error({
      event: 'login_error',
      ip: clientIP,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'Unexpected error during login')

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}