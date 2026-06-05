import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mountain, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

import { useSessionStore } from '@/stores/sessionStore'
import { validarCredenciales, estaEnRateLimit } from '@/services/authService'
import { usuariosSeed } from '@/data/usuarios.seed'
import { rutaInicialDeRol } from '@/stores/sessionStore'

export function LoginPageV2() {
  const navigate = useNavigate()
  const { iniciarSesion } = useSessionStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tiempoEspera, setTiempoEspera] = useState(0)

  // Timer para rate limit
  useEffect(() => {
    if (tiempoEspera > 0) {
      const timer = setTimeout(() => setTiempoEspera(t => t - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [tiempoEspera])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validar email y contraseña
    if (!email || !password) {
      setError('Email y contraseña son requeridos')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    // Verificar rate limit
    const { limitado, esperarSegundos } = estaEnRateLimit(email)
    if (limitado) {
      setError(`Demasiados intentos. Espera ${esperarSegundos}s`)
      setTiempoEspera(esperarSegundos)
      return
    }

    setLoading(true)

    try {
      // Simular latencia de validación
      await new Promise(resolve => setTimeout(resolve, 500))

      const usuario = validarCredenciales(email, password)

      if (!usuario) {
        setError('Email o contraseña incorrectos')
        setPassword('')
        return
      }

      // Credenciales válidas: autenticar directamente
      const ok = iniciarSesion(usuario.id)
      if (!ok) {
        setError('No se pudo iniciar sesión')
        return
      }

      toast.success(`Bienvenido, ${usuario.nombre}`, {
        description: `Sesión iniciada como ${usuario.rol}.`,
      })

      navigate(rutaInicialDeRol(usuario.rol), { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Mountain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">TERRA DIAGUITAS</h1>
              <p className="text-xs text-slate-400">Vicuña · Valle del Elqui</p>
            </div>
          </div>
        </div>

        {/* Card principal */}
        <Card className="bg-slate-800 border-slate-700 shadow-2xl">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">Iniciar Sesión</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="maria.gonzalez@terradiaguitas.cl"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    disabled={loading || tiempoEspera > 0}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    disabled={loading || tiempoEspera > 0}
                    className="pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Mínimo 6 caracteres</p>
              </div>

              {/* Errores */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md flex items-start gap-2 text-sm text-red-300">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Rate limit */}
              {tiempoEspera > 0 && (
                <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-md flex items-start gap-2 text-sm text-yellow-300">
                  <span>⏱️</span>
                  <span>Intenta de nuevo en {tiempoEspera}s</span>
                </div>
              )}

              {/* Botón */}
              <Button
                type="submit"
                disabled={loading || tiempoEspera > 0}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium h-10"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Validando...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            {/* Info de demostración */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-xs text-slate-400 mb-3 font-medium">Cuentas de demo:</p>
              <div className="space-y-2">
                {usuariosSeed.slice(0, 3).map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setEmail(u.email)
                      setPassword('123456')
                      setError('')
                    }}
                    className="w-full text-left text-xs p-2 rounded bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <p className="font-medium">{u.nombre} {u.apellido}</p>
                    <p className="text-slate-500">{u.email}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Maqueta funcional · Fase 0 · Procesos360
        </p>
      </div>
    </div>
  )
}

export default LoginPageV2
