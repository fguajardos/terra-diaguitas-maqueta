// Máquinas de estado de reserva y habitación (secciones 11.2 y 11.3 del documento).
import type { EstadoHabitacion, EstadoReserva } from '@/domain/enums';

// Transiciones permitidas para habitaciones
const TRANSICIONES_HABITACION: Record<EstadoHabitacion, EstadoHabitacion[]> = {
  disponible: ['reservada', 'bloqueada', 'en_mantenimiento'],
  reservada: ['ocupada', 'disponible'],
  ocupada: ['pendiente_limpieza'],
  pendiente_limpieza: ['en_limpieza'],
  en_limpieza: ['inspeccion_pendiente'],
  inspeccion_pendiente: ['disponible', 'en_limpieza'],
  en_mantenimiento: ['disponible'],
  bloqueada: ['disponible'],
};

// Transiciones permitidas para reservas
const TRANSICIONES_RESERVA: Record<EstadoReserva, EstadoReserva[]> = {
  pendiente: ['confirmada', 'pagada', 'cancelada'],
  confirmada: ['pagada', 'check_in_realizado', 'cancelada', 'no_show'],
  pagada: ['check_in_realizado', 'cancelada'],
  check_in_realizado: ['check_out_realizado'],
  check_out_realizado: [],
  cancelada: [],
  no_show: [],
};

export function puedeTransicionarHabitacion(
  desde: EstadoHabitacion,
  hacia: EstadoHabitacion,
): boolean {
  return TRANSICIONES_HABITACION[desde]?.includes(hacia) ?? false;
}

export function puedeTransicionarReserva(desde: EstadoReserva, hacia: EstadoReserva): boolean {
  return TRANSICIONES_RESERVA[desde]?.includes(hacia) ?? false;
}

export function siguientesEstadosHabitacion(actual: EstadoHabitacion): EstadoHabitacion[] {
  return TRANSICIONES_HABITACION[actual] ?? [];
}

export function siguientesEstadosReserva(actual: EstadoReserva): EstadoReserva[] {
  return TRANSICIONES_RESERVA[actual] ?? [];
}
