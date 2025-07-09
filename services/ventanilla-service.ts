import { apiClient } from "./api-client"
import type {
  VentanillaDto,
  CreateVentanillaRequest,
  UpdateVentanillaRequest,
  AperturarVentanillaRequest,
  CerrarVentanillaRequest,
  CierreVentanillaRequest,
  CierreVentanillaResumenDto,
} from "@/types/ventanilla"
import type { ApiResponse } from "@/types/api-response"
import type { EstadoVentanilla } from "@/types/enums"

class VentanillaService {
  /**
   * Obtiene todas las ventanillas
   */
  async getAll(): Promise<ApiResponse<VentanillaDto[]>> {
    return apiClient.get("/ventanillas")
  }

  /**
   * Obtiene ventanillas por casa de cambio
   */
  async getByCasaDeCambio(casaDeCambioId: number): Promise<ApiResponse<VentanillaDto[]>> {
    return apiClient.get(`/ventanillas/casa-de-cambio/${casaDeCambioId}`)
  }

  async getByEstado(casaDeCambioId: number, estado: EstadoVentanilla): Promise<ApiResponse<VentanillaDto[]>> {
    return apiClient.get(`/ventanillas/casa-de-cambio/${casaDeCambioId}/estado/${estado}`)
  }

  async getById(id: number): Promise<ApiResponse<VentanillaDto>> {
    return apiClient.get(`/ventanillas/${id}`)
  }

  async getByIdentificador(identificador: string): Promise<ApiResponse<VentanillaDto>> {
    return apiClient.get(`/ventanillas/identificador/${identificador}`)
  }

  async puedeAtender(id: number): Promise<ApiResponse<{ puedeAtender: boolean; motivo?: string }>> {
    return apiClient.get(`/ventanillas/${id}/puede-atender`)
  }

  async getHistorial(id: number): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/ventanillas/${id}/historial`)
  }

  async getAperturaActiva(id: number): Promise<ApiResponse<any>> {
    return apiClient.get(`/ventanillas/${id}/apertura-activa`)
  }

  async verificarDisponibilidad(
    id: number,
    params?: { monedaId?: number; monto?: number },
  ): Promise<ApiResponse<{ disponible: boolean }>> {
    const queryParams = new URLSearchParams()
    if (params?.monedaId) queryParams.append("monedaId", params.monedaId.toString())
    if (params?.monto) queryParams.append("monto", params.monto.toString())

    const query = queryParams.toString()
    return apiClient.get(`/ventanillas/${id}/verificar-disponibilidad${query ? `?${query}` : ""}`)
  }

  /**
   * Verifica tipos de cambio disponibles para aperturar ventanilla
   */
  async verificarTiposCambio(id: number): Promise<ApiResponse<any>> {
    return apiClient.get(`/ventanillas/${id}/verificar-tipos-cambio`)
  }

  /**
   * Verifica permisos de operación para una ventanilla
   */
  async verificarPermisosOperacion(id: number): Promise<ApiResponse<{ puede_operar: boolean; es_admin: boolean; motivo?: string }>> {
    return apiClient.get(`/ventanillas/${id}/verificar-permisos`)
  }

  /**
   * Crea una nueva ventanilla
   */
  async create(data: CreateVentanillaRequest): Promise<ApiResponse<VentanillaDto>> {
    return apiClient.post("/ventanillas", data)
  }

  /**
   * Actualiza una ventanilla existente
   */
  async update(id: number, data: UpdateVentanillaRequest): Promise<ApiResponse<VentanillaDto>> {
    return apiClient.put(`/ventanillas/${id}`, data)
  }

  async toggleActive(id: number): Promise<ApiResponse<VentanillaDto>> {
    return apiClient.patch(`/ventanillas/${id}/toggle-active`)
  }

  /**
   * Elimina una ventanilla
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/ventanillas/${id}`)
  }

  /**
   * Abre una ventanilla con montos iniciales
   */
  async aperturar(id: number, data: AperturarVentanillaRequest): Promise<ApiResponse<void>> {
    return apiClient.post(`/ventanillas/${id}/aperturar`, data)
  }

  /**
   * Cierra una ventanilla con montos finales
   */
  async cerrar(id: number, data: CerrarVentanillaRequest): Promise<ApiResponse<void>> {
    return apiClient.post(`/ventanillas/${id}/cerrar`, data)
  }

  async pausar(id: number): Promise<ApiResponse<void>> {
    return apiClient.patch(`/ventanillas/${id}/pausar`)
  }

  async reanudar(id: number): Promise<ApiResponse<void>> {
    return apiClient.patch(`/ventanillas/${id}/reanudar`)
  }

  /**
   * Obtiene el resumen de cierre con montos esperados calculados automáticamente
   */
  async getResumenCierre(id: number): Promise<ApiResponse<CierreVentanillaResumenDto>> {
    return apiClient.get(`/ventanillas/${id}/resumen-cierre`)
  }

  /**
   * Procesa el cierre de ventanilla con validación física de montos
   */
  async procesarCierre(id: number, data: CierreVentanillaRequest): Promise<ApiResponse<void>> {
    return apiClient.post(`/ventanillas/${id}/procesar-cierre`, data)
  }
}

export const ventanillaService = new VentanillaService()
