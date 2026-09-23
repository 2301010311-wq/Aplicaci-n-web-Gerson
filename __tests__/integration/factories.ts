// Fixtures para pruebas de integración. Solo crean y borran los datos que ellas mismas registran.
// No usar prisma/seed.ts: es destructivo.
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { randomBytes, randomInt } from "crypto"
import { createToken } from "@/lib/auth"
import { assertTestDatabase } from "./guard"

assertTestDatabase()

export const db = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL })

export type RolNombre = "Admin" | "Mesero" | "Cocinero" | "Cajero" | "Tester"

const creados = {
  usuarios: [] as number[],
  mesas: [] as number[],
  productos: [] as number[],
  pedidos: [] as number[],
  inventarios: [] as number[],
}

let siguienteNumeroMesa = 100000 + randomInt(0, 800000)

export async function crearUsuario(rol: RolNombre = "Mesero") {
  const password = randomBytes(9).toString("base64url")
  const sufijo = randomBytes(4).toString("hex")
  const usuario = await db.usuarios.create({
    data: {
      nombre_user: `QA ${rol}`,
      apellido_user: "Prueba",
      correo_user: `qa-${rol.toLowerCase()}-${sufijo}@test.local`,
      dni_user: String(randomInt(10_000_000, 99_999_999)),
      rol,
      contrasena: await bcrypt.hash(password, 4),
    },
  })
  creados.usuarios.push(usuario.id_user)

  const token = await createToken({
    id: usuario.id_user.toString(),
    nombre: `${usuario.nombre_user} ${usuario.apellido_user}`,
    email: usuario.correo_user ?? "",
    rol: usuario.rol,
  })

  return { usuario, password, token }
}

export async function crearMesa(opts: { estado?: string; capacidad?: number } = {}) {
  const mesa = await db.mesas.create({
    data: {
      numero_mesa: siguienteNumeroMesa++,
      capacidad_mesa: opts.capacidad ?? 4,
      estado_mesa: opts.estado ?? "Libre",
    },
  })
  creados.mesas.push(mesa.id_mesa)
  return mesa
}

export async function crearProducto(
  opts: { nombre?: string; precio?: number; stock?: number; controlarStock?: boolean } = {}
) {
  const producto = await db.productos.create({
    data: {
      nombre_produc: opts.nombre ?? `QA Producto ${randomBytes(3).toString("hex")}`,
      precio_produc: opts.precio ?? 10,
      categoria_produc: "QA",
      estado_produc: "Activo",
      vencimiento_produc: new Date("2099-12-31"),
      stock_produc: opts.stock ?? 100,
      controlar_stock: opts.controlarStock ?? true,
    },
  })
  creados.productos.push(producto.id_produc)
  return producto
}

// Misma fecha que usa app/api/pedidos/route.ts (getTodayInLima)
function hoyEnLima(): Date {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
  return new Date(`${ymd}T00:00:00.000Z`)
}

export async function crearInventarioPollos(opts: { pechos?: number; piernas?: number } = {}) {
  const fecha = hoyEnLima()
  const data = {
    pollos_totales: 0,
    pechos_disponibles: opts.pechos ?? 10,
    piernas_disponibles: opts.piernas ?? 10,
  }
  const inventario = await db.inventario_pollos.upsert({
    where: { fecha },
    update: data,
    create: { fecha, ...data },
  })
  creados.inventarios.push(inventario.id_inventario)
  return inventario
}

export async function crearPedido(opts: {
  usuarioId: number
  mesaId: number
  estado?: string
  detalles: Array<{ productoId: number; cantidad: number; precioUnitario: number }>
}) {
  const total = opts.detalles.reduce((s, d) => s + d.cantidad * d.precioUnitario, 0)
  const pedido = await db.pedidos.create({
    data: {
      id_user: opts.usuarioId,
      id_mesa: opts.mesaId,
      estado_pedido: opts.estado ?? "En preparacion",
      total,
      detallepedido: {
        create: opts.detalles.map((d) => ({
          id_produc: d.productoId,
          cantidad: d.cantidad,
          precio_unitario: d.precioUnitario,
          subtotal: d.cantidad * d.precioUnitario,
        })),
      },
    },
  })
  creados.pedidos.push(pedido.id_pedido)
  return pedido
}

// Borra solo lo creado por estas factories y los pedidos que las APIs generaron con esos usuarios/mesas.
export async function limpiar(): Promise<void> {
  assertTestDatabase()

  const generados = await db.pedidos.findMany({
    where: {
      OR: [{ id_user: { in: creados.usuarios } }, { id_mesa: { in: creados.mesas } }],
    },
    select: { id_pedido: true },
  })
  const pedidoIds = [...new Set([...creados.pedidos, ...generados.map((p) => p.id_pedido)])]

  await db.detalle_pollos_pedido.deleteMany({ where: { id_pedido: { in: pedidoIds } } })
  await db.detallepedido.deleteMany({ where: { id_pedido: { in: pedidoIds } } })
  await db.pedidos_delivery.deleteMany({ where: { id_pedido: { in: pedidoIds } } })
  await db.pedidos.deleteMany({ where: { id_pedido: { in: pedidoIds } } })
  if (pedidoIds.length > 0) {
    await db.ingresos.deleteMany({
      where: { OR: pedidoIds.map((id) => ({ descripcion: { contains: `Pedido #${id} -` } })) },
    })
  }
  await db.mesas.deleteMany({ where: { id_mesa: { in: creados.mesas } } })
  await db.mesas.deleteMany({ where: { numero_mesa: { in: [-1, -2] }, pedidos: { none: {} } } })
  await db.productos.deleteMany({ where: { id_produc: { in: creados.productos } } })
  await db.usuarios.deleteMany({ where: { id_user: { in: creados.usuarios } } })
  await db.inventario_pollos.deleteMany({ where: { id_inventario: { in: creados.inventarios } } })

  for (const lista of Object.values(creados)) lista.length = 0
}

export async function cerrarConexion(): Promise<void> {
  await db.$disconnect()
}
