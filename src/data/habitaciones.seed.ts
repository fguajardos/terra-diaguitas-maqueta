import type { Habitacion } from '@/domain/types';
import type { EstadoHabitacion, TipoHabitacion } from '@/domain/enums';
import { HOTEL_ID } from './hotel.seed';

// Distribución según tabla 3 del documento (24 habitaciones):
// Piso 1: 4 single (65k) + 4 doble (85k)
// Piso 2: 6 matrimonial (110k) + 4 familiar (145k)
// Piso 3: 6 suite (220k)

interface PlantillaHabitacion {
  piso: number;
  tipo: TipoHabitacion;
  cantidad: number;
  tarifa: number;
  capacidad: number;
}

const plantillas: PlantillaHabitacion[] = [
  { piso: 1, tipo: 'single', cantidad: 4, tarifa: 65000, capacidad: 1 },
  { piso: 1, tipo: 'doble', cantidad: 4, tarifa: 85000, capacidad: 2 },
  { piso: 2, tipo: 'matrimonial', cantidad: 6, tarifa: 110000, capacidad: 2 },
  { piso: 2, tipo: 'familiar', cantidad: 4, tarifa: 145000, capacidad: 4 },
  { piso: 3, tipo: 'suite', cantidad: 6, tarifa: 220000, capacidad: 3 },
];

const caracteristicasPorTipo: Record<TipoHabitacion, string[][]> = {
  single: [
    ['vista al jardín'],
    ['vista al jardín', 'accesible'],
    ['vista al patio interior'],
    ['vista al jardín'],
  ],
  doble: [
    ['vista cordillera'],
    ['vista al jardín', 'balcón'],
    ['vista cordillera', 'balcón'],
    ['vista al jardín'],
  ],
  matrimonial: [
    ['vista cordillera', 'tina'],
    ['vista al valle', 'balcón'],
    ['vista cordillera', 'balcón', 'tina'],
    ['vista al jardín', 'chimenea'],
    ['vista al valle', 'balcón', 'tina'],
    ['vista cordillera'],
  ],
  familiar: [
    ['vista cordillera', 'balcón', 'sala de estar'],
    ['vista al valle', 'sala de estar'],
    ['vista cordillera', 'balcón', 'chimenea'],
    ['vista al jardín', 'sala de estar', 'accesible'],
  ],
  suite: [
    ['vista cordillera', 'balcón privado', 'tina', 'chimenea'],
    ['vista al valle', 'terraza', 'tina'],
    ['vista cordillera', 'balcón privado', 'tina', 'chimenea'],
    ['vista al valle', 'terraza', 'tina', 'chimenea'],
    ['vista cordillera', 'balcón privado', 'jacuzzi', 'chimenea'],
    ['vista al valle', 'terraza', 'jacuzzi', 'chimenea'],
  ],
};

// Distribución de estados iniciales (sección 7.2):
// 60% disponible, 20% ocupada, 10% pendiente_limpieza, 5% en_mantenimiento, 5% bloqueada
// Para 24 habitaciones: 14 disp, 5 ocup, 3 pend_limp, 1 mant, 1 bloq
const distribucionEstados: EstadoHabitacion[] = [
  ...Array<EstadoHabitacion>(14).fill('disponible'),
  ...Array<EstadoHabitacion>(5).fill('ocupada'),
  ...Array<EstadoHabitacion>(3).fill('pendiente_limpieza'),
  ...Array<EstadoHabitacion>(1).fill('en_mantenimiento'),
  ...Array<EstadoHabitacion>(1).fill('bloqueada'),
];

// Mezclamos los estados de manera determinística (no Math.random) usando un
// índice rotatorio sobre la posición global para garantizar reproducibilidad.
function buildHabitaciones(): Habitacion[] {
  const habitaciones: Habitacion[] = [];
  let globalIdx = 0;

  // Patrón de mezcla determinístico: shuffle por índice módulo
  const ordenMezclado = [
    0, 3, 7, 11, 15, 19, 23, 1, 4, 8, 12, 16, 20, 2, 5, 9, 13, 17, 21, 6, 10, 14, 18, 22,
  ];
  const estadosAsignados: EstadoHabitacion[] = ordenMezclado.map((i) => distribucionEstados[i]);

  for (const tmpl of plantillas) {
    for (let n = 1; n <= tmpl.cantidad; n++) {
      const numero =
        tmpl.tipo === 'suite' ? `S-${String(n).padStart(2, '0')}` : `${tmpl.piso}${String(n).padStart(2, '0')}`;
      const caracteristicas = caracteristicasPorTipo[tmpl.tipo][n - 1] ?? [];
      habitaciones.push({
        id: `hab-${globalIdx + 1}`,
        hotelId: HOTEL_ID,
        numero,
        piso: tmpl.piso,
        tipo: tmpl.tipo,
        capacidadMaxima: tmpl.capacidad,
        tarifaBase: tmpl.tarifa,
        estado: estadosAsignados[globalIdx],
        caracteristicas,
        ultimaLimpieza: undefined,
      });
      globalIdx++;
    }
  }

  return habitaciones;
}

export const habitacionesSeed: Habitacion[] = buildHabitaciones();
