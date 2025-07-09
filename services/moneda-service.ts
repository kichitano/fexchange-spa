import { apiClient } from "./api-client"
import type { MonedaDto, CreateMonedaRequest, UpdateMonedaRequest } from "@/types/moneda"
import type { ApiResponse } from "@/types/api-response"

class MonedaService {
  /**
   * Obtiene todas las monedas con opción de incluir inactivas
   */
  async getAll(includeInactive: boolean = false): Promise<ApiResponse<MonedaDto[]>> {
    const params = includeInactive ? "?includeInactive=true" : ""
    return apiClient.get(`/monedas${params}`)
  }

  /**
   * Obtiene una moneda específica por ID
   */
  async getById(id: number): Promise<ApiResponse<MonedaDto>> {
    return apiClient.get(`/monedas/${id}`)
  }

  /**
   * Obtiene solo las monedas activas
   */
  async getActivas(): Promise<ApiResponse<MonedaDto[]>> {
    return apiClient.get("/monedas/active")
  }

  /**
   * Crea una nueva moneda
   */
  async create(data: CreateMonedaRequest): Promise<ApiResponse<MonedaDto>> {
    return apiClient.post("/monedas", data)
  }

  /**
   * Actualiza una moneda existente
   */
  async update(id: number, data: UpdateMonedaRequest): Promise<ApiResponse<MonedaDto>> {
    return apiClient.put(`/monedas/${id}`, data)
  }

  /**
   * Elimina una moneda
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/monedas/${id}`)
  }

  /**
   * Activa o desactiva una moneda
   */
  async toggleActive(id: number): Promise<ApiResponse<MonedaDto>> {
    return apiClient.patch(`/monedas/${id}/toggle-active`)
  }

  /**
   * Obtiene una moneda por código
   */
  async getByCodigo(codigo: string): Promise<ApiResponse<MonedaDto>> {
    return apiClient.get(`/monedas/codigo/${codigo}`)
  }

  /**
   * Busca monedas por término
   */
  async search(searchTerm: string): Promise<ApiResponse<MonedaDto[]>> {
    return apiClient.get(`/monedas/search?q=${encodeURIComponent(searchTerm)}`)
  }

  /**
   * Verifica si una moneda puede ser eliminada
   */
  async canBeDeleted(id: number): Promise<ApiResponse<{ canBeDeleted: boolean }>> {
    return apiClient.get(`/monedas/${id}/can-be-deleted`)
  }
}

export const monedaService = new MonedaService()
