"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Eye, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Pedido {
  id: string
  fecha: string
  mesa: {
    id: string
    numero: number
  }
  mesero: string
  estado: string
  total: number
  detalles: Array<{
    id: string
    producto: { id: string; nombre: string }
    cantidad: number
    precioUnitario: number
    subtotal: number
  }>
}

interface DatePickerState {
  isOpen: boolean
  currentMonth: Date
  selectedDate: string | null
}

export function RegistrosTable() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [filteredPedidos, setFilteredPedidos] = useState<Pedido[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fechaInicio, setFechaInicio] = useState(() => new Date().toISOString().split('T')[0])
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split('T')[0])
  const [pickerInicio, setPickerInicio] = useState<DatePickerState>({ isOpen: false, currentMonth: new Date(), selectedDate: null })
  const [pickerFin, setPickerFin] = useState<DatePickerState>({ isOpen: false, currentMonth: new Date(), selectedDate: null })
  const inicioRef = useRef<HTMLDivElement>(null)
  const finRef = useRef<HTMLDivElement>(null)

  // Ejecutar una sola vez al montar el componente
  useEffect(() => {
    fetchRegistros()
  }, [])

  // Manejar click fuera del picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inicioRef.current && !inicioRef.current.contains(e.target as Node)) {
        setPickerInicio(prev => ({ ...prev, isOpen: false }))
      }
      if (finRef.current && !finRef.current.contains(e.target as Node)) {
        setPickerFin(prev => ({ ...prev, isOpen: false }))
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Cargar registros cuando cambian las fechas (después del montaje inicial)
  useEffect(() => {
    fetchRegistros()
  }, [fechaInicio, fechaFin])

  // Filtrar cuando cambian los datos o los filtros
  useEffect(() => {
    filterPedidos()
  }, [search, fechaInicio, fechaFin, pedidos])

  const fetchRegistros = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/pedidos")
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }
      const data = await res.json()
      
      // El API devuelve { pedidos: [], totalPedidosDelDia, fecha } o un array directamente
      const pedidosData = Array.isArray(data) ? data : data.pedidos || []
      
      if (Array.isArray(pedidosData)) {
        console.log(`Total pedidos del API: ${pedidosData.length}`)
        console.log("Estados únicos:", [...new Set(pedidosData.map((p: any) => p.estado))])
        
        // Filtrar solo pedidos completados
        const pedidosCompletados = pedidosData.filter((p: Pedido) => 
          p.estado === "Completado" || 
          p.estado === "Pagado" || 
          p.estado === "Servido" || 
          p.estado === "Listo para recoger"
        )
        setPedidos(pedidosCompletados)
      } else {
        throw new Error("La respuesta no es un array válido")
      }
    } catch (error) {
      console.error("Error cargando registros:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }

  const filterPedidos = () => {
    let filtered = pedidos

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.mesa.numero.toString().includes(search) ||
          p.mesero.toLowerCase().includes(search.toLowerCase()) ||
          p.id.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (fechaInicio || fechaFin) {
      filtered = filtered.filter((p) => {
        const pedidoDate = new Date(p.fecha).toISOString().split('T')[0]
        
        if (fechaInicio && pedidoDate < fechaInicio) {
          return false
        }
        
        if (fechaFin && pedidoDate > fechaFin) {
          return false
        }
        
        return true
      })
    }

    setFilteredPedidos(filtered)
  }

  const calcularTotal = (pedido: Pedido) => {
    return pedido.detalles.reduce((sum, d) => sum + d.subtotal, 0)
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handleDateSelect = (day: number, isInicio: boolean) => {
    const date = new Date(isInicio ? pickerInicio.currentMonth : pickerFin.currentMonth)
    date.setDate(day)
    const dateString = date.toISOString().split('T')[0]
    
    if (isInicio) {
      setFechaInicio(dateString)
      setPickerInicio(prev => ({ ...prev, isOpen: false }))
    } else {
      setFechaFin(dateString)
      setPickerFin(prev => ({ ...prev, isOpen: false }))
    }
  }

  const handlePrevMonth = (isInicio: boolean) => {
    if (isInicio) {
      setPickerInicio(prev => ({
        ...prev,
        currentMonth: new Date(prev.currentMonth.getFullYear(), prev.currentMonth.getMonth() - 1)
      }))
    } else {
      setPickerFin(prev => ({
        ...prev,
        currentMonth: new Date(prev.currentMonth.getFullYear(), prev.currentMonth.getMonth() - 1)
      }))
    }
  }

  const handleNextMonth = (isInicio: boolean) => {
    if (isInicio) {
      setPickerInicio(prev => ({
        ...prev,
        currentMonth: new Date(prev.currentMonth.getFullYear(), prev.currentMonth.getMonth() + 1)
      }))
    } else {
      setPickerFin(prev => ({
        ...prev,
        currentMonth: new Date(prev.currentMonth.getFullYear(), prev.currentMonth.getMonth() + 1)
      }))
    }
  }

  const renderCalendar = (isInicio: boolean) => {
    const picker = isInicio ? pickerInicio : pickerFin
    const currentFecha = isInicio ? fechaInicio : fechaFin
    const daysInMonth = getDaysInMonth(picker.currentMonth)
    const firstDay = getFirstDayOfMonth(picker.currentMonth)
    const days = []

    // Días vacíos antes del primer día del mes
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>)
    }

    // Días del mes
    const currentDate = new Date(currentFecha).toISOString().split('T')[0]
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(picker.currentMonth)
      date.setDate(day)
      const dateString = date.toISOString().split('T')[0]
      const isSelected = dateString === currentDate

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day, isInicio)}
          className={`h-8 rounded text-xs font-medium transition-colors ${
            isSelected
              ? "bg-[#C9A227] text-[#1C1C1C]"
              : "hover:bg-[#3F3F3F] text-[#EAEAEA]"
          }`}
        >
          {day}
        </button>
      )
    }

    return days
  }

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  const dayNames = ["D", "L", "M", "X", "J", "V", "S"]

  const totalIngresos = filteredPedidos.reduce((sum, p) => sum + calcularTotal(p), 0)

  if (loading) {
    return <div className="text-center text-[#EAEAEA] py-8">Cargando registros...</div>
  }

  if (error) {
    return <div className="text-center text-red-400 py-8">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-[#2F2F2F] p-4 md:p-6 rounded-lg space-y-4">
        <h2 className="text-base md:text-lg font-semibold text-[#EAEAEA]">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          <div className="flex items-center gap-2 bg-[#1C1C1C] p-2 rounded-lg">
            <Search className="w-4 md:w-5 h-4 md:h-5 text-[#C9A227] ml-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar mesa, mesero..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-xs md:text-sm text-[#EAEAEA] focus:outline-none flex-1"
            />
          </div>

          {/* Date Picker - Desde */}
          <div ref={inicioRef} className="relative">
            <label className="block text-[#C9A227] text-xs md:text-sm mb-2">Desde</label>
            <button
              onClick={() => setPickerInicio(prev => ({ ...prev, isOpen: !prev.isOpen, currentMonth: new Date(fechaInicio) }))}
              className="w-full bg-[#1C1C1C] border border-[#C9A227] text-[#EAEAEA] px-3 py-2 rounded text-xs md:text-sm flex items-center justify-between hover:bg-[#3F3F3F] transition-colors"
            >
              <span>{fechaInicio}</span>
              <Calendar className="w-4 h-4 text-[#C9A227]" />
            </button>
            
            {pickerInicio.isOpen && (
              <div className="absolute top-full left-0 z-50 mt-2 bg-[#2F2F2F] border border-[#C9A227] rounded-lg p-3 md:p-4 shadow-lg w-80 md:w-96">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => handlePrevMonth(true)} className="p-1 hover:bg-[#1C1C1C] rounded">
                    <ChevronLeft className="w-4 h-4 text-[#C9A227]" />
                  </button>
                  <span className="text-sm md:text-base font-semibold text-[#EAEAEA]">
                    {monthNames[pickerInicio.currentMonth.getMonth()]} {pickerInicio.currentMonth.getFullYear()}
                  </span>
                  <button onClick={() => handleNextMonth(true)} className="p-1 hover:bg-[#1C1C1C] rounded">
                    <ChevronRight className="w-4 h-4 text-[#C9A227]" />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {dayNames.map(day => (
                    <div key={day} className="h-8 flex items-center justify-center text-xs font-semibold text-[#C9A227]">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar(true)}
                </div>
              </div>
            )}
          </div>

          {/* Date Picker - Hasta */}
          <div ref={finRef} className="relative">
            <label className="block text-[#C9A227] text-xs md:text-sm mb-2">Hasta</label>
            <button
              onClick={() => setPickerFin(prev => ({ ...prev, isOpen: !prev.isOpen, currentMonth: new Date(fechaFin) }))}
              className="w-full bg-[#1C1C1C] border border-[#C9A227] text-[#EAEAEA] px-3 py-2 rounded text-xs md:text-sm flex items-center justify-between hover:bg-[#3F3F3F] transition-colors"
            >
              <span>{fechaFin}</span>
              <Calendar className="w-4 h-4 text-[#C9A227]" />
            </button>
            
            {pickerFin.isOpen && (
              <div className="absolute top-full right-0 z-50 mt-2 bg-[#2F2F2F] border border-[#C9A227] rounded-lg p-3 md:p-4 shadow-lg w-80 md:w-96">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => handlePrevMonth(false)} className="p-1 hover:bg-[#1C1C1C] rounded">
                    <ChevronLeft className="w-4 h-4 text-[#C9A227]" />
                  </button>
                  <span className="text-sm md:text-base font-semibold text-[#EAEAEA]">
                    {monthNames[pickerFin.currentMonth.getMonth()]} {pickerFin.currentMonth.getFullYear()}
                  </span>
                  <button onClick={() => handleNextMonth(false)} className="p-1 hover:bg-[#1C1C1C] rounded">
                    <ChevronRight className="w-4 h-4 text-[#C9A227]" />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {dayNames.map(day => (
                    <div key={day} className="h-8 flex items-center justify-center text-xs font-semibold text-[#C9A227]">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar(false)}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-end gap-2">
            <Button
              onClick={() => {
                setSearch("")
                const today = new Date().toISOString().split('T')[0]
                setFechaInicio(today)
                setFechaFin(today)
                setPickerInicio(prev => ({ ...prev, isOpen: false }))
                setPickerFin(prev => ({ ...prev, isOpen: false }))
              }}
              className="w-full text-xs md:text-sm px-3 md:px-4 py-2 bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C]"
            >
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-[#2F2F2F] p-3 md:p-4 rounded-lg border border-[#C9A227]">
          <p className="text-[#C9A227] text-xs md:text-sm">Pedidos Registrados</p>
          <p className="text-2xl md:text-3xl font-bold text-[#EAEAEA] mt-2">{filteredPedidos.length}</p>
        </div>
        <div className="bg-[#2F2F2F] p-3 md:p-4 rounded-lg border border-[#C9A227]">
          <p className="text-[#C9A227] text-xs md:text-sm">Ingresos Totales</p>
          <p className="text-2xl md:text-3xl font-bold text-green-400 mt-2">S/ {totalIngresos.toFixed(2)}</p>
        </div>
        <div className="bg-[#2F2F2F] p-3 md:p-4 rounded-lg border border-[#C9A227]">
          <p className="text-[#C9A227] text-xs md:text-sm">Promedio por Pedido</p>
          <p className="text-2xl md:text-3xl font-bold text-[#EAEAEA] mt-2">
            S/ {filteredPedidos.length > 0 ? (totalIngresos / filteredPedidos.length).toFixed(2) : "0.00"}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[#2F2F2F] rounded-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1C1C1C] sticky top-0">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[#C9A227] font-semibold text-xs md:text-sm">ID</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[#C9A227] font-semibold text-xs md:text-sm">Fecha</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[#C9A227] font-semibold text-xs md:text-sm">Mesa</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[#C9A227] font-semibold text-xs md:text-sm">Mesero</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[#C9A227] font-semibold text-xs md:text-sm">Productos</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[#C9A227] font-semibold text-xs md:text-sm">Total</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[#C9A227] font-semibold text-xs md:text-sm">Estado</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[#C9A227] font-semibold text-xs md:text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {filteredPedidos.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-[#1C1C1C] transition-colors">
                  <td className="px-4 md:px-6 py-3 md:py-4 text-[#EAEAEA] font-mono text-xs md:text-sm">{pedido.id.slice(0, 8)}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-[#EAEAEA] text-xs md:text-sm">{new Date(pedido.fecha).toLocaleString()}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-[#EAEAEA] font-semibold text-xs md:text-sm">
                    {pedido.mesa.numero === -1 ? "Delivery" : pedido.mesa.numero === -2 ? "Para Llevar" : `Mesa ${pedido.mesa.numero}`}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-[#EAEAEA] text-xs md:text-sm">{pedido.mesero}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-[#EAEAEA]">
                    <div className="space-y-1">
                      {pedido.detalles.slice(0, 2).map((d, i) => (
                        <div key={i} className="text-xs md:text-sm">
                          {d.cantidad}x {d.producto.nombre}
                        </div>
                      ))}
                      {pedido.detalles.length > 2 && (
                        <div className="text-xs md:text-sm text-[#C9A227]">+{pedido.detalles.length - 2} más</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-[#EAEAEA] font-bold text-xs md:text-sm">
                    S/ {calcularTotal(pedido).toFixed(2)}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                      pedido.estado === "Pagado"
                        ? "bg-green-500 bg-opacity-20 text-green-400"
                        : "bg-blue-500 bg-opacity-20 text-blue-400"
                    }`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <Link href={`/pedidos/${pedido.id}`}>
                      <Button size="sm" className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] text-xs">
                        <Eye className="w-3 md:w-4 h-3 md:h-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3 p-3">
          {filteredPedidos.map((pedido) => (
            <div key={pedido.id} className="bg-[#1C1C1C] p-3 rounded-lg border border-[#C9A227] space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[#C9A227] font-semibold text-xs">ID: {pedido.id.slice(0, 8)}</p>
                  <p className="text-[#EAEAEA] text-xs mt-1">{new Date(pedido.fecha).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  pedido.estado === "Pagado"
                    ? "bg-green-500 bg-opacity-20 text-green-400"
                    : "bg-blue-500 bg-opacity-20 text-blue-400"
                }`}>
                  {pedido.estado}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[#C9A227]">Mesa</p>
                  <p className="text-[#EAEAEA] font-semibold">
                    {pedido.mesa.numero === -1 ? "Delivery" : pedido.mesa.numero === -2 ? "P. Llevar" : `M${pedido.mesa.numero}`}
                  </p>
                </div>
                <div>
                  <p className="text-[#C9A227]">Mesero</p>
                  <p className="text-[#EAEAEA] font-semibold">{pedido.mesero}</p>
                </div>
              </div>

              <div>
                <p className="text-[#C9A227] text-xs">Productos</p>
                <div className="space-y-1 mt-1">
                  {pedido.detalles.slice(0, 2).map((d, i) => (
                    <p key={i} className="text-[#EAEAEA] text-xs">
                      {d.cantidad}x {d.producto.nombre}
                    </p>
                  ))}
                  {pedido.detalles.length > 2 && (
                    <p className="text-[#C9A227] text-xs">+{pedido.detalles.length - 2} más</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#3F3F3F]">
                <div>
                  <p className="text-[#C9A227] text-xs">Total</p>
                  <p className="text-[#EAEAEA] font-bold text-sm">S/ {calcularTotal(pedido).toFixed(2)}</p>
                </div>
                <Link href={`/pedidos/${pedido.id}`}>
                  <Button size="sm" className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] text-xs px-2 py-1">
                    <Eye className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredPedidos.length === 0 && (
          <div className="text-center text-[#EAEAEA] py-8 text-xs md:text-sm px-4">
            <p>No se encontraron registros</p>
            {pedidos.length > 0 && (
              <p className="text-xs text-[#999] mt-2">
                Tienes {pedidos.length} pedido(s) en el sistema, pero no coinciden con los filtros aplicados
              </p>
            )}
            {pedidos.length === 0 && (
              <p className="text-xs text-[#999] mt-2">
                No hay pedidos completados o servidos en el rango de fechas seleccionado
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
