import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EstadoHabitacion } from '@/domain/enums';
import type { Habitacion } from '@/domain/types';
import { puedeTransicionarHabitacion } from '@/domain/rules/transicionesEstado';
import { crearEvento } from '@/services/trazabilidadService';
import { useTrazabilidadStore } from './trazabilidadStore';
import { useSessionStore } from './sessionStore';

interface HabitacionesState {
  habitaciones: Habitacion[];
  hidratar: (habitaciones: Habitacion[]) => void;
  porId: (id: string) => Habitacion | undefined;
  cambiarEstado: (
    id: string,
    nuevoEstado: EstadoHabitacion,
    opciones?: { forzar?: boolean; motivo?: string },
  ) => { ok: boolean; motivo?: string };
  actualizar: (id: string, parche: Partial<Habitacion>) => void;
  reiniciar: (habitaciones: Habitacion[]) => void;
}

export const useHabitacionesStore = create<HabitacionesState>()(
  persist(
    (set, get) => ({
      habitaciones: [],
      hidratar: (habitaciones) => set({ habitaciones }),
      porId: (id) => get().habitaciones.find((h) => h.id === id),
      cambiarEstado: (id, nuevoEstado, opciones) => {
        const habitacion = get().habitaciones.find((h) => h.id === id);
        if (!habitacion) return { ok: false, motivo: 'Habitación no encontrada' };

        const transicionValida = puedeTransicionarHabitacion(habitacion.estado, nuevoEstado);
        if (!transicionValida && !opciones?.forzar) {
          return {
            ok: false,
            motivo: `Transición no permitida: ${habitacion.estado} → ${nuevoEstado}`,
          };
        }

        set({
          habitaciones: get().habitaciones.map((h) =>
            h.id === id ? { ...h, estado: nuevoEstado } : h,
          ),
        });

        const session = useSessionStore.getState();
        useTrazabilidadStore.getState().registrarEvento(
          crearEvento({
            usuarioId: session.usuarioActivoId,
            rolUsuario: session.rolActivo,
            accion: 'cambio_estado_habitacion',
            entidad: 'habitacion',
            entidadId: id,
            estadoAnterior: habitacion.estado,
            estadoNuevo: nuevoEstado,
            metadata: opciones?.motivo ? { motivo: opciones.motivo } : undefined,
          }),
        );
        return { ok: true };
      },
      actualizar: (id, parche) =>
        set({
          habitaciones: get().habitaciones.map((h) => (h.id === id ? { ...h, ...parche } : h)),
        }),
      reiniciar: (habitaciones) => set({ habitaciones }),
    }),
    { name: 'terra-diaguitas-habitaciones-v1' },
  ),
);
