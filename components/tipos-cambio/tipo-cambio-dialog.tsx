"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { tipoCambioService } from "@/services/tipo-cambio-service"
import { monedaService } from "@/services/moneda-service"
import type { TipoCambioDto, CreateTipoCambioRequest } from "@/types/tipo-cambio"
import type { MonedaDto } from "@/types/moneda"
import type { CasaDeCambioDto } from "@/types/casa-cambio"
import { useToast } from "@/hooks/use-toast"

const tipoCambioSchema = z.object({
  tipo_compra: z.number()
    .min(0.01, "El tipo de compra debe ser mayor a 0.01")
    .max(1000, "El tipo de compra no puede exceder 1000"),
  tipo_venta: z.number()
    .min(0.01, "El tipo de venta debe ser mayor a 0.01")
    .max(1000, "El tipo de venta no puede exceder 1000"),
  casa_de_cambio_id: z.number().min(1, "Debe seleccionar una casa de cambio"),
  moneda_origen_id: z.number().min(1, "Debe seleccionar una moneda origen"),
  moneda_destino_id: z.number().min(1, "Debe seleccionar una moneda destino"),
}).refine((data) => data.tipo_venta > data.tipo_compra, {
  message: "El tipo de venta debe ser mayor que el tipo de compra",
  path: ["tipo_venta"],
}).refine((data) => data.moneda_origen_id !== data.moneda_destino_id, {
  message: "La moneda origen y destino deben ser diferentes",
  path: ["moneda_destino_id"],
}).refine((data) => {
  const diferenciaPorcentaje = ((data.tipo_venta - data.tipo_compra) / data.tipo_compra) * 100;
  return diferenciaPorcentaje <= 50;
}, {
  message: "La diferencia entre venta y compra no puede exceder el 50%",
  path: ["tipo_venta"],
})

type TipoCambioFormValues = z.infer<typeof tipoCambioSchema>

interface TipoCambioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoCambio?: TipoCambioDto | null
  casaDeCambio: CasaDeCambioDto
  onSave: () => void
}

export function TipoCambioDialog({ 
  open, 
  onOpenChange, 
  tipoCambio, 
  casaDeCambio,
  onSave 
}: TipoCambioDialogProps) {
  const [monedas, setMonedas] = useState<MonedaDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMonedas, setIsLoadingMonedas] = useState(false)
  const [existeParActivo, setExisteParActivo] = useState(false)
  const [tipoAnterior, setTipoAnterior] = useState<TipoCambioDto | null>(null)
  const [showConfirmacionCambio, setShowConfirmacionCambio] = useState(false)
  const [cambiosDrasticos, setCambiosDrasticos] = useState({
    compra: 0,
    venta: 0,
    esDrastico: false
  })
  const { toast } = useToast()

  const form = useForm<TipoCambioFormValues>({
    resolver: zodResolver(tipoCambioSchema),
    defaultValues: {
      tipo_compra: 0,
      tipo_venta: 0,
      casa_de_cambio_id: casaDeCambio.id,
      moneda_origen_id: 0,
      moneda_destino_id: 0,
    },
  })

  useEffect(() => {
    if (open) {
      loadMonedas()
      resetForm()
    }
  }, [open])

  useEffect(() => {
    if (tipoCambio) {
      form.reset({
        tipo_compra: tipoCambio.tipo_compra,
        tipo_venta: tipoCambio.tipo_venta,
        casa_de_cambio_id: tipoCambio.casa_de_cambio_id,
        moneda_origen_id: tipoCambio.moneda_origen_id,
        moneda_destino_id: tipoCambio.moneda_destino_id,
      })
    }
  }, [tipoCambio, form])

  const loadMonedas = async () => {
    try {
      setIsLoadingMonedas(true)
      const response = await monedaService.getActivas()
      setMonedas(response.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las monedas",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMonedas(false)
    }
  }

  const resetForm = () => {
    if (!tipoCambio) {
      form.reset({
        tipo_compra: 0,
        tipo_venta: 0,
        casa_de_cambio_id: casaDeCambio.id,
        moneda_origen_id: 0,
        moneda_destino_id: 0,
      })
    }
    setExisteParActivo(false)
  }

  const verificarParActivo = async (monedaOrigenId: number, monedaDestinoId: number) => {
    if (monedaOrigenId && monedaDestinoId && monedaOrigenId !== monedaDestinoId) {
      try {
        const response = await tipoCambioService.getActivosPorCasa(casaDeCambio.id)
        const tiposActivos = response.data || []
        
        const existePar = tiposActivos.some(tipo => 
          tipo.moneda_origen_id === monedaOrigenId && 
          tipo.moneda_destino_id === monedaDestinoId &&
          (!tipoCambio || tipo.id !== tipoCambio.id) // Excluir el actual si estamos editando
        )
        
        setExisteParActivo(existePar)
      } catch (error) {
        // Silenciar errores de verificación
        setExisteParActivo(false)
      }
    } else {
      setExisteParActivo(false)
    }
  }

  // Watch para verificar duplicados en tiempo real
  const monedaOrigenId = form.watch("moneda_origen_id")
  const monedaDestinoId = form.watch("moneda_destino_id")

  useEffect(() => {
    if (monedaOrigenId && monedaDestinoId) {
      verificarParActivo(monedaOrigenId, monedaDestinoId)
      cargarTipoAnterior(monedaOrigenId, monedaDestinoId)
    }
  }, [monedaOrigenId, monedaDestinoId, casaDeCambio.id, tipoCambio?.id])

  // Watch para detectar cambios drásticos
  const tipoCompra = form.watch("tipo_compra")
  const tipoVenta = form.watch("tipo_venta")

  useEffect(() => {
    if (tipoAnterior && tipoCompra && tipoVenta) {
      const cambioCompra = ((tipoCompra - tipoAnterior.tipo_compra) / tipoAnterior.tipo_compra) * 100
      const cambioVenta = ((tipoVenta - tipoAnterior.tipo_venta) / tipoAnterior.tipo_venta) * 100
      
      const esDrastico = Math.abs(cambioCompra) > 5 || Math.abs(cambioVenta) > 5
      
      setCambiosDrasticos({
        compra: cambioCompra,
        venta: cambioVenta,
        esDrastico
      })
    }
  }, [tipoCompra, tipoVenta, tipoAnterior])

  /**
   * Carga el tipo de cambio anterior para comparar cambios
   */
  const cargarTipoAnterior = async (monedaOrigenId: number, monedaDestinoId: number) => {
    try {
      const response = await tipoCambioService.getByCasaDeCambio(casaDeCambio.id)
      if (response.data) {
        const tipoExistente = response.data.find(t => 
          t.moneda_origen_id === monedaOrigenId && 
          t.moneda_destino_id === monedaDestinoId &&
          t.id !== tipoCambio?.id
        )
        setTipoAnterior(tipoExistente || null)
      }
    } catch (error) {
      console.error('Error cargando tipo anterior:', error)
    }
  }

  /**
   * Validar cambios drásticos antes de enviar
   */
  const validarCambiosDrasticos = (values: TipoCambioFormValues): boolean => {
    if (!tipoAnterior) return true
    
    const cambioCompra = ((values.tipo_compra - tipoAnterior.tipo_compra) / tipoAnterior.tipo_compra) * 100
    const cambioVenta = ((values.tipo_venta - tipoAnterior.tipo_venta) / tipoAnterior.tipo_venta) * 100
    
    return Math.abs(cambioCompra) > 5 || Math.abs(cambioVenta) > 5
  }

  const onSubmit = async (values: TipoCambioFormValues) => {
    try {
      setIsLoading(true)

      // Verificar duplicados antes de enviar (para creación)
      if (!tipoCambio && existeParActivo) {
        toast({
          title: "Error",
          description: "Ya existe un tipo de cambio activo para este par de monedas",
          variant: "destructive",
        })
        return
      }

      // Validar cambios drásticos y solicitar confirmación
      if (validarCambiosDrasticos(values)) {
        setShowConfirmacionCambio(true)
        return
      }

      await procesarGuardado(values)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar el tipo de cambio",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Procesa el guardado del tipo de cambio
   */
  const procesarGuardado = async (values: TipoCambioFormValues) => {
    const requestData: CreateTipoCambioRequest = {
      tipo_compra: values.tipo_compra,
      tipo_venta: values.tipo_venta,
      casa_de_cambio_id: values.casa_de_cambio_id,
      moneda_origen_id: values.moneda_origen_id,
      moneda_destino_id: values.moneda_destino_id,
    }

    if (tipoCambio) {
      await tipoCambioService.update(tipoCambio.id, requestData)
    } else {
      await tipoCambioService.create(requestData)
    }

    toast({
      title: "Éxito",
      description: tipoCambio ? "Tipo de cambio actualizado correctamente" : "Tipo de cambio creado correctamente",
    })

    onSave()
    onOpenChange(false)
  }

  /**
   * Confirma y procesa cambios drásticos
   */
  const confirmarCambiosDrasticos = async () => {
    setShowConfirmacionCambio(false)
    const values = form.getValues()
    try {
      setIsLoading(true)
      await procesarGuardado(values)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar el tipo de cambio",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getMonedaNombre = (monedaId: number) => {
    const moneda = monedas.find(m => m.id === monedaId)
    return moneda ? `${moneda.codigo} - ${moneda.nombre}` : ""
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {tipoCambio ? "Editar Tipo de Cambio" : "Nuevo Tipo de Cambio"}
          </DialogTitle>
          <DialogDescription>
            Configure el tipo de cambio para {casaDeCambio.nombre}
          </DialogDescription>
        </DialogHeader>

        {isLoadingMonedas ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="moneda_origen_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda Origen</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar moneda origen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {monedas.map((moneda) => (
                            <SelectItem key={moneda.id} value={moneda.id.toString()}>
                              {getMonedaNombre(moneda.id)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="moneda_destino_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda Destino</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar moneda destino" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {monedas.map((moneda) => (
                            <SelectItem key={moneda.id} value={moneda.id.toString()}>
                              {getMonedaNombre(moneda.id)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Alerta de duplicado */}
              {existeParActivo && !tipoCambio && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Ya existe un tipo de cambio activo para este par de monedas. 
                    Desactive el actual antes de crear uno nuevo.
                  </AlertDescription>
                </Alert>
              )}

              {/* Alerta de cambios drásticos */}
              {cambiosDrasticos.esDrastico && tipoAnterior && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Cambios significativos detectados:</p>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          {cambiosDrasticos.compra > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : cambiosDrasticos.compra < 0 ? (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          ) : null}
                          <span>Compra: {cambiosDrasticos.compra.toFixed(2)}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {cambiosDrasticos.venta > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : cambiosDrasticos.venta < 0 ? (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          ) : null}
                          <span>Venta: {cambiosDrasticos.venta.toFixed(2)}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline">
                          Anterior: {tipoAnterior.tipo_compra.toFixed(4)} / {tipoAnterior.tipo_venta.toFixed(4)}
                        </Badge>
                        <Badge variant="outline">
                          Nuevo: {tipoCompra?.toFixed(4)} / {tipoVenta?.toFixed(4)}
                        </Badge>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipo_compra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo Compra</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          min="0.01"
                          max="1000"
                          placeholder="0.0000"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo_venta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo Venta</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          min="0.01"
                          max="1000"
                          placeholder="0.0000"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || (existeParActivo && !tipoCambio)}
                >
                  {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                  {tipoCambio ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
      
      {/* Dialog de confirmación para cambios drásticos */}
      <AlertDialog open={showConfirmacionCambio} onOpenChange={setShowConfirmacionCambio}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Cambios Significativos Detectados
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>
                  Los cambios que está realizando son significativos (mayor al 5%). 
                  Esto podría afectar las operaciones en curso.
                </p>
                
                {tipoAnterior && (
                  <div className="bg-muted p-3 rounded-md">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tipo Compra:</span>
                        <span className="flex items-center gap-2">
                          {tipoAnterior.tipo_compra.toFixed(4)} → {tipoCompra?.toFixed(4)}
                          <Badge variant={cambiosDrasticos.compra > 0 ? "default" : "destructive"}>
                            {cambiosDrasticos.compra > 0 ? '+' : ''}{cambiosDrasticos.compra.toFixed(2)}%
                          </Badge>
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tipo Venta:</span>
                        <span className="flex items-center gap-2">
                          {tipoAnterior.tipo_venta.toFixed(4)} → {tipoVenta?.toFixed(4)}
                          <Badge variant={cambiosDrasticos.venta > 0 ? "default" : "destructive"}>
                            {cambiosDrasticos.venta > 0 ? '+' : ''}{cambiosDrasticos.venta.toFixed(2)}%
                          </Badge>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground">
                  ¿Está seguro de que desea continuar con estos cambios?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarCambiosDrasticos}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              Confirmar Cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}