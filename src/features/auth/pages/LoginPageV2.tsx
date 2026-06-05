import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mountain, Lock, Mail, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { useSessionStore } from '@/stores/sessionStore'
import { validarCredenciales, generarOTP, estaEnRateLimit } from '@/services/authService'
import { usuariosSeed } from '@/data/usuarios.seed'
import { rutaInicialDeRol } from '@/stores/sessionStore'

type LoginStep = 'credentials' | 'otp'

export function LoginPageV2() {
  const navigate = useNavigate()
  const { validarOTPYAutenticar, cancelar2FA } = useSessionStore()

  // Paso del flujo
  const [paso, setPaso] = useState<LoginStep>('credentials')

  // Credenciales
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [usuarioAutenticado, setUsuarioAutenticado] = useState<any>(null)

  // OTP
  const [otp, setOtp] = useState('')
  const [otpEnviado, setOtpEnviado] = useState<string>('')

  // Errores y validaciones
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

      // Credenciales válidas: enviar OTP
      setUsuarioAutenticado(usuario)
      generarOTP(email)
      setOtpEnviado(email)
      toast.success('Código OTP enviado a tu email', {
        description: `Revisa la consola del navegador para el código simulado`,
      })
      setPaso('otp')
    } finally {
      setLoading(false)
    }
  }

  const handleValidarOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!otp || otp.length !== 6) {
      setError('El código OTP debe tener 6 dígitos')
      return
    }

    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 400))

      const esValido = validarOTPYAutenticar(usuarioAutenticado.id, otp)

      if (!esValido) {
        setError('Código OTP incorrecto')
        setOtp('')
        return
      }

      // Autenticación completa
      toast.success('Bienvenido', {
        description: `Sesión iniciada como ${usuarioAutenticado.nombre}`,
      })

      navigate(rutaInicialDeRol(usuarioAutenticado.rol), { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelar = () => {
    setPaso('credentials')
    setOtp('')
    setOtpEnviado('')
    setUsuarioAutenticado(null)
    cancelar2FA()
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
            {paso === 'credentials' ? (
              <>
                <h2 className="text-xl font-semibold text-white mb-6 text-center">Iniciar Sesión Segura</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                      <Input
                        type="email"
                        placeholder="maria@demo.cl"
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
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Rate limit */}
                  {tiempoEspera > 0 && (
                    <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-md flex items-start gap-2 text-sm text-yellow-300">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
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
                      'Continuar'
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
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-white mb-2 text-center">Verificación de 2FA</h2>
                <p className="text-sm text-slate-400 text-center mb-6">Ingresa el código de 6 dígitos enviado a {otpEnviado}</p>

                <form onSubmit={handleValidarOTP} className="space-y-4">
                  {/* OTP Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Código OTP</label>
                    <Input
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={e => {
                        const valor = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setOtp(valor)
                        setError('')
                      }}
                      disabled={loading}
                      maxLength={6}
                      className="text-center text-2xl font-mono tracking-widest bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Revisa la consola del navegador (DevTools)</p>
                  </div>

                  {/* Errores */}
                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md flex items-start gap-2 text-sm text-red-300">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Botones */}
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium h-10"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Verificar
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      onClick={handleCancelar}
                      variant="outline"
                      className="w-full text-slate-300 border-slate-600 hover:bg-slate-700"
                    >
                      Atrás
                    </Button>
                  </div>
                </form>

                {/* Info OTP */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <Badge variant="outline" className="bg-blue-500/10 border-blue-500/50 text-blue-300 text-xs">
                    🔐 Sesión Segura
                  </Badge>
                  <p className="text-xs text-slate-500 mt-2">El código OTP es válido por 5 minutos</p>
                </div>
              </>
            )}
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
