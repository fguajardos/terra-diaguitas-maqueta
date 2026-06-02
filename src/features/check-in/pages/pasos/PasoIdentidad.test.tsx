import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PasoIdentidad from './PasoIdentidad'
import type { Huesped } from '@/domain/types'

const huespedMock: Huesped = {
  id: 'h-1',
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan@example.com',
  telefono: '+56912345678',
  rut: '12345678-9',
  nacionalidad: 'Chile',
  idiomaPreferido: 'es',
  preferencias: [],
  fechaRegistro: '2026-06-01T00:00:00Z',
}

describe('PasoIdentidad', () => {
  it('renders without crashing', () => {
    render(
      <PasoIdentidad
        datos={{ identidadVerificada: false }}
        setDatos={() => {}}
        huesped={huespedMock}
      />
    )

    expect(screen.getByText('Verificación de Identidad')).toBeInTheDocument()
  })

  it('displays huésped information', () => {
    render(
      <PasoIdentidad
        datos={{ identidadVerificada: false }}
        setDatos={() => {}}
        huesped={huespedMock}
      />
    )

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('juan@example.com')).toBeInTheDocument()
  })

  it('displays RUT badge', () => {
    const { container } = render(
      <PasoIdentidad
        datos={{ identidadVerificada: false }}
        setDatos={() => {}}
        huesped={huespedMock}
      />
    )

    expect(container.textContent).toMatch(/RUT/)
  })

  it('renders with identity checkbox', () => {
    render(
      <PasoIdentidad
        datos={{ identidadVerificada: false }}
        setDatos={() => {}}
        huesped={huespedMock}
      />
    )

    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('renders snapshot', () => {
    const { container } = render(
      <PasoIdentidad
        datos={{ identidadVerificada: false }}
        setDatos={() => {}}
        huesped={huespedMock}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
