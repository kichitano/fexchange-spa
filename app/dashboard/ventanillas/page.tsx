"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Store, Play, Pause, Square, Edit, Trash2, History, AlertTriangle } from "lucide-react"
import { ventanillaService } from "@/services/ventanilla-service"
import { casaDeCambioService } from "@/services/casa-cambio-service"
import type { VentanillaDto } from "@/types/ventanilla"
import type { CasaDeCambioDto } from "@/types/casa-cambio"
import { EstadoVentanilla, RolUsuario } from "@/types/enums"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { VentanillaDialog } from "@/components/ventanillas/ventanilla-dialog"
import { AperturaVentanillaDialog } from "@/components/ventanillas/apertura-ventanilla-dialog"
import { CierreVentanillaDialog } from "@/components/ventanillas/cierre-ventanilla-dialog"
import { HistorialVentanillaDialog } from "@/components/ventanillas/historial-ventanilla-dialog"
import { useAuth } from "@/contexts/auth-context"
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

export default function VentanillasPage() {
  const [ventanillas, setVentanillas] = useState<VentanillaDto[]>([])
  const [casasDeCambio, setCasasDeCambio] = useState<CasaDeCambioDto[]>([])
  const [selectedCasaDeCambio, setSelectedCasaDeCambio] = useState<number>(0)
  const [filtroEstado, setFiltroEstado] = useState<EstadoVentanilla | "TODAS">("TODAS")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVentanilla, setSelectedVentanilla] = useState<VentanillaDto | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAperturaDialogOpen, setIsAperturaDialogOpen] = useState(false)
  const [isCierreDialogOpen, setIsCierreDialogOpen] = useState(false)
  const [isHistorialDialogOpen, setIsHistorialDialogOpen] = useState(false)
  const [ventanillaToDelete, setVentanillaToDelete] = useState<VentanillaDto | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    loadCasasDeCambio()
  }, [])

  useEffect(() => {
    if (selectedCasaDeCambio > 0) {
      loadVentanillas()
    }
  }, [selectedCasaDeCambio, filtroEstado])

  /**
   * Carga las casas de cambio y establece la selección por defecto según el rol del usuario
   */
  const loadCasasDeCambio = async () => {
    try {
      const response = await casaDeCambioService.getAll()
      let casas: CasaDeCambioDto[] = []
      if (response.success) {
        casas = response.data || []
        setCasasDeCambio(casas)
      }

      if (user?.rol !== RolUsuario.ADMINISTRADOR_MAESTRO && user?.casa_de_cambio_id) {
        const userCasa = casas.find((c) => c.id === user.casa_de_cambio_id)
        if (userCasa) {
          setSelectedCasaDeCambio(userCasa.id)
        }
      } else if (casas.length > 0) {
        setSelectedCasaDeCambio(casas[0].id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las casas de cambio",
        variant: "destructive",
      })
    }
  }

  /**
   * Carga las ventanillas basándose en los filtros seleccionados
   */
  const loadVentanillas = async () => {
    try {
      setIsLoading(true)
      let response

      if (filtroEstado === "TODAS") {
        response = await ventanillaService.getByCasaDeCambio(selectedCasaDeCambio)
      } else {
        response = await ventanillaService.getByEstado(selectedCasaDeCambio, filtroEstado)
      }

      if (response.success) {
        setVentanillas(response.data || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las ventanillas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedVentanilla(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (ventanilla: VentanillaDto) => {
    setSelectedVentanilla(ventanilla)
    setIsDialogOpen(true)
  }

  const handleAperturar = (ventanilla: VentanillaDto) => {
    setSelectedVentanilla(ventanilla)
    setIsAperturaDialogOpen(true)
  }

  const handleCerrar = (ventanilla: VentanillaDto) => {
    setSelectedVentanilla(ventanilla)
    setIsCierreDialogOpen(true)
  }

  const handlePausar = async (ventanilla: VentanillaDto) => {
    try {
      await ventanillaService.pausar(ventanilla.id)
      toast({
        title: "Éxito",
        description: "Ventanilla pausada correctamente",
      })
      loadVentanillas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo pausar la ventanilla",
        variant: "destructive",
      })
    }
  }

  const handleReanudar = async (ventanilla: VentanillaDto) => {
    try {
      await ventanillaService.reanudar(ventanilla.id)
      toast({
        title: "Éxito",
        description: "Ventanilla reanudada correctamente",
      })
      loadVentanillas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo reanudar la ventanilla",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (ventanilla: VentanillaDto) => {
    try {
      await ventanillaService.toggleActive(ventanilla.id)
      toast({
        title: "Éxito",
        description: `Ventanilla ${ventanilla.activa ? "desactivada" : "activada"} correctamente`,
      })
      loadVentanillas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la ventanilla",
        variant: "destructive",
      })
    }
  }

  /**
   * Abre el diálogo de confirmación para eliminar
   */
  const handleDeleteClick = (ventanilla: VentanillaDto) => {
    setVentanillaToDelete(ventanilla)
    setIsDeleteDialogOpen(true)
  }

  /**
   * Elimina la ventanilla después de confirmación
   */
  const handleDelete = async () => {
    if (!ventanillaToDelete) return

    try {
      await ventanillaService.delete(ventanillaToDelete.id)
      toast({
        title: "Éxito",
        description: "Ventanilla eliminada correctamente",
      })
      setIsDeleteDialogOpen(false)
      setVentanillaToDelete(null)
      loadVentanillas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la ventanilla",
        variant: "destructive",
      })
    }
  }

  const handleVerHistorial = (ventanilla: VentanillaDto) => {
    setSelectedVentanilla(ventanilla)
    setIsHistorialDialogOpen(true)
  }


  const getEstadoBadge = (estado: EstadoVentanilla) => {
    switch (estado) {
      case EstadoVentanilla.ABIERTA:
        return <Badge className="bg-green-500">Abierta</Badge>
      case EstadoVentanilla.CERRADA:
        return <Badge variant="secondary">Cerrada</Badge>
      case EstadoVentanilla.PAUSA:
        return <Badge className="bg-yellow-500">En Pausa</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getCasaNombre = (casaId: number) => {
    const casa = casasDeCambio.find((c) => c.id === casaId)
    return casa?.nombre || "N/A"
  }

  const canManageVentanillas = user?.rol === RolUsuario.ADMINISTRADOR_MAESTRO || user?.rol === RolUsuario.ADMINISTRADOR
  const canOperateVentanillas = canManageVentanillas || user?.rol === RolUsuario.ENCARGADO_VENTANILLA

  if (isLoading && selectedCasaDeCambio === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ventanillas</h1>
          <p className="text-muted-foreground">Gestiona las ventanillas de atención</p>
        </div>
        {canManageVentanillas && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Ventanilla
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user?.rol === RolUsuario.ADMINISTRADOR_MAESTRO && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Casa de Cambio</label>
                <Select
                  value={selectedCasaDeCambio.toString()}
                  onValueChange={(value) => setSelectedCasaDeCambio(Number.parseInt(value))}
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
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select
                value={filtroEstado}
                onValueChange={(value) => setFiltroEstado(value as EstadoVentanilla | "TODAS")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODAS">Todas</SelectItem>
                  <SelectItem value={EstadoVentanilla.ABIERTA}>Abiertas</SelectItem>
                  <SelectItem value={EstadoVentanilla.CERRADA}>Cerradas</SelectItem>
                  <SelectItem value={EstadoVentanilla.PAUSA}>En Pausa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ventanillas Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ventanillas.map((ventanilla) => (
            <Card key={ventanilla.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{ventanilla.nombre}</CardTitle>
                      <CardDescription>{ventanilla.identificador}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {getEstadoBadge(ventanilla.estado)}
                    <Badge variant={ventanilla.activa ? "default" : "secondary"} className="text-xs">
                      {ventanilla.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Casa de Cambio:</span> {getCasaNombre(ventanilla.casa_de_cambio_id)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {/* Operaciones de ventanilla */}
                  {canOperateVentanillas && (
                    <>
                      {ventanilla.estado === EstadoVentanilla.CERRADA && ventanilla.activa && (
                        <Button size="sm" onClick={() => handleAperturar(ventanilla)}>
                          <Play className="h-4 w-4 mr-1" />
                          Aperturar
                        </Button>
                      )}

                      {ventanilla.estado === EstadoVentanilla.ABIERTA && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handlePausar(ventanilla)}>
                            <Pause className="h-4 w-4 mr-1" />
                            Pausar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleCerrar(ventanilla)}>
                            <Square className="h-4 w-4 mr-1" />
                            Cerrar
                          </Button>
                        </>
                      )}

                      {ventanilla.estado === EstadoVentanilla.PAUSA && (
                        <>
                          <Button size="sm" onClick={() => handleReanudar(ventanilla)}>
                            <Play className="h-4 w-4 mr-1" />
                            Reanudar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleCerrar(ventanilla)}>
                            <Square className="h-4 w-4 mr-1" />
                            Cerrar
                          </Button>
                        </>
                      )}
                    </>
                  )}

                  {/* Botones de información */}
                  <Button size="sm" variant="outline" onClick={() => handleVerHistorial(ventanilla)}>
                    <History className="h-4 w-4" />
                  </Button>

                  {/* Botones de administración */}
                  {canManageVentanillas && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(ventanilla)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleToggleActive(ventanilla)}>
                        {ventanilla.activa ? "Desactivar" : "Activar"}
                      </Button>
                      {user?.rol === RolUsuario.ADMINISTRADOR_MAESTRO && (
                        <Button size="sm" variant="outline" onClick={() => handleDeleteClick(ventanilla)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {ventanillas.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay ventanillas</h3>
            <p className="text-muted-foreground text-center mb-4">
              {filtroEstado === "TODAS"
                ? "No hay ventanillas registradas para esta casa de cambio"
                : `No hay ventanillas en estado ${filtroEstado.toLowerCase()}`}
            </p>
            {canManageVentanillas && filtroEstado === "TODAS" && (
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Ventanilla
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <VentanillaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        ventanilla={selectedVentanilla}
        casasDeCambio={casasDeCambio}
        onSave={() => {
          setIsDialogOpen(false)
          loadVentanillas()
        }}
      />

      <AperturaVentanillaDialog
        open={isAperturaDialogOpen}
        onOpenChange={setIsAperturaDialogOpen}
        ventanilla={selectedVentanilla}
        onSave={() => {
          setIsAperturaDialogOpen(false)
          loadVentanillas()
        }}
      />

      <CierreVentanillaDialog
        open={isCierreDialogOpen}
        onOpenChange={setIsCierreDialogOpen}
        ventanilla={selectedVentanilla}
        onSave={() => {
          setIsCierreDialogOpen(false)
          loadVentanillas()
        }}
      />

      <HistorialVentanillaDialog
        open={isHistorialDialogOpen}
        onOpenChange={setIsHistorialDialogOpen}
        ventanilla={selectedVentanilla}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg font-semibold">
                  Eliminar Ventanilla
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  Esta acción no se puede deshacer
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          <div className="py-4">
            <p className="text-sm">
              ¿Está seguro de que desea eliminar la ventanilla{" "}
              <span className="font-semibold">"{ventanillaToDelete?.nombre}"</span>?
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Se eliminarán todos los datos asociados y no podrán ser recuperados.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
