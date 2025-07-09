/**
 * Utilidades para Exportación de Datos
 * 
 * Funciones utilitarias para exportar datos a diferentes formatos
 * con configuraciones personalizadas y procesamiento avanzado.
 */

import type { TipoCambioDto } from '@/types/tipo-cambio'

export interface ExportConfig {
  formato: 'excel' | 'csv' | 'pdf'
  incluirColumnas: string[]
  filtros?: {
    fechaDesde?: string
    fechaHasta?: string
    estado?: 'activo' | 'inactivo' | 'todos'
    monedaOrigen?: number
    monedaDestino?: number
  }
  agrupacion?: 'ninguna' | 'moneda' | 'fecha' | 'estado'
  ordenamiento?: 'fecha' | 'moneda' | 'spread'
}

export interface ExportResult {
  success: boolean
  message: string
  filename?: string
  url?: string
}

/**
 * Procesa y filtra los datos según la configuración
 */
export function procesarDatos(
  datos: TipoCambioDto[], 
  config: ExportConfig
): TipoCambioDto[] {
  let datosProcesados = [...datos]

  // Aplicar filtros
  if (config.filtros) {
    const { fechaDesde, fechaHasta, estado, monedaOrigen, monedaDestino } = config.filtros

    if (fechaDesde) {
      datosProcesados = datosProcesados.filter(d => 
        new Date(d.fecha_vigencia) >= new Date(fechaDesde)
      )
    }

    if (fechaHasta) {
      datosProcesados = datosProcesados.filter(d => 
        new Date(d.fecha_vigencia) <= new Date(fechaHasta)
      )
    }

    if (estado && estado !== 'todos') {
      datosProcesados = datosProcesados.filter(d => 
        estado === 'activo' ? d.activo : !d.activo
      )
    }

    if (monedaOrigen) {
      datosProcesados = datosProcesados.filter(d => 
        d.moneda_origen_id === monedaOrigen
      )
    }

    if (monedaDestino) {
      datosProcesados = datosProcesados.filter(d => 
        d.moneda_destino_id === monedaDestino
      )
    }
  }

  // Aplicar ordenamiento
  if (config.ordenamiento) {
    datosProcesados.sort((a, b) => {
      switch (config.ordenamiento) {
        case 'fecha':
          return new Date(b.fecha_vigencia).getTime() - new Date(a.fecha_vigencia).getTime()
        case 'moneda':
          return (a.moneda_origen?.codigo || '').localeCompare(b.moneda_origen?.codigo || '')
        case 'spread':
          const spreadA = ((a.tipo_venta - a.tipo_compra) / a.tipo_compra) * 100
          const spreadB = ((b.tipo_venta - b.tipo_compra) / b.tipo_compra) * 100
          return spreadB - spreadA
        default:
          return 0
      }
    })
  }

  return datosProcesados
}

/**
 * Genera estadísticas de los datos
 */
export function generarEstadisticas(datos: TipoCambioDto[]) {
  const total = datos.length
  const activos = datos.filter(d => d.activo).length
  const inactivos = total - activos
  const conMantenerDiario = datos.filter(d => d.mantener_cambio_diario).length

  const spreads = datos.map(d => ((d.tipo_venta - d.tipo_compra) / d.tipo_compra) * 100)
  const spreadPromedio = spreads.length > 0 ? spreads.reduce((a, b) => a + b, 0) / spreads.length : 0
  const spreadMaximo = spreads.length > 0 ? Math.max(...spreads) : 0
  const spreadMinimo = spreads.length > 0 ? Math.min(...spreads) : 0

  // Agrupar por moneda
  const porMoneda = datos.reduce((acc, d) => {
    const par = `${d.moneda_origen?.codigo}/${d.moneda_destino?.codigo}`
    if (!acc[par]) {
      acc[par] = []
    }
    acc[par].push(d)
    return acc
  }, {} as Record<string, TipoCambioDto[]>)

  // Tendencias por fecha
  const porFecha = datos.reduce((acc, d) => {
    const fecha = new Date(d.fecha_vigencia).toISOString().split('T')[0]
    if (!acc[fecha]) {
      acc[fecha] = []
    }
    acc[fecha].push(d)
    return acc
  }, {} as Record<string, TipoCambioDto[]>)

  return {
    resumen: {
      total,
      activos,
      inactivos,
      conMantenerDiario,
      spreadPromedio: Number(spreadPromedio.toFixed(2)),
      spreadMaximo: Number(spreadMaximo.toFixed(2)),
      spreadMinimo: Number(spreadMinimo.toFixed(2))
    },
    porMoneda,
    porFecha,
    spreads
  }
}

/**
 * Convierte datos a formato CSV
 */
export function exportarCSV(
  datos: TipoCambioDto[], 
  config: ExportConfig
): ExportResult {
  try {
    const datosProcesados = procesarDatos(datos, config)
    
    // Definir headers basados en columnas incluidas
    const headerMap: Record<string, string> = {
      fecha: 'Fecha',
      monedas: 'Par de Monedas',
      tipoCompra: 'Tipo Compra',
      tipoVenta: 'Tipo Venta',
      spread: 'Spread %',
      estado: 'Estado',
      mantenerDiario: 'Mantener Diario',
      usuario: 'Usuario'
    }

    const headers = config.incluirColumnas
      .filter(col => headerMap[col])
      .map(col => headerMap[col])

    // Procesar filas
    const filas = datosProcesados.map(d => {
      const fila: string[] = []
      
      config.incluirColumnas.forEach(col => {
        switch (col) {
          case 'fecha':
            fila.push(new Date(d.fecha_vigencia).toLocaleDateString())
            break
          case 'monedas':
            fila.push(`${d.moneda_origen?.codigo || 'N/A'}/${d.moneda_destino?.codigo || 'N/A'}`)
            break
          case 'tipoCompra':
            fila.push(d.tipo_compra.toString())
            break
          case 'tipoVenta':
            fila.push(d.tipo_venta.toString())
            break
          case 'spread':
            const spread = ((d.tipo_venta - d.tipo_compra) / d.tipo_compra) * 100
            fila.push(spread.toFixed(2))
            break
          case 'estado':
            fila.push(d.activo ? 'Activo' : 'Inactivo')
            break
          case 'mantenerDiario':
            fila.push(d.mantener_cambio_diario ? 'Sí' : 'No')
            break
          case 'usuario':
            fila.push('Sistema') // TODO: Usuario real
            break
        }
      })
      
      return fila
    })

    // Generar CSV
    const csvContent = [
      headers.join(','),
      ...filas.map(fila => fila.map(celda => `"${celda}"`).join(','))
    ].join('\n')

    // Crear archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const fecha = new Date().toISOString().split('T')[0]
    const filename = `tipos-cambio-${fecha}.csv`

    // Descargar
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return {
      success: true,
      message: 'Datos exportados exitosamente',
      filename,
      url
    }
  } catch (error) {
    return {
      success: false,
      message: `Error al exportar: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }
  }
}

/**
 * Convierte datos a formato Excel (JSON simulado)
 */
export function exportarExcel(
  datos: TipoCambioDto[], 
  config: ExportConfig
): ExportResult {
  try {
    const datosProcesados = procesarDatos(datos, config)
    const estadisticas = generarEstadisticas(datosProcesados)

    // Crear estructura de Excel simulada
    const workbook = {
      SheetNames: ['Tipos de Cambio', 'Estadísticas'],
      Sheets: {
        'Tipos de Cambio': datosProcesados.map(d => {
          const fila: any = {}
          
          config.incluirColumnas.forEach(col => {
            switch (col) {
              case 'fecha':
                fila['Fecha'] = new Date(d.fecha_vigencia).toLocaleDateString()
                break
              case 'monedas':
                fila['Par de Monedas'] = `${d.moneda_origen?.codigo}/${d.moneda_destino?.codigo}`
                break
              case 'tipoCompra':
                fila['Tipo Compra'] = d.tipo_compra
                break
              case 'tipoVenta':
                fila['Tipo Venta'] = d.tipo_venta
                break
              case 'spread':
                fila['Spread %'] = ((d.tipo_venta - d.tipo_compra) / d.tipo_compra * 100).toFixed(2)
                break
              case 'estado':
                fila['Estado'] = d.activo ? 'Activo' : 'Inactivo'
                break
              case 'mantenerDiario':
                fila['Mantener Diario'] = d.mantener_cambio_diario ? 'Sí' : 'No'
                break
              case 'usuario':
                fila['Usuario'] = 'Sistema'
                break
            }
          })
          
          return fila
        }),
        'Estadísticas': [
          { Métrica: 'Total de Registros', Valor: estadisticas.resumen.total },
          { Métrica: 'Tipos Activos', Valor: estadisticas.resumen.activos },
          { Métrica: 'Tipos Inactivos', Valor: estadisticas.resumen.inactivos },
          { Métrica: 'Con Mantener Diario', Valor: estadisticas.resumen.conMantenerDiario },
          { Métrica: 'Spread Promedio (%)', Valor: estadisticas.resumen.spreadPromedio },
          { Métrica: 'Spread Máximo (%)', Valor: estadisticas.resumen.spreadMaximo },
          { Métrica: 'Spread Mínimo (%)', Valor: estadisticas.resumen.spreadMinimo }
        ]
      }
    }

    // Simular descarga de Excel (en producción usarías una librería como xlsx)
    const blob = new Blob([JSON.stringify(workbook, null, 2)], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = URL.createObjectURL(blob)
    const fecha = new Date().toISOString().split('T')[0]
    const filename = `tipos-cambio-${fecha}.xlsx`

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return {
      success: true,
      message: 'Datos exportados exitosamente',
      filename,
      url
    }
  } catch (error) {
    return {
      success: false,
      message: `Error al exportar: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }
  }
}

/**
 * Función principal de exportación
 */
export function exportarDatos(
  datos: TipoCambioDto[], 
  config: ExportConfig
): ExportResult {
  switch (config.formato) {
    case 'csv':
      return exportarCSV(datos, config)
    case 'excel':
      return exportarExcel(datos, config)
    case 'pdf':
      // TODO: Implementar exportación PDF
      return {
        success: false,
        message: 'Exportación PDF no implementada aún'
      }
    default:
      return {
        success: false,
        message: 'Formato de exportación no soportado'
      }
  }
}

/**
 * Plantillas de exportación predefinidas
 */
export const plantillasExportacion = {
  completo: {
    formato: 'excel' as const,
    incluirColumnas: ['fecha', 'monedas', 'tipoCompra', 'tipoVenta', 'spread', 'estado', 'mantenerDiario'],
    ordenamiento: 'fecha' as const
  },
  basico: {
    formato: 'csv' as const,
    incluirColumnas: ['fecha', 'monedas', 'tipoCompra', 'tipoVenta'],
    ordenamiento: 'fecha' as const
  },
  estadisticas: {
    formato: 'excel' as const,
    incluirColumnas: ['monedas', 'tipoCompra', 'tipoVenta', 'spread', 'estado'],
    agrupacion: 'moneda' as const,
    ordenamiento: 'spread' as const
  }
}