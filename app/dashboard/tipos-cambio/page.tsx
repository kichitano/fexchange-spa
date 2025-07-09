"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, TrendingUp, Eye, Edit, Trash2, ToggleLeft, ToggleRight, Building } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { formatDateTime } from "@/utils/format"
import { tipoCambioService } from "@/services/tipo-cambio-service"
import { casaDeCambioService } from "@/services/casa-cambio-service"
import { monedaService } from "@/services/moneda-service"
import { TipoCambioDialog } from "@/components/tipos-cambio/tipo-cambio-dialog"
import type { TipoCambioDto } from "@/types/tipo-cambio"
import type { CasaDeCambioDto } from "@/types/casa-cambio"
import type { MonedaDto } from "@/types/moneda"

export default function TiposCambioPage() {
  const [tiposCambio, setTiposCambio] = useState<TipoCambioDto[]>([])
  const [casasDeCambio, setCasasDeCambio] = useState<CasaDeCambioDto[]>([])
  const [monedas, setMonedas] = useState<MonedaDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [casaSeleccionada, setCasaSeleccionada] = useState("")
  const [selectedTipoCambio, setSelectedTipoCambio] = useState<TipoCambioDto | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (casaSeleccionada) {
      loadTiposCambio()
    }
  }, [casaSeleccionada])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      const [casasResponse, monedasResponse] = await Promise.all([
        casaDeCambioService.getAll(),
        monedaService.getAll(),
      ])

      setCasasDeCambio(casasResponse.data || [])
      setMonedas(monedasResponse.data || [])

      // Seleccionar la primera casa por defecto
      if (casasResponse.data && casasResponse.data.length > 0) {
        setCasaSeleccionada(casasResponse.data[0].id.toString())
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos iniciales",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadTiposCambio = async () => {
    if (!casaSeleccionada) return

    try {
      setIsLoading(true)
      // Cargar todos los tipos de cambio (histórico completo)
      const response = await tipoCambioService.getByCasaDeCambio(parseInt(casaSeleccionada))
      setTiposCambio(response.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de cambio",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleMantenerDiario = async (tipoCambio: TipoCambioDto) => {
    try {
      const nuevoEstado = !tipoCambio.mantener_cambio_diario
      await tipoCambioService.update(tipoCambio.id, {
        mantener_cambio_diario: nuevoEstado
      })
      toast({
        title: "Éxito",
        description: `Mantener cambio diario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
      })
      loadTiposCambio()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar la configuración de mantener diario",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (tipoCambio: TipoCambioDto) => {
    try {
      await tipoCambioService.delete(tipoCambio.id)
      toast({
        title: "Éxito",
        description: "Tipo de cambio eliminado correctamente",
      })
      loadTiposCambio()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || "No se pudo eliminar el tipo de cambio"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }


  const getMonedaNombre = (monedaId: number) => {
    const moneda = monedas.find(m => m.id === monedaId)
    return moneda ? `${moneda.codigo} (${moneda.nombre})` : "Desconocida"
  }

  const getCasaNombre = (casaId: number) => {
    const casa = casasDeCambio.find(c => c.id === casaId)
    return casa ? casa.nombre : "Desconocida"
  }

  const handleCreate = () => {
    setSelectedTipoCambio(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (tipoCambio: TipoCambioDto) => {
    setSelectedTipoCambio(tipoCambio)
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    setIsDialogOpen(false)
    loadTiposCambio()
  }

  const getCasaSeleccionada = () => {
    return casasDeCambio.find(c => c.id.toString() === casaSeleccionada) || null
  }

  const formatUltimaActualizacion = (fecha: Date | string) => {
    const dateObj = typeof fecha === "string" ? new Date(fecha) : fecha
    
    if (!dateObj || isNaN(dateObj.getTime())) return "N/A"

    const dateStr = dateObj.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric"
    })
    
    const timeStr = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })

    return `${timeStr} - ${dateStr}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tipos de Cambio</h1>
          <p className="text-muted-foreground">
            Gestiona los tipos de cambio por casa de cambio
          </p>
        </div>
        <Button disabled={!casaSeleccionada} onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Tipo de Cambio
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="h-5 w-5" />
            Seleccionar Casa de Cambio
          </CardTitle>
          <CardDescription>
            Selecciona una casa de cambio para ver sus tipos de cambio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={casaSeleccionada} onValueChange={setCasaSeleccionada}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Seleccionar casa de cambio" />
            </SelectTrigger>
            <SelectContent>
              {casasDeCambio.map((casa) => (
                <SelectItem key={casa.id} value={casa.id.toString()}>
                  {casa.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Results */}
      {casaSeleccionada && (
        <Card>
          <CardHeader>
            <CardTitle>
              Tipos de Cambio - {getCasaNombre(parseInt(casaSeleccionada))}
            </CardTitle>
            <CardDescription>
              {tiposCambio.length} tipos de cambio configurados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : tiposCambio.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay tipos de cambio configurados</p>
                <p className="text-sm text-muted-foreground">
                  Crea el primer tipo de cambio para esta casa
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-center">Moneda Origen</TableHead>
                      <TableHead className="text-center">Moneda Destino</TableHead>
                      <TableHead className="text-center">Tipo Compra</TableHead>
                      <TableHead className="text-center">Tipo Venta</TableHead>
                      <TableHead className="text-center">Última Actualización</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tiposCambio.map((tipoCambio) => (
                      <TableRow key={tipoCambio.id}>
                        <TableCell className="text-center">
                          <Badge variant={tipoCambio.activo ? "default" : "secondary"}>
                            {tipoCambio.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <p className="font-medium">{getMonedaNombre(tipoCambio.moneda_origen_id)}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <p className="font-medium">{getMonedaNombre(tipoCambio.moneda_destino_id)}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <p className="font-mono">{tipoCambio.tipo_compra.toFixed(2)}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <p className="font-mono">{tipoCambio.tipo_venta.toFixed(2)}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <p className="text-sm">{formatUltimaActualizacion(tipoCambio.updated_at)}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant={tipoCambio.mantener_cambio_diario ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleToggleMantenerDiario(tipoCambio)}
                              title="Mantener Cambio Diario"
                              className={tipoCambio.mantener_cambio_diario ? 
                                "bg-green-600 hover:bg-green-700 text-white" : 
                                "hover:bg-gray-100"
                              }
                            >
                              {tipoCambio.mantener_cambio_diario ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(tipoCambio)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Eliminar Tipo de Cambio</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    ¿Está seguro de que desea eliminar este tipo de cambio? Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(tipoCambio)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      {getCasaSeleccionada() && (
        <TipoCambioDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          tipoCambio={selectedTipoCambio}
          casaDeCambio={getCasaSeleccionada()!}
          onSave={handleSave}
        />
      )}
    </div>
  )
}