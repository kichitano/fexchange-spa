/**
 * Hook de Lazy Loading
 * 
 * Proporciona funcionalidades de carga diferida para optimizar
 * el rendimiento en listas grandes y componentes pesados.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { PERFORMANCE } from '@/utils/constantes'

/**
 * Hook para lazy loading con Intersection Observer
 */
export function useLazyLoading<T>(
  items: T[],
  pageSize: number = 20,
  threshold: number = PERFORMANCE.LAZY_LOADING_THRESHOLD
): {
  visibleItems: T[]
  hasMore: boolean
  loadMore: () => void
  isLoading: boolean
  observerRef: React.RefObject<HTMLDivElement>
} {
  const [visibleItems, setVisibleItems] = useState<T[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  const hasMore = visibleItems.length < items.length

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    
    // Simular delay de carga
    setTimeout(() => {
      const nextPage = currentPage + 1
      const startIndex = 0
      const endIndex = nextPage * pageSize
      const newVisibleItems = items.slice(startIndex, endIndex)
      
      setVisibleItems(newVisibleItems)
      setCurrentPage(nextPage)
      setIsLoading(false)
    }, 100)
  }, [currentPage, items, pageSize, isLoading, hasMore])

  // Configurar Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      {
        threshold: 0.1,
        rootMargin: `${threshold}px`
      }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
    }
  }, [loadMore, hasMore, isLoading, threshold])

  // Cargar primera página
  useEffect(() => {
    if (items.length > 0 && visibleItems.length === 0) {
      const initialItems = items.slice(0, pageSize)
      setVisibleItems(initialItems)
    }
  }, [items, pageSize, visibleItems.length])

  // Reset cuando items cambian
  useEffect(() => {
    setVisibleItems([])
    setCurrentPage(1)
  }, [items])

  return {
    visibleItems,
    hasMore,
    loadMore,
    isLoading,
    observerRef
  }
}

/**
 * Hook para virtual scrolling
 */
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
): {
  visibleItems: Array<{ index: number; item: T }>
  scrollToIndex: (index: number) => void
  containerRef: React.RefObject<HTMLDivElement>
  scrollOffset: number
} {
  const [scrollOffset, setScrollOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const visibleRange = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.max(0, Math.floor(scrollOffset / itemHeight) - overscan)
  const endIndex = Math.min(items.length - 1, startIndex + visibleRange + overscan * 2)

  const visibleItems = []
  for (let i = startIndex; i <= endIndex; i++) {
    if (items[i]) {
      visibleItems.push({ index: i, item: items[i] })
    }
  }

  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      const offset = index * itemHeight
      containerRef.current.scrollTop = offset
      setScrollOffset(offset)
    }
  }, [itemHeight])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollOffset(container.scrollTop)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  return {
    visibleItems,
    scrollToIndex,
    containerRef,
    scrollOffset
  }
}

/**
 * Hook para lazy loading de imágenes
 */
export function useLazyImage(src: string, placeholder?: string): {
  imageSrc: string
  isLoaded: boolean
  isLoading: boolean
  error: boolean
  imageRef: React.RefObject<HTMLImageElement>
} {
  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !isLoaded && !isLoading) {
          setIsLoading(true)
          
          const img = new Image()
          img.onload = () => {
            setImageSrc(src)
            setIsLoaded(true)
            setIsLoading(false)
            setError(false)
          }
          img.onerror = () => {
            setError(true)
            setIsLoading(false)
          }
          img.src = src
        }
      },
      { threshold: 0.1 }
    )

    if (imageRef.current) {
      observer.observe(imageRef.current)
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current)
      }
    }
  }, [src, isLoaded, isLoading])

  return {
    imageSrc,
    isLoaded,
    isLoading,
    error,
    imageRef
  }
}

/**
 * Hook para lazy loading de componentes
 */
export function useLazyComponent<T = any>(
  importFunction: () => Promise<{ default: React.ComponentType<T> }>,
  deps: any[] = []
): {
  Component: React.ComponentType<T> | null
  isLoading: boolean
  error: Error | null
} {
  const [Component, setComponent] = useState<React.ComponentType<T> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true
    
    const loadComponent = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const module = await importFunction()
        if (isMounted) {
          setComponent(() => module.default)
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadComponent()

    return () => {
      isMounted = false
    }
  }, deps)

  return { Component, isLoading, error }
}

/**
 * Hook para infinite scroll
 */
export function useInfiniteScroll<T>(
  fetchFunction: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
  pageSize: number = 20
): {
  data: T[]
  hasMore: boolean
  isLoading: boolean
  error: Error | null
  loadMore: () => void
  refresh: () => void
  observerRef: React.RefObject<HTMLDivElement>
} {
  const [data, setData] = useState<T[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const observerRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchFunction(currentPage)
      setData(prev => [...prev, ...result.data])
      setHasMore(result.hasMore)
      setCurrentPage(prev => prev + 1)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, hasMore, isLoading, fetchFunction])

  const refresh = useCallback(async () => {
    setData([])
    setCurrentPage(1)
    setHasMore(true)
    setError(null)
    
    setIsLoading(true)
    try {
      const result = await fetchFunction(1)
      setData(result.data)
      setHasMore(result.hasMore)
      setCurrentPage(2)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchFunction])

  // Configurar Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
    }
  }, [loadMore, hasMore, isLoading])

  // Cargar primera página
  useEffect(() => {
    if (data.length === 0 && !isLoading) {
      refresh()
    }
  }, [])

  return {
    data,
    hasMore,
    isLoading,
    error,
    loadMore,
    refresh,
    observerRef
  }
}

/**
 * Hook para preload de recursos
 */
export function usePreload(resources: string[]): {
  loadedResources: Set<string>
  isAllLoaded: boolean
  loadResource: (resource: string) => void
} {
  const [loadedResources, setLoadedResources] = useState<Set<string>>(new Set())

  const loadResource = useCallback((resource: string) => {
    if (loadedResources.has(resource)) return

    // Determinar tipo de recurso
    const extension = resource.split('.').pop()?.toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      // Preload imagen
      const img = new Image()
      img.onload = () => {
        setLoadedResources(prev => new Set(prev).add(resource))
      }
      img.src = resource
    } else if (['js', 'css'].includes(extension || '')) {
      // Preload script o estilo
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource
      link.as = extension === 'js' ? 'script' : 'style'
      link.onload = () => {
        setLoadedResources(prev => new Set(prev).add(resource))
      }
      document.head.appendChild(link)
    }
  }, [loadedResources])

  const isAllLoaded = resources.every(resource => loadedResources.has(resource))

  useEffect(() => {
    resources.forEach(loadResource)
  }, [resources, loadResource])

  return {
    loadedResources,
    isAllLoaded,
    loadResource
  }
}