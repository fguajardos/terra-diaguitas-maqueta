import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import type { Habitacion, Huesped } from '@/domain/types'
import type { MetodoPago } from '@/domain/enums'

import { Button } from '@/components/ui/button'

import { useHabitacionesStore } from '@/stores/habitacionesStore'
import { useReservasStore } from '@/stores/reservasStore'
import { useSessionStore } from '@/stores/sessionStore'
import { crearReservaYReservarHabitacion } from '@/services/reservasCoordinationService'
import { habitacionDisponibleEnRango } from '@/domain/rules/disponibilidad'
import { calcularTotalDesdeFechas } from '@/domain/rules/tarifas'
import { hoyISO } from '@/lib/fechas'

import Paso1Fechas from './pasos/Paso1Fechas'
import Paso2Huesped from './pasos/Paso2Huesped'
import Paso3Pago from './pasos/Paso3Pago'

type PasoWizard = 1 | 2 | 3

interface DatosWizard {
  fechaIngreso: string
  fechaSalida: string
  cantidadHuespedes: number
  habitacionSeleccionada?: Habitacion
  huesped?: Huesped
  esHuespedNuevo: boolean
  metodoPago?: MetodoPago
  aceptaPoliticas: boolean
  procesandoPago: boolean
}

export function NuevaReservaPage() {
  const navigate = useNavigate()
  const [paso, setPaso] = useState<PasoWizard>(1)

  const [datos, setDatos] = useState<DatosWizard>({
    fechaIngreso: hoyISO(),
    fechaSalida: '',
    cantidadHuespedes: 1,
    esHuespedNuevo: false,
    aceptaPoliticas: false,
    procesandoPago: false,
  })

  const habitacionesStore = useHabitacionesStore((s) => s.habitaciones)
  const reservasExistentes = useReservasStore((s) => s.reservas)
  const { hotelActivoId } = useSessionStore((s) => ({
    hotelActivoId: s.hotelActivoId,
  }))

  const habitacionesDisponibles = useMemo(() => {
    if (!datos.fechaIngreso || !datos.fechaSalida) return []
    return habitacionesStore.filter((h) =>
      h.estado === 'disponible' &&
      habitacionDisponibleEnRango(h.id, datos.fechaIngreso, datos.fechaSalida, reservasExistentes)
    )
  }, [datos.fechaIngreso, datos.fechaSalida, habitacionesStore, reservasExistentes])

  const totalCalculado = useMemo(() => {
    if (!datos.habitacionSeleccionada || !datos.fechaIngreso || !datos.fechaSalida) return { noches: 0, total: 0 }
    return calcularTotalDesdeFechas(datos.habitacionSeleccionada.tarifaBase, datos.fechaIngreso, datos.fechaSalida)
  }, [datos.habitacionSeleccionada, datos.fechaIngreso, datos.fechaSalida])


  const puedeProcederPaso1 = () => {
    const hoy = hoyISO()
    if (!datos.fechaIngreso || datos.fechaIngreso < hoy) return false
    if (!datos.fechaSalida || datos.fechaSalida <= datos.fechaIngreso) return false
    if (datos.cantidadHuespedes < 1) return false
    return true
  }

  const puedeProcederPaso2 = () => {
    return datos.habitacionSeleccionada && datos.huesped
  }

  const puedeProcederPaso3 = () => {
    return datos.metodoPago && datos.aceptaPoliticas
  }

  const handleConfirmPaso3 = async () => {
    if (!datos.habitacionSeleccionada || !datos.huesped) {
      toast.error('Datos incompletos')
      return
    }

    setDatos((d) => ({ ...d, procesandoPago: true }))

    try {
      if (datos.metodoPago === 'webpay') {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        if (Math.random() > 0.85) {
          toast.error('El pago fue rechazado. Intente nuevamente.')
          setDatos((d) => ({ ...d, procesandoPago: false }))
          return
        }
      }

      const resultado = crearReservaYReservarHabitacion({
        hotelId: hotelActivoId,
        habitacionId: datos.habitacionSeleccionada.id,
        tarifaPorNoche: datos.habitacionSeleccionada.tarifaBase,
        huespedPrincipalId: datos.huesped.id,
        fechaIngreso: datos.fechaIngreso,
        fechaSalida: datos.fechaSalida,
        cantidadHuespedes: datos.cantidadHuespedes,
        canal: 'recepcion',
        pago: {
          estado: datos.metodoPago === 'webpay' ? 'pagado' : 'pendiente',
          metodo: datos.metodoPago,
          montoPagado: datos.metodoPago === 'webpay' ? totalCalculado.total : 0,
        },
      })

      if (resultado.ok && resultado.reserva) {
        toast.success(`Reserva ${resultado.reserva.codigo} creada exitosamente`)
        navigate(`/reservas/${resultado.reserva.id}`)
      } else {
        toast.error(resultado.motivo || 'Error al crear la reserva')
        setDatos((d) => ({ ...d, procesandoPago: false }))
      }
    } catch (error) {
      toast.error('Error procesando pago')
      setDatos((d) => ({ ...d, procesandoPago: false }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nueva Reserva</h1>
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
        <div className="text-sm text-muted-foreground">
          Paso {paso} de 3
        </div>
      </div>

      {paso === 1 && (
        <Paso1Fechas
          datos={datos}
          setDatos={setDatos}
          habitacionesDisponibles={habitacionesDisponibles}
          totalCalculado={totalCalculado}
        />
      )}

      {paso === 2 && (
        <Paso2Huesped
          datos={datos}
          setDatos={setDatos}
        />
      )}

      {paso === 3 && (
        <Paso3Pago
          datos={datos}
          setDatos={setDatos}
          totalCalculado={totalCalculado}
          procesando={datos.procesandoPago}
        />
      )}

      <div className="flex gap-3 mt-8 justify-between">
        <Button
          variant="outline"
          onClick={() => paso === 1 ? navigate('/reservas') : setPaso((p) => (p - 1) as PasoWizard)}
        >
          {paso === 1 ? 'Cancelar' : 'Atrás'}
        </Button>
        <Button
          onClick={() => {
            if (paso === 3) {
              handleConfirmPaso3()
            } else {
              setPaso((p) => (p + 1) as PasoWizard)
            }
          }}
          disabled={
            (paso === 1 && !puedeProcederPaso1()) ||
            (paso === 2 && !puedeProcederPaso2()) ||
            (paso === 3 && !puedeProcederPaso3()) ||
            datos.procesandoPago
          }
        >
          {paso === 3 ? datos.procesandoPago ? 'Procesando...' : 'Confirmar Reserva' : 'Continuar'}
        </Button>
      </div>
    </div>
  )
}
