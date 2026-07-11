// lib/validations/auth.ts - Esquemas de validación con Zod
import { z } from 'zod'

// Schema para login
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email es requerido' })
    .min(1, 'Email es requerido')
    .email('Formato de email inválido')
    .transform(email => email.toLowerCase().trim()),

  password: z
    .string({ required_error: 'Contraseña es requerida' })
    .min(1, 'Contraseña es requerida')
})

// Schema para crear usuario
export const createUserSchema = z.object({
  nombre: z
    .string({ required_error: 'Nombre es requerido' })
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50, 'Nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nombre solo puede contener letras y espacios'),

  apellido: z
    .string({ required_error: 'Apellido es requerido' })
    .min(2, 'Apellido debe tener al menos 2 caracteres')
    .max(50, 'Apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Apellido solo puede contener letras y espacios'),

  email: z
    .string({ required_error: 'Email es requerido' })
    .min(1, 'Email es requerido')
    .email('Formato de email inválido')
    .transform(email => email.toLowerCase().trim()),

  password: z
    .string({ required_error: 'Contraseña es requerida' })
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .max(128, 'Contraseña no puede exceder 128 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Contraseña debe contener al menos una mayúscula, una minúscula y un número'),

  rol: z.enum(['Admin', 'Mesero', 'Cocinero', 'Cajero'], {
    errorMap: () => ({ message: 'Rol debe ser Admin, Mesero, Cocinero o Cajero' })
  })
})

// Schema para actualizar usuario (campos opcionales)
export const updateUserSchema = z.object({
  nombre: z
    .string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50, 'Nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nombre solo puede contener letras y espacios')
    .optional(),

  apellido: z
    .string()
    .min(2, 'Apellido debe tener al menos 2 caracteres')
    .max(50, 'Apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Apellido solo puede contener letras y espacios')
    .optional(),

  email: z
    .string()
    .email('Formato de email inválido')
    .transform(email => email.toLowerCase().trim())
    .optional(),

  rol: z.enum(['Admin', 'Mesero', 'Cocinero', 'Cajero'], {
    errorMap: () => ({ message: 'Rol debe ser Admin, Mesero, Cocinero o Cajero' })
  }).optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  'Al menos un campo debe ser proporcionado para actualizar'
)

// Tipos inferidos de los schemas
export type LoginInput = z.infer<typeof loginSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>

// Función helper para validar y retornar errores formateados
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // Formatear errores de Zod a un objeto simple
  const errors: Record<string, string> = {}
  result.error.errors.forEach((error) => {
    const path = error.path.join('.')
    errors[path] = error.message
  })

  return { success: false, errors }
}
