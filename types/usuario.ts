import type { RolUsuario } from "./enums"
import type { PersonaDto } from "./persona"
import type { CasaDeCambioDto } from "./casa-cambio"

export interface UsuarioDto {
  id?: number
  username: string
  email: string
  rol: RolUsuario
  activo: boolean
  persona_id: number
  casa_de_cambio_id: number
  created_at?: Date
  updated_at?: Date
  // Relaciones opcionales
  persona?: PersonaDto
  casa_de_cambio?: CasaDeCambioDto
}

export interface CreateUsuarioRequest {
  username: string
  email: string
  password: string
  rol: RolUsuario
  persona_id: number
  casa_de_cambio_id: number
}

export interface UpdateUsuarioRequest {
  username?: string
  email?: string
  password?: string
  rol?: RolUsuario
  persona_id?: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  usuario: UsuarioDto
  token: string
}
