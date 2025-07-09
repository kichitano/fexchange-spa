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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ventanillaService } from "@/services/ventanilla-service"
import type { VentanillaDto, CreateVentanillaRequest, UpdateVentanillaRequest } from "@/types/ventanilla"
import type { CasaDeCambioDto } from "@/types/casa-cambio"
import { useToast } from "@/hooks/use-toast"

interface VentanillaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ventanilla?: VentanillaDto | null
  casasDeCambio: CasaDeCambioDto[]
  onSave: () => void
}

export function VentanillaDialog({ open, onOpenChange, ventanilla, casasDeCambio, onSave }: VentanillaDialogProps) {
  const [formData, setFormData] = useState<CreateVentanillaRequest>({
    identificador: "",
    nombre: "",
    casa_de_cambio_id: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (ventanilla) {
      setFormData({
        identificador: ventanilla.identificador,
        nombre: ventanilla.nombre,
        casa_de_cambio_id: ventanilla.casa_de_cambio_id,
      })
    } else {
      setFormData({
        identificador: "",
        nombre: "",
        casa_de_cambio_id: 0,
      })
    }
  }, [ventanilla, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (ventanilla) {
        await ventanillaService.update(ventanilla.id, formData as UpdateVentanillaRequest)
      } else {
        await ventanillaService.create(formData)
      }
      onSave()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la ventanilla",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof CreateVentanillaRequest, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{ventanilla ? "Editar Ventanilla" : "Nueva Ventanilla"}</DialogTitle>
          <DialogDescription>
            {ventanilla ? "Modifica los datos de la ventanilla" : "Completa los datos para crear una nueva ventanilla"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identificador">Identificador *</Label>
            <Input
              id="identificador"
              value={formData.identificador}
              onChange={(e) => handleChange("identificador", e.target.value)}
              placeholder="Ej: V001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              placeholder="Ej: Ventanilla Principal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="casa_de_cambio">Casa de Cambio *</Label>
            <Select
              value={formData.casa_de_cambio_id.toString()}
              onValueChange={(value) => handleChange("casa_de_cambio_id", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una casa de cambio" />
              </SelectTrigger>
              <SelectContent>
                {casasDeCambio.map((casa) => (
                  <SelectItem key={casa.id} value={casa.id.toString()}>
                    {casa.nombre} ({casa.identificador})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              {ventanilla ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
