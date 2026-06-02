import type { Habitacion } from '@/domain/types'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import { ETIQUETAS_TIPO_HABITACION } from '@/domain/enums'
import { formatCLP } from '@/lib/formato'
import { rangoEstadia, hoyISO } from '@/lib/fechas'

import { CardHabitacion } from '../../components/CardHabitacion'

interface Paso1Props {
  datos: any
  setDatos: (datos: any) => void
  habitacionesDisponibles: Habitacion[]
  totalCalculado: { noches: number; total: number }
}

export default function Paso1Fechas({
  datos,
  setDatos,
  habitacionesDisponibles,
  totalCalculado,
}: Paso1Props) {
  const hoy = hoyISO()

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Fechas y Cantidad de Huéspedes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="checkin">Check-in</Label>
            <Input
              id="checkin"
              type="date"
              value={datos.fechaIngreso}
              onChange={(e) => setDatos({ ...datos, fechaIngreso: e.target.value })}
              min={hoy}
            />
          </div>
          <div>
            <Label htmlFor="checkout">Check-out</Label>
            <Input
              id="checkout"
              type="date"
              value={datos.fechaSalida}
              onChange={(e) => setDatos({ ...datos, fechaSalida: e.target.value })}
              min={datos.fechaIngreso ? new Date(new Date(datos.fechaIngreso).getTime() + 86400000).toISOString().split('T')[0] : hoy}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="huespedes">Cantidad de Huéspedes</Label>
          <Input
            id="huespedes"
            type="number"
            min="1"
            value={datos.cantidadHuespedes}
            onChange={(e) => setDatos({ ...datos, cantidadHuespedes: parseInt(e.target.value) || 1 })}
          />
        </div>
      </Card>

      {datos.fechaIngreso && datos.fechaSalida && (
        <>
          <Card className="p-6 bg-muted/50">
            <h2 className="text-lg font-semibold mb-4">Disponibilidad</h2>
            {habitacionesDisponibles.length === 0 ? (
              <p className="text-muted-foreground">No hay habitaciones disponibles para las fechas seleccionadas.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {habitacionesDisponibles.map((hab) => (
                  <CardHabitacion
                    key={hab.id}
                    habitacion={hab}
                    seleccionada={datos.habitacionSeleccionada?.id === hab.id}
                    onClick={() => setDatos({ ...datos, habitacionSeleccionada: hab })}
                  />
                ))}
              </div>
            )}
          </Card>

          {datos.habitacionSeleccionada && (
            <Card className="p-6 bg-accent/50 border-primary/50">
              <h2 className="text-lg font-semibold mb-4">Resumen</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Habitación:</span>
                  <span className="font-medium">
                    {ETIQUETAS_TIPO_HABITACION[(datos.habitacionSeleccionada as Habitacion).tipo]} - Nº {datos.habitacionSeleccionada.numero}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fechas:</span>
                  <span className="font-medium">{rangoEstadia(datos.fechaIngreso, datos.fechaSalida)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarifa noche:</span>
                  <span className="font-medium">{formatCLP(datos.habitacionSeleccionada.tarifaBase)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total ({totalCalculado.noches} noches):</span>
                  <span className="text-primary">{formatCLP(totalCalculado.total)}</span>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
