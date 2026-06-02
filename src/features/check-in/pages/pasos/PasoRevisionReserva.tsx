import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

import type { Reserva, Habitacion } from '@/domain/types'
import { formatCLP } from '@/lib/formato'
import { calcularTotalDesdeFechas } from '@/domain/rules/tarifas'
import { formatDate } from '@/lib/fechas'
import { ETIQUETAS_ESTADO_PAGO } from '@/domain/labels'

interface PasoRevisionReservaProps {
  datos: any
  setDatos: (datos: any) => void
  reserva: Reserva
  habitacion: Habitacion
}

export default function PasoRevisionReserva({
  datos,
  setDatos,
  reserva,
  habitacion,
}: PasoRevisionReservaProps) {
  const { noches, total } = calcularTotalDesdeFechas(habitacion.tarifaBase, reserva.fechaIngreso, reserva.fechaSalida)
  const montoPendiente = reserva.pago.estado === 'pendiente' ? total - (reserva.pago.montoPagado || 0) : 0

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Revisión de la Reserva</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Habitación</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Nro. {habitacion.numero}</Badge>
              <Badge variant="outline">{habitacion.tipo}</Badge>
              <Badge variant="outline">Piso {habitacion.piso}</Badge>
            </div>
            {habitacion.caracteristicas.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {habitacion.caracteristicas.join(' • ')}
              </p>
            )}
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Fechas de Estadía</p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Check-in:</span> {formatDate(reserva.fechaIngreso)}
              </p>
              <p>
                <span className="font-medium">Check-out:</span> {formatDate(reserva.fechaSalida)}
              </p>
              <p>
                <span className="font-medium">Noches:</span> {noches}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Pago</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Total:</span>
                <span className="font-semibold">{formatCLP(total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Estado:</span>
                <Badge
                  variant={reserva.pago.estado === 'pagado' ? 'default' : 'secondary'}
                >
                  {ETIQUETAS_ESTADO_PAGO[reserva.pago.estado] || reserva.pago.estado}
                </Badge>
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
                id="reserva-revisada"
                checked={datos.reservaRevisada}
                onCheckedChange={(checked: boolean | 'indeterminate') =>
                  setDatos({ ...datos, reservaRevisada: checked === true })
                }
              />
              <label htmlFor="reserva-revisada" className="text-sm cursor-pointer">
                He revisado los detalles con el huésped y verificado el estado de la habitación
              </label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
