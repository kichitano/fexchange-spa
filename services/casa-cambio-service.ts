import { apiClient } from "./api-client"
import type { CasaDeCambioDto, CreateCasaDeCambioRequest, UpdateCasaDeCambioRequest } from "@/types/casa-cambio"
import type { ApiResponse } from "@/types/api-response"

class CasaDeCambioService {
  /**
   * Obtiene todas las casas de cambio
   */
  async getAll(): Promise<ApiResponse<CasaDeCambioDto[]>> {
    return apiClient.get("/casas-de-cambio")
  }

  /**
   * Obtiene una casa de cambio específica por ID
   */
  async getById(id: number): Promise<ApiResponse<CasaDeCambioDto>> {
    return apiClient.get(`/casas-de-cambio/${id}`)
  }

  async getByIdentificador(identificador: string): Promise<ApiResponse<CasaDeCambioDto>> {
    return apiClient.get(`/casas-de-cambio/identificador/${identificador}`)
  }

  /**
   * Crea una nueva casa de cambio
   */
  async create(data: CreateCasaDeCambioRequest): Promise<ApiResponse<CasaDeCambioDto>> {
    return apiClient.post("/casas-de-cambio", data)
  }

  /**
   * Actualiza una casa de cambio existente
   */
  async update(id: number, data: UpdateCasaDeCambioRequest): Promise<ApiResponse<CasaDeCambioDto>> {
    return apiClient.put(`/casas-de-cambio/${id}`, data)
  }

  /**
   * Elimina una casa de cambio
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/casas-de-cambio/${id}`)
  }

  async verifyRequirements(id: number): Promise<ApiResponse<{ meetsRequirements: boolean }>> {
    return apiClient.get(`/casas-de-cambio/${id}/verify-requirements`)
  }

  /**
   * Activa o desactiva una casa de cambio
   */
  async toggleActive(id: number): Promise<ApiResponse<CasaDeCambioDto>> {
    return apiClient.patch(`/casas-de-cambio/${id}/toggle-active`)
  }
}

export const casaDeCambioService = new CasaDeCambioService()
