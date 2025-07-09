import { 
  ReporteGananciasDto, 
  GenerarReporteGananciasRequest, 
  ConsultarReporteRequest,
  ReporteTransaccionesRequest,
  ReporteRendimientoRequest,
  DashboardData,
  ResumenTransaccionesDto,
  TransaccionRentable,
  RendimientoVentanilla,
  EstadisticaMoneda,
  ReporteSBS
} from '../types/reporte'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

class ReporteService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  }

  async generarReporteGanancias(request: GenerarReporteGananciasRequest): Promise<ReporteGananciasDto> {
    const response = await fetch(`${API_BASE_URL}/api/reportes/ganancias`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Error generating profit report: ${response.statusText}`)
    }

    return response.json()
  }

  async obtenerGananciasDiarias(casaDeCambioId: number, fechaInicio: string, fechaFin: string): Promise<ReporteGananciasDto> {
    const params = new URLSearchParams({
      casa_de_cambio_id: casaDeCambioId.toString(),
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    })

    const response = await fetch(`${API_BASE_URL}/api/reportes/ganancias/diario?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Error getting daily profits: ${response.statusText}`)
    }

    return response.json()
  }

  async obtenerGananciasSemanales(casaDeCambioId: number, fechaInicio: string, fechaFin: string): Promise<ReporteGananciasDto> {
    const params = new URLSearchParams({
      casa_de_cambio_id: casaDeCambioId.toString(),
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    })

    const response = await fetch(`${API_BASE_URL}/api/reportes/ganancias/semanal?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Error getting weekly profits: ${response.statusText}`)
    }

    return response.json()
  }

  async obtenerGananciasMensuales(casaDeCambioId: number, fechaInicio: string, fechaFin: string): Promise<ReporteGananciasDto> {
    const params = new URLSearchParams({
      casa_de_cambio_id: casaDeCambioId.toString(),
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    })

    const response = await fetch(`${API_BASE_URL}/api/reportes/ganancias/mensual?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Error getting monthly profits: ${response.statusText}`)
    }

    return response.json()
  }

  async obtenerGananciasAnuales(casaDeCambioId: number, fechaInicio: string, fechaFin: string): Promise<ReporteGananciasDto> {
    const params = new URLSearchParams({
      casa_de_cambio_id: casaDeCambioId.toString(),
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    })

    const response = await fetch(`${API_BASE_URL}/api/reportes/ganancias/anual?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Error getting annual profits: ${response.statusText}`)
    }

    return response.json()
  }

  async obtenerResumenTransacciones(request: ConsultarReporteRequest): Promise<ResumenTransaccionesDto> {
    const params = new URLSearchParams({
      fecha_inicio: request.fecha_inicio,
      fecha_fin: request.fecha_fin,
      casa_de_cambio_id: request.casa_de_cambio_id.toString()
    })

    if (request.ventanilla_id) {
      params.append('ventanilla_id', request.ventanilla_id.toString())
    }
    if (request.moneda_id) {
      params.append('moneda_id', request.moneda_id.toString())
    }

    const response = await fetch(`${API_BASE_URL}/api/reportes/transacciones/resumen?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Error getting transaction summary: ${response.statusText}`)
    }

    return response.json()
  }

  async obtenerTransaccionesMasRentables(casaDeCambioId: number, limit: number = 10): Promise<TransaccionRentable[]> {
    const params = new URLSearchParams({
      limit: limit.toString()
    })

    const response = await fetch(`${API_BASE_URL}/api/reportes/transacciones/mas-rentables/${casaDeCambioId}?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Error getting most profitable transactions: ${response.statusText}`)
    }

    return response.json()
  }

  async obtenerRendimientoVentanillas(casaDeCambioId: number, fechaInicio: string, fechaFin: string): Promise<RendimientoVentanilla[]> {
    const params = new URLSearchParams({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    })

    const response = await fetch(`${API_BASE_URL}/api/reportes/rendimiento/ventanillas/${casaDeCambioId}?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Error getting window performance: ${response.statusText}`)
    }

    return response.json()
  }

  async obtenerEstadisticasMonedas(casaDeCambioId: number, fechaInicio: string, fechaFin: string): Promise<EstadisticaMoneda[]> {
    const params = new URLSearchParams({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    })

    const response = await fetch(`${API_BASE_URL}/api/reportes/estadisticas/monedas/${casaDeCambioId}?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Error getting currency statistics: ${response.statusText}`)
    }

    return response.json()
  }

  async obtenerReporteSBS(casaDeCambioId: number, fechaInicio: string, fechaFin: string): Promise<ReporteSBS> {
    const params = new URLSearchParams({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    })

    const response = await fetch(`${API_BASE_URL}/api/reportes/sbs/${casaDeCambioId}?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Error getting SBS report: ${response.statusText}`)
    }

    return response.json()
  }

  async obtenerDashboard(casaDeCambioId: number): Promise<DashboardData> {
    const params = new URLSearchParams({
      casa_de_cambio_id: casaDeCambioId.toString()
    })

    const response = await fetch(`${API_BASE_URL}/api/reportes/dashboard?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Error getting dashboard data: ${response.statusText}`)
    }

    return response.json()
  }

  async consultarReporte(request: ConsultarReporteRequest): Promise<any> {
    const params = new URLSearchParams({
      fecha_inicio: request.fecha_inicio,
      fecha_fin: request.fecha_fin,
      casa_de_cambio_id: request.casa_de_cambio_id.toString()
    })

    if (request.ventanilla_id) {
      params.append('ventanilla_id', request.ventanilla_id.toString())
    }
    if (request.moneda_id) {
      params.append('moneda_id', request.moneda_id.toString())
    }

    const response = await fetch(`${API_BASE_URL}/api/reportes/consultar?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Error consulting report: ${response.statusText}`)
    }

    return response.json()
  }

  async obtenerReporteTransacciones(request: ReporteTransaccionesRequest): Promise<any> {
    const params = new URLSearchParams({
      fecha_inicio: request.fecha_inicio,
      fecha_fin: request.fecha_fin
    })

    if (request.casa_de_cambio_id) {
      params.append('casa_de_cambio_id', request.casa_de_cambio_id.toString())
    }
    if (request.ventanilla_id) {
      params.append('ventanilla_id', request.ventanilla_id.toString())
    }
    if (request.cliente_id) {
      params.append('cliente_id', request.cliente_id.toString())
    }
    if (request.estado) {
      params.append('estado', request.estado)
    }
    if (request.limit) {
      params.append('limit', request.limit.toString())
    }
    if (request.order_by) {
      params.append('order_by', request.order_by)
    }
    if (request.order_direction) {
      params.append('order_direction', request.order_direction)
    }

    const response = await fetch(`${API_BASE_URL}/api/reportes/transacciones?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Error getting transaction report: ${response.statusText}`)
    }

    return response.json()
  }

  async obtenerReporteRendimiento(request: ReporteRendimientoRequest): Promise<any> {
    const params = new URLSearchParams({
      fecha_inicio: request.fecha_inicio,
      fecha_fin: request.fecha_fin,
      casa_de_cambio_id: request.casa_de_cambio_id.toString()
    })

    if (request.granularidad) {
      params.append('granularidad', request.granularidad)
    }

    const response = await fetch(`${API_BASE_URL}/api/reportes/rendimiento?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Error getting performance report: ${response.statusText}`)
    }

    return response.json()
  }
}

export const reporteService = new ReporteService()