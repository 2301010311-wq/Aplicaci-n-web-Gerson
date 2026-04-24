"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Download, Trash2, AlertTriangle, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

interface Gasto {
  id_gasto: number
  fecha_gasto: string
  monto: number
  categoria: string
  proveedor: string | null
  descripcion: string
  comprobante: string | null
  metodo_pago: string
  estado: string
}

interface DatePickerState {
  isOpen: boolean
  currentMonth: Date
}

export function GestionGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [filtrados, setFiltrados] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("TODOS")
  const [filtroFecha, setFiltroFecha] = useState({ inicio: "", fin: "" })
  const [pickerInicio, setPickerInicio] = useState<DatePickerState>({ isOpen: false, currentMonth: new Date() })
  const [pickerFin, setPickerFin] = useState<DatePickerState>({ isOpen: false, currentMonth: new Date() })
  const inicioRef = useRef<HTMLDivElement>(null)
  const finRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    monto: "",
    descripcion: "",
    categoria: "Suministros",
    proveedor: "",
    metodo_pago: "Efectivo",
    comprobante: "",
  })

  useEffect(() => {
    cargarGastos()
  }, [])

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

  useEffect(() => {
    filtrarGastos()
  }, [gastos, searchTerm, filtroCategoria, filtroFecha])

  const cargarGastos = async () => {
    try {
      const res = await fetch("/api/finanzas/gastos")
      if (res.ok) {
        const data = await res.json()
        setGastos(data)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const filtrarGastos = () => {
    let resultado = gastos

    if (searchTerm) {
      resultado = resultado.filter(
        (g) =>
          g.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          g.proveedor?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filtroCategoria !== "TODOS") {
      resultado = resultado.filter((g) => g.categoria === filtroCategoria)
    }

    if (filtroFecha.inicio) {
      resultado = resultado.filter(
        (g) => new Date(g.fecha_gasto) >= new Date(filtroFecha.inicio)
      )
    }

    if (filtroFecha.fin) {
      resultado = resultado.filter(
        (g) => new Date(g.fecha_gasto) <= new Date(filtroFecha.fin)
      )
    }

    setFiltrados(resultado)
  }

  const agregarGasto = async () => {
    if (!formData.monto || !formData.descripcion) {
      alert("Completa los campos requeridos")
      return
    }

    try {
      const res = await fetch("/api/finanzas/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monto: parseFloat(formData.monto),
          descripcion: formData.descripcion,
          categoria: formData.categoria,
          proveedor: formData.proveedor || null,
          metodo_pago: formData.metodo_pago,
          comprobante: formData.comprobante || null,
        }),
      })

      if (res.ok) {
        setFormData({
          monto: "",
          descripcion: "",
          categoria: "Suministros",
          proveedor: "",
          metodo_pago: "Efectivo",
          comprobante: "",
        })
        setDialogOpen(false)
        cargarGastos()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const eliminarGasto = async (id: number) => {
    if (!confirm("¿Eliminar este gasto?")) return

    try {
      const res = await fetch(`/api/finanzas/gastos/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        cargarGastos()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const total = filtrados.reduce((sum, g) => sum + g.monto, 0)
  const gastoAlto = filtrados.some((g) => g.monto > 5000)

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
      setFiltroFecha({ ...filtroFecha, inicio: dateString })
      setPickerInicio(prev => ({ ...prev, isOpen: false }))
    } else {
      setFiltroFecha({ ...filtroFecha, fin: dateString })
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
    const currentFecha = isInicio ? filtroFecha.inicio : filtroFecha.fin
    const daysInMonth = getDaysInMonth(picker.currentMonth)
    const firstDay = getFirstDayOfMonth(picker.currentMonth)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>)
    }

    const currentDate = currentFecha ? new Date(currentFecha).toISOString().split('T')[0] : null
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

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#2F2F2F] border-[#C9A227]">
              <DialogHeader>
                <DialogTitle className="text-[#EAEAEA]">Registrar Nuevo Gasto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-[#EAEAEA]">Monto *</Label>
                  <Input
                    type="number"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label className="text-[#EAEAEA]">Descripción *</Label>
                  <Input
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
                  />
                </div>

                <div>
                  <Label className="text-[#EAEAEA]">Categoría</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2F2F2F] border-[#C9A227]">
                      <SelectItem value="Suministros" className="text-[#EAEAEA]">Suministros</SelectItem>
                      <SelectItem value="Servicios" className="text-[#EAEAEA]">Servicios</SelectItem>
                      <SelectItem value="Mantenimiento" className="text-[#EAEAEA]">Mantenimiento</SelectItem>
                      <SelectItem value="Otros" className="text-[#EAEAEA]">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[#EAEAEA]">Proveedor</Label>
                  <Input
                    value={formData.proveedor}
                    onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                    className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
                  />
                </div>

                <div>
                  <Label className="text-[#EAEAEA]">Método de Pago</Label>
                  <Select value={formData.metodo_pago} onValueChange={(value) => setFormData({ ...formData, metodo_pago: value })}>
                    <SelectTrigger className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2F2F2F] border-[#C9A227]">
                      <SelectItem value="Efectivo" className="text-[#EAEAEA]">Efectivo</SelectItem>
                      <SelectItem value="Tarjeta" className="text-[#EAEAEA]">Tarjeta</SelectItem>
                      <SelectItem value="Transferencia" className="text-[#EAEAEA]">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={agregarGasto}
                  className="w-full bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C]"
                >
                  Guardar Gasto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alerta de gastos altos */}
      {gastoAlto && (
        <Card className="bg-red-500 bg-opacity-10 border-red-500 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">⚠️ Se detectaron gastos superiores a S/ 5,000</p>
        </Card>
      )}

      {/* Filtros */}
      <Card className="bg-[#2F2F2F] border-[#C9A227] border-opacity-20 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          <div>
            <Label className="text-[#EAEAEA] text-xs md:text-sm">Buscar</Label>
            <div className="flex items-center gap-2 bg-[#1C1C1C] rounded p-2">
              <Search className="w-4 h-4 text-[#C9A227] flex-shrink-0" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Descripción o proveedor..."
                className="bg-transparent border-none text-xs md:text-sm text-[#EAEAEA] focus-visible:ring-0"
              />
            </div>
          </div>

          <div>
            <Label className="text-[#EAEAEA] text-xs md:text-sm">Categoría</Label>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA] text-xs md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2F2F2F] border-[#C9A227]">
                <SelectItem value="TODOS" className="text-[#EAEAEA]">Todas</SelectItem>
                <SelectItem value="Suministros" className="text-[#EAEAEA]">Suministros</SelectItem>
                <SelectItem value="Servicios" className="text-[#EAEAEA]">Servicios</SelectItem>
                <SelectItem value="Mantenimiento" className="text-[#EAEAEA]">Mantenimiento</SelectItem>
                <SelectItem value="Otros" className="text-[#EAEAEA]">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Picker - Desde */}
          <div ref={inicioRef} className="relative">
            <Label className="text-[#EAEAEA] text-xs md:text-sm">Desde</Label>
            <button
              onClick={() => setPickerInicio(prev => ({ ...prev, isOpen: !prev.isOpen, currentMonth: filtroFecha.inicio ? new Date(filtroFecha.inicio) : new Date() }))}
              className="w-full bg-[#1C1C1C] border border-[#C9A227] text-[#EAEAEA] px-3 py-2 rounded text-xs md:text-sm flex items-center justify-between hover:bg-[#3F3F3F] transition-colors"
            >
              <span>{filtroFecha.inicio || "Seleccionar"}</span>
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
            <Label className="text-[#EAEAEA] text-xs md:text-sm">Hasta</Label>
            <button
              onClick={() => setPickerFin(prev => ({ ...prev, isOpen: !prev.isOpen, currentMonth: filtroFecha.fin ? new Date(filtroFecha.fin) : new Date() }))}
              className="w-full bg-[#1C1C1C] border border-[#C9A227] text-[#EAEAEA] px-3 py-2 rounded text-xs md:text-sm flex items-center justify-between hover:bg-[#3F3F3F] transition-colors"
            >
              <span>{filtroFecha.fin || "Seleccionar"}</span>
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
        </div>
      </Card>

      {/* Tabla de Gastos */}
      <Card className="bg-[#2F2F2F] border-[#C9A227] border-opacity-20 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1C1C1C]">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[#C9A227] font-semibold text-xs md:text-sm">Fecha</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[#C9A227] font-semibold text-xs md:text-sm">Monto</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[#C9A227] font-semibold text-xs md:text-sm">Descripción</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[#C9A227] font-semibold text-xs md:text-sm">Categoría</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[#C9A227] font-semibold text-xs md:text-sm">Proveedor</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[#C9A227] font-semibold text-xs md:text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {filtrados.map((gasto) => (
                <tr key={gasto.id_gasto} className="hover:bg-[#1C1C1C]">
                  <td className="px-4 md:px-6 py-3 md:py-4 text-[#EAEAEA] text-xs md:text-sm">
                    {new Date(gasto.fecha_gasto).toLocaleDateString()}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-red-400 font-semibold text-xs md:text-sm">
                    -S/ {gasto.monto.toFixed(2)}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-[#EAEAEA] text-xs md:text-sm">{gasto.descripcion}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-[#EAEAEA] text-xs md:text-sm">{gasto.categoria}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-[#EAEAEA] text-xs md:text-sm">{gasto.proveedor || "-"}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <Button
                      onClick={() => eliminarGasto(gasto.id_gasto)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 text-xs"
                    >
                      <Trash2 className="w-3 md:w-4 h-3 md:h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3 p-3">
          {filtrados.map((gasto) => (
            <div key={gasto.id_gasto} className="bg-[#1C1C1C] p-3 rounded-lg border border-[#C9A227] space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[#C9A227] font-semibold text-xs">Fecha: {new Date(gasto.fecha_gasto).toLocaleDateString()}</p>
                  <p className="text-red-400 font-bold text-sm mt-1">-S/ {gasto.monto.toFixed(2)}</p>
                </div>
                <Button
                  onClick={() => eliminarGasto(gasto.id_gasto)}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 text-xs p-1"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="space-y-1 text-xs">
                <p className="text-[#EAEAEA]"><span className="text-[#C9A227]">Desc:</span> {gasto.descripcion}</p>
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-[#EAEAEA]"><span className="text-[#C9A227]">Cat:</span> {gasto.categoria}</p>
                  <p className="text-[#EAEAEA]"><span className="text-[#C9A227]">Pago:</span> {gasto.metodo_pago}</p>
                </div>
                {gasto.proveedor && <p className="text-[#EAEAEA]"><span className="text-[#C9A227]">Prov:</span> {gasto.proveedor}</p>}
              </div>
            </div>
          ))}
        </div>

        {filtrados.length === 0 && (
          <div className="text-center text-[#EAEAEA] py-8 text-xs md:text-sm">No hay gastos registrados</div>
        )}

        {filtrados.length > 0 && (
          <div className="bg-[#1C1C1C] px-4 md:px-6 py-3 md:py-4 border-t border-[#C9A227] border-opacity-20">
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-[#C9A227] text-xs md:text-sm">Total Gastos</p>
                <p className="text-red-400 text-xl md:text-2xl font-bold">-S/ {total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
