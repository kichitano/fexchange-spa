"use client"

import { useState, useCallback, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { transaccionService } from '@/services/transaccion-service'
import { tipoCambioService } from '@/services/tipo-cambio-service'
import type { TipoCambioDto, TipoCambioActivoDto } from '@/types/tipo-cambio'
import type { TransaccionDto, ProcesarCambioRequest } from '@/types/transaccion'
import { useTransaccionContext, useCasaDeCambioActual, useVentanillaActual } from '@/contexts/transaccion-context'
import { useVentanilla } from '@/contexts/ventanilla-context'

/**
 * Hook para Operaciones de Transacciones
 * 
 * Maneja toda la lógica de negocio para transacciones rápidas:
 * - Carga de tipos de cambio activos
 * - Cálculos de conversión en tiempo real
 * - Procesamiento de transacciones
 * - Gestión de estado de operación
 */

interface TipoCambioSeleccionado extends TipoCambioActivoDto {
  // par_monedas ya está incluido en TipoCambioActivoDto
}

interface CalculoTransaccion {
  monto_origen: number
  monto_destino: number
  tipo_cambio_aplicado: number
  ganancia: number
  es_valido: boolean
  mensaje_error?: string
}

type TipoOperacion = 'compra' | 'venta'

export function useTransaccionesOperacion() {
  // Estados principales
  const [tiposCambio, setTiposCambio] = useState<TipoCambioActivoDto[]>([])
  const [tipoCambioSeleccionado, setTipoCambioSeleccionado] = useState<TipoCambioSeleccionado | null>(null)
  const [tipoOperacion, setTipoOperacion] = useState<TipoOperacion>('compra')
  const [montoOrigen, setMontoOrigen] = useState('')
  const [calculo, setCalculo] = useState<CalculoTransaccion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Estados para tipo de cambio personalizado
  const [usarTipoCambioPersonalizado, setUsarTipoCambioPersonalizado] = useState(false)
  const [tipoCambioCustom, setTipoCambioCustom] = useState('')

  // Contexto y hooks
  const { toast } = useToast()
  const { ventanillaActiva } = useVentanilla()
  const { casaDeCambioId } = useTransaccionContext()
  
  // Usar casa de cambio de la ventanilla activa o por defecto
  const casaDeCambioIdActual = ventanillaActiva?.casaDeCambioId || casaDeCambioId || 1

  /**
   * Carga los tipos de cambio activos para la casa de cambio actual
   */
  const cargarTiposCambio = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await tipoCambioService.getActivosPorCasa(casaDeCambioIdActual)
      
      if (response.data) {
        setTiposCambio(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de cambio",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [casaDeCambioIdActual, toast])

  /**
   * Calcula la conversión de moneda con las reglas de negocio
   */
  const calcularConversion = useCallback((): CalculoTransaccion => {
    if (!tipoCambioSeleccionado || !montoOrigen || parseFloat(montoOrigen) <= 0) {
      return {
        monto_origen: 0,
        monto_destino: 0,
        tipo_cambio_aplicado: 0,
        ganancia: 0,
        es_valido: false,
        mensaje_error: 'Datos incompletos para el cálculo'
      }
    }

    try {
      const monto = parseFloat(montoOrigen)
      
      // Determinar tipo de cambio a usar
      let tipoCambioAUsar: number
      if (usarTipoCambioPersonalizado && tipoCambioCustom) {
        tipoCambioAUsar = parseFloat(tipoCambioCustom)
        if (isNaN(tipoCambioAUsar) || tipoCambioAUsar <= 0) {
          return {
            monto_origen: 0,
            monto_destino: 0,
            tipo_cambio_aplicado: 0,
            ganancia: 0,
            es_valido: false,
            mensaje_error: 'Tipo de cambio personalizado inválido'
          }
        }
      } else {
        tipoCambioAUsar = tipoOperacion === 'compra' 
          ? tipoCambioSeleccionado.tipo_compra 
          : tipoCambioSeleccionado.tipo_venta
      }

      let montoDestino: number
      let ganancia: number

      if (tipoOperacion === 'compra') {
        // Casa compra moneda extranjera del cliente, paga en soles
        montoDestino = monto * tipoCambioAUsar
        // Ganancia: diferencia entre lo que pagamos y lo que podríamos vender
        ganancia = monto * (tipoCambioSeleccionado.tipo_venta - tipoCambioAUsar)
      } else {
        // Casa vende moneda extranjera al cliente, recibe soles  
        montoDestino = monto / tipoCambioAUsar
        // Ganancia: diferencia entre lo que recibimos y lo que nos costó
        ganancia = (monto / tipoCambioAUsar) * (tipoCambioAUsar - tipoCambioSeleccionado.tipo_compra)
      }

      return {
        monto_origen: Number(monto.toFixed(4)),
        monto_destino: Number(montoDestino.toFixed(4)),
        tipo_cambio_aplicado: Number(tipoCambioAUsar.toFixed(4)),
        ganancia: Number(ganancia.toFixed(4)),
        es_valido: true
      }
    } catch (error) {
      return {
        monto_origen: 0,
        monto_destino: 0,
        tipo_cambio_aplicado: 0,
        ganancia: 0,
        es_valido: false,
        mensaje_error: 'Error en el cálculo'
      }
    }
  }, [tipoCambioSeleccionado, tipoOperacion, montoOrigen, usarTipoCambioPersonalizado, tipoCambioCustom])

  /**
   * Selecciona un tipo de cambio y operación
   */
  const seleccionarTipoCambio = useCallback((tipo: TipoCambioActivoDto, operacion: TipoOperacion) => {
    setTipoCambioSeleccionado(tipo)
    setTipoOperacion(operacion)
    // Resetear tipo de cambio personalizado al cambiar de tipo
    setUsarTipoCambioPersonalizado(false)
    setTipoCambioCustom('')
  }, [])

  /**
   * Aplica un tipo de cambio preferencial
   */
  const aplicarTipoCambioPreferencial = useCallback((tipoCambio: string) => {
    setTipoCambioCustom(tipoCambio)
    setUsarTipoCambioPersonalizado(true)
  }, [])

  /**
   * Resetea el tipo de cambio preferencial
   */
  const resetearTipoCambioPreferencial = useCallback(() => {
    setUsarTipoCambioPersonalizado(false)
    setTipoCambioCustom('')
  }, [])

  /**
   * Limpia todos los valores del formulario
   */
  const limpiarFormulario = useCallback(() => {
    setMontoOrigen('')
    setUsarTipoCambioPersonalizado(false)
    setTipoCambioCustom('')
    setCalculo(null)
  }, [])

  /**
   * Procesa una transacción de cambio
   */
  const procesarTransaccion = useCallback(async (clienteId?: number, clienteTemp?: any): Promise<boolean> => {
    if (!calculo?.es_valido || !tipoCambioSeleccionado) {
      toast({
        title: "Error",
        description: "Complete todos los campos requeridos",
        variant: "destructive",
      })
      return false
    }

    // Validar que hay una ventanilla activa
    if (!ventanillaActiva?.id) {
      toast({
        title: "Error",
        description: "No hay ventanilla activa. Debe aperturar una ventanilla primero.",
        variant: "destructive",
      })
      return false
    }

    // Validar que las monedas están definidas
    if (!tipoCambioSeleccionado.moneda_origen_id || !tipoCambioSeleccionado.moneda_destino_id) {
      toast({
        title: "Error",
        description: "Error en configuración de monedas",
        variant: "destructive",
      })
      return false
    }

    try {
      const request: ProcesarCambioRequest = {
        clienteId,
        clienteTemp,
        ventanillaId: ventanillaActiva.id,
        monedaOrigenId: tipoCambioSeleccionado.moneda_origen_id,
        monedaDestinoId: tipoCambioSeleccionado.moneda_destino_id,
        montoOrigen: calculo.monto_origen,
        tipoOperacion: tipoOperacion.toUpperCase() as 'COMPRA' | 'VENTA',
        observaciones: usarTipoCambioPersonalizado 
          ? `Tipo de cambio preferencial: ${tipoCambioCustom}` 
          : undefined
      }

      await transaccionService.procesarCambio(request)

      toast({
        title: "Éxito",
        description: "Transacción procesada correctamente",
      })

      // Limpiar formulario después del éxito
      limpiarFormulario()
      return true
    } catch (error) {
      console.error('Error procesando transacción:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo procesar la transacción",
        variant: "destructive",
      })
      return false
    }
  }, [calculo, tipoCambioSeleccionado, usarTipoCambioPersonalizado, tipoCambioCustom, limpiarFormulario, toast, ventanillaActiva])

  // Recalcular automáticamente cuando cambian los parámetros
  useEffect(() => {
    const resultado = calcularConversion()
    setCalculo(resultado)
  }, [calcularConversion])

  // Cargar datos iniciales
  useEffect(() => {
    cargarTiposCambio()
  }, [cargarTiposCambio])

  return {
    // Estados
    tiposCambio,
    tipoCambioSeleccionado,
    tipoOperacion,
    montoOrigen,
    calculo,
    isLoading,
    usarTipoCambioPersonalizado,
    tipoCambioCustom,
    
    // Acciones
    setMontoOrigen,
    seleccionarTipoCambio,
    aplicarTipoCambioPreferencial,
    resetearTipoCambioPreferencial,
    limpiarFormulario,
    procesarTransaccion,
    cargarTiposCambio,
    
    // Utilidades
    puedeProcessar: calculo?.es_valido && calculo.monto_destino > 0
  }
}