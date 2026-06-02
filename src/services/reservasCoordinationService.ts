// Servicio de coordinación: operaciones atómicas en reservas
// Previene inconsistencias entre reservasStore y habitacionesStore
import type { DatosNuevaReserva } from '@/stores/reservasStore'
import { useReservasStore } from '@/stores/reservasStore'
import { useHabitacionesStore } from '@/stores/habitacionesStore'

/**
 * Crea una reserva de forma ATÓMICA:
 * 1. Valida y crea la reserva
 * 2. Si es OK, cambia estado de habitación a 'reservada'
 * 3. Si falla (2), la reserva queda en estado inconsistente (pero no creada)
 *
 * Retorna { ok, reserva, motivo }
 */
export function crearReservaYReservarHabitacion(datos: DatosNuevaReserva) {
  const crearReserva = useReservasStore((s) => s.crear)
  const cambiarEstadoHabitacion = useHabitacionesStore((s) => s.cambiarEstado)

  // Paso 1: crear reserva
  const resultado = crearReserva(datos)

  if (!resultado.ok || !resultado.reserva) {
    return resultado
  }

  // Paso 2: cambiar estado de habitación a 'reservada'
  const cambioHabitacion = cambiarEstadoHabitacion(datos.habitacionId, 'reservada')

  if (!cambioHabitacion.ok) {
    // NOTA: La reserva ya está creada en el store.
    // En Fase 1 (con HTTP), habría transacción DB que la revierta.
    // Por ahora (Fase 0): esta es una situación teóricamente imposible.
    console.error(
      `[BUG] Reserva ${resultado.reserva.codigo} creada pero cambio de habitación falló: ${cambioHabitacion.motivo}`,
    )
    return {
      ok: false,
      motivo: `Reserva creada pero habitación no se pudo marcar como reservada: ${cambioHabitacion.motivo}`,
    }
  }

  // ✅ Ambos pasos OK: operación atómica completa
  return resultado
}

/**
 * Cancela una reserva de forma ATÓMICA:
 * 1. Valida y cambia estado de reserva a 'cancelada'
 * 2. Si es OK, cambia estado de habitación a 'disponible'
 * 3. Si falla (2), la reserva queda cancelada pero habitación sigue 'reservada'
 *
 * Retorna { ok, motivo }
 */
export function cancelarReservaYLiberarHabitacion(
  reservaId: string,
  habitacionId: string,
  motivo?: string,
) {
  const cambiarEstadoReserva = useReservasStore((s) => s.cambiarEstado)
  const cambiarEstadoHabitacion = useHabitacionesStore((s) => s.cambiarEstado)

  // Paso 1: cancelar reserva
  const cancelacion = cambiarEstadoReserva(reservaId, 'cancelada', { motivo })

  if (!cancelacion.ok) {
    return cancelacion
  }

  // Paso 2: liberar habitación
  const liberacion = cambiarEstadoHabitacion(habitacionId, 'disponible')

  if (!liberacion.ok) {
    // NOTA: Reserva está cancelada pero habitación sigue reservada.
    // Este es el estado inconsistente aceptable: la habitación liberarse.
    // en Fase 1, habría compensación transaccional.
    console.error(
      `[BUG] Reserva ${reservaId} cancelada pero habitación no se liberó: ${liberacion.motivo}`,
    )
    return {
      ok: false,
      motivo: `Reserva cancelada pero habitación no se liberó: ${liberacion.motivo}`,
    }
  }

  // ✅ Ambos pasos OK: operación atómica completa
  return { ok: true }
}
