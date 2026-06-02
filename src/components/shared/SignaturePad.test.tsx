import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignaturePad } from './SignaturePad'

describe('SignaturePad', () => {
  it('renders canvas and clear button', () => {
    const { container } = render(
      <SignaturePad value={null} onChange={() => {}} />
    )

    expect(container.querySelector('canvas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Borrar/i })).toBeInTheDocument()
  })

  it('disables clear button when value is null', () => {
    render(<SignaturePad value={null} onChange={() => {}} />)

    const clearBtn = screen.getByRole('button', { name: /Borrar/i })
    expect(clearBtn).toBeDisabled()
  })

  it('enables clear button when value is set', () => {
    render(
      <SignaturePad
        value="data:image/png;base64,iVBORw0KGgo="
        onChange={() => {}}
      />
    )

    const clearBtn = screen.getByRole('button', { name: /Borrar/i })
    expect(clearBtn).not.toBeDisabled()
  })

  it('renders with valid data URL', () => {
    const { container } = render(
      <SignaturePad
        value="data:image/png;base64,iVBORw0KGgo="
        onChange={() => {}}
      />
    )

    expect(container.querySelector('canvas')).toBeInTheDocument()
  })

  it('respects disabled prop', () => {
    const { container } = render(
      <SignaturePad value={null} onChange={() => {}} disabled={true} />
    )

    const clearBtn = screen.getByRole('button', { name: /Borrar/i })
    expect(clearBtn).toBeDisabled()
    expect(container.querySelector('canvas')).toHaveClass('opacity-50')
  })

  it('renders without crashing with empty value', () => {
    const { container } = render(
      <SignaturePad value={null} onChange={() => {}} />
    )

    expect(container.querySelector('canvas')).toBeInTheDocument()
  })
})
