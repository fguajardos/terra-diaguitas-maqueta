import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  filtrosReservas: {
    estados: string[];
    canal?: string;
    busqueda: string;
  };
  setFiltroBusqueda: (busqueda: string) => void;
  setFiltroEstados: (estados: string[]) => void;
  setFiltroCanal: (canal?: string) => void;
  reiniciarFiltros: () => void;
}

const filtrosVacios: UIState['filtrosReservas'] = {
  estados: [],
  canal: undefined,
  busqueda: '',
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      filtrosReservas: filtrosVacios,
      setFiltroBusqueda: (busqueda) =>
        set({ filtrosReservas: { ...get().filtrosReservas, busqueda } }),
      setFiltroEstados: (estados) =>
        set({ filtrosReservas: { ...get().filtrosReservas, estados } }),
      setFiltroCanal: (canal) => set({ filtrosReservas: { ...get().filtrosReservas, canal } }),
      reiniciarFiltros: () => set({ filtrosReservas: filtrosVacios }),
    }),
    { name: 'terra-diaguitas-ui-v1' },
  ),
);
