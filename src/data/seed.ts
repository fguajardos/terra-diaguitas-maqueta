// Punto de entrada único para todos los datos semilla de TERRA DIAGUITAS.
// Cargado en el primer arranque cuando LocalStorage esté vacío.

import { hotelSeed } from './hotel.seed';
import { habitacionesSeed } from './habitaciones.seed';
import { huespedesSeed } from './huespedes.seed';
import { reservasSeed } from './reservas.seed';
import { tareasHousekeepingSeed } from './housekeeping.seed';
import { usuariosSeed } from './usuarios.seed';

export const seed = {
  hotel: hotelSeed,
  habitaciones: habitacionesSeed,
  huespedes: huespedesSeed,
  reservas: reservasSeed,
  tareasHousekeeping: tareasHousekeepingSeed,
  usuarios: usuariosSeed,
};

export type Seed = typeof seed;
