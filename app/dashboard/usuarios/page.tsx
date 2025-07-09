"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Users, Shield, UserCheck, UserX, Key, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { usuarioService } from "@/services/usuario-service"
import { casaDeCambioService } from "@/services/casa-cambio-service"
import { personaService } from "@/services/persona-service"
import { UsuarioDialog } from "@/components/usuarios/usuario-dialog"
import { CambiarPasswordDialog } from "@/components/usuarios/cambiar-password-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { UsuarioDto } from "@/types/usuario"
import type { CasaDeCambioDto } from "@/types/casa-cambio"
import type { PersonaDto } from "@/types/persona"
import { RolUsuario } from "@/types/enums"

export default function UsuariosPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [usuarios, setUsuarios] = useState<(UsuarioDto & { nombres: string; apellidos: string })[]>([])
  const [casasDeCambio, setCasasDeCambio] = useState<CasaDeCambioDto[]>([])
  const [personas, setPersonas] = useState<PersonaDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCasaDeCambio, setSelectedCasaDeCambio] = useState<string>("all")
  const [selectedRol, setSelectedRol] = useState<string>("all")
  const [selectedEstado, setSelectedEstado] = useState<string>("all")
  const [usuarioDialogOpen, setUsuarioDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioDto | null>(null)
  const [adminRequirements, setAdminRequirements] = useState<{ [key: number]: boolean }>({})

  const isAdminMaestro = user?.rol === RolUsuario.ADMINISTRADOR_MAESTRO
  const isAdmin = user?.rol === RolUsuario.ADMINISTRADOR || isAdminMaestro

  useEffect(() => {
    loadData()
  }, [user])

  /**
   * Carga todos los datos necesarios: personas, casas de cambio y usuarios
   */
  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Cargar personas
      const personasResponse = await personaService.getAll()
      console.log("Personas response:", personasResponse)
      if (personasResponse && personasResponse.success && personasResponse.data) {
        setPersonas(personasResponse.data || [])
      }

      // Cargar casas de cambio
      if (isAdminMaestro) {
        console.log("Loading casas de cambio for admin maestro...")
        const casasResponse = await casaDeCambioService.getAll()
        console.log("Casas response:", casasResponse)

        if (casasResponse && casasResponse.success && casasResponse.data) {
          console.log("Setting casas de cambio:", casasResponse.data)
          setCasasDeCambio(casasResponse.data)
          setSelectedCasaDeCambio("all")

          // Cargar usuarios de todas las casas
          await loadAllUsuarios(casasResponse.data)
        }
      } else {
        const casaResponse = await casaDeCambioService.getById(user.casa_de_cambio_id)
        if (casaResponse && casaResponse.success && casaResponse.data) {
          setCasasDeCambio([casaResponse.data])
          setSelectedCasaDeCambio(user.casa_de_cambio_id.toString())

          // Cargar usuarios de la casa específica
          await loadUsuarios(user.casa_de_cambio_id)
        }
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Carga los usuarios de una casa de cambio específica
   */
  const loadUsuarios = async (casaDeCambioId?: number) => {
    try {
      const targetCasaId =
        casaDeCambioId || (selectedCasaDeCambio === "all" ? undefined : Number.parseInt(selectedCasaDeCambio))

      if (!targetCasaId && !isAdminMaestro) return

      let usuariosData: UsuarioDto[] = []

      if (targetCasaId) {
        const response = await usuarioService.getByCasaDeCambio(targetCasaId)
        if (response && response.success && response.data) {
          usuariosData = response.data
        }
      }

      // Enriquecer usuarios con datos de persona
      const usuariosEnriquecidos = usuariosData.map((usuario) => {
        const persona = usuario.persona || personas.find((p) => p.id === usuario.persona_id)
        return {
          ...usuario,
          nombres: persona?.nombres || "Sin nombre",
          apellidos: `${persona?.apellido_paterno || ""} ${persona?.apellido_materno || ""}`.trim() || "Sin apellidos",
        } as UsuarioDto & { nombres: string; apellidos: string }
      })

      setUsuarios(usuariosEnriquecidos)
    } catch (error) {
      console.error("Error loading usuarios:", error)
    }
  }

  /**
   * Carga todos los usuarios de todas las casas de cambio (solo para admin maestro)
   */
  const loadAllUsuarios = async (casasParam?: CasaDeCambioDto[]) => {
    if (!isAdminMaestro) return

    try {
      const casasToUse = casasParam || casasDeCambio
      if (casasToUse.length === 0) return

      const allUsuarios: UsuarioDto[] = []

      for (const casa of casasToUse) {
        const response = await usuarioService.getByCasaDeCambio(casa.id)
        if (response && response.success && response.data) {
          allUsuarios.push(...response.data)
        }
      }

      // Enriquecer usuarios con datos de persona
      const usuariosEnriquecidos = allUsuarios.map((usuario) => {
        const persona = usuario.persona || personas.find((p) => p.id === usuario.persona_id)
        return {
          ...usuario,
          nombres: persona?.nombres || "Sin nombre",
          apellidos: `${persona?.apellido_paterno || ""} ${persona?.apellido_materno || ""}`.trim() || "Sin apellidos",
        } as UsuarioDto & { nombres: string; apellidos: string }
      })

      setUsuarios(usuariosEnriquecidos)
    } catch (error) {
      console.error("Error loading all usuarios:", error)
    }
  }

  /**
   * Maneja el cambio de casa de cambio seleccionada
   */
  const handleCasaDeCambioChange = async (value: string) => {
    setSelectedCasaDeCambio(value)

    try {
      if (value === "all" && isAdminMaestro) {
        await loadAllUsuarios()
      } else {
        const casaId = Number.parseInt(value)
        await loadUsuarios(casaId)
      }
    } catch (error) {
      console.error("Error changing casa de cambio:", error)
    }
  }

  /**
   * Abre el diálogo para crear un nuevo usuario
   */
  const handleCreateUsuario = () => {
    setSelectedUsuario(null)
    setUsuarioDialogOpen(true)
  }

  /**
   * Abre el diálogo para editar un usuario existente
   */
  const handleEditUsuario = (usuario: UsuarioDto) => {
    setSelectedUsuario(usuario)
    setUsuarioDialogOpen(true)
  }

  /**
   * Abre el diálogo para cambiar la contraseña de un usuario
   */
  const handleChangePassword = (usuario: UsuarioDto) => {
    setSelectedUsuario(usuario)
    setPasswordDialogOpen(true)
  }

  /**
   * Activa o desactiva un usuario
   */
  const handleToggleActive = async (usuario: UsuarioDto) => {
    if (!usuario.id) return

    try {
      const response = await usuarioService.toggleActive(usuario.id)
      if (response.success) {
        toast({
          title: "Éxito",
          description: `Usuario ${response.data?.activo ? "activado" : "desactivado"} correctamente`,
        })
      }
      // Recargar usuarios
      if (selectedCasaDeCambio === "all" && isAdminMaestro) {
        loadAllUsuarios()
      } else {
        loadUsuarios()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al cambiar estado del usuario",
        variant: "destructive",
      })
    }
  }

  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesSearch =
      !searchTerm ||
      usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${usuario.nombres} ${usuario.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRol = selectedRol === "all" || usuario.rol === selectedRol
    const matchesEstado =
      selectedEstado === "all" ||
      (selectedEstado === "activo" && usuario.activo) ||
      (selectedEstado === "inactivo" && !usuario.activo)

    return matchesSearch && matchesRol && matchesEstado
  })

  const getRolBadgeVariant = (rol: RolUsuario) => {
    switch (rol) {
      case RolUsuario.ADMINISTRADOR_MAESTRO:
        return "destructive"
      case RolUsuario.ADMINISTRADOR:
        return "default"
      case RolUsuario.ENCARGADO_VENTANILLA:
        return "secondary"
      case RolUsuario.CAJERO:
        return "outline"
      default:
        return "outline"
    }
  }

  const getRolLabel = (rol: RolUsuario) => {
    switch (rol) {
      case RolUsuario.ADMINISTRADOR_MAESTRO:
        return "Admin Maestro"
      case RolUsuario.ADMINISTRADOR:
        return "Administrador"
      case RolUsuario.ENCARGADO_VENTANILLA:
        return "Enc. Ventanilla"
      case RolUsuario.CAJERO:
        return "Cajero"
      default:
        return rol
    }
  }

  const getCasaNombre = (casaId: number) => {
    const casa = casasDeCambio.find((c) => c.id === casaId)
    return casa?.nombre || "Casa no encontrada"
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const currentCasaId = selectedCasaDeCambio === "all" ? undefined : Number.parseInt(selectedCasaDeCambio)
  const meetsAdminRequirements = currentCasaId ? adminRequirements[currentCasaId] : true

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra los usuarios del sistema</p>
        </div>
        {isAdmin && (
          <Button onClick={handleCreateUsuario}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {!meetsAdminRequirements && currentCasaId && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Esta casa de cambio no cumple con los requisitos mínimos de administradores (1 Admin Maestro + 1
            Administrador).
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isAdminMaestro && (
          <div className="w-full sm:w-[200px]">
            <Select value={selectedCasaDeCambio} onValueChange={handleCasaDeCambioChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Casa de Cambio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Casas</SelectItem>
                {casasDeCambio.map((casa) => (
                  <SelectItem key={`casa-${casa.id}`} value={casa.id.toString()}>
                    {casa.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground mt-1">{casasDeCambio.length} casas disponibles</div>
          </div>
        )}

        <Select value={selectedRol} onValueChange={setSelectedRol}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Roles</SelectItem>
            <SelectItem value={RolUsuario.ADMINISTRADOR_MAESTRO}>Admin Maestro</SelectItem>
            <SelectItem value={RolUsuario.ADMINISTRADOR}>Administrador</SelectItem>
            <SelectItem value={RolUsuario.ENCARGADO_VENTANILLA}>Enc. Ventanilla</SelectItem>
            <SelectItem value={RolUsuario.CAJERO}>Cajero</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedEstado} onValueChange={setSelectedEstado}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="activo">Activos</SelectItem>
            <SelectItem value="inactivo">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsuarios.map((usuario) => (
          <Card key={usuario.id} className={`${!usuario.activo ? "opacity-60" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{usuario.username}</CardTitle>
                </div>
                <Badge variant={getRolBadgeVariant(usuario.rol)}>{getRolLabel(usuario.rol)}</Badge>
              </div>
              <CardDescription>
                {usuario.nombres} {usuario.apellidos}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground space-y-2">
                <div>
                  <strong>Email:</strong> {usuario.email}
                </div>
                {isAdminMaestro && (
                  <div>
                    <strong>Casa:</strong> {getCasaNombre(usuario.casa_de_cambio_id)}
                  </div>
                )}
                <div className="flex items-center">
                  <strong>Estado:</strong>
                  <Badge variant={usuario.activo ? "default" : "secondary"} className="ml-2">
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {isAdmin && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleEditUsuario(usuario)}>
                      <Shield className="mr-1 h-3 w-3" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleToggleActive(usuario)}>
                      {usuario.activo ? <UserX className="mr-1 h-3 w-3" /> : <UserCheck className="mr-1 h-3 w-3" />}
                      {usuario.activo ? "Desactivar" : "Activar"}
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={() => handleChangePassword(usuario)}>
                  <Key className="mr-1 h-3 w-3" />
                  Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsuarios.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay usuarios</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || selectedRol !== "all" || selectedEstado !== "all"
                ? "No se encontraron usuarios que coincidan con los filtros aplicados."
                : "No hay usuarios registrados en esta casa de cambio."}
            </p>
          </CardContent>
        </Card>
      )}

      <UsuarioDialog
        open={usuarioDialogOpen}
        onOpenChange={setUsuarioDialogOpen}
        usuario={selectedUsuario}
        casasDeCambio={casasDeCambio}
        personas={personas}
        onSuccess={() => {
          if (selectedCasaDeCambio === "all" && isAdminMaestro) {
            loadAllUsuarios()
          } else {
            loadUsuarios()
          }
          setUsuarioDialogOpen(false)
        }}
      />

      <CambiarPasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        usuario={selectedUsuario}
        onSuccess={() => {
          setPasswordDialogOpen(false)
        }}
      />
    </div>
  )
}
