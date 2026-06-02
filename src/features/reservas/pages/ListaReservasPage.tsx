import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { useReservasStore } from '@/stores/reservasStore'
import { useHuespedesStore } from '@/stores/huespedesStore'
import { useHabitacionesStore } from '@/stores/habitacionesStore'

import type { EstadoReserva } from '@/domain/enums'
import { ETIQUETAS_ESTADO_RESERVA, ETIQUETAS_CANAL } from '@/domain/enums'
import { formatCLP } from '@/lib/formato'
import { rangoEstadia } from '@/lib/fechas'

import { EstadoReservaBadge } from '../components/EstadoReservaBadge'
import { Plus } from 'lucide-react'

export function ListaReservasPage() {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [estadosFiltrados, setEstadosFiltrados] = useState<EstadoReserva[]>([])
  const [pagina, setPagina] = useState(1)

  const reservas = useReservasStore((s) => s.reservas)
  const huespedes = useHuespedesStore((s) => s.huespedes)
  const habitaciones = useHabitacionesStore((s) => s.habitaciones)

  const huespedesMap = useMemo(() => new Map(huespedes.map((h) => [h.id, h])), [huespedes])
  const habitacionesMap = useMemo(() => new Map(habitaciones.map((h) => [h.id, h])), [habitaciones])

  const reservasFiltradas = useMemo(() => {
    return reservas.filter((r) => {
      const huesped = huespedesMap.get(r.huespedPrincipalId)
      const habitacion = habitacionesMap.get(r.habitacionId)

      const cumpleBusqueda =
        !busqueda ||
        r.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (huesped && (
          huesped.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          huesped.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
          (huesped.rut && huesped.rut.includes(busqueda))
        )) ||
        (habitacion && habitacion.numero.toString().includes(busqueda))

      const cumpleEstado = estadosFiltrados.length === 0 || estadosFiltrados.includes(r.estado)

      return cumpleBusqueda && cumpleEstado
    })
  }, [reservas, busqueda, estadosFiltrados, huespedesMap, habitacionesMap])

  const ITEMS_POR_PAGINA = 20
  const totalPaginas = Math.ceil(reservasFiltradas.length / ITEMS_POR_PAGINA)
  const inicio = (pagina - 1) * ITEMS_POR_PAGINA
  const reservasEnPagina = reservasFiltradas.slice(inicio, inicio + ITEMS_POR_PAGINA)

  const toggleEstado = (estado: EstadoReserva) => {
    setEstadosFiltrados((prev) =>
      prev.includes(estado) ? prev.filter((s) => s !== estado) : [...prev, estado]
    )
    setPagina(1)
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setEstadosFiltrados([])
    setPagina(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reservas</h1>
          <p className="text-muted-foreground mt-1">Gestión y seguimiento de reservas hoteleras</p>
        </div>
        <Button onClick={() => navigate('/reservas/nueva')} size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Reserva
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Filtros</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="busqueda">Búsqueda (Código, Huésped, RUT, Habitación)</Label>
            <Input
              id="busqueda"
              placeholder="Ej: TD-2026, María, 12345678-9"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setPagina(1)
              }}
            />
          </div>

          <div>
            <Label className="mb-2 block">Estados</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(Object.keys(ETIQUETAS_ESTADO_RESERVA) as EstadoReserva[]).map((estado) => (
                <button
                  key={estado}
                  onClick={() => toggleEstado(estado)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    estadosFiltrados.includes(estado)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {ETIQUETAS_ESTADO_RESERVA[estado]}
                </button>
              ))}
            </div>
          </div>

          {(busqueda || estadosFiltrados.length > 0) && (
            <Button onClick={limpiarFiltros} variant="outline" className="w-full">
              Limpiar filtros
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-6 overflow-x-auto">
        {reservasEnPagina.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {reservasFiltradas.length === 0
                ? 'No hay reservas que coincidan con los filtros.'
                : 'No hay más reservas en esta página.'}
            </p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-3 font-semibold">Código</th>
                  <th className="text-left py-3 px-3 font-semibold">Huésped</th>
                  <th className="text-left py-3 px-3 font-semibold">Habitación</th>
                  <th className="text-left py-3 px-3 font-semibold">Check-in/out</th>
                  <th className="text-left py-3 px-3 font-semibold">Estado</th>
                  <th className="text-right py-3 px-3 font-semibold">Total</th>
                  <th className="text-left py-3 px-3 font-semibold">Canal</th>
                  <th className="text-left py-3 px-3 font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody>
                {reservasEnPagina.map((r) => {
                  const huesped = huespedesMap.get(r.huespedPrincipalId)
                  const habitacion = habitacionesMap.get(r.habitacionId)

                  return (
                    <tr key={r.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-primary">{r.codigo}</td>
                      <td className="py-3 px-3">
                        {huesped ? (
                          <div>
                            <div className="font-medium">{huesped.nombre} {huesped.apellido}</div>
                            <div className="text-xs text-muted-foreground">{huesped.email}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {habitacion ? `Nº ${habitacion.numero} (Piso ${habitacion.piso})` : '-'}
                      </td>
                      <td className="py-3 px-3 text-xs">
                        {rangoEstadia(r.fechaIngreso, r.fechaSalida)}
                      </td>
                      <td className="py-3 px-3">
                        <EstadoReservaBadge estado={r.estado} />
                      </td>
                      <td className="py-3 px-3 text-right font-semibold">{formatCLP(r.totalCLP)}</td>
                      <td className="py-3 px-3">
                        <Badge variant="outline">{ETIQUETAS_CANAL[r.canal]}</Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Button
                          onClick={() => navigate(`/reservas/${r.id}`)}
                          variant="ghost"
                          size="sm"
                        >
                          Ver
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Mostrando {inicio + 1}–{Math.min(inicio + ITEMS_POR_PAGINA, reservasFiltradas.length)} de {reservasFiltradas.length}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  variant="outline"
                  size="sm"
                >
                  ← Anterior
                </Button>
                <div className="text-sm font-medium py-2 px-3">
                  Página {pagina} de {totalPaginas}
                </div>
                <Button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  variant="outline"
                  size="sm"
                >
                  Siguiente →
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
