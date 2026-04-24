"use client"

import React, { createContext, useState, useCallback, useContext } from "react"

export interface Alert {
  id: string
  type: "info" | "success" | "warning" | "error" | "alarm"
  message: string
  title?: string
  duration?: number
}

interface AlertContextType {
  alerts: Alert[]
  addAlert: (alert: Omit<Alert, "id">) => void
  removeAlert: (id: string) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([])

  const addAlert = useCallback((alert: Omit<Alert, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newAlert: Alert = { ...alert, id }

    setAlerts((prev) => [...prev, newAlert])

    // Auto-remover alerta según duración
    if (alert.duration !== 0) {
      setTimeout(() => {
        removeAlert(id)
      }, alert.duration || 4000)
    }
  }, [])

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }, [])

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  )
}

export function useAlerts() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error("useAlerts debe usarse dentro de AlertProvider")
  }
  return context
}
