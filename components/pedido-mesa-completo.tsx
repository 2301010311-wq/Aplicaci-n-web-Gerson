"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Trash2, Save, ChefHat, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PreasPolloSelector } from "./presa-pollo-selector"

interface Producto {
  id: string
  nombre: string
  precio: number
  categoria: string
  estado: string
  stock?: number
  controlarStock?: boolean
}

interface DetallePedido {
  productoId: string
  producto: Producto
  cantidad: number
  precioUnitario: number
  subtotal: number
}

interface PedidoMesaProps {
  mesaId: string
  mesaNumero: number
  isOpen: boolean
  onClose: () => void
  onPedidoCreado: () => void
  pedidoExistente?: {
    id: string
    detalles: DetallePedido[]
  }
}

export function PedidoMesa({ 
  mesaId, 
  mesaNumero, 
  isOpen, 
  onClose, 
  onPedidoCreado,
  pedidoExistente 
}: PedidoMesaProps) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [detalles, setDetalles] = useState<DetallePedido[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProductos, setLoadingProductos] = useState(true)
  const [nombreMesero, setNombreMesero] = useState("")
  const [mostrarSelectorPollos, setMostrarSelectorPollos] = useState(false)
  const [observaciones, setObservaciones] = useState("")
  const [mostrarAgregarOtro, setMostrarAgregarOtro] = useState(false)
  const [otroNombre, setOtroNombre] = useState("")
  const [otroPrecio, setOtroPrecio] = useState("")
  const [otroCantidad, setOtroCantidad] = useState("1")

  useEffect(() => {
    // Cargar nombre del mesero desde la sesión
    const cargarMesero = async () => {
      try {
        const res = await fetch("/api/auth/session")
        const data = await res.json()
        if (data.session) {
          setNombreMesero(data.session.nombre)
        }
      } catch (error) {
        console.error("Error cargando sesión:", error)
      }
    }
    
    if (isOpen) {
      cargarMesero()
      cargarProductos()
      if (pedidoExistente) {
        cargarDetallesPedido(pedidoExistente.id)
      } else {
        setDetalles([])
      }
    }
  }, [isOpen, pedidoExistente])

  const cargarDetallesPedido = async (pedidoId: string) => {
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`)
      if (res.ok) {
        const pedido = await res.json()
        if (pedido.detallepedido) {
          const detallesFormateados: DetallePedido[] = pedido.detallepedido.map((detalle: any) => ({
            productoId: detalle.id_produc,
            producto: {
              id: detalle.producto.id,
              nombre: detalle.producto.nombre,
              precio: detalle.producto.precio,
              categoria: detalle.producto.categoria,
              estado: detalle.producto.estado
            },
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precio_unitario,
            subtotal: detalle.subtotal
          }))
          setDetalles(detallesFormateados)
        }
        // Cargar observaciones si existen
        if (pedido.observaciones) {
          setObservaciones(pedido.observaciones)
        } else {
          setObservaciones("")
        }
      }
    } catch (error) {
      console.error("Error cargando detalles del pedido:", error)
    }
  }

  const cargarProductos = async () => {
    try {
      const res = await fetch("/api/productos")
      const data = await res.json()
      setProductos(data.filter((p: Producto) => p.estado === "Activo"))
    } catch (error) {
      console.error("Error cargando productos:", error)
    } finally {
      setLoadingProductos(false)
    }
  }

  const agregarProducto = (producto: Producto) => {
    const detalleExistente = detalles.find(d => d.productoId === producto.id)
    
    if (detalleExistente) {
      modificarCantidad(producto.id, detalleExistente.cantidad + 1)
    } else {
      const nuevoDetalle: DetallePedido = {
        productoId: producto.id,
        producto: producto,
        cantidad: 1,
        precioUnitario: producto.precio,
        subtotal: producto.precio
      }
      setDetalles(prev => [...prev, nuevoDetalle])
    }
  }

  const agregarProductoOtro = () => {
    if (!otroNombre.trim()) {
      alert("Ingresa el nombre del producto")
      return
    }

    const precio = parseFloat(otroPrecio)
    if (isNaN(precio) || precio <= 0) {
      alert("Ingresa un precio válido")
      return
    }

    const cantidad = parseInt(otroCantidad)
    if (isNaN(cantidad) || cantidad <= 0) {
      alert("Ingresa una cantidad válida")
      return
    }

    // Crear un ID único para el producto "otro"
    const productoOtroId = `otro_${Date.now()}`
    const productoOtro: Producto = {
      id: productoOtroId,
      nombre: otroNombre,
      precio: precio,
      categoria: "Otro",
      estado: "Activo"
    }

    const nuevoDetalle: DetallePedido = {
      productoId: productoOtroId,
      producto: productoOtro,
      cantidad: cantidad,
      precioUnitario: precio,
      subtotal: precio * cantidad
    }

    setDetalles(prev => [...prev, nuevoDetalle])
    
    // Resetear el formulario
    setOtroNombre("")
    setOtroPrecio("")
    setOtroCantidad("1")
    setMostrarAgregarOtro(false)
  }

  const modificarCantidad = (productoId: string, nuevaCantidad: number) => {
    if (nuevaCantidad === 0) {
      quitarProducto(productoId)
      return
    }

    setDetalles(prev => prev.map(detalle => 
      detalle.productoId === productoId 
        ? { 
            ...detalle, 
            cantidad: nuevaCantidad, 
            subtotal: detalle.precioUnitario * nuevaCantidad 
          }
        : detalle
    ))
  }

  const quitarProducto = (productoId: string) => {
    setDetalles(prev => prev.filter(d => d.productoId !== productoId))
  }

  const calcularTotal = () => {
    return detalles.reduce((total, detalle) => total + detalle.subtotal, 0)
  }

  const guardarPedido = async () => {
    if (detalles.length === 0) {
      alert("Debe agregar al menos un producto al pedido")
      return
    }

    setLoading(true)
    try {
      const url = "/api/pedidos"
      
      const method = pedidoExistente ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoExistente ? {
          pedidoId: pedidoExistente.id,
          detalles: detalles.map(d => ({
            productoId: d.productoId,
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            nombre: d.producto.nombre
          })),
          observaciones: observaciones || null
        } : {
          mesaId,
          tipoServicio: "mesa",
          detalles: detalles.map(d => ({
            productoId: d.productoId,
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            nombre: d.producto.nombre
          })),
          observaciones: observaciones || null
        }),
      })

      if (res.ok) {
        onPedidoCreado()
        onClose()
      } else {
        const error = await res.json()
        alert(error.error || "Error al guardar el pedido")
      }
    } catch (error) {
      console.error("Error guardando pedido:", error)
      alert("Error al guardar el pedido")
    } finally {
      setLoading(false)
    }
  }

  const cancelarPedido = async () => {
    if (!pedidoExistente) {
      alert("No hay pedido para cancelar")
      return
    }

    if (!window.confirm("¿Estás seguro que deseas cancelar este pedido?")) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/pedidos/${pedidoExistente.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        alert("Pedido cancelado exitosamente")
        onPedidoCreado() // Actualizar la lista
        onClose()
      } else {
        const error = await res.json()
        alert(error.error || "Error al cancelar el pedido")
      }
    } catch (error) {
      console.error("Error cancelando pedido:", error)
      alert("Error al cancelar el pedido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-2xl sm:!max-w-4xl lg:!max-w-7xl !w-full mx-auto max-h-[94vh] bg-gradient-to-br from-[#1C1C1C] to-[#0F0F0F] border border-[#C9A227] border-opacity-40 p-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#2F2F2F] to-[#1C1C1C] border-b border-[#C9A227] border-opacity-20 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-[#EAEAEA]">
              {pedidoExistente ? "📝 Modificar Pedido" : "➕ Nuevo Pedido"} - Mesa {mesaNumero}
            </h2>
            <p className="text-sm text-[#C9A227] mt-1">
              {nombreMesero && <span>👨‍💼 {nombreMesero}</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#EAEAEA] hover:text-[#C9A227] transition-colors flex-shrink-0 text-2xl hover:bg-[#C9A227] hover:bg-opacity-10 rounded-full w-10 h-10 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Grid responsivo - 1 columna móvil, 2 tablet, 3 desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 h-full">
            
            {/* COL 1 - DESCONTAR PRESAS Y OBSERVACIONES */}
            <div className="space-y-4 sm:space-y-6 flex flex-col sm:col-span-1">
              {/* DESCONTAR PRESAS */}
              <div className="bg-gradient-to-br from-[#2F2F2F] to-[#1C1C1C] rounded-xl border border-[#C9A227] border-opacity-20 p-5 space-y-4 hover:border-opacity-40 transition-all flex flex-col">
                <button
                  onClick={() => setMostrarSelectorPollos(!mostrarSelectorPollos)}
                  className="w-full flex items-center justify-between gap-3 font-bold text-base text-[#EAEAEA] hover:text-[#C9A227] transition-colors py-2"
                >
                  <span className="flex items-center gap-3">
                    <ChefHat className="w-6 h-6 text-[#C9A227]" />
                    Descontar Presas
                  </span>
                  <span className="text-sm">{mostrarSelectorPollos ? "▼" : "▶"}</span>
                </button>
                
                {mostrarSelectorPollos && (
                  <div className="bg-[#1C1C1C] rounded-lg p-4 border border-[#C9A227] border-opacity-30 flex-1 overflow-y-auto">
                    <PreasPolloSelector 
                      onDescontarClick={async () => {
                        try {
                          const response = await fetch("/api/productos")
                          if (response.ok) {
                            const data = await response.json()
                            setProductos(data.filter((p: Producto) => p.estado === "Activo"))
                          }
                        } catch (error) {
                          console.error("Error recargando productos:", error)
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {/* OBSERVACIONES */}
              <div className="bg-gradient-to-br from-[#2F2F2F] to-[#1C1C1C] rounded-xl border border-[#C9A227] border-opacity-20 p-5 space-y-4 hover:border-opacity-40 transition-all flex flex-col flex-1">
                <label className="text-base font-bold text-[#C9A227] uppercase tracking-wider block">
                  📝 Observaciones
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Sin picante, bien cocido, con extras..."
                  className="flex-1 w-full bg-[#1C1C1C] border border-[#C9A227] border-opacity-30 rounded-lg px-4 py-3 text-[#EAEAEA] text-sm placeholder-[#666] focus:outline-none focus:border-opacity-100 focus:ring-2 focus:ring-[#C9A227] focus:ring-opacity-20 resize-none font-medium"
                />
              </div>
            </div>

            {/* COL 2 - PRODUCTOS DISPONIBLES */}
            <div className="bg-gradient-to-br from-[#2F2F2F] to-[#1C1C1C] rounded-xl border border-[#C9A227] border-opacity-20 p-5 space-y-4 hover:border-opacity-40 transition-all flex flex-col h-full sm:col-span-1">
              <h3 className="text-base font-bold text-[#C9A227] uppercase tracking-wider">📦 Productos</h3>
              
              <div className="flex-1 space-y-2 overflow-y-auto pr-2 min-h-0 max-h-[300px] sm:max-h-[500px]">
                {loadingProductos ? (
                  <div className="text-center text-[#999] py-8 text-sm">⏳ Cargando...</div>
                ) : productos.length === 0 ? (
                  <div className="text-center text-[#999] py-8 text-sm">No hay productos</div>
                ) : (
                  productos.map((producto) => (
                    <div
                      key={producto.id}
                      className="flex items-center justify-between gap-3 p-3 bg-[#1C1C1C] rounded-lg border border-[#C9A227] border-opacity-20 hover:border-opacity-60 hover:bg-[#2F2F2F] transition-all group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-[#EAEAEA] group-hover:text-[#C9A227] transition-colors truncate flex-1">
                            {producto.nombre}
                          </h4>
                          {producto.stock !== undefined && (
                            <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap flex-shrink-0 ${
                              producto.stock > 5 ? 'bg-green-900 bg-opacity-40 text-green-300' :
                              producto.stock > 0 ? 'bg-yellow-900 bg-opacity-40 text-yellow-300' :
                              'bg-red-900 bg-opacity-40 text-red-300'
                            }`}>
                              Stock: {producto.stock}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-3 text-xs mt-1">
                          <span className="text-[#C9A227] font-bold">S/ {producto.precio.toFixed(2)}</span>
                          <span className="text-[#999]">{producto.categoria}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => agregarProducto(producto)}
                        disabled={producto.controlarStock !== false && producto.stock !== undefined && producto.stock <= 0}
                        className="bg-gradient-to-r from-[#C9A227] to-[#a88820] hover:from-[#a88820] hover:to-[#8B7B1F] text-[#1C1C1C] h-9 w-9 p-0 flex-shrink-0 font-bold disabled:opacity-50"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <Button
                onClick={() => setMostrarAgregarOtro(true)}
                className="w-full bg-[#1C1C1C] hover:bg-[#2F2F2F] border border-[#C9A227] border-dashed text-[#C9A227] font-bold py-2.5 rounded-lg transition-all text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Otro
              </Button>
            </div>

            {/* COL 3 - PEDIDO ACTUAL */}
            <div className="bg-gradient-to-br from-[#2F2F2F] to-[#1C1C1C] rounded-xl border border-[#C9A227] border-opacity-20 p-5 space-y-4 hover:border-opacity-40 transition-all flex flex-col h-full sm:col-span-1">
              <h3 className="text-base font-bold text-[#C9A227] uppercase tracking-wider">🛒 Pedido Actual</h3>
              
              <div className="flex-1 space-y-2 overflow-y-auto pr-2 min-h-0 max-h-[300px] sm:max-h-[500px]">
                {detalles.length === 0 ? (
                  <div className="text-center text-[#999] py-12 text-sm">
                    📭 No hay productos
                  </div>
                ) : (
                  <>
                    {detalles.map((detalle, index) => (
                      <div
                        key={`${detalle.productoId}-${index}`}
                        className="p-3 bg-[#1C1C1C] rounded-lg border border-[#C9A227] border-opacity-20 hover:border-opacity-40 transition-all space-y-2"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[#EAEAEA] truncate">
                              {detalle.producto.nombre}
                            </h4>
                            <p className="text-xs text-[#C9A227] mt-1">S/ {detalle.precioUnitario.toFixed(2)}</p>
                          </div>
                          <Button
                            onClick={() => quitarProducto(detalle.productoId)}
                            className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white h-8 w-8 p-0 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-center gap-2 bg-[#2F2F2F] rounded-lg p-2">
                          <Button
                            onClick={() => modificarCantidad(detalle.productoId, Math.max(0, detalle.cantidad - 1))}
                            className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] h-8 w-8 p-0 font-bold"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-[#EAEAEA] min-w-[2rem] text-center font-bold text-sm">
                            {detalle.cantidad}
                          </span>
                          <Button
                            onClick={() => modificarCantidad(detalle.productoId, detalle.cantidad + 1)}
                            className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] h-8 w-8 p-0 font-bold"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="text-right pt-2 border-t border-[#C9A227] border-opacity-20">
                          <p className="text-xs text-[#999]">Subtotal:</p>
                          <p className="text-sm font-bold text-[#C9A227]">
                            S/ {detalle.subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {detalles.length > 0 && (
                      <div className="border-t border-[#C9A227] border-opacity-30 pt-3 mt-3 bg-[#1C1C1C] rounded-lg p-3 sticky bottom-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-[#EAEAEA]">💰 Total:</span>
                          <span className="text-lg font-bold text-[#C9A227]">
                            S/ {calcularTotal().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER - BOTONES */}
        <div className="sticky bottom-0 bg-gradient-to-r from-[#2F2F2F] to-[#1C1C1C] border-t border-[#C9A227] border-opacity-20 px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center sm:justify-center">
          <Button
            onClick={guardarPedido}
            disabled={loading || detalles.length === 0}
            className="w-full sm:w-auto flex-shrink-0 bg-gradient-to-r from-[#C9A227] to-[#a88820] hover:from-[#a88820] hover:to-[#8B7B1F] text-[#1C1C1C] font-bold py-3 px-6 sm:px-8 rounded-lg transition-all disabled:opacity-50 text-sm"
          >
            {loading ? "⏳ Guardando..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {pedidoExistente ? "✓ Actualizar" : "✓ Crear Pedido"}
              </>
            )}
          </Button>
          
          {pedidoExistente && (
            <Button
              onClick={cancelarPedido}
              disabled={loading}
              className="w-full sm:w-auto flex-shrink-0 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold py-3 px-6 sm:px-8 rounded-lg transition-all disabled:opacity-50 text-sm"
            >
              {loading ? "⏳" : <X className="w-4 h-4 mr-2" />}
              {!loading && "Cancelar"}
            </Button>
          )}
          
          <Button
            onClick={onClose}
            className="w-full sm:w-auto flex-shrink-0 bg-[#1C1C1C] hover:bg-[#2F2F2F] border border-[#C9A227] border-opacity-40 text-[#EAEAEA] font-bold py-3 px-6 sm:px-8 rounded-lg transition-all text-sm"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>

      {/* MODAL PARA AGREGAR PRODUCTO OTRO */}
      <Dialog open={mostrarAgregarOtro} onOpenChange={setMostrarAgregarOtro}>
        <DialogContent className="bg-gradient-to-br from-[#2F2F2F] to-[#1C1C1C] border border-[#C9A227] border-opacity-40 max-w-sm rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#EAEAEA] text-lg">➕ Agregar Producto Personalizado</DialogTitle>
            <DialogDescription className="text-[#C9A227] text-sm">
              Ingresa los detalles del producto
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-[#EAEAEA] text-sm font-bold mb-2">Nombre del Producto</label>
              <input
                type="text"
                value={otroNombre}
                onChange={(e) => setOtroNombre(e.target.value)}
                placeholder="Ej: Bolsas de mayo, Salsas extra..."
                className="w-full bg-[#1C1C1C] border border-[#C9A227] border-opacity-40 rounded-lg px-3 py-2 text-[#EAEAEA] placeholder-[#666] focus:outline-none focus:border-opacity-100 focus:ring-2 focus:ring-[#C9A227] focus:ring-opacity-20 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#EAEAEA] text-sm font-bold mb-2">Precio (S/)</label>
                <input
                  type="number"
                  value={otroPrecio}
                  onChange={(e) => setOtroPrecio(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full bg-[#1C1C1C] border border-[#C9A227] border-opacity-40 rounded-lg px-3 py-2 text-[#EAEAEA] placeholder-[#666] focus:outline-none focus:border-opacity-100 focus:ring-2 focus:ring-[#C9A227] focus:ring-opacity-20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[#EAEAEA] text-sm font-bold mb-2">Cantidad</label>
                <input
                  type="number"
                  value={otroCantidad}
                  onChange={(e) => setOtroCantidad(e.target.value)}
                  placeholder="1"
                  min="1"
                  className="w-full bg-[#1C1C1C] border border-[#C9A227] border-opacity-40 rounded-lg px-3 py-2 text-[#EAEAEA] placeholder-[#666] focus:outline-none focus:border-opacity-100 focus:ring-2 focus:ring-[#C9A227] focus:ring-opacity-20 transition-all"
                />
              </div>
            </div>

            <div className="bg-[#1C1C1C] rounded-lg p-3 border border-[#C9A227] border-opacity-20">
              <p className="text-xs text-[#999] mb-1">💰 Subtotal:</p>
              <p className="text-2xl font-bold text-[#C9A227]">
                S/ {(parseFloat(otroPrecio || "0") * parseInt(otroCantidad || "1")).toFixed(2)}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={agregarProductoOtro}
                className="flex-1 bg-gradient-to-r from-[#C9A227] to-[#a88820] hover:from-[#a88820] hover:to-[#8B7B1F] text-[#1C1C1C] font-bold py-2.5 rounded-lg transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
              <Button
                onClick={() => setMostrarAgregarOtro(false)}
                className="flex-1 bg-[#1C1C1C] hover:bg-[#2F2F2F] border border-[#C9A227] border-opacity-40 text-[#EAEAEA] font-bold py-2.5 rounded-lg transition-all"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}