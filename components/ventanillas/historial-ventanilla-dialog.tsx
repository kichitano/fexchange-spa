"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ventanillaService } from "@/services/ventanilla-service"
import type { VentanillaDto } from "@/types/ventanilla"
import { useToast } from "@/hooks/use-toast"
import { formatDateTime, formatCurrency } from "@/utils/format"
import { Calendar, Clock, User, DollarSign } from "lucide-react"

interface HistorialVentanillaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ventanilla?: VentanillaDto | null
}

interface HistorialItem {
  id: number
  tipo: "APERTURA" | "CIERRE"
  fecha: Date
  hora: string
  usuario: {
    nombres: string
    apellidos: string
  }
  montos?: Array<{
    moneda: {
      codigo: string
      simbolo: string
    }
    monto: number
  }>
  ganancia_total?: number
  observaciones?: string
}

export function HistorialVentanillaDialog({ open, onOpenChange, ventanilla }: HistorialVentanillaDialogProps) {
  const [historial, setHistorial] = useState<HistorialItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && ventanilla) {
      loadHistorial()
    }
  }, [open, ventanilla])

  const loadHistorial = async () => {
    if (!ventanilla) return

    try {
      setIsLoading(true)
      const response = await ventanillaService.getHistorial(ventanilla.id)
      setHistorial(response.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de la ventanilla",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTipoBadge = (tipo: "APERTURA" | "CIERRE") => {
    return tipo === "APERTURA" ? (
      <Badge className="bg-green-500">Apertura</Badge>
    ) : (
      <Badge className="bg-red-500">Cierre</Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historial de Ventanilla</DialogTitle>
          <DialogDescription>
            Historial de aperturas y cierres de {ventanilla?.nombre} ({ventanilla?.identificador})
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            {historial.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sin historial</h3>
                  <p className="text-muted-foreground text-center">
                    Esta ventanilla aún no tiene registros de apertura o cierre
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {historial.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatDateTime(item.fecha)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{item.hora}</span>
                          </div>
                        </div>
                        {getTipoBadge(item.tipo)}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {item.usuario.nombres} {item.usuario.apellidos}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Montos */}
                      {item.montos && item.montos.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Montos de {item.tipo.toLowerCase()}:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {item.montos.map((monto, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                <span className="text-sm font-medium">{monto.moneda.codigo}</span>
                                <span className="text-sm">{formatCurrency(monto.monto, monto.moneda.codigo)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ganancia total (solo para cierres) */}
                      {item.tipo === "CIERRE" && item.ganancia_total !== undefined && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">
                            Ganancia Total: {formatCurrency(item.ganancia_total, "PEN")}
                          </span>
                        </div>
                      )}

                      {/* Observaciones */}
                      {item.observaciones && (
                        <div className="p-3 bg-muted rounded-lg">
                          <h4 className="font-medium mb-1">Observaciones:</h4>
                          <p className="text-sm text-muted-foreground">{item.observaciones}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
