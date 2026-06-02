import Fuse from 'fuse.js'
import type { Huesped } from '@/domain/types'

export class SearchIndexHuespedes {
  private fuse: Fuse<Huesped>
  private huespedes: Huesped[]

  constructor(huespedes: Huesped[]) {
    this.huespedes = huespedes
    this.fuse = this.crearIndice(huespedes)
  }

  private crearIndice(huespedes: Huesped[]) {
    return new Fuse(huespedes, {
      keys: [
        { name: 'nombre', weight: 0.3 },
        { name: 'apellido', weight: 0.3 },
        { name: 'email', weight: 0.2 },
        { name: 'rut', weight: 0.1 },
        { name: 'pasaporte', weight: 0.1 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2,
    })
  }

  buscar(query: string): Huesped[] {
    const q = query.trim()
    if (!q) return this.huespedes

    const resultados = this.fuse.search(q)
    return resultados.map((r) => r.item)
  }

  actualizar(huespedes: Huesped[]) {
    this.huespedes = huespedes
    this.fuse = this.crearIndice(huespedes)
  }
}
