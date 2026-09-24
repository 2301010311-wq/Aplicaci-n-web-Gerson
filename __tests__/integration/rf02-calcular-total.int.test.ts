// RF-02 — Calcular el total del pedido (POST /api/pedidos, cálculo)
import { NextRequest } from "next/server"
import { POST as crearPedidoHandler } from "@/app/api/pedidos/route"
import { requireAuth } from "@/lib/middleware-auth"
import { prisma as appPrisma } from "@/lib/prisma"
import { db, crearUsuario, crearMesa, crearProducto, limpiar, cerrarConexion } from "./factories"

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

describe("RF-02 Calcular el total del pedido", () => {
  test("CP-05: calcula el total con varios productos", async () => {
    const { usuario } = await crearUsuario("Mesero")
    const mesa = await crearMesa()
    const p1 = await crearProducto({ precio: 8.5, stock: 50 })
    const p2 = await crearProducto({ precio: 2.5, stock: 100 })
    authAs(usuario)

    const req = new NextRequest("http://localhost/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoServicio: "mesa",
        mesaId: String(mesa.id_mesa),
        detalles: [
          { productoId: String(p1.id_produc), cantidad: 2, precioUnitario: 8.5 },
          { productoId: String(p2.id_produc), cantidad: 3, precioUnitario: 2.5 },
        ],
      }),
    })

    const res = await crearPedidoHandler(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.total).toBeCloseTo(24.5, 2)

    const detalles = await db.detallepedido.findMany({ where: { id_pedido: Number(body.id) } })
    const subtotales = detalles.map((d) => Number(d.subtotal)).sort((a, b) => a - b)
    expect(subtotales).toEqual([7.5, 17])
  })

})
