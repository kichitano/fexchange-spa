export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: ValidationError[]
  pagination?: PaginationInfo
  timestamp?: string
}

export interface ValidationError {
  property: string
  constraints: { [key: string]: string }
  value?: any
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
}
