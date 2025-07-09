"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { transaccionService } from "@/services/transaccion-service"
import { monedaService } from "@/services/moneda-service"
import type { CalcularConversionRequest } from "@/types/transaccion"
import type { MonedaDto } from "@/types/moneda"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/utils/format"

interface CalculadoraDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CalculadoraDialog({ open, onOpenChange }: CalculadoraDialogProps) {
  const [monedas, setMonedas] = useState<MonedaDto[]>([])
  const [formData, setFormData] = useState<CalcularConversionRequest>({
    montoOrigen: 0,
    monedaOrigenId: 0,
    monedaDestinoId: 0,
    casaDeCambioId: 1, // TODO: Obtener de contexto
  })
  const [resultado, setResultado] = useState<{
    montoDestino: number
    tipoCambio: number
    ganancia: number
  } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadMonedas()
      resetForm()
    }
  }, [open])

  const loadMonedas = async () => {
    try {
      const response = await monedaService.getActivas()
      setMonedas(response.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las monedas",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      montoOrigen: 0,
      monedaOrigenId: 0,
      monedaDestinoId: 0,
      casaDeCambioId: 1,
    })
    setResultado(null)
  }

  const calcular = async () => {
    if (!formData.montoOrigen || !formData.monedaOrigenId || !formData.monedaDestinoId) {
      toast({
        title: "Error",
        description: "Complete todos los campos para calcular",
        variant: "destructive",
      })
      return
    }

    if (formData.monedaOrigenId === formData.monedaDestinoId) {
      toast({
        title: "Error",
        description: "Las monedas de origen y destino deben ser diferentes",
        variant: "destructive",
      })
      return
    }

    setIsCalculating(true)
    try {
      const response = await transaccionService.calcularConversion(formData)
      setResultado(response.data ?? null)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo calcular la conversión",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const handleChange = (field: keyof CalcularConversionRequest, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setResultado(null) // Limpiar resultado cuando cambian los datos
  }

  const getMonedaNombre = (monedaId: number) => {
    const moneda = monedas.find((m) => m.id === monedaId)
    return moneda ? moneda.codigo : "N/A"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Calculadora de Cambio</DialogTitle>
          <DialogDescription>Calcula el tipo de cambio y monto de conversión</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="moneda_origen">Moneda Origen</Label>
            <Select
              value={formData.monedaOrigenId.toString()}
              onValueChange={(value) => handleChange("monedaOrigenId", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona moneda origen" />
              </SelectTrigger>
              <SelectContent>
                {monedas.map((moneda) => (
                  <SelectItem key={moneda.id} value={moneda.id.toString()}>
                    {moneda.codigo} - {moneda.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto_origen">Monto</Label>
            <Input
              id="monto_origen"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.montoOrigen}
              onChange={(e) => handleChange("montoOrigen", Number.parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moneda_destino">Moneda Destino</Label>
            <Select
              value={formData.monedaDestinoId.toString()}
              onValueChange={(value) => handleChange("monedaDestinoId", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona moneda destino" />
              </SelectTrigger>
              <SelectContent>
                {monedas.map((moneda) => (
                  <SelectItem key={moneda.id} value={moneda.id.toString()}>
                    {moneda.codigo} - {moneda.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={calcular} disabled={isCalculating} className="w-full">
            {isCalculating && <LoadingSpinner size="sm" className="mr-2" />}
            Calcular
          </Button>

          {/* Resultado */}
          {resultado && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatCurrency(resultado.montoDestino, getMonedaNombre(formData.monedaDestinoId))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Por {formatCurrency(formData.montoOrigen, getMonedaNombre(formData.monedaOrigenId))}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tipo de cambio:</span>
                    <span className="font-semibold">{resultado.tipoCambio.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ganancia estimada:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(resultado.ganancia, "PEN")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
