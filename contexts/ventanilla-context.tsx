"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface VentanillaContextType {
  ventanillaActiva: {
    id: number
    casaDeCambioId: number
    nombre: string
    operador: string
    sesionApertura: string
    casaDeCambio: string
  } | null
  isVentanillaAbierta: boolean
  isSidebarCollapsed: boolean
  setVentanillaActiva: (ventanilla: VentanillaContextType['ventanillaActiva']) => void
  cerrarVentanilla: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

const VentanillaContext = createContext<VentanillaContextType | undefined>(undefined)

export function VentanillaProvider({ children }: { children: React.ReactNode }) {
  const [ventanillaActiva, setVentanillaActivaState] = useState<VentanillaContextType['ventanillaActiva']>(null)
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Cargar ventanilla activa desde localStorage al inicializar
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ventanillaActiva')
      if (saved) {
        const ventanilla = JSON.parse(saved)
        setVentanillaActivaState(ventanilla)
        setSidebarCollapsed(true)
      }
    } catch (error) {
      console.warn('Error cargando ventanilla activa:', error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  const setVentanillaActiva = (ventanilla: VentanillaContextType['ventanillaActiva']) => {
    setVentanillaActivaState(ventanilla)
    if (ventanilla) {
      setSidebarCollapsed(true)
      // Guardar en localStorage
      localStorage.setItem('ventanillaActiva', JSON.stringify(ventanilla))
    } else {
      localStorage.removeItem('ventanillaActiva')
    }
  }

  const cerrarVentanilla = () => {
    setVentanillaActivaState(null)
    setSidebarCollapsed(false)
    localStorage.removeItem('ventanillaActiva')
  }

  const isVentanillaAbierta = ventanillaActiva !== null

  // No renderizar hasta que se inicialice
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <VentanillaContext.Provider value={{
      ventanillaActiva,
      isVentanillaAbierta,
      isSidebarCollapsed,
      setVentanillaActiva,
      cerrarVentanilla,
      setSidebarCollapsed
    }}>
      {children}
    </VentanillaContext.Provider>
  )
}

export function useVentanilla() {
  const context = useContext(VentanillaContext)
  if (context === undefined) {
    throw new Error('useVentanilla must be used within a VentanillaProvider')
  }
  return context
}