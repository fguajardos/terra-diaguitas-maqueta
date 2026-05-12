# TERRA DIAGUITAS — Maqueta Funcional Fase 0

Maqueta navegable de la Plataforma Integral de Reservas y Seguimiento Hotelero para **Hotel TERRA DIAGUITAS** (Vicuña, Valle del Elqui), construida sobre el documento _Requerimientos Técnicos — Fase 0_ de Procesos360 (ver [`docs/`](docs/)).

> 🧪 **Esta es una maqueta para validación de UX con usuarios reales.** No hay backend, autenticación productiva ni integraciones reales: toda la lógica vive en el cliente y los datos persisten en LocalStorage.

## 🚀 Demo en vivo

**https://fguajardos.github.io/terra-diaguitas-maqueta/**

Al entrar verás el panel de login con las 6 cuentas demo. Click en cualquier usuario abre la maqueta con su rol y permisos.

## 🧱 Stack

- **Vite** + **React 19** + **TypeScript** (strict)
- **Tailwind CSS** + **shadcn/ui** (style new-york)
- **Zustand** con `persist` middleware (LocalStorage)
- **React Router 7** + **date-fns** (locale es-CL)
- **Recharts** · **lucide-react** · **sonner** (toasts)
- **React Hook Form** + **Zod** · **TanStack Table**

## 🗂️ Estructura

```
src/
├── components/      # AppShell + ui/ (shadcn) + shared/
├── features/        # Páginas y componentes por módulo de negocio
├── stores/          # Zustand stores con persist
├── domain/          # types, enums, permisos, rules/
├── services/        # Mocks de pagos, notificaciones, trazabilidad
├── data/            # Seeds determinísticos (hotel, habitaciones, huéspedes, reservas, tareas)
└── lib/             # Formatters (CLP, RUT, fechas) + validators (módulo 11)
```

## 👥 Roles

| Rol | Cuentas demo | Ruta inicial |
|---|---|---|
| Recepcionista | María González, Carlos Muñoz | `/reservas` |
| Housekeeping | Rosa Rojas, Pedro Díaz, Ana Soto | `/mis-tareas` |
| Supervisor | Javier Pérez | `/dashboard` |

La segregación de capacidades por rol vive en [`src/domain/permisos.ts`](src/domain/permisos.ts) — es la fuente de verdad para login, sidebar y guards.

## 🛣️ Roadmap (§14 del documento de requerimientos)

- [x] **Hito 1** — Esqueleto: scaffold + paleta + AppShell + rutas placeholder
- [x] **Hito 2** — Stores + reglas de negocio + servicios mock + login simulado
- [ ] **Hito 3** — Módulo Reservas (lista + wizard + detalle + calendario Gantt)
- [ ] **Hito 4** — Check-in / Check-out (wizards multipaso, firma digital)
- [ ] **Hito 5** — Housekeeping (kanban supervisor + vista móvil)
- [ ] **Hito 6** — Dashboard operacional con KPIs en tiempo real
- [ ] **Hito 7** — Pulido + accesibilidad + export/import JSON

## 🛠️ Desarrollo local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción
npm run lint
```

## 🚢 Deploy

Cada push a `main` dispara el workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), que builda con Node 20 y publica a GitHub Pages.

## 📄 Documentación funcional

El requerimiento técnico completo está en [`docs/Requerimientos_Tecnicos_Maqueta_TERRA_DIAGUITAS.docx`](docs/). Cada sección puede consumirse como contexto independiente en asistentes de IA dentro de VS Code (Copilot, Cline, Continue, etc).

---

Procesos360 · Mayo 2026
