"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { VentanillaDto } from '@/types/ventanilla'
import type { UsuarioDto } from '@/types/usuario'

/**
 * Contexto Global de Transacciones
 * 
 * Proporciona datos compartidos para todas las operaciones de transacciones:
 * - Ventanilla activa del usuario
 * - Casa de cambio actual
 * - Información del usuario operador
 */

interface TransaccionContextType {
  // Datos de sesión
  ventanillaActiva: VentanillaDto | null
  casaDeCambioId: number | null
  usuario: UsuarioDto | null
  
  // Estados de operación
  isVentanillaAbierta: boolean
  montoDisponible: Record<number, number> // monedaId -> monto
  
  // Acciones
  setVentanillaActiva: (ventanilla: VentanillaDto | null) => void
  actualizarMontoDisponible: (monedaId: number, monto: number) => void
  
  // Utilidades
  obtenerCasaDeCambioId: () => number
  obtenerVentanillaId: () => number
}

const TransaccionContext = createContext<TransaccionContextType | undefined>(undefined)

interface TransaccionProviderProps {
  children: ReactNode
}

/**
 * Proveedor del contexto de transacciones
 * Maneja el estado global necesario para operaciones de cambio
 */
export function TransaccionProvider({ children }: TransaccionProviderProps) {
  // Estados principales
  const [ventanillaActiva, setVentanillaActiva] = useState<VentanillaDto | null>(null)
  const [casaDeCambioId, setCasaDeCambioId] = useState<number | null>(1) // Inicializar con valor por defecto
  const [usuario, setUsuario] = useState<UsuarioDto | null>(null)
  const [montoDisponible, setMontoDisponible] = useState<Record<number, number>>({})

  // Estados derivados
  const isVentanillaAbierta = ventanillaActiva?.estado === 'ABIERTA'

  // Cargar datos iniciales
  useEffect(() => {
    // Verificar si hay parámetros en la URL para casa de cambio
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const casaParam = urlParams.get('casa')
      const ventanillaParam = urlParams.get('ventanilla')
      
      if (casaParam) {
        setCasaDeCambioId(Number(casaParam))
      }
      
      if (ventanillaParam) {
        // TODO: Cargar datos de la ventanilla desde la API
        setVentanillaActiva({
          id: Number(ventanillaParam),
          nombre: `Ventanilla ${ventanillaParam}`,
          estado: 'ABIERTA' as any
        } as VentanillaDto)
      }
    }
  }, [])

  // Acciones
  const actualizarMontoDisponible = (monedaId: number, monto: number) => {
    setMontoDisponible(prev => ({
      ...prev,
      [monedaId]: monto
    }))
  }

  // Utilidades
  const obtenerCasaDeCambioId = (): number => {
    // Retornar casa de cambio actual o valor por defecto
    return casaDeCambioId || 1
  }

  const obtenerVentanillaId = (): number => {
    // Retornar ventanilla activa o valor por defecto
    return ventanillaActiva?.id || 1
  }

  const contextValue: TransaccionContextType = {
    // Datos de sesión
    ventanillaActiva,
    casaDeCambioId,
    usuario,
    
    // Estados de operación
    isVentanillaAbierta,
    montoDisponible,
    
    // Acciones
    setVentanillaActiva,
    actualizarMontoDisponible,
    
    // Utilidades
    obtenerCasaDeCambioId,
    obtenerVentanillaId
  }

  return (
    <TransaccionContext.Provider value={contextValue}>
      {children}
    </TransaccionContext.Provider>
  )
}

/**
 * Hook para usar el contexto de transacciones
 * @returns Contexto de transacciones con validación
 * @throws Error si se usa fuera del proveedor
 */
export function useTransaccionContext() {
  const context = useContext(TransaccionContext)
  
  if (context === undefined) {
    throw new Error('useTransaccionContext debe usarse dentro de TransaccionProvider')
  }
  
  return context
}

/**
 * Hook para obtener la casa de cambio actual
 * @returns ID de la casa de cambio activa
 * @throws Error si no hay casa de cambio activa
 */
export function useCasaDeCambioActual() {
  const { obtenerCasaDeCambioId } = useTransaccionContext()
  return obtenerCasaDeCambioId()
}

/**
 * Hook para obtener la ventanilla actual
 * @returns ID de la ventanilla activa
 * @throws Error si no hay ventanilla activa
 */
export function useVentanillaActual() {
  const { obtenerVentanillaId } = useTransaccionContext()
  return obtenerVentanillaId()
}