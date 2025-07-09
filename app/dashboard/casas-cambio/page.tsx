"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Building2, Edit, Trash2, Eye, AlertTriangle, Power } from "lucide-react"
import { casaDeCambioService } from "@/services/casa-cambio-service"
import { monedaService } from "@/services/moneda-service"
import type { CasaDeCambioDto } from "@/types/casa-cambio"
import type { MonedaDto } from "@/types/moneda"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { CasaDeCambioDialog } from "@/components/casas-cambio/casa-cambio-dialog"
import { CasaDeCambioViewDialog } from "@/components/casas-cambio/casa-cambio-view-dialog"
import { formatDate } from "@/utils/format"
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

export default function CasasDeCambioPage() {
  const [casasDeCambio, setCasasDeCambio] = useState<CasaDeCambioDto[]>([])
  const [monedas, setMonedas] = useState<MonedaDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCasa, setSelectedCasa] = useState<CasaDeCambioDto | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCasaForView, setSelectedCasaForView] = useState<CasaDeCambioDto | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [casaToDelete, setCasaToDelete] = useState<CasaDeCambioDto | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  /**
   * Carga datos de casas de cambio y monedas desde la API
   */
  const loadData = async () => {
    try {
      setIsLoading(true)
      const [casasResponse, monedasResponse] = await Promise.all([
        casaDeCambioService.getAll(),
        monedaService.getActivas(),
      ])

      if (casasResponse.success) {
        setCasasDeCambio(casasResponse.data || [])
      }
      if (monedasResponse.success) {
        setMonedas(monedasResponse.data || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las casas de cambio",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Abre el diálogo para crear una nueva casa de cambio
   */
  const handleCreate = () => {
    setSelectedCasa(null)
    setIsDialogOpen(true)
  }

  /**
   * Abre el diálogo para editar una casa de cambio existente
   */
  const handleEdit = (casa: CasaDeCambioDto) => {
    setSelectedCasa(casa)
    setIsDialogOpen(true)
  }

  const handleView = (casa: CasaDeCambioDto) => {
    setSelectedCasaForView(casa)
    setIsViewDialogOpen(true)
  }

  /**
   * Activa o desactiva una casa de cambio
   */
  const handleToggleActive = async (casa: CasaDeCambioDto) => {
    try {
      const response = await casaDeCambioService.toggleActive(casa.id)
      if (response.success) {
        toast({
          title: "Éxito",
          description: `Casa de cambio ${response.data?.activa ? "activada" : "desactivada"} correctamente`,
        })
        loadData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la casa de cambio",
        variant: "destructive",
      })
    }
  }

  /**
   * Abre el diálogo de confirmación para eliminar
   */
  const handleDeleteClick = (casa: CasaDeCambioDto) => {
    setCasaToDelete(casa)
    setIsDeleteDialogOpen(true)
  }

  /**
   * Elimina una casa de cambio después de confirmación del usuario
   */
  const handleDelete = async () => {
    if (!casaToDelete) return

    try {
      await casaDeCambioService.delete(casaToDelete.id)
      toast({
        title: "Éxito",
        description: "Casa de cambio eliminada correctamente",
      })
      setIsDeleteDialogOpen(false)
      setCasaToDelete(null)
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la casa de cambio",
        variant: "destructive",
      })
    }
  }

  /**
   * Maneja la operación de guardado exitosa y actualiza los datos
   */
  const handleSave = async () => {
    setIsDialogOpen(false)
    await loadData()
    toast({
      title: "Éxito",
      description: selectedCasa ? "Casa de cambio actualizada" : "Casa de cambio creada",
    })
  }

  const filteredCasas = casasDeCambio.filter(
    (casa) =>
      casa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      casa.identificador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      casa.ruc.includes(searchTerm),
  )

  const getMonedaNombre = (monedaId: number) => {
    const moneda = monedas.find((m) => m.id === monedaId)
    return moneda ? `${moneda.nombre} (${moneda.codigo})` : "N/A"
  }

  if (isLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Casas de Cambio</h1>
          <p className="text-muted-foreground">Gestiona las casas de cambio del sistema</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Casa de Cambio
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Casas de Cambio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, identificador o RUC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCasas.map((casa) => (
          <Card key={casa.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{casa.nombre}</CardTitle>
                    <CardDescription>{casa.identificador}</CardDescription>
                  </div>
                </div>
                <Badge variant={casa.activa ? "default" : "secondary"}>
                  {casa.activa ? "Activa" : "Inactiva"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">RUC:</span> {casa.ruc}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {casa.email}
                </div>
                <div>
                  <span className="font-medium">Teléfono:</span> {casa.telefono}
                </div>
                <div>
                  <span className="font-medium">Moneda Maestra:</span> {getMonedaNombre(casa.moneda_maestra_id)}
                </div>
                <div>
                  <span className="font-medium">Creada:</span> {formatDate(casa.created_at)}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(casa)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleView(casa)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleToggleActive(casa)}
                  title={casa.activa ? "Desactivar" : "Activar"}
                >
                  <Power className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteClick(casa)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCasas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron casas de cambio</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza creando tu primera casa de cambio"}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Casa de Cambio
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <CasaDeCambioDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        casaDeCambio={selectedCasa}
        monedas={monedas}
        onSave={handleSave}
      />

      {/* View Dialog */}
      <CasaDeCambioViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        casaDeCambio={selectedCasaForView}
        monedas={monedas}
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
                  Eliminar Casa de Cambio
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  Esta acción no se puede deshacer
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          <div className="py-4">
            <p className="text-sm">
              ¿Está seguro de que desea eliminar la casa de cambio{" "}
              <span className="font-semibold">"{casaToDelete?.nombre}"</span>?
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
