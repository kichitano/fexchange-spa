"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Search, User, Building, Plus, Check } from "lucide-react"
import { TipoCliente } from "@/types/enums"
import { clienteService } from "@/services/cliente-service"
import type { ClienteDto } from "@/types/cliente"

const busquedaSchema = z.object({
  termino: z.string().min(1, "Ingrese un término de búsqueda"),
})

const clienteRegistradoSchema = z.object({
  nombres: z.string().min(1, "Nombres requeridos"),
  apellido_paterno: z.string().min(1, "Apellido paterno requerido"),
  apellido_materno: z.string().min(1, "Apellido materno requerido"),
  numero_documento: z.string().min(8, "Número de documento requerido"),
  tipo_documento: z.string().min(1, "Tipo de documento requerido"),
  numero_telefono: z.string().min(9, "Teléfono requerido"),
  direccion: z.string().min(1, "Dirección requerida"),
  fecha_nacimiento: z.string().min(1, "Fecha de nacimiento requerida"),
  nacionalidad: z.string().min(1, "Nacionalidad requerida"),
  ocupacion: z.string().min(1, "Ocupación requerida"),
})

const clienteEmpresarialSchema = z.object({
  ruc: z.string().min(11, "RUC debe tener 11 dígitos").max(11, "RUC debe tener 11 dígitos"),
  razon_social: z.string().min(1, "Razón social requerida"),
  direccion_fiscal: z.string().min(1, "Dirección fiscal requerida"),
  representante: clienteRegistradoSchema,
})

const clienteOcasionalSchema = z.object({
  nombres: z.string().min(1, "Nombres requeridos"),
  apellidos: z.string().min(1, "Apellidos requeridos"),
  numero_documento: z.string().min(8, "Número de documento requerido"),
  tipo_documento: z.string().min(1, "Tipo de documento requerido"),
})

type BusquedaFormValues = z.infer<typeof busquedaSchema>
type ClienteRegistradoFormValues = z.infer<typeof clienteRegistradoSchema>
type ClienteEmpresarialFormValues = z.infer<typeof clienteEmpresarialSchema>
type ClienteOcasionalFormValues = z.infer<typeof clienteOcasionalSchema>

interface ClienteSelectorRapidoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClienteSeleccionado: (clienteId: number) => void
  onClienteTemporalRegistrado: (clienteTemp: { nombres: string; apellidos: string; numero_documento: string; tipo_documento: string }) => void
}

export function ClienteSelectorRapido({
  open,
  onOpenChange,
  onClienteSeleccionado,
  onClienteTemporalRegistrado,
}: ClienteSelectorRapidoProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("buscar")
  const [clientes, setClientes] = useState<ClienteDto[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [tipoClienteNuevo, setTipoClienteNuevo] = useState<TipoCliente>(TipoCliente.REGISTRADO)

  const busquedaForm = useForm<BusquedaFormValues>({
    resolver: zodResolver(busquedaSchema),
    defaultValues: { termino: "" },
  })

  const registradoForm = useForm<ClienteRegistradoFormValues>({
    resolver: zodResolver(clienteRegistradoSchema),
    defaultValues: {
      nombres: "",
      apellido_paterno: "",
      apellido_materno: "",
      numero_documento: "",
      tipo_documento: "",
      numero_telefono: "",
      direccion: "",
      fecha_nacimiento: "",
      nacionalidad: "Peruana",
      ocupacion: "",
    },
  })

  const empresarialForm = useForm<ClienteEmpresarialFormValues>({
    resolver: zodResolver(clienteEmpresarialSchema),
    defaultValues: {
      ruc: "",
      razon_social: "",
      direccion_fiscal: "",
      representante: {
        nombres: "",
        apellido_paterno: "",
        apellido_materno: "",
        numero_documento: "",
        tipo_documento: "",
        numero_telefono: "",
        direccion: "",
        fecha_nacimiento: "",
        nacionalidad: "Peruana",
        ocupacion: "",
      },
    },
  })

  const ocasionalForm = useForm<ClienteOcasionalFormValues>({
    resolver: zodResolver(clienteOcasionalSchema),
    defaultValues: {
      nombres: "",
      apellidos: "",
      numero_documento: "",
      tipo_documento: "DNI",
    },
  })

  const onBuscar = async (values: BusquedaFormValues) => {
    setIsSearching(true)
    try {
      const response = await clienteService.search({
        nombres: values.termino,
        numero_documento: values.termino,
        ruc: values.termino,
        razon_social: values.termino,
        es_activo: true,
        limit: 20,
      })
      setClientes(response.data || [])
      
      if (response.data?.length === 0) {
        toast({
          title: "Sin resultados",
          description: "No se encontraron clientes. Puede crear uno nuevo.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al buscar clientes",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const onCrearRegistrado = async (values: ClienteRegistradoFormValues) => {
    setIsCreating(true)
    try {
      const response = await clienteService.createRegistrado({
        persona: {
          ...values,
          fecha_nacimiento: values.fecha_nacimiento,
        },
      })

      toast({
        title: "Éxito",
        description: "Cliente registrado creado correctamente",
      })

      onClienteSeleccionado(response.data.id)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el cliente",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const onCrearEmpresarial = async (values: ClienteEmpresarialFormValues) => {
    setIsCreating(true)
    try {
      const response = await clienteService.createEmpresarial({
        ruc: values.ruc,
        razon_social: values.razon_social,
        direccion_fiscal: values.direccion_fiscal,
        representante_legal: {
          ...values.representante,
          fecha_nacimiento: values.representante.fecha_nacimiento,
        },
      })

      toast({
        title: "Éxito",
        description: "Cliente empresarial creado correctamente",
      })

      onClienteSeleccionado(response.data.id)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el cliente",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const onCrearOcasional = async (values: ClienteOcasionalFormValues) => {
    try {
      // For occasional clients, we just pass the data to the parent without creating a permanent record
      onClienteTemporalRegistrado(values)
      onOpenChange(false)
      
      toast({
        title: "Éxito",
        description: "Cliente ocasional registrado para esta transacción",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al registrar cliente ocasional",
        variant: "destructive",
      })
    }
  }

  const handleClienteSelect = (cliente: ClienteDto) => {
    onClienteSeleccionado(cliente.id)
    onOpenChange(false)
  }

  const getTipoClienteBadge = (tipo: TipoCliente) => {
    switch (tipo) {
      case TipoCliente.REGISTRADO:
        return <Badge variant="default">Registrado</Badge>
      case TipoCliente.EMPRESARIAL:
        return <Badge variant="secondary">Empresarial</Badge>
      case TipoCliente.OCASIONAL:
        return <Badge variant="outline">Ocasional</Badge>
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-6 w-6" />
            Seleccionar Cliente
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buscar">Buscar Cliente</TabsTrigger>
            <TabsTrigger value="crear">Crear Nuevo</TabsTrigger>
          </TabsList>

          {/* Tab: Buscar Cliente */}
          <TabsContent value="buscar" className="space-y-4">
            <form onSubmit={busquedaForm.handleSubmit(onBuscar)} className="space-y-4">
              <div>
                <Label htmlFor="termino">Buscar por nombre, documento o RUC</Label>
                <div className="flex gap-2">
                  <Input
                    id="termino"
                    placeholder="Ingrese nombre, documento o RUC..."
                    {...busquedaForm.register("termino")}
                  />
                  <Button type="submit" disabled={isSearching}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>

            <ScrollArea className="h-96 w-full rounded-md border">
              <div className="p-4 space-y-2">
                {clientes.map((cliente) => (
                  <Card
                    key={cliente.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleClienteSelect(cliente)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {cliente.tipo === TipoCliente.EMPRESARIAL ? (
                              <Building className="h-4 w-4" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                            <span className="font-medium">
                              {cliente.persona
                                ? `${cliente.persona.nombres} ${cliente.persona.apellido_paterno} ${cliente.persona.apellido_materno}`
                                : cliente.razon_social || cliente.descripcion}
                            </span>
                            {getTipoClienteBadge(cliente.tipo)}
                          </div>
                          
                          {cliente.persona && (
                            <div className="text-sm text-muted-foreground">
                              {cliente.persona.tipo_documento}: {cliente.persona.numero_documento}
                            </div>
                          )}
                          
                          {cliente.ruc && (
                            <div className="text-sm text-muted-foreground">
                              RUC: {cliente.ruc}
                            </div>
                          )}
                          
                          {cliente.razon_social && (
                            <div className="text-sm text-muted-foreground">
                              {cliente.razon_social}
                            </div>
                          )}
                        </div>
                        
                        <Button variant="outline" size="sm">
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {clientes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay clientes para mostrar. Use la búsqueda o cree uno nuevo.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Tab: Crear Cliente */}
          <TabsContent value="crear" className="space-y-4">
            <div>
              <Label>Tipo de Cliente</Label>
              <RadioGroup
                value={tipoClienteNuevo}
                onValueChange={(value) => setTipoClienteNuevo(value as TipoCliente)}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={TipoCliente.REGISTRADO} id="reg" />
                  <Label htmlFor="reg" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Natural
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={TipoCliente.EMPRESARIAL} id="emp" />
                  <Label htmlFor="emp" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Empresarial
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={TipoCliente.OCASIONAL} id="oca" />
                  <Label htmlFor="oca" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Ocasional
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <ScrollArea className="h-96 w-full">
              {tipoClienteNuevo === TipoCliente.REGISTRADO && (
                <form onSubmit={registradoForm.handleSubmit(onCrearRegistrado)} className="space-y-4 p-1">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="nombres">Nombres *</Label>
                      <Input id="nombres" {...registradoForm.register("nombres")} />
                    </div>
                    <div>
                      <Label htmlFor="apellido_paterno">Apellido Paterno *</Label>
                      <Input id="apellido_paterno" {...registradoForm.register("apellido_paterno")} />
                    </div>
                    <div>
                      <Label htmlFor="apellido_materno">Apellido Materno *</Label>
                      <Input id="apellido_materno" {...registradoForm.register("apellido_materno")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo_documento">Tipo de Documento *</Label>
                      <Select onValueChange={(value) => registradoForm.setValue("tipo_documento", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DNI">DNI</SelectItem>
                          <SelectItem value="CE">Carné de Extranjería</SelectItem>
                          <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="numero_documento">Número de Documento *</Label>
                      <Input id="numero_documento" {...registradoForm.register("numero_documento")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                      <Input id="fecha_nacimiento" type="date" {...registradoForm.register("fecha_nacimiento")} />
                    </div>
                    <div>
                      <Label htmlFor="nacionalidad">Nacionalidad *</Label>
                      <Input id="nacionalidad" {...registradoForm.register("nacionalidad")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="numero_telefono">Teléfono *</Label>
                      <Input id="numero_telefono" {...registradoForm.register("numero_telefono")} />
                    </div>
                    <div>
                      <Label htmlFor="ocupacion">Ocupación *</Label>
                      <Input id="ocupacion" {...registradoForm.register("ocupacion")} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="direccion">Dirección *</Label>
                    <Input id="direccion" {...registradoForm.register("direccion")} />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creando..." : "Crear Cliente"}
                    </Button>
                  </DialogFooter>
                </form>
              )}

              {tipoClienteNuevo === TipoCliente.EMPRESARIAL && (
                <form onSubmit={empresarialForm.handleSubmit(onCrearEmpresarial)} className="space-y-4 p-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Datos Empresariales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ruc">RUC *</Label>
                          <Input id="ruc" maxLength={11} {...empresarialForm.register("ruc")} />
                        </div>
                        <div>
                          <Label htmlFor="razon_social">Razón Social *</Label>
                          <Input id="razon_social" {...empresarialForm.register("razon_social")} />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="direccion_fiscal">Dirección Fiscal *</Label>
                        <Input id="direccion_fiscal" {...empresarialForm.register("direccion_fiscal")} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Representante Legal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="rep_nombres">Nombres *</Label>
                          <Input id="rep_nombres" {...empresarialForm.register("representante.nombres")} />
                        </div>
                        <div>
                          <Label htmlFor="rep_apellido_paterno">Apellido Paterno *</Label>
                          <Input id="rep_apellido_paterno" {...empresarialForm.register("representante.apellido_paterno")} />
                        </div>
                        <div>
                          <Label htmlFor="rep_apellido_materno">Apellido Materno *</Label>
                          <Input id="rep_apellido_materno" {...empresarialForm.register("representante.apellido_materno")} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="rep_tipo_documento">Tipo de Documento *</Label>
                          <Select onValueChange={(value) => empresarialForm.setValue("representante.tipo_documento", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DNI">DNI</SelectItem>
                              <SelectItem value="CE">Carné de Extranjería</SelectItem>
                              <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="rep_numero_documento">Número de Documento *</Label>
                          <Input id="rep_numero_documento" {...empresarialForm.register("representante.numero_documento")} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="rep_fecha_nacimiento">Fecha de Nacimiento *</Label>
                          <Input id="rep_fecha_nacimiento" type="date" {...empresarialForm.register("representante.fecha_nacimiento")} />
                        </div>
                        <div>
                          <Label htmlFor="rep_nacionalidad">Nacionalidad *</Label>
                          <Input id="rep_nacionalidad" {...empresarialForm.register("representante.nacionalidad")} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="rep_numero_telefono">Teléfono *</Label>
                          <Input id="rep_numero_telefono" {...empresarialForm.register("representante.numero_telefono")} />
                        </div>
                        <div>
                          <Label htmlFor="rep_ocupacion">Ocupación *</Label>
                          <Input id="rep_ocupacion" {...empresarialForm.register("representante.ocupacion")} />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="rep_direccion">Dirección *</Label>
                        <Input id="rep_direccion" {...empresarialForm.register("representante.direccion")} />
                      </div>
                    </CardContent>
                  </Card>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creando..." : "Crear Cliente"}
                    </Button>
                  </DialogFooter>
                </form>
              )}

              {tipoClienteNuevo === TipoCliente.OCASIONAL && (
                <form onSubmit={ocasionalForm.handleSubmit(onCrearOcasional)} className="space-y-4 p-1">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nombres_oca">Nombres *</Label>
                        <Input id="nombres_oca" {...ocasionalForm.register("nombres")} />
                      </div>
                      <div>
                        <Label htmlFor="apellidos_oca">Apellidos *</Label>
                        <Input id="apellidos_oca" {...ocasionalForm.register("apellidos")} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tipo_documento_oca">Tipo de Documento *</Label>
                        <select 
                          id="tipo_documento_oca" 
                          {...ocasionalForm.register("tipo_documento")}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="DNI">DNI</option>
                          <option value="CE">Carné de Extranjería</option>
                          <option value="PASAPORTE">Pasaporte</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="numero_documento_oca">Número de Documento *</Label>
                        <Input id="numero_documento_oca" {...ocasionalForm.register("numero_documento")} />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Registrar Cliente Ocasional
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}