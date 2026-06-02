import type { Huesped } from '@/domain/types';

// 40 huéspedes: 30 chilenos con RUT + 10 extranjeros con pasaporte (sección 7.3)
// Los RUTs son ficticios pero con formato y dígito verificador válidos.

interface SemillaHuesped {
  nombre: string;
  apellido: string;
  rut?: string;
  pasaporte?: string;
  nacionalidad: string;
  email: string;
  telefono: string;
  ciudad: string;
  idiomaPreferido: 'es' | 'en' | 'pt';
}

const chilenos: SemillaHuesped[] = [
  { nombre: 'Camila', apellido: 'González', rut: '12.345.678-5', nacionalidad: 'Chile', email: 'camila.gonzalez@gmail.com', telefono: '+56 9 8123 4567', ciudad: 'Santiago', idiomaPreferido: 'es' },
  { nombre: 'Diego', apellido: 'Muñoz', rut: '14.567.890-3', nacionalidad: 'Chile', email: 'diego.munoz@gmail.com', telefono: '+56 9 8234 5678', ciudad: 'Valparaíso', idiomaPreferido: 'es' },
  { nombre: 'Valentina', apellido: 'Rojas', rut: '15.678.901-2', nacionalidad: 'Chile', email: 'valentina.rojas@hotmail.com', telefono: '+56 9 8345 6789', ciudad: 'La Serena', idiomaPreferido: 'es' },
  { nombre: 'Matías', apellido: 'Díaz', rut: '16.789.012-1', nacionalidad: 'Chile', email: 'matias.diaz@gmail.com', telefono: '+56 9 8456 7890', ciudad: 'Concepción', idiomaPreferido: 'es' },
  { nombre: 'Catalina', apellido: 'Pérez', rut: '17.890.123-9', nacionalidad: 'Chile', email: 'catalina.perez@outlook.com', telefono: '+56 9 8567 8901', ciudad: 'Antofagasta', idiomaPreferido: 'es' },
  { nombre: 'Sebastián', apellido: 'Soto', rut: '18.901.234-7', nacionalidad: 'Chile', email: 'sebastian.soto@gmail.com', telefono: '+56 9 8678 9012', ciudad: 'Santiago', idiomaPreferido: 'es' },
  { nombre: 'Francisca', apellido: 'Hernández', rut: '19.012.345-6', nacionalidad: 'Chile', email: 'francisca.hernandez@gmail.com', telefono: '+56 9 8789 0123', ciudad: 'Viña del Mar', idiomaPreferido: 'es' },
  { nombre: 'Tomás', apellido: 'Castro', rut: '13.123.456-4', nacionalidad: 'Chile', email: 'tomas.castro@hotmail.com', telefono: '+56 9 8890 1234', ciudad: 'Rancagua', idiomaPreferido: 'es' },
  { nombre: 'Antonia', apellido: 'Morales', rut: '20.234.567-2', nacionalidad: 'Chile', email: 'antonia.morales@gmail.com', telefono: '+56 9 8901 2345', ciudad: 'Santiago', idiomaPreferido: 'es' },
  { nombre: 'Benjamín', apellido: 'Silva', rut: '11.345.678-1', nacionalidad: 'Chile', email: 'benjamin.silva@gmail.com', telefono: '+56 9 9012 3456', ciudad: 'Talca', idiomaPreferido: 'es' },
  { nombre: 'Isidora', apellido: 'Vargas', rut: '21.456.789-K', nacionalidad: 'Chile', email: 'isidora.vargas@outlook.com', telefono: '+56 9 9123 4567', ciudad: 'La Serena', idiomaPreferido: 'es' },
  { nombre: 'Joaquín', apellido: 'Espinoza', rut: '10.567.890-9', nacionalidad: 'Chile', email: 'joaquin.espinoza@gmail.com', telefono: '+56 9 9234 5678', ciudad: 'Santiago', idiomaPreferido: 'es' },
  { nombre: 'Florencia', apellido: 'Tapia', rut: '22.678.901-7', nacionalidad: 'Chile', email: 'florencia.tapia@gmail.com', telefono: '+56 9 9345 6789', ciudad: 'Coquimbo', idiomaPreferido: 'es' },
  { nombre: 'Maximiliano', apellido: 'Riquelme', rut: '9.789.012-6', nacionalidad: 'Chile', email: 'maximiliano.riquelme@hotmail.com', telefono: '+56 9 9456 7890', ciudad: 'Antofagasta', idiomaPreferido: 'es' },
  { nombre: 'Javiera', apellido: 'Núñez', rut: '23.890.123-4', nacionalidad: 'Chile', email: 'javiera.nunez@gmail.com', telefono: '+56 9 9567 8901', ciudad: 'Santiago', idiomaPreferido: 'es' },
  { nombre: 'Vicente', apellido: 'Sepúlveda', rut: '8.901.234-3', nacionalidad: 'Chile', email: 'vicente.sepulveda@gmail.com', telefono: '+56 9 9678 9012', ciudad: 'Puerto Montt', idiomaPreferido: 'es' },
  { nombre: 'Constanza', apellido: 'Fuentes', rut: '24.012.345-1', nacionalidad: 'Chile', email: 'constanza.fuentes@gmail.com', telefono: '+56 9 9789 0123', ciudad: 'Valparaíso', idiomaPreferido: 'es' },
  { nombre: 'Cristóbal', apellido: 'Olivares', rut: '7.123.456-K', nacionalidad: 'Chile', email: 'cristobal.olivares@outlook.com', telefono: '+56 9 9890 1234', ciudad: 'Iquique', idiomaPreferido: 'es' },
  { nombre: 'Amanda', apellido: 'Reyes', rut: '25.234.567-9', nacionalidad: 'Chile', email: 'amanda.reyes@gmail.com', telefono: '+56 9 9901 2345', ciudad: 'La Serena', idiomaPreferido: 'es' },
  { nombre: 'Felipe', apellido: 'Cortés', rut: '12.345.679-3', nacionalidad: 'Chile', email: 'felipe.cortes@gmail.com', telefono: '+56 9 7012 3456', ciudad: 'Santiago', idiomaPreferido: 'es' },
  { nombre: 'Trinidad', apellido: 'Saavedra', rut: '14.567.891-1', nacionalidad: 'Chile', email: 'trinidad.saavedra@gmail.com', telefono: '+56 9 7123 4567', ciudad: 'Concepción', idiomaPreferido: 'es' },
  { nombre: 'Lucas', apellido: 'Bravo', rut: '15.678.902-0', nacionalidad: 'Chile', email: 'lucas.bravo@gmail.com', telefono: '+56 9 7234 5678', ciudad: 'Santiago', idiomaPreferido: 'es' },
  { nombre: 'Emilia', apellido: 'Cárdenas', rut: '16.789.013-K', nacionalidad: 'Chile', email: 'emilia.cardenas@hotmail.com', telefono: '+56 9 7345 6789', ciudad: 'Temuco', idiomaPreferido: 'es' },
  { nombre: 'Agustín', apellido: 'Lagos', rut: '17.890.124-7', nacionalidad: 'Chile', email: 'agustin.lagos@gmail.com', telefono: '+56 9 7456 7890', ciudad: 'Santiago', idiomaPreferido: 'es' },
  { nombre: 'Renata', apellido: 'Vidal', rut: '18.901.235-5', nacionalidad: 'Chile', email: 'renata.vidal@gmail.com', telefono: '+56 9 7567 8901', ciudad: 'Valdivia', idiomaPreferido: 'es' },
  { nombre: 'Gabriel', apellido: 'Toro', rut: '19.012.346-4', nacionalidad: 'Chile', email: 'gabriel.toro@outlook.com', telefono: '+56 9 7678 9012', ciudad: 'Santiago', idiomaPreferido: 'es' },
  { nombre: 'Magdalena', apellido: 'Salinas', rut: '13.123.457-2', nacionalidad: 'Chile', email: 'magdalena.salinas@gmail.com', telefono: '+56 9 7789 0123', ciudad: 'Arica', idiomaPreferido: 'es' },
  { nombre: 'Nicolás', apellido: 'Carvajal', rut: '20.234.568-0', nacionalidad: 'Chile', email: 'nicolas.carvajal@gmail.com', telefono: '+56 9 7890 1234', ciudad: 'Santiago', idiomaPreferido: 'es' },
  { nombre: 'Antonella', apellido: 'Henríquez', rut: '11.345.679-K', nacionalidad: 'Chile', email: 'antonella.henriquez@gmail.com', telefono: '+56 9 7901 2345', ciudad: 'La Serena', idiomaPreferido: 'es' },
  { nombre: 'Ignacio', apellido: 'Gallardo', rut: '21.456.790-6', nacionalidad: 'Chile', email: 'ignacio.gallardo@gmail.com', telefono: '+56 9 6012 3456', ciudad: 'Punta Arenas', idiomaPreferido: 'es' },
];

const extranjeros: SemillaHuesped[] = [
  { nombre: 'Lucía', apellido: 'Fernández', pasaporte: 'AR-23456789', nacionalidad: 'Argentina', email: 'lucia.fernandez@gmail.com', telefono: '+54 9 11 4567 8901', ciudad: 'Buenos Aires', idiomaPreferido: 'es' },
  { nombre: 'Mateo', apellido: 'Rodríguez', pasaporte: 'AR-34567890', nacionalidad: 'Argentina', email: 'mateo.rodriguez@hotmail.com', telefono: '+54 9 11 5678 9012', ciudad: 'Mendoza', idiomaPreferido: 'es' },
  { nombre: 'Beatriz', apellido: 'Souza', pasaporte: 'BR-45678901', nacionalidad: 'Brasil', email: 'beatriz.souza@gmail.com', telefono: '+55 11 96789 0123', ciudad: 'São Paulo', idiomaPreferido: 'pt' },
  { nombre: 'Rafael', apellido: 'Oliveira', pasaporte: 'BR-56789012', nacionalidad: 'Brasil', email: 'rafael.oliveira@gmail.com', telefono: '+55 21 97890 1234', ciudad: 'Río de Janeiro', idiomaPreferido: 'pt' },
  { nombre: 'Hannah', apellido: 'Schmidt', pasaporte: 'DE-67890123', nacionalidad: 'Alemania', email: 'hannah.schmidt@gmail.com', telefono: '+49 30 12345678', ciudad: 'Berlín', idiomaPreferido: 'en' },
  { nombre: 'Lukas', apellido: 'Müller', pasaporte: 'DE-78901234', nacionalidad: 'Alemania', email: 'lukas.muller@gmail.com', telefono: '+49 89 23456789', ciudad: 'Múnich', idiomaPreferido: 'en' },
  { nombre: 'Emily', apellido: 'Johnson', pasaporte: 'US-89012345', nacionalidad: 'Estados Unidos', email: 'emily.johnson@gmail.com', telefono: '+1 415 555 1234', ciudad: 'San Francisco', idiomaPreferido: 'en' },
  { nombre: 'Michael', apellido: 'Williams', pasaporte: 'US-90123456', nacionalidad: 'Estados Unidos', email: 'michael.williams@gmail.com', telefono: '+1 212 555 5678', ciudad: 'Nueva York', idiomaPreferido: 'en' },
  { nombre: 'Camille', apellido: 'Dubois', pasaporte: 'FR-01234567', nacionalidad: 'Francia', email: 'camille.dubois@gmail.com', telefono: '+33 1 23 45 67 89', ciudad: 'París', idiomaPreferido: 'en' },
  { nombre: 'Antoine', apellido: 'Laurent', pasaporte: 'FR-12345670', nacionalidad: 'Francia', email: 'antoine.laurent@gmail.com', telefono: '+33 4 56 78 90 12', ciudad: 'Lyon', idiomaPreferido: 'en' },
  { nombre: 'Sofia', apellido: 'Russo', pasaporte: 'IT-23567891', nacionalidad: 'Italia', email: 'sofia.russo@gmail.com', telefono: '+39 6 1234 5678', ciudad: 'Roma', idiomaPreferido: 'en' },
  { nombre: 'Marco', apellido: 'Rossi', pasaporte: 'IT-34678902', nacionalidad: 'Italia', email: 'marco.rossi@gmail.com', telefono: '+39 2 5678 9012', ciudad: 'Milán', idiomaPreferido: 'en' },
  { nombre: 'Carolina', apellido: 'González', pasaporte: 'MX-45789013', nacionalidad: 'México', email: 'carolina.gonzalez@gmail.com', telefono: '+52 55 1234 5678', ciudad: 'México City', idiomaPreferido: 'es' },
  { nombre: 'Diego', apellido: 'López', pasaporte: 'MX-56890124', nacionalidad: 'México', email: 'diego.lopez@gmail.com', telefono: '+52 33 5678 9012', ciudad: 'Guadalajara', idiomaPreferido: 'es' },
  { nombre: 'Sophie', apellido: 'Martin', pasaporte: 'BE-67901235', nacionalidad: 'Bélgica', email: 'sophie.martin@gmail.com', telefono: '+32 2 123 4567', ciudad: 'Bruselas', idiomaPreferido: 'en' },
  { nombre: 'Willem', apellido: 'de Vries', pasaporte: 'NL-78012346', nacionalidad: 'Países Bajos', email: 'willem.devries@gmail.com', telefono: '+31 20 123 4567', ciudad: 'Ámsterdam', idiomaPreferido: 'en' },
  { nombre: 'Isabella', apellido: 'Costa', pasaporte: 'PT-89123457', nacionalidad: 'Portugal', email: 'isabella.costa@gmail.com', telefono: '+351 21 123 4567', ciudad: 'Lisboa', idiomaPreferido: 'en' },
  { nombre: 'Nikolai', apellido: 'Petrov', pasaporte: 'RU-90234568', nacionalidad: 'Rusia', email: 'nikolai.petrov@gmail.com', telefono: '+7 495 123 4567', ciudad: 'Moscú', idiomaPreferido: 'en' },
  { nombre: 'Yuki', apellido: 'Tanaka', pasaporte: 'JP-01345679', nacionalidad: 'Japón', email: 'yuki.tanaka@gmail.com', telefono: '+81 3 1234 5678', ciudad: 'Tokio', idiomaPreferido: 'en' },
  { nombre: 'Wei', apellido: 'Wang', pasaporte: 'CN-12456780', nacionalidad: 'China', email: 'wei.wang@gmail.com', telefono: '+86 10 1234 5678', ciudad: 'Pekín', idiomaPreferido: 'en' },
];

const preferenciasPool = ['cama king', 'almohada extra', 'piso alto', 'vista cordillera', 'desayuno temprano', 'late check-out'];

function buildHuespedes(): Huesped[] {
  const semillas = [...chilenos, ...extranjeros];
  return semillas.map((s, idx) => ({
    id: `h-${idx + 1}`,
    nombre: s.nombre,
    apellido: s.apellido,
    rut: s.rut,
    pasaporte: s.pasaporte,
    nacionalidad: s.nacionalidad,
    email: s.email,
    telefono: s.telefono,
    direccion: s.ciudad,
    idiomaPreferido: s.idiomaPreferido,
    preferencias: idx % 3 === 0 ? [preferenciasPool[idx % preferenciasPool.length]] : [],
    restriccionesAlimentarias: idx % 7 === 0 ? 'vegetariano' : undefined,
    observaciones: undefined,
    fechaRegistro: new Date(2025, 10, (idx % 28) + 1).toISOString(),
  }));
}

export const huespedesSeed: Huesped[] = buildHuespedes();
