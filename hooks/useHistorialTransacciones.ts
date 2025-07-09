"use client"

import { useState, useCallback, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { transaccionService } from '@/services/transaccion-service'
import type { TransaccionDto, FiltrosTransaccion } from '@/types/transaccion'

/**
 * Hook para Historial de Transacciones
 * 
 * Maneja la carga y visualización del historial de transacciones:
 * - Transacciones recientes para operaciones rápidas
 * - Filtrado y paginación de transacciones
 * - Actualización automática después de nuevas transacciones
 */

interface UseHistorialTransaccionesOptions {
  limite?: number
  ventanillaId?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useHistorialTransacciones(options: UseHistorialTransaccionesOptions = {}) {
  const {
    limite = 10,
    ventanillaId,
    autoRefresh = false,
    refreshInterval = 30000 // 30 segundos
  } = options

  // Estados
  const [transacciones, setTransacciones] = useState<TransaccionDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null)

  const { toast } = useToast()

  /**
   * Carga las transacciones recientes
   */
  const cargarTransacciones = useCallback(async (filtros?: FiltrosTransaccion) => {
    try {
      setIsLoading(true)
      setError(null)

      const filtrosCompletos: FiltrosTransaccion = {
        limit: limite,
        ordenar: 'fecha_desc',
        ventanillaId,
        ...filtros
      }

      const response = await transaccionService.obtenerTodas(filtrosCompletos)
      
      if (response.data) {
        setTransacciones(response.data)
        setUltimaActualizacion(new Date())
      }
    } catch (error) {
      const mensaje = 'No se pudieron cargar las transacciones'
      setError(mensaje)
      toast({
        title: "Error",
        description: mensaje,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [limite, ventanillaId, toast])

  /**
   * Recarga las transacciones (para usar después de procesar nuevas)
   */
  const recargarTransacciones = useCallback(() => {
    return cargarTransacciones()
  }, [cargarTransacciones])

  /**
   * Busca transacciones por filtros específicos
   */
  const buscarTransacciones = useCallback(async (filtros: FiltrosTransaccion) => {
    return cargarTransacciones(filtros)
  }, [cargarTransacciones])

  /**
   * Obtiene una transacción específica por ID
   */
  const obtenerTransaccion = useCallback(async (id: number) => {
    try {
      const response = await transaccionService.obtenerPorId(id)
      return response.data
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo obtener la transacción",
        variant: "destructive",
      })
      return null
    }
  }, [toast])

  /**
   * Cancela una transacción
   */
  const cancelarTransaccion = useCallback(async (id: number, motivo: string) => {
    try {
      await transaccionService.cancelar(id, motivo)
      
      toast({
        title: "Éxito",
        description: "Transacción cancelada correctamente",
      })

      // Recargar lista después de cancelar
      await recargarTransacciones()
      return true
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar la transacción",
        variant: "destructive",
      })
      return false
    }
  }, [toast, recargarTransacciones])

  /**
   * Formatea una transacción para mostrar en la UI
   */
  const formatearTransaccionParaUI = useCallback((transaccion: TransaccionDto) => {
    return {
      ...transaccion,
      // Campos calculados para la UI
      par_monedas: transaccion.moneda_origen && transaccion.moneda_destino 
        ? `${transaccion.moneda_origen.codigo}/${transaccion.moneda_destino.codigo}`
        : 'N/A',
      cliente_display: transaccion.cliente 
        ? `${transaccion.cliente.persona?.nombres} ${transaccion.cliente.persona?.apellido_paterno}`
        : transaccion.cliente_temporal
        ? `${transaccion.cliente_temporal.nombres} ${transaccion.cliente_temporal.apellidos}`
        : 'Cliente Ocasional',
      operacion_tipo: transaccion.tipo_cambio_aplicado > 0 
        ? (transaccion.monto_origen < transaccion.monto_destino ? 'Compra' : 'Venta')
        : 'N/A'
    }
  }, [])

  /**
   * Obtiene estadísticas rápidas del historial
   */
  const obtenerEstadisticas = useCallback(() => {
    if (transacciones.length === 0) {
      return {
        total: 0,
        ganancia_total: 0,
        promedio_monto: 0,
        transacciones_hoy: 0
      }
    }

    const hoy = new Date().toDateString()
    const transaccionesHoy = transacciones.filter(t => 
      new Date(t.created_at).toDateString() === hoy
    )

    const gananciaTotal = transacciones.reduce((sum, t) => sum + t.ganancia, 0)
    const promedioMonto = transacciones.reduce((sum, t) => sum + t.monto_origen, 0) / transacciones.length

    return {
      total: transacciones.length,
      ganancia_total: gananciaTotal,
      promedio_monto: promedioMonto,
      transacciones_hoy: transaccionesHoy.length
    }
  }, [transacciones])

  // Auto-refresh si está habilitado
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        cargarTransacciones()
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, cargarTransacciones])

  // Cargar datos iniciales
  useEffect(() => {
    cargarTransacciones()
  }, [cargarTransacciones])

  return {
    // Estados
    transacciones,
    isLoading,
    error,
    ultimaActualizacion,
    
    // Acciones
    recargarTransacciones,
    buscarTransacciones,
    obtenerTransaccion,
    cancelarTransaccion,
    
    // Utilidades
    formatearTransaccionParaUI,
    obtenerEstadisticas,
    
    // Datos calculados
    estadisticas: obtenerEstadisticas(),
    hayTransacciones: transacciones.length > 0
  }
}