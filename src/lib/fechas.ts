// Helpers de fecha con date-fns + locale es para TERRA DIAGUITAS.
import {
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isToday,
  parseISO,
  startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';

export function toDate(iso: string): Date {
  return parseISO(iso);
}

export function hoyISO(): string {
  return startOfDay(new Date()).toISOString().slice(0, 10);
}

export function fechaCorta(iso: string): string {
  return format(parseISO(iso), 'dd MMM', { locale: es });
}

export function fechaLarga(iso: string): string {
  return format(parseISO(iso), "EEEE d 'de' MMMM yyyy", { locale: es });
}

export function fechaHora(iso: string): string {
  return format(parseISO(iso), "dd MMM yyyy 'a las' HH:mm", { locale: es });
}

export function rangoEstadia(ingresoISO: string, salidaISO: string): string {
  const ingreso = parseISO(ingresoISO);
  const salida = parseISO(salidaISO);
  const noches = differenceInCalendarDays(salida, ingreso);
  const formatoIngreso = format(ingreso, 'dd MMM', { locale: es });
  const formatoSalida = format(salida, 'dd MMM', { locale: es });
  return `${formatoIngreso} → ${formatoSalida} · ${noches} ${noches === 1 ? 'noche' : 'noches'}`;
}

export function noches(ingresoISO: string, salidaISO: string): number {
  return differenceInCalendarDays(parseISO(salidaISO), parseISO(ingresoISO));
}

export function esHoy(iso: string): boolean {
  return isToday(parseISO(iso));
}

export function esAnteriorA(isoA: string, isoB: string): boolean {
  return isBefore(parseISO(isoA), parseISO(isoB));
}

export function esPosteriorA(isoA: string, isoB: string): boolean {
  return isAfter(parseISO(isoA), parseISO(isoB));
}

export function mismoDia(isoA: string, isoB: string): boolean {
  return isSameDay(parseISO(isoA), parseISO(isoB));
}
