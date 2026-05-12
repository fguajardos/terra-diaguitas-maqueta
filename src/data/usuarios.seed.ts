import type { Usuario } from '@/domain/types';
import { HOTEL_ID } from './hotel.seed';

// Sección 7.6 del documento de requerimientos
export const usuariosSeed: Usuario[] = [
  {
    id: 'u-1',
    nombre: 'María',
    apellido: 'González',
    email: 'maria.gonzalez@terradiaguitas.cl',
    rol: 'recepcionista',
    hotelId: HOTEL_ID,
    activo: true,
  },
  {
    id: 'u-2',
    nombre: 'Carlos',
    apellido: 'Muñoz',
    email: 'carlos.munoz@terradiaguitas.cl',
    rol: 'recepcionista',
    hotelId: HOTEL_ID,
    activo: true,
  },
  {
    id: 'u-3',
    nombre: 'Rosa',
    apellido: 'Rojas',
    email: 'rosa.rojas@terradiaguitas.cl',
    rol: 'housekeeping',
    hotelId: HOTEL_ID,
    activo: true,
  },
  {
    id: 'u-4',
    nombre: 'Pedro',
    apellido: 'Díaz',
    email: 'pedro.diaz@terradiaguitas.cl',
    rol: 'housekeeping',
    hotelId: HOTEL_ID,
    activo: true,
  },
  {
    id: 'u-5',
    nombre: 'Ana',
    apellido: 'Soto',
    email: 'ana.soto@terradiaguitas.cl',
    rol: 'housekeeping',
    hotelId: HOTEL_ID,
    activo: true,
  },
  {
    id: 'u-6',
    nombre: 'Javier',
    apellido: 'Pérez',
    email: 'javier.perez@terradiaguitas.cl',
    rol: 'supervisor',
    hotelId: HOTEL_ID,
    activo: true,
  },
];
