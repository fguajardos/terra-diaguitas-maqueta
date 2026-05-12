// Modelo de datos TERRA DIAGUITAS (sección 6.1 del documento)
import type {
  CanalReserva,
  EntidadBitacora,
  EstadoHabitacion,
  EstadoIncidencia,
  EstadoPago,
  EstadoReserva,
  EstadoTareaHousekeeping,
  IdiomaPreferido,
  MetodoPago,
  PrioridadTarea,
  Rol,
  TipoHabitacion,
  TipoIncidencia,
  TipoTareaHousekeeping,
} from './enums';

export interface Hotel {
  id: string;
  nombre: string;
  ciudad: string;
  region: string;
  zonaHoraria: string;
  totalHabitaciones: number;
}

export interface Habitacion {
  id: string;
  hotelId: string;
  numero: string;
  piso: number;
  tipo: TipoHabitacion;
  capacidadMaxima: number;
  tarifaBase: number; // CLP por noche
  estado: EstadoHabitacion;
  caracteristicas: string[];
  ultimaLimpieza?: string;
  notas?: string;
}

export interface Huesped {
  id: string;
  nombre: string;
  apellido: string;
  rut?: string;
  pasaporte?: string;
  nacionalidad: string;
  fechaNacimiento?: string;
  email: string;
  telefono: string;
  direccion?: string;
  idiomaPreferido: IdiomaPreferido;
  preferencias: string[];
  restriccionesAlimentarias?: string;
  observaciones?: string;
  fechaRegistro: string;
}

export interface PagoReserva {
  estado: EstadoPago;
  metodo?: MetodoPago;
  montoPagado: number;
  fechaPago?: string;
}

export interface Reserva {
  id: string;
  codigo: string; // "TD-2026-00123"
  hotelId: string;
  huespedPrincipalId: string;
  habitacionId: string;
  fechaIngreso: string;
  fechaSalida: string;
  cantidadHuespedes: number;
  cantidadNoches: number;
  tarifaPorNoche: number;
  totalCLP: number;
  estado: EstadoReserva;
  canal: CanalReserva;
  pago: PagoReserva;
  observaciones?: string;
  codigoPromocional?: string;
  fechaCreacion: string;
  fechaCheckIn?: string;
  fechaCheckOut?: string;
  creadoPor: Rol;
  historial: EventoBitacora[];
}

export interface Incidencia {
  id: string;
  tipo: TipoIncidencia;
  descripcion: string;
  fechaReporte: string;
  reportadoPor: string;
  estado: EstadoIncidencia;
  prioridad: 'baja' | 'normal' | 'alta';
  fotosUrls?: string[];
}

export interface TareaHousekeeping {
  id: string;
  habitacionId: string;
  reservaAsociadaId?: string;
  estado: EstadoTareaHousekeeping;
  prioridad: PrioridadTarea;
  asignadoA?: string;
  asignadoPor?: string;
  fechaCreacion: string;
  fechaInicio?: string;
  fechaFinalizacion?: string;
  fechaInspeccion?: string;
  inspeccionadoPor?: string;
  tipo: TipoTareaHousekeeping;
  incidencias: Incidencia[];
  notas?: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
  hotelId: string;
  activo: boolean;
}

export interface EventoBitacora {
  id: string;
  timestamp: string;
  usuarioId: string;
  rolUsuario: Rol;
  accion: string;
  entidad: EntidadBitacora;
  entidadId: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  metadata?: Record<string, unknown>;
}
