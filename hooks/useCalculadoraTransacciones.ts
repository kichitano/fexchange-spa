import { useState, useCallback, useMemo } from 'react'
import type { TipoCambioDto } from '@/types/tipo-cambio'

/**
 * Hook personalizado para cálculos de transacciones
 * 
 * Maneja toda la lógica de cálculo de conversiones de moneda,
 * incluyendo tipos de cambio preferenciales y validaciones.
 */

interface CalculoResultado {
  montoDestino: number
  ganancia: number
  tipoCambioAplicado: number
  esValido: boolean
  error?: string
}

interface TipoCambioSeleccionado {
  id: number
  par_monedas: string
  tipo_compra: number
  tipo_venta: number
  moneda_origen_id: number
  moneda_destino_id: number
  moneda_origen: { codigo: string; simbolo: string }
  moneda_destino: { codigo: string; simbolo: string }
}

type TipoOperacion = 'compra' | 'venta'

export function useCalculadoraTransacciones() {
  const [tipoCambioSeleccionado, setTipoCambioSeleccionado] = useState<TipoCambioSeleccionado | null>(null)
  const [tipoOperacion, setTipoOperacion] = useState<TipoOperacion>('compra')
  const [montoOrigen, setMontoOrigen] = useState('')
  const [tipoCambioPersonalizado, setTipoCambioPersonalizado] = useState('')
  const [usarTipoCambioPersonalizado, setUsarTipoCambioPersonalizado] = useState(false)

  /**
   * Calcula la conversión de moneda con las reglas de negocio
   */
  const calcularConversion = useCallback((): CalculoResultado => {
    if (!tipoCambioSeleccionado || !montoOrigen || parseFloat(montoOrigen) <= 0) {
      return {
        montoDestino: 0,
        ganancia: 0,
        tipoCambioAplicado: 0,
        esValido: false,
        error: 'Datos incompletos para el cálculo'
      }
    }

    try {
      const monto = parseFloat(montoOrigen)
      
      // Determinar tipo de cambio a usar
      let tipoCambioAUsar: number
      if (usarTipoCambioPersonalizado && tipoCambioPersonalizado) {
        tipoCambioAUsar = parseFloat(tipoCambioPersonalizado)
        if (isNaN(tipoCambioAUsar) || tipoCambioAUsar <= 0) {
          return {
            montoDestino: 0,
            ganancia: 0,
            tipoCambioAplicado: 0,
            esValido: false,
            error: 'Tipo de cambio personalizado inválido'
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
        // Casa compra moneda extranjera, paga en soles
        montoDestino = monto * tipoCambioAUsar
        ganancia = monto * (tipoCambioSeleccionado.tipo_venta - tipoCambioAUsar)
      } else {
        // Casa vende moneda extranjera, recibe soles
        montoDestino = monto / tipoCambioAUsar
        ganancia = (monto / tipoCambioAUsar) * (tipoCambioAUsar - tipoCambioSeleccionado.tipo_compra)
      }

      return {
        montoDestino: Number(montoDestino.toFixed(4)),
        ganancia: Number(ganancia.toFixed(4)),
        tipoCambioAplicado: Number(tipoCambioAUsar.toFixed(4)),
        esValido: true
      }
    } catch (error) {
      return {
        montoDestino: 0,
        ganancia: 0,
        tipoCambioAplicado: 0,
        esValido: false,
        error: 'Error en el cálculo'
      }
    }
  }, [tipoCambioSeleccionado, tipoOperacion, montoOrigen, usarTipoCambioPersonalizado, tipoCambioPersonalizado])

  /**
   * Resultado del cálculo actualizado automáticamente
   */
  const resultado = useMemo(() => calcularConversion(), [calcularConversion])

  /**
   * Selecciona un tipo de cambio y operación
   */
  const seleccionarTipoCambio = useCallback((tipo: TipoCambioSeleccionado, operacion: TipoOperacion) => {
    setTipoCambioSeleccionado(tipo)
    setTipoOperacion(operacion)
    // Resetear tipo de cambio personalizado al cambiar de tipo
    setUsarTipoCambioPersonalizado(false)
    setTipoCambioPersonalizado('')
  }, [])

  /**
   * Aplica un tipo de cambio preferencial
   */
  const aplicarTipoCambioPreferencial = useCallback((tipoCambio: string) => {
    setTipoCambioPersonalizado(tipoCambio)
    setUsarTipoCambioPersonalizado(true)
  }, [])

  /**
   * Resetea el tipo de cambio preferencial
   */
  const resetearTipoCambioPreferencial = useCallback(() => {
    setUsarTipoCambioPersonalizado(false)
    setTipoCambioPersonalizado('')
  }, [])

  /**
   * Limpia todos los valores del formulario
   */
  const limpiarFormulario = useCallback(() => {
    setMontoOrigen('')
    setUsarTipoCambioPersonalizado(false)
    setTipoCambioPersonalizado('')
  }, [])

  /**
   * Valida si se puede procesar la transacción
   */
  const puedeProcessar = useMemo(() => {
    return resultado.esValido && resultado.montoDestino > 0
  }, [resultado])

  return {
    // Estados
    tipoCambioSeleccionado,
    tipoOperacion,
    montoOrigen,
    tipoCambioPersonalizado,
    usarTipoCambioPersonalizado,
    resultado,
    puedeProcessar,

    // Acciones
    setMontoOrigen,
    seleccionarTipoCambio,
    aplicarTipoCambioPreferencial,
    resetearTipoCambioPreferencial,
    limpiarFormulario,

    // Utilidades
    calcularConversion
  }
}