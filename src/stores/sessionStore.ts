import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Rol } from '@/domain/enums'
import { CAPACIDADES_POR_ROL } from '@/domain/permisos'
import { hotelSeed } from '@/data/hotel.seed'
import { usuariosSeed } from '@/data/usuarios.seed'
import { validarOTP } from '@/services/authService'

interface SessionState {
  // Session
  estaAutenticado: boolean
  rolActivo: Rol
  usuarioActivoId: string
  hotelActivoId: string

  // 2FA
  esperandoOTP: boolean
  emailEnValidacion: string | null

  // Session expiry
  lastActivity: number

  // Actions
  iniciarSesion: (usuarioId: string) => boolean
  cambiarRolRapido: (rol: Rol) => void
  cerrarSesion: () => void
  actualizarActividad: () => void
  iniciar2FA: (email: string) => void
  validarOTPYAutenticar: (usuarioId: string, otp: string) => boolean
  cancelar2FA: () => void
}

function usuarioPorDefectoDeRol(rol: Rol): string {
  return usuariosSeed.find((u) => u.rol === rol)?.id ?? usuariosSeed[0].id
}

const estadoInicial = {
  estaAutenticado: false,
  rolActivo: 'recepcionista' as Rol,
  usuarioActivoId: usuarioPorDefectoDeRol('recepcionista'),
  hotelActivoId: hotelSeed.id,
  esperandoOTP: false,
  emailEnValidacion: null,
  lastActivity: Date.now(),
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      ...estadoInicial,

      iniciarSesion: (usuarioId) => {
        const usuario = usuariosSeed.find((u) => u.id === usuarioId)
        if (!usuario) return false
        set({
          estaAutenticado: true,
          rolActivo: usuario.rol,
          usuarioActivoId: usuario.id,
          esperandoOTP: false,
          emailEnValidacion: null,
          lastActivity: Date.now(),
        })
        return true
      },

      cambiarRolRapido: (rol) => {
        set({
          rolActivo: rol,
          usuarioActivoId: usuarioPorDefectoDeRol(rol),
          lastActivity: Date.now(),
        })
      },

      cerrarSesion: () => {
        set({ ...estadoInicial })
      },

      actualizarActividad: () => {
        set({ lastActivity: Date.now() })
      },

      iniciar2FA: (email) => {
        set({
          esperandoOTP: true,
          emailEnValidacion: email,
        })
      },

      validarOTPYAutenticar: (usuarioId, otp) => {
        const { emailEnValidacion } = get()
        if (!emailEnValidacion) return false

        const esValido = validarOTP(emailEnValidacion, otp)

        if (esValido) {
          const usuario = usuariosSeed.find((u) => u.id === usuarioId)
          if (usuario) {
            set({
              estaAutenticado: true,
              rolActivo: usuario.rol,
              usuarioActivoId: usuario.id,
              esperandoOTP: false,
              emailEnValidacion: null,
              lastActivity: Date.now(),
            })
            return true
          }
        }

        return false
      },

      cancelar2FA: () => {
        set({
          esperandoOTP: false,
          emailEnValidacion: null,
        })
      },
    }),
    { name: 'terra-diaguitas-session-v1' },
  ),
)

export function rutaInicialDeRol(rol: Rol): string {
  return CAPACIDADES_POR_ROL[rol].rutaInicial
}
