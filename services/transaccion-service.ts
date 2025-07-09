import { apiClient } from "./api-client"
import type {
  TransaccionDto,
  ProcesarCambioRequest,
  CalcularConversionRequest,
  CalcularConversionResponse,
  VerificarDisponibilidadRequest,
  VerificarDisponibilidadResponse,
  CancelarTransaccionRequest,
  FiltrosTransaccion,
  TransaccionApiResponse
} from "@/types/transaccion"
import type { ApiResponse } from "@/types/api-response"

/**
 * Servicio de Transacciones - Cliente Frontend
 * 
 * Maneja todas las comunicaciones con la API de transacciones:
 * - Procesamiento de cambios de moneda
 * - Cálculos de conversión en tiempo real
 * - Validaciones de disponibilidad
 * - Consultas optimizadas con filtros
 * - Gestión de estados y cancelaciones
 */

class ServicioTransacciones {
  /**
   * Obtiene todas las transacciones con filtros opcionales
   */
  async obtenerTodas(filtros?: FiltrosTransaccion): Promise<ApiResponse<TransaccionDto[]>> {
    const params = new URLSearchParams()
    
    if (filtros?.limit) params.append("limit", filtros.limit.toString())
    if (filtros?.offset) params.append("offset", filtros.offset.toString())
    if (filtros?.ordenar) params.append("ordenar", filtros.ordenar)
    if (filtros?.ventanillaId) params.append("ventanillaId", filtros.ventanillaId.toString())
    if (filtros?.estado) params.append("estado", filtros.estado)
    if (filtros?.fechaInicio) params.append("fechaInicio", filtros.fechaInicio)
    if (filtros?.fechaFin) params.append("fechaFin", filtros.fechaFin)
    
    const query = params.toString()
    return apiClient.get(`/transacciones${query ? `?${query}` : ""}`)
  }

  /**
   * Mantiene compatibilidad con método anterior
   * @deprecated Usar obtenerTodas() en su lugar
   */
  async getAll(): Promise<ApiResponse<TransaccionDto[]>> {
    return this.obtenerTodas()
  }

  /**
   * Obtiene una transacción por su ID
   */
  async obtenerPorId(id: number): Promise<ApiResponse<TransaccionDto>> {
    return apiClient.get(`/transacciones/${id}`)
  }

  /**
   * Mantiene compatibilidad con método anterior
   * @deprecated Usar obtenerPorId() en su lugar
   */
  async getById(id: number): Promise<ApiResponse<TransaccionDto>> {
    return this.obtenerPorId(id)
  }

  /**
   * Obtiene transacciones por ventanilla
   */
  async obtenerPorVentanilla(ventanillaId: number): Promise<ApiResponse<TransaccionDto[]>> {
    return apiClient.get(`/transacciones/ventanilla/${ventanillaId}`)
  }

  /**
   * Mantiene compatibilidad con método anterior
   * @deprecated Usar obtenerPorVentanilla() en su lugar
   */
  async getByVentanilla(ventanillaId: number): Promise<ApiResponse<TransaccionDto[]>> {
    return this.obtenerPorVentanilla(ventanillaId)
  }

  /**
   * Obtiene transacciones por cliente
   */
  async obtenerPorCliente(clienteId: number): Promise<ApiResponse<TransaccionDto[]>> {
    return apiClient.get(`/transacciones/cliente/${clienteId}`)
  }

  /**
   * Mantiene compatibilidad con método anterior
   * @deprecated Usar obtenerPorCliente() en su lugar
   */
  async getByCliente(clienteId: number): Promise<ApiResponse<TransaccionDto[]>> {
    return this.obtenerPorCliente(clienteId)
  }

  /**
   * Obtiene transacción por número
   */
  async obtenerPorNumero(numeroTransaccion: string): Promise<ApiResponse<TransaccionDto>> {
    return apiClient.get(`/transacciones/numero/${numeroTransaccion}`)
  }

  /**
   * Mantiene compatibilidad con método anterior
   * @deprecated Usar obtenerPorNumero() en su lugar
   */
  async getByNumero(numeroTransaccion: string): Promise<ApiResponse<TransaccionDto>> {
    return this.obtenerPorNumero(numeroTransaccion)
  }

  /**
   * Procesa una transacción de cambio de moneda
   */
  async procesarCambio(data: ProcesarCambioRequest): Promise<ApiResponse<TransaccionDto>> {
    return apiClient.post("/transacciones/procesar-cambio", data)
  }

  /**
   * Calcula una conversión de moneda sin procesarla
   */
  async calcularConversion(data: CalcularConversionRequest): Promise<ApiResponse<CalcularConversionResponse>> {
    return apiClient.post("/transacciones/calcular-conversion", data)
  }

  /**
   * Verifica disponibilidad de fondos en una ventanilla
   */
  async verificarDisponibilidad(data: VerificarDisponibilidadRequest): Promise<ApiResponse<VerificarDisponibilidadResponse>> {
    return apiClient.post("/transacciones/verificar-disponibilidad", data)
  }

  /**
   * Actualiza una transacción existente
   */
  async actualizar(id: number, data: Partial<TransaccionDto>): Promise<ApiResponse<TransaccionDto>> {
    return apiClient.put(`/transacciones/${id}`, data)
  }

  /**
   * Mantiene compatibilidad con método anterior
   * @deprecated Usar actualizar() en su lugar
   */
  async update(id: number, data: Partial<TransaccionDto>): Promise<ApiResponse<TransaccionDto>> {
    return this.actualizar(id, data)
  }

  /**
   * Cancela una transacción con motivo opcional
   */
  async cancelar(id: number, motivo?: string): Promise<ApiResponse<void>> {
    return apiClient.patch(`/transacciones/${id}/cancelar`, { motivo })
  }

  /**
   * Obtiene reporte de transacciones con filtros
   */
  async obtenerReporte(params: {
    fechaInicio?: string
    fechaFin?: string
    ventanillaId?: number
    casaDeCambioId?: number
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString())
    })

    return apiClient.get(`/transacciones/reporte?${queryParams.toString()}`)
  }

  /**
   * Mantiene compatibilidad con método anterior
   * @deprecated Usar obtenerReporte() en su lugar
   */
  async getReporte(params: {
    fechaInicio?: string
    fechaFin?: string
    ventanillaId?: number
    casaDeCambioId?: number
  }): Promise<ApiResponse<any>> {
    return this.obtenerReporte(params)
  }

  /**
   * Obtiene las transacciones más recientes
   */
  async obtenerRecientes(limite: number = 10): Promise<ApiResponse<TransaccionDto[]>> {
    return this.obtenerTodas({ 
      limit: limite, 
      ordenar: 'fecha_desc' 
    })
  }

  /**
   * Mantiene compatibilidad con método anterior
   * @deprecated Usar obtenerRecientes() en su lugar
   */
  async getRecientes(limit: number = 10): Promise<ApiResponse<TransaccionDto[]>> {
    return this.obtenerRecientes(limit)
  }
}

export const servicioTransacciones = new ServicioTransacciones()

// Mantiene compatibilidad con export anterior
export const transaccionService = servicioTransacciones
