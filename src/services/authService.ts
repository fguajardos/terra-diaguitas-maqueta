import { usuariosSeed } from '@/data/usuarios.seed'

// Simulación de OTP por email (en memoria, 5 minutos de validez)
const otpsActivos = new Map<string, { codigo: string; expiresAt: number }>()

// Rate limiting (5 intentos, 15 segundos de espera)
const intentosFallidos = new Map<string, { cantidad: number; resetAt: number }>()

/**
 * Valida credenciales y retorna el usuario si son correctas
 */
export function validarCredenciales(email: string, password: string) {
  const usuario = usuariosSeed.find(u => u.email === email)

  // Simulado: aceptamos cualquier contraseña >= 6 caracteres
  // En producción: validar contra hash en backend
  if (!usuario || password.length < 6) {
    registrarIntentoFallido(email)
    return null
  }

  limpiarIntentosFallidos(email)
  return usuario
}

/**
 * Genera un OTP de 6 dígitos y lo envía (simulado)
 * En producción: enviar por email real
 */
export function generarOTP(email: string): string {
  const codigo = Math.random().toString().slice(2, 8).padStart(6, '0')
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutos

  otpsActivos.set(email, { codigo, expiresAt })

  // Log simulado (en producción: enviar por email)
  console.log(`[OTP SIMULADO] Email: ${email} → Código: ${codigo}`)

  return codigo
}

/**
 * Valida el OTP ingresado por el usuario
 */
export function validarOTP(email: string, codigoIngresado: string): boolean {
  const otp = otpsActivos.get(email)

  if (!otp) {
    console.warn(`[OTP] No hay OTP generado para ${email}`)
    return false
  }

  if (Date.now() > otp.expiresAt) {
    otpsActivos.delete(email)
    console.warn(`[OTP] OTP expirado para ${email}`)
    return false
  }

  if (otp.codigo !== codigoIngresado) {
    console.warn(`[OTP] Código incorrecto para ${email}`)
    return false
  }

  // OTP válido: eliminarlo para que no se reutilice
  otpsActivos.delete(email)
  limpiarIntentosFallidos(email)
  return true
}

/**
 * Registra un intento fallido de login
 */
function registrarIntentoFallido(email: string) {
  const intento = intentosFallidos.get(email)
  const ahora = Date.now()

  if (!intento || ahora > intento.resetAt) {
    // Nuevo registro o pasó el tiempo de reset
    intentosFallidos.set(email, { cantidad: 1, resetAt: ahora + 15 * 1000 }) // 15 seg
    return
  }

  // Incrementar contador
  intento.cantidad++
  intentosFallidos.set(email, intento)
}

/**
 * Limpia los intentos fallidos para un email (después de login exitoso)
 */
function limpiarIntentosFallidos(email: string) {
  intentosFallidos.delete(email)
}

/**
 * Verifica si el email está en rate limit
 */
export function estaEnRateLimit(email: string): { limitado: boolean; esperarSegundos: number } {
  const intento = intentosFallidos.get(email)
  const ahora = Date.now()

  if (!intento) {
    return { limitado: false, esperarSegundos: 0 }
  }

  if (ahora > intento.resetAt) {
    intentosFallidos.delete(email)
    return { limitado: false, esperarSegundos: 0 }
  }

  if (intento.cantidad >= 5) {
    const esperarMs = intento.resetAt - ahora
    return { limitado: true, esperarSegundos: Math.ceil(esperarMs / 1000) }
  }

  return { limitado: false, esperarSegundos: 0 }
}

/**
 * Calcula la validez de una sesión (30 minutos sin actividad)
 */
export function verificarExpirySession(lastActivity: number): boolean {
  const INACTIVIDAD_MAX = 30 * 60 * 1000 // 30 minutos
  return Date.now() - lastActivity > INACTIVIDAD_MAX
}
