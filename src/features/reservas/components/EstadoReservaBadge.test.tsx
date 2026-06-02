import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EstadoReservaBadge } from './EstadoReservaBadge'
import type { EstadoReserva } from '@/domain/enums'

describe('EstadoReservaBadge', () => {
  it('renders pendiente estado', () => {
    const { container } = render(<EstadoReservaBadge estado="pendiente" />)
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders confirmada estado', () => {
    const { container } = render(<EstadoReservaBadge estado="confirmada" />)
    expect(screen.getByText('Confirmada')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders pagada estado', () => {
    const { container } = render(<EstadoReservaBadge estado="pagada" />)
    expect(screen.getByText('Pagada')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders cancelada estado', () => {
    const { container } = render(<EstadoReservaBadge estado="cancelada" />)
    expect(screen.getByText('Cancelada')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders check_in_realizado estado', () => {
    const { container } = render(<EstadoReservaBadge estado="check_in_realizado" />)
    expect(screen.getByText('Check-in realizado')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('accepts custom variant prop', () => {
    const { container } = render(
      <EstadoReservaBadge estado="pendiente" variant="outline" />
    )
    expect(container).toMatchSnapshot()
  })

  const estados: EstadoReserva[] = [
    'pendiente',
    'confirmada',
    'pagada',
    'check_in_realizado',
    'check_out_realizado',
    'cancelada',
    'no_show',
  ]

  estados.forEach((estado) => {
    it(`renders ${estado} without crashing`, () => {
      render(<EstadoReservaBadge estado={estado} />)
      expect(screen.getByText(/./)).toBeInTheDocument()
    })
  })
})
