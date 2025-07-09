import type { EstadoTransaccion, TipoCliente } from "./enums"
import type { ClienteTemporalData } from "./cliente"

/**
 * Módulo de Transacciones - Tipos y DTOs
 * 
 * Define todas las interfaces necesarias para el manejo de transacciones
 * de cambio de moneda, incluyendo procesamiento, cálculos y validaciones.
 */

export interface TransaccionDto {
  id: number
  numero_transaccion: string
  monto_origen: number
  monto_destino: number
  tipo_cambio_aplicado: number
  ganancia: number
  estado: EstadoTransaccion
  tipo_operacion: 'COMPRA' | 'VENTA'
  fecha_transaccion: Date
  observaciones?: string
  cliente_id?: number
  ventanilla_id: number
  moneda_origen_id: number
  moneda_destino_id: number
  tipo_cambio_id: number
  cliente?: {
    tipo: TipoCliente
    descripcion: string
    persona?: {
      nombres: string
      apellido_paterno: string
      apellido_materno: string
    }
  }
  cliente_temporal?: ClienteTemporalData
  moneda_origen?: {
    codigo: string
    simbolo: string
  }
  moneda_destino?: {
    codigo: string
    simbolo: string
  }
  tipo_cambio?: {
    moneda_origen?: {
      codigo: string
      simbolo: string
    }
    moneda_destino?: {
      codigo: string
      simbolo: string
    }
  }
  ventanilla?: {
    identificador: string
    nombre: string
  }
  created_at: Date
  updated_at: Date
}

export interface ProcesarCambioRequest {
  clienteId?: number
  clienteTemp?: ClienteTemporalData
  ventanillaId: number
  monedaOrigenId: number
  monedaDestinoId: number
  montoOrigen: number
  tipoOperacion: 'COMPRA' | 'VENTA'
  observaciones?: string
}

export interface CalcularConversionRequest {
  montoOrigen: number
  monedaOrigenId: number
  monedaDestinoId: number
  casaDeCambioId: number
}

export interface CalcularConversionResponse {
  montoDestino: number
  tipoCambio: number
  ganancia: number
}

// Interfaces faltantes para sincronización con backend
export interface VerificarDisponibilidadRequest {
  ventanillaId: number
  monedaId: number
  monto: number
}

export interface VerificarDisponibilidadResponse {
  disponible: boolean
  montoDisponible?: number
  mensaje?: string
}

export interface CancelarTransaccionRequest {
  motivo: string
}

export interface ConsultarTransaccionesRequest {
  fechaInicio?: string
  fechaFin?: string
  ventanillaId?: number
  clienteId?: number
  estado?: EstadoTransaccion
  limit?: number
  offset?: number
}

// Response estandarizada para todas las operaciones
export interface TransaccionApiResponse<T = any> {
  message: string
  data: T
  errors?: any[]
}

// Filtros para consultas optimizadas
export interface FiltrosTransaccion {
  limit?: number
  offset?: number
  ordenar?: 'fecha_desc' | 'fecha_asc' | 'monto_desc' | 'monto_asc'
  ventanillaId?: number
  estado?: EstadoTransaccion
  fechaInicio?: string
  fechaFin?: string
  busqueda?: string // Búsqueda por número, cliente, moneda, etc.
  clienteId?: number
  monedaId?: number
}
