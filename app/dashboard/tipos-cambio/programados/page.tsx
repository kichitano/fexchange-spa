"use client"

import { useState, useEffect, useCallback } from 'react'
import { Calendar, momentLocalizer, View } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { CalendarDays, Plus, Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { tipoCambioService } from '@/services/tipo-cambio-service'
import { monedaService } from '@/services/moneda-service'
import type { TipoCambioDto } from '@/types/tipo-cambio'
import type { MonedaDto } from '@/types/moneda'

// Configurar localización para el calendario
moment.locale('es')
const localizer = momentLocalizer(moment)

/**
 * Página de Tipos de Cambio Programados
 * 
 * Funcionalidades:
 * - Vista de calendario con tipos de cambio programados
 * - Programación de activaciones futuras
 * - Auto-activación por fecha/hora
 * - Gestión de programaciones (crear, editar, eliminar)
 */

interface TipoCambioProgramado {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    tipoCambioId: number
    monedaOrigen: string
    monedaDestino: string
    tipoCompra: number
    tipoVenta: number
    estado: 'programado' | 'activado' | 'cancelado'
    fechaProgramada: Date
    usuarioId: number
    observaciones?: string
  }
}

interface FormularioProgramacion {
  monedaOrigenId: number
  monedaDestinoId: number
  tipoCompra: number
  tipoVenta: number
  fechaProgramada: string
  horaProgramada: string
  observaciones: string
}

export default function TiposCambioProgramadosPage() {
  // Estados principales
  const [eventosCalendario, setEventosCalendario] = useState<TipoCambioProgramado[]>([])
  const [monedas, setMonedas] = useState<MonedaDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [vista, setVista] = useState<View>('month')
  
  // Estados de modales
  const [showNuevoProgramacion, setShowNuevoProgramacion] = useState(false)
  const [showEditarProgramacion, setShowEditarProgramacion] = useState(false)
  const [showEliminarProgramacion, setShowEliminarProgramacion] = useState(false)
  const [eventoSeleccionado, setEventoSeleccionado] = useState<TipoCambioProgramado | null>(null)
  
  // Estados de formulario
  const [formulario, setFormulario] = useState<FormularioProgramacion>({
    monedaOrigenId: 0,
    monedaDestinoId: 0,
    tipoCompra: 0,
    tipoVenta: 0,
    fechaProgramada: '',
    horaProgramada: '09:00',
    observaciones: ''
  })

  const { toast } = useToast()

  /**
   * Carga las monedas disponibles
   */
  const cargarMonedas = useCallback(async () => {
    try {
      const response = await monedaService.getAll()
      if (response.data) {
        setMonedas(response.data)
      }
    } catch (error) {
      console.error('Error cargando monedas:', error)
    }
  }, [])

  /**
   * Carga los tipos de cambio programados
   */
  const cargarTiposProgramados = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // TODO: Implementar endpoint específico para tipos programados
      // Por ahora simulamos con datos mock
      const eventosMock: TipoCambioProgramado[] = [
        {
          id: '1',
          title: 'USD/PEN - Actualización',
          start: new Date(2025, 0, 10, 9, 0),
          end: new Date(2025, 0, 10, 9, 30),
          resource: {
            tipoCambioId: 1,
            monedaOrigen: 'USD',
            monedaDestino: 'PEN',
            tipoCompra: 3.75,
            tipoVenta: 3.78,
            estado: 'programado',
            fechaProgramada: new Date(2025, 0, 10, 9, 0),
            usuarioId: 1,
            observaciones: 'Actualización semanal programada'
          }
        },
        {
          id: '2',
          title: 'EUR/PEN - Activación',
          start: new Date(2025, 0, 15, 10, 0),
          end: new Date(2025, 0, 15, 10, 30),
          resource: {
            tipoCambioId: 2,
            monedaOrigen: 'EUR',
            monedaDestino: 'PEN',
            tipoCompra: 4.10,
            tipoVenta: 4.15,
            estado: 'programado',
            fechaProgramada: new Date(2025, 0, 15, 10, 0),
            usuarioId: 1,
            observaciones: 'Nuevo tipo de cambio EUR'
          }
        }
      ]
      
      setEventosCalendario(eventosMock)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de cambio programados",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  /**
   * Maneja la selección de un evento en el calendario
   */
  const handleSeleccionarEvento = (evento: TipoCambioProgramado) => {
    setEventoSeleccionado(evento)
    setShowEditarProgramacion(true)
  }

  /**
   * Maneja la selección de un slot en el calendario
   */
  const handleSeleccionarSlot = ({ start }: { start: Date }) => {
    const fechaFormateada = moment(start).format('YYYY-MM-DD')
    const horaFormateada = moment(start).format('HH:mm')
    
    setFormulario(prev => ({
      ...prev,
      fechaProgramada: fechaFormateada,
      horaProgramada: horaFormateada
    }))
    setShowNuevoProgramacion(true)
  }

  /**
   * Maneja el cambio en el formulario
   */
  const handleFormularioChange = (campo: keyof FormularioProgramacion, valor: any) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  /**
   * Valida el formulario
   */
  const validarFormulario = (): boolean => {
    if (!formulario.monedaOrigenId || !formulario.monedaDestinoId) {
      toast({
        title: "Error",
        description: "Debe seleccionar las monedas origen y destino",
        variant: "destructive",
      })
      return false
    }

    if (formulario.monedaOrigenId === formulario.monedaDestinoId) {
      toast({
        title: "Error",
        description: "Las monedas origen y destino deben ser diferentes",
        variant: "destructive",
      })
      return false
    }

    if (formulario.tipoCompra <= 0 || formulario.tipoVenta <= 0) {
      toast({
        title: "Error",
        description: "Los tipos de cambio deben ser mayores a 0",
        variant: "destructive",
      })
      return false
    }

    if (formulario.tipoVenta <= formulario.tipoCompra) {
      toast({
        title: "Error",
        description: "El tipo de venta debe ser mayor que el tipo de compra",
        variant: "destructive",
      })
      return false
    }

    if (!formulario.fechaProgramada) {
      toast({
        title: "Error",
        description: "Debe seleccionar una fecha",
        variant: "destructive",
      })
      return false
    }

    const fechaProgramada = new Date(`${formulario.fechaProgramada}T${formulario.horaProgramada}`)
    if (fechaProgramada <= new Date()) {
      toast({
        title: "Error",
        description: "La fecha programada debe ser futura",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  /**
   * Guarda una nueva programación
   */
  const guardarProgramacion = async () => {
    if (!validarFormulario()) return

    try {
      setIsLoading(true)
      
      const monedaOrigen = monedas.find(m => m.id === formulario.monedaOrigenId)
      const monedaDestino = monedas.find(m => m.id === formulario.monedaDestinoId)
      
      const fechaProgramada = new Date(`${formulario.fechaProgramada}T${formulario.horaProgramada}`)
      
      const nuevoEvento: TipoCambioProgramado = {
        id: Date.now().toString(),
        title: `${monedaOrigen?.codigo}/${monedaDestino?.codigo} - Programado`,
        start: fechaProgramada,
        end: new Date(fechaProgramada.getTime() + 30 * 60000), // 30 minutos después
        resource: {
          tipoCambioId: 0, // Se asignará al crear
          monedaOrigen: monedaOrigen?.codigo || '',
          monedaDestino: monedaDestino?.codigo || '',
          tipoCompra: formulario.tipoCompra,
          tipoVenta: formulario.tipoVenta,
          estado: 'programado',
          fechaProgramada,
          usuarioId: 1, // TODO: Obtener del contexto
          observaciones: formulario.observaciones
        }
      }

      // TODO: Implementar llamada al backend
      // await tipoCambioService.programar(nuevoEvento.resource)

      setEventosCalendario(prev => [...prev, nuevoEvento])
      setShowNuevoProgramacion(false)
      limpiarFormulario()
      
      toast({
        title: "Éxito",
        description: "Tipo de cambio programado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo programar el tipo de cambio",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Elimina una programación
   */
  const eliminarProgramacion = async () => {
    if (!eventoSeleccionado) return

    try {
      setIsLoading(true)
      
      // TODO: Implementar llamada al backend
      // await tipoCambioService.cancelarProgramacion(eventoSeleccionado.id)

      setEventosCalendario(prev => prev.filter(e => e.id !== eventoSeleccionado.id))
      setShowEliminarProgramacion(false)
      setEventoSeleccionado(null)
      
      toast({
        title: "Éxito",
        description: "Programación eliminada correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la programación",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Activa manualmente una programación
   */
  const activarProgramacion = async (evento: TipoCambioProgramado) => {
    try {
      setIsLoading(true)
      
      // TODO: Implementar llamada al backend
      // await tipoCambioService.activarProgramacion(evento.id)

      setEventosCalendario(prev => 
        prev.map(e => 
          e.id === evento.id 
            ? { ...e, resource: { ...e.resource, estado: 'activado' } }
            : e
        )
      )
      
      toast({
        title: "Éxito",
        description: "Tipo de cambio activado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo activar el tipo de cambio",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Limpia el formulario
   */
  const limpiarFormulario = () => {
    setFormulario({
      monedaOrigenId: 0,
      monedaDestinoId: 0,
      tipoCompra: 0,
      tipoVenta: 0,
      fechaProgramada: '',
      horaProgramada: '09:00',
      observaciones: ''
    })
  }

  /**
   * Obtiene el estilo del evento según su estado
   */
  const getEventoStyle = (evento: TipoCambioProgramado) => {
    const baseStyle = {
      fontSize: '12px',
      borderRadius: '4px',
      border: 'none',
      padding: '2px 4px'
    }

    switch (evento.resource.estado) {
      case 'programado':
        return { ...baseStyle, backgroundColor: '#3b82f6', color: 'white' }
      case 'activado':
        return { ...baseStyle, backgroundColor: '#10b981', color: 'white' }
      case 'cancelado':
        return { ...baseStyle, backgroundColor: '#ef4444', color: 'white' }
      default:
        return { ...baseStyle, backgroundColor: '#6b7280', color: 'white' }
    }
  }

  /**
   * Obtiene el nombre de la moneda
   */
  const getNombreMoneda = (id: number) => {
    const moneda = monedas.find(m => m.id === id)
    return moneda ? `${moneda.codigo} - ${moneda.nombre}` : ''
  }

  // Cargar datos iniciales
  useEffect(() => {
    cargarMonedas()
    cargarTiposProgramados()
  }, [cargarMonedas, cargarTiposProgramados])

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Tipos de Cambio Programados
          </h1>
          <p className="text-muted-foreground">
            Programar y gestionar activaciones futuras de tipos de cambio
          </p>
        </div>
        
        <Button onClick={() => setShowNuevoProgramacion(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Programación
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {eventosCalendario.filter(e => e.resource.estado === 'programado').length}
            </div>
            <p className="text-xs text-muted-foreground">Programados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {eventosCalendario.filter(e => e.resource.estado === 'activado').length}
            </div>
            <p className="text-xs text-muted-foreground">Activados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {eventosCalendario.filter(e => e.resource.estado === 'cancelado').length}
            </div>
            <p className="text-xs text-muted-foreground">Cancelados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {eventosCalendario.filter(e => e.start > new Date()).length}
            </div>
            <p className="text-xs text-muted-foreground">Próximos</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendario */}
      <Card>
        <CardHeader>
          <CardTitle>Calendario de Programaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={eventosCalendario}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleSeleccionarEvento}
              onSelectSlot={handleSeleccionarSlot}
              selectable
              view={vista}
              onView={setVista}
              eventPropGetter={(event) => ({
                style: getEventoStyle(event)
              })}
              messages={{
                next: 'Siguiente',
                previous: 'Anterior',
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                agenda: 'Agenda'
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog Nueva Programación */}
      <Dialog open={showNuevoProgramacion} onOpenChange={setShowNuevoProgramacion}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nueva Programación</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Moneda Origen</Label>
                <Select
                  value={formulario.monedaOrigenId.toString()}
                  onValueChange={(value) => handleFormularioChange('monedaOrigenId', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    {monedas.map((moneda) => (
                      <SelectItem key={moneda.id} value={moneda.id.toString()}>
                        {getNombreMoneda(moneda.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Moneda Destino</Label>
                <Select
                  value={formulario.monedaDestinoId.toString()}
                  onValueChange={(value) => handleFormularioChange('monedaDestinoId', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    {monedas.map((moneda) => (
                      <SelectItem key={moneda.id} value={moneda.id.toString()}>
                        {getNombreMoneda(moneda.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo Compra</Label>
                <Input
                  type="number"
                  step="0.0001"
                  min="0.01"
                  placeholder="0.0000"
                  value={formulario.tipoCompra || ''}
                  onChange={(e) => handleFormularioChange('tipoCompra', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo Venta</Label>
                <Input
                  type="number"
                  step="0.0001"
                  min="0.01"
                  placeholder="0.0000"
                  value={formulario.tipoVenta || ''}
                  onChange={(e) => handleFormularioChange('tipoVenta', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Programada</Label>
                <Input
                  type="date"
                  value={formulario.fechaProgramada}
                  onChange={(e) => handleFormularioChange('fechaProgramada', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Hora Programada</Label>
                <Input
                  type="time"
                  value={formulario.horaProgramada}
                  onChange={(e) => handleFormularioChange('horaProgramada', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea
                placeholder="Motivo de la programación..."
                value={formulario.observaciones}
                onChange={(e) => handleFormularioChange('observaciones', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNuevoProgramacion(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarProgramacion} disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Programar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Programación */}
      <Dialog open={showEditarProgramacion} onOpenChange={setShowEditarProgramacion}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalle de Programación</DialogTitle>
          </DialogHeader>
          
          {eventoSeleccionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Par de Monedas</Label>
                  <p className="text-lg font-semibold">
                    {eventoSeleccionado.resource.monedaOrigen}/{eventoSeleccionado.resource.monedaDestino}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      eventoSeleccionado.resource.estado === 'programado' ? 'default' :
                      eventoSeleccionado.resource.estado === 'activado' ? 'secondary' : 'destructive'
                    }>
                      {eventoSeleccionado.resource.estado === 'programado' && <Clock className="h-3 w-3 mr-1" />}
                      {eventoSeleccionado.resource.estado === 'activado' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {eventoSeleccionado.resource.estado === 'cancelado' && <XCircle className="h-3 w-3 mr-1" />}
                      {eventoSeleccionado.resource.estado.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <Label className="text-sm font-medium text-green-700 dark:text-green-300">
                    Tipo de Compra
                  </Label>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {eventoSeleccionado.resource.tipoCompra.toFixed(4)}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <Label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Tipo de Venta
                  </Label>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {eventoSeleccionado.resource.tipoVenta.toFixed(4)}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Fecha Programada</Label>
                <p className="text-lg">
                  {moment(eventoSeleccionado.resource.fechaProgramada).format('DD/MM/YYYY HH:mm')}
                </p>
              </div>

              {eventoSeleccionado.resource.observaciones && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Observaciones</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {eventoSeleccionado.resource.observaciones}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            {eventoSeleccionado?.resource.estado === 'programado' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => activarProgramacion(eventoSeleccionado)}
                  disabled={isLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activar Ahora
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowEliminarProgramacion(true)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setShowEditarProgramacion(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar Programación */}
      <AlertDialog open={showEliminarProgramacion} onOpenChange={setShowEliminarProgramacion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Programación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea eliminar esta programación? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={eliminarProgramacion}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}