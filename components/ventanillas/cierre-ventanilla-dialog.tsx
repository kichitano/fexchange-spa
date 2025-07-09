"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Separator } from "@/components/ui/separator"
import { Check, X, AlertTriangle } from "lucide-react"
import { ventanillaService } from "@/services/ventanilla-service"
import type { 
  VentanillaDto, 
  CierreVentanillaRequest, 
  CierreVentanillaResumenDto, 
  MontoCierreDto,
  MontoCierreRequest 
} from "@/types/ventanilla"
import { useToast } from "@/hooks/use-toast"
import { formatNumber } from "@/utils/format"

interface CierreVentanillaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ventanilla?: VentanillaDto | null
  onSave: () => void
}

export function CierreVentanillaDialog({ open, onOpenChange, ventanilla, onSave }: CierreVentanillaDialogProps) {
  const [resumenCierre, setResumenCierre] = useState<CierreVentanillaResumenDto | null>(null)
  const [montosCierre, setMontosCierre] = useState<MontoCierreRequest[]>([])
  const [observaciones, setObservaciones] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingResumen, setIsLoadingResumen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && ventanilla && !resumenCierre) {
      loadResumenCierre()
      resetForm()
    } else if (!open) {
      // Limpiar estado cuando se cierre el diálogo
      setResumenCierre(null)
      resetForm()
    }
  }, [open, ventanilla?.id]) // Solo dependemos del ID de la ventanilla

  /**
   * Carga el resumen de cierre con montos esperados calculados automáticamente
   */
  const loadResumenCierre = async () => {
    if (!ventanilla) return

    setIsLoadingResumen(true)
    try {
      const response = await ventanillaService.getResumenCierre(ventanilla.id)
      setResumenCierre(response.data)

      // Inicializar montos de cierre con valores por defecto
      const montosIniciales: MontoCierreRequest[] = response.data.montos_esperados.map(monto => ({
        moneda_id: monto.moneda_id,
        monto_fisico_real: monto.monto_esperado, // Valor por defecto igual al esperado
        confirmado_fisicamente: false,
        observaciones_desfase: undefined,
      }))
      setMontosCierre(montosIniciales)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el resumen de cierre",
        variant: "destructive",
      })
    } finally {
      setIsLoadingResumen(false)
    }
  }

  const resetForm = () => {
    setObservaciones("")
    setMontosCierre([])
  }

  /**
   * Procesa el cierre de ventanilla con validación física de montos
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!ventanilla || !resumenCierre) return

    // Validar que todos los montos estén confirmados físicamente
    const montosNoConfirmados = montosCierre.filter(m => !m.confirmado_fisicamente)
    if (montosNoConfirmados.length > 0) {
      toast({
        title: "Error",
        description: "Debe confirmar físicamente todos los montos antes de proceder",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const data: CierreVentanillaRequest = {
        apertura_ventanilla_id: resumenCierre.apertura_ventanilla_id,
        observaciones_cierre: observaciones || undefined,
        montos_cierre: montosCierre,
      }

      await ventanillaService.procesarCierre(ventanilla.id, data)
      toast({
        title: "Éxito",
        description: "Ventanilla cerrada correctamente",
      })
      onSave()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cerrar la ventanilla",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Actualiza el monto físico real para una moneda específica
   */
  const handleMontoFisicoChange = (monedaId: number, montoFisico: number) => {
    setMontosCierre(prev => 
      prev.map(item => 
        item.moneda_id === monedaId 
          ? { ...item, monto_fisico_real: montoFisico, confirmado_fisicamente: false }
          : item
      )
    )
  }

  /**
   * Confirma que el monto físico coincide con lo contado en caja
   */
  const handleConfirmarFisicamente = (monedaId: number, confirmado: boolean) => {
    setMontosCierre(prev => 
      prev.map(item => 
        item.moneda_id === monedaId 
          ? { ...item, confirmado_fisicamente: confirmado }
          : item
      )
    )
  }

  /**
   * Actualiza las observaciones de desfase para una moneda específica
   */
  const handleObservacionesDesfaseChange = (monedaId: number, observaciones: string) => {
    setMontosCierre(prev => 
      prev.map(item => 
        item.moneda_id === monedaId 
          ? { ...item, observaciones_desfase: observaciones || undefined }
          : item
      )
    )
  }

  /**
   * Calcula el desfase entre monto esperado y físico real
   */
  const calcularDesfase = (montoEsperado: number, montoFisico: number) => {
    const desfaseMonto = montoFisico - montoEsperado
    const desfasePorcentaje = montoEsperado !== 0 ? Math.abs(desfaseMonto / montoEsperado) * 100 : 0
    return { desfaseMonto, desfasePorcentaje }
  }

  /**
   * Obtiene el color del desfase según su porcentaje
   */
  const getDesfaseColor = (porcentaje: number) => {
    if (porcentaje === 0) return "text-green-600"
    if (porcentaje <= 5) return "text-yellow-600"
    return "text-red-600"
  }

  if (isLoadingResumen) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner />
            <span className="ml-2">Calculando montos esperados...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cerrar Ventanilla - {ventanilla?.nombre}</DialogTitle>
          <DialogDescription>
            Valida físicamente los montos en caja y registra cualquier desfase encontrado
          </DialogDescription>
        </DialogHeader>

        {resumenCierre && (
          <div className="space-y-4">
            {/* Resumen general */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen de Operaciones</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Transacciones Realizadas</Label>
                  <div className="text-2xl font-bold">{resumenCierre.total_transacciones}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ganancia Total Calculada</Label>
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(resumenCierre.ganancia_total_calculada)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tabla de validación de montos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Validación Física de Montos por Moneda</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Confirma que los montos físicos en caja coinciden con los calculados automáticamente
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resumenCierre.montos_esperados.map((montoEsperado) => {
                      const montoCierre = montosCierre.find(m => m.moneda_id === montoEsperado.moneda_id)
                      const montoFisico = montoCierre?.monto_fisico_real || 0
                      const { desfaseMonto, desfasePorcentaje } = calcularDesfase(montoEsperado.monto_esperado, montoFisico)
                      const tieneDesfase = Math.abs(desfaseMonto) > 0.01

                      return (
                        <div key={montoEsperado.moneda_id} className="border rounded-lg p-4 space-y-3">
                          {/* Header de la moneda */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">
                                  {montoEsperado.moneda?.simbolo}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium">{montoEsperado.moneda?.nombre}</h4>
                                <p className="text-sm text-muted-foreground">{montoEsperado.moneda?.codigo}</p>
                              </div>
                            </div>
                            <Badge variant={montoCierre?.confirmado_fisicamente ? "default" : "secondary"}>
                              {montoCierre?.confirmado_fisicamente ? "Confirmado" : "Pendiente"}
                            </Badge>
                          </div>

                          {/* Datos de montos */}
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <Label className="text-xs font-medium">Monto Esperado (Calculado)</Label>
                              <div className="text-lg font-bold">
                                {montoEsperado.moneda?.simbolo} {formatNumber(montoEsperado.monto_esperado)}
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs font-medium">Monto Físico Real</Label>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{montoEsperado.moneda?.simbolo}</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={montoFisico}
                                  onChange={(e) => handleMontoFisicoChange(
                                    montoEsperado.moneda_id, 
                                    Number.parseFloat(e.target.value) || 0
                                  )}
                                  className="w-24"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs font-medium">Desfase</Label>
                              <div className={`text-lg font-bold ${getDesfaseColor(desfasePorcentaje)}`}>
                                {desfaseMonto >= 0 ? "+" : ""}{formatNumber(desfaseMonto)}
                                <div className="text-xs">
                                  ({desfasePorcentaje.toFixed(2)}%)
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs font-medium">Confirmación Física</Label>
                              <div className="flex gap-2 mt-1">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={montoCierre?.confirmado_fisicamente ? "default" : "outline"}
                                  onClick={() => handleConfirmarFisicamente(montoEsperado.moneda_id, true)}
                                  className="flex-1"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Sí
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={montoCierre?.confirmado_fisicamente === false ? "destructive" : "outline"}
                                  onClick={() => handleConfirmarFisicamente(montoEsperado.moneda_id, false)}
                                  className="flex-1"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  No
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Observaciones de desfase (solo si hay desfase) */}
                          {tieneDesfase && (
                            <div className="pt-2 border-t">
                              <Label className="text-xs font-medium text-orange-600">
                                <AlertTriangle className="h-3 w-3 inline mr-1" />
                                Observaciones del Desfase (Requerido)
                              </Label>
                              <Textarea
                                value={montoCierre?.observaciones_desfase || ""}
                                onChange={(e) => handleObservacionesDesfaseChange(
                                  montoEsperado.moneda_id, 
                                  e.target.value
                                )}
                                placeholder="Explique las posibles causas del desfase..."
                                className="mt-1"
                                rows={2}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Observaciones generales */}
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones Generales del Cierre</Label>
                <Textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Observaciones adicionales sobre el cierre de ventanilla (opcional)"
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} variant="destructive">
                  {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                  Procesar Cierre de Ventanilla
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}