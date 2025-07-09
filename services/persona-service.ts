import { apiClient } from "./api-client"
import type { PersonaDto, CreatePersonaRequest, UpdatePersonaRequest } from "@/types/persona"
import type { ApiResponse } from "@/types/api-response"

class PersonaService {
  /**
   * Obtiene todas las personas
   */
  async getAll(): Promise<ApiResponse<PersonaDto[]>> {
    return apiClient.get("/personas")
  }

  /**
   * Obtiene una persona específica por ID
   */
  async getById(id: number): Promise<ApiResponse<PersonaDto>> {
    return apiClient.get(`/personas/${id}`)
  }

  async getByNumeroDocumento(numeroDocumento: string): Promise<ApiResponse<PersonaDto>> {
    return apiClient.get(`/personas/documento/${numeroDocumento}`)
  }

  async searchByName(query: string): Promise<ApiResponse<PersonaDto[]>> {
    return apiClient.get(`/personas/search?q=${encodeURIComponent(query)}`)
  }

  /**
   * Crea una nueva persona
   */
  async create(data: CreatePersonaRequest): Promise<ApiResponse<PersonaDto>> {
    return apiClient.post("/personas", data)
  }

  /**
   * Actualiza una persona existente
   */
  async update(id: number, data: UpdatePersonaRequest): Promise<ApiResponse<PersonaDto>> {
    return apiClient.put(`/personas/${id}`, data)
  }

  /**
   * Elimina una persona
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/personas/${id}`)
  }

  /**
   * Verifica si la persona puede ser eliminada
   */
  async canBeDeleted(id: number): Promise<ApiResponse<{ canBeDeleted: boolean }>> {
    return apiClient.get(`/personas/${id}/can-be-deleted`)
  }
}

export const personaService = new PersonaService()
