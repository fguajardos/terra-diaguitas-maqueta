import type { EventoBitacora } from '@/domain/types'
import { fechaHora } from '@/lib/fechas'
import { CheckCircle2, Clock } from 'lucide-react'

interface TimelineBitacoraProps {
  eventos: EventoBitacora[]
}

export function TimelineBitacora({ eventos }: TimelineBitacoraProps) {
  if (eventos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay eventos registrados aún.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {eventos.map((evento, idx) => (
        <div key={evento.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              {evento.estadoNuevo ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-blue-600" />
              )}
            </div>
            {idx < eventos.length - 1 && (
              <div className="w-1 h-8 bg-border mt-2" />
            )}
          </div>

          <div className="flex-1 pb-4">
            <div className="font-semibold text-sm">{evento.accion}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Por {evento.rolUsuario} • {fechaHora(evento.timestamp)}
            </div>
            {evento.estadoAnterior && evento.estadoNuevo && (
              <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                {evento.estadoAnterior} → {evento.estadoNuevo}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
