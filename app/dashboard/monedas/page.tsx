"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Coins, Edit, Trash2, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react"
import { monedaService } from "@/services/moneda-service"
import type { MonedaDto } from "@/types/moneda"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { MonedaDialog } from "@/components/monedas/moneda-dialog"
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

export default function MonedasPage() {
  const [monedas, setMonedas] = useState<MonedaDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMoneda, setSelectedMoneda] = useState<MonedaDto | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showInactive, setShowInactive] = useState(true)
  const [monedaToDelete, setMonedaToDelete] = useState<MonedaDto | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      // Siempre cargar todas las monedas (incluyendo inactivas) en la gestión
      const response = await monedaService.getAll(true)
      setMonedas(response.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las monedas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedMoneda(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (moneda: MonedaDto) => {
    setSelectedMoneda(moneda)
    setIsDialogOpen(true)
  }

  const handleToggleActive = async (moneda: MonedaDto) => {
    try {
      await monedaService.toggleActive(moneda.id)
      toast({
        title: "Éxito",
        description: `Moneda ${moneda.activa ? "desactivada" : "activada"} correctamente`,
      })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la moneda",
        variant: "destructive",
      })
    }
  }

  /**
   * Abre el diálogo de confirmación para eliminar
   */
  const handleDeleteClick = (moneda: MonedaDto) => {
    setMonedaToDelete(moneda)
    setIsDeleteDialogOpen(true)
  }

  /**
   * Elimina una moneda después de confirmación del usuario
   */
  const handleDelete = async () => {
    if (!monedaToDelete) return

    try {
      await monedaService.delete(monedaToDelete.id)
      toast({
        title: "Éxito",
        description: "Moneda eliminada correctamente",
      })
      setIsDeleteDialogOpen(false)
      setMonedaToDelete(null)
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la moneda",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    setIsDialogOpen(false)
    await loadData()
    toast({
      title: "Éxito",
      description: selectedMoneda ? "Moneda actualizada" : "Moneda creada",
    })
  }

  const filteredMonedas = monedas.filter((moneda) => {
    const matchesSearch =
      moneda.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moneda.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moneda.simbolo.includes(searchTerm)

    const matchesStatus = showInactive ? true : moneda.activa

    return matchesSearch && matchesStatus
  })

  const getEstadoBadge = (activa: boolean) => {
    return activa ? <Badge className="bg-green-500">Activa</Badge> : <Badge variant="secondary">Inactiva</Badge>
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
          <h1 className="text-3xl font-bold tracking-tight">Monedas</h1>
          <p className="text-muted-foreground">Gestiona las monedas del sistema</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Moneda
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Monedas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, código o símbolo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showInactive ? "default" : "outline"}
              size="sm"
              onClick={() => setShowInactive(!showInactive)}
            >
              {showInactive ? "Mostrar Solo Activas" : "Mostrar Todas"}
            </Button>
            <Badge variant="outline">
              {filteredMonedas.length} moneda{filteredMonedas.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Monedas Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMonedas.map((moneda) => (
          <Card key={moneda.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{moneda.simbolo}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{moneda.codigo}</CardTitle>
                    <CardDescription>{moneda.nombre}</CardDescription>
                  </div>
                </div>
                {getEstadoBadge(moneda.activa)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Símbolo:</span>
                  <span className="text-2xl">{moneda.simbolo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Decimales:</span>
                  <span>{moneda.decimales}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Creada:</span>
                  <span className="text-muted-foreground">{formatDate(moneda.created_at)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(moneda)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(moneda)}
                  className={moneda.activa ? "text-orange-600" : "text-green-600"}
                >
                  {moneda.activa ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteClick(moneda)} disabled={moneda.activa}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMonedas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Coins className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron monedas</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza creando tu primera moneda"}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Moneda
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <MonedaDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} moneda={selectedMoneda} onSave={handleSave} />

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
                  Eliminar Moneda
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  Esta acción no se puede deshacer
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          <div className="py-4">
            <p className="text-sm">
              ¿Está seguro de que desea eliminar la moneda{" "}
              <span className="font-semibold">"{monedaToDelete?.codigo} - {monedaToDelete?.nombre}"</span>?
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
