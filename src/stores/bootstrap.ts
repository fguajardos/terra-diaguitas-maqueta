// Carga inicial de datos cuando LocalStorage está vacío.
// Incluye sistema de versionado para migraciones entre esquemas.
// Llamar una vez al arranque desde App.tsx.
import { seed } from '@/data/seed';
import { useHabitacionesStore } from './habitacionesStore';
import { useHuespedesStore } from './huespedesStore';
import { useReservasStore } from './reservasStore';
import { useHousekeepingStore } from './housekeepingStore';

// VERSIONADO DE STORES: define migraciones cuando el schema cambia.
// Ejemplo: Si cambias Reserva.descuento (nuevo) en Hito 4:
//   1. Incrementa el versionado en persist key: -v1 → -v2
//   2. Agrega migración en STORE_MIGRATIONS['reservas']['v1->v2']
//   3. checkAndMigrateStores() la ejecuta automáticamente

// Migraciones de schema para stores. Expandir cuando cambies el shape en Hito 4+.
// Ejemplo (comentado). Descomentar si cambias schema en Hito 4+:
// const STORE_MIGRATIONS: StoreMigration = {
//   reservas: {
//     'v1->v2': (oldReservas: any[]) => {
//       return oldReservas.map(r => ({
//         ...r,
//         descuento: 0, // nuevo campo, default 0
//       }));
//     },
//   },
// };

// Lee version de localStorage, aplica migraciones si corresponde.
function checkAndMigrateStores(): void {
  // Por ahora: no hay migraciones activas. Este helper existe para
  // prevenir rupturas futuras cuando cambie el schema de stores.
  // Se invoca antes de bootstrapSeedSiHaceFalta() en App.tsx.

  // Cuando necesites migrar:
  // 1. Lee la version del key en LS (ej: terra-diaguitas-reservas-v1)
  // 2. Si existen migraciones en _STORE_MIGRATIONS[storeName], aplícalas
  // 3. Incrementa el version en la key

  // Placeholder: implementar en Hito 4 si cambias schema.
}

export function bootstrapSeedSiHaceFalta(): void {
  checkAndMigrateStores();

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
