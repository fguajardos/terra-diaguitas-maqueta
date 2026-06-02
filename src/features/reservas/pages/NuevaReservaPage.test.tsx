import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { NuevaReservaPage } from './NuevaReservaPage'

// Mock stores
vi.mock('@/stores/habitacionesStore', () => ({
  useHabitacionesStore: vi.fn((selector) =>
    selector({
      habitaciones: [
        {
          id: 'hab-1',
          hotelId: 'hotel-1',
          numero: 101,
          piso: 1,
          tipo: 'doble',
          capacidadMaxima: 2,
          tarifaBase: 150000,
          estado: 'disponible',
          caracteristicas: ['WiFi', 'Aire acondicionado'],
        },
      ],
    })
  ),
}))

vi.mock('@/stores/reservasStore', () => ({
  useReservasStore: vi.fn((selector) =>
    selector({
      reservas: [],
    })
  ),
}))

vi.mock('@/stores/sessionStore', () => ({
  useSessionStore: vi.fn((selector) =>
    selector({
      hotelActivoId: 'hotel-1',
    })
  ),
}))

// Mock services
vi.mock('@/services/reservasCoordinationService', () => ({
  crearReservaYReservarHabitacion: vi.fn(() => ({
    ok: true,
    reserva: {
      id: 'res-1',
      codigo: 'RES-001-2026',
      estado: 'confirmada',
    },
  })),
}))

vi.mock('@/domain/rules/disponibilidad', () => ({
  habitacionDisponibleEnRango: vi.fn(() => true),
}))

vi.mock('@/domain/rules/tarifas', () => ({
  calcularTotalDesdeFechas: vi.fn(() => ({
    noches: 2,
    total: 300000,
  })),
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('NuevaReservaPage - Happy Path', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders paso 1 initially with wizard header', () => {
    renderWithRouter(<NuevaReservaPage />)

    expect(screen.getByText('Nueva Reserva')).toBeInTheDocument()
    expect(screen.getByText('Paso 1 de 3')).toBeInTheDocument()
  })

  it('disables continuar button on paso 1 initially', () => {
    renderWithRouter(<NuevaReservaPage />)

    const continuarBtn = screen.getByRole('button', { name: /Continuar/i })
    expect(continuarBtn).toBeDisabled()
  })

  it('shows progress bar for all 3 pasos', () => {
    const { container } = renderWithRouter(<NuevaReservaPage />)

    // Check that there are 3 progress bar segments
    const progressBars = container.querySelectorAll('.h-2.rounded-full')
    expect(progressBars.length).toBe(3)
  })

  it('navigates to /reservas when clicking Cancelar on paso 1', async () => {
    const user = userEvent.setup()
    renderWithRouter(<NuevaReservaPage />)

    const cancelarBtn = screen.getAllByRole('button').find(
      (btn) => btn.textContent === 'Cancelar'
    ) || screen.getByRole('button', { name: /Cancelar/i })
    await user.click(cancelarBtn)

    expect(mockNavigate).toHaveBeenCalledWith('/reservas')
  })

  it('shows paso 1 of 3 initially', () => {
    renderWithRouter(<NuevaReservaPage />)

    // Note: Since Paso1Fechas and other subcomponents are full components,
    // this test demonstrates the structure but full integration would require
    // mocking the date inputs and form fields in those subcomponents.
    // In a real scenario, this would be tested via e2e or with full component tree mocking.

    expect(screen.getByText('Paso 1 de 3')).toBeInTheDocument()
  })
})
