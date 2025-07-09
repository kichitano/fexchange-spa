import { apiClient } from "./api-client"
import type {
  ClienteDto,
  CreateClienteRequest,
  CreateClienteRegistradoRequest,
  CreateClienteOcasionalRequest,
  CreateClienteEmpresarialRequest,
  UpdateClienteRequest,
  BuscarClienteRequest,
  ClienteTemporalData
} from "@/types/cliente"
import type { TipoCliente } from "@/types/enums"
import type { ApiResponse } from "@/types/api-response"

class ClienteService {
  async getAll(): Promise<ApiResponse<ClienteDto[]>> {
    return apiClient.get("/clientes")
  }

  async getById(id: number): Promise<ApiResponse<ClienteDto>> {
    return apiClient.get(`/clientes/${id}`)
  }

  async getByDocumento(numeroDocumento: string): Promise<ApiResponse<ClienteDto>> {
    return apiClient.get(`/clientes/documento/${numeroDocumento}`)
  }

  async search(params: BuscarClienteRequest): Promise<ApiResponse<ClienteDto[]>> {
    const queryParams = new URLSearchParams()
    
    if (params.nombres) queryParams.append("nombres", params.nombres)
    if (params.apellido_paterno) queryParams.append("apellidoPaterno", params.apellido_paterno)
    if (params.apellido_materno) queryParams.append("apellidoMaterno", params.apellido_materno)
    if (params.numero_documento) queryParams.append("numeroDocumento", params.numero_documento)
    if (params.tipo_documento) queryParams.append("tipo_documento", params.tipo_documento)
    if (params.ruc) queryParams.append("ruc", params.ruc)
    if (params.razon_social) queryParams.append("razonSocial", params.razon_social)
    if (params.tipo_cliente) queryParams.append("tipo", params.tipo_cliente)
    if (params.es_activo !== undefined) queryParams.append("esActivo", params.es_activo.toString())
    if (params.direccion_fiscal) queryParams.append("direccion_fiscal", params.direccion_fiscal)
    if (params.profesion) queryParams.append("profesion", params.profesion)
    if (params.limit) queryParams.append("limit", params.limit.toString())
    if (params.offset) queryParams.append("offset", params.offset.toString())

    return apiClient.get(`/clientes/search?${queryParams.toString()}`)
  }

  async create(data: CreateClienteRequest): Promise<ApiResponse<ClienteDto>> {
    return apiClient.post("/clientes", data)
  }

  async createRegistrado(data: CreateClienteRegistradoRequest): Promise<ApiResponse<ClienteDto>> {
    return apiClient.post("/clientes/registrado", data)
  }

  async createOcasional(data: CreateClienteOcasionalRequest): Promise<ApiResponse<ClienteDto>> {
    return apiClient.post("/clientes/ocasional", data)
  }

  async createEmpresarial(data: CreateClienteEmpresarialRequest): Promise<ApiResponse<ClienteDto>> {
    return apiClient.post("/clientes/empresarial", data)
  }

  async update(id: number, data: UpdateClienteRequest): Promise<ApiResponse<ClienteDto>> {
    return apiClient.put(`/clientes/${id}`, data)
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/clientes/${id}`)
  }

  async getByTipo(tipo: TipoCliente): Promise<ApiResponse<ClienteDto[]>> {
    return apiClient.get(`/clientes/tipo/${tipo}`)
  }

  async toggleEstado(id: number): Promise<ApiResponse<ClienteDto>> {
    return apiClient.patch(`/clientes/${id}/toggle-estado`)
  }

  async validarDatos(tipo: TipoCliente, datos: any): Promise<ApiResponse<{ valido: boolean; errores: string[] }>> {
    return apiClient.post("/clientes/validar", { tipo, datos })
  }

  async existeRuc(ruc: string, excludeId?: number): Promise<ApiResponse<{ existe: boolean }>> {
    const queryParams = new URLSearchParams()
    if (excludeId) queryParams.append("excludeId", excludeId.toString())
    
    const query = queryParams.toString()
    return apiClient.get(`/clientes/ruc/${ruc}/existe${query ? `?${query}` : ''}`)
  }

  async getHistorial(id: number): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/clientes/${id}/historial`)
  }

  // Utilidades para el manejo de clientes temporales en transacciones
  createClienteTemporalData(nombres?: string, apellidos?: string, documento?: string): ClienteTemporalData {
    return {
      nombres,
      apellidos,
      documento,
      descripcion: `Cliente Temporal - ${nombres || 'Sin nombre'} ${apellidos || ''}`
    }
  }

  // Validaciones específicas para cada tipo de cliente
  async validarClienteRegistrado(data: CreateClienteRegistradoRequest): Promise<{ valido: boolean; errores: string[] }> {
    const errores: string[] = []
    
    if (!data.persona.nombres.trim()) errores.push('Nombres son obligatorios')
    if (!data.persona.apellido_paterno.trim()) errores.push('Apellido paterno es obligatorio')
    if (!data.persona.numero_documento.trim()) errores.push('Número de documento es obligatorio')
    if (!data.persona.tipo_documento.trim()) errores.push('Tipo de documento es obligatorio')
    
    return { valido: errores.length === 0, errores }
  }

  async validarClienteEmpresarial(data: CreateClienteEmpresarialRequest): Promise<{ valido: boolean; errores: string[] }> {
    const errores: string[] = []
    
    if (!data.ruc.trim()) errores.push('RUC es obligatorio')
    if (!data.razon_social.trim()) errores.push('Razón social es obligatoria')
    if (!data.direccion_fiscal.trim()) errores.push('Dirección fiscal es obligatoria')
    if (!data.representante_legal.nombres.trim()) errores.push('Nombres del representante legal son obligatorios')
    if (!data.representante_legal.apellido_paterno.trim()) errores.push('Apellido paterno del representante es obligatorio')
    if (!data.representante_legal.numero_documento.trim()) errores.push('Documento del representante es obligatorio')
    
    // Validar formato de RUC (11 dígitos en Perú)
    if (data.ruc && !/^\d{11}$/.test(data.ruc)) {
      errores.push('RUC debe tener 11 dígitos')
    }
    
    return { valido: errores.length === 0, errores }
  }

}

export const clienteService = new ClienteService()
