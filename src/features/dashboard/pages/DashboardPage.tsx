import { useReservasStore } from '@/stores/reservasStore'
import { useHabitacionesStore } from '@/stores/habitacionesStore'
import { hoyISO } from '@/lib/fechas'
import { formatCLP } from '@/lib/formato'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Key, TrendingUp, Calendar, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  const { reservas } = useReservasStore()
  const { habitaciones } = useHabitacionesStore()

  const hoy = hoyISO()

  // KPI: Ocupancia actual
  const ocupadas = habitaciones.filter(h => h.estado === 'ocupada').length
  const ocupanciaPercent = Math.round((ocupadas / habitaciones.length) * 100)

  // KPI: Check-in próximas 24h (estado confirmada/pagada con check-in hoy)
  const checkInHoy = reservas.filter(
    r => r.estado === 'confirmada' || r.estado === 'pagada'
        ? r.fechaIngreso === hoy
        : false
  ).length

  // KPI: Check-out próximas 24h (check-out realizado con salida hoy)
  const checkOutHoy = reservas.filter(
    r => r.estado === 'check_in_realizado' && r.fechaSalida === hoy
  ).length

  // KPI: Revenue hoy (pagadas + check_out_realizado con fechaSalida === hoy)
  const revenueHoy = reservas
    .filter(r => {
      if (r.estado === 'pagada' || r.estado === 'check_in_realizado') {
        return r.fechaIngreso === hoy
      }
      if (r.estado === 'check_out_realizado') {
        return r.fechaSalida === hoy
      }
      return false
    })
    .reduce((sum, r) => sum + (r.pago.montoPagado || 0), 0)

  // KPI: Revenue mes (ultimos 30 días)
  const hace30 = new Date()
  hace30.setDate(hace30.getDate() - 30)
  const hace30ISO = hace30.toISOString().slice(0, 10)
  const revenueMes = reservas
    .filter(r => r.fechaCreacion >= hace30ISO)
    .reduce((sum, r) => sum + (r.pago.montoPagado || 0), 0)

  // KPI: ADR (Average Daily Rate) = Total revenue / Total nights esta semana
  const hace7 = new Date()
  hace7.setDate(hace7.getDate() - 7)
  const hace7ISO = hace7.toISOString().slice(0, 10)
  const reservasSemana = reservas.filter(
    r => r.fechaCheckIn && r.fechaCheckIn >= hace7ISO && r.estado === 'check_out_realizado'
  )
  const totalNochesSemana = reservasSemana.reduce((sum, r) => sum + r.cantidadNoches, 0)
  const totalRevenueSemana = reservasSemana.reduce((sum, r) => sum + (r.pago.montoPagado || 0), 0)
  const adr = totalNochesSemana > 0 ? Math.round(totalRevenueSemana / totalNochesSemana) : 0

  // Estados de habitaciones
  const habitacionesPorEstado = {
    disponible: habitaciones.filter(h => h.estado === 'disponible').length,
    ocupada: habitaciones.filter(h => h.estado === 'ocupada').length,
    reservada: habitaciones.filter(h => h.estado === 'reservada').length,
    pendiente_limpieza: habitaciones.filter(h => h.estado === 'pendiente_limpieza').length,
    en_limpieza: habitaciones.filter(h => h.estado === 'en_limpieza').length,
    bloqueada: habitaciones.filter(h => h.estado === 'bloqueada').length,
  }

  // Estados de reservas
  const reservasPorEstado = {
    pendiente: reservas.filter(r => r.estado === 'pendiente').length,
    confirmada: reservas.filter(r => r.estado === 'confirmada').length,
    pagada: reservas.filter(r => r.estado === 'pagada').length,
    check_in_realizado: reservas.filter(r => r.estado === 'check_in_realizado').length,
    check_out_realizado: reservas.filter(r => r.estado === 'check_out_realizado').length,
    cancelada: reservas.filter(r => r.estado === 'cancelada').length,
    no_show: reservas.filter(r => r.estado === 'no_show').length,
  }

  // Alertas
  const alertas = []
  if (ocupanciaPercent < 30) {
    alertas.push({ tipo: 'info', msg: `Baja ocupancia (${ocupanciaPercent}%)` })
  }
  const morosos = reservas.filter(r => r.pago.estado === 'pendiente').length
  if (morosos > 0) {
    alertas.push({ tipo: 'warning', msg: `${morosos} reservas sin pagar` })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Operacional</h1>
        <div className="text-sm text-muted-foreground">
          Actualizado en tiempo real • {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 space-y-2 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Ocupancia</span>
            <Key className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600">{ocupanciaPercent}%</div>
          <div className="text-xs text-muted-foreground">{ocupadas} de {habitaciones.length} habitaciones</div>
        </Card>

        <Card className="p-6 space-y-2 bg-gradient-to-br from-green-50 to-green-100/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Revenue Hoy</span>
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">{formatCLP(revenueHoy)}</div>
          <div className="text-xs text-muted-foreground">Pagos completados</div>
        </Card>

        <Card className="p-6 space-y-2 bg-gradient-to-br from-purple-50 to-purple-100/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">ADR</span>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-600">{formatCLP(adr)}</div>
          <div className="text-xs text-muted-foreground">Promedio por noche (7d)</div>
        </Card>

        <Card className="p-6 space-y-2 bg-gradient-to-br from-orange-50 to-orange-100/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Próximas 24h</span>
            <Calendar className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-orange-600">{checkInHoy + checkOutHoy}</div>
          <div className="text-xs text-muted-foreground">{checkInHoy} check-in, {checkOutHoy} check-out</div>
        </Card>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((alerta, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border flex items-start gap-3 ${
                alerta.tipo === 'warning'
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{alerta.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Estados de Habitaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Estado de Habitaciones</h2>
          <div className="space-y-3">
            {Object.entries(habitacionesPorEstado).map(([estado, cantidad]) => (
              <div key={estado} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-sm capitalize text-muted-foreground">{estado.replace(/_/g, ' ')}</span>
                </div>
                <Badge variant="secondary">{cantidad}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Estados de Reservas */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Estado de Reservas</h2>
          <div className="space-y-3">
            {Object.entries(reservasPorEstado).map(([estado, cantidad]) => {
              const colorMap: Record<string, string> = {
                pendiente: 'bg-yellow-100',
                confirmada: 'bg-blue-100',
                pagada: 'bg-green-100',
                check_in_realizado: 'bg-purple-100',
                check_out_realizado: 'bg-gray-100',
                cancelada: 'bg-red-100',
                no_show: 'bg-red-50',
              }
              return (
                <div key={estado} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colorMap[estado]}`}></div>
                    <span className="text-sm capitalize text-muted-foreground">{estado.replace(/_/g, ' ')}</span>
                  </div>
                  <Badge variant="outline">{cantidad}</Badge>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Métricas Financieras */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Métricas Financieras</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Revenue Últimos 30 días</p>
            <p className="text-2xl font-bold text-green-600">{formatCLP(revenueMes)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Reservas</p>
            <p className="text-2xl font-bold text-blue-600">{reservas.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Tasa Cancelación</p>
            <p className="text-2xl font-bold text-red-600">
              {reservas.length > 0 ? Math.round((reservasPorEstado.cancelada / reservas.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
