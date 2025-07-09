import type { ApiResponse } from "@/types/api-response"

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    // En producción, usar la variable de entorno. En desarrollo, usar localhost
    const defaultUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
      ? "http://localhost:3000/api"
      : "https://your-railway-app.up.railway.app/api"
    
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || defaultUrl
    
    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('API Base URL:', this.baseURL)
    }
  }

  setToken(token: string | null) {
    this.token = token
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const responseData = await response.json().catch(() => ({}))
    
    if (!response.ok) {
      // Para errores de servidor, usar el mensaje de error específico si existe
      const errorMessage = responseData.error || responseData.message || `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }

    // Verificar que la respuesta tenga el campo success
    if (responseData.success === false) {
      // Usar el error específico si existe, sino el mensaje general
      const errorMessage = responseData.error || responseData.message || 'Error en la respuesta del servidor'
      throw new Error(errorMessage)
    }

    return responseData
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(),
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    })

    return this.handleResponse<T>(response)
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }
}

export const apiClient = new ApiClient()

// Configurar el token cuando esté disponible
if (typeof window !== "undefined") {
  const token = localStorage.getItem("auth_token")
  if (token) {
    apiClient.setToken(token)
  }
}
