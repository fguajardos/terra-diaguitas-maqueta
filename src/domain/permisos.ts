// Segregación funcional por rol (basado en §8 mapa de rutas y tabla 1 del documento).
// Esta es la "fuente de verdad" para qué ve y qué puede hacer cada rol.
import type { Rol } from './enums';

export interface CapacidadesRol {
  rol: Rol;
  titulo: string;
  subtitulo: string;
  capacidades: string[];
  restricciones: string[];
  rutaInicial: string;
}

export const CAPACIDADES_POR_ROL: Record<Rol, CapacidadesRol> = {
  recepcionista: {
    rol: 'recepcionista',
    titulo: 'Recepcionista',
    subtitulo: 'Gestión de reservas y atención al huésped',
    rutaInicial: '/reservas',
    capacidades: [
      'Crear, modificar y cancelar reservas',
      'Ver calendario de disponibilidad',
      'Realizar check-in y check-out',
      'Consultar fichas de huéspedes',
      'Registrar pagos y enviar confirmaciones simuladas',
    ],
    restricciones: [
      'No accede al dashboard operacional',
      'No supervisa ni asigna tareas de housekeeping',
      'No puede aprobar inspecciones de habitación',
    ],
  },
  housekeeping: {
    rol: 'housekeeping',
    titulo: 'Housekeeping',
    subtitulo: 'Limpieza y preparación de habitaciones (vista móvil-first)',
    rutaInicial: '/mis-tareas',
    capacidades: [
      'Ver únicamente las tareas asignadas a su usuario',
      'Iniciar y completar limpiezas con checklist',
      'Reportar incidencias (mantenimiento, objetos olvidados, daños)',
      'Adjuntar foto y notas a cada tarea (simulado)',
    ],
    restricciones: [
      'No accede a reservas, calendario ni huéspedes',
      'No ve datos financieros ni de pago',
      'No puede asignar tareas a otros operarios',
    ],
  },
  supervisor: {
    rol: 'supervisor',
    titulo: 'Supervisor',
    subtitulo: 'Visión operacional completa y aprobaciones',
    rutaInicial: '/dashboard',
    capacidades: [
      'Dashboard operacional con KPIs en tiempo real',
      'Todo lo que hacen recepción y housekeeping',
      'Tablero Kanban de housekeeping con asignación masiva',
      'Aprobar o rechazar inspecciones de habitación',
      'Reiniciar datos demo y exportar/importar JSON',
      'Acceso a la bitácora completa de trazabilidad',
    ],
    restricciones: [
      'Las acciones quedan registradas en bitácora con su identidad',
    ],
  },
};
