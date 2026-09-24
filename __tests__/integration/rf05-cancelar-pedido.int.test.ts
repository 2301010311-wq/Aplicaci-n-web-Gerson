// RF-05 — Cancelar un pedido (DELETE /api/pedidos/[id])
import { NextRequest } from "next/server"
import { POST as crearPedidoHandler } from "@/app/api/pedidos/route"
import { DELETE as cancelarPedidoHandler } from "@/app/api/pedidos/[id]/route"
import { requireAuth } from "@/lib/middleware-auth"
import { prisma as appPrisma } from "@/lib/prisma"
import { db, crearUsuario, crearMesa, crearProducto, crearPedido, limpiar, cerrarConexion } from "./factories"

jest.mock("@/lib/middleware-auth")
const mockedRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>

function authAs(user: { id_user: number; rol: string }) {
  mockedRequireAuth.mockResolvedValue({ session: { id: String(user.id_user), rol: user.rol } } as any)
}

function cancelar(pedidoId: number) {
  const req = new NextRequest(`http://localhost/api/pedidos/${pedidoId}`, { method: "DELETE" })
  return cancelarPedidoHandler(req, { params: Promise.resolve({ id: String(pedidoId) }) })
}

afterAll(async () => {
  await limpiar()
  await cerrarConexion()
  await appPrisma.$disconnect()
})

describe("RF-05 Cancelar un pedido", () => {
  test("CP-17: cancela un pedido en preparación y devuelve el stock", async () => {
    const { usuario: mesero } = await crearUsuario("Mesero")
    const mesa = await crearMesa()
    const producto = await crearProducto({ precio: 8.5, stock: 50 })
    authAs(mesero)

    const reqCrear = new NextRequest("http://localhost/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoServicio: "mesa",
        mesaId: String(mesa.id_mesa),
        detalles: [{ productoId: String(producto.id_produc), cantidad: 2, precioUnitario: 8.5 }],
      }),
    })
    const resCrear = await crearPedidoHandler(reqCrear)
    const bodyCrear = await resCrear.json()
    expect(resCrear.status).toBe(200)

    const productoTrasCrear = await db.productos.findUnique({ where: { id_produc: producto.id_produc } })
    expect(Number(productoTrasCrear?.stock_produc)).toBe(48)

    const resCancelar = await cancelar(Number(bodyCrear.id))
    expect(resCancelar.status).toBe(200)

    const pedidoDb = await db.pedidos.findUnique({ where: { id_pedido: Number(bodyCrear.id) } })
    expect(pedidoDb?.estado_pedido).toBe("Cancelado")

    const productoTrasCancelar = await db.productos.findUnique({ where: { id_produc: producto.id_produc } })
    expect(Number(productoTrasCancelar?.stock_produc)).toBe(50)
  })

  test("CP-18: responde 404 al cancelar un pedido inexistente", async () => {
    const { usuario: mesero } = await crearUsuario("Mesero")
    authAs(mesero)

    const res = await cancelar(999999999)
    expect(res.status).toBe(404)
  })

  test("CP-19: rechaza cancelar un pedido que ya fue servido", async () => {
    const { usuario: mesero } = await crearUsuario("Mesero")
    const mesa = await crearMesa()
    const producto = await crearProducto({ precio: 8.5, stock: 50 })
    const pedido = await crearPedido({
      usuarioId: mesero.id_user,
      mesaId: mesa.id_mesa,
      estado: "Servido",
      detalles: [{ productoId: producto.id_produc, cantidad: 2, precioUnitario: 8.5 }],
    })
    authAs(mesero)

    const res = await cancelar(pedido.id_pedido)
    expect(res.status).toBe(400)

    const pedidoDb = await db.pedidos.findUnique({ where: { id_pedido: pedido.id_pedido } })
    expect(pedidoDb?.estado_pedido).toBe("Servido")

    const productoDb = await db.productos.findUnique({ where: { id_produc: producto.id_produc } })
    expect(Number(productoDb?.stock_produc)).toBe(50)
  })

  test("CP-20: registra la fecha de cancelación en el pedido", async () => {
    const { usuario: mesero } = await crearUsuario("Mesero")
    const mesa = await crearMesa()
    const producto = await crearProducto()
    const pedido = await crearPedido({
      usuarioId: mesero.id_user,
      mesaId: mesa.id_mesa,
      estado: "En preparacion",
      detalles: [{ productoId: producto.id_produc, cantidad: 1, precioUnitario: 10 }],
    })
    authAs(mesero)

    const res = await cancelar(pedido.id_pedido)
    expect(res.status).toBe(200)

    const pedidoDb = await db.pedidos.findUnique({ where: { id_pedido: pedido.id_pedido } })
    expect(pedidoDb?.canceledAt).not.toBeNull()
  })
})
