"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Package,
  ShoppingCart,
  DollarSign,
  LogOut,
  ChefHat,
  BarChart3,
  Drumstick,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  session: {
    nombre: string
    rol: string
  }
}

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(true)

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Error al logout:", error)
    }
    // Usar window.location para asegurar que se recarga la página
    window.location.href = "/login"
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      roles: ["Admin", "Mesero", "Cocinero", "Cajero"],
    },
    {
      title: "Usuarios",
      icon: Users,
      href: "/usuarios",
      roles: ["Admin"],
    },
    {
      title: "Mesas",
      icon: UtensilsCrossed,
      href: "/mesas",
      roles: ["Admin", "Mesero"],
    },
    {
      title: "Productos",
      icon: Package,
      href: "/productos",
      roles: ["Admin"],
    },
    {
      title: "Insumos",
      icon: Package,
      href: "/insumos",
      roles: ["Admin"],
    },
    {
      title: "Pedidos",
      icon: ShoppingCart,
      href: "/pedidos",
      roles: ["Admin", "Mesero", "Cajero"],
    },
    {
      title: "Cocina",
      icon: ChefHat,
      href: "/cocina",
      roles: ["Admin", "Cocinero"],
    },
    {
      title: "Pagos",
      icon: DollarSign,
      href: "/pagos",
      roles: ["Admin", "Cajero"],
    },
    {
      title: "Registros",
      icon: BarChart3,
      href: "/registros",
      roles: ["Admin", "Cajero"],
    },
    {
      title: "Finanzas",
      icon: DollarSign,
      href: "/finanzas",
      roles: ["Admin", "Cajero"],
    },
    {
      title: "Inventario de Pollos",
      icon: Drumstick,
      href: "/inventario-pollos",
      roles: ["Admin", "Mesero"],
    },
  ]

  const filteredMenu = menuItems.filter((item) => item.roles.includes(session.rol))

  return (
    <>
      {/* Sidebar Colapsable - Visible en md+ */}
      <aside 
        style={{ 
          width: isCollapsed ? '80px' : '256px',
          backgroundColor: '#2F2F2F', 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease'
        }}
        className="hidden md:flex bg-[#2F2F2F] min-h-screen flex-col"
      >
        {/* Header con botón para expandir/colapsar */}
        <div 
          style={{ 
            padding: isCollapsed ? '16px' : '24px', 
            borderBottom: '1px solid #C9A227',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          className="border-b border-[#C9A227]"
        >
          {!isCollapsed && (
            <div>
              <h1 
                style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#C9A227' 
                }}
                className="text-lg font-bold text-[#C9A227]"
              >
                Pollería
              </h1>
              <p 
                style={{ 
                  fontSize: '11px', 
                  color: '#EAEAEA', 
                  marginTop: '2px' 
                }}
                className="text-xs text-[#EAEAEA]"
              >
                {session.nombre}
              </p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#C9A227',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Menu */}
        <nav 
          style={{ 
            flex: 1, 
            padding: isCollapsed ? '8px' : '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
          className="flex-1 space-y-1"
        >
          {filteredMenu.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isCollapsed ? '0' : '12px',
                  padding: isCollapsed ? '12px 8px' : '10px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  backgroundColor: isActive ? '#C9A227' : 'transparent',
                  color: isActive ? '#1C1C1C' : '#EAEAEA',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  boxShadow: isActive ? '0 4px 12px rgba(201, 162, 39, 0.3)' : 'none',
                  transform: 'scale(1)'
                }}
                className={`flex items-center rounded-lg transition-all group ${
                  isActive ? "bg-[#C9A227] text-[#1C1C1C] shadow-lg" : "text-[#EAEAEA] hover:bg-[#3F3F3F] hover:shadow-md"
                }`}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#3F3F3F'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(201, 162, 39, 0.2)'
                    e.currentTarget.style.transform = 'scale(1.02)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'scale(1)'
                  }
                }}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon style={{ width: '18px', height: '18px', flexShrink: 0, transition: 'transform 0.3s ease' }} className="w-5 h-5 group-hover:scale-110" />
                {!isCollapsed && <span style={{ fontWeight: '500', fontSize: '13px' }} className="font-medium">{item.title}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer - Logout */}
        <div 
          style={{ 
            padding: isCollapsed ? '8px' : '12px', 
            borderTop: '1px solid #C9A227',
            display: 'flex',
            justifyContent: 'center'
          }}
          className="border-t border-[#C9A227]"
        >
          <button
            onClick={handleLogout}
            style={{
              width: isCollapsed ? 'auto' : '100%',
              backgroundColor: '#8B1C26',
              color: 'white',
              border: 'none',
              padding: isCollapsed ? '10px' : '10px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isCollapsed ? '0' : '8px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'none',
              transform: 'scale(1)'
            }}
            className="bg-[#8B1C26] text-white"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#6d1620'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 28, 38, 0.4)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#8B1C26'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            title={isCollapsed ? "Cerrar Sesión" : undefined}
          >
            <LogOut style={{ width: '16px', height: '16px', flexShrink: 0, transition: 'transform 0.3s ease' }} className="w-4 h-4 group-hover:scale-110" />
            {!isCollapsed && <span style={{ fontSize: '13px' }}>Cerrar</span>}
          </button>
        </div>
      </aside>

      {/* Sidebar Móvil - Drawer */}
      {/* En móvil mostraremos solo los iconos como una barra inferior o con hamburger menu */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#2F2F2F] border-t border-[#C9A227] flex justify-around items-center h-16">
        {filteredMenu.slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? '#C9A227' : '#EAEAEA',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                flex: 1,
                height: '100%',
                position: 'relative'
              }}
              className={isActive ? "text-[#C9A227]" : "text-[#EAEAEA] hover:text-[#C9A227]"}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.2)'
                if (!isActive) {
                  e.currentTarget.style.textShadow = '0 0 8px rgba(201, 162, 39, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.textShadow = 'none'
              }}
            >
              <Icon size={24} />
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#EAEAEA',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            flex: 1,
            height: '100%',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className="text-[#EAEAEA]"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#C9A227'
            e.currentTarget.style.transform = 'scale(1.2)'
            e.currentTarget.style.textShadow = '0 0 8px rgba(201, 162, 39, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#EAEAEA'
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.textShadow = 'none'
          }}
          title="Cerrar Sesión"
        >
          <LogOut size={24} />
        </button>
      </div>
    </>
  )
}
