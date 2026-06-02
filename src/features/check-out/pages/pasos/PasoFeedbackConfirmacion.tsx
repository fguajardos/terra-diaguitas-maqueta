import { Card } from '@/components/ui/card'
import { Star } from 'lucide-react'

interface PasoFeedbackConfirmacionProps {
  datos: any
  setDatos: (datos: any) => void
}

export default function PasoFeedbackConfirmacion({
  datos,
  setDatos,
}: PasoFeedbackConfirmacionProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">¿Cómo fue la estadía de su huésped?</h2>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Su opinión nos ayuda a mejorar nuestro servicio
          </p>

          <div>
            <p className="text-sm font-medium mb-3">Calificación (opcional)</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setDatos({ ...datos, npsRating: rating })}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={
                      rating <= (datos.npsRating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comentario" className="text-sm font-medium">
              Comentario (opcional)
            </label>
            <textarea
              id="comentario"
              placeholder="Ej: Huésped muy educado, habitación dejada en perfecto estado..."
              value={datos.npsComentario}
              onChange={(e) =>
                setDatos({
                  ...datos,
                  npsComentario: e.target.value.slice(0, 300),
                })
              }
              className="w-full mt-2 p-3 border rounded-md text-sm min-h-24 resize-none"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {datos.npsComentario.length}/300 caracteres
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="text-xs font-semibold text-blue-900 mb-2">CONFIRMACIÓN</p>
            <p className="text-xs text-blue-800">
              Al hacer click en "Confirmar Check-out", la habitación será marcada como pendiente
              de limpieza y la reserva se dará por finalizada.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
