// Enums del dominio TERRA DIAGUITAS (sección 6.1 del documento de requerimientos)
// Usamos `type` con uniones literales porque tsconfig usa `erasableSyntaxOnly`.

export type Rol = 'recepcionista' | 'housekeeping' | 'supervisor';

export type EstadoHabitacion =
  | 'disponible'
  | 'reservada'
  | 'ocupada'
  | 'pendiente_limpieza'
  | 'en_limpieza'
  | 'inspeccion_pendiente'
  | 'en_mantenimiento'
  | 'bloqueada';

export type EstadoReserva =
  | 'pendiente'
  | 'confirmada'
  | 'pagada'
  | 'check_in_realizado'
  | 'check_out_realizado'
  | 'cancelada'
  | 'no_show';

export type TipoHabitacion = 'single' | 'doble' | 'matrimonial' | 'suite' | 'familiar';

export type CanalReserva =
  | 'recepcion'
  | 'sitio_web'
  | 'whatsapp'
  | 'telefono'
  | 'booking_com'
  | 'expedia'
  | 'airbnb';

export type EstadoTareaHousekeeping =
  | 'pendiente'
  | 'asignada'
  | 'en_progreso'
  | 'completada_pendiente_inspeccion'
  | 'aprobada'
  | 'rechazada';

export type PrioridadTarea = 'baja' | 'normal' | 'alta' | 'urgente';

export type TipoTareaHousekeeping =
  | 'limpieza_estandar'
  | 'limpieza_profunda'
  | 'mantenimiento'
  | 'preparacion_vip';

export type TipoIncidencia =
  | 'mantenimiento'
  | 'objeto_olvidado'
  | 'dano'
  | 'reposicion'
  | 'otro';

export type EstadoIncidencia = 'abierta' | 'en_revision' | 'resuelta';

export type EstadoPago = 'pendiente' | 'parcial' | 'pagado' | 'reembolsado';

export type MetodoPago = 'webpay' | 'transferencia' | 'efectivo' | 'tarjeta_credito';

export type IdiomaPreferido = 'es' | 'en' | 'pt';

export type EntidadBitacora = 'reserva' | 'habitacion' | 'huesped' | 'tarea_housekeeping';

// Etiquetas legibles para UI (es-CL)
export const ETIQUETAS_ROL: Record<Rol, string> = {
  recepcionista: 'Recepcionista',
  housekeeping: 'Housekeeping',
  supervisor: 'Supervisor',
};

export const ETIQUETAS_ESTADO_HABITACION: Record<EstadoHabitacion, string> = {
  disponible: 'Disponible',
  reservada: 'Reservada',
  ocupada: 'Ocupada',
  pendiente_limpieza: 'Pendiente limpieza',
  en_limpieza: 'En limpieza',
  inspeccion_pendiente: 'Inspección pendiente',
  en_mantenimiento: 'En mantenimiento',
  bloqueada: 'Bloqueada',
};

export const ETIQUETAS_ESTADO_RESERVA: Record<EstadoReserva, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  pagada: 'Pagada',
  check_in_realizado: 'Check-in realizado',
  check_out_realizado: 'Check-out realizado',
  cancelada: 'Cancelada',
  no_show: 'No show',
};

export const ETIQUETAS_TIPO_HABITACION: Record<TipoHabitacion, string> = {
  single: 'Single',
  doble: 'Doble',
  matrimonial: 'Matrimonial',
  suite: 'Suite',
  familiar: 'Familiar',
};

export const ETIQUETAS_CANAL: Record<CanalReserva, string> = {
  recepcion: 'Recepción',
  sitio_web: 'Sitio web',
  whatsapp: 'WhatsApp',
  telefono: 'Teléfono',
  booking_com: 'Booking.com',
  expedia: 'Expedia',
  airbnb: 'Airbnb',
};
