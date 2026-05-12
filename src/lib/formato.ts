// Helpers de formato es-CL para TERRA DIAGUITAS (sección 5 del documento).

const formatterCLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

export function formatCLP(monto: number): string {
  return formatterCLP.format(monto);
}

export function formatNumero(n: number): string {
  return new Intl.NumberFormat('es-CL').format(n);
}

// Devuelve un RUT limpio, normalizado en mayúsculas y sin puntos.
// "12.345.678-5" → "12345678-5"
export function limpiarRut(rut: string): string {
  return rut.replace(/\./g, '').replace(/\s/g, '').toUpperCase();
}

// Formatea con puntos y guión: "123456785" → "12.345.678-5"
export function formatRut(rut: string): string {
  const limpio = limpiarRut(rut).replace(/-/g, '');
  if (limpio.length < 2) return rut;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpoFormateado}-${dv}`;
}

// "+56 9 8123 4567" → tal cual, asegurando espacios consistentes
export function formatTelefono(telefono: string): string {
  return telefono.trim().replace(/\s+/g, ' ');
}

export function obtenerIniciales(nombre: string, apellido: string): string {
  const a = (nombre || '').trim()[0] ?? '';
  const b = (apellido || '').trim()[0] ?? '';
  return (a + b).toUpperCase() || '??';
}
