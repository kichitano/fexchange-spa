"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Filter, X, Search, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { monedaService } from '@/services/moneda-service'
import type { MonedaDto } from '@/types/moneda'

/**
 * Componente de Filtros Avanzados para Tipos de Cambio
 * 
 * Funcionalidades:
 * - Filtros por estado (activo/inactivo)
 * - Filtros por moneda específica
 * - Rangos de valores para tipos de cambio
 * - Búsqueda por texto
 * - Filtros por fecha de vigencia
 * - Filtros por diferencia de spread
 * - Guardado de filtros favoritos
 */

export interface FiltrosAvanzados {
  busqueda: string
  estado: 'todos' | 'activo' | 'inactivo'
  monedaOrigenId: number | null
  monedaDestinoId: number | null
  rangoCompra: [number, number]
  rangoVenta: [number, number]
  fechaDesde: string
  fechaHasta: string
  spreadMinimo: number
  spreadMaximo: number
  soloMantenerDiario: boolean
  ordenarPor: 'fecha_desc' | 'fecha_asc' | 'compra_desc' | 'compra_asc' | 'venta_desc' | 'venta_asc' | 'spread_desc' | 'spread_asc'
}

interface FiltrosAvanzadosProps {
  filtros: FiltrosAvanzados
  onFiltrosChange: (filtros: FiltrosAvanzados) => void
  totalRegistros: number
  registrosFiltrados: number
}

const FILTROS_INICIALES: FiltrosAvanzados = {
  busqueda: '',
  estado: 'todos',
  monedaOrigenId: null,
  monedaDestinoId: null,
  rangoCompra: [0, 100],
  rangoVenta: [0, 100],
  fechaDesde: '',
  fechaHasta: '',
  spreadMinimo: 0,
  spreadMaximo: 10,
  soloMantenerDiario: false,
  ordenarPor: 'fecha_desc'
}

export function FiltrosAvanzados({ 
  filtros, 
  onFiltrosChange, 
  totalRegistros, 
  registrosFiltrados 
}: FiltrosAvanzadosProps) {
  const [monedas, setMonedas] = useState<MonedaDto[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [filtrosGuardados, setFiltrosGuardados] = useState<{name: string, filtros: FiltrosAvanzados}[]>([])

  /**
   * Carga las monedas disponibles
   */
  useEffect(() => {
    const cargarMonedas = async () => {
      try {
        const response = await monedaService.getAll()
        if (response.data) {
          setMonedas(response.data)
        }
      } catch (error) {
        console.error('Error cargando monedas:', error)
      }
    }
    cargarMonedas()
  }, [])

  /**
   * Carga filtros guardados del localStorage
   */
  useEffect(() => {
    const saved = localStorage.getItem('filtros-tipos-cambio')
    if (saved) {
      try {
        setFiltrosGuardados(JSON.parse(saved))
      } catch (error) {
        console.error('Error cargando filtros guardados:', error)
      }
    }
  }, [])

  /**
   * Maneja el cambio de filtros
   */
  const handleFiltroChange = (campo: keyof FiltrosAvanzados, valor: any) => {
    onFiltrosChange({
      ...filtros,
      [campo]: valor
    })
  }

  /**
   * Limpia todos los filtros
   */
  const limpiarFiltros = () => {
    onFiltrosChange(FILTROS_INICIALES)
  }

  /**
   * Guarda filtros actuales
   */
  const guardarFiltros = () => {
    const nombre = prompt('Nombre para estos filtros:')
    if (!nombre) return

    const nuevosFiltros = [...filtrosGuardados, { name: nombre, filtros }]
    setFiltrosGuardados(nuevosFiltros)
    localStorage.setItem('filtros-tipos-cambio', JSON.stringify(nuevosFiltros))
  }

  /**
   * Carga filtros guardados
   */
  const cargarFiltrosGuardados = (filtrosSaved: FiltrosAvanzados) => {
    onFiltrosChange(filtrosSaved)
  }

  /**
   * Elimina filtros guardados
   */
  const eliminarFiltrosGuardados = (index: number) => {
    const nuevosFiltros = filtrosGuardados.filter((_, i) => i !== index)
    setFiltrosGuardados(nuevosFiltros)
    localStorage.setItem('filtros-tipos-cambio', JSON.stringify(nuevosFiltros))
  }

  /**
   * Cuenta filtros activos
   */
  const contarFiltrosActivos = (): number => {
    let count = 0
    if (filtros.busqueda) count++
    if (filtros.estado !== 'todos') count++
    if (filtros.monedaOrigenId) count++
    if (filtros.monedaDestinoId) count++
    if (filtros.rangoCompra[0] > 0 || filtros.rangoCompra[1] < 100) count++
    if (filtros.rangoVenta[0] > 0 || filtros.rangoVenta[1] < 100) count++
    if (filtros.fechaDesde || filtros.fechaHasta) count++
    if (filtros.spreadMinimo > 0 || filtros.spreadMaximo < 10) count++
    if (filtros.soloMantenerDiario) count++
    return count
  }

  /**
   * Obtiene el nombre de la moneda
   */
  const getNombreMoneda = (id: number) => {
    const moneda = monedas.find(m => m.id === id)
    return moneda ? `${moneda.codigo} - ${moneda.nombre}` : ''
  }

  const filtrosActivos = contarFiltrosActivos()
  const porcentajeFiltrado = totalRegistros > 0 ? (registrosFiltrados / totalRegistros) * 100 : 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avanzados
            {filtrosActivos > 0 && (
              <Badge variant="secondary">{filtrosActivos} activos</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {isExpanded ? 'Contraer' : 'Expandir'}
              {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros básicos siempre visibles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Búsqueda</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por moneda, código..."
                value={filtros.busqueda}
                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={filtros.estado}
              onValueChange={(value) => handleFiltroChange('estado', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Solo Activos</SelectItem>
                <SelectItem value="inactivo">Solo Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ordenar por</Label>
            <Select
              value={filtros.ordenarPor}
              onValueChange={(value) => handleFiltroChange('ordenarPor', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fecha_desc">Fecha (Más reciente)</SelectItem>
                <SelectItem value="fecha_asc">Fecha (Más antigua)</SelectItem>
                <SelectItem value="compra_desc">Compra (Mayor a menor)</SelectItem>
                <SelectItem value="compra_asc">Compra (Menor a mayor)</SelectItem>
                <SelectItem value="venta_desc">Venta (Mayor a menor)</SelectItem>
                <SelectItem value="venta_asc">Venta (Menor a mayor)</SelectItem>
                <SelectItem value="spread_desc">Spread (Mayor a menor)</SelectItem>
                <SelectItem value="spread_asc">Spread (Menor a mayor)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estadísticas de filtrado */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Mostrando {registrosFiltrados} de {totalRegistros} registros</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${porcentajeFiltrado}%` }}
              />
            </div>
            <span>{porcentajeFiltrado.toFixed(1)}%</span>
          </div>
        </div>

        {/* Filtros avanzados colapsables */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            <Separator />
            
            {/* Filtros por moneda */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Moneda Origen</Label>
                <Select
                  value={filtros.monedaOrigenId?.toString() || ''}
                  onValueChange={(value) => handleFiltroChange('monedaOrigenId', value ? parseInt(value) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las monedas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las monedas</SelectItem>
                    {monedas.map((moneda) => (
                      <SelectItem key={moneda.id} value={moneda.id.toString()}>
                        {getNombreMoneda(moneda.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Moneda Destino</Label>
                <Select
                  value={filtros.monedaDestinoId?.toString() || ''}
                  onValueChange={(value) => handleFiltroChange('monedaDestinoId', value ? parseInt(value) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las monedas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las monedas</SelectItem>
                    {monedas.map((moneda) => (
                      <SelectItem key={moneda.id} value={moneda.id.toString()}>
                        {getNombreMoneda(moneda.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Rangos de valores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Rango Tipo Compra: {filtros.rangoCompra[0]} - {filtros.rangoCompra[1]}</Label>
                <Slider
                  value={filtros.rangoCompra}
                  onValueChange={(value) => handleFiltroChange('rangoCompra', value)}
                  min={0}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label>Rango Tipo Venta: {filtros.rangoVenta[0]} - {filtros.rangoVenta[1]}</Label>
                <Slider
                  value={filtros.rangoVenta}
                  onValueChange={(value) => handleFiltroChange('rangoVenta', value)}
                  min={0}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Filtros por fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Desde</Label>
                <Input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha Hasta</Label>
                <Input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                />
              </div>
            </div>

            {/* Filtro por spread */}
            <div className="space-y-3">
              <Label>Rango de Spread: {filtros.spreadMinimo}% - {filtros.spreadMaximo}%</Label>
              <Slider
                value={[filtros.spreadMinimo, filtros.spreadMaximo]}
                onValueChange={(value) => {
                  handleFiltroChange('spreadMinimo', value[0])
                  handleFiltroChange('spreadMaximo', value[1])
                }}
                min={0}
                max={20}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Filtros adicionales */}
            <div className="flex items-center space-x-2">
              <Switch
                id="mantener-diario"
                checked={filtros.soloMantenerDiario}
                onCheckedChange={(checked) => handleFiltroChange('soloMantenerDiario', checked)}
              />
              <Label htmlFor="mantener-diario">Solo tipos con "Mantener Diario"</Label>
            </div>

            {/* Filtros guardados */}
            {filtrosGuardados.length > 0 && (
              <div className="space-y-2">
                <Label>Filtros Guardados</Label>
                <div className="flex flex-wrap gap-2">
                  {filtrosGuardados.map((filtro, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => cargarFiltrosGuardados(filtro.filtros)}
                      >
                        {filtro.name}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarFiltrosGuardados(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Acciones */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={limpiarFiltros}>
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
            <Button variant="outline" onClick={guardarFiltros}>
              Guardar Filtros
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {filtrosActivos > 0 && `${filtrosActivos} filtro${filtrosActivos > 1 ? 's' : ''} aplicado${filtrosActivos > 1 ? 's' : ''}`}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}