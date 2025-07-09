export const APP_CONFIG = {
  name: "Sistema Casa de Cambio",
  version: "1.0.0",
  description: "Sistema integral para gestión de casas de cambio",
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/usuarios/login",
  },
  CASAS_CAMBIO: "/casas-de-cambio",
  USUARIOS: "/usuarios",
  PERSONAS: "/personas",
  VENTANILLAS: "/ventanillas",
  MONEDAS: "/monedas",
  TIPOS_CAMBIO: "/tipos-cambio",
  CLIENTES: "/clientes",
  TRANSACCIONES: "/transacciones",
}

export const ROLES = {
  ADMINISTRADOR_MAESTRO: "ADMINISTRADOR_MAESTRO",
  ADMINISTRADOR: "ADMINISTRADOR",
  ENCARGADO_VENTANILLA: "ENCARGADO_VENTANILLA",
}

export const ESTADOS_VENTANILLA = {
  CERRADA: "CERRADA",
  ABIERTA: "ABIERTA",
  PAUSA: "PAUSA",
}

export const ESTADOS_TRANSACCION = {
  COMPLETADA: "COMPLETADA",
  CANCELADA: "CANCELADA",
  PENDIENTE: "PENDIENTE",
}

export const TIPOS_CLIENTE = {
  REGISTRADO: "REGISTRADO",
  OTRO: "OTRO",
}

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
}

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
}
