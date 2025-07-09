/**
 * Constantes del Sistema
 * 
 * Valores constantes utilizados en toda la aplicación
 * para mantener consistencia y facilitar el mantenimiento.
 */

/**
 * Configuración de tipos de cambio
 */
export const TIPOS_CAMBIO = {
  // Rangos de valores
  VALOR_MINIMO: 0.01,
  VALOR_MAXIMO: 1000,
  
  // Spread máximo permitido (50%)
  SPREAD_MAXIMO: 0.5,
  
  // Decimales para cálculos
  DECIMALES_PRECISION: 4,
  DECIMALES_DISPLAY: 2,
  
  // Alertas de cambio
  ALERTA_CAMBIO_PORCENTAJE: 5, // 5% de cambio genera alerta
  
  // Estados
  ESTADOS: {
    ACTIVO: 'activo',
    INACTIVO: 'inactivo',
    PROGRAMADO: 'programado',
    CANCELADO: 'cancelado'
  } as const
} as const

/**
 * Configuración de transacciones
 */
export const TRANSACCIONES = {
  // Montos
  MONTO_MINIMO: 1,
  MONTO_MAXIMO: 100000,
  
  // Tipos de operación
  TIPOS_OPERACION: {
    COMPRA: 'compra',
    VENTA: 'venta'
  } as const,
  
  // Estados de transacción
  ESTADOS: {
    PENDIENTE: 'pendiente',
    COMPLETADA: 'completada',
    CANCELADA: 'cancelada',
    FALLIDA: 'fallida'
  } as const,
  
  // Tipos de comprobante
  TIPOS_COMPROBANTE: {
    BOLETA: 'boleta',
    FACTURA: 'factura',
    NINGUNO: 'ninguno'
  } as const
} as const

/**
 * Configuración de ventanillas
 */
export const VENTANILLAS = {
  // Horarios de operación
  HORA_APERTURA: 8,
  HORA_CIERRE: 18,
  
  // Fondos mínimos
  FONDO_MINIMO: 100,
  
  // Estados
  ESTADOS: {
    CERRADA: 'cerrada',
    ABIERTA: 'abierta',
    SUSPENDIDA: 'suspendida'
  } as const
} as const

/**
 * Tipos de documento de identidad
 */
export const DOCUMENTOS_IDENTIDAD = {
  DNI: {
    codigo: 'DNI',
    nombre: 'Documento Nacional de Identidad',
    longitud: 8,
    patron: /^\d{8}$/
  },
  CE: {
    codigo: 'CE',
    nombre: 'Carné de Extranjería',
    longitud: 9,
    patron: /^\d{9}$/
  },
  PASAPORTE: {
    codigo: 'PASAPORTE',
    nombre: 'Pasaporte',
    longitud: [6, 12],
    patron: /^[A-Z0-9]{6,12}$/
  }
} as const

/**
 * Roles y permisos del sistema
 */
export const ROLES_PERMISOS = {
  ROLES: {
    ADMINISTRADOR_MAESTRO: 'ADMINISTRADOR_MAESTRO',
    ADMINISTRADOR: 'ADMINISTRADOR',
    CAJERO: 'CAJERO',
    SUPERVISOR: 'SUPERVISOR'
  } as const,
  
  PERMISOS: {
    // Tipos de cambio
    CREAR_TIPOS_CAMBIO: 'crear_tipos_cambio',
    EDITAR_TIPOS_CAMBIO: 'editar_tipos_cambio',
    ELIMINAR_TIPOS_CAMBIO: 'eliminar_tipos_cambio',
    VER_TIPOS_CAMBIO: 'ver_tipos_cambio',
    
    // Transacciones
    CREAR_TRANSACCIONES: 'crear_transacciones',
    VER_TRANSACCIONES: 'ver_transacciones',
    CANCELAR_TRANSACCIONES: 'cancelar_transacciones',
    
    // Ventanillas
    APERTURAR_VENTANILLAS: 'aperturar_ventanillas',
    CERRAR_VENTANILLAS: 'cerrar_ventanillas',
    VER_VENTANILLAS: 'ver_ventanillas',
    
    // Reportes
    GENERAR_REPORTES: 'generar_reportes',
    EXPORTAR_DATOS: 'exportar_datos',
    
    // Auditoría
    VER_AUDITORIA: 'ver_auditoria'
  } as const
} as const

/**
 * Configuración de la interfaz de usuario
 */
export const UI_CONFIG = {
  // Paginación
  ITEMS_POR_PAGINA: 10,
  OPCIONES_PAGINACION: [5, 10, 20, 50, 100],
  
  // Timeouts
  TIMEOUT_TOAST: 5000,
  TIMEOUT_LOADING: 30000,
  TIMEOUT_DEBOUNCE: 300,
  
  // Colores para estados
  COLORES_ESTADO: {
    activo: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200'
    },
    inactivo: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200'
    },
    programado: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    },
    cancelado: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200'
    }
  } as const,
  
  // Iconos para tipos de operación
  ICONOS_OPERACION: {
    compra: '📈',
    venta: '📉'
  } as const
} as const

/**
 * Configuración de validaciones
 */
export const VALIDACIONES = {
  // Longitudes mínimas y máximas
  NOMBRE_MIN: 2,
  NOMBRE_MAX: 100,
  DESCRIPCION_MAX: 500,
  
  // Patrones regex
  PATRONES: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    TELEFONO: /^\d{9}$/,
    CODIGO_MONEDA: /^[A-Z]{3}$/,
    SOLO_NUMEROS: /^\d+$/,
    ALFANUMERICO: /^[A-Za-z0-9\s]+$/
  } as const,
  
  // Mensajes de error comunes
  MENSAJES_ERROR: {
    CAMPO_REQUERIDO: 'Este campo es requerido',
    EMAIL_INVALIDO: 'El email no tiene un formato válido',
    TELEFONO_INVALIDO: 'El teléfono debe tener 9 dígitos',
    MONTO_INVALIDO: 'El monto debe ser mayor a 0',
    FECHA_INVALIDA: 'La fecha no es válida',
    PERMISOS_INSUFICIENTES: 'No tiene permisos para realizar esta acción'
  } as const
} as const

/**
 * Configuración de exportación
 */
export const EXPORTACION = {
  // Formatos soportados
  FORMATOS: {
    CSV: 'csv',
    EXCEL: 'excel',
    PDF: 'pdf'
  } as const,
  
  // Plantillas predefinidas
  PLANTILLAS: {
    COMPLETO: 'completo',
    BASICO: 'basico',
    ESTADISTICAS: 'estadisticas',
    TENDENCIAS: 'tendencias'
  } as const,
  
  // Límites de exportación
  MAX_REGISTROS: 10000,
  MAX_ARCHIVO_MB: 50,
  
  // Configuración de columnas
  COLUMNAS_DISPONIBLES: [
    'fecha',
    'monedas',
    'tipoCompra',
    'tipoVenta',
    'spread',
    'estado',
    'mantenerDiario',
    'usuario'
  ] as const
} as const

/**
 * Configuración de API
 */
export const API_CONFIG = {
  // Base URL se obtiene de variables de entorno
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  
  // Timeouts
  TIMEOUT_REQUEST: 30000,
  TIMEOUT_UPLOAD: 120000,
  
  // Códigos de estado HTTP
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  } as const,
  
  // Headers comunes
  HEADERS: {
    CONTENT_TYPE_JSON: 'application/json',
    CONTENT_TYPE_FORM: 'application/x-www-form-urlencoded',
    AUTHORIZATION: 'Authorization'
  } as const
} as const

/**
 * Configuración de localStorage
 */
export const STORAGE_KEYS = {
  // Autenticación
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  
  // Configuración de usuario
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  
  // Filtros guardados
  FILTROS_TIPOS_CAMBIO: 'filtros-tipos-cambio',
  FILTROS_TRANSACCIONES: 'filtros-transacciones',
  
  // Cache
  CACHE_MONEDAS: 'cache_monedas',
  CACHE_CASAS_CAMBIO: 'cache_casas_cambio',
  
  // Configuración de ventanilla
  VENTANILLA_ACTIVA: 'ventanilla_activa'
} as const

/**
 * Configuración de fechas
 */
export const FECHAS = {
  // Formatos
  FORMATO_FECHA: 'DD/MM/YYYY',
  FORMATO_FECHA_HORA: 'DD/MM/YYYY HH:mm',
  FORMATO_ISO: 'YYYY-MM-DD',
  
  // Zona horaria
  TIMEZONE: 'America/Lima',
  
  // Rangos predefinidos
  RANGOS_PREDEFINIDOS: {
    HOY: 'hoy',
    SEMANA: 'semana',
    MES: 'mes',
    TRIMESTRE: 'trimestre',
    AÑO: 'año'
  } as const
} as const

/**
 * Configuración de monedas comunes
 */
export const MONEDAS_COMUNES = {
  PEN: {
    codigo: 'PEN',
    nombre: 'Sol Peruano',
    simbolo: 'S/',
    decimales: 2
  },
  USD: {
    codigo: 'USD',
    nombre: 'Dólar Americano',
    simbolo: '$',
    decimales: 2
  },
  EUR: {
    codigo: 'EUR',
    nombre: 'Euro',
    simbolo: '€',
    decimales: 2
  }
} as const

/**
 * Configuración de notificaciones
 */
export const NOTIFICACIONES = {
  // Tipos
  TIPOS: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  } as const,
  
  // Duración por defecto
  DURACION_DEFAULT: 5000,
  
  // Posiciones
  POSICIONES: {
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left'
  } as const
} as const

/**
 * Configuración de auditoría
 */
export const AUDITORIA = {
  // Tipos de acción
  ACCIONES: {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    ACTIVATE: 'ACTIVATE',
    DEACTIVATE: 'DEACTIVATE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT'
  } as const,
  
  // Entidades auditables
  ENTIDADES: {
    TIPO_CAMBIO: 'tipo_cambio',
    TRANSACCION: 'transaccion',
    VENTANILLA: 'ventanilla',
    USUARIO: 'usuario'
  } as const
} as const

/**
 * Configuración de performance
 */
export const PERFORMANCE = {
  // Debounce times
  DEBOUNCE_BUSQUEDA: 300,
  DEBOUNCE_VALIDACION: 500,
  
  // Throttle times
  THROTTLE_SCROLL: 100,
  THROTTLE_RESIZE: 250,
  
  // Cache times (en milisegundos)
  CACHE_MONEDAS: 5 * 60 * 1000, // 5 minutos
  CACHE_TIPOS_CAMBIO: 30 * 1000, // 30 segundos
  
  // Lazy loading
  LAZY_LOADING_THRESHOLD: 100
} as const