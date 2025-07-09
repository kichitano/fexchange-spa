import { apiClient } from "./api-client"
import type {
  TipoCambioDto,
  TipoCambioActivoDto,
  CreateTipoCambioRequest,
  UpdateTipoCambioRequest,
  ObtenerTipoVigenteRequest
} from "@/types/tipo-cambio"
import type { ApiResponse } from "@/types/api-response"

class TipoCambioService {
  async getAll(): Promise<ApiResponse<TipoCambioDto[]>> {
    return apiClient.get("/tipos-cambio")
  }

  async getById(id: number): Promise<ApiResponse<TipoCambioDto>> {
    return apiClient.get(`/tipos-cambio/${id}`)
  }

  async getVigente(data: ObtenerTipoVigenteRequest): Promise<ApiResponse<TipoCambioDto>> {
    return apiClient.post("/tipos-cambio/vigente", data)
  }

  async getByCasaDeCambio(casaDeCambioId: number): Promise<ApiResponse<TipoCambioDto[]>> {
    return apiClient.get(`/tipos-cambio/casa-de-cambio/${casaDeCambioId}/completo`)
  }

  async getHistorial(
    monedaOrigenId: number, 
    monedaDestinoId: number, 
    casaDeCambioId: number,
    params?: { limit?: number; offset?: number }
  ): Promise<ApiResponse<TipoCambioDto[]>> {
    const queryParams = new URLSearchParams()
    
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.offset) queryParams.append("offset", params.offset.toString())

    const query = queryParams.toString()
    return apiClient.get(`/tipos-cambio/historial/${monedaOrigenId}/${monedaDestinoId}/${casaDeCambioId}${query ? `?${query}` : ""}`)
  }

  async create(data: CreateTipoCambioRequest): Promise<ApiResponse<TipoCambioDto>> {
    return apiClient.post("/tipos-cambio", data)
  }

  async update(id: number, data: UpdateTipoCambioRequest): Promise<ApiResponse<TipoCambioDto>> {
    return apiClient.put(`/tipos-cambio/${id}`, data)
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/tipos-cambio/${id}`)
  }

  async activar(id: number): Promise<ApiResponse<TipoCambioDto>> {
    return apiClient.patch(`/tipos-cambio/${id}/activar`)
  }

  async desactivar(id: number): Promise<ApiResponse<TipoCambioDto>> {
    return apiClient.patch(`/tipos-cambio/${id}/desactivar`)
  }

  async getTiposCambioActuales(casaDeCambioId?: number): Promise<ApiResponse<{
    par_monedas: string;
    compra: number;
    venta: number;
    ultima_actualizacion: Date;
    moneda_origen: any;
    moneda_destino: any;
  }[]>> {
    const params = casaDeCambioId ? `?casaDeCambioId=${casaDeCambioId}` : ""
    return apiClient.get(`/tipos-cambio/actuales${params}`)
  }

  async getActivosPorCasa(casaDeCambioId: number): Promise<ApiResponse<TipoCambioActivoDto[]>> {
    return apiClient.get(`/tipos-cambio/casa-de-cambio/${casaDeCambioId}`)
  }
}

export const tipoCambioService = new TipoCambioService()
