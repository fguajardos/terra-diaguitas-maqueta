import { Construction } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PlaceholderProps {
  titulo: string;
  descripcion: string;
  hito: string;
  rfReferencia?: string;
}

export function Placeholder({ titulo, descripcion, hito, rfReferencia }: PlaceholderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{titulo}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="warning">{hito}</Badge>
          {rfReferencia && <Badge variant="outline">{rfReferencia}</Badge>}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Construction className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Módulo en construcción</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Este módulo se implementará en el {hito} del roadmap de construcción incremental. El
          esqueleto navegable, el AppShell y la persistencia de la sesión ya funcionan.
        </p>
      </div>
    </div>
  );
}
