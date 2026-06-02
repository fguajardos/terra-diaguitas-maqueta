import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import type { Huesped } from '@/domain/types'
import { obtenerIniciales, formatRut } from '@/lib/formato'

interface PasoIdentidadProps {
  datos: any
  setDatos: (datos: any) => void
  huesped: Huesped
}

export default function PasoIdentidad({ datos, setDatos, huesped }: PasoIdentidadProps) {
  const esExtranjero = huesped.nacionalidad !== 'Chile'

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Verificación de Identidad</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarFallback>{obtenerIniciales(huesped.nombre, huesped.apellido)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">
                {huesped.nombre} {huesped.apellido}
              </div>
              <div className="text-sm text-muted-foreground">{huesped.email}</div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Documento de identidad:</p>
            <div className="flex items-center gap-2">
              {huesped.rut ? (
                <>
                  <Badge variant="outline">RUT: {formatRut(huesped.rut)}</Badge>
                </>
              ) : (
                <Badge variant="outline">Pasaporte: {huesped.pasaporte}</Badge>
              )}
              {esExtranjero && (
                <Badge variant="destructive" className="ml-2">
                  Documento extranjero
                </Badge>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="identidad-verificada"
                checked={datos.identidadVerificada}
                onCheckedChange={(checked: boolean | 'indeterminate') =>
                  setDatos({ ...datos, identidadVerificada: checked === true })
                }
              />
              <label htmlFor="identidad-verificada" className="text-sm cursor-pointer">
                He verificado la identidad del huésped con documento físico
              </label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
