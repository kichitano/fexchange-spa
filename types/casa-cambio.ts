export interface CasaDeCambioDto {
  id: number
  identificador: string
  nombre: string
  direccion: string
  telefono: string
  email: string
  ruc: string
  razon_social: string
  moneda_maestra_id: number
  activa: boolean
  created_at: Date
  updated_at: Date
}

export interface CreateCasaDeCambioRequest {
  identificador: string
  nombre: string
  direccion: string
  telefono: string
  email: string
  ruc: string
  razon_social: string
  moneda_maestra_id: number
  activa?: boolean
}

export interface UpdateCasaDeCambioRequest {
  identificador?: string
  nombre?: string
  direccion?: string
  telefono?: string
  email?: string
  ruc?: string
  razon_social?: string
  moneda_maestra_id?: number
  activa?: boolean
}
