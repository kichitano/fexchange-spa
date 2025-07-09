"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Building2, Mail, Phone, Hash, CreditCard, Calendar, MapPin } from "lucide-react"
import type { CasaDeCambioDto } from "@/types/casa-cambio"
import type { MonedaDto } from "@/types/moneda"
import { formatDate } from "@/utils/format"

interface CasaDeCambioViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  casaDeCambio: CasaDeCambioDto | null
  monedas: MonedaDto[]
}

export function CasaDeCambioViewDialog({
  open,
  onOpenChange,
  casaDeCambio,
  monedas,
}: CasaDeCambioViewDialogProps) {
  if (!casaDeCambio) return null

  const getMonedaInfo = (monedaId: number) => {
    const moneda = monedas.find((m) => m.id === monedaId)
    return moneda ? { nombre: moneda.nombre, codigo: moneda.codigo, simbolo: moneda.simbolo } : null
  }

  const monedaMaestra = getMonedaInfo(casaDeCambio.moneda_maestra_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <div>
              <DialogTitle className="text-xl">{casaDeCambio.nombre}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {casaDeCambio.identificador}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              Activa
            </Badge>
            <span className="text-sm text-muted-foreground">
              Creada el {formatDate(casaDeCambio.created_at)}
            </span>
          </div>

          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">RUC</p>
                    <p className="text-sm text-muted-foreground">{casaDeCambio.ruc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{casaDeCambio.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Teléfono</p>
                    <p className="text-sm text-muted-foreground">{casaDeCambio.telefono}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Dirección</p>
                    <p className="text-sm text-muted-foreground">
                      {casaDeCambio.direccion || "No especificada"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración Financiera */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Configuración Financiera
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Moneda Maestra</p>
                  <p className="text-lg font-semibold">
                    {monedaMaestra ? (
                      <>
                        {monedaMaestra.simbolo} {monedaMaestra.nombre} ({monedaMaestra.codigo})
                      </>
                    ) : (
                      "No especificada"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Moneda base para todas las operaciones
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Temporal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información Temporal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Fecha de Creación</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(casaDeCambio.created_at)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Última Actualización</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(casaDeCambio.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas</CardTitle>
              <CardDescription>
                Resumen de actividad de la casa de cambio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">--</p>
                  <p className="text-xs text-muted-foreground">Ventanillas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">--</p>
                  <p className="text-xs text-muted-foreground">Usuarios</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">--</p>
                  <p className="text-xs text-muted-foreground">Transacciones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">--</p>
                  <p className="text-xs text-muted-foreground">Volumen</p>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground text-center">
                * Las estadísticas detalladas estarán disponibles próximamente
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}