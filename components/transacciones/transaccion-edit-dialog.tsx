"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, ArrowRightLeft, AlertCircle } from "lucide-react"
import type { TransaccionDto } from "@/types/transaccion"
import { EstadoTransaccion } from "@/types/enums"
import { transaccionService } from "@/services/transaccion-service"
import { formatCurrency, formatDateTime } from "@/utils/format"
import { useEffect, useState } from "react"

const editTransaccionSchema = z.object({
  monto_origen: z.number().min(0.01, "El monto debe ser mayor a 0"),
  monto_destino: z.number().min(0.01, "El monto debe ser mayor a 0"),
  tipo_cambio_aplicado: z.number().min(0.0001, "El tipo de cambio debe ser mayor a 0"),
  observaciones: z.string().optional(),
  estado: z.nativeEnum(EstadoTransaccion),
})

type EditTransaccionFormValues = z.infer<typeof editTransaccionSchema>

interface TransaccionEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaccion: TransaccionDto | null
  onSave: () => void
}

export function TransaccionEditDialog({
  open,
  onOpenChange,
  transaccion,
  onSave,
}: TransaccionEditDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<EditTransaccionFormValues>({
    resolver: zodResolver(editTransaccionSchema),
    defaultValues: {
      monto_origen: 0,
      monto_destino: 0,
      tipo_cambio_aplicado: 0,
      observaciones: "",
      estado: EstadoTransaccion.PENDIENTE,
    },
  })

  useEffect(() => {
    if (transaccion && open) {
      form.reset({
        monto_origen: transaccion.monto_origen,
        monto_destino: transaccion.monto_destino,
        tipo_cambio_aplicado: transaccion.tipo_cambio_aplicado,
        observaciones: transaccion.observaciones || "",
        estado: transaccion.estado,
      })
    }
  }, [transaccion, open, form])

  const onSubmit = async (values: EditTransaccionFormValues) => {
    if (!transaccion) return

    setIsLoading(true)
    try {
      await transaccionService.update(transaccion.id, {
        monto_origen: values.monto_origen,
        monto_destino: values.monto_destino,
        tipo_cambio_aplicado: values.tipo_cambio_aplicado,
        observaciones: values.observaciones,
        estado: values.estado,
      })

      toast({
        title: "Éxito",
        description: "Transacción actualizada correctamente",
      })

      onSave()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la transacción",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  // Calcular el monto destino basado en el monto origen y tipo de cambio
  const montoOrigen = form.watch("monto_origen")
  const tipoCambio = form.watch("tipo_cambio_aplicado")

  useEffect(() => {
    if (montoOrigen && tipoCambio) {
      const montoDestino = montoOrigen * tipoCambio
      form.setValue("monto_destino", Number(montoDestino.toFixed(4)), { shouldValidate: false })
    }
  }, [montoOrigen, tipoCambio, form])

  if (!transaccion) return null

  const getEstadoBadge = (estado: EstadoTransaccion) => {
    switch (estado) {
      case EstadoTransaccion.COMPLETADA:
        return <Badge className="bg-green-500">Completada</Badge>
      case EstadoTransaccion.PENDIENTE:
        return <Badge className="bg-yellow-500">Pendiente</Badge>
      case EstadoTransaccion.CANCELADA:
        return <Badge variant="destructive">Cancelada</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-primary" />
            <div>
              <DialogTitle className="text-xl">Editar Transacción</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                {transaccion.numero_transaccion} • {formatDateTime(transaccion.created_at)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Información del Cliente (Solo lectura) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">
              {transaccion.cliente?.persona
                ? `${transaccion.cliente.persona.nombres} ${transaccion.cliente.persona.apellido_paterno} ${transaccion.cliente.persona.apellido_materno}`
                : transaccion.cliente?.descripcion || "N/A"}
            </p>
            <p className="text-muted-foreground">
              Ventanilla: {transaccion.ventanilla?.nombre || "N/A"}
            </p>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Advertencia de edición */}
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Advertencia</p>
                <p className="text-yellow-700">
                  Los cambios en una transacción afectarán los balances de las ventanillas y reportes.
                  Asegúrese de que los valores sean correctos.
                </p>
              </div>
            </div>

            {/* Información de Monedas */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Moneda Origen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{transaccion.moneda_origen?.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaccion.moneda_origen?.codigo} • {transaccion.moneda_origen?.simbolo}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Moneda Destino</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{transaccion.moneda_destino?.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaccion.moneda_destino?.codigo} • {transaccion.moneda_destino?.simbolo}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Campos editables */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="monto_origen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto Origen ({transaccion.moneda_origen?.codigo})</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
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
                  name="tipo_cambio_aplicado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Cambio</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
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

              <FormField
                control={form.control}
                name="monto_destino"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Destino ({transaccion.moneda_destino?.codigo}) - Calculado</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        readOnly
                        className="bg-muted"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={EstadoTransaccion.PENDIENTE}>Pendiente</SelectItem>
                        <SelectItem value={EstadoTransaccion.COMPLETADA}>Completada</SelectItem>
                        <SelectItem value={EstadoTransaccion.CANCELADA}>Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observaciones adicionales..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}