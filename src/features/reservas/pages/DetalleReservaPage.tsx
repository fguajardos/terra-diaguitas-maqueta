import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

import { useReservasStore } from '@/stores/reservasStore'
import { useHuespedesStore } from '@/stores/huespedesStore'
import { useHabitacionesStore } from '@/stores/habitacionesStore'
import { useTrazabilidadStore } from '@/stores/trazabilidadStore'
import { cancelarReservaYLiberarHabitacion } from '@/services/reservasCoordinationService'

import { ETIQUETAS_TIPO_HABITACION } from '@/domain/enums'
import { formatCLP, obtenerIniciales } from '@/lib/formato'
import { rangoEstadia, fechaHora, hoyISO } from '@/lib/fechas'

import { EstadoReservaBadge } from '../components/EstadoReservaBadge'
import { TimelineBitacora } from '../components/TimelineBitacora'
import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-react'

export function DetalleReservaPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false)
  const [motivoCancelacion, setMotivoCancelacion] = useState('')

  const reserva = useReservasStore((s) => (id ? s.porId(id) : undefined))
  const cambiarEstado = useReservasStore((s) => s.cambiarEstado)

  const huesped = useHuespedesStore((s) => (reserva ? s.porId(reserva.huespedPrincipalId) : undefined))
  const habitacion = useHabitacionesStore((s) => (reserva ? s.porId(reserva.habitacionId) : undefined))
  const eventos = useTrazabilidadStore((s) =>
    reserva ? s.eventosPorEntidad('reserva', reserva.id) : []
  )

  if (!reserva) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-muted-foreground mb-4">Reserva no encontrada</p>
        <Button onClick={() => navigate('/reservas')}>Volver a reservas</Button>
      </div>
    )
  }

  const handleCancelar = () => {
    if (!motivoCancelacion.trim()) {
      toast.error('Debe indicar un motivo de cancelación')
      return
    }

    if (!habitacion) {
      toast.error('Habitación no encontrada')
      return
    }

    // Operación atómica: cancela reserva Y libera habitación
    const resultado = cancelarReservaYLiberarHabitacion(
      reserva.id,
      habitacion.id,
      motivoCancelacion,
    )

    if (resultado.ok) {
      toast.success('Reserva cancelada exitosamente')
      setMostrarModalCancelar(false)
      navigate('/reservas')
    } else {
      toast.error(resultado.motivo || 'No se pudo cancelar la reserva')
    }
  }

  const puedeHacerCheckIn = () => {
    return ['confirmada', 'pagada'].includes(reserva.estado) && reserva.fechaIngreso <= hoyISO()
  }

  const puedeHacerCheckOut = () => {
    return reserva.estado === 'check_in_realizado'
  }

  const puedeCancelar = () => {
    return !['cancelada', 'no_show', 'check_out_realizado'].includes(reserva.estado)
  }

  const handleCheckIn = () => {
    const resultado = cambiarEstado(reserva.id, 'check_in_realizado')
    if (resultado.ok) {
      toast.success('Check-in realizado')
    } else {
      toast.error(resultado.motivo || 'Error en check-in')
    }
  }

  const handleCheckOut = () => {
    const resultado = cambiarEstado(reserva.id, 'check_out_realizado')
    if (resultado.ok) {
      toast.success('Check-out realizado')
    } else {
      toast.error(resultado.motivo || 'Error en check-out')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button onClick={() => navigate('/reservas')} variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold font-mono text-primary">{reserva.codigo}</h1>
          <p className="text-muted-foreground mt-1">
            Creada el {fechaHora(reserva.fechaCreacion)}
          </p>
        </div>
        <EstadoReservaBadge estado={reserva.estado} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datos de estadía */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Estadía</h2>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground font-semibold">HABITACIÓN</div>
              <div className="font-medium mt-1">
                {habitacion
                  ? `${ETIQUETAS_TIPO_HABITACION[habitacion.tipo]} · Nº ${habitacion.numero}`
                  : '-'}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground font-semibold">FECHAS</div>
              <div className="font-medium mt-1">{rangoEstadia(reserva.fechaIngreso, reserva.fechaSalida)}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground font-semibold">HUÉSPEDES</div>
              <div className="font-medium mt-1">{reserva.cantidadHuespedes}</div>
            </div>

            {reserva.fechaCheckIn && (
              <div>
                <div className="text-xs text-muted-foreground font-semibold">CHECK-IN REALIZADO</div>
                <div className="font-medium mt-1">{fechaHora(reserva.fechaCheckIn)}</div>
              </div>
            )}

            {reserva.fechaCheckOut && (
              <div>
                <div className="text-xs text-muted-foreground font-semibold">CHECK-OUT REALIZADO</div>
                <div className="font-medium mt-1">{fechaHora(reserva.fechaCheckOut)}</div>
              </div>
            )}
          </div>
        </Card>

        {/* Datos de pago */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Pago</h2>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground font-semibold">TARIFA/NOCHE</div>
              <div className="font-medium mt-1">{formatCLP(reserva.tarifaPorNoche)}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground font-semibold">NOCHES</div>
              <div className="font-medium mt-1">{reserva.cantidadNoches}</div>
            </div>

            <Separator />

            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-semibold">TOTAL</div>
                <div className="text-2xl font-bold text-primary mt-1">{formatCLP(reserva.totalCLP)}</div>
              </div>
              <Badge variant="outline">{reserva.pago.estado}</Badge>
            </div>

            {reserva.pago.metodo && (
              <div className="pt-2 text-xs text-muted-foreground">
                Método: {reserva.pago.metodo}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Huésped principal */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Huésped Principal</h2>
        {huesped ? (
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-lg">
                  {obtenerIniciales(huesped.nombre, huesped.apellido)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{huesped.nombre} {huesped.apellido}</h3>
                <div className="text-sm text-muted-foreground mt-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {huesped.email}
                  </div>
                  {huesped.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {huesped.telefono}
                    </div>
                  )}
                  {huesped.nacionalidad && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {huesped.nacionalidad}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate(`/huespedes/${huesped.id}`)}
              variant="outline"
              size="sm"
            >
              Ver perfil
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">Huésped no encontrado</p>
        )}
      </Card>

      {/* Bitácora */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Bitácora de Eventos</h2>
        <TimelineBitacora eventos={eventos} />
      </Card>

      {/* Acciones contextuales */}
      <Card className="p-6 bg-accent/50 border-primary/50">
        <h2 className="text-lg font-semibold mb-4">Acciones</h2>
        <div className="flex flex-wrap gap-2">
          {puedeHacerCheckIn() && (
            <Button onClick={handleCheckIn} variant="default">
              Realizar Check-in
            </Button>
          )}

          {puedeHacerCheckOut() && (
            <Button onClick={handleCheckOut} variant="default">
              Realizar Check-out
            </Button>
          )}

          {puedeCancelar() && (
            <Button
              onClick={() => setMostrarModalCancelar(true)}
              variant="destructive"
            >
              Cancelar Reserva
            </Button>
          )}

          {!puedeHacerCheckIn() && !puedeHacerCheckOut() && !puedeCancelar() && (
            <p className="text-muted-foreground">
              Reserva en estado final. No hay acciones disponibles.
            </p>
          )}
        </div>
      </Card>

      {/* Modal de cancelación */}
      <Dialog open={mostrarModalCancelar} onOpenChange={setMostrarModalCancelar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
            <DialogDescription>
              Indique el motivo de la cancelación. La habitación volverá a disponible.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="motivo">Motivo de cancelación</Label>
              <select
                id="motivo"
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                className="w-full px-3 py-2 border rounded-md mt-2"
              >
                <option value="">Seleccionar...</option>
                <option value="Cancelación solicitada por huésped">Cancelación solicitada por huésped</option>
                <option value="Cambio de fechas">Cambio de fechas</option>
                <option value="Problema con habitación">Problema con habitación</option>
                <option value="No presentación">No presentación</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setMostrarModalCancelar(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button onClick={handleCancelar} variant="destructive">
              Confirmar Cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
