"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, CreditCard, TrendingUp, DollarSign, Activity, BarChart3, PieChart } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatCurrency } from "@/utils/format"
import { TablaTiposCambioRapida } from "@/components/tipos-cambio/quick-exchange-rates-table"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DashboardStats {
  totalCasasDeCambio: number
  totalUsuarios: number
  totalTransacciones: number
  gananciaTotal: number
  transaccionesHoy: number
  ventanillasActivas: number
}

interface ChartData {
  transaccionesPorDia: Array<{ fecha: string; transacciones: number; ganancia: number }>
  transaccionesPorMoneda: Array<{ moneda: string; cantidad: number; porcentaje: number }>
  ventanillasPorCasa: Array<{ casa: string; ventanillas: number; transacciones: number }>
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga de estadísticas
    const loadStats = async () => {
      try {
        // Aquí harías las llamadas reales a tu API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setStats({
          totalCasasDeCambio: 3,
          totalUsuarios: 12,
          totalTransacciones: 1247,
          gananciaTotal: 15420.5,
          transaccionesHoy: 23,
          ventanillasActivas: 8,
        })

        // Datos simulados para gráficos
        setChartData({
          transaccionesPorDia: [
            { fecha: "Lun", transacciones: 24, ganancia: 850 },
            { fecha: "Mar", transacciones: 31, ganancia: 1200 },
            { fecha: "Mié", transacciones: 18, ganancia: 650 },
            { fecha: "Jue", transacciones: 42, ganancia: 1580 },
            { fecha: "Vie", transacciones: 38, ganancia: 1350 },
            { fecha: "Sáb", transacciones: 28, ganancia: 950 },
            { fecha: "Dom", transacciones: 15, ganancia: 480 },
          ],
          transaccionesPorMoneda: [
            { moneda: "USD", cantidad: 450, porcentaje: 36 },
            { moneda: "EUR", cantidad: 320, porcentaje: 26 },
            { moneda: "PEN", cantidad: 280, porcentaje: 22 },
            { moneda: "BRL", cantidad: 140, porcentaje: 11 },
            { moneda: "COP", cantidad: 60, porcentaje: 5 },
          ],
          ventanillasPorCasa: [
            { casa: "Casa A", ventanillas: 4, transacciones: 520 },
            { casa: "Casa B", ventanillas: 3, transacciones: 380 },
            { casa: "Casa C", ventanillas: 2, transacciones: 200 },
          ],
        })
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido de vuelta, {user?.persona?.nombres} {user?.persona?.apellido_paterno}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casas de Cambio</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCasasDeCambio}</div>
            <p className="text-xs text-muted-foreground">Total registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsuarios}</div>
            <p className="text-xs text-muted-foreground">En el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTransacciones}</div>
            <p className="text-xs text-muted-foreground">Total procesadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.gananciaTotal || 0, "PEN")}</div>
            <p className="text-xs text-muted-foreground">En moneda maestra</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.transaccionesHoy}</div>
            <p className="text-xs text-muted-foreground">+12% desde ayer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventanillas Activas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.ventanillasActivas}</div>
            <p className="text-xs text-muted-foreground">Operando ahora</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Acciones más comunes del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Nueva Transacción</span>
              <Badge variant="secondary">Ctrl+N</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Aperturar Ventanilla</span>
              <Badge variant="secondary">Ctrl+A</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Ver Reportes</span>
              <Badge variant="secondary">Ctrl+R</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>Información general del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Estado del Servidor</span>
              <Badge variant="default" className="bg-green-500">
                Activo
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Base de Datos</span>
              <Badge variant="default" className="bg-green-500">
                Conectada
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Última Actualización</span>
              <Badge variant="outline">Hace 2 min</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exchange Rates Table */}
      <TablaTiposCambioRapida />

      {/* Charts Section */}
      {chartData && (
        <>
          {/* Transacciones por Día */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Transacciones por Día
                </CardTitle>
                <CardDescription>Última semana</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.transaccionesPorDia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="transacciones"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Ganancias por Día
                </CardTitle>
                <CardDescription>Última semana en PEN</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.transaccionesPorDia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${formatCurrency(value as number, "PEN")}`, "Ganancia"]} />
                    <Line
                      type="monotone"
                      dataKey="ganancia"
                      stroke="#82ca9d"
                      strokeWidth={3}
                      dot={{ fill: "#82ca9d", r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Distribución por Moneda y Ventanillas */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Transacciones por Moneda
                </CardTitle>
                <CardDescription>Distribución del último mes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip formatter={(value, name) => [`${value} transacciones`, name]} />
                    <Pie
                      data={chartData.transaccionesPorMoneda}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="cantidad"
                    >
                      {chartData.transaccionesPorMoneda.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"][index % 5]}
                        />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {chartData.transaccionesPorMoneda.map((item, index) => (
                    <div key={item.moneda} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"][index % 5],
                          }}
                        />
                        <span>{item.moneda}</span>
                      </div>
                      <span className="font-medium">{item.cantidad} ({item.porcentaje}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Actividad por Casa de Cambio
                </CardTitle>
                <CardDescription>Ventanillas y transacciones</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.ventanillasPorCasa}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="casa" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="ventanillas" fill="#8884d8" name="Ventanillas" />
                    <Bar dataKey="transacciones" fill="#82ca9d" name="Transacciones" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
