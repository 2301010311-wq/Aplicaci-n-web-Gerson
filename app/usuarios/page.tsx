"use client"

// Importaciones necesarias para el componente
import { ClientProtectedLayout } from "@/components/client-protected-layout" // Layout protegido para clientes autenticados
import { UsuariosTable } from "@/components/usuarios-table" // Componente que muestra la tabla de usuarios
import { Button } from "@/components/ui/button" // Componente de botón reutilizable
import { Plus } from "lucide-react" // Icono de plus para el botón de nuevo usuario
import Link from "next/link" // Componente de Next.js para navegación

// Componente principal de la página de usuarios
export default function UsuariosPage() {
  return (
    // Layout protegido que asegura que solo usuarios autenticados puedan acceder
    <ClientProtectedLayout>
      {/* Contenedor principal con espaciado vertical */}
      <div className="space-y-6">
        {/* Sección del encabezado con título y botón de acción */}
        <div className="flex items-center justify-between">
          {/* Información del título y descripción */}
          <div>
            <h1 className="text-3xl font-bold text-[#EAEAEA]">Usuarios</h1>
            <p className="text-[#C9A227] mt-1">Gestión de empleados del sistema</p>
          </div>
          {/* Botón para crear un nuevo usuario, enlazado a la página de creación */}
          <Link href="/usuarios/nuevo">
            <Button className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </Link>
        </div>

        {/* Componente que renderiza la tabla con la lista de usuarios */}
        <UsuariosTable />
      </div>
    </ClientProtectedLayout>
  )
}
