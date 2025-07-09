import type { TipoCliente } from "./enums"

export interface ClienteDto {
  id: number
  tipo: TipoCliente
  descripcion: string
  ruc?: string
  razon_social?: string
  direccion_fiscal?: string
  estado_civil?: string
  profesion?: string
  es_activo: boolean
  persona_id?: number
  persona?: {
    nombres: string
    apellido_paterno: string
    apellido_materno: string
    numero_documento: string
    fecha_nacimiento?: Date
    numero_telefono?: string
    direccion?: string
    tipo_documento?: string
    nacionalidad?: string
    ocupacion?: string
  }
  created_at: Date
  updated_at: Date
}

export interface CreateClienteRequest {
  tipo: TipoCliente
  descripcion?: string
  ruc?: string
  razon_social?: string
  direccion_fiscal?: string
  estado_civil?: string
  profesion?: string
  es_activo?: boolean
  persona_id?: number
}

export interface CreateClienteRegistradoRequest {
  persona: {
    nombres: string
    apellido_paterno: string
    apellido_materno: string
    fecha_nacimiento: string
    numero_telefono: string
    direccion: string
    tipo_documento: string
    numero_documento: string
    nacionalidad: string
    ocupacion: string
  }
  ruc?: string
  razon_social?: string
  direccion_fiscal?: string
  estado_civil?: string
  profesion?: string
  descripcion?: string
}

export interface CreateClienteOcasionalRequest {
  descripcion?: string
}

export interface CreateClienteEmpresarialRequest {
  razon_social: string
  ruc: string
  direccion_fiscal: string
  representante_legal: {
    nombres: string
    apellido_paterno: string
    apellido_materno: string
    fecha_nacimiento: string
    numero_telefono: string
    direccion: string
    tipo_documento: string
    numero_documento: string
    nacionalidad: string
    ocupacion: string
  }
  descripcion?: string
}

export interface UpdateClienteRequest {
  tipo?: TipoCliente
  descripcion?: string
  ruc?: string
  razon_social?: string
  direccion_fiscal?: string
  estado_civil?: string
  profesion?: string
  es_activo?: boolean
  persona_id?: number
}

export interface BuscarClienteRequest {
  nombres?: string
  apellido_paterno?: string
  apellido_materno?: string
  numero_documento?: string
  tipo_documento?: string
  ruc?: string
  razon_social?: string
  tipo_cliente?: TipoCliente
  es_activo?: boolean
  direccion_fiscal?: string
  profesion?: string
  limit?: number
  offset?: number
}

export interface ClienteTemporalData {
  nombres?: string
  apellidos?: string
  documento?: string
  descripcion?: string
}
