import { useNavigate } from 'react-router-dom';
import { Building2, LogOut, Menu, RefreshCcw, User } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ETIQUETAS_ROL, type Rol } from '@/domain/enums';
import { hotelSeed } from '@/data/hotel.seed';
import { usuariosSeed } from '@/data/usuarios.seed';
import { obtenerIniciales } from '@/lib/formato';
import { rutaInicialDeRol, useSessionStore } from '@/stores/sessionStore';
import { reiniciarDatosDemo } from '@/stores/bootstrap';
import { Sidebar } from './Sidebar';

const rolesDisponibles: Rol[] = ['recepcionista', 'housekeeping', 'supervisor'];

export function Topbar() {
  const navigate = useNavigate();
  const rolActivo = useSessionStore((s) => s.rolActivo);
  const usuarioActivoId = useSessionStore((s) => s.usuarioActivoId);
  const cambiarRolRapido = useSessionStore((s) => s.cambiarRolRapido);
  const cerrarSesion = useSessionStore((s) => s.cerrarSesion);

  const usuarioActivo = usuariosSeed.find((u) => u.id === usuarioActivoId);
  const iniciales = usuarioActivo
    ? obtenerIniciales(usuarioActivo.nombre, usuarioActivo.apellido)
    : '??';

  const handleCambioRol = (nuevo: string) => {
    const rol = nuevo as Rol;
    cambiarRolRapido(rol);
    navigate(rutaInicialDeRol(rol));
  };

  const handleCerrarSesion = () => {
    cerrarSesion();
    toast.success('Sesión cerrada');
    navigate('/login', { replace: true });
  };

  const handleReiniciarDatos = () => {
    reiniciarDatosDemo();
    toast.success('Datos demo reiniciados', {
      description: 'Reservas, habitaciones, huéspedes y tareas vuelven al estado inicial.',
    });
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
      {/* Botón hamburguesa solo en móvil */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Selector de hotel (solo un hotel cargado en la maqueta) */}
      <div className="hidden items-center gap-2 sm:flex">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <Select defaultValue={hotelSeed.id} disabled>
          <SelectTrigger className="h-9 w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={hotelSeed.id}>{hotelSeed.nombre}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Badge
          variant="outline"
          className="hidden text-[11px] uppercase tracking-wider sm:inline-flex"
        >
          Demo · Fase 0
        </Badge>

        <Separator orientation="vertical" className="hidden h-8 sm:block" />

        {/* Cambio rápido de rol (sin re-loguear) — útil para workshops */}
        <Select value={rolActivo} onValueChange={handleCambioRol}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            {rolesDisponibles.map((rol) => (
              <SelectItem key={rol} value={rol}>
                {ETIQUETAS_ROL[rol]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">{iniciales}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {usuarioActivo && (
              <>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {usuarioActivo.nombre} {usuarioActivo.apellido}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {ETIQUETAS_ROL[usuarioActivo.rol]} · {usuarioActivo.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem disabled>
              <User className="h-4 w-4" />
              Mi perfil
            </DropdownMenuItem>
            {rolActivo === 'supervisor' && (
              <DropdownMenuItem onClick={handleReiniciarDatos}>
                <RefreshCcw className="h-4 w-4" />
                Reiniciar datos demo
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCerrarSesion} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
