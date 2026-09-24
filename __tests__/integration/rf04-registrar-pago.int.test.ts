// RF-04 — Registrar el pago con comprobante (POST /api/pagos/[id])
import { NextRequest } from "next/server"
import { POST as pagarHandler } from "@/app/api/pagos/[id]/route"
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
  const producto = await crearProducto({ precio: 8.5, stock: 50 })
  return crearPedido({
    usuarioId: mesero.id_user,
    mesaId: mesa.id_mesa,
    estado,
    detalles: [{ productoId: producto.id_produc, cantidad: 2, precioUnitario: 8.5 }],
  })
}

function pagar(pedidoId: number, data: Record<string, unknown>) {
  const req = new NextRequest(`http://localhost/api/pagos/${pedidoId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return pagarHandler(req, { params: Promise.resolve({ id: String(pedidoId) }) })
}

afterAll(async () => {
  await limpiar()
  await cerrarConexion()
  await appPrisma.$disconnect()
})

describe("RF-04 Registrar el pago con comprobante", () => {
  test("CP-13: registra el pago de un pedido servido con boleta", async () => {
    const { usuario: cajero } = await crearUsuario("Cajero")
    const pedido = await pedidoDePrueba("Servido")
    authAs(cajero)

    const res = await pagar(pedido.id_pedido, {
      nombreCliente: "Juan Pérez",
      dniCliente: "45678912",
      tipoComprobante: "boleta",
      total: 17,
    })
    expect(res.status).toBe(200)

    const pedidoDb = await db.pedidos.findUnique({ where: { id_pedido: pedido.id_pedido } })
    expect(pedidoDb?.estado_pedido).toBe("Pagado")

    const ingreso = await db.ingresos.findFirst({
      where: { descripcion: { contains: `Pedido #${pedido.id_pedido} -` } },
    })
    expect(ingreso).not.toBeNull()
    expect(Number(ingreso?.monto)).toBeCloseTo(17, 2)
  })

  test("CP-14: rechaza el pago si falta el DNI del cliente", async () => {
    const { usuario: cajero } = await crearUsuario("Cajero")
    const pedido = await pedidoDePrueba("Servido")
    authAs(cajero)

    const res = await pagar(pedido.id_pedido, {
      nombreCliente: "Juan Pérez",
      dniCliente: "",
      tipoComprobante: "boleta",
      total: 17,
    })
    expect(res.status).toBe(400)

    const pedidoDb = await db.pedidos.findUnique({ where: { id_pedido: pedido.id_pedido } })
    expect(pedidoDb?.estado_pedido).toBe("Servido")

    const ingreso = await db.ingresos.findFirst({
      where: { descripcion: { contains: `Pedido #${pedido.id_pedido} -` } },
    })
    expect(ingreso).toBeNull()
  })

  test("CP-16: rechaza pagar un pedido que aún no fue servido", async () => {
    const { usuario: cajero } = await crearUsuario("Cajero")
    const pedido = await pedidoDePrueba("En preparacion")
    authAs(cajero)

    const res = await pagar(pedido.id_pedido, {
      nombreCliente: "Juan Pérez",
      dniCliente: "45678912",
      tipoComprobante: "boleta",
      total: 17,
    })
    expect(res.status).toBe(400)

    const pedidoDb = await db.pedidos.findUnique({ where: { id_pedido: pedido.id_pedido } })
    expect(pedidoDb?.estado_pedido).toBe("En preparacion")

    const ingreso = await db.ingresos.findFirst({
      where: { descripcion: { contains: `Pedido #${pedido.id_pedido} -` } },
    })
    expect(ingreso).toBeNull()
  })

  test("CP-24: rechaza un DNI de 7 dígitos", async () => {
    const { usuario: cajero } = await crearUsuario("Cajero")
    const pedido = await pedidoDePrueba("Servido")
    authAs(cajero)

    const res = await pagar(pedido.id_pedido, {
      nombreCliente: "Juan Pérez",
      dniCliente: "4567891",
      tipoComprobante: "boleta",
      total: 17,
    })
    expect(res.status).toBe(400)

    const pedidoDb = await db.pedidos.findUnique({ where: { id_pedido: pedido.id_pedido } })
    expect(pedidoDb?.estado_pedido).toBe("Servido")
  })
})
