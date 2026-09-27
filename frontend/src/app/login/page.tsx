"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, ArrowLeft, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [tenantName, setTenantName] = useState('ProBookia Suite')
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const emailParam = params.get('email')
      if (emailParam) {
        setEmail(emailParam)
      }
      const welcomeParam = params.get('welcome')
      if (welcomeParam === 'true') {
        setSuccess('¡Tu portal de reservas está activo! Por seguridad, introduce tu contraseña para acceder.')
      }
      const reasonParam = params.get('reason')
      if (reasonParam === 'superseded') {
        setError('Tu sesión ha sido cerrada automáticamente porque se inició sesión en otro dispositivo.')
      }

      const hostname = window.location.hostname.toLowerCase()
      if (hostname === 'probookia.com' || hostname === 'www.probookia.com' || hostname === 'localhost') {
        setTenantName('ProBookia Suite')
      } else if (hostname.includes('.localhost') && hostname !== 'localhost') {
        const sub = hostname.split('.')[0]
        if (sub === 'www') {
          setTenantName('ProBookia Suite')
        } else {
          setTenantName(sub === 'merce' ? 'Estética Mercè' : sub.charAt(0).toUpperCase() + sub.slice(1))
        }
      } else if (hostname.endsWith('.probookia.com')) {
        const sub = hostname.replace('.probookia.com', '')
        if (sub === 'www') {
          setTenantName('ProBookia Suite')
        } else {
          setTenantName(sub === 'merce' ? 'Estética Mercè' : sub.charAt(0).toUpperCase() + sub.slice(1))
        }
      } else if (hostname.includes('esteticamerce.com')) {
        setTenantName('Estética Mercè')
      } else {
        setTenantName('ProBookia Suite')
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        throw new Error(authError.message === 'Invalid login credentials' ? 'Credenciales incorrectas' : authError.message)
      }

      const userPayload = {
        email: data.user.email,
        id: data.user.id,
        access_token: data.session.access_token
      }

      const role = data.user.app_metadata?.role || data.user.user_metadata?.role
      localStorage.setItem('user', JSON.stringify(userPayload))

      // 1. Si venía con un parámetro redirect explícito (ej. aceptar invitación)
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      const redirectTarget = params?.get('redirect')

      if (redirectTarget) {
        router.push(redirectTarget)
        return
      }

      // 2. Si es super_admin y está en el dominio principal de la plataforma
      const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : ''
      const isMainDomain = hostname === 'probookia.com' || hostname === 'www.probookia.com' || hostname === 'localhost'

      if (role === 'super_admin' && isMainDomain) {
        router.push('/super-admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const redirectToUrl = `${window.location.origin}/restablecer-contrasena`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectToUrl,
      })

      if (resetError) {
        throw new Error(resetError.message)
      }

      setSuccess('¡Enlace de recuperación enviado! Revisa tu bandeja de entrada o spam.')
    } catch (err: any) {
      setError(err.message === 'Email not found' ? 'El correo ingresado no está registrado' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-4 sm:px-6 relative overflow-hidden selection:bg-[#D4AF37]/20 selection:text-stone-900">
      {/* Halos ambientales dorados de fondo (Aceternity Glow) */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[620px] h-[320px] bg-gradient-to-b from-[#D4AF37]/15 to-transparent rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[480px] h-[280px] bg-[#D4AF37]/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Sutil cuadrícula de micropuntos táctiles */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#1c1917 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <Card className="w-full max-w-md border-stone-200/70 bg-white/85 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] rounded-[2rem] p-8 sm:p-10 relative z-10 transition-all duration-300">
        {/* Cabecera con Monograma Oficial */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-900 border border-[#D4AF37]/35 shadow-xl shadow-[#D4AF37]/15 mb-5 group">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D4AF37]/25 via-transparent to-transparent pointer-events-none" />
            <span className="font-serif text-2xl font-bold bg-gradient-to-br from-amber-100 via-[#D4AF37] to-amber-600 bg-clip-text text-transparent select-none transition-transform duration-300 group-hover:scale-105">
              P
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mb-2">
            {isForgotPassword ? 'Recuperar Contraseña' : 'Panel de Acceso'}
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] font-medium text-stone-400">
            {tenantName}
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50/90 border border-rose-200/80 text-rose-700 rounded-xl text-xs leading-relaxed text-center shadow-sm animate-in fade-in-50 duration-200">
            {error}
          </div>
        )}

        {/* Mensaje de Éxito */}
        {success && (
          <div className="mb-6 p-3.5 bg-emerald-50/90 border border-emerald-200/80 text-emerald-700 rounded-xl text-xs leading-relaxed text-center shadow-sm animate-in fade-in-50 duration-200">
            {success}
          </div>
        )}

        {!isForgotPassword ? (
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-stone-500 mb-1.5 ml-1">
                Correo corporativo
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ejemplo.com"
                className="h-11"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-xs font-medium uppercase tracking-wider text-stone-500">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError('')
                    setSuccess('')
                    setIsForgotPassword(true)
                  }}
                  className="text-xs font-medium text-stone-400 hover:text-stone-800 transition-colors focus:outline-none"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors focus:outline-none p-1"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="luxury"
              size="lg"
              disabled={loading}
              className="w-full mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleForgotPassword}>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-stone-500 mb-1.5 ml-1">
                Correo registrado
              </label>
              <div className="relative">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="h-11 pl-10"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              variant="luxury"
              size="lg"
              disabled={loading}
              className="w-full mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Enviando enlace...</span>
                </>
              ) : (
                'Enviar Enlace de Recuperación'
              )}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setSuccess('')
                  setIsForgotPassword(false)
                }}
                className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-stone-100 text-center">
          <Link
            href="/"
            className="text-xs font-medium text-stone-400 hover:text-stone-700 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3 h-3" />
            Volver al portal público
          </Link>
        </div>
      </Card>
    </div>
  )
}
