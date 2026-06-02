import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { useReservasStore } from '@/stores/reservasStore'
import { useHuespedesStore } from '@/stores/huespedesStore'
import { useHabitacionesStore } from '@/stores/habitacionesStore'
import { realizarCheckOutAtomico } from '@/services/reservasCoordinationService'

import PasoResumenEstadia from './pasos/PasoResumenEstadia'
import PasoFeedbackConfirmacion from './pasos/PasoFeedbackConfirmacion'

type PasoCheckOut = 1 | 2

interface DatosCheckOut {
  habitacionRevisada: boolean
  npsRating: number | null
  npsComentario: string
  procesandoCheckOut: boolean
}

export function WizardCheckOutPage() {
  const navigate = useNavigate()
  const { reservaId } = useParams<{ reservaId: string }>()

  if (!reservaId) {
    toast.error('ID de reserva inválido')
    navigate('/check-out')
    return null
  }

  const [paso, setPaso] = useState<PasoCheckOut>(1)

  const [datos, setDatos] = useState<DatosCheckOut>({
    habitacionRevisada: false,
    npsRating: null,
    npsComentario: '',
    procesandoCheckOut: false,
  })

  const reserva = useReservasStore((s) => s.porId(reservaId))
  const huesped = useHuespedesStore((s) => (reserva ? s.porId(reserva.huespedPrincipalId) : undefined))
  const habitacion = useHabitacionesStore((s) => (reserva ? s.porId(reserva.habitacionId) : undefined))

  if (!reserva || !huesped || !habitacion) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Reserva no encontrada</h1>
          <p className="text-muted-foreground">No pudimos cargar los datos de la reserva</p>
          <Button onClick={() => navigate('/check-out')}>Volver a la cola</Button>
        </div>
      </div>
    )
  }

  const puedeProcederPaso1 = () => datos.habitacionRevisada

  const handleConfirmarCheckOut = async () => {
    setDatos((d) => ({ ...d, procesandoCheckOut: true }))

    try {
      const resultado = realizarCheckOutAtomico(reserva.id, habitacion.id)

      if (resultado.ok) {
        toast.success('Check-out completado. ¡Hasta pronto!')
        navigate('/check-out')
      } else {
        toast.error(resultado.motivo || 'Error al realizar check-out')
        setDatos((d) => ({ ...d, procesandoCheckOut: false }))
      }
    } catch (error) {
      toast.error('Error procesando check-out')
      setDatos((d) => ({ ...d, procesandoCheckOut: false }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Check-out</h1>
        <p className="text-sm text-muted-foreground mb-4">
          {huesped.nombre} {huesped.apellido} • Habitación {habitacion.numero}
        </p>
        <div className="flex gap-2 mb-4">
          {[1, 2].map((p) => (
            <div key={p} className="flex-1">
              <div
                className={`h-2 rounded-full transition-colors ${
                  p <= paso ? 'bg-primary' : 'bg-muted'
                }`}
              />
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">Paso {paso} de 2</div>
      </div>

      {paso === 1 && (
        <PasoResumenEstadia
          datos={datos}
          setDatos={setDatos}
          reserva={reserva}
          habitacion={habitacion}
        />
      )}

      {paso === 2 && (
        <PasoFeedbackConfirmacion
          datos={datos}
          setDatos={setDatos}
        />
      )}

      <div className="flex gap-3 mt-8 justify-between">
        <Button
          variant="outline"
          onClick={() => paso === 1 ? navigate('/check-out') : setPaso((p) => (p - 1) as PasoCheckOut)}
        >
          {paso === 1 ? 'Cancelar' : 'Atrás'}
        </Button>
        <Button
          onClick={() => {
            if (paso === 2) {
              handleConfirmarCheckOut()
            } else {
              setPaso((p) => (p + 1) as PasoCheckOut)
            }
          }}
          disabled={
            (paso === 1 && !puedeProcederPaso1()) ||
            datos.procesandoCheckOut
          }
        >
          {paso === 2 ? (datos.procesandoCheckOut ? 'Procesando...' : 'Confirmar Check-out') : 'Continuar'}
        </Button>
      </div>
    </div>
  )
}
