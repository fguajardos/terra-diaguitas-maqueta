import { describe, it, expect } from 'vitest'
import { SearchIndexHuespedes } from './searchIndex'
import type { Huesped } from '@/domain/types'

const huespedesMock: Huesped[] = [
  {
    id: 'h-1',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@example.com',
    rut: '12345678-9',
    telefono: '+56912345678',
    nacionalidad: 'Chile',
    idiomaPreferido: 'es',
    preferencias: [],
    fechaRegistro: '2026-06-01T00:00:00Z',
  },
  {
    id: 'h-2',
    nombre: 'María',
    apellido: 'González',
    email: 'maria.gonzalez@example.com',
    rut: '98765432-1',
    telefono: '+56987654321',
    nacionalidad: 'Chile',
    idiomaPreferido: 'es',
    preferencias: [],
    fechaRegistro: '2026-06-01T00:00:00Z',
  },
  {
    id: 'h-3',
    nombre: 'Carlos',
    apellido: 'López',
    email: 'carlos.lopez@test.com',
    pasaporte: 'ABC123456',
    telefono: '+54911234567',
    nacionalidad: 'Argentina',
    idiomaPreferido: 'es',
    preferencias: [],
    fechaRegistro: '2026-06-01T00:00:00Z',
  },
]

describe('SearchIndexHuespedes', () => {
  it('finds by exact name match', () => {
    const index = new SearchIndexHuespedes(huespedesMock)
    const resultados = index.buscar('Juan')

    expect(resultados.length).toBe(1)
    expect(resultados[0].nombre).toBe('Juan')
  })

  it('finds by partial name match (fuzzy)', () => {
    const index = new SearchIndexHuespedes(huespedesMock)
    const resultados = index.buscar('Jua')

    expect(resultados.length).toBeGreaterThan(0)
    expect(resultados[0].nombre).toBe('Juan')
  })

  it('finds by email', () => {
    const index = new SearchIndexHuespedes(huespedesMock)
    const resultados = index.buscar('maria.gonzalez')

    expect(resultados.length).toBeGreaterThan(0)
    expect(resultados[0].email).toContain('maria.gonzalez')
  })

  it('finds by RUT', () => {
    const index = new SearchIndexHuespedes(huespedesMock)
    const resultados = index.buscar('12345678')

    expect(resultados.length).toBeGreaterThan(0)
    expect(resultados[0].rut).toContain('12345678')
  })

  it('finds by apellido', () => {
    const index = new SearchIndexHuespedes(huespedesMock)
    const resultados = index.buscar('Pérez')

    expect(resultados.length).toBeGreaterThan(0)
    expect(resultados[0].apellido).toBe('Pérez')
  })

  it('returns all huespedes on empty query', () => {
    const index = new SearchIndexHuespedes(huespedesMock)
    const resultados = index.buscar('')

    expect(resultados.length).toBe(3)
  })

  it('handles case insensitive search', () => {
    const index = new SearchIndexHuespedes(huespedesMock)
    const resultados = index.buscar('JUAN')

    expect(resultados.length).toBeGreaterThan(0)
    expect(resultados[0].nombre).toBe('Juan')
  })

  it('handles whitespace trimming', () => {
    const index = new SearchIndexHuespedes(huespedesMock)
    const resultados = index.buscar('  Juan  ')

    expect(resultados.length).toBeGreaterThan(0)
  })

  it('updates index when data changes', () => {
    const index = new SearchIndexHuespedes(huespedesMock)

    const nuevoHuesped: Huesped = {
      id: 'h-4',
      nombre: 'Diego',
      apellido: 'Martínez',
      email: 'diego@example.com',
      telefono: '+56911223344',
      nacionalidad: 'Chile',
      idiomaPreferido: 'es',
      preferencias: [],
      fechaRegistro: '2026-06-01T00:00:00Z',
    }

    index.actualizar([...huespedesMock, nuevoHuesped])
    const resultados = index.buscar('Diego')

    expect(resultados.length).toBeGreaterThan(0)
    expect(resultados[0].nombre).toBe('Diego')
  })

  it('handles typos in search (fuzzy matching)', () => {
    const index = new SearchIndexHuespedes(huespedesMock)
    // "Prez" is close to "Pérez"
    const resultados = index.buscar('Prez')

    expect(resultados.length).toBeGreaterThan(0)
  })

  it('returns empty on no match', () => {
    const index = new SearchIndexHuespedes(huespedesMock)
    const resultados = index.buscar('xyz123nonexistent')

    expect(resultados.length).toBe(0)
  })
})
