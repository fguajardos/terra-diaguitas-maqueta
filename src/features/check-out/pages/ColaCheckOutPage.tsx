import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import type { Reserva } from '@/domain/types'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { useReservasStore } from '@/stores/reservasStore'
import { useHuespedesStore } from '@/stores/huespedesStore'
import { hoyISO, calcularNoches } from '@/lib/fechas'
import { obtenerIniciales } from '@/lib/formato'
import { ETIQUETAS_ESTADO_PAGO } from '@/domain/labels'

export function ColaCheckOutPage() {
  const navigate = useNavigate()

  const reservas = useReservasStore((s) => s.reservas)
  const huespedes = useHuespedesStore((s) => s.huespedes)

  const huespedesMap = useMemo(
    () => Object.fromEntries(huespedes.map((h) => [h.id, h])),
    [huespedes]
  )

  const { atrasadas, hoy } = useMemo(() => {
    const hoyISO_ = hoyISO()
    const reservasParaCheckOut = reservas.filter(
      (r) => r.estado === 'check_in_realizado' && r.fechaSalida <= hoyISO_
    )

    return {
      atrasadas: reservasParaCheckOut.filter((r) => r.fechaSalida < hoyISO_),
      hoy: reservasParaCheckOut.filter((r) => r.fechaSalida === hoyISO_),
    }
  }, [reservas])

  const renderSeccion = (titulo: string, badge: string | null, reservasList: Reserva[]) => {
    if (reservasList.length === 0) return null

    return (
      <div key={titulo} className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          {badge && <Badge variant="destructive">{badge}</Badge>}
          <Badge variant="outline">{reservasList.length}</Badge>
        </div>

        <div className="grid gap-3">
          {reservasList.map((reserva) => {
            const huesped = huespedesMap[reserva.huespedPrincipalId]
            if (!huesped) return null

            const noches = calcularNoches(reserva.fechaIngreso, reserva.fechaSalida)

            return (
              <Card key={reserva.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar>
                      <AvatarFallback>
                        {obtenerIniciales(huesped.nombre, huesped.apellido)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {huesped.nombre} {huesped.apellido}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Habitación {reserva.habitacionId.split('-').pop()} • {noches} noche
                        {noches !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge
                        variant={reserva.pago.estado === 'pagado' ? 'default' : 'secondary'}
                        className="mb-1"
                      >
                        {ETIQUETAS_ESTADO_PAGO[reserva.pago.estado] || reserva.pago.estado}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/check-out/${reserva.id}`)}
                    >
                      Iniciar
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Cola de Check-out</h1>
        <p className="text-muted-foreground mt-2">
          {atrasadas.length + hoy.length} reserva{atrasadas.length + hoy.length !== 1 ? 's' : ''} pendiente
          {atrasadas.length + hoy.length !== 1 ? 's' : ''}
        </p>
      </div>

      {atrasadas.length === 0 && hoy.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-lg">No hay reservas pendientes de check-out</p>
        </Card>
      ) : (
        <>
          {renderSeccion('Atrasadas', 'Pendiente desde ayer', atrasadas)}
          {renderSeccion('Hoy', null, hoy)}
        </>
      )}
    </div>
  )
}
