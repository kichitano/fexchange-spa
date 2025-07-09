"use client"

import { useState, useEffect } from "react"
import { TransaccionProvider } from "@/contexts/transaccion-context"
import { useTransaccionesOperacion } from "@/hooks/useTransaccionesOperacion"
import { useHistorialTransacciones } from "@/hooks/useHistorialTransacciones"
import { HeaderControles } from "@/components/transacciones/header-controles"
import { ClienteSelectorRapido } from "@/components/transacciones/cliente-selector-rapido"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Receipt, Edit3, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useVentanilla } from "@/contexts/ventanilla-context"
import { formatCurrency } from "@/utils/format"

/**
 * Página de Registro de Transacciones
 * 
 * Interfaz especializada para el registro de nuevas transacciones de cambio.
 * Se abre automáticamente al aperturar una ventanilla y toma la casa de cambio
 * correspondiente a esa ventanilla.
 * 
 * Funcionalidades:
 * - Registro rápido de transacciones
 * - Controles de ventanilla (pausar/cerrar caja)
 * - Selección de tipos de cambio con operaciones
 * - Formulario con cálculos automáticos
 * - Historial de transacciones recientes (últimas 5)
 */

function RegistrarTransaccionContent() {
  // Estados de modales
  const [showComprobanteDialog, setShowComprobanteDialog] = useState(false)
  const [showClienteSelector, setShowClienteSelector] = useState(false)
  const [ventanillaInfo, setVentanillaInfo] = useState<{ id: number; nombre: string; operador: string; sesionApertura: string; casaDeCambio: string; casaDeCambioId: number } | null>(null)
  // Removed tipoCambioPreferencial - using tipoCambioCustom from hook instead
  const [showPrecioDialog, setShowPrecioDialog] = useState(false)
  const [showCambioPreferencial, setShowCambioPreferencial] = useState(false)
  const [nuevoTipoCambio, setNuevoTipoCambio] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const [isCerrandoVentanilla, setIsCerrandoVentanilla] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [montoDestino, setMontoDestino] = useState('')
  const [modoCalculoInverso, setModoCalculoInverso] = useState(false)

  const { toast } = useToast()
  const router = useRouter()
  const { ventanillaActiva } = useVentanilla()

  // Hooks personalizados
  const {
    // Estados
    tiposCambio,
    tipoCambioSeleccionado,
    tipoOperacion,
    montoOrigen,
    calculo,
    isLoading: isLoadingOperacion,
    usarTipoCambioPersonalizado,
    tipoCambioCustom,
    puedeProcessar,
    
    // Acciones
    setMontoOrigen,
    seleccionarTipoCambio,
    aplicarTipoCambioPreferencial,
    resetearTipoCambioPreferencial,
    procesarTransaccion,
    cargarTiposCambio
  } = useTransaccionesOperacion()
  
  const {
    // Estados
    transacciones,
    isLoading: isLoadingHistorial,
    ultimaActualizacion,
    
    // Acciones
    recargarTransacciones
  } = useHistorialTransacciones({
    limite: 5, // Solo las últimas 5 para registro rápido
    autoRefresh: false
  })

  // Cargar tipos de cambio y transacciones al inicializar
  useEffect(() => {
    cargarTiposCambio()
    recargarTransacciones()
  }, [cargarTiposCambio, recargarTransacciones])

  // Verificación inicial y gestión de ventanilla activa
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      if (!ventanillaActiva) {
        // Acceso directo sin ventanilla activa
        toast({
          title: "Sin Ventanilla Activa",
          description: "Debe aperturar una ventanilla primero",
          variant: "destructive",
        })
        setTimeout(() => {
          router.push('/dashboard/ventanillas')
        }, 2000)
        return
      }
    }

    if (ventanillaActiva && !ventanillaInfo && isInitialized) {
      // Solo ejecutar la primera vez que se detecta una ventanilla activa
      setVentanillaInfo(ventanillaActiva)
      setIsCerrandoVentanilla(false)
      recargarTransacciones()
      
      toast({
        title: "Ventanilla Lista",
        description: `${ventanillaActiva.nombre} preparada para operar`,
      })
    } else if (!ventanillaActiva && isCerrandoVentanilla && isInitialized) {
      // Si estamos cerrando, redirigir inmediatamente sin mensaje de error
      router.push('/dashboard/ventanillas')
    } else if (!ventanillaActiva && !isCerrandoVentanilla && ventanillaInfo && isInitialized) {
      // Solo redirigir si teníamos una ventanilla pero ya no la tenemos y no estamos cerrando
      toast({
        title: "Sin Ventanilla Activa",
        description: "Debe aperturar una ventanilla primero",
        variant: "destructive",
      })
      setTimeout(() => {
        router.push('/dashboard/ventanillas')
      }, 2000)
    }
  }, [ventanillaActiva, ventanillaInfo, isCerrandoVentanilla, isInitialized, router, toast])

  /**
   * Maneja el inicio del proceso de transacción
   */
  const handleProcesarTransaccion = () => {
    // Validar ventanilla activa
    if (!ventanillaActiva) {
      toast({
        title: "Error",
        description: "No hay ventanilla activa. Debe aperturar una ventanilla primero.",
        variant: "destructive",
      })
      setTimeout(() => {
        router.push('/dashboard/ventanillas')
      }, 2000)
      return
    }

    if (!puedeProcessar) {
      toast({
        title: "Error",
        description: "Complete todos los campos requeridos",
        variant: "destructive",
      })
      return
    }
    setShowComprobanteDialog(true)
  }

  /**
   * Maneja la selección del tipo de comprobante
   */
  const manejarOpcionComprobante = (opcion: 'sin_comprobante' | 'con_comprobante' | 'cancelar') => {
    setShowComprobanteDialog(false)
    
    if (opcion === 'cancelar') return
    
    if (opcion === 'con_comprobante') {
      setShowClienteSelector(true)
    } else {
      // Procesar sin comprobante (cliente ocasional)
      procesarTransaccionFinal(undefined, undefined)
    }
  }

  /**
   * Procesa la transacción final con los datos del cliente
   */
  const procesarTransaccionFinal = async (clienteId?: number, clienteTemp?: { nombres: string; apellidos: string; numero_documento: string; tipo_documento: string }) => {
    try {
      const exito = await procesarTransaccion(clienteId, clienteTemp)
      
      if (exito) {
        // Recargar historial después de procesar
        await recargarTransacciones()
        await cargarTiposCambio()
        
        // Limpiar formulario
        setMontoOrigen('')
        setMontoDestino('')
        setModoCalculoInverso(false)
        resetearTipoCambioPreferencial()
        
        toast({
          title: "Éxito",
          description: "Transacción procesada correctamente. Formulario listo para nueva operación.",
        })
      }
    } catch (error) {
      console.error('Error procesando transacción:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo procesar la transacción",
        variant: "destructive",
      })
    }
  }

  /**
   * Maneja la selección de cliente
   */
  const handleClienteSeleccionado = (clienteId: number) => {
    setShowClienteSelector(false)
    procesarTransaccionFinal(clienteId, undefined)
  }

  /**
   * Maneja el registro de cliente temporal
   */
  const handleClienteTemporalRegistrado = (clienteTemp: { nombres: string; apellidos: string; numero_documento: string; tipo_documento: string }) => {
    setShowClienteSelector(false)
    procesarTransaccionFinal(undefined, clienteTemp)
  }

  /**
   * Abre el modal de tipo de cambio preferencial
   */
  const handleAbrirCambioPreferencial = () => {
    if (!tipoCambioSeleccionado) {
      toast({
        title: "Error",
        description: "Seleccione un tipo de cambio primero",
        variant: "destructive",
      })
      return
    }
    setNuevoTipoCambio(tipoCambioCustom || (
      tipoOperacion === 'compra' 
        ? tipoCambioSeleccionado.tipo_compra.toFixed(2)
        : tipoCambioSeleccionado.tipo_venta.toFixed(2)
    ))
    setShowCambioPreferencial(true)
  }

  /**
   * Aplica el tipo de cambio preferencial
   */
  const handleAplicarCambioPreferencial = () => {
    const valor = parseFloat(nuevoTipoCambio)
    if (isNaN(valor) || valor <= 0) {
      toast({
        title: "Error",
        description: "Ingrese un tipo de cambio válido",
        variant: "destructive",
      })
      return
    }
    
    aplicarTipoCambioPreferencial(nuevoTipoCambio)
    setShowCambioPreferencial(false)
    
    toast({
      title: "Éxito",
      description: "Tipo de cambio preferencial aplicado",
    })
  }

  /**
   * Resetea el tipo de cambio preferencial
   */
  const handleResetearCambioPreferencial = () => {
    resetearTipoCambioPreferencial()
    setShowCambioPreferencial(false)
    
    toast({
      title: "Información",
      description: "Tipo de cambio restablecido al oficial",
    })
  }

  /**
   * Navega a la visualización de transacciones
   */
  const handleVerTodasTransacciones = () => {
    router.push('/dashboard/transacciones')
  }
  
  /**
   * Abre el diálogo para editar precio
   */
  const handleEditarPrecio = () => {
    if (!tipoCambioSeleccionado) {
      toast({
        title: "Error",
        description: "Seleccione un tipo de cambio primero",
        variant: "destructive",
      })
      return
    }
    // Initialize with current value
    setNuevoTipoCambio(tipoCambioCustom || (
      tipoOperacion === 'compra' 
        ? tipoCambioSeleccionado.tipo_compra.toFixed(2)
        : tipoCambioSeleccionado.tipo_venta.toFixed(2)
    ))
    setShowPrecioDialog(true)
  }

  /**
   * Obtiene las monedas para mostrar en el formulario
   */
  const obtenerMonedasFormulario = () => {
    if (!tipoCambioSeleccionado) {
      return { monedaOrigen: '', monedaDestino: '' }
    }
    
    return {
      monedaOrigen: tipoCambioSeleccionado.moneda_origen?.codigo || '',
      monedaDestino: tipoCambioSeleccionado.moneda_destino?.codigo || ''
    }
  }

  const { monedaOrigen, monedaDestino } = obtenerMonedasFormulario()
  
  /**
   * Selecciona todo el contenido del input al hacer focus
   */
  const handleMontoFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }
  
  /**
   * Maneja las teclas especiales en el input de monto
   */
  const handleMontoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleProcesarTransaccion()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setMontoOrigen('')
    }
  }
  
  /**
   * Maneja el cambio en el input de monto, limitando a 2 decimales
   */
  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Permitir solo números y un punto decimal
    if (!/^\d*\.?\d{0,2}$/.test(value)) {
      return
    }
    
    setMontoOrigen(value)
    setModoCalculoInverso(false)
    
    // Actualizar monto destino automáticamente
    if (value && tipoCambioSeleccionado && parseFloat(value) > 0) {
      const tipoCambioActual = obtenerTipoCambioActual()
      if (tipoCambioActual > 0) {
        let montoDestinoCalculado: number
        
        if (tipoOperacion === 'compra') {
          // Si compramos: monto_origen * tipo_cambio = monto_destino
          montoDestinoCalculado = parseFloat(value) * tipoCambioActual
        } else {
          // Si vendemos: monto_origen / tipo_cambio = monto_destino
          montoDestinoCalculado = parseFloat(value) / tipoCambioActual
        }
        
        setMontoDestino(montoDestinoCalculado.toFixed(2))
      }
    } else if (!value) {
      setMontoDestino('')
    }
  }
  
  /**
   * Maneja el cambio en el input de precio preferencial, limitando a 2 decimales
   */
  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Permitir solo números y un punto decimal con máximo 2 decimales
    if (!/^\d*\.?\d{0,2}$/.test(value)) {
      return
    }
    
    setNuevoTipoCambio(value)
  }
  
  /**
   * Selecciona todo el contenido del input de precio al hacer focus
   */
  const handlePrecioFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }
  
  /**
   * Maneja las teclas especiales en el input de precio
   */
  const handlePrecioKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setNuevoTipoCambio('')
    }
  }
  
  /**
   * Maneja el cambio en el input de monto destino (cálculo inverso)
   */
  const handleMontoDestinoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Permitir solo números y un punto decimal
    if (!/^\d*\.?\d{0,2}$/.test(value)) {
      return
    }
    
    setMontoDestino(value)
    setModoCalculoInverso(true)
    
    // Calcular monto origen basado en el monto destino
    if (value && tipoCambioSeleccionado && parseFloat(value) > 0) {
      const tipoCambioActual = obtenerTipoCambioActual()
      if (tipoCambioActual > 0) {
        let montoOrigenCalculado: number
        
        if (tipoOperacion === 'compra') {
          // Si compramos: monto_origen * tipo_cambio = monto_destino
          // Entonces: monto_origen = monto_destino / tipo_cambio
          montoOrigenCalculado = parseFloat(value) / tipoCambioActual
        } else {
          // Si vendemos: monto_origen / tipo_cambio = monto_destino
          // Entonces: monto_origen = monto_destino * tipo_cambio
          montoOrigenCalculado = parseFloat(value) * tipoCambioActual
        }
        
        setMontoOrigen(montoOrigenCalculado.toFixed(2))
      }
    } else if (!value) {
      setMontoOrigen('')
      setModoCalculoInverso(false)
    }
  }
  
  /**
   * Selecciona todo el contenido del input de monto destino al hacer focus
   */
  const handleMontoDestinoFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }
  
  /**
   * Maneja las teclas especiales en el input de monto destino
   */
  const handleMontoDestinoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleProcesarTransaccion()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setMontoDestino('')
      setMontoOrigen('')
      setModoCalculoInverso(false)
    }
  }
  
  /**
   * Calcula el total incluyendo el tipo de cambio
   */
  const calcularTotal = () => {
    if (!calculo?.es_valido) return 0
    return calculo.monto_destino
  }
  
  /**
   * Obtiene el tipo de cambio actual a usar
   */
  const obtenerTipoCambioActual = () => {
    if (!tipoCambioSeleccionado) return 0
    if (usarTipoCambioPersonalizado && tipoCambioCustom) {
      const customValue = parseFloat(tipoCambioCustom)
      return isNaN(customValue) ? 0 : customValue
    }
    return tipoOperacion === 'compra' ? tipoCambioSeleccionado.tipo_compra : tipoCambioSeleccionado.tipo_venta
  }
  
  /**
   * Aplica el precio preferencial
   */
  const handleAplicarPrecio = () => {
    if (nuevoTipoCambio) {
      aplicarTipoCambioPreferencial(nuevoTipoCambio)
      toast({
        title: "Éxito",
        description: "Tipo de cambio preferencial aplicado",
      })
    }
    setShowPrecioDialog(false)
  }

  // Mostrar carga mientras se inicializa o si no hay ventanilla activa
  if (!isInitialized || (!ventanillaActiva && !isCerrandoVentanilla)) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            {!isInitialized ? "Iniciando módulo de transacciones..." : "Verificando ventanilla activa..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">

      {/* Fila 1: Header con controles de caja y hora */}
      <HeaderControles 
        onPausarCaja={(paused) => setIsPaused(paused)}
        onCerrarCaja={() => {
          // Activar bandera antes de cerrar para evitar mensaje de error
          setIsCerrandoVentanilla(true)
          // El HeaderControles manejará internamente el cierre
        }}
      />

      {/* Fila 2: Selector de tipos de cambio */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Monedas y Acción
            </h3>
            
            {/* Encabezados de tabla */}
            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
              <div className="text-center">Par de Divisas</div>
              <div className="text-center">Compra</div>
              <div className="text-center">Venta</div>
              <div className="text-center">Acción</div>
            </div>

            {/* Lista de tipos de cambio */}
            <div className="space-y-2">
              {isLoadingOperacion ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Cargando tipos de cambio...</p>
                </div>
              ) : tiposCambio.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No hay tipos de cambio disponibles
                </div>
              ) : (
                tiposCambio.map((tipo) => {
                  const compraSeleccionada = tipoCambioSeleccionado?.id === tipo.id && tipoOperacion === 'compra'
                  const ventaSeleccionada = tipoCambioSeleccionado?.id === tipo.id && tipoOperacion === 'venta'

                  return (
                    <div 
                      key={tipo.id} 
                      className="grid grid-cols-4 gap-2 items-center py-2 px-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="font-medium text-sm text-center">{tipo.par_monedas}</div>
                      
                      <div className="text-center">
                        <span className="font-mono text-sm font-medium">
                          {tipo.tipo_compra.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-center">
                        <span className="font-mono text-sm font-medium">
                          {tipo.tipo_venta.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-center flex gap-1">
                        <Button
                          variant={compraSeleccionada ? "default" : "outline"}
                          size="sm"
                          className="text-xs px-2 py-1 h-7 flex-1"
                          onClick={() => seleccionarTipoCambio(tipo, 'compra')}
                          disabled={isPaused}
                        >
                          Comprar
                        </Button>
                        <Button
                          variant={ventaSeleccionada ? "default" : "outline"}
                          size="sm" 
                          className="text-xs px-2 py-1 h-7 flex-1"
                          onClick={() => seleccionarTipoCambio(tipo, 'venta')}
                          disabled={isPaused}
                        >
                          Vender
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fila 3: Formulario de transacción */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">Procesar Transacción</h3>
              {tipoCambioSeleccionado && (
                <Badge className="text-xs bg-green-500 text-white">
                  {tipoOperacion === 'compra' ? 'Compra' : 'Venta'}: {tipoCambioSeleccionado.par_monedas}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-12 gap-4">
              {/* Monto Recibido */}
              <div className="space-y-2 col-span-5">
                <label className="text-xs font-medium text-muted-foreground font-bold">
                  Monto Recibido
                </label>
                <Input
                  type="text"
                  placeholder="0.00"
                  value={montoOrigen}
                  onChange={handleMontoChange}
                  onFocus={handleMontoFocus}
                  onKeyDown={handleMontoKeyDown}
                  className="text-right font-mono font-bold"
                  style={{ fontSize: '1.2em' }}
                  disabled={!tipoCambioSeleccionado || isPaused}
                />
              </div>

              {/* Precio */}
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Precio
                </label>
                <div className="flex items-center gap-1">
                  <div className="h-10 px-3 py-2 border border-input bg-background rounded-md text-right font-mono flex-1">
                    {obtenerTipoCambioActual().toFixed(2)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditarPrecio}
                    className="h-10 w-8 p-0"
                    disabled={isPaused}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Total y Botón Procesar */}
              <div className="space-y-2 col-span-5">
                <label className="text-xs font-medium text-muted-foreground font-bold">
                  Total
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="0.00"
                    value={montoDestino}
                    onChange={handleMontoDestinoChange}
                    onFocus={handleMontoDestinoFocus}
                    onKeyDown={handleMontoDestinoKeyDown}
                    className="text-right font-mono font-bold bg-primary/10"
                    style={{ fontSize: '1.2em' }}
                    disabled={!tipoCambioSeleccionado || isPaused}
                  />
                  <Button
                    onClick={handleProcesarTransaccion}
                    disabled={!puedeProcessar || isPaused}
                    className="h-10 w-20"
                    size="sm"
                  >
                    Procesar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de últimos registros */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Transacciones Recientes</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard/transacciones')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Todas
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoadingHistorial ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Cargando transacciones...</p>
            </div>
          ) : transacciones.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No hay transacciones registradas aún
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Hora</TableHead>
                  <TableHead className="text-xs">Tipo</TableHead>
                  <TableHead className="text-xs">Monedas</TableHead>
                  <TableHead className="text-xs text-right">Monto</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transacciones.slice(0, 5).map((transaccion) => (
                  <TableRow key={transaccion.id} className="text-xs">
                    <TableCell className="font-mono">
                      {new Date(transaccion.fecha_transaccion).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaccion.tipo_operacion === 'COMPRA' ? 'default' : 'secondary'} className="text-xs">
                        {transaccion.tipo_operacion}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {transaccion.tipo_cambio?.moneda_origen?.codigo}/{transaccion.tipo_cambio?.moneda_destino?.codigo}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(transaccion.monto_origen, transaccion.tipo_cambio?.moneda_origen?.codigo || '')}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(transaccion.monto_destino, transaccion.tipo_cambio?.moneda_destino?.codigo || '')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {transaccion.estado || 'COMPLETADA'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de resumen de operación */}
      <Dialog open={showComprobanteDialog} onOpenChange={setShowComprobanteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Resumen de Operación
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Resumen visual */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Operación</div>
                  <div className="font-medium">{tipoOperacion === 'compra' ? 'Compra' : 'Venta'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Monedas</div>
                  <div className="font-medium">{monedaOrigen}/{monedaDestino}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Monto Recibido</div>
                  <div className="font-medium">{formatCurrency(parseFloat(montoOrigen) || 0, monedaOrigen)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total a Entregar</div>
                  <div className="font-medium text-lg">{formatCurrency(calcularTotal(), monedaDestino)}</div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              ¿Cómo desea procesar esta transacción?
            </p>
          </div>

          <DialogFooter className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              onClick={() => manejarOpcionComprobante('sin_comprobante')}
              className="w-full"
            >
              Sin Comprobante
            </Button>
            <Button 
              onClick={() => manejarOpcionComprobante('con_comprobante')}
              className="w-full"
            >
              Con Comprobante
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => manejarOpcionComprobante('cancelar')}
              className="w-full"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de selección de cliente */}
      <ClienteSelectorRapido
        open={showClienteSelector}
        onOpenChange={setShowClienteSelector}
        onClienteSeleccionado={handleClienteSeleccionado}
        onClienteTemporalRegistrado={handleClienteTemporalRegistrado}
      />

      {/* Modal de edición de precio */}
      <Dialog open={showPrecioDialog} onOpenChange={setShowPrecioDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Editar Precio</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {tipoCambioSeleccionado && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <div>Monedas: {tipoCambioSeleccionado.moneda_origen?.codigo}/{tipoCambioSeleccionado.moneda_destino?.codigo}</div>
                  <div>Operación: {tipoOperacion === 'compra' ? 'Compra' : 'Venta'}</div>
                  <div>Precio Oficial: {
                    tipoOperacion === 'compra' 
                      ? tipoCambioSeleccionado.tipo_compra 
                      : tipoCambioSeleccionado.tipo_venta
                  }</div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="precio-preferencial">Precio Preferencial</Label>
              <Input
                id="precio-preferencial"
                type="text"
                placeholder="0.00"
                value={nuevoTipoCambio}
                onChange={handlePrecioChange}
                onFocus={handlePrecioFocus}
                onKeyDown={handlePrecioKeyDown}
                className="font-mono text-right"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setNuevoTipoCambio('')
                setShowPrecioDialog(false)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAplicarPrecio}>
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de cambio preferencial */}
      <Dialog open={showCambioPreferencial} onOpenChange={setShowCambioPreferencial}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Tipo de Cambio Preferencial</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {tipoCambioSeleccionado && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <div>Monedas: {tipoCambioSeleccionado.moneda_origen?.codigo}/{tipoCambioSeleccionado.moneda_destino?.codigo}</div>
                  <div>Operación: {tipoOperacion === 'compra' ? 'Compra' : 'Venta'}</div>
                  <div>Precio Oficial: {
                    tipoOperacion === 'compra' 
                      ? tipoCambioSeleccionado.tipo_compra 
                      : tipoCambioSeleccionado.tipo_venta
                  }</div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="nuevo-tipo-cambio">Nuevo Tipo de Cambio</Label>
              <Input
                id="nuevo-tipo-cambio"
                type="text"
                placeholder="0.00"
                value={nuevoTipoCambio}
                onChange={handlePrecioChange}
                onFocus={handlePrecioFocus}
                onKeyDown={handlePrecioKeyDown}
                className="font-mono text-right"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={handleResetearCambioPreferencial}
            >
              Restablecer
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowCambioPreferencial(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAplicarCambioPreferencial}>
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Wrapper que inicializa el contexto antes de renderizar el contenido
 */
function RegistrarTransaccionWrapper() {
  const [isContextReady, setIsContextReady] = useState(false)
  
  useEffect(() => {
    // Pequeño delay para asegurar que el contexto se inicialice
    const timer = setTimeout(() => {
      setIsContextReady(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (!isContextReady) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Iniciando módulo de transacciones...</p>
        </div>
      </div>
    )
  }
  
  return <RegistrarTransaccionContent />
}

/**
 * Página de registro de transacciones con proveedor de contexto
 */
export default function RegistrarTransaccionPage() {
  return (
    <TransaccionProvider>
      <RegistrarTransaccionWrapper />
    </TransaccionProvider>
  )
}