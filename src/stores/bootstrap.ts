// Carga inicial de datos cuando LocalStorage está vacío.
// Llamar una vez al arranque desde App.tsx.
import { seed } from '@/data/seed';
import { useHabitacionesStore } from './habitacionesStore';
import { useHuespedesStore } from './huespedesStore';
import { useReservasStore } from './reservasStore';
import { useHousekeepingStore } from './housekeepingStore';

export function bootstrapSeedSiHaceFalta(): void {
  if (useHabitacionesStore.getState().habitaciones.length === 0) {
    useHabitacionesStore.getState().hidratar(seed.habitaciones);
  }
  if (useHuespedesStore.getState().huespedes.length === 0) {
    useHuespedesStore.getState().hidratar(seed.huespedes);
  }
  if (useReservasStore.getState().reservas.length === 0) {
    useReservasStore.getState().hidratar(seed.reservas);
  }
  if (useHousekeepingStore.getState().tareas.length === 0) {
    useHousekeepingStore.getState().hidratar(seed.tareasHousekeeping);
  }
}

export function reiniciarDatosDemo(): void {
  useHabitacionesStore.getState().reiniciar(seed.habitaciones);
  useHuespedesStore.getState().reiniciar(seed.huespedes);
  useReservasStore.getState().reiniciar(seed.reservas);
  useHousekeepingStore.getState().reiniciar(seed.tareasHousekeeping);
}
