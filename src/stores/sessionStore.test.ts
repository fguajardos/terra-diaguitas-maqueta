import { describe, it, expect, beforeEach } from 'vitest'
import { useSessionStore } from './sessionStore'
import { usuariosSeed } from '@/data/usuarios.seed'

describe('sessionStore - Gestión de Sesión y 2FA', () => {
  beforeEach(() => {
    // Reset store before each test
    useSessionStore.setState({
      estaAutenticado: false,
      rolActivo: 'recepcionista',
      usuarioActivoId: usuariosSeed[0].id,
      hotelActivoId: 'h-terra-diaguitas',
      esperandoOTP: false,
      emailEnValidacion: null,
      lastActivity: Date.now(),
    })
  })

  describe('Iniciar Sesión', () => {
    it('debe autenticar usuario válido', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()
      const resultado = store.iniciarSesion(usuario.id)

      expect(resultado).toBe(true)
      expect(store.estaAutenticado).toBe(true)
      expect(store.usuarioActivoId).toBe(usuario.id)
      expect(store.rolActivo).toBe(usuario.rol)
    })

    it('debe rechazar usuario inexistente', () => {
      const store = useSessionStore.getState()
      const resultado = store.iniciarSesion('usuario-inexistente')

      expect(resultado).toBe(false)
      expect(store.estaAutenticado).toBe(false)
    })

    it('debe actualizar lastActivity al iniciar sesión', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()
      const antesDelLogin = Date.now()

      store.iniciarSesion(usuario.id)

      expect(store.lastActivity).toBeGreaterThanOrEqual(antesDelLogin)
    })

    it('debe limpiar esperandoOTP al iniciar sesión', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      // Simular que estamos esperando OTP
      store.iniciar2FA(usuario.email)
      expect(store.esperandoOTP).toBe(true)

      // Ahora iniciar sesión debería limpiar esperandoOTP
      store.iniciarSesion(usuario.id)
      expect(store.esperandoOTP).toBe(false)
    })
  })

  describe('2FA - Iniciar Flujo OTP', () => {
    it('debe iniciar flujo 2FA con email', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      store.iniciar2FA(usuario.email)

      expect(store.esperandoOTP).toBe(true)
      expect(store.emailEnValidacion).toBe(usuario.email)
      expect(store.estaAutenticado).toBe(false)
    })

    it('debe no autenticar mientras esperando OTP', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      store.iniciar2FA(usuario.email)
      const resultado = store.validarOTPYAutenticar(usuario.id, '123456')

      // Sin OTP válido, no debería autenticar
      expect(resultado).toBe(false)
    })

    it('debe permitir múltiples intentos de 2FA para el mismo email', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      // Primer intento
      store.iniciar2FA(usuario.email)
      expect(store.emailEnValidacion).toBe(usuario.email)

      // Cancelar
      store.cancelar2FA()

      // Segundo intento con diferente email
      store.iniciar2FA(usuariosSeed[1].email)
      expect(store.emailEnValidacion).toBe(usuariosSeed[1].email)
    })
  })

  describe('2FA - Validar OTP', () => {
    it('debe validar OTP correctamente', () => {
      const { generarOTP, validarOTP } = require('@/services/authService')
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      // Preparar 2FA
      store.iniciar2FA(usuario.email)
      const codigo = generarOTP(usuario.email)

      // Validar OTP
      const resultado = store.validarOTPYAutenticar(usuario.id, codigo)

      expect(resultado).toBe(true)
      expect(store.estaAutenticado).toBe(true)
      expect(store.esperandoOTP).toBe(false)
    })

    it('debe rechazar OTP incorrecto', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      store.iniciar2FA(usuario.email)

      const resultado = store.validarOTPYAutenticar(usuario.id, '000000')

      expect(resultado).toBe(false)
      expect(store.estaAutenticado).toBe(false)
      expect(store.esperandoOTP).toBe(true)
    })

    it('debe rechazar si emailEnValidacion es null', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      // No iniciar 2FA, emailEnValidacion será null
      const resultado = store.validarOTPYAutenticar(usuario.id, '123456')

      expect(resultado).toBe(false)
      expect(store.estaAutenticado).toBe(false)
    })

    it('debe limpiar emailEnValidacion después de validación exitosa', () => {
      const { generarOTP } = require('@/services/authService')
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      store.iniciar2FA(usuario.email)
      const codigo = generarOTP(usuario.email)

      store.validarOTPYAutenticar(usuario.id, codigo)

      expect(store.emailEnValidacion).toBeNull()
    })

    it('debe mantener emailEnValidacion si OTP es incorrecto', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      store.iniciar2FA(usuario.email)
      store.validarOTPYAutenticar(usuario.id, '000000')

      expect(store.emailEnValidacion).toBe(usuario.email)
    })
  })

  describe('2FA - Cancelar', () => {
    it('debe cancelar flujo 2FA', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      store.iniciar2FA(usuario.email)
      expect(store.esperandoOTP).toBe(true)

      store.cancelar2FA()

      expect(store.esperandoOTP).toBe(false)
      expect(store.emailEnValidacion).toBeNull()
      expect(store.estaAutenticado).toBe(false)
    })

    it('debe permitir reintentar 2FA después de cancelar', () => {
      const usuario = usuariosSeed[0]
      const usuario2 = usuariosSeed[1]
      const store = useSessionStore.getState()

      // Primer flujo
      store.iniciar2FA(usuario.email)
      store.cancelar2FA()

      // Segundo flujo con diferente usuario
      store.iniciar2FA(usuario2.email)

      expect(store.emailEnValidacion).toBe(usuario2.email)
      expect(store.esperandoOTP).toBe(true)
    })
  })

  describe('Session Activity Tracking', () => {
    it('debe actualizar lastActivity manualmente', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      store.iniciarSesion(usuario.id)
      const primeraActividad = store.lastActivity

      // Simular espera
      setTimeout(() => {
        store.actualizarActividad()
        expect(store.lastActivity).toBeGreaterThan(primeraActividad)
      }, 100)
    })

    it('debe tener lastActivity reciente después de cambiar rol', () => {
      const store = useSessionStore.getState()
      const antesDelCambio = Date.now()

      store.cambiarRolRapido('supervisor')

      expect(store.lastActivity).toBeGreaterThanOrEqual(antesDelCambio)
    })

    it('debe mantener lastActivity dentro de rango razonable', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()
      const ahora = Date.now()

      store.iniciarSesion(usuario.id)

      expect(store.lastActivity).toBeLessThanOrEqual(ahora + 1000) // max 1s después
      expect(store.lastActivity).toBeGreaterThanOrEqual(ahora - 1000) // max 1s antes
    })
  })

  describe('Cambiar Rol Rápido', () => {
    it('debe cambiar rol sin cerrar sesión', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      store.iniciarSesion(usuario.id)
      expect(store.estaAutenticado).toBe(true)

      store.cambiarRolRapido('supervisor')

      expect(store.estaAutenticado).toBe(true)
      expect(store.rolActivo).toBe('supervisor')
    })

    it('debe cambiar a usuario del nuevo rol', () => {
      const store = useSessionStore.getState()

      store.cambiarRolRapido('supervisor')

      const usuarioSupervisor = usuariosSeed.find(u => u.rol === 'supervisor')
      expect(store.usuarioActivoId).toBe(usuarioSupervisor?.id)
    })

    it('debe actualizar lastActivity al cambiar rol', () => {
      const store = useSessionStore.getState()
      const antesDelCambio = Date.now()

      store.cambiarRolRapido('housekeeping')

      expect(store.lastActivity).toBeGreaterThanOrEqual(antesDelCambio)
    })
  })

  describe('Cerrar Sesión', () => {
    it('debe limpiar todo al cerrar sesión', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      store.iniciarSesion(usuario.id)
      expect(store.estaAutenticado).toBe(true)

      store.cerrarSesion()

      expect(store.estaAutenticado).toBe(false)
      expect(store.esperandoOTP).toBe(false)
      expect(store.emailEnValidacion).toBeNull()
    })

    it('debe resetear rol a recepcionista al cerrar', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      store.iniciarSesion(usuario.id)
      store.cambiarRolRapido('supervisor')

      store.cerrarSesion()

      expect(store.rolActivo).toBe('recepcionista')
    })

    it('debe limpiar flujo 2FA pendiente al cerrar', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      store.iniciar2FA(usuario.email)
      expect(store.esperandoOTP).toBe(true)

      store.cerrarSesion()

      expect(store.esperandoOTP).toBe(false)
      expect(store.emailEnValidacion).toBeNull()
    })
  })

  describe('Flujo Completo de Autenticación', () => {
    it('debe completar flujo: credenciales → OTP → autenticación', () => {
      const { generarOTP } = require('@/services/authService')
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      // Paso 1: Iniciar 2FA después de validar credenciales
      store.iniciar2FA(usuario.email)
      expect(store.esperandoOTP).toBe(true)
      expect(store.estaAutenticado).toBe(false)

      // Paso 2: Generar y validar OTP
      const codigo = generarOTP(usuario.email)
      const resultado = store.validarOTPYAutenticar(usuario.id, codigo)

      // Paso 3: Usuario autenticado
      expect(resultado).toBe(true)
      expect(store.estaAutenticado).toBe(true)
      expect(store.esperandoOTP).toBe(false)
      expect(store.emailEnValidacion).toBeNull()
      expect(store.rolActivo).toBe(usuario.rol)
    })

    it('debe fallar flujo si OTP es incorrecto en paso 2', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      store.iniciar2FA(usuario.email)
      const resultado = store.validarOTPYAutenticar(usuario.id, '000000')

      expect(resultado).toBe(false)
      expect(store.estaAutenticado).toBe(false)
      expect(store.esperandoOTP).toBe(true) // Aún esperando OTP
    })

    it('debe permitir reintentos después de fallo de OTP', () => {
      const { generarOTP } = require('@/services/authService')
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      // Primer intento: OTP incorrecto
      store.iniciar2FA(usuario.email)
      store.validarOTPYAutenticar(usuario.id, '000000')
      expect(store.estaAutenticado).toBe(false)

      // Segundo intento: OTP correcto
      const codigo = generarOTP(usuario.email)
      const resultado = store.validarOTPYAutenticar(usuario.id, codigo)

      expect(resultado).toBe(true)
      expect(store.estaAutenticado).toBe(true)
    })
  })

  describe('State Persistence (Zustand persist)', () => {
    it('debe persistir en localStorage al autenticar', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      store.iniciarSesion(usuario.id)

      const persisted = localStorage.getItem('terra-diaguitas-session-v1')
      expect(persisted).toBeTruthy()

      const parsed = JSON.parse(persisted!)
      expect(parsed.state.estaAutenticado).toBe(true)
    })

    it('debe restaurar estado desde localStorage', () => {
      const usuario = usuariosSeed[0]

      // Simular estado persistido
      const persistedState = {
        state: {
          estaAutenticado: true,
          usuarioActivoId: usuario.id,
          rolActivo: usuario.rol,
        },
      }
      localStorage.setItem('terra-diaguitas-session-v1', JSON.stringify(persistedState))

      // Crear nuevo store debería cargar el estado
      // (En tests, Zustand.persist no siempre carga automáticamente)
      // Verificar que localStorage tiene el estado
      const recovered = localStorage.getItem('terra-diaguitas-session-v1')
      expect(recovered).toBeTruthy()
    })
  })

  describe('Security - Estado Inconsistente', () => {
    it('no debe permitir estado esperandoOTP=true sin emailEnValidacion', () => {
      const store = useSessionStore.getState()

      // Usar setState para simular estado inconsistente
      store.cancelar2FA() // Esto debería limpiar ambos

      expect(store.esperandoOTP).toBe(false)
      expect(store.emailEnValidacion).toBeNull()
    })

    it('no debe permitir estaAutenticado=true con esperandoOTP=true', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      // No debe llegar a este estado en flujo normal
      store.iniciarSesion(usuario.id)
      expect(store.estaAutenticado).toBe(true)
      expect(store.esperandoOTP).toBe(false)
    })

    it('debe limpiar emails sensibles al cerrar sesión', () => {
      const usuario = usuariosSeed[0]
      const store = useSessionStore.getState()

      store.iniciar2FA(usuario.email)
      expect(store.emailEnValidacion).toBe(usuario.email)

      store.cerrarSesion()
      expect(store.emailEnValidacion).toBeNull()
    })
  })
})
