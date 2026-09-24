// RF-03 — Cambiar el estado del pedido desde cocina (PUT /api/pedidos/[id])
import { NextRequest } from "next/server"
import { PUT as actualizarPedidoHandler } from "@/app/api/pedidos/[id]/route"
import { requireAuth } from "@/lib/middleware-auth"
import { prisma as appPrisma } from "@/lib/prisma"
import { db, crearUsuario, crearMesa, crearProducto, crearPedido, limpiar, cerrarConexion } from "./factories"

jest.mock("@/lib/middleware-auth")
const mockedRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>

function authAs(user: { id_user: number; rol: string }) {
  mockedRequireAuth.mockResolvedValue({ session: { id: String(user.id_user), rol: user.rol } } as any)
}

async function pedidoDePrueba(estado: string) {
  const { usuario: mesero } = await crearUsuario("Mesero")
  const mesa = await crearMesa()
  const producto = await crearProducto()
  return crearPedido({
    usuarioId: mesero.id_user,
    mesaId: mesa.id_mesa,
    estado,
    detalles: [{ productoId: producto.id_produc, cantidad: 1, precioUnitario: 10 }],
  })
}

function putEstado(pedidoId: number, estado: string) {
  const req = new NextRequest(`http://localhost/api/pedidos/${pedidoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  })
  return actualizarPedidoHandler(req, { params: Promise.resolve({ id: String(pedidoId) }) })
}

afterAll(async () => {
  await limpiar()
  await cerrarConexion()
  await appPrisma.$disconnect()
})

describe("RF-03 Cambiar el estado del pedido desde cocina", () => {
  test("CP-09: la cocina marca un pedido como Servido", async () => {
    const { usuario: cocinero } = await crearUsuario("Cocinero")
    const pedido = await pedidoDePrueba("En preparacion")
    authAs(cocinero)

    const res = await putEstado(pedido.id_pedido, "Servido")
    expect(res.status).toBe(200)

    const pedidoDb = await db.pedidos.findUnique({ where: { id_pedido: pedido.id_pedido } })
    expect(pedidoDb?.estado_pedido).toBe("Servido")
  })

  test("CP-10: rechaza una actualización sin indicar un estado", async () => {
    const { usuario: cocinero } = await crearUsuario("Cocinero")
    const pedido = await pedidoDePrueba("En preparacion")
    authAs(cocinero)

    const res = await putEstado(pedido.id_pedido, "")
    expect(res.status).toBe(400)

    const pedidoDb = await db.pedidos.findUnique({ where: { id_pedido: pedido.id_pedido } })
    expect(pedidoDb?.estado_pedido).toBe("En preparacion")
  })

  test("CP-11: rechaza un estado que no existe en el modelo", async () => {
    const { usuario: cocinero } = await crearUsuario("Cocinero")
    const pedido = await pedidoDePrueba("En preparacion")
    authAs(cocinero)

    const res = await putEstado(pedido.id_pedido, "Listo")
    expect(res.status).toBe(400)

    const pedidoDb = await db.pedidos.findUnique({ where: { id_pedido: pedido.id_pedido } })
    expect(pedidoDb?.estado_pedido).toBe("En preparacion")
  })

  test("CP-12: rechaza volver un pedido pagado a 'En preparacion'", async () => {
    const { usuario: cocinero } = await crearUsuario("Cocinero")
    const pedido = await pedidoDePrueba("Pagado")
    authAs(cocinero)

    const res = await putEstado(pedido.id_pedido, "En preparacion")
    expect(res.status).toBe(400)

    const pedidoDb = await db.pedidos.findUnique({ where: { id_pedido: pedido.id_pedido } })
    expect(pedidoDb?.estado_pedido).toBe("Pagado")
  })

  test("CP-23: responde 404 al cambiar el estado de un pedido inexistente", async () => {
    const { usuario: cocinero } = await crearUsuario("Cocinero")
    authAs(cocinero)

    const res = await putEstado(999999999, "Servido")
    expect(res.status).toBe(404)
  })
})
