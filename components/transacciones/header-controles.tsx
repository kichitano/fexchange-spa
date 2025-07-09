"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Clock, Power, Building2, User, CreditCard, Pause, AlertTriangle } from "lucide-react"
import { EstadoVentanilla } from "@/types/enums"
import { useVentanilla } from "@/contexts/ventanilla-context"
import { useToast } from "@/hooks/use-toast"
import { ventanillaService } from "@/services/ventanilla-service"
import { useRouter } from "next/navigation"
import { CierreVentanillaDialog } from "@/components/ventanillas/cierre-ventanilla-dialog"

interface HeaderControlesProps {
  onCerrarCaja?: () => void
  onPausarCaja?: (isPaused: boolean) => void
}

export function HeaderControles({ onCerrarCaja, onPausarCaja }: HeaderControlesProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showCerrarDialog, setShowCerrarDialog] = useState(false)
  const [showPausarDialog, setShowPausarDialog] = useState(false)
  const [tiempoPausado, setTiempoPausado] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const { ventanillaActiva, cerrarVentanilla } = useVentanilla()
  const { toast } = useToast()
  const router = useRouter()

  // Actualizar reloj cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Actualizar temporizador de pausa
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isPaused) {
      interval = setInterval(() => {
        setTiempoPausado(prev => prev + 1)
      }, 1000)
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isPaused])

  const formatearHora = (fecha: Date) => {
    return fecha.toLocaleTimeString('es-PE', { 
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-PE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatearTiempoPausado = (segundos: number) => {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const segs = segundos % 60
    
    if (horas > 0) {
      return `${horas}h ${minutos}m ${segs}s`
    } else if (minutos > 0) {
      return `${minutos}m ${segs}s`
    } else {
      return `${segs}s`
    }
  }

  const formatearSesionApertura = (sesionApertura: string) => {
    try {
      // Si sesionApertura ya está en formato de hora, usarlo directamente
      if (sesionApertura.includes('AM') || sesionApertura.includes('PM')) {
        return sesionApertura
      }
      
      // Si es una fecha ISO, convertirla
      const fecha = new Date(sesionApertura)
      if (!isNaN(fecha.getTime())) {
        return fecha.toLocaleTimeString('es-ES', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      // Si no se puede procesar, mostrar como está
      return sesionApertura
    } catch (error) {
      return sesionApertura
    }
  }

  const handleCerrarCaja = () => {
    // Notificar al padre que se está iniciando el cierre
    if (onCerrarCaja) {
      onCerrarCaja()
    }
    // Siempre abrir el dialog
    setShowCerrarDialog(true)
  }
  
  const manejarCierreCaja = () => {
    toast({
      title: "Éxito",
      description: "Ventanilla cerrada correctamente",
    })
    
    cerrarVentanilla()
    setShowCerrarDialog(false)
    
    // Notificar al componente padre que se cerró la caja
    if (onCerrarCaja) {
      onCerrarCaja()
    } else {
      router.push('/dashboard/ventanillas')
    }
  }

  const handlePausarCaja = () => {
    setIsPaused(true)
    setTiempoPausado(0)
    setShowPausarDialog(true)
    if (onPausarCaja) {
      onPausarCaja(true)
    }
  }
  
  const continuarCaja = () => {
    setIsPaused(false)
    setTiempoPausado(0)
    setShowPausarDialog(false)
    
    if (onPausarCaja) {
      onPausarCaja(false)
    }
    
    toast({
      title: "Sesión Reanudada",
      description: "Ventanilla lista para continuar operando",
    })
  }

  // Memorizar el objeto ventanilla para evitar recreaciones innecesarias
  const ventanillaDialogData = useMemo(() => {
    if (!ventanillaActiva) return null
    
    return {
      id: ventanillaActiva.id,
      identificador: `V-${ventanillaActiva.id}`,
      nombre: ventanillaActiva.nombre,
      estado: EstadoVentanilla.ABIERTA,
      activa: true,
      casa_de_cambio_id: ventanillaActiva.casaDeCambioId,
      created_at: new Date(),
      updated_at: new Date()
    }
  }, [ventanillaActiva?.id, ventanillaActiva?.nombre, ventanillaActiva?.casaDeCambioId])

  return (
    <div className="space-y-4">
      {/* Controles y reloj */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            {/* Controles de caja - Lado izquierdo */}
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePausarCaja}
                disabled={!ventanillaActiva || isPaused}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pausar Ventanilla
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleCerrarCaja}
                disabled={!ventanillaActiva || isPaused}
              >
                <Power className="h-4 w-4 mr-2" />
                Cerrar Ventanilla
              </Button>

              {/* Estado de ventanilla */}
              <div className="flex items-center gap-2 ml-4">
                <Badge variant={ventanillaActiva ? "default" : "destructive"} className="text-xs">
                  {ventanillaActiva ? "Ventanilla Abierta" : "Sin Ventanilla"}
                </Badge>
              </div>
            </div>

            {/* Fecha y hora - Lado derecho */}
            <div className="flex items-center gap-4">
              {/* Fecha */}
              <div className="text-sm text-muted-foreground text-right">
                <div className="capitalize">
                  {formatearFecha(currentTime)}
                </div>
              </div>

              {/* Separador visual */}
              <div className="h-8 w-px bg-border" />

              {/* Reloj en tiempo real */}
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div className="text-lg font-mono font-medium">
                  {formatearHora(currentTime)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de sesión */}
      {ventanillaActiva && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-6">
              {/* Casa de Cambio */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-xs font-medium">Casa de Cambio</span>
                </div>
                <div className="font-medium text-sm">{ventanillaActiva.casaDeCambio}</div>
              </div>

              {/* Ventanilla */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-xs font-medium">Ventanilla</span>
                </div>
                <div className="font-medium text-sm">{ventanillaActiva.nombre}</div>
              </div>

              {/* Operador */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-medium">Operador</span>
                </div>
                <div className="font-medium text-sm">{ventanillaActiva.operador}</div>
              </div>

              {/* Sesión Actual */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium">Sesión Actual</span>
                </div>
                <div className="font-medium text-sm font-mono">
                  {formatearSesionApertura(ventanillaActiva.sesionApertura)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Diálogo de cierre de ventanilla */}
      <CierreVentanillaDialog
        open={showCerrarDialog}
        onOpenChange={setShowCerrarDialog}
        ventanilla={ventanillaDialogData}
        onSave={manejarCierreCaja}
      />
      
      {/* Diálogo de pausa con bloqueo de pantalla */}
      <Dialog open={showPausarDialog} onOpenChange={() => {}}>
        <DialogContent 
          className="sm:max-w-[400px]" 
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pause className="h-5 w-5 text-yellow-600" />
              Ventanilla Pausada
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                {formatearTiempoPausado(tiempoPausado)}
              </div>
              <p className="text-sm text-muted-foreground">
                Tiempo transcurrido en pausa
              </p>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-700">
                  La ventanilla está pausada. Todas las operaciones están bloqueadas.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={continuarCaja}
              className="w-full"
              size="lg"
            >
              <Clock className="h-4 w-4 mr-2" />
              Continuar Operaciones
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Overlay de bloqueo cuando está pausado */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
      )}
    </div>
  )
}