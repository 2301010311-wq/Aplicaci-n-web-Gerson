"use client"

import { useEffect, useState } from "react"
import { MesaCard } from "./mesa-card"

// ==========================================
// INTERFACES
// ==========================================

/** Interfaz que representa una mesa */
interface Mesa {
  id: string                                     // ID único de la mesa
  numero: number                                 // Número visible
  capacidad: number                              // Capacidad de personas
  estado: "Libre" | "Ocupada" | "Reservada"     // Estado actual
}

/** Props del componente MesasGrid */
interface MesasGridProps {
  userRole?: string    // Rol del usuario (Admin, Mesero, etc) para permisos
}

export function MesasGrid({ userRole }: MesasGridProps) {
  // ==========================================
  // ESTADO LOCAL
  // ==========================================

  const [mesas, setMesas] = useState<Mesa[]>([])        // Lista de mesas disponibles
  const [loading, setLoading] = useState(true)          // Indica si se está cargando

  // ==========================================
  // EFECTOS
  // ==========================================

  // Cargar mesas cuando el componente se monta
  useEffect(() => {
    fetchMesas()
  }, [])

  // ==========================================
  // FUNCIONES
  // ==========================================

  /** 
   * Obtiene la lista de mesas desde la API
   * Filtra la mesa especial con número -1 (usada para delivery/para llevar)
   */
  const fetchMesas = async () => {
    try {
      const res = await fetch("/api/mesas")
      const data = await res.json()
      // Filtrar mesas, ocultando la mesa especial (-1)
      const mesasFiltradas = data.filter((m: Mesa) => m.numero !== -1)
      setMesas(mesasFiltradas)
    } catch (error) {
      console.error("Error cargando mesas:", error)
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  // Mientras se cargan las mesas
  if (loading) {
    return <div className="text-center text-[#EAEAEA] py-8">Cargando mesas...</div>
  }

  // Grid responsive: 1 columna mobile, 2 tablet, 3 desktop, 4 en pantalla grande
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Renderizar cada mesa como un MesaCard */}
      {mesas.map((mesa) => (
        <MesaCard 
          key={mesa.id} 
          mesa={mesa} 
          onUpdate={fetchMesas}                    // Callback para actualizar lista
          isAdmin={userRole === "Admin"}           // Mostrar botón eliminar si es admin
        />
      ))}
      
      {/* Mensaje cuando no hay mesas */}
      {mesas.length === 0 && (
        <div className="col-span-full text-center text-[#EAEAEA] py-8">No hay mesas registradas</div>
      )}
    </div>
  )
}

