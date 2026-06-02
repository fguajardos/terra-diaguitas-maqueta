// Validadores TERRA DIAGUITAS (sección 11.6 del documento).
import { limpiarRut } from './formato';

// Algoritmo módulo 11 para RUT chileno.
// Validación ESTRICTA: 8–9 dígitos + DV (formato legal chileno)
export function validarRut(rut: string): boolean {
  const limpio = limpiarRut(rut).replace(/-/g, '');

  // ESTRICTO: RUT debe tener 8–9 caracteres (8–8 dígitos + 1 DV, o bien 8+1 = 9 total)
  // "12345678-5" después de limpiar es "123456785" (9 caracteres)
  // "1234567-5" sería "12345675" (8 caracteres, aceptable pero raro)
  // RUTs menores a 8 dígitos son ilegales en Chile
  if (limpio.length < 8 || limpio.length > 9) {
    return false;
  }

  const cuerpo = limpio.slice(0, -1);
  const dvIngresado = limpio.slice(-1);

  // El cuerpo debe ser enteramente numérico
  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  let dvCalculado: string;
  if (resto === 11) dvCalculado = '0';
  else if (resto === 10) dvCalculado = 'K';
  else dvCalculado = String(resto);

  return dvCalculado === dvIngresado.toUpperCase();
}

// Email ESTRICTO — RFC 5322 simplificado (aceptar 99% de emails válidos)
// Rechaza espacios, requiere al menos local@domain.TLD con TLD >= 2 caracteres
const EMAIL_REGEX = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export function validarEmail(email: string): boolean {
  const trimmed = email.trim();
  if (trimmed.length > 254) return false; // RFC 5321 límite
  return EMAIL_REGEX.test(trimmed);
}

// Pasaporte alfanumérico, 6-12 caracteres
const PASAPORTE_REGEX = /^[A-Z0-9-]{6,15}$/i;
export function validarPasaporte(pasaporte: string): boolean {
  return PASAPORTE_REGEX.test(pasaporte.trim());
}

// Teléfono ESTRICTO: Chile +56 9 XXXX XXXX, o local 9 XXXX XXXX
// Acepta variaciones: +56912345678, +56 9 1234 5678, 912345678, 9 1234 5678
export function validarTelefono(telefono: string): boolean {
  const limpio = telefono.trim().replace(/\s/g, '');

  // Válido si:
  // - Empieza con +56 seguido de 9 y 8 dígitos (total 12 caracteres) [+569XXXXXXXX]
  // - Empieza con 9 seguido de 8 dígitos (total 9 caracteres) [9XXXXXXXX]
  const esInternacional = /^\+569\d{8}$/.test(limpio);
  const esLocal = /^9\d{8}$/.test(limpio);

  return esInternacional || esLocal;
}
