import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TimelineBitacora } from './TimelineBitacora'
import type { EventoBitacora } from '@/domain/types'

const eventosMock: EventoBitacora[] = [
  {
    id: 'ev-1',
    timestamp: '2026-06-02T10:00:00Z',
    usuarioId: 'user-1',
    rolUsuario: 'recepcionista',
    accion: 'creacion_reserva',
    entidad: 'reserva',
    entidadId: 'res-1',
    estadoNuevo: 'pendiente',
  },
  {
    id: 'ev-2',
    timestamp: '2026-06-02T10:05:00Z',
    usuarioId: 'user-1',
    rolUsuario: 'recepcionista',
    accion: 'cambio_estado_reserva',
    entidad: 'reserva',
    entidadId: 'res-1',
    estadoAnterior: 'pendiente',
    estadoNuevo: 'confirmada',
  },
]

describe('TimelineBitacora', () => {
  it('renders empty state when no eventos', () => {
    const { container } = render(<TimelineBitacora eventos={[]} />)
    expect(screen.getByText('No hay eventos registrados aún.')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders eventos in timeline', () => {
    const { container } = render(<TimelineBitacora eventos={eventosMock} />)

    expect(screen.getByText('creacion_reserva')).toBeInTheDocument()
    expect(screen.getByText('cambio_estado_reserva')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('displays rol del usuario', () => {
    const { container } = render(<TimelineBitacora eventos={eventosMock} />)

    // TimelineBitacora shows "Por {rolUsuario}"
    expect(container.textContent).toMatch(/recepcionista/)
  })

  it('displays timestamps for eventos', () => {
    const { container } = render(<TimelineBitacora eventos={eventosMock} />)

    // Should display formatted timestamps (date-fns formats it)
    expect(container.textContent).toMatch(/2026/)
  })

  it('shows state transitions when estadoAnterior and estadoNuevo exist', () => {
    render(<TimelineBitacora eventos={eventosMock} />)

    // The second evento has both states
    expect(screen.getByText(/pendiente/)).toBeInTheDocument()
    expect(screen.getByText(/confirmada/)).toBeInTheDocument()
  })

  it('handles eventos with only estadoNuevo', () => {
    const eventoSoloNuevo: EventoBitacora = {
      id: 'ev-3',
      timestamp: '2026-06-02T11:00:00Z',
      usuarioId: 'user-2',
      rolUsuario: 'supervisor',
      accion: 'creacion_reserva',
      entidad: 'reserva',
      entidadId: 'res-2',
      estadoNuevo: 'pendiente',
    }

    render(<TimelineBitacora eventos={[eventoSoloNuevo]} />)
    expect(screen.getByText('creacion_reserva')).toBeInTheDocument()
  })

  it('renders multiple eventos vertically', () => {
    const { container } = render(<TimelineBitacora eventos={eventosMock} />)

    const timelines = container.querySelectorAll('.w-1.h-8.bg-border')
    // Should have N-1 vertical lines for N eventos
    expect(timelines.length).toBe(eventosMock.length - 1)
  })
})
