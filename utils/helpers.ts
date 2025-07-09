/**
 * Funciones Helper Utilitarias
 * 
 * Funciones auxiliares para operaciones comunes
 * que no encajan en otras categorías específicas.
 */

/**
 * Utilidades para arrays
 */
export const arrayHelpers = {
  /**
   * Agrupa elementos de un array por una propiedad
   */
  groupBy<T>(array: T[], key: keyof T | ((item: T) => string | number)): Record<string, T[]> {
    return array.reduce((grupos, item) => {
      const valor = typeof key === 'function' ? key(item) : item[key]
      const clave = String(valor)
      
      if (!grupos[clave]) {
        grupos[clave] = []
      }
      grupos[clave].push(item)
      
      return grupos
    }, {} as Record<string, T[]>)
  },

  /**
   * Elimina duplicados de un array
   */
  unique<T>(array: T[], key?: keyof T): T[] {
    if (!key) {
      return [...new Set(array)]
    }
    
    const seen = new Set()
    return array.filter(item => {
      const valor = item[key]
      if (seen.has(valor)) {
        return false
      }
      seen.add(valor)
      return true
    })
  },

  /**
   * Ordena array por múltiples criterios
   */
  sortBy<T>(array: T[], ...keys: (keyof T | { key: keyof T; desc?: boolean })[]): T[] {
    return [...array].sort((a, b) => {
      for (const criterio of keys) {
        let key: keyof T
        let desc = false
        
        if (typeof criterio === 'object') {
          key = criterio.key
          desc = criterio.desc || false
        } else {
          key = criterio
        }
        
        const valorA = a[key]
        const valorB = b[key]
        
        if (valorA < valorB) {
          return desc ? 1 : -1
        }
        if (valorA > valorB) {
          return desc ? -1 : 1
        }
      }
      return 0
    })
  },

  /**
   * Divide un array en chunks
   */
  chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  },

  /**
   * Encuentra el elemento con valor máximo
   */
  maxBy<T>(array: T[], key: keyof T): T | undefined {
    return array.reduce((max, item) => 
      (!max || item[key] > max[key]) ? item : max
    )
  },

  /**
   * Encuentra el elemento con valor mínimo
   */
  minBy<T>(array: T[], key: keyof T): T | undefined {
    return array.reduce((min, item) => 
      (!min || item[key] < min[key]) ? item : min
    )
  }
}

/**
 * Utilidades para objetos
 */
export const objectHelpers = {
  /**
   * Clona profundamente un objeto
   */
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as unknown as T
    }
    
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key])
      }
    }
    
    return cloned
  },

  /**
   * Obtiene valor anidado de un objeto usando path
   */
  get<T>(obj: any, path: string, defaultValue?: T): T {
    const keys = path.split('.')
    let result = obj
    
    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue as T
      }
      result = result[key]
    }
    
    return result !== undefined ? result : defaultValue as T
  },

  /**
   * Establece valor anidado en un objeto usando path
   */
  set(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }
    
    current[keys[keys.length - 1]] = value
  },

  /**
   * Omite propiedades de un objeto
   */
  omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj }
    keys.forEach(key => {
      delete result[key]
    })
    return result
  },

  /**
   * Selecciona solo ciertas propiedades de un objeto
   */
  pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key]
      }
    })
    return result
  },

  /**
   * Verifica si un objeto está vacío
   */
  isEmpty(obj: any): boolean {
    if (obj === null || obj === undefined) return true
    if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0
    if (typeof obj === 'object') return Object.keys(obj).length === 0
    return false
  }
}

/**
 * Utilidades para strings
 */
export const stringHelpers = {
  /**
   * Convierte a camelCase
   */
  toCamelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '')
  },

  /**
   * Convierte a snake_case
   */
  toSnakeCase(str: string): string {
    return str
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_')
  },

  /**
   * Convierte a kebab-case
   */
  toKebabCase(str: string): string {
    return str
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('-')
  },

  /**
   * Capitaliza primera letra
   */
  capitalize(str: string): string {
    if (!str) return str
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },

  /**
   * Capitaliza cada palabra
   */
  titleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  },

  /**
   * Trunca texto con ellipsis
   */
  truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) return str
    return str.substring(0, length - suffix.length) + suffix
  },

  /**
   * Remueve acentos y caracteres especiales
   */
  removeAccents(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/gi, '')
  },

  /**
   * Genera slug para URLs
   */
  toSlug(str: string): string {
    return this.removeAccents(str)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

/**
 * Utilidades para números
 */
export const numberHelpers = {
  /**
   * Redondea a N decimales
   */
  round(num: number, decimals: number = 2): number {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
  },

  /**
   * Clamp - mantiene número dentro de un rango
   */
  clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max)
  },

  /**
   * Genera número aleatorio entre min y max
   */
  random(min: number, max: number): number {
    return Math.random() * (max - min) + min
  },

  /**
   * Genera número entero aleatorio
   */
  randomInt(min: number, max: number): number {
    return Math.floor(this.random(min, max + 1))
  },

  /**
   * Calcula porcentaje
   */
  percentage(part: number, total: number): number {
    if (total === 0) return 0
    return this.round((part / total) * 100)
  },

  /**
   * Interpola entre dos números
   */
  lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor
  },

  /**
   * Verifica si un número está en rango
   */
  inRange(num: number, min: number, max: number): boolean {
    return num >= min && num <= max
  }
}

/**
 * Utilidades para fechas
 */
export const dateHelpers = {
  /**
   * Añade días a una fecha
   */
  addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  },

  /**
   * Añade meses a una fecha
   */
  addMonths(date: Date, months: number): Date {
    const result = new Date(date)
    result.setMonth(result.getMonth() + months)
    return result
  },

  /**
   * Obtiene inicio del día
   */
  startOfDay(date: Date): Date {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    return result
  },

  /**
   * Obtiene fin del día
   */
  endOfDay(date: Date): Date {
    const result = new Date(date)
    result.setHours(23, 59, 59, 999)
    return result
  },

  /**
   * Verifica si dos fechas son el mismo día
   */
  isSameDay(date1: Date, date2: Date): boolean {
    return this.startOfDay(date1).getTime() === this.startOfDay(date2).getTime()
  },

  /**
   * Obtiene diferencia en días
   */
  diffInDays(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

  /**
   * Formatea fecha relativa (hace X tiempo)
   */
  formatRelative(date: Date, now: Date = new Date()): string {
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`
    if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`
    if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
    return 'hace unos momentos'
  }
}

/**
 * Utilidades para promesas y async
 */
export const asyncHelpers = {
  /**
   * Delay asíncrono
   */
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  /**
   * Retry con exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        if (i < maxRetries - 1) {
          await this.delay(baseDelay * Math.pow(2, i))
        }
      }
    }
    
    throw lastError!
  },

  /**
   * Timeout para promesas
   */
  withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), ms)
      )
    ])
  },

  /**
   * Debounce para funciones async
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    let timeout: NodeJS.Timeout | null = null
    
    return (...args: Parameters<T>) => {
      return new Promise<ReturnType<T>>((resolve) => {
        if (timeout) {
          clearTimeout(timeout)
        }
        
        timeout = setTimeout(() => {
          resolve(func(...args))
        }, wait)
      })
    }
  },

  /**
   * Throttle para funciones
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => ReturnType<T> | undefined {
    let lastCall = 0
    let lastResult: ReturnType<T>
    
    return (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCall >= wait) {
        lastCall = now
        lastResult = func(...args)
        return lastResult
      }
      return lastResult
    }
  }
}

/**
 * Utilidades para localStorage
 */
export const storageHelpers = {
  /**
   * Obtiene valor del localStorage con parsing automático
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue
      return JSON.parse(item)
    } catch {
      return defaultValue
    }
  },

  /**
   * Establece valor en localStorage con stringify automático
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error guardando en localStorage:', error)
    }
  },

  /**
   * Remueve item del localStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removiendo de localStorage:', error)
    }
  },

  /**
   * Limpia todo el localStorage
   */
  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error limpiando localStorage:', error)
    }
  },

  /**
   * Verifica si localStorage está disponible
   */
  isAvailable(): boolean {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, 'test')
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Utilidades para errores
 */
export const errorHelpers = {
  /**
   * Extrae mensaje de error seguro
   */
  getMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'Error desconocido'
  },

  /**
   * Crea error con código
   */
  createError(message: string, code?: string | number): Error & { code?: string | number } {
    const error = new Error(message) as Error & { code?: string | number }
    if (code) {
      error.code = code
    }
    return error
  },

  /**
   * Maneja errores de forma segura
   */
  handleSafely<T>(fn: () => T, defaultValue: T): T {
    try {
      return fn()
    } catch {
      return defaultValue
    }
  }
}

/**
 * Utilidades para URLs
 */
export const urlHelpers = {
  /**
   * Construye URL con parámetros
   */
  buildUrl(base: string, params?: Record<string, any>): string {
    if (!params) return base
    
    const url = new URL(base)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })
    
    return url.toString()
  },

  /**
   * Parsea parámetros de query string
   */
  parseQuery(search: string): Record<string, string> {
    const params = new URLSearchParams(search)
    const result: Record<string, string> = {}
    
    for (const [key, value] of params.entries()) {
      result[key] = value
    }
    
    return result
  }
}