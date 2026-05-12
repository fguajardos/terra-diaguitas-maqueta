import type { Hotel } from '@/domain/types';

export const HOTEL_ID = 'hotel-terra-diaguitas';

export const hotelSeed: Hotel = {
  id: HOTEL_ID,
  nombre: 'TERRA DIAGUITAS',
  ciudad: 'Vicuña',
  region: 'Coquimbo (Valle del Elqui)',
  zonaHoraria: 'America/Santiago',
  totalHabitaciones: 24,
};
