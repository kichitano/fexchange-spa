/**
 * Utilidades de Formato
 * 
 * Funciones utilitarias para formatear fechas, monedas, números
 * y otros datos comunes en la aplicación.
 */

/**
 * Formatea una fecha a string legible
 */
export function formatearFecha(fecha: Date | string, formato: 'corto' | 'largo' | 'completo' = 'corto'): string {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
  
  if (isNaN(fechaObj.getTime())) {
    return 'Fecha inválida'
  }

  const opciones: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Lima' // Zona horaria de Perú
  }

  switch (formato) {
    case 'corto':
      opciones.day = '2-digit'
      opciones.month = '2-digit'
      opciones.year = 'numeric'
      return fechaObj.toLocaleDateString('es-PE', opciones)
    
    case 'largo':
      opciones.day = 'numeric'
      opciones.month = 'long'
      opciones.year = 'numeric'
      return fechaObj.toLocaleDateString('es-PE', opciones)
    
    case 'completo':
      opciones.day = 'numeric'
      opciones.month = 'long'
      opciones.year = 'numeric'
      opciones.hour = '2-digit'
      opciones.minute = '2-digit'
      return fechaObj.toLocaleDateString('es-PE', opciones)
    
    default:
      return fechaObj.toLocaleDateString('es-PE')
  }
}

/**
 * Formatea una fecha para inputs de tipo date
 */
export function formatearFechaParaInput(fecha: Date | string): string {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
  
  if (isNaN(fechaObj.getTime())) {
    return ''
  }

  return fechaObj.toISOString().split('T')[0]
}

/**
 * Obtiene la fecha actual en formato ISO para inputs
 */
export function fechaActualParaInput(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Calcula la diferencia en días entre dos fechas
 */
export function diasEntreFechas(fecha1: Date | string, fecha2: Date | string): number {
  const fecha1Obj = typeof fecha1 === 'string' ? new Date(fecha1) : fecha1
  const fecha2Obj = typeof fecha2 === 'string' ? new Date(fecha2) : fecha2
  
  const diffTime = Math.abs(fecha2Obj.getTime() - fecha1Obj.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Formatea un valor de moneda
 */
export function formatearMoneda(
  valor: number, 
  simbolo: string = 'S/', 
  decimales: number = 2
): string {
  if (isNaN(valor)) {
    return `${simbolo} 0.00`
  }

  return `${simbolo} ${valor.toFixed(decimales)}`
}

/**
 * Formatea un número con separadores de miles
 */
export function formatearNumero(
  valor: number, 
  decimales: number = 2,
  usarSeparadores: boolean = true
): string {
  if (isNaN(valor)) {
    return '0'
  }

  const opciones: Intl.NumberFormatOptions = {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
    useGrouping: usarSeparadores
  }

  return valor.toLocaleString('es-PE', opciones)
}

/**
 * Formatea un porcentaje
 */
export function formatearPorcentaje(
  valor: number, 
  decimales: number = 2,
  incluirSigno: boolean = true
): string {
  if (isNaN(valor)) {
    return '0%'
  }

  const valorFormateado = valor.toFixed(decimales)
  return incluirSigno ? `${valorFormateado}%` : valorFormateado
}

/**
 * Formatea un par de monedas
 */
export function formatearParMonedas(
  origenCodigo: string, 
  destinoCodigo: string,
  formato: 'simple' | 'completo' = 'simple'
): string {
  if (!origenCodigo || !destinoCodigo) {
    return 'Par no válido'
  }

  switch (formato) {
    case 'simple':
      return `${origenCodigo}/${destinoCodigo}`
    
    case 'completo':
      return `${origenCodigo} → ${destinoCodigo}`
    
    default:
      return `${origenCodigo}/${destinoCodigo}`
  }
}

/**
 * Calcula y formatea el spread entre tipos de compra y venta
 */
export function calcularYFormatearSpread(
  tipoCompra: number, 
  tipoVenta: number,
  formato: 'porcentaje' | 'diferencia' = 'porcentaje'
): string {
  if (isNaN(tipoCompra) || isNaN(tipoVenta) || tipoCompra === 0) {
    return '0'
  }

  if (formato === 'diferencia') {
    return formatearNumero(tipoVenta - tipoCompra, 4)
  }

  const spread = ((tipoVenta - tipoCompra) / tipoCompra) * 100
  return formatearPorcentaje(spread)
}

/**
 * Formatea el estado (activo/inactivo) con colores
 */
export function formatearEstado(
  activo: boolean,
  formato: 'texto' | 'badge' = 'texto'
): { texto: string; clase?: string } {
  if (formato === 'badge') {
    return {
      texto: activo ? 'Activo' : 'Inactivo',
      clase: activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }
  }

  return {
    texto: activo ? 'Activo' : 'Inactivo'
  }
}

/**
 * Valida si una fecha es válida
 */
export function esFechaValida(fecha: Date | string): boolean {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
  return !isNaN(fechaObj.getTime())
}

/**
 * Valida si una fecha está en el pasado
 */
export function esFechaPasada(fecha: Date | string): boolean {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  return fechaObj < hoy
}

/**
 * Valida si una fecha está en el futuro
 */
export function esFechaFutura(fecha: Date | string): boolean {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
  const hoy = new Date()
  hoy.setHours(23, 59, 59, 999)
  
  return fechaObj > hoy
}

/**
 * Trunca texto con puntos suspensivos
 */
export function truncarTexto(texto: string, longitud: number = 50): string {
  if (!texto) return ''
  
  if (texto.length <= longitud) {
    return texto
  }
  
  return texto.substring(0, longitud - 3) + '...'
}

/**
 * Capitaliza la primera letra de cada palabra
 */
export function capitalizarTexto(texto: string): string {
  if (!texto) return ''
  
  return texto
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ')
}

/**
 * Formatea un número de transacción con ceros a la izquierda
 */
export function formatearNumeroTransaccion(numero: number, longitud: number = 6): string {
  return numero.toString().padStart(longitud, '0')
}

/**
 * Genera un ID único basado en timestamp
 */
export function generarIdUnico(prefijo: string = ''): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2)
  return `${prefijo}${timestamp}${random}`
}

/**
 * Valida si un número está en un rango válido
 */
export function validarRangoNumerico(
  valor: number, 
  minimo: number, 
  maximo: number
): { valido: boolean; mensaje?: string } {
  if (isNaN(valor)) {
    return { valido: false, mensaje: 'El valor no es un número válido' }
  }
  
  if (valor < minimo) {
    return { valido: false, mensaje: `El valor debe ser mayor o igual a ${minimo}` }
  }
  
  if (valor > maximo) {
    return { valido: false, mensaje: `El valor debe ser menor o igual a ${maximo}` }
  }
  
  return { valido: true }
}

/**
 * Formatea tiempo transcurrido (hace X tiempo)
 */
export function formatearTiempoTranscurrido(fecha: Date | string): string {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
  const ahora = new Date()
  const diffMs = ahora.getTime() - fechaObj.getTime()
  
  const minutos = Math.floor(diffMs / (1000 * 60))
  const horas = Math.floor(diffMs / (1000 * 60 * 60))
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (minutos < 1) {
    return 'Hace unos momentos'
  } else if (minutos < 60) {
    return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`
  } else if (horas < 24) {
    return `Hace ${horas} hora${horas > 1 ? 's' : ''}`
  } else {
    return `Hace ${dias} día${dias > 1 ? 's' : ''}`
  }
}

/**
 * Extrae solo números de una cadena
 */
export function extraerNumeros(texto: string): string {
  return texto.replace(/[^0-9.]/g, '')
}

/**
 * Valida formato de email
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Genera un rango de fechas para filtros
 */
export function generarRangoFechas(tipo: 'hoy' | 'semana' | 'mes' | 'trimestre' | 'año'): { desde: string; hasta: string } {
  const hoy = new Date()
  const desde = new Date()
  
  switch (tipo) {
    case 'hoy':
      desde.setHours(0, 0, 0, 0)
      break
    case 'semana':
      desde.setDate(hoy.getDate() - 7)
      break
    case 'mes':
      desde.setMonth(hoy.getMonth() - 1)
      break
    case 'trimestre':
      desde.setMonth(hoy.getMonth() - 3)
      break
    case 'año':
      desde.setFullYear(hoy.getFullYear() - 1)
      break
  }
  
  return {
    desde: formatearFechaParaInput(desde),
    hasta: formatearFechaParaInput(hoy)
  }
}