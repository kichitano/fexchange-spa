import type { EstadoVentanilla } from "./enums"

export interface VentanillaDto {
  id: number
  identificador: string
  nombre: string
  estado: EstadoVentanilla
  activa: boolean
  casa_de_cambio_id: number
  created_at: Date
  updated_at: Date
}

export interface CreateVentanillaRequest {
  identificador: string
  nombre: string
  casa_de_cambio_id: number
}

export interface UpdateVentanillaRequest {
  identificador?: string
  nombre?: string
  estado?: EstadoVentanilla
  activa?: boolean
}

export interface MontoAperturaRequest {
  moneda_id: number
  monto: number
}

export interface AperturarVentanillaRequest {
  usuario_id: number
  montos_apertura: MontoAperturaRequest[]
  observaciones_apertura?: string
}

export interface MontoCierreDto {
  id?: number
  moneda_id: number
  moneda?: {
    id: number
    codigo: string
    nombre: string
    simbolo: string
  }
  monto: number
  monto_esperado: number
  monto_fisico_real?: number
  desfase_monto: number
  desfase_porcentaje: number
  confirmado_fisicamente: boolean
  observaciones_desfase?: string
}

export interface CierreVentanillaResumenDto {
  apertura_ventanilla_id: number
  montos_esperados: MontoCierreDto[]
  total_transacciones: number
  ganancia_total_calculada: number
}

export interface MontoCierreRequest {
  moneda_id: number
  monto_fisico_real: number
  confirmado_fisicamente: boolean
  observaciones_desfase?: string
}

export interface CierreVentanillaRequest {
  apertura_ventanilla_id: number
  observaciones_cierre?: string
  montos_cierre: MontoCierreRequest[]
}

export interface CerrarVentanillaRequest {
  usuario_id: number
  montos_cierre: MontoAperturaRequest[]
  observaciones_cierre?: string
}
