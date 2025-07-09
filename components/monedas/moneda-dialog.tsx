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
import { monedaService } from "@/services/moneda-service"
import type { MonedaDto, CreateMonedaRequest, UpdateMonedaRequest } from "@/types/moneda"
import { useToast } from "@/hooks/use-toast"

interface MonedaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moneda?: MonedaDto | null
  onSave: () => void
}

const MONEDAS_COMUNES = [
  { codigo: "PEN", nombre: "Sol Peruano", simbolo: "S/" },
  { codigo: "USD", nombre: "Dólar Americano", simbolo: "$" },
  { codigo: "EUR", nombre: "Euro", simbolo: "€" },
  { codigo: "GBP", nombre: "Libra Esterlina", simbolo: "£" },
  { codigo: "JPY", nombre: "Yen Japonés", simbolo: "¥" },
  { codigo: "CAD", nombre: "Dólar Canadiense", simbolo: "C$" },
  { codigo: "AUD", nombre: "Dólar Australiano", simbolo: "A$" },
  { codigo: "CHF", nombre: "Franco Suizo", simbolo: "CHF" },
  { codigo: "CNY", nombre: "Yuan Chino", simbolo: "¥" },
  { codigo: "BRL", nombre: "Real Brasileño", simbolo: "R$" },
]

export function MonedaDialog({ open, onOpenChange, moneda, onSave }: MonedaDialogProps) {
  const [formData, setFormData] = useState<CreateMonedaRequest>({
    codigo: "",
    nombre: "",
    simbolo: "",
    decimales: 2,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (moneda) {
      setFormData({
        codigo: moneda.codigo,
        nombre: moneda.nombre,
        simbolo: moneda.simbolo,
        decimales: moneda.decimales,
      })
      setSelectedTemplate("")
    } else {
      setFormData({
        codigo: "",
        nombre: "",
        simbolo: "",
        decimales: 2,
      })
      setSelectedTemplate("")
    }
  }, [moneda, open])

  const handleTemplateChange = (templateCodigo: string) => {
    setSelectedTemplate(templateCodigo)

    if (templateCodigo) {
      const template = MONEDAS_COMUNES.find((m) => m.codigo === templateCodigo)
      if (template) {
        setFormData({
          codigo: template.codigo,
          nombre: template.nombre,
          simbolo: template.simbolo,
          decimales: template.codigo === "JPY" ? 0 : 2, // Yen no tiene decimales
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validaciones adicionales
      if (formData.codigo.length < 3) {
        throw new Error("El código debe tener al menos 3 caracteres")
      }

      if (formData.decimales < 0 || formData.decimales > 8) {
        throw new Error("Los decimales deben estar entre 0 y 8")
      }

      if (moneda) {
        await monedaService.update(moneda.id, formData as UpdateMonedaRequest)
      } else {
        await monedaService.create(formData)
      }
      onSave()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la moneda",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof CreateMonedaRequest, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{moneda ? "Editar Moneda" : "Nueva Moneda"}</DialogTitle>
          <DialogDescription>
            {moneda ? "Modifica los datos de la moneda" : "Completa los datos para crear una nueva moneda"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template Selector - Solo para nuevas monedas */}
          {!moneda && (
            <div className="space-y-2">
              <Label htmlFor="template">Plantilla (Opcional)</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una moneda común" />
                </SelectTrigger>
                <SelectContent>
                  {MONEDAS_COMUNES.map((template) => (
                    <SelectItem key={template.codigo} value={template.codigo}>
                      {template.codigo} - {template.nombre} ({template.simbolo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => handleChange("codigo", e.target.value.toUpperCase())}
                placeholder="Ej: USD"
                maxLength={10}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="simbolo">Símbolo *</Label>
              <Input
                id="simbolo"
                value={formData.simbolo}
                onChange={(e) => handleChange("simbolo", e.target.value)}
                placeholder="Ej: $"
                maxLength={10}
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
              placeholder="Ej: Dólar Americano"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="decimales">Decimales *</Label>
            <Select
              value={formData.decimales.toString()}
              onValueChange={(value) => handleChange("decimales", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} decimal{num !== 1 ? "es" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {formData.codigo && formData.simbolo && (
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Vista Previa:</Label>
              <div className="mt-1 text-lg">
                {formData.simbolo} 1,234{formData.decimales > 0 ? "." + "0".repeat(formData.decimales) : ""}{" "}
                {formData.codigo}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              {moneda ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
