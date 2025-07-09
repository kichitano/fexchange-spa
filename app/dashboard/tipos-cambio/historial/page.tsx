"use client"

import { useState, useEffect, useCallback } from 'react'
import { HistorialTable } from '@/components/tipos-cambio/historial-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, CalendarDays, Filter, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { tipoCambioService } from '@/services/tipo-cambio-service'
import { monedaService } from '@/services/moneda-service'
import type { TipoCambioDto } from '@/types/tipo-cambio'
import type { MonedaDto } from '@/types/moneda'

/**
 * Página de Historial de Tipos de Cambio
 * 
 * Funcionalidades:
 * - Visualización histórica de todos los tipos de cambio
 * - Filtros avanzados por fecha, moneda, casa de cambio
 * - Búsqueda por usuario responsable
 * - Exportación de datos históricos
 */

interface FiltrosHistorial {
  fechaInicio?: string
  fechaFin?: string
  monedaOrigenId?: number
  monedaDestinoId?: number
  casaDeCambioId?: number
  usuarioId?: number
  busqueda?: string
}

export default function HistorialTiposCambioPage() {
  // Estados principales
  const [historial, setHistorial] = useState<TipoCambioDto[]>([])
  const [monedas, setMonedas] = useState<MonedaDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalRegistros, setTotalRegistros] = useState(0)
  
  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosHistorial>({
    fechaInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Últimos 30 días
    fechaFin: new Date().toISOString().split('T')[0]
  })
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const { toast } = useToast()

  /**
   * Carga el historial de tipos de cambio con filtros
   */
  const cargarHistorial = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Por ahora usamos el endpoint existente de tipos de cambio
      // TODO: Crear endpoint específico para historial con filtros
      const response = await tipoCambioService.getAll()
      
      if (response.data) {
        // Filtrar los datos según los criterios aplicados
        let historialFiltrado = response.data
        
        // Filtro por fechas
        if (filtros.fechaInicio || filtros.fechaFin) {
          historialFiltrado = historialFiltrado.filter(tipo => {
            const fechaTipo = new Date(tipo.fecha_vigencia)
            const fechaInicio = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null
            const fechaFin = filtros.fechaFin ? new Date(filtros.fechaFin) : null
            
            if (fechaInicio && fechaTipo < fechaInicio) return false
            if (fechaFin && fechaTipo > fechaFin) return false
            return true
          })
        }
        
        // Filtro por monedas
        if (filtros.monedaOrigenId) {
          historialFiltrado = historialFiltrado.filter(tipo => 
            tipo.moneda_origen_id === filtros.monedaOrigenId
          )
        }
        
        if (filtros.monedaDestinoId) {
          historialFiltrado = historialFiltrado.filter(tipo => 
            tipo.moneda_destino_id === filtros.monedaDestinoId
          )
        }
        
        // Ordenar por fecha descendente (más recientes primero)
        historialFiltrado.sort((a, b) => 
          new Date(b.fecha_vigencia).getTime() - new Date(a.fecha_vigencia).getTime()
        )
        
        setHistorial(historialFiltrado)
        setTotalRegistros(historialFiltrado.length)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de tipos de cambio",
        variant: "destructive",
      })
      console.error('Error cargando historial:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filtros, toast])

  /**
   * Carga las monedas disponibles para los filtros
   */
  const cargarMonedas = useCallback(async () => {
    try {
      const response = await monedaService.getAll()
      if (response.data) {
        setMonedas(response.data)
      }
    } catch (error) {
      console.error('Error cargando monedas:', error)
    }
  }, [])

  /**
   * Maneja el cambio en los filtros
   */
  const handleFiltroChange = (campo: keyof FiltrosHistorial, valor: any) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  /**
   * Limpia todos los filtros
   */
  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      fechaFin: new Date().toISOString().split('T')[0]
    })
  }

  /**
   * Exporta el historial a CSV
   */
  const exportarHistorial = () => {
    try {
      const csv = [
        ['Fecha', 'Par Monedas', 'Tipo Compra', 'Tipo Venta', 'Estado', 'Usuario'].join(','),
        ...historial.map(tipo => [
          new Date(tipo.fecha_vigencia).toLocaleDateString(),
          `${tipo.moneda_origen?.codigo}/${tipo.moneda_destino?.codigo}`,
          tipo.tipo_compra.toFixed(4),
          tipo.tipo_venta.toFixed(4),
          tipo.activo ? 'Activo' : 'Inactivo',
          'Sistema' // TODO: Mostrar usuario real cuando esté disponible
        ].join(','))
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `historial-tipos-cambio-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Éxito",
        description: "Historial exportado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar el historial",
        variant: "destructive",
      })
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    cargarMonedas()
  }, [cargarMonedas])

  useEffect(() => {
    cargarHistorial()
  }, [cargarHistorial])

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Historial de Tipos de Cambio
          </h1>
          <p className="text-muted-foreground">
            Consulta el historial completo de cambios en los tipos de cambio
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button
            variant="outline"
            onClick={cargarHistorial}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={exportarHistorial}>
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Panel de Filtros */}
      {mostrarFiltros && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por fechas */}
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={filtros.fechaInicio || ''}
                  onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha Fin</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={filtros.fechaFin || ''}
                  onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                />
              </div>

              {/* Filtro por monedas */}
              <div className="space-y-2">
                <Label>Moneda Origen</Label>
                <Select
                  value={filtros.monedaOrigenId?.toString() || ''}
                  onValueChange={(value) => handleFiltroChange('monedaOrigenId', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las monedas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las monedas</SelectItem>
                    {monedas.map((moneda) => (
                      <SelectItem key={moneda.id} value={moneda.id.toString()}>
                        {moneda.codigo} - {moneda.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Moneda Destino</Label>
                <Select
                  value={filtros.monedaDestinoId?.toString() || ''}
                  onValueChange={(value) => handleFiltroChange('monedaDestinoId', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las monedas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las monedas</SelectItem>
                    {monedas.map((moneda) => (
                      <SelectItem key={moneda.id} value={moneda.id.toString()}>
                        {moneda.codigo} - {moneda.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={limpiarFiltros}>
                Limpiar Filtros
              </Button>
              <Button onClick={cargarHistorial}>
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalRegistros}</div>
            <p className="text-xs text-muted-foreground">Total de registros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {historial.filter(h => h.activo).length}
            </div>
            <p className="text-xs text-muted-foreground">Tipos activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {new Set(historial.map(h => `${h.moneda_origen?.codigo}/${h.moneda_destino?.codigo}`)).size}
            </div>
            <p className="text-xs text-muted-foreground">Pares únicos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Historial */}
      <HistorialTable
        historial={historial}
        isLoading={isLoading}
        onRecargar={cargarHistorial}
      />
    </div>
  )
}