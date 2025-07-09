/**
 * Componente Tooltip Helper
 * 
 * Proporciona tooltips explicativos para mejorar la UX
 * en formularios y elementos de la interfaz.
 */

"use client"

import { ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info, HelpCircle, AlertTriangle, CheckCircle } from 'lucide-react'

interface TooltipHelperProps {
  children: ReactNode
  content: string | ReactNode
  type?: 'info' | 'help' | 'warning' | 'success'
  side?: 'top' | 'bottom' | 'left' | 'right'
  delayDuration?: number
  className?: string
}

export function TooltipHelper({ 
  children, 
  content, 
  type = 'info', 
  side = 'top',
  delayDuration = 300,
  className = ''
}: TooltipHelperProps) {
  const getIcon = () => {
    switch (type) {
      case 'help':
        return <HelpCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getContentStyles = () => {
    const baseStyles = "max-w-xs text-sm"
    
    switch (type) {
      case 'warning':
        return `${baseStyles} bg-yellow-50 text-yellow-800 border border-yellow-200`
      case 'success':
        return `${baseStyles} bg-green-50 text-green-800 border border-green-200`
      case 'help':
        return `${baseStyles} bg-blue-50 text-blue-800 border border-blue-200`
      default:
        return baseStyles
    }
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 ${className}`}>
            {children}
            {getIcon()}
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className={getContentStyles()}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Componentes específicos para diferentes tipos de ayuda

export function FieldHelp({ 
  label, 
  help, 
  required = false 
}: { 
  label: string
  help: string
  required?: boolean 
}) {
  return (
    <TooltipHelper content={help} type="help" side="right">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    </TooltipHelper>
  )
}

export function ValidationHelp({ 
  message, 
  type = 'warning' 
}: { 
  message: string
  type?: 'warning' | 'success' | 'info' 
}) {
  return (
    <TooltipHelper content={message} type={type} side="bottom">
      <span className="text-xs text-muted-foreground">
        {type === 'warning' && 'Advertencia'}
        {type === 'success' && 'Válido'}
        {type === 'info' && 'Información'}
      </span>
    </TooltipHelper>
  )
}

export function ShortcutHelp({ 
  shortcut, 
  description, 
  children 
}: { 
  shortcut: string
  description: string
  children: ReactNode 
}) {
  return (
    <TooltipHelper 
      content={
        <div className="space-y-1">
          <div className="font-medium">{description}</div>
          <div className="text-xs opacity-75">
            Atajo: <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">{shortcut}</kbd>
          </div>
        </div>
      }
      type="help"
    >
      {children}
    </TooltipHelper>
  )
}

export function FeatureHelp({ 
  title, 
  description, 
  children 
}: { 
  title: string
  description: string
  children: ReactNode 
}) {
  return (
    <TooltipHelper 
      content={
        <div className="space-y-2">
          <div className="font-medium">{title}</div>
          <div className="text-xs">{description}</div>
        </div>
      }
      type="info"
    >
      {children}
    </TooltipHelper>
  )
}

export function StatusHelp({ 
  status, 
  explanation, 
  children 
}: { 
  status: 'active' | 'inactive' | 'pending' | 'error'
  explanation: string
  children: ReactNode 
}) {
  const getType = () => {
    switch (status) {
      case 'active':
        return 'success'
      case 'error':
        return 'warning'
      case 'pending':
        return 'info'
      default:
        return 'info'
    }
  }

  return (
    <TooltipHelper 
      content={explanation}
      type={getType()}
    >
      {children}
    </TooltipHelper>
  )
}

export function ActionHelp({ 
  action, 
  conditions, 
  children 
}: { 
  action: string
  conditions?: string[]
  children: ReactNode 
}) {
  return (
    <TooltipHelper 
      content={
        <div className="space-y-2">
          <div className="font-medium">{action}</div>
          {conditions && conditions.length > 0 && (
            <div className="text-xs">
              <div className="font-medium mb-1">Condiciones:</div>
              <ul className="list-disc list-inside space-y-0.5">
                {conditions.map((condition, index) => (
                  <li key={index}>{condition}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      }
      type="info"
    >
      {children}
    </TooltipHelper>
  )
}

export function FormatHelp({ 
  format, 
  examples, 
  children 
}: { 
  format: string
  examples?: string[]
  children: ReactNode 
}) {
  return (
    <TooltipHelper 
      content={
        <div className="space-y-2">
          <div>
            <span className="font-medium">Formato: </span>
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{format}</code>
          </div>
          {examples && examples.length > 0 && (
            <div className="text-xs">
              <div className="font-medium mb-1">Ejemplos:</div>
              <ul className="space-y-0.5">
                {examples.map((example, index) => (
                  <li key={index}>
                    <code className="bg-gray-100 px-1 py-0.5 rounded">{example}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      }
      type="help"
    >
      {children}
    </TooltipHelper>
  )
}

export function CalculationHelp({ 
  formula, 
  variables, 
  children 
}: { 
  formula: string
  variables?: Record<string, string>
  children: ReactNode 
}) {
  return (
    <TooltipHelper 
      content={
        <div className="space-y-2">
          <div>
            <span className="font-medium">Fórmula: </span>
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{formula}</code>
          </div>
          {variables && Object.keys(variables).length > 0 && (
            <div className="text-xs">
              <div className="font-medium mb-1">Variables:</div>
              <ul className="space-y-0.5">
                {Object.entries(variables).map(([variable, description]) => (
                  <li key={variable}>
                    <code className="bg-gray-100 px-1 py-0.5 rounded">{variable}</code>
                    <span className="ml-2">{description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      }
      type="help"
    >
      {children}
    </TooltipHelper>
  )
}

// Tooltips específicos para la aplicación de tipos de cambio

export function TipoCambioHelp({ children }: { children: ReactNode }) {
  return (
    <FeatureHelp
      title="Tipos de Cambio"
      description="Gestión de tipos de cambio para operaciones de compra y venta de divisas"
    >
      {children}
    </FeatureHelp>
  )
}

export function SpreadHelp({ children }: { children: ReactNode }) {
  return (
    <CalculationHelp
      formula="(Venta - Compra) / Compra × 100"
      variables={{
        'Venta': 'Tipo de cambio de venta',
        'Compra': 'Tipo de cambio de compra'
      }}
    >
      {children}
    </CalculationHelp>
  )
}

export function MantenerDiarioHelp({ children }: { children: ReactNode }) {
  return (
    <FeatureHelp
      title="Mantener Diario"
      description="Cuando está activo, este tipo de cambio se registra automáticamente al abrir la ventanilla cada día"
    >
      {children}
    </FeatureHelp>
  )
}

export function VentanillaHelp({ children }: { children: ReactNode }) {
  return (
    <FeatureHelp
      title="Ventanilla"
      description="Una ventanilla debe estar activa para realizar operaciones de cambio de divisas"
    >
      {children}
    </FeatureHelp>
  )
}

export function TransaccionHelp({ children }: { children: ReactNode }) {
  return (
    <FeatureHelp
      title="Transacciones"
      description="Operaciones de compra y venta de divisas realizadas en la ventanilla"
    >
      {children}
    </FeatureHelp>
  )
}