"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { User, Building, FileText, Briefcase } from "lucide-react"
import { TipoCliente } from "@/types/enums"
import { clienteService } from "@/services/cliente-service"

const personaSchema = z.object({
  nombres: z.string().min(1, "Los nombres son requeridos"),
  apellido_paterno: z.string().min(1, "El apellido paterno es requerido"),
  apellido_materno: z.string().min(1, "El apellido materno es requerido"),
  fecha_nacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
  numero_telefono: z.string().min(1, "El número de teléfono es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  tipo_documento: z.string().min(1, "El tipo de documento es requerido"),
  numero_documento: z.string().min(1, "El número de documento es requerido"),
  nacionalidad: z.string().min(1, "La nacionalidad es requerida"),
  ocupacion: z.string().min(1, "La ocupación es requerida"),
})

const clienteRegistradoSchema = z.object({
  tipo_cliente: z.literal(TipoCliente.REGISTRADO),
  ruc: z.string().min(1, "El RUC es requerido"),
  razon_social: z.string().min(1, "La razón social es requerida"),
  persona: personaSchema,
})

const clienteOcasionalSchema = z.object({
  tipo_cliente: z.literal(TipoCliente.OCASIONAL),
  descripcion: z.string().optional(),
})

const clienteEmpresarialSchema = z.object({
  tipo_cliente: z.literal(TipoCliente.EMPRESARIAL),
  razon_social: z.string().min(1, "La razón social es requerida"),
  ruc: z.string().min(11, "El RUC debe tener 11 dígitos").max(11, "El RUC debe tener 11 dígitos"),
  direccion_fiscal: z.string().min(1, "La dirección fiscal es requerida"),
  descripcion: z.string().optional(),
  representante_legal: personaSchema,
})

const clienteSchema = z.discriminatedUnion("tipo_cliente", [
  clienteRegistradoSchema,
  clienteEmpresarialSchema,
  clienteOcasionalSchema,
])

type ClienteFormValues = z.infer<typeof clienteSchema>

interface ClienteCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ClienteCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: ClienteCreateDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>(TipoCliente.REGISTRADO)

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      tipo_cliente: TipoCliente.REGISTRADO,
      ruc: "",
      razon_social: "",
      descripcion: "",
      persona: {
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
    },
  })

  const onSubmit = async (values: ClienteFormValues) => {
    setIsLoading(true)
    try {
      if (values.tipo_cliente === TipoCliente.REGISTRADO) {
        await clienteService.createRegistrado({
          ruc: values.ruc,
          razon_social: values.razon_social,
          persona: {
            ...values.persona,
            fecha_nacimiento: values.persona.fecha_nacimiento,
          },
        })
      } else if (values.tipo_cliente === TipoCliente.EMPRESARIAL) {
        await clienteService.createEmpresarial({
          razon_social: values.razon_social,
          ruc: values.ruc,
          direccion_fiscal: values.direccion_fiscal,
          descripcion: values.descripcion,
          representante_legal: {
            ...values.representante_legal,
            fecha_nacimiento: values.representante_legal.fecha_nacimiento,
          },
        })
      } else {
        await clienteService.createOcasional({
          descripcion: values.descripcion,
        })
      }

      toast({
        title: "Éxito",
        description: "Cliente creado correctamente",
      })

      onSuccess()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el cliente",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Crear Cliente
          </DialogTitle>
          <DialogDescription>
            Complete la información para registrar un nuevo cliente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Tipo de Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tipo de Cliente</CardTitle>
                <CardDescription>
                  Seleccione el tipo de cliente a registrar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="tipo_cliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value)
                            setTipoCliente(value as TipoCliente)
                          }}
                          defaultValue={field.value}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={TipoCliente.REGISTRADO} id="registrado" />
                            <Label htmlFor="registrado" className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              Cliente Registrado
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={TipoCliente.EMPRESARIAL} id="empresarial" />
                            <Label htmlFor="empresarial" className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4" />
                              Cliente Empresarial
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={TipoCliente.OCASIONAL} id="ocasional" />
                            <Label htmlFor="ocasional" className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Cliente Ocasional
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Cliente Registrado */}
            {tipoCliente === TipoCliente.REGISTRADO && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Empresarial (Opcional)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ruc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>RUC (Opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="20123456789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="razon_social"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Razón Social (Opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Empresa S.A.C." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Datos de la Persona</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="persona.nombres"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombres</FormLabel>
                            <FormControl>
                              <Input placeholder="Juan Carlos" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="persona.apellido_paterno"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apellido Paterno</FormLabel>
                            <FormControl>
                              <Input placeholder="García" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="persona.apellido_materno"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apellido Materno</FormLabel>
                            <FormControl>
                              <Input placeholder="López" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="persona.tipo_documento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Documento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="DNI">DNI</SelectItem>
                                <SelectItem value="CE">Carné de Extranjería</SelectItem>
                                <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="persona.numero_documento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Documento</FormLabel>
                            <FormControl>
                              <Input placeholder="12345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="persona.fecha_nacimiento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Nacimiento</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="persona.nacionalidad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nacionalidad</FormLabel>
                            <FormControl>
                              <Input placeholder="Peruana" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="persona.numero_telefono"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input placeholder="+51 987654321" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="persona.ocupacion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ocupación</FormLabel>
                            <FormControl>
                              <Input placeholder="Gerente General" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="persona.direccion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <Input placeholder="Av. Principal 123, Lima" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </>
            )}

            {/* Cliente Empresarial */}
            {tipoCliente === TipoCliente.EMPRESARIAL && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Empresarial</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ruc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>RUC *</FormLabel>
                            <FormControl>
                              <Input placeholder="20123456789" {...field} maxLength={11} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="razon_social"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Razón Social *</FormLabel>
                            <FormControl>
                              <Input placeholder="Empresa S.A.C." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="direccion_fiscal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección Fiscal *</FormLabel>
                          <FormControl>
                            <Input placeholder="Av. Empresarial 456, Lima" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Representante Legal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="representante_legal.nombres"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombres *</FormLabel>
                            <FormControl>
                              <Input placeholder="Juan Carlos" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="representante_legal.apellido_paterno"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apellido Paterno *</FormLabel>
                            <FormControl>
                              <Input placeholder="García" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="representante_legal.apellido_materno"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apellido Materno *</FormLabel>
                            <FormControl>
                              <Input placeholder="López" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="representante_legal.tipo_documento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Documento *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="DNI">DNI</SelectItem>
                                <SelectItem value="CE">Carné de Extranjería</SelectItem>
                                <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="representante_legal.numero_documento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Documento *</FormLabel>
                            <FormControl>
                              <Input placeholder="12345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="representante_legal.fecha_nacimiento"
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
                        name="representante_legal.nacionalidad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nacionalidad *</FormLabel>
                            <FormControl>
                              <Input placeholder="Peruana" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="representante_legal.numero_telefono"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono *</FormLabel>
                            <FormControl>
                              <Input placeholder="+51 987654321" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="representante_legal.ocupacion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ocupación *</FormLabel>
                            <FormControl>
                              <Input placeholder="Gerente General" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="representante_legal.direccion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección *</FormLabel>
                          <FormControl>
                            <Input placeholder="Av. Principal 123, Lima" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </>
            )}

            {/* Cliente Ocasional */}
            {tipoCliente === TipoCliente.OCASIONAL && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cliente Ocasional</CardTitle>
                  <CardDescription>
                    Para clientes que no requieren registro completo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción del Cliente (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Turista extranjero, Cliente sin documento, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

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
                {isLoading ? "Creando..." : "Crear Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}