"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Search, Eye, Edit, Trash2, User, Building, FileText } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/utils/format"
import { clienteService } from "@/services/cliente-service"
import { ClienteCreateDialog } from "@/components/clientes/cliente-create-dialog"
import { ClienteViewDialog } from "@/components/clientes/cliente-view-dialog"
import type { ClienteDto } from "@/types/cliente"
import { TipoCliente } from "@/types/enums"

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<ClienteDto | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    try {
      setIsLoading(true)
      const response = await clienteService.getAll()
      setClientes(response.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadClientes()
      return
    }

    try {
      setIsLoading(true)
      const response = await clienteService.buscar({
        nombres: searchTerm,
        apellido_paterno: searchTerm,
        apellido_materno: searchTerm,
        numero_documento: searchTerm,
        ruc: searchTerm,
        razon_social: searchTerm,
        limit: 50
      })
      setClientes(response.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Error en la búsqueda",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (cliente: ClienteDto) => {
    try {
      await clienteService.delete(cliente.id)
      toast({
        title: "Éxito",
        description: "Cliente eliminado correctamente",
      })
      loadClientes()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      })
    }
  }

  const handleView = (cliente: ClienteDto) => {
    setSelectedCliente(cliente)
    setViewDialogOpen(true)
  }

  const getTipoClienteBadge = (tipo: TipoCliente) => {
    switch (tipo) {
      case TipoCliente.REGISTRADO:
        return <Badge className="bg-blue-500">Registrado</Badge>
      case TipoCliente.OTRO:
        return <Badge variant="outline">Ocasional</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getClienteNombre = (cliente: ClienteDto) => {
    if (cliente.tipo_cliente === TipoCliente.REGISTRADO && cliente.razon_social) {
      return cliente.razon_social
    }
    if (cliente.persona) {
      return `${cliente.persona.nombres} ${cliente.persona.apellido_paterno} ${cliente.persona.apellido_materno}`
    }
    return cliente.descripcion || "Sin nombre"
  }

  const getClienteIcon = (tipo: TipoCliente) => {
    switch (tipo) {
      case TipoCliente.REGISTRADO:
        return <Building className="h-4 w-4" />
      case TipoCliente.OTRO:
        return <FileText className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const filteredClientes = clientes.filter((cliente) => {
    if (!searchTerm) return true
    const nombre = getClienteNombre(cliente).toLowerCase()
    const documento = cliente.persona?.numero_documento || ""
    const ruc = cliente.ruc || ""
    const search = searchTerm.toLowerCase()
    return nombre.includes(search) || documento.includes(search) || ruc.includes(search)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona los clientes registrados y ocasionales
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar Clientes</CardTitle>
          <CardDescription>
            Busca por nombre, documento, RUC o razón social
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados ({filteredClientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron clientes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Documento/RUC</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getClienteIcon(cliente.tipo_cliente)}
                          {getTipoClienteBadge(cliente.tipo_cliente)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getClienteNombre(cliente)}</p>
                          {cliente.descripcion && (
                            <p className="text-sm text-muted-foreground">{cliente.descripcion}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {cliente.tipo_cliente === TipoCliente.REGISTRADO && cliente.ruc && (
                            <p className="text-sm font-mono">RUC: {cliente.ruc}</p>
                          )}
                          {cliente.persona && (
                            <p className="text-sm font-mono">
                              {cliente.persona.tipo_documento}: {cliente.persona.numero_documento}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {cliente.persona?.numero_telefono && (
                          <p className="text-sm">{cliente.persona.numero_telefono}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{formatDate(cliente.created_at)}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(cliente)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar Cliente</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(cliente)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ClienteCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadClientes}
      />

      <ClienteViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        cliente={selectedCliente}
      />
    </div>
  )
}