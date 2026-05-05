/**
 * EJEMPLO DE REFACTORIZACIÓN CON LOGGING ESTRUCTURADO
 * 
 * Este archivo muestra cómo convertir el endpoint actual de usuarios
 * de logging tradicional (console.log) a logging estructurado (Pino)
 * 
 * Ubicación real: app/api/usuarios/[id]/route.ts
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"
import logger from "@/lib/logger"
import { withApiLogging, getRequestId, getUserId } from "@/lib/logging-middleware"

// ============================================
// ANTES (❌ Estado Actual)
// ============================================
/*
export async function PUT(request: NextRequest) {
  const { id, nombre, email, rol } = await request.json()
  
  // Logs desordenados
  console.log("PUT /api/usuarios/[id] - Datos recibidos:", { id, nombre, email, rol })
  
  try {
    const updateData: any = {
      correo_user: email,
      rol: rol?.toUpperCase(),
    }
    
    if (nombre) {
      const [first, ...rest] = nombre.trim().split(" ")
      updateData.nombre_user = first
      updateData.apellido_user = rest.join(" ")
    }
    
    console.log("PUT /api/usuarios/[id] - Datos a actualizar:", updateData)
    
    const usuario = await prisma.usuarios.update({
      where: { id_user: Number(id) },
      data: updateData,
    })
    
    console.log("PUT /api/usuarios/[id] - Usuario actualizado exitosamente")
    
    return NextResponse.json(usuario)
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  }
}
*/

// ============================================
// DESPUÉS (✅ Con Logging Estructurado)
// ============================================

export const PUT = withApiLogging(async (request: NextRequest) => {
  const requestId = getRequestId(request)
  const auth = await requireAuth(["Admin"])
  
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  
  try {
    // 1️⃣ VALIDACIÓN Y PARSEO
    const body = await request.json()
    const { id, nombre, email, rol } = body
    
    // Log: datos recibidos
    logger.debug({
      requestId,
      userId: auth.userId,
      usuarioId: id,
      email,
      rol,
      action: 'usuario_update_received'
    }, "Solicitud de actualización de usuario recibida")
    
    // 2️⃣ VALIDACIONES
    if (!id) {
      logger.warn({
        requestId,
        userId: auth.userId,
        action: 'usuario_update_validation_failed',
        reason: 'missing_id'
      }, "Validación fallida: ID de usuario faltante")
      
      return NextResponse.json(
        { error: "ID de usuario es requerido" },
        { status: 400 }
      )
    }
    
    if (!email || !rol) {
      logger.warn({
        requestId,
        userId: auth.userId,
        usuarioId: id,
        missingFields: {
          email: !email,
          rol: !rol
        },
        action: 'usuario_update_validation_failed',
        reason: 'missing_required_fields'
      }, "Validación fallida: Campos requeridos faltantes")
      
      return NextResponse.json(
        { error: "Email y Rol son requeridos" },
        { status: 400 }
      )
    }
    
    // 3️⃣ TRANSFORMAR DATOS
    const updateData: any = {
      correo_user: email,
      rol: rol.toUpperCase(),
    }
    
    if (nombre) {
      const [first, ...rest] = nombre.trim().split(" ")
      updateData.nombre_user = first
      updateData.apellido_user = rest.join(" ")
    }
    
    logger.debug({
      requestId,
      userId: auth.userId,
      usuarioId: id,
      updateData,
      action: 'usuario_update_data_prepared'
    }, "Datos preparados para actualización")
    
    // 4️⃣ EJECUTAR ACTUALIZACIÓN
    const startDbTime = performance.now()
    const usuario = await prisma.usuarios.update({
      where: { id_user: Number(id) },
      data: updateData,
    })
    const dbDuration = performance.now() - startDbTime
    
    // 5️⃣ LOG DE ÉXITO
    logger.info({
      requestId,
      userId: auth.userId,
      usuarioId: id,
      updatedFields: Object.keys(updateData),
      dbDuration_ms: Math.round(dbDuration),
      action: 'usuario_update_success'
    }, "Usuario actualizado exitosamente")
    
    return NextResponse.json(usuario)
    
  } catch (error) {
    // 6️⃣ LOG DE ERROR
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // Diferenciar tipos de error
    let errorType = 'unknown_error'
    if (errorMessage.includes('not found')) {
      errorType = 'user_not_found'
    } else if (errorMessage.includes('unique')) {
      errorType = 'unique_constraint_violation'
    } else if (errorMessage.includes('Unauthorized')) {
      errorType = 'unauthorized'
    }
    
    logger.error({
      requestId,
      userId: auth.userId,
      error: errorMessage,
      errorType,
      stack: errorStack,
      action: 'usuario_update_error'
    }, "Error al actualizar usuario")
    
    // Retornar respuesta apropiada
    const statusCode = errorType === 'user_not_found' ? 404 : 500
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: statusCode }
    )
  }
})

// ============================================
// COMPARATIVA DE SALIDA
// ============================================

/**
 * CONSOLA.LOG (❌ Actual)
 * ========================
 * PUT /api/usuarios/[id] - Datos recibidos: { id: 123, nombre: 'Juan Pérez', email: 'juan@example.com', rol: 'admin' }
 * PUT /api/usuarios/[id] - Datos a actualizar: { correo_user: 'juan@example.com', rol: 'ADMIN', nombre_user: 'Juan', apellido_user: 'Pérez' }
 * PUT /api/usuarios/[id] - Usuario actualizado exitosamente
 * 
 * Problemas:
 * - Sin timestamp
 * - Sin nivel de severidad
 * - Sin requestId para rastrear
 * - Difícil de filtrar o buscar
 * - Imposible de parsearprogramáticamente
 * 
 * 
 * PINO LOGGER (✅ Nuevo)
 * ========================
 * En desarrollo (pretty):
 * 
 * [14:23:45.123] DEBUG: Solicitud de actualización de usuario recibida
 *     requestId: a1b2c3d4-e5f6
 *     userId: user-789
 *     usuarioId: 123
 *     email: juan@example.com
 *     rol: admin
 *     action: usuario_update_received
 *
 * [14:23:45.145] DEBUG: Datos preparados para actualización
 *     requestId: a1b2c3d4-e5f6
 *     userId: user-789
 *     usuarioId: 123
 *     updateData: { correo_user: 'juan@example.com', rol: 'ADMIN', ... }
 *     action: usuario_update_data_prepared
 *
 * [14:23:45.234] INFO: Usuario actualizado exitosamente
 *     requestId: a1b2c3d4-e5f6
 *     userId: user-789
 *     usuarioId: 123
 *     updatedFields: [ 'correo_user', 'rol', 'nombre_user', 'apellido_user' ]
 *     dbDuration_ms: 89
 *     action: usuario_update_success
 *
 * En producción (JSON):
 * 
 * {"level":20,"time":"2026-04-29T14:23:45.123Z","requestId":"a1b2c3d4-e5f6","userId":"user-789","usuarioId":123,"email":"juan@example.com","rol":"admin","action":"usuario_update_received","msg":"Solicitud de actualización de usuario recibida"}
 * {"level":20,"time":"2026-04-29T14:23:45.145Z","requestId":"a1b2c3d4-e5f6","userId":"user-789","usuarioId":123,"updateData":{...},"action":"usuario_update_data_prepared","msg":"Datos preparados para actualización"}
 * {"level":30,"time":"2026-04-29T14:23:45.234Z","requestId":"a1b2c3d4-e5f6","userId":"user-789","usuarioId":123,"updatedFields":[...],"dbDuration_ms":89,"action":"usuario_update_success","msg":"Usuario actualizado exitosamente"}
 * 
 * Beneficios:
 * ✅ Timestamps precisos
 * ✅ Nivel de severidad
 * ✅ RequestId para rastrear
 * ✅ Estructura JSON queryable
 * ✅ Fácil integración con observabilidad
 */
