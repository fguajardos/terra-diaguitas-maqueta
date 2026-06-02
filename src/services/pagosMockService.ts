// Mock del flujo de pago Webpay (§9.1.2 paso 3 / §2.2 fuera de alcance real).
// Solo simula latencia de 2 segundos y devuelve un resultado configurable.
// CON IDEMPOTENCIA: previene doble-click en "Confirmar" durante el procesamiento.
import type { MetodoPago } from '@/domain/enums';

export interface ResultadoPago {
  exitoso: boolean;
  metodo: MetodoPago;
  monto: number;
  referencia?: string;
  motivoRechazo?: string;
  procesadoEn: string; // ISO datetime
}

interface OpcionesPago {
  metodo: MetodoPago;
  monto: number;
  // Para escenarios controlados en workshops, se puede forzar el resultado.
  forzarResultado?: 'aprobado' | 'rechazado';
}

const MOTIVOS_RECHAZO = [
  'Fondos insuficientes',
  'Tarjeta vencida',
  'Conexión con el emisor falló',
];

// IDEMPOTENCIA: Set de transacciones en vuelo para evitar duplicados
const transaccionesEnVuelo = new Map<string, Promise<ResultadoPago>>();

function generarReferencia(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `WP-${ts}-${rand}`;
}

function generarIdioTransaccion(opciones: OpcionesPago): string {
  // ID simple: metodo + monto. En producción usarías reservaId + nonce.
  return `${opciones.metodo}-${opciones.monto}`;
}

export function procesarPago(opciones: OpcionesPago): Promise<ResultadoPago> {
  // Validación básica
  if (opciones.monto < 0) {
    return Promise.reject(new Error('Monto debe ser >= 0'));
  }

  const idTransaccion = generarIdioTransaccion(opciones);

  // Si ya hay una transacción en vuelo con este ID, retorna la Promise existente
  if (transaccionesEnVuelo.has(idTransaccion)) {
    console.warn(
      `[IDEMPOTENCIA] Intento de doble-pago: ${idTransaccion}. Retornando resultado en vuelo.`,
    );
    return transaccionesEnVuelo.get(idTransaccion)!;
  }

  // Crear nueva transacción
  const promesaPago = new Promise<ResultadoPago>((resolve) => {
    setTimeout(() => {
      let exitoso: boolean;
      if (opciones.forzarResultado) {
        exitoso = opciones.forzarResultado === 'aprobado';
      } else {
        // 85% de aprobación por defecto para que la maqueta sea agradable.
        exitoso = Math.random() < 0.85;
      }

      const resultado: ResultadoPago = {
        exitoso,
        metodo: opciones.metodo,
        monto: opciones.monto,
        procesadoEn: new Date().toISOString(),
        referencia: exitoso ? generarReferencia() : undefined,
        motivoRechazo: exitoso
          ? undefined
          : MOTIVOS_RECHAZO[Math.floor(Math.random() * MOTIVOS_RECHAZO.length)],
      };

      // Limpiar del caché después de 5 minutos (expiración)
      setTimeout(() => {
        transaccionesEnVuelo.delete(idTransaccion);
      }, 5 * 60 * 1000);

      resolve(resultado);
    }, 2000);
  });

  transaccionesEnVuelo.set(idTransaccion, promesaPago);
  return promesaPago;
}
