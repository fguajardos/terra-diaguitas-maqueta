import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Huesped } from '@/domain/types';

interface HuespedesState {
  huespedes: Huesped[];
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
      hidratar: (huespedes) => set({ huespedes }),
      porId: (id) => get().huespedes.find((h) => h.id === id),
      buscar: (query) => {
        const q = query.trim().toLowerCase();
        if (!q) return get().huespedes;
        return get().huespedes.filter((h) => {
          const nombreCompleto = `${h.nombre} ${h.apellido}`.toLowerCase();
          return (
            nombreCompleto.includes(q) ||
            h.email.toLowerCase().includes(q) ||
            (h.rut && h.rut.toLowerCase().includes(q)) ||
            (h.pasaporte && h.pasaporte.toLowerCase().includes(q))
          );
        });
      },
      agregar: (huesped) => set({ huespedes: [...get().huespedes, huesped] }),
      actualizar: (id, parche) =>
        set({
          huespedes: get().huespedes.map((h) => (h.id === id ? { ...h, ...parche } : h)),
        }),
      reiniciar: (huespedes) => set({ huespedes }),
    }),
    { name: 'terra-diaguitas-huespedes-v1' },
  ),
);
