import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(["Admin", "Mesero", "Cajero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const pedidoId = parseInt(id)

    // Obtener el pedido con información de delivery
    const pedido = await prisma.pedidos.findUnique({
      where: { id_pedido: pedidoId },
      include: {
        pedido_delivery: true,
        detallepedido: {
          include: {
            productos: true,
          },
        },
        mesas: true,
        usuarios: {
          select: {
            nombre_user: true,
            apellido_user: true,
          },
        },
      },
    })

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    if (!pedido.pedido_delivery) {
      return NextResponse.json({ error: "Este pedido no es de delivery" }, { status: 400 })
    }

    // Calcular total
    const total = pedido.detallepedido.reduce(
      (sum, d) => sum + Number(d.subtotal),
      0
    )

    // Generar HTML del ticket
    const ticketHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: monospace;
      font-size: 12px;
      margin: 0;
      padding: 10px;
      background: white;
      color: black;
      width: 80mm;
      line-height: 1.4;
    }
    .header {
      text-align: center;
      font-weight: bold;
      margin-bottom: 10px;
      font-size: 14px;
      border-bottom: 2px dashed #000;
      padding-bottom: 8px;
    }
    .section {
      margin-bottom: 10px;
      border-bottom: 1px dashed #000;
      padding-bottom: 8px;
    }
    .label {
      font-weight: bold;
      margin-bottom: 3px;
    }
    .value {
      margin-left: 10px;
      word-wrap: break-word;
    }
    .items {
      margin-top: 10px;
    }
    .item {
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
    }
    .qty {
      text-align: right;
      width: 30px;
    }
    .total-section {
      text-align: right;
      font-weight: bold;
      font-size: 14px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 2px dashed #000;
    }
    .footer {
      text-align: center;
      margin-top: 10px;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="header">TICKET DELIVERY</div>
  
  <div class="section">
    <div class="label">Pedido #${pedido.id_pedido}</div>
    <div class="label">Fecha:</div>
    <div class="value">${new Date(pedido.fecha_pedido || Date.now()).toLocaleString("es-PE")}</div>
  </div>

  <div class="section">
    <div class="label">CLIENTE</div>
    <div class="value">Nombre: ${pedido.pedido_delivery.nombre_cliente}</div>
    <div class="value">Teléfono: ${pedido.pedido_delivery.numero_telefono}</div>
    <div class="value">Dirección: ${pedido.pedido_delivery.direccion || "No especificada"}</div>
  </div>

  ${pedido.observaciones ? `
  <div class="section">
    <div class="label">OBSERVACIONES</div>
    <div class="value">${pedido.observaciones}</div>
  </div>
  ` : ""}

  ${pedido.pedido_delivery.notas ? `
  <div class="section">
    <div class="label">NOTAS DE DELIVERY</div>
    <div class="value">${pedido.pedido_delivery.notas}</div>
  </div>
  ` : ""}

  <div class="section">
    <div class="label">PRODUCTOS</div>
    <div class="items">
      ${pedido.detallepedido
        .map(
          (d) => `
        <div class="item">
          <span class="qty">${d.cantidad}x</span>
          <span>${d.nombre_produc_personalizado || (d.productos?.nombre_produc || 'Producto')}</span>
          <span>S/ ${Number(d.subtotal).toFixed(2)}</span>
        </div>
      `
        )
        .join("")}
    </div>
  </div>

  <div class="total-section">
    TOTAL: S/ ${total.toFixed(2)}
  </div>

  <div class="footer">
    Mesero: ${pedido.usuarios.nombre_user} ${pedido.usuarios.apellido_user}
    <br>
    Impreso: ${new Date().toLocaleString("es-PE")}
  </div>
</body>
</html>
    `

    return NextResponse.json({
      html: ticketHTML,
      pedidoId: pedido.id_pedido,
      cliente: pedido.pedido_delivery.nombre_cliente,
    })
  } catch (error) {
    console.error("Error generando ticket:", error)
    return NextResponse.json({ error: "Error al generar ticket" }, { status: 500 })
  }
}
