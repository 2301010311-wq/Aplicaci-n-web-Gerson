"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ClientProtectedLayout } from "@/components/client-protected-layout"

type DashboardData = {
  pedidosActivos: number
  ventasHoy: number
  insumosVencer: number
  insumosBajoStock: number
  loading: boolean
  error: string | null
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    pedidosActivos: 0,
    ventasHoy: 0,
    insumosVencer: 0,
    insumosBajoStock: 0,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error || "Error al cargar dashboard")
        }

        setDashboardData({
          pedidosActivos: Number(data.pedidosActivos || 0),
          ventasHoy: Number(data.ventasHoy || 0),
          insumosVencer: Number(data.insumosVencer || 0),
          insumosBajoStock: Number(data.insumosBajoStock || 0),
          loading: false,
          error: null,
        })
      } catch (error) {
        setDashboardData((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : "Error al cargar dashboard",
        }))
      }
    }

    cargarDashboard()
  }, [])

  if (dashboardData.loading) {
    return (
      <ClientProtectedLayout>
        <div className="text-center text-[#EAEAEA] py-8">Cargando dashboard...</div>
      </ClientProtectedLayout>
    )
  }

  if (dashboardData.error) {
    return (
      <ClientProtectedLayout>
        <div className="text-center text-red-400 py-8">{dashboardData.error}</div>
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
            <Link
              href="/pedidos/nuevo"
              className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] p-4 rounded-lg text-center font-semibold transition-colors"
            >
               Nuevo Pedido
            </Link>
            <Link
              href="/productos"
              className="bg-[#1C1C1C] hover:bg-[#333] text-[#EAEAEA] p-4 rounded-lg text-center font-semibold border border-[#C9A227] transition-colors"
            >
               Ver Productos
            </Link>
            <Link
              href="/mesas"
              className="bg-[#1C1C1C] hover:bg-[#333] text-[#EAEAEA] p-4 rounded-lg text-center font-semibold border border-[#C9A227] transition-colors"
            >
               Ver Mesas
            </Link>
            <Link
              href="/insumos"
              className="bg-[#1C1C1C] hover:bg-[#333] text-[#EAEAEA] p-4 rounded-lg text-center font-semibold border border-[#C9A227] transition-colors"
            >
               Ver Insumos
            </Link>
          </div>
        </div>
      </div>
    </ClientProtectedLayout>
  )
}
