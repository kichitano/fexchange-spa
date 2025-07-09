/**
 * Hook de Cache
 * 
 * Proporciona funcionalidades de cache con expiración
 * para mejorar el rendimiento de la aplicación.
 */

import { useRef, useCallback } from 'react'
import { storageHelpers } from '@/utils/helpers'
import { PERFORMANCE } from '@/utils/constantes'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface CacheOptions {
  ttl?: number // Time to live en milisegundos
  persistent?: boolean // Si debe persistir en localStorage
}

export function useCache<T = any>() {
  const memoryCache = useRef<Map<string, CacheEntry<T>>>(new Map())

  /**
   * Obtiene un valor del cache
   */
  const get = useCallback((key: string): T | null => {
    const now = Date.now()
    
    // Verificar cache en memoria primero
    const memoryCacheEntry = memoryCache.current.get(key)
    if (memoryCacheEntry && memoryCacheEntry.expiresAt > now) {
      return memoryCacheEntry.data
    }
    
    // Verificar cache persistente
    if (storageHelpers.isAvailable()) {
      const persistentEntry = storageHelpers.get<CacheEntry<T>>(`cache_${key}`)
      if (persistentEntry && persistentEntry.expiresAt > now) {
        // Restaurar al cache en memoria
        memoryCache.current.set(key, persistentEntry)
        return persistentEntry.data
      }
    }
    
    return null
  }, [])

  /**
   * Establece un valor en el cache
   */
  const set = useCallback((key: string, data: T, options: CacheOptions = {}) => {
    const now = Date.now()
    const ttl = options.ttl || PERFORMANCE.CACHE_TIPOS_CAMBIO
    const expiresAt = now + ttl
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt
    }
    
    // Guardar en memoria
    memoryCache.current.set(key, entry)
    
    // Guardar en localStorage si es persistente
    if (options.persistent && storageHelpers.isAvailable()) {
      storageHelpers.set(`cache_${key}`, entry)
    }
  }, [])

  /**
   * Verifica si existe un valor en cache y no ha expirado
   */
  const has = useCallback((key: string): boolean => {
    return get(key) !== null
  }, [get])

  /**
   * Elimina un valor del cache
   */
  const remove = useCallback((key: string) => {
    memoryCache.current.delete(key)
    
    if (storageHelpers.isAvailable()) {
      storageHelpers.remove(`cache_${key}`)
    }
  }, [])

  /**
   * Limpia todo el cache
   */
  const clear = useCallback(() => {
    memoryCache.current.clear()
    
    if (storageHelpers.isAvailable()) {
      // Limpiar solo las entradas de cache del localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          storageHelpers.remove(key)
        }
      })
    }
  }, [])

  /**
   * Invalida cache que coincida con un patrón
   */
  const invalidatePattern = useCallback((pattern: string) => {
    // Limpiar cache en memoria
    const keysToDelete: string[] = []
    memoryCache.current.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => memoryCache.current.delete(key))
    
    // Limpiar cache persistente
    if (storageHelpers.isAvailable()) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_') && key.includes(pattern)) {
          storageHelpers.remove(key)
        }
      })
    }
  }, [])

  /**
   * Wrapper para funciones que incluye cache automático
   */
  const withCache = useCallback(<TArgs extends any[], TResult>(
    fn: (...args: TArgs) => Promise<TResult>,
    keyGenerator: (...args: TArgs) => string,
    options: CacheOptions = {}
  ) => {
    return async (...args: TArgs): Promise<TResult> => {
      const key = keyGenerator(...args)
      
      // Verificar cache
      const cached = get(key)
      if (cached !== null) {
        return cached as TResult
      }
      
      // Ejecutar función y cachear resultado
      const result = await fn(...args)
      set(key, result as T, options)
      
      return result
    }
  }, [get, set])

  return {
    get,
    set,
    has,
    remove,
    clear,
    invalidatePattern,
    withCache
  }
}