"use client"

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Eye, TrendingUp, TrendingDown, Minus, Clock, User } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import type { TipoCambioDto } from '@/types/tipo-cambio'

interface HistorialTableProps {
  historial: TipoCambioDto[]
  isLoading: boolean
  onRecargar: () => void
}

/**
 * Componente de Tabla de Historial de Tipos de Cambio
 * 
 * Funcionalidades:
 * - Visualización tabular del historial
 * - Indicadores de cambios (subidas/bajadas)
 * - Detalles expandibles por registro
 * - Estados visuales por actividad
 * - Información de auditoría
 */

export function HistorialTable({ historial, isLoading, onRecargar }: HistorialTableProps) {
  const [selectedTipo, setSelectedTipo] = useState<TipoCambioDto | null>(null)

  /**
   * Calcula el cambio porcentual entre dos valores
   */
  const calcularCambioPorcentual = (valorAnterior: number, valorActual: number): number => {
    if (valorAnterior === 0) return 0
    return ((valorActual - valorAnterior) / valorAnterior) * 100
  }

  /**
   * Obtiene el indicador visual del cambio
   */
  const getIndicadorCambio = (cambio: number) => {
    if (cambio > 5) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (cambio < -5) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    } else if (cambio !== 0) {
      return <Minus className="h-4 w-4 text-yellow-600" />
    }
    return null
  }

  /**
   * Formatea la fecha para mostrar
   */
  const formatearFecha = (fecha: string | Date) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Obtiene el color del badge según el estado
   */
  const getBadgeVariant = (activo: boolean, mantenerDiario: boolean) => {
    if (activo && mantenerDiario) return 'default'
    if (activo) return 'secondary'
    return 'outline'
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Cargando historial...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (historial.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center h-32 flex items-center justify-center">
            <div className="text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay registros en el historial</p>
              <p className="text-sm">Ajusta los filtros para ver más resultados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Historial de Cambios</span>
          <Badge variant="secondary">{historial.length} registros</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Par de Monedas</TableHead>
                <TableHead className="text-right">Tipo Compra</TableHead>
                <TableHead className="text-right">Tipo Venta</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Cambios</TableHead>
                <TableHead className="text-center">Usuario</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historial.map((tipo, index) => {
                // Calcular cambios respecto al registro anterior del mismo par
                const tipoAnterior = historial
                  .slice(index + 1)
                  .find(t => 
                    t.moneda_origen_id === tipo.moneda_origen_id && 
                    t.moneda_destino_id === tipo.moneda_destino_id
                  )
                
                const cambioCompra = tipoAnterior 
                  ? calcularCambioPorcentual(tipoAnterior.tipo_compra, tipo.tipo_compra)
                  : 0
                
                const cambioVenta = tipoAnterior 
                  ? calcularCambioPorcentual(tipoAnterior.tipo_venta, tipo.tipo_venta)
                  : 0

                return (
                  <TableRow 
                    key={`${tipo.id}-${tipo.fecha_vigencia}`}
                    className={`${!tipo.activo ? 'opacity-60' : ''} hover:bg-muted/50`}
                  >
                    <TableCell className="font-mono text-sm">
                      {formatearFecha(tipo.fecha_vigencia)}
                    </TableCell>
                    
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{tipo.moneda_origen?.codigo}/{tipo.moneda_destino?.codigo}</span>
                        {tipo.mantener_cambio_diario && (
                          <Badge variant="outline" className="text-xs">
                            Diario
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right font-mono">
                      <div className="flex items-center justify-end gap-1">
                        {getIndicadorCambio(cambioCompra)}
                        <span>{tipo.tipo_compra.toFixed(4)}</span>
                      </div>
                      {cambioCompra !== 0 && (
                        <div className="text-xs text-muted-foreground">
                          {cambioCompra > 0 ? '+' : ''}{cambioCompra.toFixed(2)}%
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right font-mono">
                      <div className="flex items-center justify-end gap-1">
                        {getIndicadorCambio(cambioVenta)}
                        <span>{tipo.tipo_venta.toFixed(4)}</span>
                      </div>
                      {cambioVenta !== 0 && (
                        <div className="text-xs text-muted-foreground">
                          {cambioVenta > 0 ? '+' : ''}{cambioVenta.toFixed(2)}%
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <Badge variant={getBadgeVariant(tipo.activo, tipo.mantener_cambio_diario || false)}>
                        {tipo.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {Math.abs(cambioCompra) > 5 || Math.abs(cambioVenta) > 5 ? (
                          <Badge variant="destructive" className="text-xs">
                            Drástico
                          </Badge>
                        ) : Math.abs(cambioCompra) > 0 || Math.abs(cambioVenta) > 0 ? (
                          <Badge variant="secondary" className="text-xs">
                            Moderado
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin cambio</span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs">Sistema</span>
                        {/* TODO: Mostrar usuario real cuando esté disponible */}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTipo(tipo)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              Detalle del Tipo de Cambio
                            </DialogTitle>
                          </DialogHeader>
                          
                          {selectedTipo && (
                            <div className="space-y-4">
                              {/* Información básica */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Par de Monedas
                                  </label>
                                  <p className="text-lg font-semibold">
                                    {selectedTipo.moneda_origen?.codigo}/{selectedTipo.moneda_destino?.codigo}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Fecha de Vigencia
                                  </label>
                                  <p>{formatearFecha(selectedTipo.fecha_vigencia)}</p>
                                </div>
                              </div>

                              {/* Tipos de cambio */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                                  <label className="text-sm font-medium text-green-700 dark:text-green-300">
                                    Tipo de Compra
                                  </label>
                                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                                    {selectedTipo.tipo_compra.toFixed(4)}
                                  </p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                                  <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    Tipo de Venta
                                  </label>
                                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                    {selectedTipo.tipo_venta.toFixed(4)}
                                  </p>
                                </div>
                              </div>

                              {/* Estado y configuración */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Estado:</span>
                                  <Badge variant={selectedTipo.activo ? 'default' : 'outline'}>
                                    {selectedTipo.activo ? 'Activo' : 'Inactivo'}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Mantener Diario:</span>
                                  <Badge variant={selectedTipo.mantener_cambio_diario ? 'secondary' : 'outline'}>
                                    {selectedTipo.mantener_cambio_diario ? 'Sí' : 'No'}
                                  </Badge>
                                </div>
                              </div>

                              {/* Metadatos */}
                              <div className="border-t pt-4 space-y-2">
                                <div className="text-sm text-muted-foreground">
                                  <strong>ID:</strong> {selectedTipo.id}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <strong>Creado:</strong> {formatearFecha(selectedTipo.created_at)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <strong>Actualizado:</strong> {formatearFecha(selectedTipo.updated_at)}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}