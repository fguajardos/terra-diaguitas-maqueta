import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { LoginPageV2 } from './LoginPageV2'
import { usuariosSeed } from '@/data/usuarios.seed'

// Mock de Sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('LoginPageV2 - UI y Flujos de Seguridad', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderización Inicial - Paso 1', () => {
    it('debe renderizar formulario de credenciales al cargar', () => {
      renderWithRouter(<LoginPageV2 />)

      expect(screen.getByText('Iniciar Sesión Segura')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('maria@demo.cl')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('••••••')).toBeInTheDocument()
    })

    it('debe mostrar branding TERRA DIAGUITAS', () => {
      renderWithRouter(<LoginPageV2 />)

      expect(screen.getByText('TERRA DIAGUITAS')).toBeInTheDocument()
      expect(screen.getByText('Vicuña · Valle del Elqui')).toBeInTheDocument()
    })

    it('debe mostrar información de seguridad', () => {
      renderWithRouter(<LoginPageV2 />)

      expect(screen.getByText(/Mínimo 6 caracteres/i)).toBeInTheDocument()
    })

    it('debe mostrar cuentas de demo', () => {
      renderWithRouter(<LoginPageV2 />)

      expect(screen.getByText('Cuentas de demo:')).toBeInTheDocument()
    })
  })

  describe('Flujo de Login Completo - 2FA', () => {
    it('debe permitir flujo completo credential -> OTP', async () => {
      const user = userEvent.setup()
      const { generarOTP } = require('@/services/authService')

      renderWithRouter(<LoginPageV2 />)

      const emailInput = screen.getByPlaceholderText('maria@demo.cl')
      const passwordInput = screen.getByPlaceholderText('••••••')
      const usuario = usuariosSeed[0]

      await user.type(emailInput, usuario.email)
      await user.type(passwordInput, '123456')

      const continueBtn = screen.getByRole('button', { name: /Continuar/i })
      await user.click(continueBtn)

      await waitFor(() => {
        expect(screen.getByText(/Verificación de 2FA/i)).toBeInTheDocument()
      })

      // Generar OTP y verificar
      const codigo = generarOTP(usuario.email)
      const otpInput = screen.getByPlaceholderText('000000')
      await user.type(otpInput, codigo)

      const verifyBtn = screen.getByRole('button', { name: /Verificar/i })
      expect(verifyBtn).not.toBeDisabled()
    })

    it('debe mostrar error con credenciales inválidas', async () => {
      const user = userEvent.setup()
      renderWithRouter(<LoginPageV2 />)

      await user.type(screen.getByPlaceholderText('maria@demo.cl'), 'noexiste@example.com')
      await user.type(screen.getByPlaceholderText('••••••'), '123456')
      await user.click(screen.getByRole('button', { name: /Continuar/i }))

      await waitFor(() => {
        expect(screen.getByText(/Email o contraseña incorrectos/i)).toBeInTheDocument()
      })
    })
  })

  describe('OTP Validation', () => {
    it('debe permitir volver atrás desde OTP', async () => {
      const user = userEvent.setup()
      renderWithRouter(<LoginPageV2 />)

      const usuario = usuariosSeed[0]
      await user.type(screen.getByPlaceholderText('maria@demo.cl'), usuario.email)
      await user.type(screen.getByPlaceholderText('••••••'), '123456')
      await user.click(screen.getByRole('button', { name: /Continuar/i }))

      await waitFor(() => {
        expect(screen.getByText(/Verificación de 2FA/i)).toBeInTheDocument()
      })

      const backBtn = screen.getByRole('button', { name: /Atrás/i })
      await user.click(backBtn)

      await waitFor(() => {
        expect(screen.getByText('Iniciar Sesión Segura')).toBeInTheDocument()
      })
    })

    it('debe rechazar OTP incompleto (< 6 dígitos)', async () => {
      const user = userEvent.setup()
      renderWithRouter(<LoginPageV2 />)

      const usuario = usuariosSeed[0]
      await user.type(screen.getByPlaceholderText('maria@demo.cl'), usuario.email)
      await user.type(screen.getByPlaceholderText('••••••'), '123456')
      await user.click(screen.getByRole('button', { name: /Continuar/i }))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('000000')).toBeInTheDocument()
      })

      const otpInput = screen.getByPlaceholderText('000000')
      await user.type(otpInput, '12345')

      const verifyBtn = screen.getByRole('button', { name: /Verificar/i })
      expect(verifyBtn).toBeDisabled()
    })

    it('debe filtrar no-numéricas en OTP', async () => {
      const user = userEvent.setup()
      renderWithRouter(<LoginPageV2 />)

      const usuario = usuariosSeed[0]
      await user.type(screen.getByPlaceholderText('maria@demo.cl'), usuario.email)
      await user.type(screen.getByPlaceholderText('••••••'), '123456')
      await user.click(screen.getByRole('button', { name: /Continuar/i }))

      await waitFor(() => {
        const otpInput = screen.getByPlaceholderText('000000') as HTMLInputElement
        expect(otpInput).toBeInTheDocument()
      })

      const otpInput = screen.getByPlaceholderText('000000') as HTMLInputElement
      await user.type(otpInput, 'abc123')

      expect(otpInput.value).toBe('123')
    })
  })

  describe('Security Indicators', () => {
    it('debe mostrar "Sesión Segura" en OTP paso', async () => {
      const user = userEvent.setup()
      renderWithRouter(<LoginPageV2 />)

      const usuario = usuariosSeed[0]
      await user.type(screen.getByPlaceholderText('maria@demo.cl'), usuario.email)
      await user.type(screen.getByPlaceholderText('••••••'), '123456')
      await user.click(screen.getByRole('button', { name: /Continuar/i }))

      await waitFor(() => {
        expect(screen.getByText(/Sesión Segura/i)).toBeInTheDocument()
      })
    })

    it('debe indicar OTP válido por 5 minutos', async () => {
      const user = userEvent.setup()
      renderWithRouter(<LoginPageV2 />)

      const usuario = usuariosSeed[0]
      await user.type(screen.getByPlaceholderText('maria@demo.cl'), usuario.email)
      await user.type(screen.getByPlaceholderText('••••••'), '123456')
      await user.click(screen.getByRole('button', { name: /Continuar/i }))

      await waitFor(() => {
        expect(screen.getByText(/El código OTP es válido por 5 minutos/i)).toBeInTheDocument()
      })
    })
  })
})
