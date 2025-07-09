/**
 * Utilidades de Validación
 * 
 * Funciones utilitarias para validar datos específicos del dominio
 * de casas de cambio y tipos de cambio.
 */

/**
 * Validaciones para tipos de cambio
 */
export const validacionesTipoCambio = {
  /**
   * Valida que los tipos de cambio estén en rangos razonables
   */
  validarRangosRazonables(tipoCompra: number, tipoVenta: number): { valido: boolean; mensaje?: string } {
    const MINIMO = 0.01
    const MAXIMO = 1000

    if (tipoCompra < MINIMO || tipoCompra > MAXIMO) {
      return { 
        valido: false, 
        mensaje: `El tipo de compra debe estar entre ${MINIMO} y ${MAXIMO}` 
      }
    }

    if (tipoVenta < MINIMO || tipoVenta > MAXIMO) {
      return { 
        valido: false, 
        mensaje: `El tipo de venta debe estar entre ${MINIMO} y ${MAXIMO}` 
      }
    }

    return { valido: true }
  },

  /**
   * Valida que el tipo de venta sea mayor al tipo de compra
   */
  validarVentaMayorQueCompra(tipoCompra: number, tipoVenta: number): { valido: boolean; mensaje?: string } {
    if (tipoVenta <= tipoCompra) {
      return { 
        valido: false, 
        mensaje: 'El tipo de venta debe ser mayor al tipo de compra' 
      }
    }
    return { valido: true }
  },

  /**
   * Valida que la diferencia entre venta y compra no sea excesiva (máx 50%)
   */
  validarDiferenciasExcesivas(tipoCompra: number, tipoVenta: number): { valido: boolean; mensaje?: string } {
    const SPREAD_MAXIMO = 0.5 // 50%
    
    if (tipoCompra <= 0) {
      return { valido: false, mensaje: 'El tipo de compra debe ser mayor a 0' }
    }

    const spread = (tipoVenta - tipoCompra) / tipoCompra
    
    if (spread > SPREAD_MAXIMO) {
      return { 
        valido: false, 
        mensaje: `La diferencia entre venta y compra no puede ser mayor al ${SPREAD_MAXIMO * 100}%` 
      }
    }

    return { valido: true }
  },

  /**
   * Valida fecha de vigencia
   */
  validarFechaVigencia(fechaVigencia: string): { valido: boolean; mensaje?: string } {
    const fecha = new Date(fechaVigencia)
    const hoy = new Date()
    
    if (isNaN(fecha.getTime())) {
      return { valido: false, mensaje: 'La fecha de vigencia no es válida' }
    }

    // Para nuevos registros, la fecha debe ser hoy o en el futuro
    hoy.setHours(0, 0, 0, 0)
    fecha.setHours(0, 0, 0, 0)
    
    if (fecha < hoy) {
      return { 
        valido: false, 
        mensaje: 'La fecha de vigencia no puede ser anterior a hoy' 
      }
    }

    return { valido: true }
  },

  /**
   * Validación completa de tipo de cambio
   */
  validarTipoCambioCompleto(datos: {
    tipoCompra: number
    tipoVenta: number
    fechaVigencia: string
    monedaOrigenId: number
    monedaDestinoId: number
  }): { valido: boolean; errores: string[] } {
    const errores: string[] = []

    // Validar rangos
    const validacionRangos = this.validarRangosRazonables(datos.tipoCompra, datos.tipoVenta)
    if (!validacionRangos.valido) {
      errores.push(validacionRangos.mensaje!)
    }

    // Validar venta mayor que compra
    const validacionVenta = this.validarVentaMayorQueCompra(datos.tipoCompra, datos.tipoVenta)
    if (!validacionVenta.valido) {
      errores.push(validacionVenta.mensaje!)
    }

    // Validar diferencias excesivas
    const validacionDiferencia = this.validarDiferenciasExcesivas(datos.tipoCompra, datos.tipoVenta)
    if (!validacionDiferencia.valido) {
      errores.push(validacionDiferencia.mensaje!)
    }

    // Validar fecha
    const validacionFecha = this.validarFechaVigencia(datos.fechaVigencia)
    if (!validacionFecha.valido) {
      errores.push(validacionFecha.mensaje!)
    }

    // Validar monedas diferentes
    if (datos.monedaOrigenId === datos.monedaDestinoId) {
      errores.push('La moneda de origen debe ser diferente a la moneda de destino')
    }

    return {
      valido: errores.length === 0,
      errores
    }
  }
}

/**
 * Validaciones para transacciones
 */
export const validacionesTransaccion = {
  /**
   * Valida monto de transacción
   */
  validarMonto(monto: number): { valido: boolean; mensaje?: string } {
    const MONTO_MINIMO = 1
    const MONTO_MAXIMO = 100000

    if (isNaN(monto) || monto <= 0) {
      return { valido: false, mensaje: 'El monto debe ser mayor a 0' }
    }

    if (monto < MONTO_MINIMO) {
      return { valido: false, mensaje: `El monto mínimo es ${MONTO_MINIMO}` }
    }

    if (monto > MONTO_MAXIMO) {
      return { valido: false, mensaje: `El monto máximo es ${MONTO_MAXIMO}` }
    }

    return { valido: true }
  },

  /**
   * Valida fondos disponibles
   */
  validarFondosDisponibles(montoSolicitado: number, fondosDisponibles: number): { valido: boolean; mensaje?: string } {
    if (montoSolicitado > fondosDisponibles) {
      return { 
        valido: false, 
        mensaje: `Fondos insuficientes. Disponible: ${fondosDisponibles}, Solicitado: ${montoSolicitado}` 
      }
    }

    return { valido: true }
  },

  /**
   * Valida documento de identidad
   */
  validarDocumentoIdentidad(tipo: 'DNI' | 'CE' | 'PASAPORTE', numero: string): { valido: boolean; mensaje?: string } {
    switch (tipo) {
      case 'DNI':
        if (!/^\d{8}$/.test(numero)) {
          return { valido: false, mensaje: 'El DNI debe tener 8 dígitos' }
        }
        break
      
      case 'CE':
        if (!/^\d{9}$/.test(numero)) {
          return { valido: false, mensaje: 'El Carné de Extranjería debe tener 9 dígitos' }
        }
        break
      
      case 'PASAPORTE':
        if (!/^[A-Z0-9]{6,12}$/.test(numero)) {
          return { valido: false, mensaje: 'El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos' }
        }
        break
    }

    return { valido: true }
  }
}

/**
 * Validaciones para ventanillas
 */
export const validacionesVentanilla = {
  /**
   * Valida horario de apertura
   */
  validarHorarioApertura(): { valido: boolean; mensaje?: string } {
    const ahora = new Date()
    const hora = ahora.getHours()
    const HORA_APERTURA = 8
    const HORA_CIERRE = 18

    if (hora < HORA_APERTURA || hora >= HORA_CIERRE) {
      return { 
        valido: false, 
        mensaje: `Las ventanillas solo pueden abrirse entre las ${HORA_APERTURA}:00 y ${HORA_CIERRE}:00` 
      }
    }

    return { valido: true }
  },

  /**
   * Valida fondos iniciales
   */
  validarFondosIniciales(fondos: { [monedaId: number]: number }): { valido: boolean; errores: string[] } {
    const errores: string[] = []
    const FONDO_MINIMO = 100

    Object.entries(fondos).forEach(([monedaId, monto]) => {
      if (monto < FONDO_MINIMO) {
        errores.push(`El fondo mínimo para la moneda ${monedaId} es ${FONDO_MINIMO}`)
      }
    })

    return {
      valido: errores.length === 0,
      errores
    }
  }
}

/**
 * Validaciones generales del sistema
 */
export const validacionesSistema = {
  /**
   * Valida permisos de usuario
   */
  validarPermisos(permisosRequeridos: string[], permisosUsuario: string[]): { valido: boolean; mensaje?: string } {
    const tienePermisos = permisosRequeridos.every(permiso => 
      permisosUsuario.includes(permiso)
    )

    if (!tienePermisos) {
      return { 
        valido: false, 
        mensaje: 'No tiene permisos suficientes para realizar esta acción' 
      }
    }

    return { valido: true }
  },

  /**
   * Valida estado de ventanilla activa
   */
  validarVentanillaActiva(ventanillaId: number | null): { valido: boolean; mensaje?: string } {
    if (!ventanillaId) {
      return { 
        valido: false, 
        mensaje: 'Debe tener una ventanilla activa para realizar esta operación' 
      }
    }

    return { valido: true }
  },

  /**
   * Valida conexión de red (simulado)
   */
  validarConexionRed(): { valido: boolean; mensaje?: string } {
    // En una implementación real, esto verificaría la conectividad
    if (!navigator.onLine) {
      return { 
        valido: false, 
        mensaje: 'No hay conexión a internet. Verifique su conectividad.' 
      }
    }

    return { valido: true }
  }
}

/**
 * Validaciones para exportación
 */
export const validacionesExportacion = {
  /**
   * Valida configuración de exportación
   */
  validarConfiguracionExportacion(config: {
    formato: string
    fechaDesde?: string
    fechaHasta?: string
    incluirColumnas: string[]
  }): { valido: boolean; errores: string[] } {
    const errores: string[] = []

    // Validar formato
    if (!['excel', 'csv', 'pdf'].includes(config.formato)) {
      errores.push('Formato de exportación no válido')
    }

    // Validar fechas
    if (config.fechaDesde && config.fechaHasta) {
      const desde = new Date(config.fechaDesde)
      const hasta = new Date(config.fechaHasta)
      
      if (desde > hasta) {
        errores.push('La fecha desde no puede ser mayor a la fecha hasta')
      }
    }

    // Validar columnas
    if (config.incluirColumnas.length === 0) {
      errores.push('Debe seleccionar al menos una columna para exportar')
    }

    return {
      valido: errores.length === 0,
      errores
    }
  }
}

/**
 * Funciones de validación utilitarias
 */
export const utilidadesValidacion = {
  /**
   * Ejecuta múltiples validaciones y devuelve el resultado consolidado
   */
  ejecutarValidaciones(validaciones: Array<() => { valido: boolean; mensaje?: string }>): {
    valido: boolean
    errores: string[]
  } {
    const errores: string[] = []

    validaciones.forEach(validacion => {
      const resultado = validacion()
      if (!resultado.valido && resultado.mensaje) {
        errores.push(resultado.mensaje)
      }
    })

    return {
      valido: errores.length === 0,
      errores
    }
  },

  /**
   * Debounce para validaciones en tiempo real
   */
  debounceValidacion<T extends any[]>(
    validacion: (...args: T) => any,
    delay: number = 300
  ): (...args: T) => void {
    let timeoutId: NodeJS.Timeout

    return (...args: T) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => validacion(...args), delay)
    }
  },

  /**
   * Valida múltiples campos de un objeto
   */
  validarObjeto<T extends Record<string, any>>(
    objeto: T,
    validadores: Partial<Record<keyof T, (valor: any) => { valido: boolean; mensaje?: string }>>
  ): { valido: boolean; errores: Record<keyof T, string> } {
    const errores = {} as Record<keyof T, string>

    Object.entries(validadores).forEach(([campo, validador]) => {
      if (validador) {
        const resultado = validador(objeto[campo])
        if (!resultado.valido && resultado.mensaje) {
          errores[campo as keyof T] = resultado.mensaje
        }
      }
    })

    return {
      valido: Object.keys(errores).length === 0,
      errores
    }
  }
}