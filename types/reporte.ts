import { TipoReporte } from './enums'

export interface ReporteGananciasDto {
  tipo: TipoReporte
  fecha_inicio: Date
  fecha_fin: Date
  ganancia_total: number
  total_transacciones: number
  monto_total_operado: number
  casa_de_cambio_id?: number
  ventanilla_id?: number
  ventanillas?: ReporteVentanillaDto[]
  monedas?: ReporteMonedaDto[]
  transacciones_por_dia?: ReporteDiarioDto[]
  created_at?: Date
}

export interface ReporteVentanillaDto {
  ventanilla_id: number
  ventanilla_nombre: string
  ganancia: number
  total_transacciones: number
  monto_operado: number
}

export interface ReporteMonedaDto {
  moneda_id: number
  moneda_codigo: string
  moneda_nombre: string
  monto_origen: number
  monto_destino: number
  ganancia: number
  total_transacciones: number
}

export interface ReporteDiarioDto {
  fecha: Date
  ganancia: number
  total_transacciones: number
  monto_operado: number
}

export interface ResumenTransaccionesDto {
  total_completadas: number
  total_canceladas: number
  total_pendientes: number
  monto_total_completadas: number
  ganancia_total: number
  transacciones_mas_grandes?: {
    numero_transaccion: string
    monto_origen: number
    monto_destino: number
    ganancia: number
    fecha: Date
  }[]
}

export interface GenerarReporteGananciasRequest {
  tipo: TipoReporte
  fecha_inicio: string // YYYY-MM-DD
  fecha_fin?: string // YYYY-MM-DD
  casa_de_cambio_id: number
  ventanilla_id?: number
}

export interface ConsultarReporteRequest {
  fecha_inicio: string
  fecha_fin: string
  casa_de_cambio_id: number
  ventanilla_id?: number
  moneda_id?: number
}

export interface ReporteTransaccionesRequest {
  fecha_inicio: string
  fecha_fin: string
  casa_de_cambio_id?: number
  ventanilla_id?: number
  cliente_id?: number
  estado?: string
  limit?: number
  order_by?: string
  order_direction?: string
}

export interface ReporteRendimientoRequest {
  fecha_inicio: string
  fecha_fin: string
  casa_de_cambio_id: number
  granularidad?: string
}

// Dashboard Types
export interface DashboardData {
  resumen: ResumenTransaccionesDto
  rendimiento_ventanillas: RendimientoVentanilla[]
  estadisticas_monedas: EstadisticaMoneda[]
  transacciones_rentables: TransaccionRentable[]
  tendencia_ganancias: ReporteDiarioDto[]
  periodo: {
    fecha_inicio: Date
    fecha_fin: Date
  }
}

export interface RendimientoVentanilla {
  id: number
  nombre: string
  total_transacciones: number
  ganancia_total: number
  monto_operado: number
  ganancia_promedio: number
}

export interface EstadisticaMoneda {
  codigo: string
  nombre: string
  veces_origen: number
  veces_destino: number
  monto_total_origen: number
  monto_total_destino: number
}

export interface TransaccionRentable {
  numero_transaccion: string
  monto_origen: number
  monto_destino: number
  ganancia: number
  created_at: Date
  moneda_origen: string
  moneda_destino: string
  ventanilla: string
  cliente: string
}

export interface ReporteSBS {
  transacciones: TransaccionSBS[]
  resumen: {
    total_operaciones: number
    monto_total: number
    clientes_registrados: number
    clientes_no_registrados: number
  }
}

export interface TransaccionSBS {
  numero_transaccion: string
  monto_origen: number
  monto_destino: number
  ganancia: number
  created_at: Date
  moneda_origen: string
  moneda_destino: string
  tipo_cliente: string
  cliente_descripcion: string
  cliente_ruc?: string
  nombres?: string
  apellido_paterno?: string
  apellido_materno?: string
  tipo_documento?: string
  numero_documento?: string
  nacionalidad?: string
  ocupacion?: string
  ventanilla: string
}

export { TipoReporte }
