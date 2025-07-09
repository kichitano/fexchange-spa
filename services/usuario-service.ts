import { apiClient } from "./api-client"
import type { UsuarioDto, CreateUsuarioRequest, UpdateUsuarioRequest } from "@/types/usuario"
import type { ApiResponse } from "@/types/api-response"

class UsuarioService {
  /**
   * Obtiene usuarios por casa de cambio
   */
  async getByCasaDeCambio(casaDeCambioId: number): Promise<ApiResponse<UsuarioDto[]>> {
    return apiClient.get(`/usuarios/casa-de-cambio/${casaDeCambioId}`)
  }

  /**
   * Obtiene un usuario por ID
   */
  async getById(id: number): Promise<ApiResponse<UsuarioDto>> {
    return apiClient.get(`/usuarios/${id}`)
  }

  /**
   * Crea un nuevo usuario
   */
  async create(data: CreateUsuarioRequest): Promise<ApiResponse<UsuarioDto>> {
    return apiClient.post("/usuarios", data)
  }

  /**
   * Actualiza un usuario existente
   */
  async update(id: number, data: UpdateUsuarioRequest): Promise<ApiResponse<UsuarioDto>> {
    return apiClient.put(`/usuarios/${id}`, data)
  }

  /**
   * Activa o desactiva un usuario
   */
  async toggleActive(id: number): Promise<ApiResponse<UsuarioDto>> {
    return apiClient.patch(`/usuarios/${id}/toggle-active`)
  }

  /**
   * Cambia la contraseña de un usuario
   */
  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/usuarios/${id}/change-password`, { oldPassword, newPassword })
  }

  /**
   * Verifica los requisitos de administradores para una casa de cambio
   */
  async verifyAdminRequirements(casaDeCambioId: number): Promise<ApiResponse<{ meetsRequirements: boolean }>> {
    return apiClient.get(`/usuarios/casa-de-cambio/${casaDeCambioId}/verify-admin-requirements`)
  }

  /**
   * Verifica si el usuario actual tiene una ventanilla activa
   */
  async hasVentanillaActiva(): Promise<ApiResponse<{ hasVentanilla: boolean; ventanillaId?: number; ventanillaNombre?: string }>> {
    return apiClient.get('/usuarios/ventanilla/activa')
  }

  /**
   * Verifica si el usuario actual puede aperturar una ventanilla específica
   */
  async canAperturarVentanilla(ventanillaId: number): Promise<ApiResponse<{ canAperturar: boolean; reason?: string }>> {
    return apiClient.get(`/usuarios/ventanilla/can-aperturar/${ventanillaId}`)
  }

  /**
   * Obtiene la ventanilla activa del usuario actual
   */
  async getVentanillaActiva(): Promise<ApiResponse<any>> {
    return apiClient.get('/usuarios/ventanilla/mi-ventanilla-activa')
  }

  /**
   * Verifica si el usuario actual puede ver información de ganancias
   */
  async canViewGanancias(): Promise<ApiResponse<{ canViewGanancias: boolean }>> {
    return apiClient.get('/usuarios/can-view-ganancias')
  }

  /**
   * Obtiene usuarios de ventanilla por casa de cambio
   */
  async getUsuariosVentanilla(casaDeCambioId: number): Promise<ApiResponse<UsuarioDto[]>> {
    return apiClient.get(`/usuarios/casa-de-cambio/${casaDeCambioId}/ventanilla`)
  }
}

export const usuarioService = new UsuarioService()
