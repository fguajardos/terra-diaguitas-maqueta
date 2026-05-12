import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Mountain, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CAPACIDADES_POR_ROL } from '@/domain/permisos';
import type { Rol } from '@/domain/enums';
import { ETIQUETAS_ROL } from '@/domain/enums';
import { usuariosSeed } from '@/data/usuarios.seed';
import { obtenerIniciales } from '@/lib/formato';
import { rutaInicialDeRol, useSessionStore } from '@/stores/sessionStore';

const ORDEN_ROLES: Rol[] = ['recepcionista', 'housekeeping', 'supervisor'];

const COLORES_BADGE_POR_ROL: Record<Rol, 'default' | 'secondary' | 'info'> = {
  recepcionista: 'info',
  housekeeping: 'secondary',
  supervisor: 'default',
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const iniciarSesion = useSessionStore((s) => s.iniciarSesion);

  const usuariosPorRol = useMemo(() => {
    const grupos: Record<Rol, typeof usuariosSeed> = {
      recepcionista: [],
      housekeeping: [],
      supervisor: [],
    };
    for (const u of usuariosSeed) grupos[u.rol].push(u);
    return grupos;
  }, []);

  // ¿Vienen desde una ruta protegida? Guardamos para redirigir después del login.
  const redirigirA = (location.state as { from?: string } | null)?.from;

  const handleLogin = (usuarioId: string) => {
    const usuario = usuariosSeed.find((u) => u.id === usuarioId);
    if (!usuario) return;
    const ok = iniciarSesion(usuarioId);
    if (!ok) {
      toast.error('No se pudo iniciar sesión.');
      return;
    }
    toast.success(`Bienvenido, ${usuario.nombre}`, {
      description: `Sesión iniciada como ${ETIQUETAS_ROL[usuario.rol]}.`,
    });
    navigate(redirigirA ?? rutaInicialDeRol(usuario.rol), { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/40 via-background to-primary/5">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_1.5fr] lg:gap-12 lg:px-10 lg:py-16">
        {/* Lado izquierdo: branding + contexto */}
        <aside className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Mountain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-widest text-foreground">
                  TERRA DIAGUITAS
                </h1>
                <p className="text-xs text-muted-foreground">Vicuña · Valle del Elqui</p>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <Badge variant="outline" className="uppercase tracking-wider">
                Maqueta funcional · Fase 0
              </Badge>
              <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                Plataforma integral de reservas y seguimiento hotelero
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Esta es una maqueta navegable para validar la experiencia de usuario y los flujos
                operativos TO-BE con los equipos de recepción, housekeeping y supervisión. Toda la
                lógica vive en el navegador; los datos se mantienen entre sesiones.
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-2 rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">
            <p className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 text-warning" />
              <span>
                <strong className="text-foreground">Autenticación simulada.</strong> No hay
                contraseñas: cada tarjeta abre la maqueta con el contexto de ese usuario y los
                permisos de su rol.
              </span>
            </p>
            <p>Versión 1.0 · Documento de referencia: Requerimientos Técnicos Fase 0 (Procesos360).</p>
          </div>
        </aside>

        {/* Lado derecho: tarjetas de usuarios agrupadas por rol */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Selecciona un usuario</h3>
            <p className="text-xs text-muted-foreground">
              {usuariosSeed.length} cuentas demo · {ORDEN_ROLES.length} roles
            </p>
          </div>

          {ORDEN_ROLES.map((rol) => {
            const usuarios = usuariosPorRol[rol];
            const capacidades = CAPACIDADES_POR_ROL[rol];
            return (
              <Card key={rol} className="overflow-hidden">
                <CardHeader className="bg-muted/40 pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        {capacidades.titulo}
                        <Badge variant={COLORES_BADGE_POR_ROL[rol]} className="font-normal">
                          {usuarios.length} {usuarios.length === 1 ? 'cuenta' : 'cuentas'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{capacidades.subtitulo}</CardDescription>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Puede
                      </p>
                      <ul className="space-y-1 text-xs text-foreground">
                        {capacidades.capacidades.slice(0, 4).map((cap) => (
                          <li key={cap} className="flex items-start gap-1.5">
                            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Restricciones
                      </p>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {capacidades.restricciones.map((rest) => (
                          <li key={rest} className="flex items-start gap-1.5">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                            <span>{rest}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
                  {usuarios.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleLogin(u.id)}
                      className="group flex items-center gap-3 rounded-md border border-transparent bg-background p-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5 focus-visible:border-primary/40 focus-visible:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {obtenerIniciales(u.nombre, u.apellido)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {u.nombre} {u.apellido}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            );
          })}

          <p className="text-center text-xs text-muted-foreground">
            ¿Necesitas comparar roles rápidamente? Una vez dentro, la barra superior permite
            cambiar de rol sin volver a esta pantalla.
          </p>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
