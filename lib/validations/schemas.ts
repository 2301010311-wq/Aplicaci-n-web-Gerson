// lib/validations/schemas.ts - Esquemas Zod para las entidades de negocio
import { z } from 'zod'

export const productoSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido').max(100, 'Nombre demasiado largo'),
  descripcion: z.string().max(500, 'Descripción demasiado larga').optional(),
  precio: z.coerce.number().positive('Precio debe ser mayor a 0'),
  categoria: z.string().min(1, 'Categoría es requerida').max(50),
  estado: z.enum(['Activo', 'Inactivo']).optional(),
  stock: z.coerce.number().min(0, 'Stock no puede ser negativo').optional(),
  controlarStock: z.boolean().optional(),
  fechaVencimiento: z.string().optional(),
})

export const insumoSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido').max(100),
  stockActual: z.coerce.number().min(0, 'Stock actual no puede ser negativo'),
  stockMinimo: z.coerce.number().min(0, 'Stock mínimo no puede ser negativo'),
  unidadMedida: z.string().min(1, 'Unidad de medida es requerida').max(20),
  fechaVencimiento: z.string().min(1, 'Fecha de vencimiento es requerida'),
})

export const mesaSchema = z.object({
  numero: z.coerce.number().int().positive('Número de mesa debe ser mayor a 0'),
  capacidad: z.coerce.number().int().positive('Capacidad debe ser mayor a 0'),
  estado: z.enum(['Libre', 'Ocupada']).optional(),
})

export const gastoSchema = z.object({
  monto: z.coerce.number().positive('Monto debe ser mayor a 0'),
  descripcion: z.string().min(1, 'Descripción es requerida').max(200),
  categoria: z.string().min(1, 'Categoría es requerida').max(50),
  proveedor: z.string().max(100).optional(),
  metodo_pago: z.string().max(50).optional(),
  comprobante: z.string().max(100).optional(),
})

export const ingresoSchema = z.object({
  monto: z.coerce.number().positive('Monto debe ser mayor a 0'),
  descripcion: z.string().min(1, 'Descripción es requerida').max(200),
  categoria: z.string().min(1, 'Categoría es requerida').max(50),
  cliente: z.string().max(100).optional(),
  metodo_pago: z.string().max(50).optional(),
  comprobante: z.string().max(100).optional(),
})

export const presupuestoSchema = z
  .object({
    nombre: z.string().min(1, 'Nombre es requerido').max(100),
    monto_total: z.coerce.number().positive('Monto total debe ser mayor a 0'),
    categoria: z.string().min(1, 'Categoría es requerida').max(50),
    fecha_inicio: z.string().min(1, 'Fecha de inicio es requerida'),
    fecha_fin: z.string().min(1, 'Fecha de fin es requerida'),
  })
  .refine((data) => new Date(data.fecha_fin) > new Date(data.fecha_inicio), {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fecha_fin'],
  })

export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors: Record<string, string> = {}
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.')
    errors[path] = issue.message
  })

  return { success: false, errors }
}
