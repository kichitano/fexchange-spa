/**
 * Hook de Keyboard Shortcuts
 * 
 * Proporciona funcionalidades para manejar atajos de teclado
 * y mejorar la experiencia del usuario.
 */

import { useEffect, useCallback, useRef } from 'react'

export type KeyboardShortcut = {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
  description?: string
}

export type ShortcutHandler = (event: KeyboardEvent) => void

/**
 * Hook principal para manejar atajos de teclado
 */
export function useKeyboardShortcuts(
  shortcuts: Record<string, KeyboardShortcut & { handler: ShortcutHandler }>,
  enabled: boolean = true
) {
  const shortcutsRef = useRef(shortcuts)
  
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    const { key, ctrlKey, altKey, shiftKey, metaKey } = event

    // Verificar si estamos en un input, textarea o elemento editable
    const target = event.target as HTMLElement
    const isInputElement = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.isContentEditable

    // Permitir ciertos atajos incluso en elementos de entrada
    const allowedInInputs = ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5']
    
    if (isInputElement && !allowedInInputs.includes(key) && !ctrlKey && !altKey && !metaKey) {
      return
    }

    Object.entries(shortcutsRef.current).forEach(([name, shortcut]) => {
      const matches = 
        shortcut.key === key &&
        (shortcut.ctrlKey || false) === ctrlKey &&
        (shortcut.altKey || false) === altKey &&
        (shortcut.shiftKey || false) === shiftKey &&
        (shortcut.metaKey || false) === metaKey

      if (matches) {
        if (shortcut.preventDefault) {
          event.preventDefault()
        }
        if (shortcut.stopPropagation) {
          event.stopPropagation()
        }
        
        shortcut.handler(event)
      }
    })
  }, [enabled])

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])
}

/**
 * Hook para atajos globales comunes
 */
export function useGlobalShortcuts(handlers: {
  onSave?: () => void
  onCancel?: () => void
  onRefresh?: () => void
  onSearch?: () => void
  onNew?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onHelp?: () => void
}) {
  const shortcuts = {
    save: {
      key: 's',
      ctrlKey: true,
      preventDefault: true,
      description: 'Guardar',
      handler: () => handlers.onSave?.()
    },
    cancel: {
      key: 'Escape',
      preventDefault: true,
      description: 'Cancelar',
      handler: () => handlers.onCancel?.()
    },
    refresh: {
      key: 'F5',
      preventDefault: true,
      description: 'Actualizar',
      handler: () => handlers.onRefresh?.()
    },
    search: {
      key: 'f',
      ctrlKey: true,
      preventDefault: true,
      description: 'Buscar',
      handler: () => handlers.onSearch?.()
    },
    new: {
      key: 'n',
      ctrlKey: true,
      preventDefault: true,
      description: 'Nuevo',
      handler: () => handlers.onNew?.()
    },
    edit: {
      key: 'e',
      ctrlKey: true,
      preventDefault: true,
      description: 'Editar',
      handler: () => handlers.onEdit?.()
    },
    delete: {
      key: 'Delete',
      preventDefault: true,
      description: 'Eliminar',
      handler: () => handlers.onDelete?.()
    },
    help: {
      key: 'F1',
      preventDefault: true,
      description: 'Ayuda',
      handler: () => handlers.onHelp?.()
    }
  }

  // Filtrar solo los shortcuts que tienen handlers
  const activeShortcuts = Object.fromEntries(
    Object.entries(shortcuts).filter(([_, shortcut]) => shortcut.handler)
  )

  useKeyboardShortcuts(activeShortcuts)

  return shortcuts
}

/**
 * Hook para navegación con teclado en listas
 */
export function useListNavigation<T>(
  items: T[],
  onSelect: (item: T, index: number) => void,
  enabled: boolean = true
) {
  const selectedIndexRef = useRef<number>(-1)

  const shortcuts = {
    arrowDown: {
      key: 'ArrowDown',
      preventDefault: true,
      description: 'Siguiente elemento',
      handler: () => {
        if (selectedIndexRef.current < items.length - 1) {
          selectedIndexRef.current += 1
          onSelect(items[selectedIndexRef.current], selectedIndexRef.current)
        }
      }
    },
    arrowUp: {
      key: 'ArrowUp',
      preventDefault: true,
      description: 'Elemento anterior',
      handler: () => {
        if (selectedIndexRef.current > 0) {
          selectedIndexRef.current -= 1
          onSelect(items[selectedIndexRef.current], selectedIndexRef.current)
        }
      }
    },
    enter: {
      key: 'Enter',
      preventDefault: true,
      description: 'Seleccionar elemento',
      handler: () => {
        if (selectedIndexRef.current >= 0 && selectedIndexRef.current < items.length) {
          onSelect(items[selectedIndexRef.current], selectedIndexRef.current)
        }
      }
    },
    home: {
      key: 'Home',
      preventDefault: true,
      description: 'Primer elemento',
      handler: () => {
        if (items.length > 0) {
          selectedIndexRef.current = 0
          onSelect(items[0], 0)
        }
      }
    },
    end: {
      key: 'End',
      preventDefault: true,
      description: 'Último elemento',
      handler: () => {
        if (items.length > 0) {
          selectedIndexRef.current = items.length - 1
          onSelect(items[items.length - 1], items.length - 1)
        }
      }
    }
  }

  useKeyboardShortcuts(shortcuts, enabled)

  return {
    selectedIndex: selectedIndexRef.current,
    setSelectedIndex: (index: number) => {
      selectedIndexRef.current = index
    }
  }
}

/**
 * Hook para atajos de formularios
 */
export function useFormShortcuts(handlers: {
  onSubmit?: () => void
  onReset?: () => void
  onCancel?: () => void
  onNextField?: () => void
  onPrevField?: () => void
}) {
  const shortcuts = {
    submit: {
      key: 'Enter',
      ctrlKey: true,
      preventDefault: true,
      description: 'Enviar formulario',
      handler: () => handlers.onSubmit?.()
    },
    reset: {
      key: 'r',
      ctrlKey: true,
      preventDefault: true,
      description: 'Limpiar formulario',
      handler: () => handlers.onReset?.()
    },
    cancel: {
      key: 'Escape',
      preventDefault: true,
      description: 'Cancelar',
      handler: () => handlers.onCancel?.()
    },
    nextField: {
      key: 'Tab',
      preventDefault: false,
      description: 'Siguiente campo',
      handler: () => handlers.onNextField?.()
    },
    prevField: {
      key: 'Tab',
      shiftKey: true,
      preventDefault: false,
      description: 'Campo anterior',
      handler: () => handlers.onPrevField?.()
    }
  }

  const activeShortcuts = Object.fromEntries(
    Object.entries(shortcuts).filter(([_, shortcut]) => shortcut.handler)
  )

  useKeyboardShortcuts(activeShortcuts)

  return shortcuts
}

/**
 * Hook para atajos específicos de tipos de cambio
 */
export function useTipoCambioShortcuts(handlers: {
  onNuevoTipo?: () => void
  onEditarTipo?: () => void
  onEliminarTipo?: () => void
  onToggleMantenerDiario?: () => void
  onExportar?: () => void
  onFiltrar?: () => void
}) {
  const shortcuts = {
    nuevoTipo: {
      key: 'n',
      ctrlKey: true,
      shiftKey: true,
      preventDefault: true,
      description: 'Nuevo tipo de cambio',
      handler: () => handlers.onNuevoTipo?.()
    },
    editarTipo: {
      key: 'e',
      ctrlKey: true,
      shiftKey: true,
      preventDefault: true,
      description: 'Editar tipo de cambio',
      handler: () => handlers.onEditarTipo?.()
    },
    eliminarTipo: {
      key: 'Delete',
      ctrlKey: true,
      preventDefault: true,
      description: 'Eliminar tipo de cambio',
      handler: () => handlers.onEliminarTipo?.()
    },
    toggleMantenerDiario: {
      key: 'm',
      ctrlKey: true,
      preventDefault: true,
      description: 'Toggle mantener diario',
      handler: () => handlers.onToggleMantenerDiario?.()
    },
    exportar: {
      key: 'e',
      ctrlKey: true,
      altKey: true,
      preventDefault: true,
      description: 'Exportar datos',
      handler: () => handlers.onExportar?.()
    },
    filtrar: {
      key: 'f',
      ctrlKey: true,
      shiftKey: true,
      preventDefault: true,
      description: 'Mostrar filtros',
      handler: () => handlers.onFiltrar?.()
    }
  }

  const activeShortcuts = Object.fromEntries(
    Object.entries(shortcuts).filter(([_, shortcut]) => shortcut.handler)
  )

  useKeyboardShortcuts(activeShortcuts)

  return shortcuts
}

/**
 * Hook para mostrar ayuda de atajos
 */
export function useShortcutHelp(
  shortcuts: Record<string, KeyboardShortcut & { description?: string }>
) {
  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const keys = []
    
    if (shortcut.ctrlKey) keys.push('Ctrl')
    if (shortcut.altKey) keys.push('Alt')
    if (shortcut.shiftKey) keys.push('Shift')
    if (shortcut.metaKey) keys.push('Cmd')
    
    keys.push(shortcut.key)
    
    return keys.join(' + ')
  }

  const getHelpText = (): string => {
    return Object.entries(shortcuts)
      .filter(([_, shortcut]) => shortcut.description)
      .map(([name, shortcut]) => `${formatShortcut(shortcut)}: ${shortcut.description}`)
      .join('\n')
  }

  const getHelpData = (): Array<{ name: string; keys: string; description: string }> => {
    return Object.entries(shortcuts)
      .filter(([_, shortcut]) => shortcut.description)
      .map(([name, shortcut]) => ({
        name,
        keys: formatShortcut(shortcut),
        description: shortcut.description || ''
      }))
  }

  return {
    getHelpText,
    getHelpData,
    formatShortcut
  }
}

/**
 * Hook para atajos de navegación
 */
export function useNavigationShortcuts(handlers: {
  onBack?: () => void
  onForward?: () => void
  onHome?: () => void
  onSettings?: () => void
}) {
  const shortcuts = {
    back: {
      key: 'ArrowLeft',
      altKey: true,
      preventDefault: true,
      description: 'Volver',
      handler: () => handlers.onBack?.()
    },
    forward: {
      key: 'ArrowRight',
      altKey: true,
      preventDefault: true,
      description: 'Adelante',
      handler: () => handlers.onForward?.()
    },
    home: {
      key: 'h',
      ctrlKey: true,
      altKey: true,
      preventDefault: true,
      description: 'Inicio',
      handler: () => handlers.onHome?.()
    },
    settings: {
      key: ',',
      ctrlKey: true,
      preventDefault: true,
      description: 'Configuración',
      handler: () => handlers.onSettings?.()
    }
  }

  const activeShortcuts = Object.fromEntries(
    Object.entries(shortcuts).filter(([_, shortcut]) => shortcut.handler)
  )

  useKeyboardShortcuts(activeShortcuts)

  return shortcuts
}

/**
 * Hook para debug de atajos de teclado
 */
export function useShortcutDebug(enabled: boolean = false) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('Key pressed:', {
        key: event.key,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
        target: event.target
      })
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enabled])
}