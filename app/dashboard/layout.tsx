"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { VentanillaProvider } from "@/contexts/ventanilla-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return null // El AuthProvider redirigirá al login
  }

  return (
    <VentanillaProvider>
      <div className="h-screen bg-background overflow-hidden">
        <div className="flex h-full">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 p-6 overflow-y-auto">{children}</main>
          </div>
        </div>
      </div>
    </VentanillaProvider>
  )
}
