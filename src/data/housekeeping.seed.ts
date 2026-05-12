import type { TareaHousekeeping } from '@/domain/types';
import type { EstadoTareaHousekeeping, PrioridadTarea, TipoTareaHousekeeping } from '@/domain/enums';
import { habitacionesSeed } from './habitaciones.seed';
import { usuariosSeed } from './usuarios.seed';

// 15 tareas housekeeping según sección 7.5

const HOY = new Date();
HOY.setHours(8, 0, 0, 0);

function isoDateTime(hoursOffset: number): string {
  const d = new Date(HOY);
  d.setHours(d.getHours() + hoursOffset);
  return d.toISOString();
}

const housekeepers = usuariosSeed.filter((u) => u.rol === 'housekeeping');
const supervisor = usuariosSeed.find((u) => u.rol === 'supervisor');

interface Plantilla {
  estado: EstadoTareaHousekeeping;
  cantidad: number;
  conAsignacion: boolean;
  tipo: TipoTareaHousekeeping;
  prioridad: PrioridadTarea;
  incidencia: boolean;
}

const plantillas: Plantilla[] = [
  { estado: 'pendiente', cantidad: 5, conAsignacion: false, tipo: 'limpieza_estandar', prioridad: 'normal', incidencia: false },
  { estado: 'asignada', cantidad: 4, conAsignacion: true, tipo: 'limpieza_estandar', prioridad: 'normal', incidencia: false },
  { estado: 'en_progreso', cantidad: 3, conAsignacion: true, tipo: 'limpieza_estandar', prioridad: 'alta', incidencia: false },
  { estado: 'completada_pendiente_inspeccion', cantidad: 2, conAsignacion: true, tipo: 'limpieza_estandar', prioridad: 'normal', incidencia: false },
  { estado: 'asignada', cantidad: 1, conAsignacion: true, tipo: 'mantenimiento', prioridad: 'urgente', incidencia: true },
];

// Las tareas usan habitaciones cuyo estado de habitación esté en
// pendiente_limpieza / en_limpieza / inspeccion_pendiente / en_mantenimiento.
// Para el seed nos basta con tomar las primeras 15 habitaciones.

function buildTareas(): TareaHousekeeping[] {
  const tareas: TareaHousekeeping[] = [];
  let habIdx = 0;
  let counter = 1;

  for (const plantilla of plantillas) {
    for (let i = 0; i < plantilla.cantidad; i++) {
      const habitacion = habitacionesSeed[habIdx % habitacionesSeed.length];
      habIdx++;

      const asignadoA = plantilla.conAsignacion
        ? housekeepers[i % housekeepers.length].id
        : undefined;

      const incidencias = plantilla.incidencia
        ? [
            {
              id: `inc-${counter}`,
              tipo: 'mantenimiento' as const,
              descripcion: 'Llave de la ducha gotea — requiere revisión de gasfitería.',
              fechaReporte: isoDateTime(-2),
              reportadoPor: asignadoA ?? housekeepers[0].id,
              estado: 'abierta' as const,
              prioridad: 'alta' as const,
              fotosUrls: [],
            },
          ]
        : [];

      tareas.push({
        id: `tk-${counter}`,
        habitacionId: habitacion.id,
        reservaAsociadaId: undefined,
        estado: plantilla.estado,
        prioridad: plantilla.prioridad,
        asignadoA,
        asignadoPor: plantilla.conAsignacion ? supervisor?.id : undefined,
        fechaCreacion: isoDateTime(-4 - i),
        fechaInicio: plantilla.estado === 'en_progreso' || plantilla.estado === 'completada_pendiente_inspeccion'
          ? isoDateTime(-2)
          : undefined,
        fechaFinalizacion: plantilla.estado === 'completada_pendiente_inspeccion'
          ? isoDateTime(-1)
          : undefined,
        fechaInspeccion: undefined,
        inspeccionadoPor: undefined,
        tipo: plantilla.tipo,
        incidencias,
        notas: undefined,
      });
      counter++;
    }
  }

  return tareas;
}

export const tareasHousekeepingSeed: TareaHousekeeping[] = buildTareas();
