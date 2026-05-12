import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EstadoReserva } from '@/domain/enums';
import type { Reserva } from '@/domain/types';
import { puedeCrearReserva } from '@/domain/rules/disponibilidad';
import { puedeTransicionarReserva } from '@/domain/rules/transicionesEstado';
import {
  generarCodigoReserva,
  siguienteSecuencialDesdeReservas,
} from '@/domain/rules/codigoReserva';
import { calcularTotalDesdeFechas } from '@/domain/rules/tarifas';
import { crearEvento } from '@/services/trazabilidadService';
import { useTrazabilidadStore } from './trazabilidadStore';
import { useSessionStore } from './sessionStore';

export interface DatosNuevaReserva {
  habitacionId: string;
  tarifaPorNoche: number;
  huespedPrincipalId: string;
  fechaIngreso: string;
  fechaSalida: string;
  cantidadHuespedes: number;
  canal: Reserva['canal'];
  pago: Reserva['pago'];
  observaciones?: string;
  codigoPromocional?: string;
  hotelId: string;
}

interface ResultadoCreacionReserva {
  ok: boolean;
  reserva?: Reserva;
  motivo?: string;
}

interface ReservasState {
  reservas: Reserva[];
  hidratar: (reservas: Reserva[]) => void;
  porId: (id: string) => Reserva | undefined;
  porCodigo: (codigo: string) => Reserva | undefined;
  porHabitacion: (habitacionId: string) => Reserva[];
  porHuesped: (huespedId: string) => Reserva[];
  porEstado: (estados: EstadoReserva[]) => Reserva[];
  crear: (datos: DatosNuevaReserva) => ResultadoCreacionReserva;
  cambiarEstado: (
    id: string,
    nuevoEstado: EstadoReserva,
    opciones?: { motivo?: string; metadata?: Record<string, unknown> },
  ) => { ok: boolean; motivo?: string };
  actualizar: (id: string, parche: Partial<Reserva>) => void;
  reiniciar: (reservas: Reserva[]) => void;
}

function generarIdReserva(): string {
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const useReservasStore = create<ReservasState>()(
  persist(
    (set, get) => ({
      reservas: [],
      hidratar: (reservas) => set({ reservas }),

      porId: (id) => get().reservas.find((r) => r.id === id),
      porCodigo: (codigo) => get().reservas.find((r) => r.codigo === codigo),
      porHabitacion: (habitacionId) =>
        get().reservas.filter((r) => r.habitacionId === habitacionId),
      porHuesped: (huespedId) =>
        get().reservas.filter((r) => r.huespedPrincipalId === huespedId),
      porEstado: (estados) => get().reservas.filter((r) => estados.includes(r.estado)),

      crear: (datos) => {
        // 1. Validación de no-sobreventa
        const validacion = puedeCrearReserva(
          datos.habitacionId,
          datos.fechaIngreso,
          datos.fechaSalida,
          get().reservas,
        );
        if (!validacion.permitido) {
          return {
            ok: false,
            motivo: `La habitación ya tiene una reserva activa (${validacion.conflicto?.codigo}) en ese rango.`,
          };
        }

        // 2. Cálculo total y código
        const { noches, total } = calcularTotalDesdeFechas(
          datos.tarifaPorNoche,
          datos.fechaIngreso,
          datos.fechaSalida,
        );
        if (noches <= 0) {
          return { ok: false, motivo: 'La fecha de salida debe ser posterior a la de ingreso.' };
        }

        const anio = new Date().getFullYear();
        const secuencial = siguienteSecuencialDesdeReservas(get().reservas);
        const codigo = generarCodigoReserva(anio, secuencial);

        const session = useSessionStore.getState();
        const estadoInicial: EstadoReserva =
          datos.pago.estado === 'pagado' ? 'pagada' : datos.pago.estado === 'parcial' ? 'confirmada' : 'pendiente';

        const ahora = new Date().toISOString();
        const reserva: Reserva = {
          id: generarIdReserva(),
          codigo,
          hotelId: datos.hotelId,
          huespedPrincipalId: datos.huespedPrincipalId,
          habitacionId: datos.habitacionId,
          fechaIngreso: datos.fechaIngreso,
          fechaSalida: datos.fechaSalida,
          cantidadHuespedes: datos.cantidadHuespedes,
          cantidadNoches: noches,
          tarifaPorNoche: datos.tarifaPorNoche,
          totalCLP: total,
          estado: estadoInicial,
          canal: datos.canal,
          pago: datos.pago,
          observaciones: datos.observaciones,
          codigoPromocional: datos.codigoPromocional,
          fechaCreacion: ahora,
          fechaCheckIn: undefined,
          fechaCheckOut: undefined,
          creadoPor: session.rolActivo,
          historial: [],
        };

        set({ reservas: [...get().reservas, reserva] });

        useTrazabilidadStore.getState().registrarEvento(
          crearEvento({
            usuarioId: session.usuarioActivoId,
            rolUsuario: session.rolActivo,
            accion: 'creacion_reserva',
            entidad: 'reserva',
            entidadId: reserva.id,
            estadoNuevo: estadoInicial,
            metadata: { codigo, totalCLP: total, canal: datos.canal },
          }),
        );

        return { ok: true, reserva };
      },

      cambiarEstado: (id, nuevoEstado, opciones) => {
        const reserva = get().reservas.find((r) => r.id === id);
        if (!reserva) return { ok: false, motivo: 'Reserva no encontrada' };

        if (!puedeTransicionarReserva(reserva.estado, nuevoEstado)) {
          return {
            ok: false,
            motivo: `Transición no permitida: ${reserva.estado} → ${nuevoEstado}`,
          };
        }

        const parche: Partial<Reserva> = { estado: nuevoEstado };
        if (nuevoEstado === 'check_in_realizado') parche.fechaCheckIn = new Date().toISOString();
        if (nuevoEstado === 'check_out_realizado') parche.fechaCheckOut = new Date().toISOString();

        set({
          reservas: get().reservas.map((r) => (r.id === id ? { ...r, ...parche } : r)),
        });

        const session = useSessionStore.getState();
        useTrazabilidadStore.getState().registrarEvento(
          crearEvento({
            usuarioId: session.usuarioActivoId,
            rolUsuario: session.rolActivo,
            accion: 'cambio_estado_reserva',
            entidad: 'reserva',
            entidadId: id,
            estadoAnterior: reserva.estado,
            estadoNuevo: nuevoEstado,
            metadata: { motivo: opciones?.motivo, ...opciones?.metadata },
          }),
        );

        return { ok: true };
      },

      actualizar: (id, parche) =>
        set({ reservas: get().reservas.map((r) => (r.id === id ? { ...r, ...parche } : r)) }),

      reiniciar: (reservas) => set({ reservas }),
    }),
    { name: 'terra-diaguitas-reservas-v1' },
  ),
);
