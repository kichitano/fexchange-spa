"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { TrendingUp, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { tipoCambioService } from "@/services/tipo-cambio-service"
import { useToast } from "@/hooks/use-toast"

interface ExchangeRate {
  par_monedas: string
  compra: number
  venta: number
  ultima_actualizacion: Date
  moneda_origen: {
    id: number
    codigo: string
    nombre: string
    simbolo: string
  }
  moneda_destino: {
    id: number
    codigo: string
    nombre: string
    simbolo: string
  }
}

interface TablaTiposCambioRapidaProps {
  casaDeCambioId?: number
  className?: string
}

export function TablaTiposCambioRapida({ casaDeCambioId, className }: TablaTiposCambioRapidaProps) {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadExchangeRates()
  }, [casaDeCambioId])

  const loadExchangeRates = async () => {
    try {
      setIsLoading(true)
      const response = await tipoCambioService.getTiposCambioActuales(casaDeCambioId)
      setExchangeRates(response.data || [])
      setLastUpdated(new Date())
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de cambio actuales",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number, simbolo: string) => {
    return `${simbolo} ${value.toFixed(2)}`
  }

  const formatUltimaActualizacion = (fecha: Date | string) => {
    const dateObj = typeof fecha === "string" ? new Date(fecha) : fecha
    
    if (!dateObj || isNaN(dateObj.getTime())) return "N/A"

    const dateStr = dateObj.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric"
    })
    
    const timeStr = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })

    return `${timeStr} - ${dateStr}`
  }

  return (
    <Card className={`w-1/2 ${className || ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tipos de Cambio Actuales
            </CardTitle>
            <CardDescription>
              {casaDeCambioId 
                ? "Tipos de cambio vigentes para la casa seleccionada" 
                : "Tipos de cambio vigentes del sistema"
              }
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadExchangeRates}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : exchangeRates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No hay tipos de cambio disponibles</p>
            <p className="text-sm">
              Configure tipos de cambio para empezar a operar
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Par de Monedas</TableHead>
                    <TableHead className="text-right">Compra</TableHead>
                    <TableHead className="text-right">Venta</TableHead>
                    <TableHead className="text-center">Última Actualización</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exchangeRates.map((rate, index) => (
                    <TableRow key={`${rate.moneda_origen.id}-${rate.moneda_destino.id}-${index}`}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-mono font-semibold">
                            {rate.par_monedas}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {rate.moneda_origen.nombre} → {rate.moneda_destino.nombre}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(rate.compra, rate.moneda_destino.simbolo)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(rate.venta, rate.moneda_destino.simbolo)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-sm">
                          {formatUltimaActualizacion(rate.ultima_actualizacion)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {lastUpdated && (
              <div className="mt-4 text-xs text-muted-foreground text-center">
                Última actualización: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}