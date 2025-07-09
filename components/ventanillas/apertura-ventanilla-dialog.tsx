"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ventanillaService } from "@/services/ventanilla-service"
import { monedaService } from "@/services/moneda-service"
import type { VentanillaDto, AperturarVentanillaRequest, MontoAperturaRequest } from "@/types/ventanilla"
import type { MonedaDto } from "@/types/moneda"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useVentanilla } from "@/contexts/ventanilla-context"
import { TransitionLoading } from "@/components/ui/transition-loading"

interface AperturaVentanillaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ventanilla?: VentanillaDto | null
  onSave: () => void
}

export function AperturaVentanillaDialog({ open, onOpenChange, ventanilla, onSave }: AperturaVentanillaDialogProps) {
  const [monedas, setMonedas] = useState<MonedaDto[]>([])
  const [montosApertura, setMontosApertura] = useState<MontoAperturaRequest[]>([])
  const [observaciones, setObservaciones] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const { setVentanillaActiva } = useVentanilla()
  const router = useRouter()

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

      // Inicializar con todas las monedas activas
      const montosIniciales = (response.data || []).map((moneda) => ({
        moneda_id: moneda.id,
        monto: 0,
      }))
      setMontosApertura(montosIniciales)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las monedas",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setObservaciones("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !ventanilla) return

    // Validar que al menos una moneda tenga monto mayor a 0
    const montosValidos = montosApertura.filter((monto) => {
      const montoNumerico = Number(monto.monto)
      const monedaIdNumerico = Number(monto.moneda_id)
      return !Number.isNaN(montoNumerico) && 
             !Number.isNaN(monedaIdNumerico) && 
             montoNumerico > 0 && 
             monedaIdNumerico > 0
    })
    
    if (montosValidos.length === 0) {
      toast({
        title: "Error",
        description: "Debe ingresar al menos un monto de apertura mayor a 0",
        variant: "destructive",
      })
      return
    }

    // Validar usuario_id
    if (!user.id || Number.isNaN(Number(user.id))) {
      toast({
        title: "Error",
        description: "ID de usuario inválido",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const data: AperturarVentanillaRequest = {
        usuario_id: Number(user.id),
        montos_apertura: montosValidos.map(monto => ({
          moneda_id: Number.parseInt(monto.moneda_id.toString()),
          monto: Number.parseFloat(monto.monto.toString())
        })),
        observaciones_apertura: observaciones?.trim() || undefined,
      }

      console.log('Datos a enviar al backend:', JSON.stringify(data, null, 2))

      await ventanillaService.aperturar(ventanilla.id, data)
      
      // Configurar ventanilla activa en el contexto
      const ventanillaInfo = {
        id: ventanilla.id,
        casaDeCambioId: ventanilla.casa_de_cambio?.id || 1,
        nombre: ventanilla.nombre,
        operador: `${user.persona?.nombres || ''} ${user.persona?.apellido_paterno || ''} ${user.persona?.apellido_materno || ''}`.trim(),
        sesionApertura: new Date().toISOString(), // Guardar como fecha ISO para mantener la hora exacta
        casaDeCambio: ventanilla.casa_de_cambio?.nombre || 'Casa de Cambio'
      }
      
      setVentanillaActiva(ventanillaInfo)
      onSave()
      
      toast({
        title: "Éxito",
        description: "Ventanilla aperturada correctamente",
      })
      
      // Mostrar pantalla de transición
      setShowTransition(true)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al aperturar la ventanilla",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleTransitionComplete = () => {
    setShowTransition(false)
    // Navegar directamente sin query params - el contexto maneja todo
    router.push('/dashboard/registrar-transaccion')
  }

  const handleMontoChange = (monedaId: number, monto: number) => {
    setMontosApertura((prev) => prev.map((item) => (item.moneda_id === monedaId ? { ...item, monto } : item)))
  }

  const getMonedaNombre = (monedaId: number) => {
    const moneda = monedas.find((m) => m.id === monedaId)
    return moneda ? `${moneda.nombre} (${moneda.codigo})` : "N/A"
  }

  const getMonedaSimbolo = (monedaId: number) => {
    const moneda = monedas.find((m) => m.id === monedaId)
    return moneda?.simbolo || ""
  }

  return (
    <>
      <TransitionLoading 
        isVisible={showTransition}
        onComplete={handleTransitionComplete}
        onPreload={async () => {
          // Precargar datos necesarios
          try {
            // Importar servicios dinámicamente
            const [{ tipoCambioService }, { transaccionService }] = await Promise.all([
              import('@/services/tipo-cambio-service'),
              import('@/services/transaccion-service')
            ])
            
            // Precargar tipos de cambio para la casa de cambio
            const casaDeCambioId = ventanilla?.casa_de_cambio?.id || 1
            await tipoCambioService.getByCasaDeCambio(casaDeCambioId)
            
            // Precargar historial de transacciones si hay ventanilla
            if (ventanilla?.id) {
              await transaccionService.getAll({ limit: 5 })
            }
          } catch (error) {
            console.warn('Error en precarga:', error)
          }
        }}
        duration={4000}
        title="Iniciando Sistema de Transacciones"
        subtitle="Preparando el módulo de registro de operaciones..."
      />
      
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aperturar Ventanilla</DialogTitle>
          <DialogDescription>Ingresa los montos de apertura para {ventanilla?.nombre}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Montos de Apertura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {montosApertura.map((monto) => (
                <div key={monto.moneda_id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>{getMonedaNombre(monto.moneda_id)}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{getMonedaSimbolo(monto.moneda_id)}</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={monto.monto}
                      onChange={(e) => {
                        const value = e.target.value
                        const parsedValue = value === '' ? 0 : Number.parseFloat(value)
                        handleMontoChange(monto.moneda_id, Number.isNaN(parsedValue) ? 0 : parsedValue)
                      }}
                      className="w-32"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Observaciones adicionales (opcional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              Aperturar Ventanilla
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
