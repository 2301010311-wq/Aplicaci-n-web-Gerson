"use client"
import { useState, useEffect } from "react"
import { ClientProtectedLayout } from "@/components/client-protected-layout"

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    pedidosActivos: 0,
    ventasHoy: 0,
    insumosVencer: 0,
    insumosBajoStock: 0,
    loading: true
  })
  useEffect(() => {
    // Simular datos del dashboard por ahora
    setTimeout(() => {
      setDashboardData({
        pedidosActivos: 5,
        ventasHoy: 1250.50,
        insumosVencer: 3,
        insumosBajoStock: 2,
        loading: false
      })
    }, 1000)
  }, [])

  if (dashboardData.loading) {
    return (
      <ClientProtectedLayout>
        <div className="text-center text-[#EAEAEA] py-8">Cargando dashboard...</div>
      </ClientProtectedLayout>
    )
  }

  return (
    <ClientProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#EAEAEA]">Dashboard</h1>
          <p className="text-[#C9A227] mt-1">
            Bienvenido al sistema de gestión
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#2F2F2F] p-6 rounded-lg border border-[#C9A227]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#EAEAEA] text-sm mb-1">Ventas del Dia</p>
                <p className="text-[#C9A227] text-2xl font-bold">
                  S/ {dashboardData.ventasHoy.toFixed(2)}
                </p>
              </div>
              <div className="text-3xl"></div>
            </div>
          </div>

          <div className="bg-[#2F2F2F] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#EAEAEA] text-sm mb-1">Pedidos Activos</p>
                <p className="text-[#C9A227] text-2xl font-bold">
                  {dashboardData.pedidosActivos}
                </p>
              </div>
              <div className="text-3xl"></div>
            </div>
          </div>

          <div className="bg-[#2F2F2F] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#EAEAEA] text-sm mb-1">Insumos por Vencer</p>
                <p className="text-[#C9A227] text-2xl font-bold">
                  {dashboardData.insumosVencer}
                </p>
              </div>
              <div className="text-3xl"></div>
            </div>
          </div>

          <div className="bg-[#2F2F2F] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#EAEAEA] text-sm mb-1">Insumos Bajo Stock</p>
                <p className="text-[#C9A227] text-2xl font-bold">
                  {dashboardData.insumosBajoStock}
                </p>
              </div>
              <div className="text-3xl"></div>
            </div>
          </div>
        </div>

        <div className="bg-[#2F2F2F] p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-[#EAEAEA] mb-4">Acciones Rapidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a 
              href="/pedidos/nuevo" 
              className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] p-4 rounded-lg text-center font-semibold transition-colors"
            >
               Nuevo Pedido
            </a>
            <a 
              href="/productos" 
              className="bg-[#1C1C1C] hover:bg-[#333] text-[#EAEAEA] p-4 rounded-lg text-center font-semibold border border-[#C9A227] transition-colors"
            >
               Ver Productos
            </a>
            <a 
              href="/mesas" 
              className="bg-[#1C1C1C] hover:bg-[#333] text-[#EAEAEA] p-4 rounded-lg text-center font-semibold border border-[#C9A227] transition-colors"
            >
               Ver Mesas
            </a>
            <a 
              href="/insumos" 
              className="bg-[#1C1C1C] hover:bg-[#333] text-[#EAEAEA] p-4 rounded-lg text-center font-semibold border border-[#C9A227] transition-colors"
            >
               Ver Insumos
            </a>
          </div>
        </div>
      </div>
    </ClientProtectedLayout>
  )
}
