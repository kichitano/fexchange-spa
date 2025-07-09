"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Building2,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Home,
  Store,
  UserCheck,
  Coins,
  Plus,
  Eye,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useVentanilla } from "@/contexts/ventanilla-context"
import { RolUsuario } from "@/types/enums"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: RolUsuario[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Casas de Cambio",
    href: "/dashboard/casas-cambio",
    icon: Building2,
    roles: [RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR],
  },
  {
    title: "Ventanillas",
    href: "/dashboard/ventanillas",
    icon: Store,
  },
  {
    title: "Personas",
    href: "/dashboard/personas",
    icon: Users,
    roles: [RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR],
  },
  {
    title: "Usuarios",
    href: "/dashboard/usuarios",
    icon: Users,
    roles: [RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR],
  },
  {
    title: "Clientes",
    href: "/dashboard/clientes",
    icon: UserCheck,
  },
  {
    title: "Transacciones",
    href: "/dashboard/transacciones",
    icon: Eye,
  },
  {
    title: "Monedas",
    href: "/dashboard/monedas",
    icon: Coins,
    roles: [RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR],
  },
  {
    title: "Tipos de Cambio",
    href: "/dashboard/tipos-cambio",
    icon: TrendingUp,
    roles: [RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR],
  },
  {
    title: "Reportes",
    href: "/dashboard/reportes",
    icon: BarChart3,
  },
  {
    title: "Configuración",
    href: "/dashboard/configuracion",
    icon: Settings,
    roles: [RolUsuario.ADMINISTRADOR_MAESTRO, RolUsuario.ADMINISTRADOR],
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()
  const { isVentanillaAbierta, isSidebarCollapsed } = useVentanilla()
  
  // Cuando hay ventanilla abierta, el sidebar debe estar colapsado y no expandible
  const effectiveCollapsed = isVentanillaAbierta ? true : collapsed
  const canToggleCollapse = !isVentanillaAbierta

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(user?.rol as RolUsuario)
  })

  return (
    <div
      className={cn("flex flex-col border-r bg-card transition-all duration-300 h-screen", effectiveCollapsed ? "w-16" : "w-64")}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b flex-shrink-0">
        {!effectiveCollapsed && (
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-semibold">Casa de Cambio</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => canToggleCollapse && setCollapsed(!collapsed)} 
          className={`h-8 w-8 p-0 ${!canToggleCollapse ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!canToggleCollapse}
        >
          {effectiveCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn("w-full justify-start gap-3", effectiveCollapsed && "px-2")}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!effectiveCollapsed && <span>{item.title}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User Info */}
      {!effectiveCollapsed && user && (
        <div className="border-t p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {user.persona?.nombres?.charAt(0)}
                {user.persona?.apellido_paterno?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.persona?.nombres} {user.persona?.apellido_paterno} {user.persona?.apellido_materno}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.rol.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
