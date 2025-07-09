"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, User, Phone, Calendar, FileText, Globe, Briefcase } from "lucide-react"
import { PersonaDialog } from "@/components/personas/persona-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { personaService } from "@/services/persona-service"
import type { PersonaDto } from "@/types/persona"
import { RolUsuario } from "@/types/enums"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function PersonasPage() {
  const [personas, setPersonas] = useState<PersonaDto[]>([])
  const [filteredPersonas, setFilteredPersonas] = useState<PersonaDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<PersonaDto | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [personaToDelete, setPersonaToDelete] = useState<PersonaDto | null>(null)
  const [canDelete, setCanDelete] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()

  const canManagePersonas = user?.rol === RolUsuario.ADMINISTRADOR_MAESTRO || user?.rol === RolUsuario.ADMINISTRADOR

  useEffect(() => {
    loadPersonas()
  }, [])

  useEffect(() => {
    filterPersonas()
  }, [personas, searchTerm])

  /**
   * Carga todas las personas desde la API
   */
  const loadPersonas = async () => {
    try {
      setLoading(true)
      const response = await personaService.getAll()

      if (response.success && response.data && Array.isArray(response.data)) {
        const personasData = response.data
        setPersonas(personasData)
      } else {
        setPersonas([])
        toast({
          title: "Error",
          description: response.message || "Error al cargar personas",
          variant: "destructive",
        })
      }
    } catch (error) {
      setPersonas([])
      toast({
        title: "Error",
        description: "Error al cargar personas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Filtra las personas basado en el término de búsqueda
   */
  const filterPersonas = () => {
    if (!searchTerm.trim()) {
      setFilteredPersonas(personas)
      return
    }

    const filtered = personas.filter((persona) => {
      const fullName = `${persona.nombres} ${persona.apellido_paterno} ${persona.apellido_materno}`.toLowerCase()
      const searchLower = searchTerm.toLowerCase()

      return (
        fullName.includes(searchLower) ||
        persona.numero_documento.toLowerCase().includes(searchLower) ||
        persona.numero_telefono.includes(searchTerm)
      )
    })

    setFilteredPersonas(filtered)
  }

  /**
   * Abre el diálogo para crear una nueva persona
   */
  const handleCreate = () => {
    setSelectedPersona(null)
    setIsDialogOpen(true)
  }

  /**
   * Abre el diálogo para editar una persona existente
   */
  const handleEdit = (persona: PersonaDto) => {
    setSelectedPersona(persona)
    setIsDialogOpen(true)
  }

  /**
   * Verifica si la persona puede ser eliminada y abre el diálogo de confirmación
   */
  const handleDelete = async (persona: PersonaDto) => {
    if (!persona.id) {
      toast({
        title: "Error",
        description: "ID de persona no válido",
        variant: "destructive",
      })
      return
    }

    try {
      const canDeleteResponse = await personaService.canBeDeleted(persona.id)
      const canDeleteData = canDeleteResponse.data as { canBeDeleted: boolean }
      setCanDelete(canDeleteData?.canBeDeleted || false)
      setPersonaToDelete(persona)
      setDeleteDialogOpen(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al verificar si se puede eliminar la persona",
        variant: "destructive",
      })
    }
  }

  /**
   * Elimina la persona después de confirmación
   */
  const confirmDelete = async () => {
    if (!personaToDelete?.id) return

    try {
      await personaService.delete(personaToDelete.id)
      toast({
        title: "Éxito",
        description: "Persona eliminada correctamente",
      })
      loadPersonas()
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar persona",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setPersonaToDelete(null)
    }
  }

  /**
   * Maneja la operación de guardado exitosa y actualiza los datos
   */
  const handleDialogSuccess = () => {
    setIsDialogOpen(false)
    setSelectedPersona(null)
    loadPersonas()
  }

  const formatDate = (date: Date | string) => {
    try {
      return new Date(date).toLocaleDateString("es-ES")
    } catch (error) {
      return "Fecha inválida"
    }
  }

  const calculateAge = (birthDate: Date | string) => {
    try {
      const today = new Date()
      const birth = new Date(birthDate)
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }

      return age
    } catch (error) {
      return 0
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Personas</h1>
          <p className="text-muted-foreground">Administra la información personal de usuarios y clientes</p>
        </div>
        {canManagePersonas && (
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Persona
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, apellidos, documento o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1">
                  {filteredPersonas.length} resultado{filteredPersonas.length !== 1 ? "s" : ""}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")} className="h-8 px-2">
                  Limpiar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Personas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Personas</span>
            {searchTerm && (
              <Badge variant="outline" className="ml-2">
                Mostrando {filteredPersonas.length} de {personas.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPersonas.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron personas</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No hay personas que coincidan con tu búsqueda." : "No hay personas registradas."}
              </p>
              {canManagePersonas && !searchTerm && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Persona
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Nacionalidad</TableHead>
                    <TableHead>Ocupación</TableHead>
                    {canManagePersonas && <TableHead className="text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPersonas.map((persona, index) => (
                    <TableRow key={persona.id || index}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">
                            {persona.nombres} {persona.apellido_paterno} {persona.apellido_materno}
                          </div>
                          <div className="text-sm text-muted-foreground">{persona.direccion}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {persona.tipo_documento}: {persona.numero_documento}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          {persona.numero_telefono}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{calculateAge(persona.fecha_nacimiento)} años</div>
                            <div className="text-sm text-muted-foreground">{formatDate(persona.fecha_nacimiento)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                          {persona.nacionalidad}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                          {persona.ocupacion}
                        </div>
                      </TableCell>
                      {canManagePersonas && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(persona)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(persona)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PersonaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        persona={selectedPersona}
        onSuccess={handleDialogSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar persona?</AlertDialogTitle>
            <AlertDialogDescription>
              {canDelete ? (
                <>
                  ¿Estás seguro de que deseas eliminar a{" "}
                  <strong>
                    {personaToDelete?.nombres} {personaToDelete?.apellido_paterno} {personaToDelete?.apellido_materno}
                  </strong>
                  ? Esta acción no se puede deshacer.
                </>
              ) : (
                <>
                  No se puede eliminar a{" "}
                  <strong>
                    {personaToDelete?.nombres} {personaToDelete?.apellido_paterno} {personaToDelete?.apellido_materno}
                  </strong>{" "}
                  porque tiene usuarios o clientes asociados.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {canDelete && (
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
