export interface MonedaDto {
  id: number
  codigo: string
  nombre: string
  simbolo: string
  decimales: number
  activa: boolean
  created_at: Date
  updated_at: Date
}

export interface CreateMonedaRequest {
  codigo: string
  nombre: string
  simbolo: string
  decimales: number
}

export interface UpdateMonedaRequest {
  codigo?: string
  nombre?: string
  simbolo?: string
  decimales?: number
  activa?: boolean
}
