"use client"

import { useState, useEffect, useCallback } from 'react'
import { TablaTransacciones } from '@/components/transacciones/tabla-transacciones'
import { transaccionService } from '@/services/transaccion-service'
import { useToast } from '@/hooks/use-toast'
import type { TransaccionDto, FiltrosTransaccion } from '@/types/transaccion'

/**
 * Página de Visualización de Transacciones
 * 
 * Interfaz especializada para consultar y visualizar transacciones existentes.
 * Incluye búsqueda avanzada, filtros, paginación y visualización detallada.
 * 
 * Esta página se accede desde el menú lateral y está separada del
 * módulo de registro de transacciones para mejor organización.
 */

export default function VisualizarTransaccionesPage() {
  // Estados principales
  const [transacciones, setTransacciones] = useState<TransaccionDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  // Filtros y configuración
  const [filtros, setFiltros] = useState<FiltrosTransaccion>({
    limit: 20,
    offset: 0,
    ordenar: 'fecha_desc'
  })

  const { toast } = useToast()

  /**
   * Carga las transacciones con los filtros actuales
   */
  const cargarTransacciones = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const response = await transaccionService.obtenerTodas(filtros)
      
      if (response.data) {
        setTransacciones(response.data)
        
        // TODO: El backend debería devolver información de paginación
        // Por ahora calculamos basado en los resultados
        const limit = filtros.limit || 20
        const offset = filtros.offset || 0
        const paginaCalculada = Math.floor(offset / limit) + 1
        
        setPaginaActual(paginaCalculada)
        setTotalRegistros(response.data.length)
        setTotalPaginas(Math.ceil(response.data.length / limit))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las transacciones",
        variant: "destructive",
      })
      console.error('Error cargando transacciones:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filtros, toast])

  /**
   * Maneja cambios en los filtros
   */
  const handleFiltrosChange = useCallback((nuevosFiltros: FiltrosTransaccion) => {
    setFiltros(nuevosFiltros)
  }, [])

  /**
   * Maneja cambios de página
   */
  const handlePaginaChange = useCallback((nuevaPagina: number) => {
    const limit = filtros.limit || 20
    const nuevoOffset = (nuevaPagina - 1) * limit
    
    setFiltros(prev => ({
      ...prev,
      offset: nuevoOffset
    }))
  }, [filtros.limit])

  /**
   * Recarga las transacciones
   */
  const handleRecargar = useCallback(() => {
    cargarTransacciones()
  }, [cargarTransacciones])

  // Cargar datos iniciales
  useEffect(() => {
    cargarTransacciones()
  }, [cargarTransacciones])

  // Actualizar cuando cambien los filtros
  useEffect(() => {
    cargarTransacciones()
  }, [filtros])

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header de la página */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Visualizar Transacciones</h1>
        <p className="text-muted-foreground">
          Consulta y visualiza todas las transacciones registradas en el sistema
        </p>
      </div>

      {/* Tabla principal de transacciones */}
      <TablaTransacciones
        transacciones={transacciones}
        isLoading={isLoading}
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        onRecargar={handleRecargar}
        totalRegistros={totalRegistros}
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        onPaginaChange={handlePaginaChange}
      />
    </div>
  )
}