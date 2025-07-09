"use client"

import { useEffect, useState, useCallback } from "react"
import { CheckCircle, ArrowRight } from "lucide-react"

interface TransitionLoadingProps {
  isVisible: boolean
  onComplete?: () => void
  onPreload?: () => Promise<void>
  duration?: number
  title?: string
  subtitle?: string
}

export function TransitionLoading({ 
  isVisible, 
  onComplete,
  onPreload,
  duration = 4000,
  title = "Cargando Sistema de Transacciones",
  subtitle = "Preparando el módulo de registro..."
}: TransitionLoadingProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  const steps = [
    { progress: 15, message: "Inicializando sistema..." },
    { progress: 35, message: "Cargando tipos de cambio..." },
    { progress: 60, message: "Preparando formulario..." },
    { progress: 85, message: "Cargando historial..." },
    { progress: 100, message: "¡Sistema listo!" }
  ]

  const runProgress = useCallback(async () => {
    if (!isVisible) return

    // Reset estados
    setProgress(0)
    setCurrentStep("")
    setIsComplete(false)

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      
      // Ejecutar precarga en el segundo paso (35%)
      if (step.progress === 35 && onPreload) {
        try {
          await onPreload()
        } catch (error) {
          console.warn('Error en precarga:', error)
        }
      }
      
      // Actualizar progreso y mensaje
      setProgress(step.progress)
      setCurrentStep(step.message)
      
      // Esperar antes del siguiente paso
      if (i < steps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, duration / steps.length))
      }
    }
    
    // Marcar como completado y esperar antes de cerrar
    setIsComplete(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Llamar onComplete
    onComplete?.()
  }, [isVisible, duration, onComplete, onPreload])

  useEffect(() => {
    if (isVisible) {
      runProgress()
    }
  }, [isVisible, runProgress])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="text-center space-y-8 px-8 max-w-md">
        {/* Icono principal con progreso */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              {/* Círculo de fondo */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-white/20"
              />
              {/* Círculo de progreso */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                className="text-primary transition-all duration-700 ease-out"
                style={{
                  strokeDasharray: `${2 * Math.PI * 45}`,
                  strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}`
                }}
              />
            </svg>
            
            {/* Icono central */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isComplete ? (
                <CheckCircle className="w-12 h-12 text-green-400" />
              ) : (
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
        </div>
        
        {/* Título y subtítulo */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-white/70">{subtitle}</p>
        </div>
        
        {/* Barra de progreso */}
        <div className="w-72 mx-auto">
          <div className="w-full bg-white/20 rounded-full h-3 shadow-inner">
            <div 
              className="h-3 bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-700 ease-out shadow-md"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-lg font-mono text-white/80 mt-3">{Math.round(progress)}%</div>
        </div>
        
        {/* Mensaje de estado */}
        <div className="flex items-center justify-center gap-3 text-white/70">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">{currentStep}</span>
          {!isComplete && <ArrowRight className="w-4 h-4 animate-pulse" />}
        </div>
      </div>
    </div>
  )
}