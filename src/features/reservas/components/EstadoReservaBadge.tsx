import type { EstadoReserva } from '@/domain/enums'
import { Badge } from '@/components/ui/badge'
import { ETIQUETAS_ESTADO_RESERVA } from '@/domain/enums'

interface EstadoReservaBadgeProps {
  estado: EstadoReserva
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

const estadoAVariant = (estado: EstadoReserva): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const estados_exitosos = ['confirmada', 'pagada', 'check_in_realizado', 'check_out_realizado'] as const
  const estados_fallidos = ['cancelada', 'no_show'] as const

  if (estados_exitosos.includes(estado as typeof estados_exitosos[number])) return 'default'
  if (estados_fallidos.includes(estado as typeof estados_fallidos[number])) return 'destructive'
  return 'secondary'
}

export function EstadoReservaBadge({ estado, variant }: EstadoReservaBadgeProps) {
  return (
    <Badge variant={variant || estadoAVariant(estado)}>
      {ETIQUETAS_ESTADO_RESERVA[estado]}
    </Badge>
  )
}
