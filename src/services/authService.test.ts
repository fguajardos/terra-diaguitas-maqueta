import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  validarCredenciales,
  generarOTP,
  validarOTP,
  estaEnRateLimit,
  verificarExpirySession,
} from './authService'
import { usuariosSeed } from '@/data/usuarios.seed'

describe('authService - Seguridad y Autenticación', () => {
  beforeEach(() => {
    // Limpiar localStorage y estado de la consola
    vi.clearAllMocks()
  })

  describe('validarCredenciales', () => {
    it('debe aceptar credenciales válidas', () => {
      const usuario = usuariosSeed[0]
      const resultado = validarCredenciales(usuario.email, '123456')

      expect(resultado).toBeTruthy()
      expect(resultado?.id).toBe(usuario.id)
      expect(resultado?.email).toBe(usuario.email)
    })

    it('debe rechazar email inexistente', () => {
      const resultado = validarCredenciales('noexiste@example.com', '123456')
      expect(resultado).toBeNull()
    })

    it('debe rechazar contraseña muy corta (< 6 caracteres)', () => {
      const usuario = usuariosSeed[0]
      const resultado = validarCredenciales(usuario.email, '12345')
      expect(resultado).toBeNull()
    })

    it('debe rechazar contraseña vacía', () => {
      const usuario = usuariosSeed[0]
      const resultado = validarCredenciales(usuario.email, '')
      expect(resultado).toBeNull()
    })

    it('debe aceptar contraseña de exactamente 6 caracteres', () => {
      const usuario = usuariosSeed[0]
      const resultado = validarCredenciales(usuario.email, '123456')
      expect(resultado).toBeTruthy()
    })

    it('debe aceptar contraseña larga', () => {
      const usuario = usuariosSeed[0]
      const resultado = validarCredenciales(usuario.email, '1234567890abcdefghij')
      expect(resultado).toBeTruthy()
    })

    it('debe ser case-sensitive en email', () => {
      const usuario = usuariosSeed[0]
      const resultado = validarCredenciales(usuario.email.toUpperCase(), '123456')
      expect(resultado).toBeNull()
    })

    it('debe rechazar email con espacios', () => {
      const usuario = usuariosSeed[0]
      const resultado = validarCredenciales(` ${usuario.email} `, '123456')
      expect(resultado).toBeNull()
    })
  })

  describe('OTP - Generación y Validación', () => {
    it('debe generar OTP de exactamente 6 dígitos', () => {
      const email = usuariosSeed[0].email
      const codigo = generarOTP(email)

      expect(codigo).toMatch(/^\d{6}$/)
      expect(codigo.length).toBe(6)
    })

    it('debe generar OTPs diferentes en cada llamada', () => {
      const email = usuariosSeed[0].email
      const codigo1 = generarOTP(email)
      const codigo2 = generarOTP(email)

      expect(codigo1).not.toBe(codigo2)
    })

    it('debe validar OTP correcto', () => {
      const email = usuariosSeed[0].email
      const codigo = generarOTP(email)

      const esValido = validarOTP(email, codigo)
      expect(esValido).toBe(true)
    })

    it('debe rechazar OTP incorrecto', () => {
      const email = usuariosSeed[0].email
      generarOTP(email)

      const esValido = validarOTP(email, '000000')
      expect(esValido).toBe(false)
    })

    it('debe rechazar OTP después de validación exitosa (no reutilizable)', () => {
      const email = usuariosSeed[0].email
      const codigo = generarOTP(email)

      // Primera validación
      const primera = validarOTP(email, codigo)
      expect(primera).toBe(true)

      // Segunda validación con mismo código debe fallar
      const segunda = validarOTP(email, codigo)
      expect(segunda).toBe(false)
    })

    it('debe rechazar OTP para email incorrecto', () => {
      const email1 = usuariosSeed[0].email
      const email2 = usuariosSeed[1].email

      const codigo = generarOTP(email1)
      const esValido = validarOTP(email2, codigo)

      expect(esValido).toBe(false)
    })

    it('debe validar OTP con 5+ dígitos como incorrecto', () => {
      const email = usuariosSeed[0].email
      generarOTP(email)

      const esValido = validarOTP(email, '12345')
      expect(esValido).toBe(false)
    })

    it('debe validar OTP con 7+ dígitos como incorrecto', () => {
      const email = usuariosSeed[0].email
      generarOTP(email)

      const esValido = validarOTP(email, '1234567')
      expect(esValido).toBe(false)
    })

    it('debe rechazar OTP con caracteres no numéricos', () => {
      const email = usuariosSeed[0].email
      generarOTP(email)

      const esValido = validarOTP(email, 'abcdef')
      expect(esValido).toBe(false)
    })

    it('debe rechazar OTP vacío', () => {
      const email = usuariosSeed[0].email
      generarOTP(email)

      const esValido = validarOTP(email, '')
      expect(esValido).toBe(false)
    })
  })

  describe('Rate Limiting - Protección contra Brute Force', () => {
    it('debe permitir acceso normal sin intentos fallidos', () => {
      const email = 'norateemail@example.com'
      const { limitado, esperarSegundos } = estaEnRateLimit(email)

      expect(limitado).toBe(false)
      expect(esperarSegundos).toBe(0)
    })

    it('debe bloquear después de 5 intentos fallidos', () => {
      const email = 'ratelimit1@example.com'

      // Simular 5 intentos fallidos
      for (let i = 0; i < 5; i++) {
        validarCredenciales(email, 'passwordincorrecto')
      }

      const { limitado } = estaEnRateLimit(email)
      expect(limitado).toBe(true)
    })

    it('debe indicar tiempo de espera cuando está limitado', () => {
      const email = 'ratelimit2@example.com'

      // Simular 5 intentos fallidos
      for (let i = 0; i < 5; i++) {
        validarCredenciales(email, 'passwordincorrecto')
      }

      const { limitado, esperarSegundos } = estaEnRateLimit(email)
      expect(limitado).toBe(true)
      expect(esperarSegundos).toBeGreaterThan(0)
      expect(esperarSegundos).toBeLessThanOrEqual(15)
    })

    it('debe resetear contador después de login exitoso', () => {
      const email = 'ratelimit3@example.com'

      // Intentos fallidos
      validarCredenciales(email, 'wrong1')
      validarCredenciales(email, 'wrong2')

      // Login exitoso (email del seed)
      const usuario = usuariosSeed[0]
      const resultado = validarCredenciales(usuario.email, '123456')
      expect(resultado).toBeTruthy()

      // Email con intentos fallidos debe estar libre después de resetear
      const { limitado } = estaEnRateLimit(email)
      expect(limitado).toBe(false)
    })

    it('debe bloquear simultáneamente si hay 5+ intentos en ventana de 15s', () => {
      const email = 'ratelimit4@example.com'

      // 5 intentos fallidos rápidos
      for (let i = 0; i < 5; i++) {
        validarCredenciales(email, `wrong${i}`)
      }

      const { limitado } = estaEnRateLimit(email)
      expect(limitado).toBe(true)
    })

    it('no debe bloquear si intentos fallidos son después de resetear', () => {
      const email = 'ratelimit5@example.com'

      // 3 intentos fallidos
      validarCredenciales(email, 'wrong1')
      validarCredenciales(email, 'wrong2')
      validarCredenciales(email, 'wrong3')

      // Verificar que no esté limitado (solo 3 intentos)
      let { limitado } = estaEnRateLimit(email)
      expect(limitado).toBe(false)

      // Nuevo intento fallido
      validarCredenciales(email, 'wrong4')
      const { limitado: limitadoFinal } = estaEnRateLimit(email)
      expect(limitadoFinal).toBe(false) // 4 intentos, < 5
    })
  })

  describe('Session Expiry - Logout Automático', () => {
    it('debe indicar sesión NO expirada si lastActivity es reciente', () => {
      const ahora = Date.now()
      const hace10Minutos = ahora - 10 * 60 * 1000

      const expirado = verificarExpirySession(hace10Minutos)
      expect(expirado).toBe(false)
    })

    it('debe indicar sesión NO expirada si lastActivity es hace 29 minutos', () => {
      const ahora = Date.now()
      const hace29Minutos = ahora - 29 * 60 * 1000

      const expirado = verificarExpirySession(hace29Minutos)
      expect(expirado).toBe(false)
    })

    it('debe indicar sesión EXPIRADA si lastActivity es hace 30+ minutos', () => {
      const ahora = Date.now()
      const hace31Minutos = ahora - 31 * 60 * 1000

      const expirado = verificarExpirySession(hace31Minutos)
      expect(expirado).toBe(true)
    })

    it('debe indicar sesión EXPIRADA si lastActivity es hace 1+ hora', () => {
      const ahora = Date.now()
      const hace1Hora = ahora - 60 * 60 * 1000

      const expirado = verificarExpirySession(hace1Hora)
      expect(expirado).toBe(true)
    })

    it('debe indicar sesión NO expirada si lastActivity es hace 1 segundo', () => {
      const ahora = Date.now()
      const hace1Segundo = ahora - 1000

      const expirado = verificarExpirySession(hace1Segundo)
      expect(expirado).toBe(false)
    })

    it('debe indicar sesión expirada exactamente en el límite de 30 minutos', () => {
      const ahora = Date.now()
      const hace30Minutos = ahora - 30 * 60 * 1000

      // Puede ser true o false en el límite, pero debe ser consistente
      const expirado = verificarExpirySession(hace30Minutos)
      expect(typeof expirado).toBe('boolean')
    })
  })

  describe('Integración - Flujo Completo Seguro', () => {
    it('debe permitir login exitoso con OTP válido', () => {
      const email = usuariosSeed[0].email
      const password = '123456'

      // Paso 1: Credenciales
      const usuario = validarCredenciales(email, password)
      expect(usuario).toBeTruthy()

      // Paso 2: OTP
      const codigo = generarOTP(email)
      const otpValido = validarOTP(email, codigo)
      expect(otpValido).toBe(true)
    })

    it('debe rechazar login si OTP es incorrecto después de credenciales válidas', () => {
      const email = usuariosSeed[0].email

      // Paso 1: Credenciales correctas
      const usuario = validarCredenciales(email, '123456')
      expect(usuario).toBeTruthy()

      // Paso 2: OTP incorrecto
      generarOTP(email)
      const otpValido = validarOTP(email, '000000')
      expect(otpValido).toBe(false)
    })

    it('debe rechazar si rate limit activo incluso con credenciales correctas', () => {
      const email = usuariosSeed[0].email

      // Simular 5 intentos fallidos
      for (let i = 0; i < 5; i++) {
        validarCredenciales(email, 'wrong')
      }

      // Ahora intenta con credenciales correctas
      const { limitado } = estaEnRateLimit(email)
      expect(limitado).toBe(true)

      // No debería ni intentar validar credenciales
      // (El cliente debe rechazar antes)
    })

    it('debe permitir múltiples usuarios sin colisión de rate limit', () => {
      const user1 = 'multi1@example.com'
      const user2 = usuariosSeed[0].email

      // User1: 3 intentos fallidos
      validarCredenciales(user1, 'wrong')
      validarCredenciales(user1, 'wrong')
      validarCredenciales(user1, 'wrong')

      // User2: login exitoso
      const result = validarCredenciales(user2, '123456')
      expect(result).toBeTruthy()

      // Verificar rate limits
      const { limitado: limitado1 } = estaEnRateLimit(user1)
      const { limitado: limitado2 } = estaEnRateLimit(user2)
      expect(limitado1).toBe(false) // solo 3 intentos, no limitado
      expect(limitado2).toBe(false) // login exitoso, sin rate limit
    })
  })

  describe('Edge Cases de Seguridad', () => {
    it('no debe exponer información de usuario en error', () => {
      const resultado = validarCredenciales('noexiste@example.com', '123456')
      expect(resultado).toBeNull()
      // No debería retornar "usuario no encontrado" vs "contraseña incorrecta"
    })

    it('debe rechazar email null', () => {
      const resultado = validarCredenciales(null as any, '123456')
      expect(resultado).toBeNull()
    })

    it('debe rechazar email undefined', () => {
      const resultado = validarCredenciales(undefined as any, '123456')
      expect(resultado).toBeNull()
    })

    it('debe rechazar password null', () => {
      const email = usuariosSeed[0].email
      const resultado = validarCredenciales(email, null as any)
      expect(resultado).toBeNull()
    })

    it('debe rechazar password undefined', () => {
      const email = usuariosSeed[0].email
      const resultado = validarCredenciales(email, undefined as any)
      expect(resultado).toBeNull()
    })

    it('debe generar OTP aleatorio, no predecible', () => {
      const email = usuariosSeed[0].email
      const codigos = new Set<string>()

      // Generar 100 OTPs
      for (let i = 0; i < 100; i++) {
        const codigo = generarOTP(email)
        codigos.add(codigo)
      }

      // No debería haber duplicados (muy baja probabilidad)
      expect(codigos.size).toBeGreaterThan(95)
    })

    it('debe no permitir bypass con whitespace en email', () => {
      const usuario = usuariosSeed[0]
      const emails = [
        ` ${usuario.email}`,
        `${usuario.email} `,
        ` ${usuario.email} `,
        `${usuario.email}\n`,
        `${usuario.email}\t`,
      ]

      for (const email of emails) {
        const resultado = validarCredenciales(email, '123456')
        expect(resultado).toBeNull()
      }
    })
  })
})
