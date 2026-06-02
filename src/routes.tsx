import { lazy, Suspense } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Placeholder } from '@/components/shared/Placeholder';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { rutaInicialDeRol, useSessionStore } from '@/stores/sessionStore';

// Code splitting: lazy load Hito 3 (Reservas) y Hito 4 (Check-in/Check-out) para reducir bundle principal
const NuevaReservaPage = lazy(() => import('@/features/reservas/pages/NuevaReservaPage').then(m => ({ default: m.NuevaReservaPage })))
const ListaReservasPage = lazy(() => import('@/features/reservas/pages/ListaReservasPage').then(m => ({ default: m.ListaReservasPage })))
const DetalleReservaPage = lazy(() => import('@/features/reservas/pages/DetalleReservaPage').then(m => ({ default: m.DetalleReservaPage })))
const ColaCheckInPage = lazy(() => import('@/features/check-in/pages/ColaCheckInPage').then(m => ({ default: m.ColaCheckInPage })))
const WizardCheckInPage = lazy(() => import('@/features/check-in/pages/WizardCheckInPage').then(m => ({ default: m.WizardCheckInPage })))
const ColaCheckOutPage = lazy(() => import('@/features/check-out/pages/ColaCheckOutPage').then(m => ({ default: m.ColaCheckOutPage })))
const WizardCheckOutPage = lazy(() => import('@/features/check-out/pages/WizardCheckOutPage').then(m => ({ default: m.WizardCheckOutPage })))

function RedirectAlInicio() {
  const { estaAutenticado, rolActivo } = useSessionStore.getState();
  if (!estaAutenticado) return <Navigate to="/login" replace />;
  return <Navigate to={rutaInicialDeRol(rolActivo)} replace />;
}

export const routes: RouteObject[] = [
  // Pantalla de login (sin AppShell)
  { path: '/login', element: <LoginPage /> },

  // Todo lo demás vive dentro del AppShell y exige autenticación
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <RedirectAlInicio /> },

      // Dashboard
      {
        path: 'dashboard',
        element: (
          <RoleGuard allow={['supervisor']}>
            <Placeholder
              titulo="Dashboard operacional"
              descripcion="KPIs en tiempo real, alertas y próximas llegadas."
              hito="Hito 6"
              rfReferencia="RF-07"
            />
          </RoleGuard>
        ),
      },

      // Reservas (lazy-loaded para code splitting)
      {
        path: 'reservas',
        element: (
          <RoleGuard allow={['recepcionista', 'supervisor']}>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Cargando...</div>}>
              <ListaReservasPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: 'reservas/nueva',
        element: (
          <RoleGuard allow={['recepcionista', 'supervisor']}>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Cargando...</div>}>
              <NuevaReservaPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: 'reservas/:id',
        element: (
          <RoleGuard allow={['recepcionista', 'supervisor']}>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Cargando...</div>}>
              <DetalleReservaPage />
            </Suspense>
          </RoleGuard>
        ),
      },

      // Calendario
      {
        path: 'calendario',
        element: (
          <RoleGuard allow={['recepcionista', 'supervisor']}>
            <Placeholder
              titulo="Calendario de disponibilidad"
              descripcion="Vista Gantt invertida con drag-to-create."
              hito="Hito 3"
              rfReferencia="RF-02"
            />
          </RoleGuard>
        ),
      },

      // Check-in
      {
        path: 'check-in',
        element: (
          <RoleGuard allow={['recepcionista', 'supervisor']}>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Cargando...</div>}>
              <ColaCheckInPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: 'check-in/:reservaId',
        element: (
          <RoleGuard allow={['recepcionista', 'supervisor']}>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Cargando...</div>}>
              <WizardCheckInPage />
            </Suspense>
          </RoleGuard>
        ),
      },

      // Check-out
      {
        path: 'check-out',
        element: (
          <RoleGuard allow={['recepcionista', 'supervisor']}>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Cargando...</div>}>
              <ColaCheckOutPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: 'check-out/:reservaId',
        element: (
          <RoleGuard allow={['recepcionista', 'supervisor']}>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Cargando...</div>}>
              <WizardCheckOutPage />
            </Suspense>
          </RoleGuard>
        ),
      },

      // Housekeeping
      {
        path: 'housekeeping',
        element: (
          <RoleGuard allow={['supervisor']}>
            <Placeholder
              titulo="Tablero de housekeeping"
              descripcion="Kanban de tareas: pendiente → asignada → en progreso → inspección → aprobada."
              hito="Hito 5"
              rfReferencia="RF-06"
            />
          </RoleGuard>
        ),
      },
      {
        path: 'housekeeping/inspeccion/:id',
        element: (
          <RoleGuard allow={['supervisor']}>
            <Placeholder
              titulo="Inspección de habitación"
              descripcion="Checklist, fotos y aprobación o rechazo."
              hito="Hito 5"
              rfReferencia="RF-06"
            />
          </RoleGuard>
        ),
      },
      {
        path: 'mis-tareas',
        element: (
          <RoleGuard allow={['housekeeping']}>
            <Placeholder
              titulo="Mis tareas"
              descripcion="Vista mobile-first con las tareas asignadas a ti."
              hito="Hito 5"
              rfReferencia="RF-06"
            />
          </RoleGuard>
        ),
      },

      // Huéspedes
      {
        path: 'huespedes',
        element: (
          <RoleGuard allow={['recepcionista', 'supervisor']}>
            <Placeholder
              titulo="Huéspedes"
              descripcion="Directorio de huéspedes con ficha completa."
              hito="Hito 3+"
              rfReferencia="RF-03"
            />
          </RoleGuard>
        ),
      },
      {
        path: 'huespedes/:id',
        element: (
          <RoleGuard allow={['recepcionista', 'supervisor']}>
            <Placeholder
              titulo="Ficha de huésped"
              descripcion="Datos personales, historial de reservas y preferencias."
              hito="Hito 3+"
              rfReferencia="RF-03"
            />
          </RoleGuard>
        ),
      },

      // Fallback dentro del shell
      { path: '*', element: <RedirectAlInicio /> },
    ],
  },

  // Fallback global
  { path: '*', element: <Navigate to="/" replace /> },
];
