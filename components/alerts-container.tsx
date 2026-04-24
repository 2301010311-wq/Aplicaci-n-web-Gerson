"use client"

import { useAlerts } from "@/contexts/alert-context"
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react"

export function AlertsContainer() {
  const { alerts, removeAlert } = useAlerts()

  const getAlertStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500 bg-opacity-20 border-green-500 text-green-300"
      case "error":
        return "bg-red-500 bg-opacity-20 border-red-500 text-red-300"
      case "warning":
        return "bg-yellow-500 bg-opacity-20 border-yellow-500 text-yellow-300"
      case "alarm":
        return "bg-red-600 bg-opacity-30 border-red-600 text-red-200 animate-pulse"
      default:
        return "bg-blue-500 bg-opacity-20 border-blue-500 text-blue-300"
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />
      case "error":
      case "alarm":
        return <AlertCircle className="w-5 h-5" />
      case "warning":
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-start gap-3 p-4 rounded-lg border border-opacity-50 shadow-lg animate-in slide-in-from-right ${getAlertStyles(
            alert.type
          )}`}
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(alert.type)}</div>
          <div className="flex-1">
            {alert.title && (
              <h3 className="font-bold text-sm mb-1">{alert.title}</h3>
            )}
            <p className="text-sm">{alert.message}</p>
          </div>
          <button
            onClick={() => removeAlert(alert.id)}
            className="flex-shrink-0 mt-0.5 hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
