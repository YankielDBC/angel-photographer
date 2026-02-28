'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

type Booking = {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  date: string
  serviceType: string
  notes: string | null
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled'
  amount: number
  createdAt: string
}

const SERVICE_PRICES: Record<string, number> = {
  portraits: 1,
  events: 1,
  editorial: 1
}

const BOOKING_FEE = 1

export default function BookPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [bookedDates, setBookedDates] = useState<Booking[]>([])
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [showCalendar, setShowCalendar] = useState(true)
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceType: 'portraits',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    const startDay = start.getDay()
    const paddingStart = Array(startDay).fill(null)
    return [...paddingStart, ...days]
  }, [currentMonth])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [bookingsRes, blockedRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/blocked-dates')
      ])
      const bookingsData = await bookingsRes.json()
      const blockedData = await blockedRes.json()
      setBookedDates(bookingsData)
      setBlockedDates(blockedData.map((b: any) => format(new Date(b.date), 'yyyy-MM-dd')))
    } catch (err) {
      console.error(err)
    }
  }

  const getBookingForDate = (date: Date) => {
    return bookedDates.find(b => isSameDay(new Date(b.date), date))
  }

  const isDateBlocked = (date: Date) => {
    return blockedDates.includes(format(date, 'yyyy-MM-dd'))
  }

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date())
    return isBefore(date, today) || date.getDay() === 0 || isDateBlocked(date)
  }

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return
    const booking = getBookingForDate(date)
    if (booking && booking.status !== 'cancelled') return
    setSelectedDate(date)
    setError('')
    setShowCalendar(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate) {
      setError('Selecciona una fecha')
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

      setSuccess(true)
      fetchData()
    } catch (err) {
      setError('Algo salió mal. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 50%, #1a1a1a 100%)' }}>
        <div className="text-center p-8 rounded-2xl max-w-sm w-full" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: '#c9a96220' }}>
            <svg className="w-8 h-8" style={{ color: '#c9a962' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-light mb-3" style={{ color: '#c9a962' }}>Reservación Exitosa!</h1>
          <p className="text-white/60 text-sm mb-5">
            Tu solicitud ha sido enviada. Te contactaré pronto para confirmar tu cita.
          </p>
          <Link href="/" className="hover:underline text-sm" style={{ color: '#c9a962' }}>
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-3 sm:px-6" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 50%, #1a1a1a 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-white/60 hover:text-[#c9a962] transition mb-4 inline-flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </Link>

        <h1 className="text-2xl sm:text-3xl font-light mb-6" style={{ color: '#c9a962' }}>
          Reserva tu Sesión
        </h1>

        {/* Mobile: Calendar toggle */}
        <div className="md:hidden mb-4">
          <button 
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full flex items-center justify-between p-4 glass rounded-xl"
          >
            <span className="text-sm">
              {selectedDate 
                ? format(selectedDate, 'EEEE d MMMM', { locale: es })
                : 'Selecciona una fecha'
              }
            </span>
            <svg className={`w-5 h-5 transition-transform ${showCalendar ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar - Desktop always visible, Mobile toggleable */}
          <div className={`rounded-2xl p-4 sm:p-6 ${!showCalendar ? 'hidden md:block' : ''}`} style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="font-serif text-lg sm:text-xl font-bold">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </h2>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(day => (
                <div key={day} className="text-center text-xs text-gray-500 py-1 sm:py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={i} />
                
                const booking = getBookingForDate(day)
                const disabled = isDateDisabled(day)
                const blocked = isDateBlocked(day)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isConfirmed = booking?.status === 'confirmed' || booking?.status === 'paid'
                const isPending = booking?.status === 'pending'

                return (
                  <button
                    key={i}
                    onClick={() => handleDateSelect(day)}
                    disabled={disabled || (booking && booking.status !== 'cancelled')}
                    className={`
                      aspect-square rounded-lg flex items-center justify-center text-xs sm:text-sm relative transition-all
                      ${disabled || blocked
                        ? 'text-gray-700 cursor-not-allowed' 
                        : isSelected 
                          ? 'bg-[#c9a962] text-black font-bold' 
                          : isConfirmed
                            ? 'bg-green-500/30 text-green-400'
                            : isPending
                              ? 'bg-yellow-500/30 text-yellow-400'
                              : 'hover:bg-white/10 cursor-pointer'
                      }
                    `}
                  >
                    {format(day, 'd')}
                    {isConfirmed && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full"></span>}
                    {isPending && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>}
                    {blocked && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/10 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500/50 rounded-full"></span>
                <span>Confirmado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-yellow-500/50 rounded-full"></span>
                <span>Pendiente</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white/20 rounded-full"></span>
                <span>Disponible</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl p-4 sm:p-6" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <h2 className="font-serif text-xl font-bold mb-2">Tus Datos</h2>
            <p className="text-gray-500 text-sm mb-6">
              {selectedDate 
                ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: es })
                : 'Selecciona una fecha del calendario'
              }
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Nombre completo</label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition text-sm"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={formData.clientEmail}
                  onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition text-sm"
                  placeholder="juan@email.com"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Teléfono</label>
                <input
                  type="tel"
                  required
                  value={formData.clientPhone}
                  onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition text-sm"
                  placeholder="+1 786 123 4567"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Tipo de sesión</label>
                <select
                  value={formData.serviceType}
                  onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition text-sm"
                >
                  <option value="portraits">Retratos - ${SERVICE_PRICES.portraits}</option>
                  <option value="events">Eventos - ${SERVICE_PRICES.events}</option>
                  <option value="editorial">Editorial - ${SERVICE_PRICES.editorial}</option>
                </select>
              </div>

              <div className="bg-[#c9a962]/10 border border-[#c9a962]/20 rounded-xl p-4">
                <p className="text-[#c9a962] text-sm text-center">
                  <strong>$50</strong> fee de reservación
                </p>
                <p className="text-white/50 text-xs text-center mt-1">
                  Se descuenta del paquete seleccionado. Si no asistes, pierdes el fee.
                </p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Notas adicionales</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none transition text-sm h-20 resize-none"
                  placeholder="Ideas o requests especiales..."
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={!selectedDate || loading}
                className="w-full btn-glow disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3.5 rounded-xl font-medium transition text-sm"
              >
                {loading ? 'Enviando...' : selectedDate 
                  ? `Pagar $${BOOKING_FEE} - ${format(selectedDate, 'd MMM', { locale: es })}`
                  : 'Selecciona una fecha'
                }
              </button>

              <p className="text-xs text-white/40 text-center">
                Solo atiendo un cliente por día
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
