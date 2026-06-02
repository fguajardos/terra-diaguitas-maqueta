import type { Reserva } from '@/domain/types';
import type { CanalReserva, EstadoReserva } from '@/domain/enums';
import { HOTEL_ID } from './hotel.seed';
import { habitacionesSeed } from './habitaciones.seed';
import { huespedesSeed } from './huespedes.seed';

// 60 reservas con distribución temporal de sección 7.4 del documento.
// La generación es determinística pero usa la fecha actual como ancla para
// que las reservas "futuras" sean realmente futuras cuando se cargue el seed.

const HOY = new Date();
HOY.setHours(12, 0, 0, 0);

function isoDate(daysOffset: number): string {
  const d = new Date(HOY);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

function isoDateTime(daysOffset: number, hour = 10): string {
  const d = new Date(HOY);
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const canales: CanalReserva[] = [
  'recepcion',
  'recepcion',
  'recepcion',
  'sitio_web',
  'sitio_web',
  'booking_com',
  'booking_com',
  'whatsapp',
  'expedia',
  'telefono',
];

interface Plantilla {
  estado: EstadoReserva;
  cantidad: number;
  ingresoOffsetRange: [number, number];
  noches: [number, number];
  pagoMonto: 'total' | 'parcial' | 'ninguno';
}

const plantillas: Plantilla[] = [
  // Históricas (pasadas)
  { estado: 'check_out_realizado', cantidad: 80, ingresoOffsetRange: [-120, -3], noches: [1, 7], pagoMonto: 'total' },
  { estado: 'no_show', cantidad: 12, ingresoOffsetRange: [-90, -10], noches: [1, 3], pagoMonto: 'parcial' },
  { estado: 'cancelada', cantidad: 15, ingresoOffsetRange: [-60, -5], noches: [1, 4], pagoMonto: 'ninguno' },

  // Presentes (hoy y cercanos)
  { estado: 'check_in_realizado', cantidad: 18, ingresoOffsetRange: [-7, 0], noches: [2, 5], pagoMonto: 'total' },

  // Futuras (próximas)
  { estado: 'confirmada', cantidad: 45, ingresoOffsetRange: [1, 90], noches: [1, 8], pagoMonto: 'parcial' },
  { estado: 'pagada', cantidad: 20, ingresoOffsetRange: [2, 60], noches: [1, 5], pagoMonto: 'total' },
  { estado: 'pendiente', cantidad: 10, ingresoOffsetRange: [1, 30], noches: [1, 3], pagoMonto: 'ninguno' },
];

let secuencial = 1;

function siguienteCodigo(anio: number): string {
  const codigo = `TD-${anio}-${String(secuencial).padStart(5, '0')}`;
  secuencial++;
  return codigo;
}

function buildReservas(): Reserva[] {
  const reservas: Reserva[] = [];
  let huespedIdx = 0;
  let habitacionIdx = 0;

  for (const plantilla of plantillas) {
    for (let i = 0; i < plantilla.cantidad; i++) {
      const [min, max] = plantilla.ingresoOffsetRange;
      const offsetIngreso = min + ((i * 7 + 3) % Math.max(1, max - min));
      const [nMin, nMax] = plantilla.noches;
      const noches = nMin + ((i * 3) % Math.max(1, nMax - nMin + 1));

      const huesped = huespedesSeed[huespedIdx % huespedesSeed.length];
      const habitacion = habitacionesSeed[habitacionIdx % habitacionesSeed.length];
      huespedIdx++;
      habitacionIdx++;

      const total = habitacion.tarifaBase * noches;
      const canal = canales[i % canales.length];
      const fechaIngreso = isoDate(offsetIngreso);
      const fechaSalida = isoDate(offsetIngreso + noches);
      const fechaCreacionOffset = Math.min(offsetIngreso - 5, -1);

      let montoPagado = 0;
      let estadoPago: 'pendiente' | 'parcial' | 'pagado' | 'reembolsado' = 'pendiente';
      if (plantilla.pagoMonto === 'total') {
        montoPagado = total;
        estadoPago = 'pagado';
      } else if (plantilla.pagoMonto === 'parcial') {
        montoPagado = Math.round(total * 0.3);
        estadoPago = 'parcial';
      }

      const fechaCheckIn = plantilla.estado === 'check_in_realizado' || plantilla.estado === 'check_out_realizado'
        ? isoDateTime(offsetIngreso, 15)
        : undefined;
      const fechaCheckOut = plantilla.estado === 'check_out_realizado'
        ? isoDateTime(offsetIngreso + noches, 11)
        : undefined;

      reservas.push({
        id: `r-${reservas.length + 1}`,
        codigo: siguienteCodigo(2026),
        hotelId: HOTEL_ID,
        huespedPrincipalId: huesped.id,
        habitacionId: habitacion.id,
        fechaIngreso,
        fechaSalida,
        cantidadHuespedes: Math.min(habitacion.capacidadMaxima, 1 + (i % 2)),
        cantidadNoches: noches,
        tarifaPorNoche: habitacion.tarifaBase,
        totalCLP: total,
        estado: plantilla.estado,
        canal,
        pago: {
          estado: estadoPago,
          metodo: plantilla.pagoMonto !== 'ninguno' ? (i % 2 === 0 ? 'webpay' : 'transferencia') : undefined,
          montoPagado,
          fechaPago: plantilla.pagoMonto !== 'ninguno' ? isoDateTime(fechaCreacionOffset, 14) : undefined,
        },
        observaciones: undefined,
        fechaCreacion: isoDateTime(fechaCreacionOffset, 10),
        fechaCheckIn,
        fechaCheckOut,
        creadoPor: i % 4 === 0 ? 'supervisor' : 'recepcionista',
        historial: [],
      });
    }
  }

  return reservas;
}

export const reservasSeed: Reserva[] = buildReservas();
