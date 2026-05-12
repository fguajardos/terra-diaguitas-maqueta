import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { Rol } from '@/domain/enums';
import { rutaInicialDeRol, useSessionStore } from '@/stores/sessionStore';

interface RoleGuardProps {
  allow: Rol[];
  children: ReactNode;
}

export function RoleGuard({ allow, children }: RoleGuardProps) {
  const rolActivo = useSessionStore((s) => s.rolActivo);
  if (!allow.includes(rolActivo)) {
    return <Navigate to={rutaInicialDeRol(rolActivo)} replace />;
  }
  return <>{children}</>;
}
