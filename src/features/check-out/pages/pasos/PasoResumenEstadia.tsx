import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

import type { Reserva, Habitacion } from '@/domain/types'
import { formatCLP } from '@/lib/formato'
import { formatDate, calcularNoches } from '@/lib/fechas'

interface PasoResumenEstadiaProps {
  datos: any
  setDatos: (datos: any) => void
  reserva: Reserva
  habitacion: Habitacion
}

export default function PasoResumenEstadia({
  datos,
  setDatos,
  reserva,
  habitacion,
}: PasoResumenEstadiaProps) {
  const noches = calcularNoches(reserva.fechaIngreso, reserva.fechaSalida)
  const total = habitacion.tarifaBase * noches
  const montoPendiente = reserva.pago.estado === 'pendiente' ? total - (reserva.pago.montoPagado || 0) : 0

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Resumen de Estadía</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Fechas</p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Check-in:</span>{' '}
                {reserva.fechaCheckIn ? formatDate(reserva.fechaCheckIn) : 'No realizado'}
              </p>
              <p>
                <span className="text-muted-foreground">Check-out:</span> {formatDate(new Date().toISOString())}
              </p>
              <p>
                <span className="text-muted-foreground">Noches:</span> {noches}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Estado de la Habitación</p>
            <Badge variant="outline">{habitacion.estado}</Badge>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Pago</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Total:</span>
                <span className="font-semibold">{formatCLP(total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Pagado:</span>
                <span className="font-semibold">{formatCLP(reserva.pago.montoPagado || 0)}</span>
              </div>
              {montoPendiente > 0 && (
                <div className="flex items-center justify-between text-sm text-orange-600 bg-orange-50 p-2 rounded">
                  <span>Saldo pendiente:</span>
                  <span className="font-semibold">{formatCLP(montoPendiente)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="habitacion-revisada"
                checked={datos.habitacionRevisada}
                onCheckedChange={(checked: boolean | 'indeterminate') =>
                  setDatos({ ...datos, habitacionRevisada: checked === true })
                }
              />
              <label htmlFor="habitacion-revisada" className="text-sm cursor-pointer">
                He verificado el estado de la habitación con el huésped
              </label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
