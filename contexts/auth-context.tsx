"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/auth-service"
import type { LoginRequest, UsuarioDto } from "@/types/usuario"

interface AuthContextType {
  user: UsuarioDto | null
  token: string | null
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioDto | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la aplicación
    const savedToken = localStorage.getItem("auth_token")
    const savedUser = localStorage.getItem("auth_user")

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Error parsing saved user data:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
      }
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Redirigir al login si no hay usuario autenticado
    if (!isLoading && !user && !window.location.pathname.startsWith("/auth")) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials)

      if (response.success && response.data) {
        setUser(response.data.usuario)
        setToken(response.data.token)

        // Guardar en localStorage
        localStorage.setItem("auth_token", response.data.token)
        localStorage.setItem("auth_user", JSON.stringify(response.data.usuario))
      } else {
        throw new Error(response.message || 'Error de autenticación')
      }
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    router.push("/auth/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
