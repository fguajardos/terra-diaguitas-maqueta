import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Huesped } from '@/domain/types';
import { SearchIndexHuespedes } from '@/lib/searchIndex';

interface HuespedesState {
  huespedes: Huesped[];
  searchIndex: SearchIndexHuespedes | null;
  hidratar: (huespedes: Huesped[]) => void;
  porId: (id: string) => Huesped | undefined;
  buscar: (query: string) => Huesped[];
  agregar: (huesped: Huesped) => void;
  actualizar: (id: string, parche: Partial<Huesped>) => void;
  reiniciar: (huespedes: Huesped[]) => void;
}

export const useHuespedesStore = create<HuespedesState>()(
  persist(
    (set, get) => ({
      huespedes: [],
      searchIndex: null,
      hidratar: (huespedes) => {
        set({
          huespedes,
          searchIndex: new SearchIndexHuespedes(huespedes),
        });
      },
      porId: (id) => get().huespedes.find((h) => h.id === id),
      buscar: (query) => {
        const { searchIndex, huespedes } = get();
        if (!searchIndex) return huespedes.filter(h => {
          const q = query.trim().toLowerCase();
          return (
            h.nombre.toLowerCase().includes(q) ||
            h.apellido.toLowerCase().includes(q) ||
            h.email.toLowerCase().includes(q) ||
            (h.rut && h.rut.toLowerCase().includes(q)) ||
            (h.pasaporte && h.pasaporte.toLowerCase().includes(q))
          );
        });
        return searchIndex.buscar(query);
      },
      agregar: (huesped) => {
        const nuevoArray = [...get().huespedes, huesped];
        set({
          huespedes: nuevoArray,
          searchIndex: new SearchIndexHuespedes(nuevoArray),
        });
      },
      actualizar: (id, parche) => {
        const nuevoArray = get().huespedes.map((h) =>
          h.id === id ? { ...h, ...parche } : h
        );
        set({
          huespedes: nuevoArray,
          searchIndex: new SearchIndexHuespedes(nuevoArray),
        });
      },
      reiniciar: (huespedes) => {
        set({
          huespedes,
          searchIndex: new SearchIndexHuespedes(huespedes),
        });
      },
    }),
    { name: 'terra-diaguitas-huespedes-v1' },
  ),
);
