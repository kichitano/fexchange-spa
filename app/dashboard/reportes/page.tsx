"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Download, FileText, Filter, BarChart3, PieChart, DollarSign, TrendingUp } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, formatDate, formatDateTime } from "@/utils/format"
import { casaDeCambioService } from "@/services/casa-cambio-service"
import { ventanillaService } from "@/services/ventanilla-service"
import { reporteService } from "@/services/reporte-service"
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { CasaDeCambioDto } from "@/types/casa-cambio"
import type { VentanillaDto } from "@/types/ventanilla"
import type { ReporteGananciasDto, TipoReporte } from "@/types/reporte"

interface ReporteData {
  resumen: {
    totalTransacciones: number
    montoTotal: number
    gananciaTotal: number
    transaccionesPorDia: number
  }
  graficos: {
    transaccionesPorFecha: Array<{ fecha: string; cantidad: number; monto: number }>
    transaccionesPorMoneda: Array<{ moneda: string; cantidad: number; monto: number }>
    transaccionesPorVentanilla: Array<{ ventanilla: string; cantidad: number; monto: number }>
    gananciaPorFecha: Array<{ fecha: string; ganancia: number }>
  }
  detalles: Array<{
    numeroTransaccion: string
    fecha: string
    cliente: string
    ventanilla: string
    monedaOrigen: string
    monedaDestino: string
    montoOrigen: number
    montoDestino: number
    tipoCambio: number
    ganancia: number
  }>
}

export default function ReportesPage() {
  const [casasDeCambio, setCasasDeCambio] = useState<CasaDeCambioDto[]>([])
  const [ventanillas, setVentanillas] = useState<VentanillaDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [reporteData, setReporteData] = useState<ReporteData | null>(null)
  const [reporteGanancias, setReporteGanancias] = useState<ReporteGananciasDto | null>(null)
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>("SEMANAL" as TipoReporte)
  const { toast } = useToast()

  // Filtros
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [casaSeleccionada, setCasaSeleccionada] = useState("")
  const [ventanillaSeleccionada, setVentanillaSeleccionada] = useState("0")

  useEffect(() => {
    loadInitialData()
    
    // Establecer fechas por defecto (última semana)
    const hoy = new Date()
    const hace7Dias = new Date()
    hace7Dias.setDate(hoy.getDate() - 7)
    
    setFechaFin(hoy.toISOString().split('T')[0])
    setFechaInicio(hace7Dias.toISOString().split('T')[0])
  }, [])

  const loadInitialData = async () => {
    try {
      const [casasResponse, ventanillasResponse] = await Promise.all([
        casaDeCambioService.getAll(),
        ventanillaService.getAll(),
      ])

      setCasasDeCambio(casasResponse.data || [])
      setVentanillas(ventanillasResponse.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos iniciales",
        variant: "destructive",
      })
    }
  }

  const generarReporte = async () => {
    if (!fechaInicio || !fechaFin || !casaSeleccionada) {
      toast({
        title: "Error",
        description: "Debe seleccionar fechas y casa de cambio",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const reporte = await reporteService.generarReporteGanancias({
        tipo: tipoReporte,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        casa_de_cambio_id: parseInt(casaSeleccionada),
        ventanilla_id: ventanillaSeleccionada && ventanillaSeleccionada !== "0" ? parseInt(ventanillaSeleccionada) : undefined
      })

      setReporteGanancias(reporte)

      // Convertir datos para el formato existente
      const reporteSimulado: ReporteData = {
        resumen: {
          totalTransacciones: reporte.total_transacciones,
          montoTotal: reporte.monto_total_operado,
          gananciaTotal: reporte.ganancia_total,
          transaccionesPorDia: Math.round(reporte.total_transacciones / 7),
        },
        graficos: {
          transaccionesPorFecha: reporte.transacciones_por_dia?.map(t => ({
            fecha: t.fecha.toString(),
            cantidad: t.total_transacciones,
            monto: t.monto_operado
          })) || [],
          transaccionesPorMoneda: reporte.monedas?.map(m => ({
            moneda: m.moneda_codigo,
            cantidad: m.total_transacciones,
            monto: m.monto_origen + m.monto_destino
          })) || [],
          transaccionesPorVentanilla: reporte.ventanillas?.map(v => ({
            ventanilla: v.ventanilla_nombre,
            cantidad: v.total_transacciones,
            monto: v.monto_operado
          })) || [],
          gananciaPorFecha: reporte.transacciones_por_dia?.map(t => ({
            fecha: t.fecha.toString(),
            ganancia: t.ganancia
          })) || [],
        },
        detalles: [] // Se puede implementar más tarde con otro endpoint
      }

      setReporteData(reporteSimulado)

      toast({
        title: "Éxito",
        description: "Reporte generado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportarReporte = (formato: 'pdf' | 'excel' | 'csv') => {
    toast({
      title: "Exportando...",
      description: `Preparando archivo ${formato.toUpperCase()}`,
    })
    
    // Aquí implementarías la lógica real de exportación
    setTimeout(() => {
      toast({
        title: "Éxito",
        description: `Reporte exportado como ${formato.toUpperCase()}`,
      })
    }, 2000)
  }

  const ventanillasFiltradas = ventanillas.filter(v => 
    !casaSeleccionada || v.casa_de_cambio_id.toString() === casaSeleccionada
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">
          Genera reportes detallados de transacciones y actividad
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Reporte
          </CardTitle>
          <CardDescription>
            Configure los parámetros para generar el reporte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha Inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha Fin</Label>
              <Input
                id="fechaFin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Reporte</Label>
              <Select value={tipoReporte} onValueChange={(value) => setTipoReporte(value as TipoReporte)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DIARIO">Diario</SelectItem>
                  <SelectItem value="SEMANAL">Semanal</SelectItem>
                  <SelectItem value="MENSUAL">Mensual</SelectItem>
                  <SelectItem value="ANUAL">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="casa">Casa de Cambio *</Label>
              <Select value={casaSeleccionada} onValueChange={setCasaSeleccionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar casa" />
                </SelectTrigger>
                <SelectContent>
                  {casasDeCambio.map((casa) => (
                    <SelectItem key={casa.id} value={casa.id.toString()}>
                      {casa.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ventanilla">Ventanilla</Label>
              <Select value={ventanillaSeleccionada} onValueChange={setVentanillaSeleccionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las ventanillas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todas las ventanillas</SelectItem>
                  {ventanillasFiltradas.map((ventanilla) => (
                    <SelectItem key={ventanilla.id} value={ventanilla.id.toString()}>
                      {ventanilla.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generarReporte} disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Generando...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generar Reporte
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados del Reporte */}
      {reporteData && (
        <>
          {/* Resumen */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transacciones</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reporteData.resumen.totalTransacciones}</div>
                <p className="text-xs text-muted-foreground">
                  Promedio: {reporteData.resumen.transaccionesPorDia} por día
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(reporteData.resumen.montoTotal, "PEN")}
                </div>
                <p className="text-xs text-muted-foreground">En todas las monedas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ganancia Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(reporteData.resumen.gananciaTotal, "PEN")}
                </div>
                <p className="text-xs text-muted-foreground">Margen de ganancia</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Acciones</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => exportarReporte('pdf')}
                >
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => exportarReporte('excel')}
                >
                  Excel
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Transacciones por Fecha</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reporteData.graficos.transaccionesPorFecha}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" tickFormatter={(value) => formatDate(value)} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => formatDate(value)} />
                    <Bar dataKey="cantidad" fill="#8884d8" name="Transacciones" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ganancia por Fecha</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reporteData.graficos.gananciaPorFecha}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" tickFormatter={(value) => formatDate(value)} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => formatDate(value)}
                      formatter={(value) => [formatCurrency(value as number, "PEN"), "Ganancia"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ganancia" 
                      stroke="#82ca9d" 
                      strokeWidth={3}
                      dot={{ fill: "#82ca9d", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transacciones por Moneda</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip formatter={(value, name) => [`${value} transacciones`, name]} />
                    <Pie
                      data={reporteData.graficos.transaccionesPorMoneda}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="cantidad"
                      nameKey="moneda"
                    >
                      {reporteData.graficos.transaccionesPorMoneda.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][index % 4]}
                        />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad por Ventanilla</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reporteData.graficos.transaccionesPorVentanilla}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ventanilla" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="#82ca9d" name="Transacciones" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Detalles */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Transacciones</CardTitle>
              <CardDescription>
                Últimas {reporteData.detalles.length} transacciones del período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Número</th>
                      <th className="text-left p-2">Fecha</th>
                      <th className="text-left p-2">Cliente</th>
                      <th className="text-left p-2">Ventanilla</th>
                      <th className="text-left p-2">Conversión</th>
                      <th className="text-left p-2">T.C.</th>
                      <th className="text-left p-2">Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporteData.detalles.map((detalle, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-mono text-xs">{detalle.numeroTransaccion}</td>
                        <td className="p-2">{formatDate(detalle.fecha)}</td>
                        <td className="p-2">{detalle.cliente}</td>
                        <td className="p-2">{detalle.ventanilla}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-1 text-xs">
                            <Badge variant="outline">{detalle.monedaOrigen}</Badge>
                            <span>→</span>
                            <Badge variant="outline">{detalle.monedaDestino}</Badge>
                          </div>
                        </td>
                        <td className="p-2 font-mono text-xs">{detalle.tipoCambio.toFixed(4)}</td>
                        <td className="p-2 text-green-600 font-medium">
                          {formatCurrency(detalle.ganancia, "PEN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}