'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
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
  createdAt: string
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin')
      return
    }

    fetch('/api/admin/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminEmail')
    router.push('/admin')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-400'
      case 'confirmed': return 'text-blue-400'
      default: return 'text-yellow-400'
    }
  }

  return (
    <div className="min-h-screen py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-muted hover:text-accent transition text-sm">
              ← Volver al inicio
            </Link>
            <h1 className="font-serif text-4xl font-bold mt-2">
              Panel de <span className="text-gradient">Administrador</span>
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-lg transition"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-secondary/30 p-6 rounded-xl">
            <p className="text-muted text-sm">Total Reservas</p>
            <p className="font-serif text-3xl font-bold">{bookings.length}</p>
          </div>
          <div className="bg-secondary/30 p-6 rounded-xl">
            <p className="text-muted text-sm">Pagadas</p>
            <p className="font-serif text-3xl font-bold text-green-400">
              {bookings.filter(b => b.status === 'paid').length}
            </p>
          </div>
          <div className="bg-secondary/30 p-6 rounded-xl">
            <p className="text-muted text-sm">Pendientes</p>
            <p className="font-serif text-3xl font-bold text-yellow-400">
              {bookings.filter(b => b.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-secondary/30 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted">Cargando...</div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-muted">
              <span className="text-4xl block mb-4">📷</span>
              No hay reservas aún
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm text-muted font-medium">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm text-muted font-medium">Cliente</th>
                    <th className="px-6 py-4 text-left text-sm text-muted font-medium">Servicio</th>
                    <th className="px-6 py-4 text-left text-sm text-muted font-medium">Estado</th>
                    <th className="px-6 py-4 text-left text-sm text-muted font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        {format(new Date(booking.date), 'd MMM yyyy', { locale: es })}
                      </td>
                      <td className="px-6 py-4">{booking.clientName}</td>
                      <td className="px-6 py-4 capitalize">{booking.serviceType}</td>
                      <td className="px-6 py-4">
                        <span className={getStatusColor(booking.status)}>
                          {booking.status === 'paid' ? '✓ Pagado' : '⏳ Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-accent hover:underline text-sm"
                        >
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50" onClick={() => setSelectedBooking(null)}>
            <div className="bg-secondary/90 p-8 rounded-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
              <h2 className="font-serif text-2xl font-bold mb-6">Detalles de Reserva</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-muted text-sm">Cliente</p>
                  <p className="font-medium">{selectedBooking.clientName}</p>
                </div>
                <div>
                  <p className="text-muted text-sm">Email</p>
                  <p className="font-medium">{selectedBooking.clientEmail}</p>
                </div>
                <div>
                  <p className="text-muted text-sm">Teléfono</p>
                  <p className="font-medium">{selectedBooking.clientPhone}</p>
                </div>
                <div>
                  <p className="text-muted text-sm">Fecha</p>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.date), 'EEEE d MMMM yyyy', { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-muted text-sm">Servicio</p>
                  <p className="font-medium capitalize">{selectedBooking.serviceType}</p>
                </div>
                <div>
                  <p className="text-muted text-sm">Monto</p>
                  <p className="font-medium">${selectedBooking.amount}</p>
                </div>
                <div>
                  <p className="text-muted text-sm">Estado</p>
                  <p className={`font-medium ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status === 'paid' ? '✓ Pagado' : '⏳ Pendiente'}
                  </p>
                </div>
                {selectedBooking.notes && (
                  <div>
                    <p className="text-muted text-sm">Notas</p>
                    <p className="font-medium">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full mt-6 bg-accent hover:bg-accent/80 py-3 rounded-lg transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
