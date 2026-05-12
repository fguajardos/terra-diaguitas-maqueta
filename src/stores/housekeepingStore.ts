import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EstadoTareaHousekeeping } from '@/domain/enums';
import type { Incidencia, TareaHousekeeping } from '@/domain/types';
import { crearEvento } from '@/services/trazabilidadService';
import { useTrazabilidadStore } from './trazabilidadStore';
import { useSessionStore } from './sessionStore';

interface HousekeepingState {
  tareas: TareaHousekeeping[];
  hidratar: (tareas: TareaHousekeeping[]) => void;
  porId: (id: string) => TareaHousekeeping | undefined;
  porHabitacion: (habitacionId: string) => TareaHousekeeping[];
  porAsignado: (usuarioId: string) => TareaHousekeeping[];
  porEstado: (estados: EstadoTareaHousekeeping[]) => TareaHousekeeping[];
  agregar: (tarea: TareaHousekeeping) => void;
  asignar: (id: string, usuarioId: string) => { ok: boolean; motivo?: string };
  cambiarEstado: (
    id: string,
    nuevoEstado: EstadoTareaHousekeeping,
  ) => { ok: boolean; motivo?: string };
  agregarIncidencia: (id: string, incidencia: Incidencia) => void;
  reiniciar: (tareas: TareaHousekeeping[]) => void;
}

function generarIdTarea(): string {
  return `tk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const useHousekeepingStore = create<HousekeepingState>()(
  persist(
    (set, get) => ({
      tareas: [],
      hidratar: (tareas) => set({ tareas }),

      porId: (id) => get().tareas.find((t) => t.id === id),
      porHabitacion: (habitacionId) =>
        get().tareas.filter((t) => t.habitacionId === habitacionId),
      porAsignado: (usuarioId) => get().tareas.filter((t) => t.asignadoA === usuarioId),
      porEstado: (estados) => get().tareas.filter((t) => estados.includes(t.estado)),

      agregar: (tarea) => set({ tareas: [...get().tareas, tarea] }),

      asignar: (id, usuarioId) => {
        const tarea = get().tareas.find((t) => t.id === id);
        if (!tarea) return { ok: false, motivo: 'Tarea no encontrada' };

        const session = useSessionStore.getState();
        set({
          tareas: get().tareas.map((t) =>
            t.id === id
              ? {
                  ...t,
                  asignadoA: usuarioId,
                  asignadoPor: session.usuarioActivoId,
                  estado: t.estado === 'pendiente' ? 'asignada' : t.estado,
                }
              : t,
          ),
        });

        useTrazabilidadStore.getState().registrarEvento(
          crearEvento({
            usuarioId: session.usuarioActivoId,
            rolUsuario: session.rolActivo,
            accion: 'asignacion_tarea_housekeeping',
            entidad: 'tarea_housekeeping',
            entidadId: id,
            estadoAnterior: tarea.estado,
            estadoNuevo: 'asignada',
            metadata: { asignadoA: usuarioId },
          }),
        );

        return { ok: true };
      },

      cambiarEstado: (id, nuevoEstado) => {
        const tarea = get().tareas.find((t) => t.id === id);
        if (!tarea) return { ok: false, motivo: 'Tarea no encontrada' };

        const parche: Partial<TareaHousekeeping> = { estado: nuevoEstado };
        const ahora = new Date().toISOString();
        if (nuevoEstado === 'en_progreso' && !tarea.fechaInicio) parche.fechaInicio = ahora;
        if (nuevoEstado === 'completada_pendiente_inspeccion') parche.fechaFinalizacion = ahora;
        if (nuevoEstado === 'aprobada' || nuevoEstado === 'rechazada') {
          parche.fechaInspeccion = ahora;
          parche.inspeccionadoPor = useSessionStore.getState().usuarioActivoId;
        }

        set({
          tareas: get().tareas.map((t) => (t.id === id ? { ...t, ...parche } : t)),
        });

        const session = useSessionStore.getState();
        useTrazabilidadStore.getState().registrarEvento(
          crearEvento({
            usuarioId: session.usuarioActivoId,
            rolUsuario: session.rolActivo,
            accion: 'cambio_estado_tarea_housekeeping',
            entidad: 'tarea_housekeeping',
            entidadId: id,
            estadoAnterior: tarea.estado,
            estadoNuevo: nuevoEstado,
          }),
        );

        return { ok: true };
      },

      agregarIncidencia: (id, incidencia) => {
        const tarea = get().tareas.find((t) => t.id === id);
        if (!tarea) return;
        set({
          tareas: get().tareas.map((t) =>
            t.id === id ? { ...t, incidencias: [...t.incidencias, incidencia] } : t,
          ),
        });

        const session = useSessionStore.getState();
        useTrazabilidadStore.getState().registrarEvento(
          crearEvento({
            usuarioId: session.usuarioActivoId,
            rolUsuario: session.rolActivo,
            accion: 'reporte_incidencia',
            entidad: 'tarea_housekeeping',
            entidadId: id,
            metadata: { tipo: incidencia.tipo, prioridad: incidencia.prioridad },
          }),
        );
      },

      reiniciar: (tareas) => set({ tareas }),
    }),
    { name: 'terra-diaguitas-housekeeping-v1' },
  ),
);

export function nuevaTareaHousekeeping(
  habitacionId: string,
  opciones?: {
    reservaAsociadaId?: string;
    tipo?: TareaHousekeeping['tipo'];
    prioridad?: TareaHousekeeping['prioridad'];
  },
): TareaHousekeeping {
  return {
    id: generarIdTarea(),
    habitacionId,
    reservaAsociadaId: opciones?.reservaAsociadaId,
    estado: 'pendiente',
    prioridad: opciones?.prioridad ?? 'normal',
    asignadoA: undefined,
    asignadoPor: undefined,
    fechaCreacion: new Date().toISOString(),
    fechaInicio: undefined,
    fechaFinalizacion: undefined,
    fechaInspeccion: undefined,
    inspeccionadoPor: undefined,
    tipo: opciones?.tipo ?? 'limpieza_estandar',
    incidencias: [],
    notas: undefined,
  };
}
