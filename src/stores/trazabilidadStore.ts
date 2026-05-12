import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EntidadBitacora } from '@/domain/enums';
import type { EventoBitacora } from '@/domain/types';

interface TrazabilidadState {
  eventos: EventoBitacora[];
  registrarEvento: (evento: EventoBitacora) => void;
  eventosPorEntidad: (entidad: EntidadBitacora, entidadId: string) => EventoBitacora[];
  reiniciar: () => void;
}

export const useTrazabilidadStore = create<TrazabilidadState>()(
  persist(
    (set, get) => ({
      eventos: [],
      registrarEvento: (evento) => set({ eventos: [...get().eventos, evento] }),
      eventosPorEntidad: (entidad, entidadId) =>
        get()
          .eventos.filter((e) => e.entidad === entidad && e.entidadId === entidadId)
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
      reiniciar: () => set({ eventos: [] }),
    }),
    { name: 'terra-diaguitas-trazabilidad-v1' },
  ),
);
