"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { usuarioService } from "@/services/usuario-service"
import { casaDeCambioService } from "@/services/casa-cambio-service"
import { personaService } from "@/services/persona-service"
import type { UsuarioDto, CreateUsuarioRequest, UpdateUsuarioRequest } from "@/types/usuario"
import type { CasaDeCambioDto } from "@/types/casa-cambio"
import type { PersonaDto } from "@/types/persona"
import { RolUsuario } from "@/types/enums"

const createUsuarioSchema = z.object({
  username: z.string().min(3, "El username debe tener al menos 3 caracteres").max(50),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  email: z.string().email("Email inválido"),
  rol: z.nativeEnum(RolUsuario),
  persona_id: z.number().min(1, "Debe seleccionar una persona"),
  casa_de_cambio_id: z.number().min(1, "Debe seleccionar una casa de cambio"),
})

const updateUsuarioSchema = z.object({
  username: z.string().min(3, "El username debe tener al menos 3 caracteres").max(50).optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  rol: z.nativeEnum(RolUsuario).optional(),
  persona_id: z.number().min(1, "Debe seleccionar una persona").optional(),
})

type CreateUsuarioForm = z.infer<typeof createUsuarioSchema>
type UpdateUsuarioForm = z.infer<typeof updateUsuarioSchema>

interface UsuarioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario?: UsuarioDto | null
  casasDeCambio: CasaDeCambioDto[]
  personas: PersonaDto[]
  onSuccess: () => void
}

export function UsuarioDialog({ open, onOpenChange, usuario, onSuccess }: UsuarioDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [personas, setPersonas] = useState<PersonaDto[]>([])
  const [casasDeCambio, setCasasDeCambio] = useState<CasaDeCambioDto[]>([])
  const [personaOpen, setPersonaOpen] = useState(false)
  const [casaOpen, setCasaOpen] = useState(false)
  const [personaSearch, setPersonaSearch] = useState("")
  const [casaSearch, setCasaSearch] = useState("")
  const isEditing = !!usuario

  const isAdminMaestro = user?.rol === RolUsuario.ADMINISTRADOR_MAESTRO

  const form = useForm<CreateUsuarioForm | UpdateUsuarioForm>({
    resolver: zodResolver(isEditing ? updateUsuarioSchema : createUsuarioSchema),
    defaultValues: isEditing
      ? {
          username: usuario?.username || "",
          email: usuario?.email || "",
          rol: usuario?.rol,
          persona_id: usuario?.persona_id,
        }
      : {
          username: "",
          password: "",
          email: "",
          rol: RolUsuario.CAJERO,
          persona_id: 0,
          casa_de_cambio_id: user?.casa_de_cambio_id || 0,
        },
  })

  useEffect(() => {
    if (open) {
      loadData()
      if (isEditing && usuario) {
        form.reset({
          username: usuario.username,
          email: usuario.email,
          rol: usuario.rol,
          persona_id: usuario.persona_id,
        })
      } else if (!isEditing) {
        form.reset({
          username: "",
          password: "",
          email: "",
          rol: RolUsuario.CAJERO,
          persona_id: 0,
          casa_de_cambio_id: user?.casa_de_cambio_id || 0,
        })
      }
    }
  }, [open, isEditing, usuario, form, user])

  const loadData = async () => {
    try {
      setLoadingData(true)
      console.log("Cargando datos...")

      // Cargar personas
      try {
        const personasResponse = await personaService.getAll()
        console.log("Personas response:", personasResponse)

        // The backend returns {message, data} format
        if (personasResponse && personasResponse.data && Array.isArray(personasResponse.data)) {
          setPersonas(personasResponse.data)
          console.log("Personas cargadas:", personasResponse.data.length)
        } else {
          console.error("Invalid personas response format:", personasResponse)
          setPersonas([])
        }
      } catch (error) {
        console.error("Error loading personas:", error)
        setPersonas([])
      }

      // Cargar casas de cambio
      if (isAdminMaestro) {
        try {
          const casasResponse = await casaDeCambioService.getAll()
          console.log("Casas response:", casasResponse)

          // The backend returns {message, data} format
          if (casasResponse && casasResponse.data && Array.isArray(casasResponse.data)) {
            setCasasDeCambio(casasResponse.data)
            console.log("Casas cargadas:", casasResponse.data.length)
          } else {
            console.error("Invalid casas response format:", casasResponse)
            setCasasDeCambio([])
          }
        } catch (error) {
          console.error("Error loading casas:", error)
          setCasasDeCambio([])
        }
      } else if (user?.casa_de_cambio_id) {
        try {
          const casaResponse = await casaDeCambioService.getById(user.casa_de_cambio_id)
          console.log("Casa response:", casaResponse)

          // The backend returns {message, data} format
          if (casaResponse && casaResponse.data) {
            setCasasDeCambio([casaResponse.data])
            console.log("Casa cargada:", casaResponse.data.nombre)
          } else {
            console.error("Invalid casa response format:", casaResponse)
            setCasasDeCambio([])
          }
        } catch (error) {
          console.error("Error loading casa:", error)
          setCasasDeCambio([])
        }
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  const onSubmit = async (data: CreateUsuarioForm | UpdateUsuarioForm) => {
    try {
      setLoading(true)

      if (isEditing && usuario) {
        const updateData: UpdateUsuarioRequest = {
          username: data.username,
          email: data.email,
          rol: data.rol,
          persona_id: data.persona_id,
        }

        if ("password" in data && data.password) {
          updateData.password = data.password
        }

        await usuarioService.update(usuario.id!, updateData)
        toast({
          title: "Éxito",
          description: "Usuario actualizado correctamente",
        })
        onSuccess()
      } else {
        const createData = data as CreateUsuarioRequest
        await usuarioService.create(createData)
        toast({
          title: "Éxito",
          description: "Usuario creado correctamente",
        })
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al procesar la solicitud",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPersonaLabel = (persona: PersonaDto) => {
    return `${persona.numero_documento} - ${persona.nombres} ${persona.apellido_paterno} ${persona.apellido_materno}`
  }

  const getCasaLabel = (casa: CasaDeCambioDto) => {
    return `${casa.identificador} - ${casa.nombre}`
  }

  const filteredPersonas = personas.filter((persona) => {
    if (!personaSearch) return true
    const searchLower = personaSearch.toLowerCase()
    return (
      persona.numero_documento.toLowerCase().includes(searchLower) ||
      persona.apellido_paterno.toLowerCase().includes(searchLower) ||
      persona.apellido_materno.toLowerCase().includes(searchLower) ||
      persona.nombres.toLowerCase().includes(searchLower)
    )
  })

  const filteredCasas = casasDeCambio.filter((casa) => {
    if (!casaSearch) return true
    const searchLower = casaSearch.toLowerCase()
    return casa.identificador.toLowerCase().includes(searchLower) || casa.nombre.toLowerCase().includes(searchLower)
  })

  const getRolLabel = (rol: RolUsuario) => {
    switch (rol) {
      case RolUsuario.ADMINISTRADOR_MAESTRO:
        return "Administrador Maestro"
      case RolUsuario.ADMINISTRADOR:
        return "Administrador"
      case RolUsuario.ENCARGADO_VENTANILLA:
        return "Encargado de Ventanilla"
      case RolUsuario.CAJERO:
        return "Cajero"
      default:
        return rol
    }
  }

  const selectedPersona = personas.find((p) => p.id === form.watch("persona_id"))
  const selectedCasa = casasDeCambio.find((c) => c.id === form.watch("casa_de_cambio_id"))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Usuario" : "Crear Usuario"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del usuario. Deja la contraseña vacía si no deseas cambiarla."
              : "Completa los datos para crear un nuevo usuario."}
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Cargando datos...</div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de Usuario</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese el username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="usuario@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña {isEditing && "(opcional)"}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={isEditing ? "Dejar vacío para no cambiar" : "Ingrese la contraseña"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(RolUsuario).map((rol) => (
                          <SelectItem key={rol} value={rol}>
                            {getRolLabel(rol)}
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
                name="persona_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Persona</FormLabel>
                    <Popover open={personaOpen} onOpenChange={setPersonaOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn("justify-between", !field.value && "text-muted-foreground")}
                          >
                            {selectedPersona ? getPersonaLabel(selectedPersona) : "Seleccione una persona"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[500px] p-0">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Buscar por documento o apellido..."
                            value={personaSearch}
                            onValueChange={setPersonaSearch}
                          />
                          <CommandList>
                            <CommandEmpty>No se encontraron personas.</CommandEmpty>
                            <CommandGroup>
                              {filteredPersonas.map((persona) => (
                                <CommandItem
                                  key={persona.id}
                                  onSelect={() => {
                                    field.onChange(persona.id)
                                    setPersonaOpen(false)
                                    setPersonaSearch("")
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      persona.id === field.value ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {getPersonaLabel(persona)}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEditing && isAdminMaestro && (
                <FormField
                  control={form.control}
                  name="casa_de_cambio_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Casa de Cambio</FormLabel>
                      <Popover open={casaOpen} onOpenChange={setCasaOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn("justify-between", !field.value && "text-muted-foreground")}
                            >
                              {selectedCasa ? getCasaLabel(selectedCasa) : "Seleccione una casa de cambio"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[500px] p-0">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Buscar por identificador o nombre..."
                              value={casaSearch}
                              onValueChange={setCasaSearch}
                            />
                            <CommandList>
                              <CommandEmpty>No se encontraron casas de cambio.</CommandEmpty>
                              <CommandGroup>
                                {filteredCasas.map((casa) => (
                                  <CommandItem
                                    key={casa.id}
                                    onSelect={() => {
                                      field.onChange(casa.id)
                                      setCasaOpen(false)
                                      setCasaSearch("")
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        casa.id === field.value ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    {getCasaLabel(casa)}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || loadingData}>
                  {loading ? "Procesando..." : isEditing ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
