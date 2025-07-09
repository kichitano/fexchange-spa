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
import { Switch } from "@/components/ui/switch"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { casaDeCambioService } from "@/services/casa-cambio-service"
import type { CasaDeCambioDto, CreateCasaDeCambioRequest, UpdateCasaDeCambioRequest } from "@/types/casa-cambio"
import type { MonedaDto } from "@/types/moneda"
import { useToast } from "@/hooks/use-toast"

interface CasaDeCambioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  casaDeCambio?: CasaDeCambioDto | null
  monedas: MonedaDto[]
  onSave: () => void
}

export function CasaDeCambioDialog({ open, onOpenChange, casaDeCambio, monedas, onSave }: CasaDeCambioDialogProps) {
  const [formData, setFormData] = useState<CreateCasaDeCambioRequest>({
    identificador: "",
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
    ruc: "",
    razon_social: "",
    moneda_maestra_id: 0,
    activa: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (casaDeCambio) {
      setFormData({
        identificador: casaDeCambio.identificador,
        nombre: casaDeCambio.nombre,
        direccion: casaDeCambio.direccion,
        telefono: casaDeCambio.telefono,
        email: casaDeCambio.email,
        ruc: casaDeCambio.ruc,
        razon_social: casaDeCambio.razon_social,
        moneda_maestra_id: casaDeCambio.moneda_maestra_id,
        activa: casaDeCambio.activa,
      })
    } else {
      setFormData({
        identificador: "",
        nombre: "",
        direccion: "",
        telefono: "",
        email: "",
        ruc: "",
        razon_social: "",
        moneda_maestra_id: 0,
        activa: true,
      })
    }
  }, [casaDeCambio, open])

  /**
   * Handles form submission for create/update operations
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (casaDeCambio) {
        await casaDeCambioService.update(casaDeCambio.id, formData as UpdateCasaDeCambioRequest)
      } else {
        await casaDeCambioService.create(formData)
      }
      onSave()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la casa de cambio",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Updates form field values
   */
  const handleChange = (field: keyof CreateCasaDeCambioRequest, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{casaDeCambio ? "Editar Casa de Cambio" : "Nueva Casa de Cambio"}</DialogTitle>
          <DialogDescription>
            {casaDeCambio
              ? "Modifica los datos de la casa de cambio"
              : "Completa los datos para crear una nueva casa de cambio"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="identificador">Identificador *</Label>
              <Input
                id="identificador"
                value={formData.identificador}
                onChange={(e) => handleChange("identificador", e.target.value)}
                placeholder="Ej: CC001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC *</Label>
              <Input
                id="ruc"
                value={formData.ruc}
                onChange={(e) => handleChange("ruc", e.target.value)}
                placeholder="Ej: 20123456789"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              placeholder="Ej: Casa de Cambio Central"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="razon_social">Razón Social *</Label>
            <Input
              id="razon_social"
              value={formData.razon_social}
              onChange={(e) => handleChange("razon_social", e.target.value)}
              placeholder="Ej: Casa de Cambio Central S.A.C."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección *</Label>
            <Textarea
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleChange("direccion", e.target.value)}
              placeholder="Dirección completa de la casa de cambio"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                placeholder="Ej: 01-234-5678"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Ej: contacto@casacambio.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="moneda_maestra">Moneda Maestra *</Label>
            <Select
              value={formData.moneda_maestra_id.toString()}
              onValueChange={(value) => handleChange("moneda_maestra_id", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la moneda maestra" />
              </SelectTrigger>
              <SelectContent>
                {monedas.map((moneda) => (
                  <SelectItem key={moneda.id} value={moneda.id.toString()}>
                    {moneda.nombre} ({moneda.codigo}) - {moneda.simbolo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {casaDeCambio && (
            <div className="flex items-center space-x-2">
              <Switch
                id="activa"
                checked={formData.activa}
                onCheckedChange={(checked) => handleChange("activa", checked)}
              />
              <Label htmlFor="activa">Casa de cambio activa</Label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              {casaDeCambio ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
