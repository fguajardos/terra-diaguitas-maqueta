import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

import type { Huesped } from '@/domain/types'
import { useHuespedesStore } from '@/stores/huespedesStore'
import { obtenerIniciales, formatRut } from '@/lib/formato'
import { validarRut, validarEmail } from '@/lib/validators'

interface Paso2Props {
  datos: any
  setDatos: (datos: any) => void
}

export default function Paso2Huesped({ datos, setDatos }: Paso2Props) {
  const [busqueda, setBusqueda] = useState('')
  const [mostrareFormNuevo, setMostrarFormNuevo] = useState(false)
  const [formNuevo, setFormNuevo] = useState({
    nombre: '',
    apellido: '',
    nacionalidad: 'Chile',
    rut: '',
    pasaporte: '',
    email: '',
    telefono: '',
  })

  const buscarHuespedes = useHuespedesStore((s) => s.buscar)
  const agregarHuesped = useHuespedesStore((s) => s.agregar)

  const resultadosBusqueda = busqueda.trim() ? buscarHuespedes(busqueda) : []

  const handleAgregarNuevo = () => {
    if (!formNuevo.nombre || !formNuevo.apellido || !formNuevo.email) {
      toast.error('Campos requeridos: nombre, apellido, email')
      return
    }

    if (!validarEmail(formNuevo.email)) {
      toast.error('Email no válido')
      return
    }

    if (formNuevo.nacionalidad === 'Chile' && formNuevo.rut) {
      if (!validarRut(formNuevo.rut)) {
        toast.error('RUT no válido')
        return
      }
    }

    const nuevoHuesped: Huesped = {
      id: `huesped-${Date.now()}`,
      nombre: formNuevo.nombre,
      apellido: formNuevo.apellido,
      nacionalidad: formNuevo.nacionalidad,
      rut: formNuevo.nacionalidad === 'Chile' ? formNuevo.rut : undefined,
      pasaporte: formNuevo.nacionalidad !== 'Chile' ? formNuevo.pasaporte : undefined,
      email: formNuevo.email,
      telefono: formNuevo.telefono,
      idiomaPreferido: 'es',
      preferencias: [],
      fechaRegistro: new Date().toISOString(),
    }

    agregarHuesped(nuevoHuesped)
    setDatos({ ...datos, huesped: nuevoHuesped })
    toast.success(`Huésped ${nuevoHuesped.nombre} registrado`)
    setMostrarFormNuevo(false)
    setBusqueda('')
  }

  return (
    <div className="space-y-6">
      {!datos.huesped ? (
        <>
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Búsqueda de Huésped</h2>
            <div>
              <Label htmlFor="busqueda">Buscar por RUT, Pasaporte o Email</Label>
              <Input
                id="busqueda"
                placeholder="Ej: 12345678-9 o john@example.com"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                autoFocus
              />
            </div>
          </Card>

          {busqueda.trim() && (
            <Card className="p-6">
              {resultadosBusqueda.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No se encontraron huéspedes</p>
                  <Button onClick={() => setMostrarFormNuevo(true)} variant="outline">
                    + Registrar nuevo huésped
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold">Resultados encontrados</h3>
                  {resultadosBusqueda.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => setDatos({ ...datos, huesped: h })}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{obtenerIniciales(h.nombre, h.apellido)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{h.nombre} {h.apellido}</div>
                          <div className="text-sm text-muted-foreground">{h.email}</div>
                          {h.rut && (
                            <div className="text-xs text-muted-foreground">{formatRut(h.rut)}</div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">Seleccionar</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {mostrareFormNuevo && (
            <Card className="p-6 border-primary/50 bg-accent/30">
              <h2 className="text-lg font-semibold mb-4">Registro de Nuevo Huésped</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={formNuevo.nombre}
                      onChange={(e) => setFormNuevo({ ...formNuevo, nombre: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input
                      id="apellido"
                      value={formNuevo.apellido}
                      onChange={(e) => setFormNuevo({ ...formNuevo, apellido: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="nacionalidad">Nacionalidad</Label>
                  <select
                    id="nacionalidad"
                    value={formNuevo.nacionalidad}
                    onChange={(e) => setFormNuevo({ ...formNuevo, nacionalidad: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="Chile">Chile</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Perú">Perú</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {formNuevo.nacionalidad === 'Chile' ? (
                  <div>
                    <Label htmlFor="rut">RUT</Label>
                    <Input
                      id="rut"
                      placeholder="12345678-9"
                      value={formNuevo.rut}
                      onChange={(e) => setFormNuevo({ ...formNuevo, rut: e.target.value })}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="pasaporte">Pasaporte</Label>
                    <Input
                      id="pasaporte"
                      value={formNuevo.pasaporte}
                      onChange={(e) => setFormNuevo({ ...formNuevo, pasaporte: e.target.value })}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formNuevo.email}
                      onChange={(e) => setFormNuevo({ ...formNuevo, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formNuevo.telefono}
                      onChange={(e) => setFormNuevo({ ...formNuevo, telefono: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAgregarNuevo} className="flex-1">
                    Guardar y continuar
                  </Button>
                  <Button onClick={() => setMostrarFormNuevo(false)} variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card className="p-6 bg-accent/50 border-primary/50">
          <h2 className="text-lg font-semibold mb-4">Huésped Principal</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback>{obtenerIniciales(datos.huesped.nombre, datos.huesped.apellido)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{datos.huesped.nombre} {datos.huesped.apellido}</div>
                <div className="text-sm text-muted-foreground">{datos.huesped.email}</div>
              </div>
            </div>
            <Button
              onClick={() => {
                setDatos({ ...datos, huesped: undefined })
                setBusqueda('')
                setMostrarFormNuevo(false)
              }}
              variant="outline"
            >
              Cambiar
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
