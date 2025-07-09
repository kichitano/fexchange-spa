"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { 
  Search, 
  Eye, 
  Filter, 
  Calendar,
  Download,
  RefreshCw
} from "lucide-react"
import { formatCurrency, formatDateTime } from "@/utils/format"
import type { TransaccionDto, FiltrosTransaccion } from "@/types/transaccion"
import { EstadoTransaccion } from "@/types/enums"

/**
 * Componente Tabla de Transacciones
 * 
 * Interfaz especializada para la visualización y búsqueda de transacciones.
 * Incluye filtros avanzados, paginación y visualización detallada.
 */

interface TablaTransaccionesProps {
  transacciones: TransaccionDto[]
  isLoading: boolean
  filtros: FiltrosTransaccion
  onFiltrosChange: (filtros: FiltrosTransaccion) => void
  onRecargar: () => void
  totalRegistros?: number
  paginaActual?: number
  totalPaginas?: number
  onPaginaChange?: (pagina: number) => void
}

export function TablaTransacciones({
  transacciones,
  isLoading,
  filtros,
  onFiltrosChange,
  onRecargar,
  totalRegistros = 0,
  paginaActual = 1,
  totalPaginas = 1,
  onPaginaChange
}: TablaTransaccionesProps) {
  // Estados locales
  const [busquedaLocal, setBusquedaLocal] = useState('')
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState<TransaccionDto | null>(null)
  const [showDetalleDialog, setShowDetalleDialog] = useState(false)
  const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false)

  /**
   * Maneja la búsqueda con debounce
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltrosChange({
        ...filtros,
        busqueda: busquedaLocal,
        offset: 0 // Resetear a primera página al buscar
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [busquedaLocal])

  /**
   * Obtiene el color del badge según el estado
   */
  const obtenerColorEstado = (estado: EstadoTransaccion) => {
    switch (estado) {
      case EstadoTransaccion.COMPLETADA:
        return 'default'
      case EstadoTransaccion.PENDIENTE:
        return 'secondary'
      case EstadoTransaccion.CANCELADA:
        return 'destructive'
      default:
        return 'outline'
    }
  }

  /**
   * Formatea el nombre del cliente
   */
  const formatearCliente = (transaccion: TransaccionDto) => {
    if (transaccion.cliente && transaccion.cliente.persona) {
      const { nombres, apellido_paterno, apellido_materno } = transaccion.cliente.persona
      return `${nombres} ${apellido_paterno} ${apellido_materno || ''}`.trim()
    }
    
    if (transaccion.cliente_temporal) {
      const { nombres, apellidos } = transaccion.cliente_temporal
      return `${nombres || ''} ${apellidos || ''}`.trim()
    }
    
    return 'Cliente Ocasional'
  }

  /**
   * Obtiene el par de monedas
   */
  const obtenerParMonedas = (transaccion: TransaccionDto) => {
    if (transaccion.moneda_origen && transaccion.moneda_destino) {
      return `${transaccion.moneda_origen.codigo}/${transaccion.moneda_destino.codigo}`
    }
    return 'N/A'
  }

  /**
   * Determina el tipo de operación
   */
  const obtenerTipoOperacion = (transaccion: TransaccionDto) => {
    return transaccion.monto_origen < transaccion.monto_destino ? 'Compra' : 'Venta'
  }

  /**
   * Maneja la visualización de detalles
   */
  const handleVerDetalle = (transaccion: TransaccionDto) => {
    setTransaccionSeleccionada(transaccion)
    setShowDetalleDialog(true)
  }

  /**
   * Maneja cambios en filtros
   */
  const handleFiltroChange = (campo: string, valor: any) => {
    onFiltrosChange({
      ...filtros,
      [campo]: valor,
      offset: 0 // Resetear a primera página al filtrar
    })
  }

  /**
   * Exporta las transacciones a CSV
   */
  const handleExportar = () => {
    // TODO: Implementar exportación
    console.log('Exportar transacciones')
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y controles */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="text-lg">Transacciones</CardTitle>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRecargar}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFiltrosAvanzados(!showFiltrosAvanzados)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportar}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Búsqueda principal */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, cliente, moneda..."
                value={busquedaLocal}
                onChange={(e) => setBusquedaLocal(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filtros.ordenar || 'fecha_desc'}
              onValueChange={(value) => handleFiltroChange('ordenar', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fecha_desc">Fecha (Más reciente)</SelectItem>
                <SelectItem value="fecha_asc">Fecha (Más antiguo)</SelectItem>
                <SelectItem value="monto_desc">Monto (Mayor)</SelectItem>
                <SelectItem value="monto_asc">Monto (Menor)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros avanzados */}
          {showFiltrosAvanzados && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <label className="text-sm font-medium">Estado</label>
                <Select
                  value={filtros.estado || ''}
                  onValueChange={(value) => handleFiltroChange('estado', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    <SelectItem value={EstadoTransaccion.COMPLETADA}>Completada</SelectItem>
                    <SelectItem value={EstadoTransaccion.PENDIENTE}>Pendiente</SelectItem>
                    <SelectItem value={EstadoTransaccion.CANCELADA}>Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Fecha Inicio</label>
                <Input
                  type="date"
                  value={filtros.fechaInicio || ''}
                  onChange={(e) => handleFiltroChange('fechaInicio', e.target.value || undefined)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Fecha Fin</label>
                <Input
                  type="date"
                  value={filtros.fechaFin || ''}
                  onChange={(e) => handleFiltroChange('fechaFin', e.target.value || undefined)}
                />
              </div>
            </div>
          )}

          {/* Información de resultados */}
          <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
            <span>
              Mostrando {transacciones.length} de {totalRegistros} transacciones
            </span>
            {totalPaginas > 1 && (
              <span>
                Página {paginaActual} de {totalPaginas}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de transacciones */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : transacciones.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                No se encontraron transacciones con los filtros actuales
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Par/Operación</TableHead>
                    <TableHead>Monto Origen</TableHead>
                    <TableHead>Monto Destino</TableHead>
                    <TableHead>T.C.</TableHead>
                    <TableHead>Ganancia</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Ventanilla</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transacciones.map((transaccion) => (
                    <TableRow key={transaccion.id}>
                      <TableCell className="font-mono text-xs">
                        {transaccion.numero_transaccion}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDateTime(transaccion.created_at)}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {formatearCliente(transaccion)}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{obtenerParMonedas(transaccion)}</div>
                          <div className="text-muted-foreground">
                            {obtenerTipoOperacion(transaccion)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {formatCurrency(transaccion.monto_origen, transaccion.moneda_origen?.codigo)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {formatCurrency(transaccion.monto_destino, transaccion.moneda_destino?.codigo)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {transaccion.tipo_cambio_aplicado.toFixed(4)}
                      </TableCell>
                      <TableCell className={`font-mono text-xs ${
                        transaccion.ganancia >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaccion.ganancia, 'PEN')}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={obtenerColorEstado(transaccion.estado)}
                          className="text-xs"
                        >
                          {transaccion.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {transaccion.ventanilla?.nombre || `V-${transaccion.ventanilla_id}`}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerDetalle(transaccion)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPaginas > 1 && onPaginaChange && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={paginaActual <= 1}
            onClick={() => onPaginaChange(paginaActual - 1)}
          >
            Anterior
          </Button>
          
          {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
            const pagina = Math.max(1, paginaActual - 2) + i
            if (pagina > totalPaginas) return null
            
            return (
              <Button
                key={pagina}
                variant={pagina === paginaActual ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPaginaChange(pagina)}
              >
                {pagina}
              </Button>
            )
          })}
          
          <Button
            variant="outline"
            size="sm"
            disabled={paginaActual >= totalPaginas}
            onClick={() => onPaginaChange(paginaActual + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Modal de detalles */}
      <Dialog open={showDetalleDialog} onOpenChange={setShowDetalleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Detalles de Transacción #{transaccionSeleccionada?.numero_transaccion}
            </DialogTitle>
          </DialogHeader>
          
          {transaccionSeleccionada && (
            <div className="space-y-4">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <div>
                    <Badge variant={obtenerColorEstado(transaccionSeleccionada.estado)}>
                      {transaccionSeleccionada.estado}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Fecha</label>
                  <div className="text-sm">
                    {formatDateTime(transaccionSeleccionada.created_at)}
                  </div>
                </div>
              </div>

              {/* Información del cliente */}
              <div>
                <label className="text-sm font-medium">Cliente</label>
                <div className="text-sm">
                  {formatearCliente(transaccionSeleccionada)}
                </div>
              </div>

              {/* Información de la transacción */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Par de Monedas</label>
                  <div className="text-sm">
                    {obtenerParMonedas(transaccionSeleccionada)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo de Operación</label>
                  <div className="text-sm">
                    {obtenerTipoOperacion(transaccionSeleccionada)}
                  </div>
                </div>
              </div>

              {/* Montos */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Monto Origen</label>
                  <div className="text-sm font-mono">
                    {formatCurrency(transaccionSeleccionada.monto_origen, transaccionSeleccionada.moneda_origen?.codigo)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Monto Destino</label>
                  <div className="text-sm font-mono">
                    {formatCurrency(transaccionSeleccionada.monto_destino, transaccionSeleccionada.moneda_destino?.codigo)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Ganancia</label>
                  <div className={`text-sm font-mono ${
                    transaccionSeleccionada.ganancia >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(transaccionSeleccionada.ganancia, 'PEN')}
                  </div>
                </div>
              </div>

              {/* Tipo de cambio */}
              <div>
                <label className="text-sm font-medium">Tipo de Cambio Aplicado</label>
                <div className="text-sm font-mono">
                  {transaccionSeleccionada.tipo_cambio_aplicado.toFixed(4)}
                </div>
              </div>

              {/* Observaciones */}
              {transaccionSeleccionada.observaciones && (
                <div>
                  <label className="text-sm font-medium">Observaciones</label>
                  <div className="text-sm">
                    {transaccionSeleccionada.observaciones}
                  </div>
                </div>
              )}

              {/* Información de ventanilla */}
              <div>
                <label className="text-sm font-medium">Ventanilla</label>
                <div className="text-sm">
                  {transaccionSeleccionada.ventanilla?.nombre || `Ventanilla ${transaccionSeleccionada.ventanilla_id}`}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}