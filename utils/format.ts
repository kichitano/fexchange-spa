/**
 * Formatea un número como moneda
 */
export function formatCurrency(amount: number, currency = "PEN"): string {
  const currencySymbols: { [key: string]: string } = {
    PEN: "S/",
    USD: "$",
    EUR: "€",
  }

  const symbol = currencySymbols[currency] || currency

  return `${symbol} ${amount.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Formatea una fecha
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  
  const dateObj = typeof date === "string" ? new Date(date) : date
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) return "Fecha inválida"

  return dateObj.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Formatea una fecha y hora
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  
  const dateObj = typeof date === "string" ? new Date(date) : date
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) return "Fecha inválida"

  return dateObj.toLocaleString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("es-PE")
}

/**
 * Trunca un texto a una longitud específica
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}
