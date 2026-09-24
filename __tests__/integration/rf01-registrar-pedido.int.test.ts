// RF-01 — Registrar pedido (POST /api/pedidos)
import { NextRequest } from "next/server"
import { POST as crearPedidoHandler } from "@/app/api/pedidos/route"
import { requireAuth } from "@/lib/middleware-auth"
import { prisma as appPrisma } from "@/lib/prisma"
import { db, crearUsuario, crearMesa, crearProducto, crearPedido, limpiar, cerrarConexion } from "./factories"

jest.mock("@/lib/middleware-auth")
const mockedRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>

function authAs(user: { id_user: number; rol: string }) {
  mockedRequireAuth.mockResolvedValue({ session: { id: String(user.id_user), rol: user.rol } } as any)
}

afterAll(async () => {
  await limpiar()
  await cerrarConexion()
  await appPrisma.$disconnect()
})

describe("RF-01 Registrar pedido", () => {
  test("CP-01: registra un pedido válido en una mesa libre", async () => {
    const { usuario } = await crearUsuario("Mesero")
    const mesa = await crearMesa()
    const producto = await crearProducto({ precio: 8.5, stock: 50 })
    authAs(usuario)

    const req = new NextRequest("http://localhost/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoServicio: "mesa",
        mesaId: String(mesa.id_mesa),
        detalles: [{ productoId: String(producto.id_produc), cantidad: 2, precioUnitario: 8.5 }],
      }),
    })

    const res = await crearPedidoHandler(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.total).toBeCloseTo(17, 2)

    const pedidoDb = await db.pedidos.findUnique({ where: { id_pedido: Number(body.id) } })
    expect(pedidoDb?.estado_pedido).toBe("En preparacion")

    const productoDb = await db.productos.findUnique({ where: { id_produc: producto.id_produc } })
    expect(Number(productoDb?.stock_produc)).toBe(48)

    const mesaDb = await db.mesas.findUnique({ where: { id_mesa: mesa.id_mesa } })
    expect(mesaDb?.estado_mesa).toBe("Ocupada")
  })

  test("CP-02: rechaza un pedido sin productos", async () => {
    const { usuario } = await crearUsuario("Mesero")
    const mesa = await crearMesa()
    authAs(usuario)

    const req = new NextRequest("http://localhost/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipoServicio: "mesa", mesaId: String(mesa.id_mesa), detalles: [] }),
    })

    const res = await crearPedidoHandler(req)
    expect(res.status).toBe(400)

    const mesaDb = await db.mesas.findUnique({ where: { id_mesa: mesa.id_mesa } })
    expect(mesaDb?.estado_mesa).toBe("Libre")

    const pedidosDb = await db.pedidos.count({ where: { id_mesa: mesa.id_mesa } })
    expect(pedidosDb).toBe(0)
  })

  test("CP-03: rechaza una cantidad mayor al stock disponible", async () => {
    const { usuario } = await crearUsuario("Mesero")
    const mesa = await crearMesa()
    const producto = await crearProducto({ precio: 8.5, stock: 5 })
    authAs(usuario)

    const req = new NextRequest("http://localhost/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoServicio: "mesa",
        mesaId: String(mesa.id_mesa),
        detalles: [{ productoId: String(producto.id_produc), cantidad: 6, precioUnitario: 8.5 }],
      }),
    })

    const res = await crearPedidoHandler(req)
    expect(res.status).toBe(400)

    const productoDb = await db.productos.findUnique({ where: { id_produc: producto.id_produc } })
    expect(Number(productoDb?.stock_produc)).toBe(5)

    const mesaDb = await db.mesas.findUnique({ where: { id_mesa: mesa.id_mesa } })
    expect(mesaDb?.estado_mesa).toBe("Libre")

    const pedidosDb = await db.pedidos.count({ where: { id_mesa: mesa.id_mesa } })
    expect(pedidosDb).toBe(0)
  })

  test("CP-04: rechaza un delivery con dirección por debajo del mínimo", async () => {
    const { usuario } = await crearUsuario("Mesero")
    const producto = await crearProducto({ precio: 8.5, stock: 50 })
    authAs(usuario)

    const req = new NextRequest("http://localhost/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoServicio: "delivery",
        clienteInfo: { nombreCliente: "Ana Torres", numeroTelefono: "987654321", direccion: "Jr. Unión" },
        detalles: [{ productoId: String(producto.id_produc), cantidad: 1, precioUnitario: 8.5 }],
      }),
    })

    const res = await crearPedidoHandler(req)
    expect(res.status).toBe(400)

    const productoDb = await db.productos.findUnique({ where: { id_produc: producto.id_produc } })
    expect(Number(productoDb?.stock_produc)).toBe(50)
  })

  test("CP-21: rechaza un pedido en una mesa ya ocupada", async () => {
    const { usuario } = await crearUsuario("Mesero")
    const mesa = await crearMesa({ estado: "Ocupada" })
    const producto = await crearProducto({ precio: 8.5, stock: 50 })
    await crearPedido({
      usuarioId: usuario.id_user,
      mesaId: mesa.id_mesa,
      estado: "En preparacion",
      detalles: [{ productoId: producto.id_produc, cantidad: 1, precioUnitario: 8.5 }],
    })
    authAs(usuario)

    const req = new NextRequest("http://localhost/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoServicio: "mesa",
        mesaId: String(mesa.id_mesa),
        detalles: [{ productoId: String(producto.id_produc), cantidad: 1, precioUnitario: 8.5 }],
      }),
    })

    const res = await crearPedidoHandler(req)
    expect(res.status).toBe(400)

    const pedidosDb = await db.pedidos.count({ where: { id_mesa: mesa.id_mesa } })
    expect(pedidosDb).toBe(1)
  })
})
