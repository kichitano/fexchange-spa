"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Building, FileText, Calendar, Phone, MapPin, CreditCard, Briefcase } from "lucide-react"
import type { ClienteDto } from "@/types/cliente"
import { TipoCliente } from "@/types/enums"
import { formatDate } from "@/utils/format"

interface ClienteViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente: ClienteDto | null
  onEdit?: (cliente: ClienteDto) => void
}

export function ClienteViewDialog({
  open,
  onOpenChange,
  cliente,
  onEdit,
}: ClienteViewDialogProps) {
  if (!cliente) return null

  const getTipoClienteBadge = (tipo: TipoCliente) => {
    switch (tipo) {
      case TipoCliente.REGISTRADO:
        return <Badge className="bg-blue-500">Cliente Registrado</Badge>
      case TipoCliente.OTRO:
        return <Badge variant="outline">Cliente Ocasional</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const isRegistrado = cliente.tipo_cliente === TipoCliente.REGISTRADO

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {isRegistrado ? (
              <Building className="h-6 w-6 text-primary" />
            ) : (
              <User className="h-6 w-6 text-primary" />
            )}
            <div>
              <DialogTitle className="text-xl">
                {isRegistrado && cliente.razon_social 
                  ? cliente.razon_social
                  : cliente.persona
                    ? `${cliente.persona.nombres} ${cliente.persona.apellido_paterno} ${cliente.persona.apellido_materno}`
                    : cliente.descripcion || "Cliente"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(cliente.created_at)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tipo de Cliente */}
          <div className="flex items-center justify-between">
            {getTipoClienteBadge(cliente.tipo_cliente)}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(cliente)}
            >
              Editar
            </Button>
          </div>

          {/* Información Empresarial (solo para registrados) */}
          {isRegistrado && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Información Empresarial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">RUC</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {cliente.ruc || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Razón Social</p>
                    <p className="text-sm text-muted-foreground">
                      {cliente.razon_social || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información Personal (para registrados) o Descripción (para ocasionales) */}
          {cliente.persona ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {isRegistrado ? "Representante Legal" : "Información Personal"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Nombres</p>
                    <p className="text-sm text-muted-foreground">
                      {cliente.persona.nombres}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Apellido Paterno</p>
                    <p className="text-sm text-muted-foreground">
                      {cliente.persona.apellido_paterno}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Apellido Materno</p>
                    <p className="text-sm text-muted-foreground">
                      {cliente.persona.apellido_materno}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Documento de Identidad</p>
                      <p className="text-sm text-muted-foreground">
                        {cliente.persona.tipo_documento}: {cliente.persona.numero_documento}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Fecha de Nacimiento</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(cliente.persona.fecha_nacimiento)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Teléfono</p>
                      <p className="text-sm text-muted-foreground">
                        {cliente.persona.numero_telefono}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Nacionalidad</p>
                      <p className="text-sm text-muted-foreground">
                        {cliente.persona.nacionalidad}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Ocupación</p>
                      <p className="text-sm text-muted-foreground">
                        {cliente.persona.ocupacion}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Dirección</p>
                      <p className="text-sm text-muted-foreground">
                        {cliente.persona.direccion}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Descripción del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {cliente.descripcion || "Sin descripción"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Información del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Fecha de Registro</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(cliente.created_at)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Última Actualización</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(cliente.updated_at)}
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