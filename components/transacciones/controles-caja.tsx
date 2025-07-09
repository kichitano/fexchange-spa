"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pause, Power, Clock, AlertCircle } from "lucide-react"
import { useTransaccionContext } from '@/contexts/transaccion-context'

/**
 * Componente Controles de Caja
 * 
 * Interfaz para controles de ventanilla con reloj en tiempo real.
 * Incluye opciones para pausar y cerrar caja con validaciones de estado.
 */

interface ControlesCajaProps {
  onPausarCaja?: () => void
  onCerrarCaja?: () => void
  mostrarEstadoVentanilla?: boolean
}

export function ControlesCaja({
  onPausarCaja,
  onCerrarCaja,
  mostrarEstadoVentanilla = true
}: ControlesCajaProps) {
  // Estado del reloj
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Contexto de transacciones
  const { ventanillaActiva, isVentanillaAbierta } = useTransaccionContext()

  // Actualizar reloj cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  /**
   * Formatea la fecha actual en español
   */
  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-PE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  /**
   * Formatea la hora actual con AM/PM
   */
  const formatearHora = (fecha: Date) => {
    return fecha.toLocaleTimeString('es-PE', { 
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  /**
   * Obtiene el color del badge según el estado de la ventanilla
   */
  const obtenerColorEstadoVentanilla = () => {
    if (!ventanillaActiva) return 'destructive'
    return isVentanillaAbierta ? 'default' : 'secondary'
  }

  /**
   * Obtiene el texto del estado de la ventanilla
   */
  const obtenerTextoEstadoVentanilla = () => {
    if (!ventanillaActiva) return 'Sin Ventanilla'
    return isVentanillaAbierta ? 'Abierta' : 'Cerrada'
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          {/* Controles de caja - Lado izquierdo */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onPausarCaja}
              disabled={!isVentanillaAbierta}
            >
              <Pause className="h-4 w-4 mr-2" />
              Pausar Caja
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onCerrarCaja}
              disabled={!isVentanillaAbierta}
            >
              <Power className="h-4 w-4 mr-2" />
              Cerrar Caja
            </Button>

            {/* Estado de ventanilla */}
            {mostrarEstadoVentanilla && (
              <div className="flex items-center gap-2 ml-4">
                <Badge variant={obtenerColorEstadoVentanilla()} className="text-xs">
                  {obtenerTextoEstadoVentanilla()}
                </Badge>
                
                {ventanillaActiva && (
                  <span className="text-xs text-muted-foreground">
                    {ventanillaActiva.nombre}
                  </span>
                )}
              </div>
            )}

            {/* Advertencia si ventanilla no está abierta */}
            {!isVentanillaAbierta && (
              <div className="flex items-center gap-1 ml-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">
                  {!ventanillaActiva 
                    ? 'Seleccione una ventanilla' 
                    : 'Ventanilla cerrada - Abra para operar'
                  }
                </span>
              </div>
            )}
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

        {/* Información adicional de la sesión */}
        {isVentanillaAbierta && ventanillaActiva && (
          <div className="mt-3 pt-3 border-t">
            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>
                <span>Ventanilla:</span>
                <div className="font-medium text-foreground">
                  {ventanillaActiva.identificador}
                </div>
              </div>
              <div>
                <span>Operador:</span>
                <div className="font-medium text-foreground">
                  {/* TODO: Obtener del contexto de usuario */}
                  Usuario Actual
                </div>
              </div>
              <div>
                <span>Sesión iniciada:</span>
                <div className="font-medium text-foreground">
                  {/* TODO: Obtener hora de apertura */}
                  08:30 AM
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}