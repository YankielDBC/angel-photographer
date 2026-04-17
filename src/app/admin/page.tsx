'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Camera, Loader2 } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminEmail', data.email)
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Error de autenticación')
      }
    } catch (err) {
      setError('Algo salió mal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#f4f4f5]">
      {/* Decorative violet/purple gradient blobs - very soft */}
      <div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, oklch(0.541 0.281 293) 0%, transparent 70%)',
          opacity: 0.06,
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, oklch(0.586 0.233 291) 0%, transparent 70%)',
          opacity: 0.05,
          filter: 'blur(100px)',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, oklch(0.65 0.2 293) 0%, transparent 60%)',
          opacity: 0.03,
          filter: 'blur(120px)',
        }}
      />

      {/* Back link - top left */}
      <Link
        href="/"
        className="absolute top-6 left-6 text-zinc-400 hover:text-violet-600 text-sm flex items-center gap-1.5 transition-colors duration-200 z-10"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver al inicio
      </Link>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10 animate-fade-in-up">
        <div className="border-0 shadow-lg shadow-zinc-200/60 rounded-2xl overflow-hidden bg-white">
          <div className="p-8 sm:p-10">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-md shadow-violet-200 mb-5">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                Angel Photo
              </h1>
              <p className="text-zinc-400 text-sm mt-1.5 tracking-wide">
                Panel de Administración
              </p>
            </div>

            {/* Subtle divider */}
            <div className="h-px mx-auto mb-8 bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-zinc-500 text-sm font-medium mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-11 bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-300 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all duration-200 text-sm px-4 outline-none"
                  placeholder="admin@angelphoto.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-zinc-500 text-sm font-medium mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-11 bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-300 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all duration-200 text-sm px-4 outline-none"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 shadow-md shadow-violet-200/60 hover:shadow-lg hover:shadow-violet-300/60 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            {/* Credentials hint */}
            <p className="text-center text-zinc-300 text-xs mt-8">
              Credenciales de prueba: admin@angelphoto.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}