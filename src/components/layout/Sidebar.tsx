import { NavLink } from 'react-router-dom';
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mountain,
  Sparkles,
  Users,
} from 'lucide-react';
import type { Rol } from '@/domain/enums';
import { useSessionStore } from '@/stores/sessionStore';
import { cn } from '@/lib/utils';

interface ItemSidebar {
  to: string;
  label: string;
  icon: typeof CalendarDays;
  roles: Rol[];
}

const items: ItemSidebar[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['supervisor'] },
  { to: '/reservas', label: 'Reservas', icon: ClipboardList, roles: ['recepcionista', 'supervisor'] },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays, roles: ['recepcionista', 'supervisor'] },
  { to: '/check-in', label: 'Check-in', icon: LogIn, roles: ['recepcionista', 'supervisor'] },
  { to: '/check-out', label: 'Check-out', icon: LogOut, roles: ['recepcionista', 'supervisor'] },
  { to: '/housekeeping', label: 'Housekeeping', icon: Sparkles, roles: ['supervisor'] },
  { to: '/mis-tareas', label: 'Mis tareas', icon: Sparkles, roles: ['housekeeping'] },
  { to: '/huespedes', label: 'Huéspedes', icon: Users, roles: ['recepcionista', 'supervisor'] },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const rolActivo = useSessionStore((s) => s.rolActivo);
  const itemsVisibles = items.filter((it) => it.roles.includes(rolActivo));

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Mountain className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-widest text-foreground">
            TERRA DIAGUITAS
          </span>
          <span className="text-[11px] text-muted-foreground">Valle del Elqui</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {itemsVisibles.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border px-6 py-4 text-[11px] text-muted-foreground">
        <p>Maqueta funcional v1.0</p>
        <p>Fase 0 — Procesos360</p>
      </div>
    </aside>
  );
}
