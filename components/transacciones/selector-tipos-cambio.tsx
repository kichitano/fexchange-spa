"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatCurrency } from "@/utils/format"
import type { TipoCambioDto } from "@/types/tipo-cambio"

/**
 * Componente Selector de Tipos de Cambio
 * 
 * Interfaz optimizada para selección rápida de tipos de cambio y operaciones.
 * Muestra máximo 3 registros visibles con scroll para mejor usabilidad.
 */

interface TipoCambioSeleccionado extends TipoCambioDto {
  par_monedas: string
}

type TipoOperacion = 'compra' | 'venta'

interface SelectorTiposCambioProps {
  tiposCambio: TipoCambioDto[]
  tipoCambioSeleccionado: TipoCambioSeleccionado | null
  tipoOperacion: TipoOperacion
  isLoading: boolean
  onSeleccionar: (tipo: TipoCambioDto, operacion: TipoOperacion) => void
}

export function SelectorTiposCambio({
  tiposCambio,
  tipoCambioSeleccionado,
  tipoOperacion,
  isLoading,
  onSeleccionar
}: SelectorTiposCambioProps) {
  
  /**
   * Maneja la selección de un tipo de cambio y operación
   */
  const handleSeleccion = (tipo: TipoCambioDto, operacion: TipoOperacion) => {
    onSeleccionar(tipo, operacion)
  }

  /**
   * Verifica si un tipo de cambio y operación están seleccionados
   */
  const isSeleccionado = (tipo: TipoCambioDto, operacion: TipoOperacion) => {
    return tipoCambioSeleccionado?.id === tipo.id && tipoOperacion === operacion
  }

  /**
   * Genera el par de monedas para mostrar
   */
  const generarParMonedas = (tipo: TipoCambioDto) => {
    return `${tipo.moneda_origen?.codigo || ''}/${tipo.moneda_destino?.codigo || ''}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tiposCambio.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            No hay tipos de cambio activos disponibles
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Seleccionar Tipo de Cambio y Operación
          </h3>
          
          {/* Encabezados de tabla */}
          <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
            <div>Par</div>
            <div className="text-center">Compra</div>
            <div className="text-center">Venta</div>
            <div className="text-center">Acción Compra</div>
            <div className="text-center">Acción Venta</div>
          </div>

          {/* Lista de tipos de cambio con scroll (máximo 3 visibles) */}
          <ScrollArea className="h-[120px]">
            <div className="space-y-2">
              {tiposCambio.map((tipo) => {
                const parMonedas = generarParMonedas(tipo)
                const compraSeleccionada = isSeleccionado(tipo, 'compra')
                const ventaSeleccionada = isSeleccionado(tipo, 'venta')

                return (
                  <div 
                    key={tipo.id} 
                    className="grid grid-cols-5 gap-2 items-center py-2 px-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {/* Par de monedas */}
                    <div className="font-medium text-sm">
                      {parMonedas}
                    </div>

                    {/* Tipo de cambio compra */}
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {formatCurrency(tipo.tipo_compra, 'PEN')}
                      </Badge>
                    </div>

                    {/* Tipo de cambio venta */}
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {formatCurrency(tipo.tipo_venta, 'PEN')}
                      </Badge>
                    </div>

                    {/* Botón para operación de compra */}
                    <div className="text-center">
                      <Button
                        variant={compraSeleccionada ? "default" : "outline"}
                        size="sm"
                        className="text-xs px-2 py-1 h-7"
                        onClick={() => handleSeleccion(tipo, 'compra')}
                      >
                        {compraSeleccionada ? '✓ Comprar' : 'Comprar'}
                      </Button>
                    </div>

                    {/* Botón para operación de venta */}
                    <div className="text-center">
                      <Button
                        variant={ventaSeleccionada ? "default" : "outline"}
                        size="sm" 
                        className="text-xs px-2 py-1 h-7"
                        onClick={() => handleSeleccion(tipo, 'venta')}
                      >
                        {ventaSeleccionada ? '✓ Vender' : 'Vender'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          {/* Indicador de selección actual */}
          {tipoCambioSeleccionado && (
            <div className="mt-3 p-2 bg-primary/5 rounded-lg border border-primary/20">
              <div className="text-xs text-muted-foreground">Seleccionado:</div>
              <div className="text-sm font-medium">
                {tipoCambioSeleccionado.par_monedas} - {tipoOperacion === 'compra' ? 'Compra' : 'Venta'}
              </div>
              <div className="text-xs text-muted-foreground">
                Tipo de cambio: {formatCurrency(
                  tipoOperacion === 'compra' 
                    ? tipoCambioSeleccionado.tipo_compra 
                    : tipoCambioSeleccionado.tipo_venta, 
                  'PEN'
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}