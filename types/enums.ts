// Enum para el rol de usuario
export enum RolUsuario {
  ADMINISTRADOR_MAESTRO = "ADMINISTRADOR_MAESTRO",
  ADMINISTRADOR = "ADMINISTRADOR",
  ENCARGADO_VENTANILLA = "ENCARGADO_VENTANILLA",
  CAJERO = "CAJERO",
}

// Enum para el estado de la ventanilla
export enum EstadoVentanilla {
  CERRADA = "CERRADA",
  ABIERTA = "ABIERTA",
  PAUSA = "PAUSA",
}

// Enum para el tipo de cliente
export enum TipoCliente {
  REGISTRADO = "REGISTRADO",      // Cliente con persona completa registrada
  EMPRESARIAL = "EMPRESARIAL",    // Cliente empresa con representante legal
  OCASIONAL = "OCASIONAL",        // Cliente ocasional sin registro completo
}

// Enum para el estado de la transacción
export enum EstadoTransaccion {
  COMPLETADA = "COMPLETADA",
  CANCELADA = "CANCELADA",
  PENDIENTE = "PENDIENTE",
}

// Enum para el tipo de reporte
export enum TipoReporte {
  DIARIO = "DIARIO",
  SEMANAL = "SEMANAL",
  MENSUAL = "MENSUAL",
  ANUAL = "ANUAL",
}
