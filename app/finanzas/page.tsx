"use client"
import { useState } from "react"
import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  FileText,
  Settings
} from "lucide-react"

// Importar componentes del módulo financiero
import { DashboardFinanciero } from "@/components/finanzas/dashboard-financiero"
import { GestionIngresos } from "@/components/finanzas/gestion-ingresos"
import { GestionGastos } from "@/components/finanzas/gestion-gastos"
import { GestionFacturas } from "@/components/finanzas/gestion-facturas"
import { Reportes } from "@/components/finanzas/reportes"

export default function FinanzasPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <ClientProtectedLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#EAEAEA] flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-[#C9A227]" />
              Finanzas
            </h1>
            <p className="text-[#C9A227] mt-1">Gestión integral de finanzas del negocio</p>
          </div>
        </div>

        {/* Tabs de Navegación */}
        <div className="bg-[#2F2F2F] rounded-lg border border-[#C9A227] border-opacity-20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-[#1C1C1C] border-b border-[#C9A227] border-opacity-20 rounded-none grid grid-cols-3 lg:grid-cols-5 p-0 h-auto">
              <TabsTrigger 
                value="dashboard"
                className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-[#C9A227] data-[state=active]:bg-transparent flex gap-2"
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="ingresos"
                className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-[#C9A227] data-[state=active]:bg-transparent flex gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Ingresos</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="gastos"
                className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-[#C9A227] data-[state=active]:bg-transparent flex gap-2"
              >
                <TrendingDown className="w-4 h-4" />
                <span className="hidden sm:inline">Gastos</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="facturas"
                className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-[#C9A227] data-[state=active]:bg-transparent flex gap-2"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Facturas</span>
              </TabsTrigger>

              <TabsTrigger 
                value="reportes"
                className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-[#C9A227] data-[state=active]:bg-transparent flex gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden lg:inline">Reportes</span>
              </TabsTrigger>
            </TabsList>

            {/* Contenido de Tabs */}
            <div className="p-6">
              <TabsContent value="dashboard" className="mt-0">
                <DashboardFinanciero />
              </TabsContent>

              <TabsContent value="ingresos" className="mt-0">
                <GestionIngresos />
              </TabsContent>

              <TabsContent value="gastos" className="mt-0">
                <GestionGastos />
              </TabsContent>

              <TabsContent value="facturas" className="mt-0">
                <GestionFacturas />
              </TabsContent>

              <TabsContent value="reportes" className="mt-0">
                <Reportes />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </ClientProtectedLayout>
  )
}
