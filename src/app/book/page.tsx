'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, addDays, isBefore, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

type Booking = {
  id: string
  date: string
}

export default function BookPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [bookedDates, setBookedDates] = useState<string[]>([])
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceType: 'retratos',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [bookingId, setBookingId] = useState('')

  // Generate next 60 days (skip today if late)
  const today = startOfDay(new Date())
  const availableDates = Array.from({ length: 60 }, (_, i) => addDays(today, i + 1))
    .filter(date => {
      const day = date.getDay()
      return day !== 0 // No Sundays
    })

  useEffect(() => {
    // Fetch booked dates
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        const dates = data
          .filter((b: Booking) => b.date)
          .map((b: Booking) => format(new Date(b.date), 'yyyy-MM-dd'))
        setBookedDates(dates)
      })
      .catch(console.error)
  }, [])

  const handleDateSelect = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (bookedDates.includes(dateStr)) return
    setSelectedDate(date)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate) {
      setError('Por favor selecciona una fecha')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: selectedDate.toISOString()
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al crear reservación')
        return
      }

      setBookingId(data.id)

      // Create Stripe checkout
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: data.id, amount: 0.01 })
      })

      const checkoutData = await checkoutRes.json()

      if (checkoutData.url) {
        window.location.href = checkoutData.url
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Algo salió mal. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🎉</span>
          <h1 className="font-serif text-3xl font-bold mb-4">¡Reservación Exitosa!</h1>
          <p className="text-muted mb-6">Te he enviado un correo de confirmación.</p>
          <Link href="/" className="text-accent hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-muted hover:text-accent transition mb-8 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="font-serif text-4xl font-bold mb-2">
          Reserva tu <span className="text-gradient">Sesión</span>
        </h1>
        <p className="text-muted mb-12">
          Solo atiendo un cliente por día para garantizar la mejor experiencia.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Date Selection */}
          <div>
            <h2 className="font-serif text-xl font-bold mb-6">Selecciona una Fecha</h2>
            <div className="grid grid-cols-5 gap-2">
              {availableDates.slice(0, 30).map((date, i) => {
                const dateStr = format(date, 'yyyy-MM-dd')
                const isBooked = bookedDates.includes(dateStr)
                const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateStr

                return (
                  <button
                    key={i}
                    onClick={() => handleDateSelect(date)}
                    disabled={isBooked}
                    className={`
                      p-3 rounded-lg text-center transition
                      ${isBooked 
                        ? 'bg-secondary/30 text-muted/50 cursor-not-allowed line-through' 
                        : isSelected
                          ? 'bg-accent text-white'
                          : 'bg-secondary/50 hover:bg-secondary hover:border-accent border border-transparent'
                      }
                    `}
                  >
                    <span className="block text-lg font-bold">
                      {format(date, 'd')}
                    </span>
                    <span className="block text-xs opacity-70">
                      {format(date, 'EEE', { locale: es })}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="font-serif text-xl font-bold mb-6">Tus Datos</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-muted mb-1">Nombre completo</label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-3 focus:border-accent outline-none transition"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.clientEmail}
                  onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-3 focus:border-accent outline-none transition"
                  placeholder="juan@email.com"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-1">Teléfono</label>
                <input
                  type="tel"
                  required
                  value={formData.clientPhone}
                  onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-3 focus:border-accent outline-none transition"
                  placeholder="+1 786 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-1">Tipo de sesión</label>
                <select
                  value={formData.serviceType}
                  onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-3 focus:border-accent outline-none transition"
                >
                  <option value="retratos">Retratos</option>
                  <option value="eventos">Eventos</option>
                  <option value="creativa">Sesión Creativa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted mb-1">Notas adicionales</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-3 focus:border-accent outline-none transition h-24 resize-none"
                  placeholder="Alguna idea o request especial..."
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={!selectedDate || loading}
                className="w-full bg-accent hover:bg-accent/80 disabled:bg-secondary disabled:cursor-not-allowed px-6 py-4 rounded-lg font-medium transition"
              >
                {loading ? 'Procesando...' : selectedDate 
                  ? `Pagar $0.01 y Confirmar - ${format(selectedDate, 'd MMM', { locale: es })}`
                  : 'Selecciona una fecha'
                }
              </button>

              <p className="text-xs text-muted text-center">
                🔒 Pago seguro con Stripe (test mode)
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
