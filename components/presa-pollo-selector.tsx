"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Drumstick, Minus, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PresasPolloSelectorProps {
  onSelectionChange?: (pechos: number, piernas: number) => void
  onDescontarClick?: () => Promise<void>
  maxPechos?: number
  maxPiernas?: number
  autoDescontar?: boolean
}

interface Inventario {
  pechos_disponibles: number
  piernas_disponibles: number
}

export function PreasPolloSelector({
  onSelectionChange,
  onDescontarClick,
  maxPechos = 10,
  maxPiernas = 10,
  autoDescontar = false,
}: PresasPolloSelectorProps) {
  const [pechos, setPechos] = useState(0)
  const [piernas, setPiernas] = useState(0)
  const [inventario, setInventario] = useState<Inventario | null>(null)
  const [loading, setLoading] = useState(true)
  const [descontando, setDescontando] = useState(false)

  useEffect(() => {
    fetchInventario()
  }, [])

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(pechos, piernas)
    }
  }, [pechos, piernas])

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

  const incrementPechos = () => {
    if (inventario && pechos < Math.min(maxPechos, inventario.pechos_disponibles)) {
      setPechos(pechos + 1)
    }
  }

  const decrementPechos = () => {
    if (pechos > 0) {
      setPechos(pechos - 1)
    }
  }

  const incrementPiernas = () => {
    if (inventario && piernas < Math.min(maxPiernas, inventario.piernas_disponibles)) {
      setPiernas(piernas + 1)
    }
  }

  const decrementPiernas = () => {
    if (piernas > 0) {
      setPiernas(piernas - 1)
    }
  }

  const handleDescontar = async () => {
    if (pechos === 0 && piernas === 0) {
      alert("Selecciona al menos una presa")
      return
    }

    setDescontando(true)
    try {
      let errores = []

      if (pechos > 0) {
        const res1 = await fetch("/api/inventario-pollos/descontar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo_presa: "pecho", cantidad: pechos }),
        })

        if (!res1.ok) {
          const error = await res1.json()
          errores.push(error.error)
        }
      }

      if (piernas > 0) {
        const res2 = await fetch("/api/inventario-pollos/descontar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo_presa: "pierna", cantidad: piernas }),
        })

        if (!res2.ok) {
          const error = await res2.json()
          errores.push(error.error)
        }
      }

      if (errores.length > 0) {
        alert(`Errores: ${errores.join(", ")}`)
        fetchInventario()
        return
      }

      alert(`✓ Descuento realizado: ${pechos} pecho(s) y ${piernas} pierna(s)`)
      setPechos(0)
      setPiernas(0)
      fetchInventario()

      if (onDescontarClick) {
        await onDescontarClick()
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al descontar presas")
    } finally {
      setDescontando(false)
    }
  }

  if (loading) {
    return <div className="text-[#EAEAEA] text-sm">Cargando inventario...</div>
  }

  if (!inventario) {
    return (
      <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-3 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span className="text-red-300 text-sm">No hay inventario disponible</span>
      </div>
    )
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-bold text-[#EAEAEA] text-sm">
          Stock: <span className="text-[#C9A227] font-bold">{inventario.pechos_disponibles}🍗</span> | <span className="text-[#C9A227] font-bold">{inventario.piernas_disponibles}🦵</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* PECHOS */}
        <div>
          <label className="text-[#EAEAEA] font-semibold block mb-2 text-sm">🍗 Pechos</label>
          <div className="flex items-stretch gap-0 bg-[#1C1C1C] rounded-lg border border-[#C9A227] border-opacity-20 px-1.5 py-1">
            <Button
              onClick={decrementPechos}
              disabled={pechos === 0}
              type="button"
              className="p-0 h-auto w-8 bg-gradient-to-r from-[#C9A227] to-[#a88820] hover:from-[#a88820] hover:to-[#C9A227] text-[#1C1C1C] disabled:opacity-40 font-bold flex-shrink-0 flex items-center justify-center rounded-md"
              size="sm"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <input
              type="number"
              value={pechos}
              onChange={(e) => {
                const val = Math.max(0, Math.min(parseInt(e.target.value) || 0, Math.min(maxPechos, inventario.pechos_disponibles)))
                setPechos(val)
              }}
              className="flex-1 bg-[#2F2F2F] text-[#EAEAEA] text-center font-bold outline-none px-2 py-2 border-0 mx-1 rounded focus:ring-2 focus:ring-[#C9A227] focus:ring-opacity-50 transition-all"
            />
            <Button
              onClick={incrementPechos}
              disabled={pechos >= Math.min(maxPechos, inventario.pechos_disponibles)}
              type="button"
              className="p-0 h-auto w-8 bg-gradient-to-r from-[#C9A227] to-[#a88820] hover:from-[#a88820] hover:to-[#C9A227] text-[#1C1C1C] disabled:opacity-40 font-bold flex-shrink-0 flex items-center justify-center rounded-md"
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* PIERNAS */}
        <div>
          <label className="text-[#EAEAEA] font-semibold block mb-2 text-sm">🦵 Piernas</label>
          <div className="flex items-stretch gap-0 bg-[#1C1C1C] rounded-lg border border-[#C9A227] border-opacity-20 px-1.5 py-1">
            <Button
              onClick={decrementPiernas}
              disabled={piernas === 0}
              type="button"
              className="p-0 h-auto w-8 bg-gradient-to-r from-[#C9A227] to-[#a88820] hover:from-[#a88820] hover:to-[#C9A227] text-[#1C1C1C] disabled:opacity-40 font-bold flex-shrink-0 flex items-center justify-center rounded-md"
              size="sm"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <input
              type="number"
              value={piernas}
              onChange={(e) => {
                const val = Math.max(0, Math.min(parseInt(e.target.value) || 0, Math.min(maxPiernas, inventario.piernas_disponibles)))
                setPiernas(val)
              }}
              className="flex-1 bg-[#2F2F2F] text-[#EAEAEA] text-center font-bold outline-none px-2 py-2 border-0 mx-1 rounded focus:ring-2 focus:ring-[#C9A227] focus:ring-opacity-50 transition-all"
            />
            <Button
              onClick={incrementPiernas}
              disabled={piernas >= Math.min(maxPiernas, inventario.piernas_disponibles)}
              type="button"
              className="p-0 h-auto w-8 bg-gradient-to-r from-[#C9A227] to-[#a88820] hover:from-[#a88820] hover:to-[#C9A227] text-[#1C1C1C] disabled:opacity-40 font-bold flex-shrink-0 flex items-center justify-center rounded-md"
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* BOTÓN DESCONTAR */}
      <Button
        onClick={handleDescontar}
        disabled={descontando || (pechos === 0 && piernas === 0)}
        type="button"
        className="w-full bg-gradient-to-r from-[#C9A227] to-[#a88820] hover:from-[#a88820] hover:to-[#8B7B1F] text-[#1C1C1C] font-bold py-3 text-sm px-4 rounded-lg transition-all disabled:opacity-50"
      >
        {descontando ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
            Descontando...
          </>
        ) : (
          <>
            <Drumstick className="w-4 h-4 mr-2 inline" />
            Descontar
          </>
        )}
      </Button>

      {(pechos > 0 || piernas > 0) && (
        <div className="text-[#C9A227] font-bold text-center text-sm bg-gradient-to-r from-[#2F2F2F] to-[#1C1C1C] rounded-lg p-3 border border-[#C9A227] border-opacity-30">
          {pechos}🍗 + {piernas}🦵
        </div>
      )}
    </div>
  )
}
