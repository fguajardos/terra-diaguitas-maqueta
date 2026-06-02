import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { useReservasStore } from '@/stores/reservasStore'
import { useHuespedesStore } from '@/stores/huespedesStore'
import { useHabitacionesStore } from '@/stores/habitacionesStore'
import { realizarCheckInAtomico } from '@/services/reservasCoordinationService'

import PasoIdentidad from './pasos/PasoIdentidad'
import PasoRevisionReserva from './pasos/PasoRevisionReserva'
import PasoFirmaLlaves from './pasos/PasoFirmaLlaves'

type PasoCheckIn = 1 | 2 | 3

interface DatosCheckIn {
  identidadVerificada: boolean
  reservaRevisada: boolean
  firma: string | null
  procesandoCheckIn: boolean
}

export function WizardCheckInPage() {
  const navigate = useNavigate()
  const { reservaId } = useParams<{ reservaId: string }>()

  if (!reservaId) {
    toast.error('ID de reserva inválido')
    navigate('/check-in')
    return null
  }

  const [paso, setPaso] = useState<PasoCheckIn>(1)

  const [datos, setDatos] = useState<DatosCheckIn>({
    identidadVerificada: false,
    reservaRevisada: false,
    firma: null,
    procesandoCheckIn: false,
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
          <Button onClick={() => navigate('/check-in')}>Volver a la cola</Button>
        </div>
      </div>
    )
  }

  const puedeProcederPaso1 = () => datos.identidadVerificada
  const puedeProcederPaso2 = () => datos.reservaRevisada
  const puedeProcederPaso3 = () => datos.firma !== null

  const handleConfirmarCheckIn = async () => {
    setDatos((d) => ({ ...d, procesandoCheckIn: true }))

    try {
      const resultado = realizarCheckInAtomico(reserva.id, habitacion.id)

      if (resultado.ok) {
        toast.success('Check-in realizado exitosamente')
        navigate(`/reservas/${reserva.id}`)
      } else {
        toast.error(resultado.motivo || 'Error al realizar check-in')
        setDatos((d) => ({ ...d, procesandoCheckIn: false }))
      }
    } catch (error) {
      toast.error('Error procesando check-in')
      setDatos((d) => ({ ...d, procesandoCheckIn: false }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Check-in</h1>
        <p className="text-sm text-muted-foreground mb-4">
          {huesped.nombre} {huesped.apellido} • Habitación {habitacion.numero}
        </p>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((p) => (
            <div key={p} className="flex-1">
              <div
                className={`h-2 rounded-full transition-colors ${
                  p <= paso ? 'bg-primary' : 'bg-muted'
                }`}
              />
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">Paso {paso} de 3</div>
      </div>

      {paso === 1 && (
        <PasoIdentidad
          datos={datos}
          setDatos={setDatos}
          huesped={huesped}
        />
      )}

      {paso === 2 && (
        <PasoRevisionReserva
          datos={datos}
          setDatos={setDatos}
          reserva={reserva}
          habitacion={habitacion}
        />
      )}

      {paso === 3 && (
        <PasoFirmaLlaves
          datos={datos}
          setDatos={setDatos}
          reserva={reserva}
          habitacion={habitacion}
          huesped={huesped}
        />
      )}

      <div className="flex gap-3 mt-8 justify-between">
        <Button
          variant="outline"
          onClick={() => paso === 1 ? navigate('/check-in') : setPaso((p) => (p - 1) as PasoCheckIn)}
        >
          {paso === 1 ? 'Cancelar' : 'Atrás'}
        </Button>
        <Button
          onClick={() => {
            if (paso === 3) {
              handleConfirmarCheckIn()
            } else {
              setPaso((p) => (p + 1) as PasoCheckIn)
            }
          }}
          disabled={
            (paso === 1 && !puedeProcederPaso1()) ||
            (paso === 2 && !puedeProcederPaso2()) ||
            (paso === 3 && !puedeProcederPaso3()) ||
            datos.procesandoCheckIn
          }
        >
          {paso === 3 ? (datos.procesandoCheckIn ? 'Procesando...' : 'Realizar Check-in') : 'Continuar'}
        </Button>
      </div>
    </div>
  )
}
