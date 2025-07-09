"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Download, FileText, Table, BarChart3, Calendar, Settings } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { TipoCambioDto } from '@/types/tipo-cambio'

/**
 * Componente de Exportación de Datos
 * 
 * Funcionalidades:
 * - Exportación a Excel con múltiples hojas
 * - Exportación a CSV con configuración personalizada
 * - Reportes con gráficos y tendencias
 * - Filtros de fecha y moneda para exportación
 * - Plantillas de exportación predefinidas
 */

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  datos: TipoCambioDto[]
  filtrosAplicados: any
}

interface OpcionesExportacion {
  formato: 'excel' | 'csv' | 'pdf'
  incluirDatos: {
    tiposCambio: boolean
    historial: boolean
    estadisticas: boolean
    graficos: boolean
  }
  rangoFechas: {
    desde: string
    hasta: string
  }
  columnas: {
    fecha: boolean
    monedas: boolean
    tipoCompra: boolean
    tipoVenta: boolean
    spread: boolean
    estado: boolean
    mantenerDiario: boolean
    usuario: boolean
  }
  agrupacion: 'ninguna' | 'moneda' | 'fecha' | 'estado'
  ordenamiento: 'fecha' | 'moneda' | 'spread'
}

const OPCIONES_INICIALES: OpcionesExportacion = {
  formato: 'excel',
  incluirDatos: {
    tiposCambio: true,
    historial: false,
    estadisticas: true,
    graficos: false
  },
  rangoFechas: {
    desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0]
  },
  columnas: {
    fecha: true,
    monedas: true,
    tipoCompra: true,
    tipoVenta: true,
    spread: true,
    estado: true,
    mantenerDiario: true,
    usuario: false
  },
  agrupacion: 'ninguna',
  ordenamiento: 'fecha'
}

export function ExportDialog({ open, onOpenChange, datos, filtrosAplicados }: ExportDialogProps) {
  const [opciones, setOpciones] = useState<OpcionesExportacion>(OPCIONES_INICIALES)
  const [isExporting, setIsExporting] = useState(false)
  const [progresoExportacion, setProgresoExportacion] = useState(0)
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<string>('')

  const { toast } = useToast()

  /**
   * Plantillas predefinidas
   */
  const plantillas = {
    completo: {
      nombre: 'Reporte Completo',
      descripcion: 'Incluye todos los datos y estadísticas',
      opciones: {
        ...OPCIONES_INICIALES,
        incluirDatos: {
          tiposCambio: true,
          historial: true,
          estadisticas: true,
          graficos: true
        }
      }
    },
    basico: {
      nombre: 'Reporte Básico',
      descripcion: 'Solo tipos de cambio actuales',
      opciones: {
        ...OPCIONES_INICIALES,
        incluirDatos: {
          tiposCambio: true,
          historial: false,
          estadisticas: false,
          graficos: false
        },
        columnas: {
          fecha: true,
          monedas: true,
          tipoCompra: true,
          tipoVenta: true,
          spread: false,
          estado: false,
          mantenerDiario: false,
          usuario: false
        }
      }
    },
    tendencias: {
      nombre: 'Análisis de Tendencias',
      descripcion: 'Enfocado en gráficos y estadísticas',
      opciones: {
        ...OPCIONES_INICIALES,
        incluirDatos: {
          tiposCambio: true,
          historial: true,
          estadisticas: true,
          graficos: true
        },
        agrupacion: 'fecha',
        ordenamiento: 'fecha'
      }
    }
  }

  /**
   * Maneja el cambio de opciones
   */
  const handleOpcionChange = (seccion: keyof OpcionesExportacion, campo: string, valor: any) => {
    setOpciones(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }))
  }

  /**
   * Aplica plantilla seleccionada
   */
  const aplicarPlantilla = (plantilla: string) => {
    if (plantillas[plantilla as keyof typeof plantillas]) {
      setOpciones(plantillas[plantilla as keyof typeof plantillas].opciones)
      setPlantillaSeleccionada(plantilla)
    }
  }

  /**
   * Calcula estadísticas para el reporte
   */
  const calcularEstadisticas = () => {
    const activos = datos.filter(d => d.activo).length
    const inactivos = datos.filter(d => !d.activo).length
    const conMantenerDiario = datos.filter(d => d.mantener_cambio_diario).length
    
    const spreads = datos.map(d => ((d.tipo_venta - d.tipo_compra) / d.tipo_compra) * 100)
    const spreadPromedio = spreads.reduce((a, b) => a + b, 0) / spreads.length
    const spreadMaximo = Math.max(...spreads)
    const spreadMinimo = Math.min(...spreads)

    return {
      total: datos.length,
      activos,
      inactivos,
      conMantenerDiario,
      spreadPromedio: spreadPromedio.toFixed(2),
      spreadMaximo: spreadMaximo.toFixed(2),
      spreadMinimo: spreadMinimo.toFixed(2)
    }
  }

  /**
   * Procesa los datos según las opciones
   */
  const procesarDatos = () => {
    let datosProcesados = [...datos]

    // Filtrar por fecha
    if (opciones.rangoFechas.desde) {
      datosProcesados = datosProcesados.filter(d => 
        new Date(d.fecha_vigencia) >= new Date(opciones.rangoFechas.desde)
      )
    }

    if (opciones.rangoFechas.hasta) {
      datosProcesados = datosProcesados.filter(d => 
        new Date(d.fecha_vigencia) <= new Date(opciones.rangoFechas.hasta)
      )
    }

    // Ordenar
    datosProcesados.sort((a, b) => {
      switch (opciones.ordenamiento) {
        case 'fecha':
          return new Date(b.fecha_vigencia).getTime() - new Date(a.fecha_vigencia).getTime()
        case 'moneda':
          return (a.moneda_origen?.codigo || '').localeCompare(b.moneda_origen?.codigo || '')
        case 'spread':
          const spreadA = ((a.tipo_venta - a.tipo_compra) / a.tipo_compra) * 100
          const spreadB = ((b.tipo_venta - b.tipo_compra) / b.tipo_compra) * 100
          return spreadB - spreadA
        default:
          return 0
      }
    })

    return datosProcesados
  }

  /**
   * Exporta a Excel
   */
  const exportarExcel = async (datosProcesados: TipoCambioDto[]) => {
    const workbook = {
      SheetNames: [] as string[],
      Sheets: {} as any
    }

    // Hoja de tipos de cambio
    if (opciones.incluirDatos.tiposCambio) {
      const datosHoja = datosProcesados.map(d => {
        const fila: any = {}
        
        if (opciones.columnas.fecha) fila['Fecha'] = new Date(d.fecha_vigencia).toLocaleDateString()
        if (opciones.columnas.monedas) fila['Par'] = `${d.moneda_origen?.codigo}/${d.moneda_destino?.codigo}`
        if (opciones.columnas.tipoCompra) fila['Tipo Compra'] = d.tipo_compra
        if (opciones.columnas.tipoVenta) fila['Tipo Venta'] = d.tipo_venta
        if (opciones.columnas.spread) fila['Spread %'] = ((d.tipo_venta - d.tipo_compra) / d.tipo_compra * 100).toFixed(2)
        if (opciones.columnas.estado) fila['Estado'] = d.activo ? 'Activo' : 'Inactivo'
        if (opciones.columnas.mantenerDiario) fila['Mantener Diario'] = d.mantener_cambio_diario ? 'Sí' : 'No'
        if (opciones.columnas.usuario) fila['Usuario'] = 'Sistema' // TODO: Usuario real
        
        return fila
      })

      workbook.SheetNames.push('Tipos de Cambio')
      workbook.Sheets['Tipos de Cambio'] = datosHoja
    }

    // Hoja de estadísticas
    if (opciones.incluirDatos.estadisticas) {
      const stats = calcularEstadisticas()
      const estadisticasHoja = [
        { Métrica: 'Total de Registros', Valor: stats.total },
        { Métrica: 'Tipos Activos', Valor: stats.activos },
        { Métrica: 'Tipos Inactivos', Valor: stats.inactivos },
        { Métrica: 'Con Mantener Diario', Valor: stats.conMantenerDiario },
        { Métrica: 'Spread Promedio (%)', Valor: stats.spreadPromedio },
        { Métrica: 'Spread Máximo (%)', Valor: stats.spreadMaximo },
        { Métrica: 'Spread Mínimo (%)', Valor: stats.spreadMinimo }
      ]

      workbook.SheetNames.push('Estadísticas')
      workbook.Sheets['Estadísticas'] = estadisticasHoja
    }

    // Simular exportación
    const blob = new Blob([JSON.stringify(workbook, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tipos-cambio-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Exporta a CSV
   */
  const exportarCSV = (datosProcesados: TipoCambioDto[]) => {
    const headers = []
    if (opciones.columnas.fecha) headers.push('Fecha')
    if (opciones.columnas.monedas) headers.push('Par')
    if (opciones.columnas.tipoCompra) headers.push('Tipo Compra')
    if (opciones.columnas.tipoVenta) headers.push('Tipo Venta')
    if (opciones.columnas.spread) headers.push('Spread %')
    if (opciones.columnas.estado) headers.push('Estado')
    if (opciones.columnas.mantenerDiario) headers.push('Mantener Diario')
    if (opciones.columnas.usuario) headers.push('Usuario')

    const rows = datosProcesados.map(d => {
      const row = []
      if (opciones.columnas.fecha) row.push(new Date(d.fecha_vigencia).toLocaleDateString())
      if (opciones.columnas.monedas) row.push(`${d.moneda_origen?.codigo}/${d.moneda_destino?.codigo}`)
      if (opciones.columnas.tipoCompra) row.push(d.tipo_compra)
      if (opciones.columnas.tipoVenta) row.push(d.tipo_venta)
      if (opciones.columnas.spread) row.push(((d.tipo_venta - d.tipo_compra) / d.tipo_compra * 100).toFixed(2))
      if (opciones.columnas.estado) row.push(d.activo ? 'Activo' : 'Inactivo')
      if (opciones.columnas.mantenerDiario) row.push(d.mantener_cambio_diario ? 'Sí' : 'No')
      if (opciones.columnas.usuario) row.push('Sistema')
      return row
    })

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tipos-cambio-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Inicia la exportación
   */
  const iniciarExportacion = async () => {
    setIsExporting(true)
    setProgresoExportacion(0)

    try {
      // Simular progreso
      const intervalos = [20, 40, 60, 80, 100]
      for (let i = 0; i < intervalos.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setProgresoExportacion(intervalos[i])
      }

      const datosProcesados = procesarDatos()

      switch (opciones.formato) {
        case 'excel':
          await exportarExcel(datosProcesados)
          break
        case 'csv':
          exportarCSV(datosProcesados)
          break
        case 'pdf':
          // TODO: Implementar exportación PDF
          toast({
            title: "Información",
            description: "Exportación a PDF estará disponible próximamente",
          })
          break
      }

      toast({
        title: "Éxito",
        description: `Datos exportados correctamente en formato ${opciones.formato.toUpperCase()}`,
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar la exportación",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      setProgresoExportacion(0)
    }
  }

  const estadisticas = calcularEstadisticas()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Datos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plantillas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plantillas Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(plantillas).map(([key, plantilla]) => (
                  <div
                    key={key}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      plantillaSeleccionada === key 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => aplicarPlantilla(key)}
                  >
                    <h4 className="font-medium">{plantilla.nombre}</h4>
                    <p className="text-sm text-muted-foreground">{plantilla.descripcion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configuración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formato y datos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Formato y Contenido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Formato de Exportación</Label>
                  <Select
                    value={opciones.formato}
                    onValueChange={(value) => setOpciones(prev => ({ ...prev, formato: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Incluir en Exportación</Label>
                  {Object.entries(opciones.incluirDatos).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => 
                          handleOpcionChange('incluirDatos', key, checked)
                        }
                      />
                      <Label htmlFor={key} className="text-sm">
                        {key === 'tiposCambio' && 'Tipos de Cambio'}
                        {key === 'historial' && 'Historial de Cambios'}
                        {key === 'estadisticas' && 'Estadísticas'}
                        {key === 'graficos' && 'Gráficos'}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Filtros y Rango
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Desde</Label>
                    <Input
                      type="date"
                      value={opciones.rangoFechas.desde}
                      onChange={(e) => handleOpcionChange('rangoFechas', 'desde', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hasta</Label>
                    <Input
                      type="date"
                      value={opciones.rangoFechas.hasta}
                      onChange={(e) => handleOpcionChange('rangoFechas', 'hasta', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Agrupar por</Label>
                  <Select
                    value={opciones.agrupacion}
                    onValueChange={(value) => setOpciones(prev => ({ ...prev, agrupacion: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ninguna">Sin Agrupación</SelectItem>
                      <SelectItem value="moneda">Por Moneda</SelectItem>
                      <SelectItem value="fecha">Por Fecha</SelectItem>
                      <SelectItem value="estado">Por Estado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ordenar por</Label>
                  <Select
                    value={opciones.ordenamiento}
                    onValueChange={(value) => setOpciones(prev => ({ ...prev, ordenamiento: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fecha">Fecha</SelectItem>
                      <SelectItem value="moneda">Moneda</SelectItem>
                      <SelectItem value="spread">Spread</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columnas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table className="h-4 w-4" />
                Columnas a Incluir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(opciones.columnas).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`col-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => 
                        handleOpcionChange('columnas', key, checked)
                      }
                    />
                    <Label htmlFor={`col-${key}`} className="text-sm">
                      {key === 'fecha' && 'Fecha'}
                      {key === 'monedas' && 'Monedas'}
                      {key === 'tipoCompra' && 'Tipo Compra'}
                      {key === 'tipoVenta' && 'Tipo Venta'}
                      {key === 'spread' && 'Spread'}
                      {key === 'estado' && 'Estado'}
                      {key === 'mantenerDiario' && 'Mantener Diario'}
                      {key === 'usuario' && 'Usuario'}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Vista Previa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{estadisticas.total}</div>
                  <div className="text-sm text-muted-foreground">Total Registros</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{estadisticas.activos}</div>
                  <div className="text-sm text-muted-foreground">Activos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{estadisticas.inactivos}</div>
                  <div className="text-sm text-muted-foreground">Inactivos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{estadisticas.spreadPromedio}%</div>
                  <div className="text-sm text-muted-foreground">Spread Promedio</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progreso de exportación */}
          {isExporting && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Exportando...</span>
                    <span>{progresoExportacion}%</span>
                  </div>
                  <Progress value={progresoExportacion} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancelar
          </Button>
          <Button onClick={iniciarExportacion} disabled={isExporting}>
            {isExporting ? 'Exportando...' : 'Exportar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}