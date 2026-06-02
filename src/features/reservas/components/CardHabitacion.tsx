import type { Habitacion } from '@/domain/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ETIQUETAS_TIPO_HABITACION as TIPO_LABELS } from '@/domain/enums'
import { formatCLP } from '@/lib/formato'
import { Check } from 'lucide-react'

interface CardHabitacionProps {
  habitacion: Habitacion
  seleccionada: boolean
  onClick: () => void
}

export function CardHabitacion({ habitacion, seleccionada, onClick }: CardHabitacionProps) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all p-4 ${
        seleccionada
          ? 'ring-2 ring-primary bg-accent'
          : 'hover:shadow-md hover:border-primary/50'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-lg font-semibold">Habitación {habitacion.numero}</div>
          <div className="text-sm text-muted-foreground">Piso {habitacion.piso}</div>
        </div>
        {seleccionada && (
          <div className="bg-primary text-primary-foreground p-1 rounded-full">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        <Badge variant="outline">{TIPO_LABELS[habitacion.tipo]}</Badge>
        <Badge variant="secondary">{habitacion.capacidadMaxima} huéspedes</Badge>
      </div>

      {habitacion.caracteristicas.length > 0 && (
        <div className="text-xs text-muted-foreground mb-3">
          {habitacion.caracteristicas.join(' · ')}
        </div>
      )}

      <div className="pt-2 border-t border-border">
        <div className="font-semibold text-primary">{formatCLP(habitacion.tarifaBase)} por noche</div>
      </div>
    </Card>
  )
}
