export interface PersonaDto {
  id: number
  nombres: string
  apellido_paterno: string
  apellido_materno: string
  fecha_nacimiento: Date
  numero_telefono: string
  direccion: string
  tipo_documento: string
  numero_documento: string
  nacionalidad: string
  ocupacion: string
  created_at: Date
  updated_at: Date
}

export interface CreatePersonaRequest {
  nombres: string
  apellido_paterno: string
  apellido_materno: string
  fecha_nacimiento: Date
  numero_telefono: string
  direccion: string
  tipo_documento: string
  numero_documento: string
  nacionalidad: string
  ocupacion: string
}

export interface UpdatePersonaRequest {
  nombres?: string
  apellido_paterno?: string
  apellido_materno?: string
  fecha_nacimiento?: Date
  numero_telefono?: string
  direccion?: string
  tipo_documento?: string
  numero_documento?: string
  nacionalidad?: string
  ocupacion?: string
}
