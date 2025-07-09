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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { transaccionService } from "@/services/transaccion-service"
import { clienteService } from "@/services/cliente-service"
import { ventanillaService } from "@/services/ventanilla-service"
import { monedaService } from "@/services/moneda-service"
import type { ProcesarCambioRequest, CalcularConversionRequest } from "@/types/transaccion"
import type { ClienteDto } from "@/types/cliente"
import type { VentanillaDto } from "@/types/ventanilla"
import type { MonedaDto } from "@/types/moneda"
import { EstadoVentanilla } from "@/types/enums"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/utils/format"

interface ProcesarTransaccionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function ProcesarTransaccionDialog({ open, onOpenChange, onSave }: ProcesarTransaccionDialogProps) {
  const [clientes, setClientes] = useState<ClienteDto[]>([])
  const [ventanillas, setVentanillas] = useState<VentanillaDto[]>([])
  const [monedas, setMonedas] = useState<MonedaDto[]>([])
  const [formData, setFormData] = useState<ProcesarCambioRequest>({
    clienteId: 0,
    ventanillaId: 0,
    monedaOrigenId: 0,
    monedaDestinoId: 0,
    montoOrigen: 0,
    observaciones: "",
  })
  const [conversion, setConversion] = useState<{
    montoDestino: number
    tipoCambio: number
    ganancia: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadData()
      resetForm()
    }
  }, [open])

  const loadData = async () => {
    try {
      const [clientesResponse, ventanillasResponse, monedasResponse] = await Promise.all([
        clienteService.getAll(),
        ventanillaService.getAll(),
        monedaService.getActivas(),
      ])

      setClientes(clientesResponse.data || [])
      setVentanillas((ventanillasResponse.data || []).filter((v) => v.estado === EstadoVentanilla.ABIERTA))
      setMonedas(monedasResponse.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos necesarios",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      clienteId: 0,
      ventanillaId: 0,
      monedaOrigenId: 0,
      monedaDestinoId: 0,
      montoOrigen: 0,
      observaciones: "",
    })
    setConversion(null)
  }

  const calcularConversion = async () => {
    if (!formData.montoOrigen || !formData.monedaOrigenId || !formData.monedaDestinoId) {
      return
    }

    setIsCalculating(true)
    try {
      const request: CalcularConversionRequest = {
        montoOrigen: formData.montoOrigen,
        monedaOrigenId: formData.monedaOrigenId,
        monedaDestinoId: formData.monedaDestinoId,
        casaDeCambioId: 1, // TODO: Obtener de contexto
      }

      const response = await transaccionService.calcularConversion(request)
      setConversion(response.data)
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

  useEffect(() => {
    if (formData.montoOrigen > 0 && formData.monedaOrigenId && formData.monedaDestinoId) {
      calcularConversion()
    } else {
      setConversion(null)
    }
  }, [formData.montoOrigen, formData.monedaOrigenId, formData.monedaDestinoId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!conversion) {
      toast({
        title: "Error",
        description: "Debe calcular la conversión antes de procesar",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await transaccionService.procesarCambio(formData)
      toast({
        title: "Éxito",
        description: "Transacción procesada correctamente",
      })
      onSave()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar la transacción",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof ProcesarCambioRequest, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const getMonedaNombre = (monedaId: number) => {
    const moneda = monedas.find((m) => m.id === monedaId)
    return moneda ? `${moneda.nombre} (${moneda.codigo})` : "N/A"
  }

  const getClienteNombre = (clienteId: number) => {
    const cliente = clientes.find((c) => c.id === clienteId)
    if (!cliente) return "N/A"

    if (cliente.persona) {
      return `${cliente.persona.nombres} ${cliente.persona.apellidoPaterno}`
    }
    return cliente.descripcion
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Procesar Transacción</DialogTitle>
          <DialogDescription>Completa los datos para procesar una nueva transacción de cambio</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Select
                value={formData.clienteId.toString()}
                onValueChange={(value) => handleChange("clienteId", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id.toString()}>
                      {getClienteNombre(cliente.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ventanilla">Ventanilla *</Label>
              <Select
                value={formData.ventanillaId.toString()}
                onValueChange={(value) => handleChange("ventanillaId", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una ventanilla" />
                </SelectTrigger>
                <SelectContent>
                  {ventanillas.map((ventanilla) => (
                    <SelectItem key={ventanilla.id} value={ventanilla.id.toString()}>
                      {ventanilla.nombre} ({ventanilla.identificador})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="moneda_origen">Moneda Origen *</Label>
              <Select
                value={formData.monedaOrigenId.toString()}
                onValueChange={(value) => handleChange("monedaOrigenId", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona moneda" />
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
              <Label htmlFor="monto_origen">Monto Origen *</Label>
              <Input
                id="monto_origen"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.montoOrigen}
                onChange={(e) => handleChange("montoOrigen", Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moneda_destino">Moneda Destino *</Label>
              <Select
                value={formData.monedaDestinoId.toString()}
                onValueChange={(value) => handleChange("monedaDestinoId", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona moneda" />
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
          </div>

          {/* Resultado de Conversión */}
          {conversion && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultado de Conversión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Monto a entregar:</span>
                  <span className="font-semibold">
                    {formatCurrency(conversion.montoDestino, getMonedaNombre(formData.monedaDestinoId))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tipo de cambio:</span>
                  <span className="font-semibold">{conversion.tipoCambio.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ganancia:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(conversion.ganancia, "PEN")}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleChange("observaciones", e.target.value)}
              placeholder="Observaciones adicionales (opcional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isCalculating || !conversion}>
              {(isLoading || isCalculating) && <LoadingSpinner size="sm" className="mr-2" />}
              Procesar Transacción
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
