// Regla de no-sobreventa (sección 11.1 del documento).
import { parseISO } from 'date-fns';
import type { Reserva } from '@/domain/types';

const ESTADOS_INACTIVOS = new Set(['cancelada', 'no_show']);

interface ResultadoDisponibilidad {
  permitido: boolean;
  conflicto?: Reserva;
}

export function puedeCrearReserva(
  habitacionId: string,
  fechaIngreso: string,
  fechaSalida: string,
  reservasExistentes: Reserva[],
  excluirReservaId?: string,
): ResultadoDisponibilidad {
  const ingreso = parseISO(fechaIngreso);
  const salida = parseISO(fechaSalida);

  const conflicto = reservasExistentes.find((r) => {
    if (r.id === excluirReservaId) return false;
    if (r.habitacionId !== habitacionId) return false;
    if (ESTADOS_INACTIVOS.has(r.estado)) return false;
    const rIngreso = parseISO(r.fechaIngreso);
    const rSalida = parseISO(r.fechaSalida);
    // Hay solape si NO (la otra termina antes o empieza después)
    const sinSolape = rSalida <= ingreso || rIngreso >= salida;
    return !sinSolape;
  });

  return { permitido: !conflicto, conflicto };
}

export function habitacionDisponibleEnRango(
  habitacionId: string,
  fechaIngreso: string,
  fechaSalida: string,
  reservas: Reserva[],
): boolean {
  return puedeCrearReserva(habitacionId, fechaIngreso, fechaSalida, reservas).permitido;
}
