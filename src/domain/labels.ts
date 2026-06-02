import type { EstadoPago } from './enums'

export const ETIQUETAS_ESTADO_PAGO: Record<EstadoPago, string> = {
  pendiente: 'Pendiente',
  parcial: 'Parcial',
  pagado: 'Pagado',
  reembolsado: 'Reembolsado',
}
