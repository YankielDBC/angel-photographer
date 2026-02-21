'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
        // Store simple auth
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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="text-muted hover:text-accent transition mb-8 inline-block">
          ← Volver al inicio
        </Link>
        
        <div className="bg-secondary/30 p-8 rounded-2xl border border-white/10">
          <h1 className="font-serif text-3xl font-bold mb-2">
            Admin <span className="text-gradient">Angel</span>
          </h1>
          <p className="text-muted mb-8">Ingresa tus credenciales</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-primary border border-white/10 rounded-lg px-4 py-3 focus:border-accent outline-none transition"
                placeholder="admin@email.com"
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-primary border border-white/10 rounded-lg px-4 py-3 focus:border-accent outline-none transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/80 disabled:bg-secondary px-6 py-4 rounded-lg font-medium transition"
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-xs text-muted mt-6 text-center">
            ⚠️ Solo para el administrador
          </p>
        </div>
      </div>
    </div>
  )
}
