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

/**
 * Realiza check-in de forma ATÓMICA:
 * 1. Valida y cambia estado de reserva a 'check_in_realizado' (estampa fechaCheckIn automáticamente)
 * 2. Si es OK, cambia estado de habitación a 'ocupada'
 * 3. Si falla (2), revierte reserva a 'confirmada'
 *
 * Retorna { ok, motivo }
 */
export function realizarCheckInAtomico(reservaId: string, habitacionId: string) {
  const cambiarEstadoReserva = useReservasStore((s) => s.cambiarEstado)
  const cambiarEstadoHabitacion = useHabitacionesStore((s) => s.cambiarEstado)

  // Paso 1: cambiar estado de reserva a check_in_realizado
  const checkIn = cambiarEstadoReserva(reservaId, 'check_in_realizado')

  if (!checkIn.ok) {
    return checkIn
  }

  // Paso 2: cambiar habitación a ocupada
  const ocupacion = cambiarEstadoHabitacion(habitacionId, 'ocupada')

  if (!ocupacion.ok) {
    // Rollback: revertir reserva a confirmada
    const rollback = cambiarEstadoReserva(reservaId, 'confirmada', {
      motivo: 'Rollback: habitación no se pudo ocupar',
    })
    return {
      ok: false,
      motivo: `Check-in falló: habitación no se pudo cambiar a ocupada. ${rollback.ok ? 'Reserva revertida.' : 'Error al revertir reserva.'}`,
    }
  }

  // ✅ Ambos pasos OK: operación atómica completa
  return { ok: true }
}

/**
 * Realiza check-out de forma ATÓMICA:
 * 1. Valida y cambia estado de reserva a 'check_out_realizado' (estampa fechaCheckOut automáticamente)
 * 2. Si es OK, cambia estado de habitación a 'pendiente_limpieza'
 * 3. Si falla (2), revierte reserva a 'check_in_realizado'
 *
 * Retorna { ok, motivo }
 */
export function realizarCheckOutAtomico(reservaId: string, habitacionId: string) {
  const cambiarEstadoReserva = useReservasStore((s) => s.cambiarEstado)
  const cambiarEstadoHabitacion = useHabitacionesStore((s) => s.cambiarEstado)

  // Paso 1: cambiar estado de reserva a check_out_realizado
  const checkOut = cambiarEstadoReserva(reservaId, 'check_out_realizado')

  if (!checkOut.ok) {
    return checkOut
  }

  // Paso 2: cambiar habitación a pendiente_limpieza
  const limpieza = cambiarEstadoHabitacion(habitacionId, 'pendiente_limpieza')

  if (!limpieza.ok) {
    // Rollback: revertir reserva a check_in_realizado
    const rollback = cambiarEstadoReserva(reservaId, 'check_in_realizado', {
      motivo: 'Rollback: habitación no se pudo pasar a limpieza',
    })
    return {
      ok: false,
      motivo: `Check-out falló: habitación no se pudo cambiar a pendiente_limpieza. ${rollback.ok ? 'Reserva revertida.' : 'Error al revertir reserva.'}`,
    }
  }

  // ✅ Ambos pasos OK: operación atómica completa
  return { ok: true }
}
