"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { personaService } from "@/services/persona-service"
import type { PersonaDto, CreatePersonaRequest, UpdatePersonaRequest } from "@/types/persona"

const personaSchema = z.object({
  nombres: z.string().min(2, "Los nombres deben tener al menos 2 caracteres"),
  apellido_paterno: z.string().min(2, "El apellido paterno debe tener al menos 2 caracteres"),
  apellido_materno: z.string().min(2, "El apellido materno debe tener al menos 2 caracteres"),
  fecha_nacimiento: z.string().refine((date) => {
    const birthDate = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    return age >= 18 && age <= 100
  }, "La persona debe ser mayor de edad (18-100 años)"),
  numero_telefono: z.string().min(8, "El teléfono debe tener al menos 8 dígitos"),
  direccion: z.string().min(10, "La dirección debe tener al menos 10 caracteres"),
  tipo_documento: z.string().min(1, "Selecciona un tipo de documento"),
  numero_documento: z.string().min(8, "El número de documento debe tener al menos 8 caracteres"),
  nacionalidad: z.string().min(2, "La nacionalidad debe tener al menos 2 caracteres"),
  ocupacion: z.string().min(2, "La ocupación debe tener al menos 2 caracteres"),
})

type PersonaFormData = z.infer<typeof personaSchema>

interface PersonaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  persona?: PersonaDto | null
  onSuccess: () => void
}

const tiposDocumento = [
  { value: "DNI", label: "DNI" },
  { value: "PASAPORTE", label: "Pasaporte" },
  { value: "CARNET_EXTRANJERIA", label: "Carnet de Extranjería" },
  { value: "CEDULA", label: "Cédula" },
]

const nacionalidades = [
  "Peruana",
  "Argentina",
  "Boliviana",
  "Brasileña",
  "Chilena",
  "Colombiana",
  "Ecuatoriana",
  "Paraguaya",
  "Uruguaya",
  "Venezolana",
  "Estadounidense",
  "Mexicana",
  "Española",
  "Italiana",
  "Francesa",
  "Alemana",
  "China",
  "Japonesa",
  "Otra",
]

export function PersonaDialog({ open, onOpenChange, persona, onSuccess }: PersonaDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<PersonaFormData>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      nombres: "",
      apellido_paterno: "",
      apellido_materno: "",
      fecha_nacimiento: "",
      numero_telefono: "",
      direccion: "",
      tipo_documento: "",
      numero_documento: "",
      nacionalidad: "",
      ocupacion: "",
    },
  })

  useEffect(() => {
    if (persona) {
      form.reset({
        nombres: persona.nombres,
        apellido_paterno: persona.apellido_paterno,
        apellido_materno: persona.apellido_materno,
        fecha_nacimiento: new Date(persona.fecha_nacimiento).toISOString().split("T")[0],
        numero_telefono: persona.numero_telefono,
        direccion: persona.direccion,
        tipo_documento: persona.tipo_documento,
        numero_documento: persona.numero_documento,
        nacionalidad: persona.nacionalidad,
        ocupacion: persona.ocupacion,
      })
    } else {
      form.reset({
        nombres: "",
        apellido_paterno: "",
        apellido_materno: "",
        fecha_nacimiento: "",
        numero_telefono: "",
        direccion: "",
        tipo_documento: "",
        numero_documento: "",
        nacionalidad: "",
        ocupacion: "",
      })
    }
  }, [persona, form])

  const onSubmit = async (data: PersonaFormData) => {
    try {
      setLoading(true)

      const requestData = {
        ...data,
        fecha_nacimiento: new Date(data.fecha_nacimiento),
      }

      let response

      if (persona) {
        // Actualizar persona existente
        const updateData: UpdatePersonaRequest = requestData
        response = await personaService.update(persona.id, updateData)
      } else {
        // Crear nueva persona
        const createData: CreatePersonaRequest = requestData
        response = await personaService.create(createData)
      }

      // Si llegamos aquí, la operación fue exitosa (no se lanzó error)
      toast({
        title: "Éxito",
        description: persona ? "Persona actualizada correctamente" : "Persona creada correctamente",
      })
      onSuccess()
    } catch (error) {
      console.error("Error submitting persona:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar la solicitud",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{persona ? "Editar Persona" : "Nueva Persona"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="nombres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombres *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombres" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apellido_paterno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido Paterno *</FormLabel>
                    <FormControl>
                      <Input placeholder="Apellido Paterno" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apellido_materno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido Materno *</FormLabel>
                    <FormControl>
                      <Input placeholder="Apellido Materno" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fecha de Nacimiento y Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fecha_nacimiento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Nacimiento *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numero_telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono *</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de teléfono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dirección */}
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Dirección completa" className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo_documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposDocumento.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
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
                name="numero_documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Documento *</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de documento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Nacionalidad y Ocupación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nacionalidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nacionalidad *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar nacionalidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {nacionalidades.map((nacionalidad) => (
                          <SelectItem key={nacionalidad} value={nacionalidad}>
                            {nacionalidad}
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
                name="ocupacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ocupación *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ocupación" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : persona ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}