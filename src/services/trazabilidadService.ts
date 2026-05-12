// Servicio de bitácora (RNF-08, sección 12.3 del documento).
// Cada acción crítica registra un EventoBitacora en el trazabilidadStore.
import type { EntidadBitacora, Rol } from '@/domain/enums';
import type { EventoBitacora } from '@/domain/types';

let secuencial = 0;

export function generarIdEvento(): string {
  secuencial++;
  return `evt-${Date.now().toString(36)}-${secuencial}`;
}

interface ParametrosEvento {
  usuarioId: string;
  rolUsuario: Rol;
  accion: string;
  entidad: EntidadBitacora;
  entidadId: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  metadata?: Record<string, unknown>;
}

export function crearEvento(params: ParametrosEvento): EventoBitacora {
  return {
    id: generarIdEvento(),
    timestamp: new Date().toISOString(),
    usuarioId: params.usuarioId,
    rolUsuario: params.rolUsuario,
    accion: params.accion,
    entidad: params.entidad,
    entidadId: params.entidadId,
    estadoAnterior: params.estadoAnterior,
    estadoNuevo: params.estadoNuevo,
    metadata: params.metadata,
  };
}
