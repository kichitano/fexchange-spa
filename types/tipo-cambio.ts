export interface TipoCambioDto {
  id: number
  tipo_compra: number
  tipo_venta: number
  activo: boolean
  fecha_vigencia: Date
  mantener_cambio_diario: boolean
  casa_de_cambio_id: number
  moneda_origen_id: number
  moneda_destino_id: number
  moneda_origen?: {
    codigo: string
    nombre: string
    simbolo: string
  }
  moneda_destino?: {
    codigo: string
    nombre: string
    simbolo: string
  }
  created_at: Date
  updated_at: Date
}

// Interface para la respuesta de tipos de cambio activos desde getActivosPorCasa
export interface TipoCambioActivoDto {
  id: number
  par_monedas: string
  tipo_compra: number
  tipo_venta: number
  moneda_origen_id: number
  moneda_destino_id: number
  moneda_origen: {
    codigo: string
    simbolo: string
  }
  moneda_destino: {
    codigo: string
    simbolo: string
  }
}

export interface CreateTipoCambioRequest {
  tipo_compra: number
  tipo_venta: number
  casa_de_cambio_id: number
  moneda_origen_id: number
  moneda_destino_id: number
}

export interface UpdateTipoCambioRequest {
  tipo_compra?: number
  tipo_venta?: number
  activo?: boolean
  mantener_cambio_diario?: boolean
  fecha_vigencia?: Date
}

export interface ObtenerTipoVigenteRequest {
  moneda_origen_id: number
  moneda_destino_id: number
  casa_de_cambio_id: number
  fecha?: Date
}
