'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay, addMonths, subMonths, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'

type Booking = {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  date: string
  serviceType: string
  notes: string | null
  status: string
  amount: number
  paymentMethod: string | null
  createdAt: string
}

type BlockedDate = {
  id: string
  date: string
  reason: string | null
}

const SERVICE_PRICES: Record<string, number> = {
  portraits: 150,
  events: 300,
  editorial: 250
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente', color: '#fbbf24' },
  { value: 'confirmed', label: 'Confirmado', color: '#22c55e' },
  { value: 'completed', label: 'Completado', color: '#3b82f6' },
  { value: 'no_show', label: 'No Vino', color: '#ef4444' },
  { value: 'cancelled', label: 'Cancelado', color: '#6b7280' },
]

const PAYMENT_METHODS = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'cashapp', label: 'CashApp' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'cash', label: 'Efectivo' },
]

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin')
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const [bookingsRes, blockedRes] = await Promise.all([
        fetch('/api/admin/bookings'),
        fetch('/api/blocked-dates')
      ])
      const bookingsData = await bookingsRes.json()
      const blockedData = await blockedRes.json()
      setBookings(bookingsData)
      setBlockedDates(blockedData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminEmail')
    router.push('/admin')
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const updatePaymentMethod = async (id: string, paymentMethod: string) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod })
      })
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const deleteBooking = async (id: string) => {
    if (!confirm('¿Eliminar esta reserva?')) return
    try {
      await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
      fetchData()
      setSelectedBooking(null)
    } catch (err) {
      console.error(err)
    }
  }

  const toggleBlockDate = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const isBlocked = blockedDates.some(b => format(new Date(b.date), 'yyyy-MM-dd') === dateStr)
    
    try {
      if (isBlocked) {
        await fetch(`/api/blocked-dates?date=${dateStr}`, { method: 'DELETE' })
      } else {
        await fetch('/api/blocked-dates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateStr, reason: 'Bloqueado por admin' })
        })
      }
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const today = startOfDay(new Date())

  const filteredBookings = bookings.filter(b => {
    const bookingDate = startOfDay(new Date(b.date))
    if (filter === 'upcoming') return isAfter(bookingDate, today) && b.status !== 'cancelled'
    if (filter === 'past') return isBefore(bookingDate, today) || b.status === 'completed' || b.status === 'no_show'
    return true
  })

  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(b => isAfter(startOfDay(new Date(b.date)), today) && b.status !== 'cancelled').length,
    past: bookings.filter(b => isBefore(startOfDay(new Date(b.date)), today) || b.status === 'completed' || b.status === 'no_show').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    noShow: bookings.filter(b => b.status === 'no_show').length,
    income: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.amount || 0), 0)
  }

  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })
  const startDay = startOfMonth(currentMonth).getDay()
  const paddingStart = Array(startDay).fill(null)

  const getBookingForDate = (date: Date) => {
    return bookings.find(b => isSameDay(new Date(b.date), date))
  }

  const isDateBlocked = (date: Date) => {
    return blockedDates.some(b => isSameDay(new Date(b.date), date))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 50%, #1a1a1a 100%)' }}>
        <div className="text-white/60">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 50%, #1a1a1a 100%)' }}>
      {/* Header */}
      <header className="p-4 border-b" style={{ borderColor: '#333', background: '#151515' }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-light" style={{ color: '#c9a962' }}>ADMIN</h1>
          <button onClick={handleLogout} className="text-white/60 hover:text-white text-sm">
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
          <div className="p-3 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <p className="text-xs text-white/50">Total</p>
            <p className="text-xl font-light text-white">{stats.total}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <p className="text-xs text-white/50">Próximos</p>
            <p className="text-xl font-light" style={{ color: '#22c55e' }}>{stats.upcoming}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <p className="text-xs text-white/50">Pasados</p>
            <p className="text-xl font-light text-white/60">{stats.past}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <p className="text-xs text-white/50">Pendientes</p>
            <p className="text-xl font-light" style={{ color: '#fbbf24' }}>{stats.pending}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <p className="text-xs text-white/50">Completados</p>
            <p className="text-xl font-light" style={{ color: '#3b82f6' }}>{stats.completed}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <p className="text-xs text-white/50">Ingresos</p>
            <p className="text-xl font-light" style={{ color: '#c9a962' }}>${stats.income}</p>
          </div>
        </div>

        {/* Toggle View & Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setView('calendar')}
            className="px-3 py-1.5 rounded-lg text-sm transition"
            style={view === 'calendar' ? { background: '#c9a962', color: '#000' } : { background: '#1a1a1a', color: '#666', border: '1px solid #333' }}
          >
            Calendario
          </button>
          <button
            onClick={() => setView('list')}
            className="px-3 py-1.5 rounded-lg text-sm transition"
            style={view === 'list' ? { background: '#c9a962', color: '#000' } : { background: '#1a1a1a', color: '#666', border: '1px solid #333' }}
          >
            Lista
          </button>
          <div className="w-px bg-white/10 mx-2"></div>
          <button
            onClick={() => setFilter('all')}
            className="px-3 py-1.5 rounded-lg text-sm transition"
            style={filter === 'all' ? { background: '#c9a962', color: '#000' } : { background: '#1a1a1a', color: '#666', border: '1px solid #333' }}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className="px-3 py-1.5 rounded-lg text-sm transition"
            style={filter === 'upcoming' ? { background: '#c9a962', color: '#000' } : { background: '#1a1a1a', color: '#666', border: '1px solid #333' }}
          >
            Próximos
          </button>
          <button
            onClick={() => setFilter('past')}
            className="px-3 py-1.5 rounded-lg text-sm transition"
            style={filter === 'past' ? { background: '#c9a962', color: '#000' } : { background: '#1a1a1a', color: '#666', border: '1px solid #333' }}
          >
            Pasados
          </button>
        </div>

        {/* Calendar View */}
        {view === 'calendar' && (
          <div className="rounded-xl p-4" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-light text-white">{format(currentMonth, 'MMMM yyyy', { locale: es })}</h2>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(day => (
                <div key={day} className="text-center text-xs text-white/40 py-2">{day}</div>
              ))}
            </div>

            {/* Calendar Grid - Click FIX: uses day.getDate() */}
            <div className="grid grid-cols-7 gap-1">
              {paddingStart.map((_, i) => <div key={`pad-${i}`} />)}
              {calendarDays.map((day, i) => {
                const booking = getBookingForDate(day)
                const blocked = isDateBlocked(day)
                const isPast = isBefore(day, startOfDay(new Date()))
                
                const statusColor = booking?.status === 'completed' ? '#3b82f6' 
                  : booking?.status === 'no_show' ? '#ef4444'
                  : booking?.status === 'confirmed' ? '#22c55e'
                  : booking?.status === 'pending' ? '#fbbf24'
                  : booking?.status === 'cancelled' ? '#6b7280'
                  : null
                
                return (
                  <button
                    key={i}
                    onClick={() => !isPast && toggleBlockDate(day)}
                    disabled={isPast}
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-all
                      ${isPast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                      ${blocked ? 'bg-red-500/20 border border-red-500/50' : ''}
                      ${booking && !blocked ? '' : ''}
                      ${!booking && !blocked && !isPast ? 'bg-white/5 hover:bg-white/10' : ''}
                    `}
                    style={booking && !blocked && !isPast ? { background: statusColor + '30', border: `1px solid ${statusColor}50` } : {}}
                  >
                    <span className={blocked ? 'text-red-400' : 'text-white'}>
                      {day.getDate()}
                    </span>
                    {blocked && (
                      <svg className="w-3 h-3 text-red-400 absolute top-1 right-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4z"/>
                      </svg>
                    )}
                    {booking && !blocked && (
                      <span className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ background: statusColor || '#666' }} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t text-xs text-white/50">
              {STATUS_OPTIONS.map(s => (
                <div key={s.value} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }}></span>
                  {s.label}
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-500/50 rounded-full"></span>
                Bloqueado
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="space-y-3">
            {filteredBookings.length === 0 ? (
              <p className="text-white/40 text-center py-8">No hay reservas</p>
            ) : (
              filteredBookings.map(booking => {
                const statusInfo = STATUS_OPTIONS.find(s => s.value === booking.status)
                const isPast = isBefore(startOfDay(new Date(booking.date)), today)
                
                return (
                  <div
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="p-4 rounded-xl cursor-pointer transition hover:scale-[1.01]"
                    style={{ background: '#1a1a1a', border: '1px solid #333' }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-light">{booking.clientName}</p>
                        <p className="text-white/50 text-sm">{booking.clientPhone}</p>
                        {booking.paymentMethod && (
                          <p className="text-white/40 text-xs mt-1">Pago: {PAYMENT_METHODS.find(p => p.value === booking.paymentMethod)?.label || booking.paymentMethod}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-sm">{format(new Date(booking.date), 'd MMM', { locale: es })}</p>
                        <span className="text-xs px-2 py-0.5 rounded inline-block mt-1" style={{ 
                          background: statusInfo?.color + '20',
                          color: statusInfo?.color
                        }}>
                          {statusInfo?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Booking Detail Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedBooking(null)}>
            <div className="rounded-2xl p-6 max-w-md w-full" style={{ background: '#1a1a1a', border: '1px solid #333' }} onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-light text-white mb-4">{selectedBooking.clientName}</h3>
              
              <div className="space-y-3 text-sm text-white/60 mb-6">
                <p><span className="text-white/40">Email:</span> {selectedBooking.clientEmail}</p>
                <p><span className="text-white/40">Teléfono:</span> {selectedBooking.clientPhone}</p>
                <p><span className="text-white/40">Fecha:</span> {format(new Date(selectedBooking.date), 'd MMMM yyyy', { locale: es })}</p>
                <p><span className="text-white/40">Servicio:</span> {selectedBooking.serviceType}</p>
                <p><span className="text-white/40">Monto:</span> ${selectedBooking.amount}</p>
                
                {/* Payment Method Selector */}
                <div>
                  <span className="text-white/40">Método de pago:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {PAYMENT_METHODS.map(pm => (
                      <button
                        key={pm.value}
                        onClick={() => updatePaymentMethod(selectedBooking.id, pm.value)}
                        className="px-2 py-1 rounded text-xs transition"
                        style={selectedBooking.paymentMethod === pm.value 
                          ? { background: '#c9a962', color: '#000' } 
                          : { background: '#333', color: '#666' }
                        }
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedBooking.notes && <p><span className="text-white/40">Notas:</span> {selectedBooking.notes}</p>}
              </div>

              {/* Status Buttons */}
              <div className="flex gap-2 flex-wrap mb-4">
                {STATUS_OPTIONS.filter(s => s.value !== 'cancelled').map(s => (
                  <button
                    key={s.value}
                    onClick={() => updateStatus(selectedBooking.id, s.value)}
                    className="px-3 py-1.5 rounded-lg text-xs transition"
                    style={selectedBooking.status === s.value 
                      ? { background: s.color + '30', color: s.color, border: `1px solid ${s.color}` }
                      : { background: '#333', color: '#666' }
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={() => deleteBooking(selectedBooking.id)} className="px-4 py-2 rounded-lg text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30">
                  Eliminar
                </button>
              </div>

              <button onClick={() => setSelectedBooking(null)} className="mt-4 text-white/40 hover:text-white text-sm">
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
