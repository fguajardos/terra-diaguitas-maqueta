import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

import type { Reserva, Habitacion, Huesped } from '@/domain/types'
import { SignaturePad } from '@/components/shared/SignaturePad'
import { formatDate } from '@/lib/fechas'

interface PasoFirmaLlavesProps {
  datos: any
  setDatos: (datos: any) => void
  reserva: Reserva
  habitacion: Habitacion
  huesped: Huesped
}

export default function PasoFirmaLlaves({
  datos,
  setDatos,
  reserva,
  habitacion,
  huesped,
}: PasoFirmaLlavesProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-accent/30">
        <h2 className="text-lg font-semibold mb-4">Resumen</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Huésped:</span>
            <span className="font-medium">
              {huesped.nombre} {huesped.apellido}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Habitación:</span>
            <Badge variant="outline">Nro. {habitacion.numero}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Check-in:</span>
            <span className="font-medium">{formatDate(reserva.fechaIngreso)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Check-out:</span>
            <span className="font-medium">{formatDate(reserva.fechaSalida)}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Firma y Entrega de Llaves</h2>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            El huésped firma a continuación confirmando la recepción de llaves y aceptación de las
            condiciones de la habitación.
          </p>

          <div className="border-b pb-4">
            <p className="text-sm font-medium mb-3">Firma del huésped</p>
            <SignaturePad
              value={datos.firma}
              onChange={(firma) => setDatos({ ...datos, firma })}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="text-xs font-semibold text-blue-900 mb-2">TÉRMINOS Y CONDICIONES</p>
            <p className="text-xs text-blue-800">
              Acepto los términos y condiciones del Hotel Terra Diaguitas, incluyendo políticas
              de cancelación, normas de la casa, y responsabilidad por daños a la propiedad.
            </p>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="terminos"
              checked={datos.firma !== null}
              disabled={true}
            />
            <label htmlFor="terminos" className="text-sm text-muted-foreground cursor-default">
              La firma anterior confirma la aceptación de términos y condiciones
            </label>
          </div>
        </div>
      </Card>
    </div>
  )
}
