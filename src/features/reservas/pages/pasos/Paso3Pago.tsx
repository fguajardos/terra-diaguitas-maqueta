import type { MetodoPago } from '@/domain/enums'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'

import { ETIQUETAS_TIPO_HABITACION } from '@/domain/enums'
import { formatCLP } from '@/lib/formato'
import { rangoEstadia } from '@/lib/fechas'

interface Paso3Props {
  datos: any
  setDatos: (datos: any) => void
  totalCalculado: { noches: number; total: number }
  procesando: boolean
}

const metodosPago: MetodoPago[] = ['webpay', 'transferencia', 'efectivo', 'tarjeta_credito']
const ETIQUETAS_METODOS: Record<MetodoPago, string> = {
  webpay: 'Webpay / Tarjeta',
  transferencia: 'Transferencia Bancaria',
  efectivo: 'Efectivo',
  tarjeta_credito: 'Tarjeta de Crédito',
}

function obtenerEtiquetaTipoHabitacion(tipo: unknown): string {
  const value = ETIQUETAS_TIPO_HABITACION[tipo as keyof typeof ETIQUETAS_TIPO_HABITACION]
  return value || String(tipo)
}

export default function Paso3Pago({
  datos,
  setDatos,
  totalCalculado,
  procesando,
}: Paso3Props) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-6">Resumen de la Reserva</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Huésped:</span>
            <span className="font-medium">{datos.huesped.nombre} {datos.huesped.apellido}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{datos.huesped.email}</span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Habitación:</span>
            <span className="font-medium">
              {datos.habitacionSeleccionada ? obtenerEtiquetaTipoHabitacion(datos.habitacionSeleccionada.tipo) : '-'} - Nº {datos.habitacionSeleccionada?.numero}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Fechas:</span>
            <span className="font-medium">{rangoEstadia(datos.fechaIngreso, datos.fechaSalida)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Huéspedes:</span>
            <span className="font-medium">{datos.cantidadHuespedes}</span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between text-base font-bold">
            <span>Total ({totalCalculado.noches} noches):</span>
            <span className="text-primary">{formatCLP(totalCalculado.total)}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Método de Pago</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {metodosPago.map((m) => (
            <button
              key={m}
              onClick={() => setDatos({ ...datos, metodoPago: m })}
              className={`p-3 border-2 rounded-lg text-left transition-all ${
                datos.metodoPago === m
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-medium">{ETIQUETAS_METODOS[m]}</div>
              {m === 'webpay' && (
                <div className="text-xs text-muted-foreground mt-1">Procesamiento inmediato (2-3 seg)</div>
              )}
              {m === 'transferencia' && (
                <div className="text-xs text-muted-foreground mt-1">Validar transferencia después</div>
              )}
              {m === 'efectivo' && (
                <div className="text-xs text-muted-foreground mt-1">Pago en recepción del hotel</div>
              )}
              {m === 'tarjeta_credito' && (
                <div className="text-xs text-muted-foreground mt-1">Débito directo en recepción</div>
              )}
            </button>
          ))}
        </div>

        {datos.metodoPago === 'webpay' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p className="text-blue-900">
              Se realizará una prueba de pago con una tasa de éxito del 85%. Esto es una simulación.
            </p>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-accent/30 border-primary/50">
        <div className="flex items-start gap-3">
          <Input
            type="checkbox"
            id="politicas"
            checked={datos.aceptaPoliticas}
            onChange={(e) => setDatos({ ...datos, aceptaPoliticas: e.target.checked })}
            className="w-4 h-4 mt-1"
          />
          <Label htmlFor="politicas" className="cursor-pointer flex-1">
            <span>Acepto las políticas de cancelación y condiciones del hotel.</span>
          </Label>
        </div>
      </Card>

      {procesando && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-blue-900 rounded-full animate-spin" />
            <span className="text-blue-900 font-medium">Procesando pago...</span>
          </div>
        </Card>
      )}
    </div>
  )
}
