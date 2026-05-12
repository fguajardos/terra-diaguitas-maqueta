import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Rol } from '@/domain/enums';
import { CAPACIDADES_POR_ROL } from '@/domain/permisos';
import { hotelSeed } from '@/data/hotel.seed';
import { usuariosSeed } from '@/data/usuarios.seed';

interface SessionState {
  estaAutenticado: boolean;
  rolActivo: Rol;
  usuarioActivoId: string;
  hotelActivoId: string;
  iniciarSesion: (usuarioId: string) => boolean;
  cambiarRolRapido: (rol: Rol) => void;
  cerrarSesion: () => void;
}

function usuarioPorDefectoDeRol(rol: Rol): string {
  return usuariosSeed.find((u) => u.rol === rol)?.id ?? usuariosSeed[0].id;
}

const estadoInicial = {
  estaAutenticado: false,
  rolActivo: 'recepcionista' as Rol,
  usuarioActivoId: usuarioPorDefectoDeRol('recepcionista'),
  hotelActivoId: hotelSeed.id,
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...estadoInicial,
      iniciarSesion: (usuarioId) => {
        const usuario = usuariosSeed.find((u) => u.id === usuarioId);
        if (!usuario) return false;
        set({
          estaAutenticado: true,
          rolActivo: usuario.rol,
          usuarioActivoId: usuario.id,
        });
        return true;
      },
      cambiarRolRapido: (rol) =>
        set({
          rolActivo: rol,
          usuarioActivoId: usuarioPorDefectoDeRol(rol),
        }),
      cerrarSesion: () => set({ ...estadoInicial }),
    }),
    { name: 'terra-diaguitas-session-v1' },
  ),
);

export function rutaInicialDeRol(rol: Rol): string {
  return CAPACIDADES_POR_ROL[rol].rutaInicial;
}
