// Cálculo de tarifas (sección 11.4 del documento).
// En la maqueta usamos tarifaPorNoche = tarifaBase de la habitación, sin temporadas.
import { noches as calcularNoches } from '@/lib/fechas';

export function calcularTotal(tarifaPorNoche: number, cantidadNoches: number): number {
  return Math.round(tarifaPorNoche * Math.max(0, cantidadNoches));
}

export function calcularTotalDesdeFechas(
  tarifaPorNoche: number,
  fechaIngresoISO: string,
  fechaSalidaISO: string,
): { noches: number; total: number } {
  const n = Math.max(0, calcularNoches(fechaIngresoISO, fechaSalidaISO));
  return { noches: n, total: calcularTotal(tarifaPorNoche, n) };
}
