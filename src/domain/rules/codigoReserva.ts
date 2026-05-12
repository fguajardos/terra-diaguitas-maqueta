// Generación del código legible de reserva (sección 11.5 del documento).
// Formato: TD-{año}-{secuencial5digitos}

export function generarCodigoReserva(anio: number, secuencial: number): string {
  return `TD-${anio}-${String(secuencial).padStart(5, '0')}`;
}

export function siguienteSecuencialDesdeReservas(reservas: { codigo: string }[]): number {
  const anioActual = new Date().getFullYear();
  const prefijo = `TD-${anioActual}-`;
  let max = 0;
  for (const r of reservas) {
    if (r.codigo.startsWith(prefijo)) {
      const n = parseInt(r.codigo.slice(prefijo.length), 10);
      if (!Number.isNaN(n) && n > max) max = n;
    }
  }
  return max + 1;
}
