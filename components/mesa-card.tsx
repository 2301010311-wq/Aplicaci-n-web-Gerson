"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UtensilsCrossed, Users, Trash2, ShoppingCart, Edit3, Unlock } from "lucide-react"
import { PedidoMesa } from "./pedido-mesa-completo"

// ==========================================
// INTERFACES
// ==========================================

/** Interfaz que representa una mesa en el sistema */
interface Mesa {
  id: string                                     // ID único de la mesa (UUID)
  numero: number                                 // Número visible de la mesa
  capacidad: number                              // Cantidad máxima de personas
  estado: "Libre" | "Ocupada" | "Reservada"     // Estado actual de la mesa
}

/** Interfaz que representa un pedido asociado a una mesa */
interface Pedido {
  id: string                    // ID único del pedido (UUID)
  id_mesa: string              // ID de la mesa asociada
  id_user: string              // ID del usuario que creó el pedido
  estado: string               // Estado del pedido (Nuevo, Preparando, Listo, Servido, Pagado)
  fecha_creacion?: string      // Fecha cuando se creó el pedido (opcional, no usado actualmente)
  total: number                // Monto total del pedido en soles
}

/** Props del componente MesaCard */
interface MesaCardProps {
  mesa: Mesa                   // Objeto mesa a mostrar
  onUpdate: () => void        // Callback cuando se actualiza la mesa
  isAdmin?: boolean           // Indica si el usuario es admin (muestra botón eliminar)
}

export function MesaCard({ mesa, onUpdate, isAdmin }: MesaCardProps) {
  // ==========================================
  // ESTADO LOCAL
  // ==========================================
  
  const [pedidoActual, setPedidoActual] = useState<Pedido | null>(null)    // Pedido activo en esta mesa
  const [showPedidoDialog, setShowPedidoDialog] = useState(false)           // Controla visibilidad del modal de pedido
  const [loading, setLoading] = useState(false)                             // Flag para desabilitar botones durante peticiones

  // ==========================================
  // EFECTOS
  // ==========================================

  // Verificar si existe un pedido activo cuando se monta o cambia el ID de la mesa
  useEffect(() => {
    verificarPedidoActivo()
  }, [mesa.id])

  // ==========================================
  // FUNCIONES
  // ==========================================

  /** 
   * Obtiene el pedido activo de la API si existe
   * Si hay error o no existe pedido, limpia el estado
   */
  const verificarPedidoActivo = async () => {
    try {
      const res = await fetch(`/api/pedidos/mesa-activa/${mesa.id}`)
      if (res.ok) {
        const data = await res.json()
        setPedidoActual(data || null)
      }
    } catch (error) {
      console.error("Error verificando pedido:", error)
      setPedidoActual(null)
    }
  }

  /** 
   * Elimina la mesa del sistema (solo admin)
   * Pide confirmación y actualiza la lista después de eliminar
   */
  const handleEliminar = async () => {
    const confirmDelete = confirm(`¿Estás seguro de eliminar la Mesa ${mesa.numero}?`)
    if (!confirmDelete) return

    setLoading(true)
    try {
      const res = await fetch(`/api/mesas/${mesa.id}`, { method: "DELETE" })
      const data = await res.json()
      
      if (res.ok) {
        onUpdate()  // Actualiza la lista de mesas
      } else {
        alert(data.error || "Error al eliminar mesa")
        console.error("Error eliminando mesa:", data.error)
      }
    } catch (error) {
      alert("Error de conexión al eliminar mesa")
      console.error("Error eliminando mesa:", error)
    } finally {
      setLoading(false)
    }
  }

  /** 
   * Libera la mesa cuando el cliente ha pagado y se retira
   * Pide doble confirmación por seguridad
   */
  const liberarMesa = async () => {
    if (!pedidoActual) return

    const confirmacion = confirm(`¿Está seguro que desea liberar la Mesa ${mesa.numero}? Confirme que el cliente se ha retirado.`)
    if (!confirmacion) return

    setLoading(true)
    try {
      const res = await fetch(`/api/mesas/${mesa.id}/liberar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId: pedidoActual.id })
      })

      if (res.ok) {
        alert("Mesa liberada exitosamente")
        onUpdate()                // Actualiza lista de mesas
        verificarPedidoActivo()   // Refresca estado del pedido
      } else {
        const error = await res.json()
        alert(error.error || "Error al liberar la mesa")
      }
    } catch (error) {
      console.error("Error liberando mesa:", error)
      alert("Error al liberar la mesa")
    } finally {
      setLoading(false)
    }
  }

  /** 
   * Callback cuando se crea o actualiza un pedido exitosamente
   * Cierra el modal, refresca el pedido y actualiza la lista
   */
  const handlePedidoSuccess = () => {
    setShowPedidoDialog(false)
    verificarPedidoActivo()
    onUpdate()
  }

  // ==========================================
  // DATOS DINÁMICOS
  // ==========================================

  // Usa estado de pedido si existe, sino usa estado de la mesa
  const estadoVisual = pedidoActual ? "Ocupada" : mesa.estado
  
  // Mapeo de colores para cada estado de la mesa
  const estadoColors: Record<string, { backgroundColor: string; borderColor: string; color: string }> = {
    Libre: {
      backgroundColor: "rgba(34, 197, 94, 0.2)",      // Verde oscuro con transparencia
      borderColor: "#22c55e",                         // Verde brillante
      color: "#4ade80"                                // Verde claro para texto
    },
    Ocupada: {
      backgroundColor: "rgba(239, 68, 68, 0.2)",      // Rojo oscuro con transparencia
      borderColor: "#ef4444",                         // Rojo brillante
      color: "#f87171"                                // Rojo claro para texto
    },
    Reservada: {
      backgroundColor: "rgba(234, 179, 8, 0.2)",      // Amarillo oscuro con transparencia
      borderColor: "#eab308",                         // Amarillo brillante
      color: "#facc15"                                // Amarillo claro para texto
    }
  }

  /** 
   * Obtiene los colores correspondientes al estado de la mesa
   * Si el estado no existe, usa los colores de "Libre" como fallback
   */
  const getColoresEstado = (estado: string) => {
    return estadoColors[estado] || estadoColors["Libre"]
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div 
      className="bg-[#2F2F2F] rounded-lg p-3 md:p-6 border-2" 
      style={{
        backgroundColor: "#2F2F2F",
        borderColor: getColoresEstado(estadoVisual).borderColor,  // Borde dinámico según estado
        borderWidth: "2px"
      }}
    >
      {/* HEADER: Nombre de la mesa y capacidad */}
      <div className="flex items-start justify-between mb-3 md:mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Icono circular de utensilo */}
          <div className="w-10 md:w-12 h-10 md:h-12 bg-[#C9A227] rounded-full flex items-center justify-center flex-shrink-0">
            <UtensilsCrossed className="w-5 md:w-6 h-5 md:h-6 text-[#1C1C1C]" />
          </div>
          {/* Número de mesa y capacidad */}
          <div>
            <h3 className="text-base md:text-xl font-bold text-[#EAEAEA]">Mesa {mesa.numero}</h3>
            <div className="flex items-center gap-1 text-[#C9A227] text-xs md:text-sm">
              <Users className="w-3 md:w-4 h-3 md:h-4" />
              <span>{mesa.capacidad}p</span>
            </div>
          </div>
        </div>
      </div>

      {/* ESTADO: Badge con estado actual y resumen del pedido */}
      <div className="mb-3 md:mb-4">
        {/* Badge de estado */}
        <span
          className="inline-block px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium"
          style={{
            backgroundColor: getColoresEstado(estadoVisual).backgroundColor,
            color: getColoresEstado(estadoVisual).color,
            paddingLeft: "8px",
            paddingRight: "8px",
            paddingTop: "4px", 
            paddingBottom: "4px",
            borderRadius: "9999px",
            fontSize: "12px",
            fontWeight: "500"
          }}
        >
          {pedidoActual ? "Ocupada" : mesa.estado}
        </span>
        
        {/* Resumen del pedido si existe */}
        {pedidoActual && (
          <div style={{ marginTop: "8px", padding: "6px 8px", backgroundColor: "#1C1C1C", borderRadius: "6px" }}>
            <div style={{ fontSize: "11px", color: "#C9A227" }}>Ped. #{pedidoActual.id.slice(0, 6)}</div>
            <div style={{ fontSize: "12px", color: "#EAEAEA", fontWeight: "bold" }}>
              Total: S/.{pedidoActual.total.toFixed(2)}
            </div>
            <div style={{ fontSize: "11px", color: "#EAEAEA", marginTop: "4px" }}>
              {pedidoActual.estado}
            </div>
          </div>
        )}
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="space-y-2">
        {pedidoActual ? (
          <>
            {/* Si existe pedido, mostrar botón según estado */}
            {pedidoActual.estado === "Pagado" ? (
              // Botón de liberar mesa cuando pedido está pagado
              <Button 
                onClick={liberarMesa}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm py-2 md:py-2"
                disabled={loading}
              >
                <Unlock className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                Liberar
              </Button>
            ) : (
              // Botón para modificar pedido si aún no está pagado
              <Button 
                onClick={() => setShowPedidoDialog(true)} 
                className="w-full bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] text-xs md:text-sm py-2 md:py-2"
                disabled={loading}
              >
                <Edit3 className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                Modificar
              </Button>
            )}
          </>
        ) : (
          // Si no hay pedido, mostrar botón para crear uno (solo si mesa está libre)
          <Button 
            onClick={() => setShowPedidoDialog(true)} 
            className="w-full bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] text-xs md:text-sm py-2 md:py-2"
            disabled={mesa.estado.toLowerCase() !== "libre" || loading}
          >
            <ShoppingCart className="w-3 md:w-4 h-3 md:h-4 mr-1" />
            Nuevo Pedido
          </Button>
        )}

        {/* Botón de eliminación (solo visible para admins) */}
        {isAdmin && (
          <Button 
            onClick={handleEliminar} 
            className="w-full bg-[#8B1C26] hover:bg-[#6d1620] text-white text-xs md:text-sm py-2 md:py-2"
            disabled={loading}
          >
            <Trash2 className="w-3 md:w-4 h-3 md:h-4 mr-1" />
            Eliminar
          </Button>
        )}
      </div>

      {/* MODAL: Diálogo para crear/editar pedido */}
      <PedidoMesa
        mesaId={mesa.id}
        mesaNumero={mesa.numero}
        isOpen={showPedidoDialog}
        onClose={() => setShowPedidoDialog(false)}
        onPedidoCreado={handlePedidoSuccess}
        pedidoExistente={pedidoActual ? {
          id: pedidoActual.id,
          detalles: [] // Se cargarán desde la API en el componente PedidoMesa
        } : undefined}
      />
    </div>
  )
}

