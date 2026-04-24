"use client"

import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Minus, ChefHat, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface Inventario {
  id_inventario: number
  fecha: string
  pollos_totales: number
  pechos_disponibles: number
  piernas_disponibles: number
}

export default function InventarioPollosPage() {
  const [inventario, setInventario] = useState<Inventario | null>(null)
  const [loading, setLoading] = useState(true)
  const [nuevosPollos, setNuevosPollos] = useState("")
  const [descuento, setDescuento] = useState("")
  const [tipoDescuento, setTipoDescuento] = useState<"pecho" | "pierna">("pecho")
  const [procesando, setProcesando] = useState(false)

  useEffect(() => {
    fetchInventario()
    // Auto-refresh cada 5 segundos
    const interval = setInterval(fetchInventario, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchInventario = async () => {
    try {
      const res = await fetch("/api/inventario-pollos")
      if (res.ok) {
        const data = await res.json()
        setInventario(data)
      }
    } catch (error) {
      console.error("Error al cargar inventario:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleIngresarPollos = async () => {
    if (!nuevosPollos || parseInt(nuevosPollos) <= 0) {
      alert("Ingrese un número válido de pollos")
      return
    }

    setProcesando(true)
    try {
      const res = await fetch("/api/inventario-pollos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollos_totales: parseInt(nuevosPollos) }),
      })

      if (res.ok) {
        const data = await res.json()
        setInventario(data)
        setNuevosPollos("")
        alert(`✓ Se ingresaron ${nuevosPollos} pollos correctamente`)
      } else {
        const error = await res.json()
        alert(error.error || "Error al ingresar pollos")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al ingresar pollos")
    } finally {
      setProcesando(false)
    }
  }

  const handleDescuentoPresa = async () => {
    if (!descuento || parseInt(descuento) <= 0) {
      alert("Ingrese una cantidad válida")
      return
    }

    setProcesando(true)
    try {
      const res = await fetch("/api/inventario-pollos/descontar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_presa: tipoDescuento,
          cantidad: parseInt(descuento),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setInventario(data.inventario)
        setDescuento("")
        alert(`✓ Se descontaron ${descuento} ${tipoDescuento}s correctamente`)
      } else {
        const error = await res.json()
        alert(error.error || "Error al descontar presa")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al descontar presa")
    } finally {
      setProcesando(false)
    }
  }

  if (loading) {
    return (
      <ClientProtectedLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-[#C9A227] animate-spin" />
        </div>
      </ClientProtectedLayout>
    )
  }

  const pollosDisponibles = inventario
    ? Math.floor(Math.min(inventario.pechos_disponibles, inventario.piernas_disponibles) / 2)
    : 0
  const porcentajePechos = inventario ? (inventario.pechos_disponibles / (inventario.pollos_totales * 2)) * 100 : 0
  const porcentajePiernas = inventario ? (inventario.piernas_disponibles / (inventario.pollos_totales * 2)) * 100 : 0

  return (
    <ClientProtectedLayout>
      <div className="space-y-8">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#C9A227] to-[#a88820] rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white drop-shadow-lg">Inventario de Pollos</h1>
              <p className="text-white text-opacity-90 mt-1">Gestiona tu disponibilidad de presas</p>
            </div>
          </div>
        </div>

        {/* ALERTAS */}
        {pollosDisponibles === 0 && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 border-opacity-50 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-300">⚠️ Stock Bajo</p>
              <p className="text-red-200 text-sm mt-1">
                No hay pollos completos disponibles. Por favor ingresa más pollos.
              </p>
            </div>
          </div>
        )}

        {/* RESUMEN DE INVENTARIO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* POLLOS TOTALES */}
          <div className="bg-[#2F2F2F] rounded-2xl p-6 border border-[#C9A227] border-opacity-30 hover:border-opacity-100 transition-all shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#C9A227] text-sm font-semibold">POLLOS INGRESADOS</p>
                <p className="text-4xl font-black text-white mt-2">{inventario?.pollos_totales || 0}</p>
              </div>
              <div className="w-14 h-14 bg-[#C9A227] bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🐔</span>
              </div>
            </div>
          </div>

          {/* PECHOS */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 border border-blue-400 border-opacity-30 shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-semibold">PECHOS</p>
                  <p className="text-4xl font-black text-white mt-2">{inventario?.pechos_disponibles || 0}</p>
                </div>
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🍗</span>
                </div>
              </div>
              <div className="w-full bg-blue-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-300 h-full transition-all duration-500"
                  style={{ width: `${porcentajePechos}%` }}
                ></div>
              </div>
              <p className="text-blue-100 text-xs">{porcentajePechos.toFixed(1)}% de disponibilidad</p>
            </div>
          </div>

          {/* PIERNAS */}
          <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-6 border border-amber-400 border-opacity-30 shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-200 text-sm font-semibold">PIERNAS</p>
                  <p className="text-4xl font-black text-white mt-2">{inventario?.piernas_disponibles || 0}</p>
                </div>
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🦵</span>
                </div>
              </div>
              <div className="w-full bg-amber-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-300 h-full transition-all duration-500"
                  style={{ width: `${porcentajePiernas}%` }}
                ></div>
              </div>
              <p className="text-amber-100 text-xs">{porcentajePiernas.toFixed(1)}% de disponibilidad</p>
            </div>
          </div>
        </div>

        {/* POLLOS DISPONIBLES COMPLETOS */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 shadow-xl border border-green-400 border-opacity-30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm font-semibold">POLLOS COMPLETOS DISPONIBLES</p>
              <p className="text-5xl font-black text-white mt-2">{pollosDisponibles}</p>
              <p className="text-green-100 text-sm mt-2">
                ({pollosDisponibles * 2} pechos - {pollosDisponibles * 2} piernas)
              </p>
            </div>
            <div className="text-6xl">🐔</div>
          </div>
        </div>

        {/* FORMULARIOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* INGRESAR POLLOS */}
          <div className="bg-[#2F2F2F] rounded-2xl p-6 border border-[#C9A227] border-opacity-30 shadow-lg space-y-4">
            <h2 className="text-2xl font-bold text-[#EAEAEA] flex items-center gap-2">
              <Plus className="w-6 h-6 text-[#C9A227]" />
              Ingresar Pollos
            </h2>
            <p className="text-[#EAEAEA] text-opacity-70 text-sm">
              Ingresa cuántos pollos tienes disponibles para hoy. Cada pollo suma 2 pechos y 2 piernas.
            </p>
            <div className="space-y-3">
              <Input
                type="number"
                placeholder="Cantidad de pollos"
                value={nuevosPollos}
                onChange={(e) => setNuevosPollos(e.target.value)}
                disabled={procesando}
                className="bg-[#1C1C1C] border-[#C9A227] text-white placeholder:text-gray-500"
              />
              <Button
                onClick={handleIngresarPollos}
                disabled={procesando || !nuevosPollos}
                className="w-full bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] font-bold py-3"
              >
                {procesando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Ingresar Pollos
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* DESCONTAR PRESAS */}
          <div className="bg-[#2F2F2F] rounded-2xl p-6 border border-red-500 border-opacity-30 shadow-lg space-y-4">
            <h2 className="text-2xl font-bold text-[#EAEAEA] flex items-center gap-2">
              <Minus className="w-6 h-6 text-red-400" />
              Descontar Presas
            </h2>
            <p className="text-[#EAEAEA] text-opacity-70 text-sm">
              Descuenta presas del inventario cuando se prepara un pedido.
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTipoDescuento("pecho")}
                  className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                    tipoDescuento === "pecho"
                      ? "bg-blue-600 text-white"
                      : "bg-[#1C1C1C] text-[#EAEAEA] border border-blue-500 border-opacity-30"
                  }`}
                  disabled={procesando}
                >
                  🍗 Pechos
                </button>
                <button
                  onClick={() => setTipoDescuento("pierna")}
                  className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                    tipoDescuento === "pierna"
                      ? "bg-amber-600 text-white"
                      : "bg-[#1C1C1C] text-[#EAEAEA] border border-amber-500 border-opacity-30"
                  }`}
                  disabled={procesando}
                >
                  🦵 Piernas
                </button>
              </div>
              <Input
                type="number"
                placeholder="Cantidad a descontar"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
                disabled={procesando}
                className="bg-[#1C1C1C] border-red-500 border-opacity-50 text-white placeholder:text-gray-500"
              />
              <Button
                onClick={handleDescuentoPresa}
                disabled={procesando || !descuento}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
              >
                {procesando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Minus className="w-4 h-4 mr-2" />
                    Descontar {tipoDescuento === "pecho" ? "Pecho" : "Pierna"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* INFORMACIÓN */}
        <div className="bg-[#2F2F2F] rounded-2xl p-6 border border-[#C9A227] border-opacity-20 space-y-4">
          <h3 className="text-lg font-bold text-[#EAEAEA]">ℹ️ Cómo funciona</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#EAEAEA] text-opacity-80">
            <div>
              <p className="font-semibold text-[#C9A227] mb-2">1. Ingresar Pollos</p>
              <p>
                Cada mañana ingresa cuántos pollos tendrás disponibles. El sistema automáticamente calcula: 2 pechos + 2 piernas por pollo.
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#C9A227] mb-2">2. Vender Presas</p>
              <p>
                Cuando un cliente pide 1/4, 1/2 o pollo completo, el programa te pedirá especificar pechos o piernas y las descuenta.
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#C9A227] mb-2">3. Monitoreo</p>
              <p>
                Visualiza en tiempo real cuántas presas tienes disponibles y recibe alertas si el stock es bajo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ClientProtectedLayout>
  )
}
