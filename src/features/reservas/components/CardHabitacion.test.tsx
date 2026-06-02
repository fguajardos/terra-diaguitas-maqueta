import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardHabitacion } from './CardHabitacion'
import type { Habitacion } from '@/domain/types'

const habitacionMock: Habitacion = {
  id: 'hab-1',
  hotelId: 'hotel-1',
  numero: '101',
  piso: 1,
  tipo: 'doble',
  capacidadMaxima: 2,
  tarifaBase: 150000,
  estado: 'disponible',
  caracteristicas: ['WiFi', 'Aire acondicionado', 'Minibar'],
}

describe('CardHabitacion', () => {
  it('renders with correct information', () => {
    const { container } = render(
      <CardHabitacion
        habitacion={habitacionMock}
        seleccionada={false}
        onClick={() => {}}
      />
    )

    expect(screen.getByText('Habitación 101')).toBeInTheDocument()
    expect(screen.getByText('Piso 1')).toBeInTheDocument()
    expect(screen.getByText('2 huéspedes')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('shows selected state with ring styling', () => {
    const { container } = render(
      <CardHabitacion
        habitacion={habitacionMock}
        seleccionada={true}
        onClick={() => {}}
      />
    )

    expect(container.querySelector('.ring-2')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <CardHabitacion
        habitacion={habitacionMock}
        seleccionada={false}
        onClick={onClick}
      />
    )

    await user.click(screen.getByText('Habitación 101').closest('div')!)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('displays characteristics', () => {
    render(
      <CardHabitacion
        habitacion={habitacionMock}
        seleccionada={false}
        onClick={() => {}}
      />
    )

    expect(screen.getByText(/WiFi · Aire acondicionado · Minibar/)).toBeInTheDocument()
  })

  it('renders without characteristics if empty', () => {
    const habitacionSinCaracteristicas: Habitacion = {
      ...habitacionMock,
      caracteristicas: [],
    }

    render(
      <CardHabitacion
        habitacion={habitacionSinCaracteristicas}
        seleccionada={false}
        onClick={() => {}}
      />
    )

    // Should not render any characteristicas text
    expect(screen.queryByText(/·/)).not.toBeInTheDocument()
  })
})
