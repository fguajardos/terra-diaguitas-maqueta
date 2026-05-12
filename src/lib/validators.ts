// Validadores TERRA DIAGUITAS (sección 11.6 del documento).
import { limpiarRut } from './formato';

// Algoritmo módulo 11 para RUT chileno.
export function validarRut(rut: string): boolean {
  const limpio = limpiarRut(rut).replace(/-/g, '');
  if (limpio.length < 2) return false;

  const cuerpo = limpio.slice(0, -1);
  const dvIngresado = limpio.slice(-1);

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

  return dvCalculado === dvIngresado;
}

// Email simple — suficiente para maqueta.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validarEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

// Pasaporte alfanumérico, 6-12 caracteres
const PASAPORTE_REGEX = /^[A-Z0-9-]{6,15}$/i;
export function validarPasaporte(pasaporte: string): boolean {
  return PASAPORTE_REGEX.test(pasaporte.trim());
}

// Teléfono chileno: +56 9 XXXX XXXX o variaciones aceptadas
const TELEFONO_REGEX = /^\+?\d[\d\s]{7,18}$/;
export function validarTelefono(telefono: string): boolean {
  return TELEFONO_REGEX.test(telefono.trim());
}
