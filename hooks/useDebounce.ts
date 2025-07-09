/**
 * Hook de Debounce
 * 
 * Proporciona funcionalidades de debounce para optimizar
 * el rendimiento en búsquedas y validaciones.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { PERFORMANCE } from '@/utils/constantes'

/**
 * Hook para debounce de valores
 */
export function useDebounce<T>(value: T, delay: number = PERFORMANCE.DEBOUNCE_BUSQUEDA): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para debounce de funciones
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = PERFORMANCE.DEBOUNCE_BUSQUEDA
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef<T>(callback)

  // Actualizar callback ref cuando callback cambie
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  ) as T

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

/**
 * Hook para debounce de funciones async con estado de loading
 */
export function useDebouncedAsyncCallback<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  delay: number = PERFORMANCE.DEBOUNCE_BUSQUEDA
): {
  debouncedCallback: T
  isLoading: boolean
  cancel: () => void
} {
  const [isLoading, setIsLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef<T>(callback)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
  }, [])

  const debouncedCallback = useCallback(
    async (...args: Parameters<T>) => {
      // Cancelar operación anterior
      cancel()

      return new Promise<ReturnType<T>>((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            setIsLoading(true)
            abortControllerRef.current = new AbortController()
            
            const result = await callbackRef.current(...args)
            
            if (!abortControllerRef.current.signal.aborted) {
              resolve(result)
            }
          } catch (error) {
            if (!abortControllerRef.current?.signal.aborted) {
              reject(error)
            }
          } finally {
            setIsLoading(false)
          }
        }, delay)
      })
    },
    [delay, cancel]
  ) as T

  useEffect(() => {
    return cancel
  }, [cancel])

  return {
    debouncedCallback,
    isLoading,
    cancel
  }
}

/**
 * Hook para search con debounce
 */
export function useDebouncedSearch<T>(
  searchFunction: (query: string) => Promise<T[]>,
  delay: number = PERFORMANCE.DEBOUNCE_BUSQUEDA
): {
  query: string
  results: T[]
  isLoading: boolean
  setQuery: (query: string) => void
  clearResults: () => void
} {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const debouncedQuery = useDebounce(query, delay)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }

    const performSearch = async () => {
      setIsLoading(true)
      try {
        const searchResults = await searchFunction(debouncedQuery)
        setResults(searchResults)
      } catch (error) {
        console.error('Error en búsqueda:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery, searchFunction])

  const clearResults = useCallback(() => {
    setQuery('')
    setResults([])
  }, [])

  return {
    query,
    results,
    isLoading,
    setQuery,
    clearResults
  }
}

/**
 * Hook para validación con debounce
 */
export function useDebouncedValidation<T>(
  value: T,
  validationFunction: (value: T) => Promise<{ isValid: boolean; message?: string }>,
  delay: number = PERFORMANCE.DEBOUNCE_VALIDACION
): {
  isValid: boolean | null
  message?: string
  isValidating: boolean
} {
  const [validationState, setValidationState] = useState<{
    isValid: boolean | null
    message?: string
    isValidating: boolean
  }>({
    isValid: null,
    isValidating: false
  })

  const debouncedValue = useDebounce(value, delay)

  useEffect(() => {
    if (debouncedValue === null || debouncedValue === undefined || debouncedValue === '') {
      setValidationState({
        isValid: null,
        isValidating: false
      })
      return
    }

    const validate = async () => {
      setValidationState(prev => ({ ...prev, isValidating: true }))
      
      try {
        const result = await validationFunction(debouncedValue)
        setValidationState({
          isValid: result.isValid,
          message: result.message,
          isValidating: false
        })
      } catch (error) {
        setValidationState({
          isValid: false,
          message: 'Error de validación',
          isValidating: false
        })
      }
    }

    validate()
  }, [debouncedValue, validationFunction])

  return validationState
}

/**
 * Hook para throttle de funciones
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = PERFORMANCE.THROTTLE_SCROLL
): T {
  const lastCallRef = useRef<number>(0)
  const callbackRef = useRef<T>(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now
        return callbackRef.current(...args)
      }
    },
    [delay]
  ) as T

  return throttledCallback
}