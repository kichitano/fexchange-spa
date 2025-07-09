"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RefreshCw, Eye, Edit, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDateTime } from "@/utils/format"
import type { TransaccionDto } from "@/types/transaccion"
import { EstadoTransaccion } from "@/types/enums"

/**
 * Componente Historial de Transacciones
 * 
 * Muestra las transacciones más recientes con capacidad de scroll.
 * Optimizado para operaciones rápidas con información esencial visible.
 */

interface HistorialTransaccionesProps {
  transacciones: TransaccionDto[]
  isLoading: boolean
  ultimaActualizacion: Date | null
  onRecargar: () => void
  onVerDetalle?: (transaccion: TransaccionDto) => void
  onEditar?: (transaccion: TransaccionDto) => void
  onCancelar?: (transaccion: TransaccionDto) => void
  maxHeight?: string
}

export function HistorialTransacciones({
  transacciones,
  isLoading,
  ultimaActualizacion,
  onRecargar,
  onVerDetalle,
  onEditar,
  onCancelar,
  maxHeight = "280px"
}: HistorialTransaccionesProps) {

  /**
   * Obtiene el color del badge según el estado de la transacción
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
   * Formatea el nombre del cliente para mostrar
   */
  const formatearCliente = (transaccion: TransaccionDto) => {
    if (transaccion.cliente && transaccion.cliente.persona) {
      const { nombres, apellido_paterno } = transaccion.cliente.persona
      return `${nombres} ${apellido_paterno}`
    }
    
    if (transaccion.cliente_temporal) {
      const { nombres, apellidos } = transaccion.cliente_temporal
      return `${nombres || ''} ${apellidos || ''}`.trim()
    }
    
    return 'Cliente Ocasional'
  }

  /**
   * Genera el texto del par de monedas
   */
  const obtenerParMonedas = (transaccion: TransaccionDto) => {
    if (transaccion.moneda_origen && transaccion.moneda_destino) {
      return `${transaccion.moneda_origen.codigo}/${transaccion.moneda_destino.codigo}`
    }
    return 'N/A'
  }

  /**
   * Determina el tipo de operación basado en los montos
   */
  const obtenerTipoOperacion = (transaccion: TransaccionDto) => {
    // Asumimos que si el monto origen es menor que el destino, es una compra
    // (compramos moneda extranjera, pagamos más soles)
    return transaccion.monto_origen < transaccion.monto_destino ? 'Compra' : 'Venta'
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Transacciones Recientes</CardTitle>
          <div className="flex items-center gap-2">
            {ultimaActualizacion && (
              <span className="text-xs text-muted-foreground">
                {formatDateTime(ultimaActualizacion)}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onRecargar}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading && transacciones.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner />
          </div>
        ) : transacciones.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No hay transacciones recientes
          </div>
        ) : (
          <ScrollArea style={{ height: maxHeight }}>
            <div className="space-y-2">
              {transacciones.map((transaccion) => (
                <div
                  key={transaccion.id}
                  className="p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                >
                  {/* Fila principal con información clave */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={obtenerColorEstado(transaccion.estado)}
                        className="text-xs"
                      >
                        {transaccion.estado}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">
                        #{transaccion.numero_transaccion}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {onVerDetalle && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onVerDetalle(transaccion)}
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      {onEditar && transaccion.estado === EstadoTransaccion.COMPLETADA && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditar(transaccion)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      {onCancelar && transaccion.estado === EstadoTransaccion.COMPLETADA && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCancelar(transaccion)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Información de la transacción */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Par/Operación:</span>
                      <div className="font-medium">
                        {obtenerParMonedas(transaccion)} - {obtenerTipoOperacion(transaccion)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cliente:</span>
                      <div className="font-medium truncate">
                        {formatearCliente(transaccion)}
                      </div>
                    </div>
                  </div>

                  {/* Montos y ganancia */}
                  <div className="grid grid-cols-3 gap-4 mt-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Monto Origen:</span>
                      <div className="font-mono font-medium">
                        {formatCurrency(transaccion.monto_origen, transaccion.moneda_origen?.codigo)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Monto Destino:</span>
                      <div className="font-mono font-medium">
                        {formatCurrency(transaccion.monto_destino, transaccion.moneda_destino?.codigo)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ganancia:</span>
                      <div className={`font-mono font-medium ${
                        transaccion.ganancia >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaccion.ganancia, 'PEN')}
                      </div>
                    </div>
                  </div>

                  {/* Tiempo y tipo de cambio */}
                  <div className="flex justify-between items-center mt-2 pt-2 border-t text-xs text-muted-foreground">
                    <span>
                      {formatDateTime(transaccion.created_at)}
                    </span>
                    <span className="font-mono">
                      T.C.: {transaccion.tipo_cambio_aplicado.toFixed(4)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Estadísticas rápidas */}
        {transacciones.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="grid grid-cols-3 gap-4 text-xs text-center">
              <div>
                <div className="text-muted-foreground">Total</div>
                <div className="font-medium">{transacciones.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Ganancia Total</div>
                <div className="font-medium font-mono">
                  {formatCurrency(
                    transacciones.reduce((sum, t) => sum + t.ganancia, 0),
                    'PEN'
                  )}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Completadas</div>
                <div className="font-medium">
                  {transacciones.filter(t => t.estado === EstadoTransaccion.COMPLETADA).length}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}