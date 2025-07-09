"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { CreditCard, User, Building, ArrowRightLeft, Calendar, FileText, X, Edit, AlertCircle } from "lucide-react"
import type { TransaccionDto } from "@/types/transaccion"
import { EstadoTransaccion } from "@/types/enums"
import { formatCurrency, formatDateTime } from "@/utils/format"
import { useToast } from "@/hooks/use-toast"
import { transaccionService } from "@/services/transaccion-service"

interface TransaccionViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaccion: TransaccionDto | null
  onEdit?: (transaccion: TransaccionDto) => void
  onRefresh?: () => void
}

export function TransaccionViewDialog({
  open,
  onOpenChange,
  transaccion,
  onEdit,
  onRefresh,
}: TransaccionViewDialogProps) {
  const { toast } = useToast()

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

  const handleCancelar = async () => {
    try {
      await transaccionService.cancelar(transaccion.id)
      toast({
        title: "Éxito",
        description: "Transacción cancelada correctamente",
      })
      onRefresh?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar la transacción",
        variant: "destructive",
      })
    }
  }

  const canEdit = transaccion.estado === EstadoTransaccion.PENDIENTE
  const canCancel = transaccion.estado !== EstadoTransaccion.CANCELADA

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-primary" />
            <div>
              <DialogTitle className="text-xl">{transaccion.numero_transaccion}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDateTime(transaccion.created_at)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado */}
          <div className="flex items-center justify-between">
            {getEstadoBadge(transaccion.estado)}
            <div className="flex gap-2">
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(transaccion)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        Cancelar Transacción
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Está seguro de que desea cancelar la transacción {transaccion.numero_transaccion}?
                        Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>No, mantener</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelar} className="bg-destructive hover:bg-destructive/90">
                        Sí, cancelar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Cliente</p>
                  <p className="text-sm text-muted-foreground">
                    {transaccion.cliente?.persona
                      ? `${transaccion.cliente.persona.nombres} ${transaccion.cliente.persona.apellido_paterno} ${transaccion.cliente.persona.apellido_materno}`
                      : transaccion.cliente?.descripcion || "N/A"}
                  </p>
                </div>
                {transaccion.cliente?.persona && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Documento</p>
                      <p className="text-sm text-muted-foreground">
                        {transaccion.cliente.persona.tipo_documento} - {transaccion.cliente.persona.numero_documento}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nacionalidad</p>
                      <p className="text-sm text-muted-foreground">{transaccion.cliente.persona.nacionalidad}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información de la Transacción */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Detalles de la Transacción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Moneda Origen</p>
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(transaccion.monto_origen, transaccion.moneda_origen?.codigo)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaccion.moneda_origen?.nombre} ({transaccion.moneda_origen?.codigo})
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Moneda Destino</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(transaccion.monto_destino, transaccion.moneda_destino?.codigo)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaccion.moneda_destino?.nombre} ({transaccion.moneda_destino?.codigo})
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Tipo de Cambio</p>
                  <p className="text-sm font-mono">{transaccion.tipo_cambio_aplicado.toFixed(4)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Ganancia</p>
                  <p className="text-sm text-green-600">
                    {formatCurrency(transaccion.ganancia || 0, transaccion.moneda_destino?.codigo)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Ventanilla</p>
                  <p className="text-sm text-muted-foreground">
                    {transaccion.ventanilla?.nombre || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Adicional */}
          {transaccion.observaciones && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {transaccion.observaciones}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Información Temporal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información Temporal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Fecha de Creación</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(transaccion.created_at)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Última Actualización</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(transaccion.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}