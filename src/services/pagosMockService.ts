// Mock del flujo de pago Webpay (§9.1.2 paso 3 / §2.2 fuera de alcance real).
// Solo simula latencia de 2 segundos y devuelve un resultado configurable.
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

function generarReferencia(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `WP-${ts}-${rand}`;
}

export function procesarPago(opciones: OpcionesPago): Promise<ResultadoPago> {
  return new Promise((resolve) => {
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
      resolve(resultado);
    }, 2000);
  });
}
