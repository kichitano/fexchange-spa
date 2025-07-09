import { apiClient } from "./api-client"
import type { LoginRequest, LoginResponse } from "@/types/usuario"
import type { ApiResponse } from "@/types/api-response"

class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>("/usuarios/login", credentials)

    // Configurar el token en el cliente API
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token)
    }

    return response
  }

  async logout(): Promise<void> {
    // Limpiar el token del cliente API
    apiClient.setToken(null)
  }

  async verifyToken(): Promise<boolean> {
    try {
      // Aquí podrías hacer una llamada para verificar si el token es válido
      // Por ahora, simplemente verificamos si existe
      const token = localStorage.getItem("auth_token")
      return !!token
    } catch (error) {
      return false
    }
  }
}

export const authService = new AuthService()
