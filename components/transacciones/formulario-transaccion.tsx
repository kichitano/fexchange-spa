"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calculator, Settings } from "lucide-react"
import { formatCurrency } from "@/utils/format"

/**
 * Componente Formulario de Transacción
 * 
 * Interfaz para captura de datos y cálculo de transacciones de cambio.
 * Incluye entrada de monto, visualización de resultados y opciones avanzadas.
 */

interface CalculoTransaccion {
  monto_origen: number
  monto_destino: number
  tipo_cambio_aplicado: number
  ganancia: number
  es_valido: boolean
  mensaje_error?: string
}

interface FormularioTransaccionProps {
  montoOrigen: string
  calculo: CalculoTransaccion | null
  tipoOperacion: 'compra' | 'venta'
  usarTipoCambioPersonalizado: boolean
  tipoCambioCustom: string
  monedaOrigen?: string
  monedaDestino?: string
  puedeProcessar: boolean
  onMontoChange: (monto: string) => void
  onAbrirCambioPreferencial: () => void
  onProcesarTransaccion: () => void
}

export function FormularioTransaccion({
  montoOrigen,
  calculo,
  tipoOperacion,
  usarTipoCambioPersonalizado,
  tipoCambioCustom,
  monedaOrigen = '',
  monedaDestino = '',
  puedeProcessar,
  onMontoChange,
  onAbrirCambioPreferencial,
  onProcesarTransaccion
}: FormularioTransaccionProps) {

  /**
   * Obtiene el texto del tipo de operación para mostrar
   */
  const obtenerTextoOperacion = () => {
    return tipoOperacion === 'compra' 
      ? `Compramos ${monedaOrigen} - Pagamos ${monedaDestino}`
      : `Vendemos ${monedaOrigen} - Recibimos ${monedaDestino}`
  }

  /**
   * Obtiene el color del badge según el tipo de operación
   */
  const obtenerColorOperacion = () => {
    return tipoOperacion === 'compra' ? 'default' : 'secondary'
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Procesar Transacción
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Input de monto */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Monto a {tipoOperacion === 'compra' ? 'Comprar' : 'Vender'} ({monedaOrigen})
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={montoOrigen}
                onChange={(e) => onMontoChange(e.target.value)}
                className="text-right font-mono"
                step="0.01"
                min="0"
              />
            </div>

            {/* Tipo de operación visual */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Tipo de Operación
              </label>
              <div className="flex items-center h-10">
                <Badge variant={obtenerColorOperacion()} className="text-xs">
                  {obtenerTextoOperacion()}
                </Badge>
              </div>
            </div>

            {/* Monto resultado */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                {tipoOperacion === 'compra' ? 'Pagaremos' : 'Recibiremos'} ({monedaDestino})
              </label>
              <div className="h-10 px-3 py-2 border border-input bg-background rounded-md text-right font-mono">
                {calculo?.es_valido 
                  ? formatCurrency(calculo.monto_destino, monedaDestino)
                  : '0.00'
                }
              </div>
            </div>

            {/* Controles y resultado */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Acciones
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAbrirCambioPreferencial}
                  className="flex-1"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  T.C.
                </Button>
                <Button
                  onClick={onProcesarTransaccion}
                  disabled={!puedeProcessar}
                  className="flex-1"
                >
                  <Calculator className="h-3 w-3 mr-1" />
                  Procesar
                </Button>
              </div>
            </div>
          </div>

          {/* Detalles del cálculo */}
          {calculo?.es_valido && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                Detalles del Cálculo
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Tipo de Cambio:</span>
                  <div className="font-mono font-medium">
                    {calculo.tipo_cambio_aplicado.toFixed(4)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Monto Origen:</span>
                  <div className="font-mono font-medium">
                    {formatCurrency(calculo.monto_origen, monedaOrigen)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Monto Destino:</span>
                  <div className="font-mono font-medium">
                    {formatCurrency(calculo.monto_destino, monedaDestino)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Ganancia:</span>
                  <div className={`font-mono font-medium ${
                    calculo.ganancia >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(calculo.ganancia, 'PEN')}
                  </div>
                </div>
              </div>

              {/* Indicador de tipo de cambio personalizado */}
              {usarTipoCambioPersonalizado && (
                <div className="mt-2 pt-2 border-t">
                  <Badge variant="outline" className="text-xs">
                    Tipo de cambio preferencial: {tipoCambioCustom}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Error de cálculo */}
          {calculo && !calculo.es_valido && calculo.mensaje_error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="text-xs text-destructive">
                {calculo.mensaje_error}
              </div>
            </div>
          )}

          {/* Instrucciones */}
          {!calculo && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs text-blue-800">
                Seleccione un tipo de cambio e ingrese un monto para comenzar
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}