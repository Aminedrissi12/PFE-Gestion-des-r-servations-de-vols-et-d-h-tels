'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Calendar,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CreditCard,
  User,
  Plane,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-green-500/20 text-green-400',
  PENDING: 'bg-amber-500/20 text-amber-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
}

const statusLabels: Record<string, string> = {
  CONFIRMED: 'Confirmé',
  PENDING: 'En attente',
  CANCELLED: 'Annulé',
}

const paymentColors: Record<string, string> = {
  PAID: 'bg-green-500/20 text-green-400',
  PENDING: 'bg-amber-500/20 text-amber-400',
  REFUNDED: 'bg-blue-500/20 text-blue-400',
  FAILED: 'bg-red-500/20 text-red-400',
}

const paymentLabels: Record<string, string> = {
  PAID: 'Payé',
  PENDING: 'En attente',
  REFUNDED: 'Remboursé',
  FAILED: 'Échoué',
}

const classLabels: Record<string, string> = {
  ECONOMY: 'Économique',
  BUSINESS: 'Affaires',
  FIRST: 'Première',
}

export default function AdminFlightBookingsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (
      mounted &&
      (!isAuthenticated ||
        !['ADMIN', 'FLIGHT_MANAGER'].includes(user?.role || ''))
    ) {
      router.push('/')
    }
  }, [mounted, isAuthenticated, user])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-flight-bookings', page],
    queryFn: () =>
      api
        .get(`/reservations/all?type=flight&page=${page}&limit=12`)
        .then((r) => r.data),
    enabled:
      isAuthenticated && ['ADMIN', 'FLIGHT_MANAGER'].includes(user?.role || ''),
  })

  const cancelBooking = useMutation({
    mutationFn: (id: string) => api.delete(`/reservations/flight/${id}`),
    onSuccess: () => {
      toast.success('Réservation annulée avec succès')
      refetch()
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.error || "Échec de l'annulation de la réservation",
      )
    },
  })

  const bookings = data?.data || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 12)

  if (!mounted) {
    return (
      <div className='min-h-screen bg-slate-950 flex items-center justify-center'>
        <Loader2 className='w-8 h-8 text-blue-400 animate-spin' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-950 flex flex-col'>
      <Navbar />
      <div className='flex flex-1 pt-16'>
        <AdminSidebar />
        <main className='flex-1 px-8 py-8 overflow-y-auto'>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-white flex items-center gap-2'>
                <Plane className='w-7 h-7 text-blue-400' /> Réservations de Vols
              </h1>
              <p className='text-slate-400 mt-1'>
                {total} réservations au total
              </p>
            </div>
          </div>

          {/* Table */}
          <div className='glass border border-white/10 rounded-2xl overflow-hidden'>
            <table className='w-full text-sm text-left'>
              <thead>
                <tr className='border-b border-white/10 text-xs text-slate-400 uppercase tracking-wider'>
                  <th className='px-4 py-3'>Client</th>
                  <th className='px-4 py-3'>Détails du vol</th>
                  <th className='px-4 py-3'>Horaires</th>
                  <th className='px-4 py-3'>Détails</th>
                  <th className='px-4 py-3'>Statut</th>
                  <th className='px-4 py-3'>Paiement</th>
                  <th className='px-4 py-3'>Montant</th>
                  <th className='px-4 py-3'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className='text-center py-12'>
                      <Loader2 className='w-8 h-8 text-blue-400 animate-spin mx-auto' />
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className='text-center py-12 text-slate-400'
                    >
                      Aucune réservation de vol trouvée
                    </td>
                  </tr>
                ) : (
                  bookings.map((b: any) => (
                    <tr
                      key={b.id}
                      className='border-b border-white/5 hover:bg-white/2 transition-colors'
                    >
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          <div className='w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold'>
                            {b.user.firstName[0]}
                            {b.user.lastName[0]}
                          </div>
                          <div>
                            <p className='font-semibold text-white'>
                              {b.user.firstName} {b.user.lastName}
                            </p>
                            <p className='text-[10px] text-slate-400'>
                              {b.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          {b.flight.airline?.logoUrl && (
                            <img
                              src={b.flight.airline.logoUrl}
                              alt={b.flight.airline.name}
                              className='w-7 h-7 object-contain rounded-md bg-white/10 p-0.5'
                            />
                          )}
                          <div>
                            <p className='font-semibold text-white'>
                              {b.flight.flightNumber}
                            </p>
                            <p className='text-xs text-slate-400'>
                              {b.flight.origin} → {b.flight.destination}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-xs text-slate-300'>
                        <div>
                          <p>
                            <span className='text-slate-500'>Départ :</span>{' '}
                            {format(
                              new Date(b.flight.departureTime),
                              'd MMM yyyy HH:mm',
                              { locale: fr },
                            )}
                          </p>
                          <p>
                            <span className='text-slate-500'>Arrivée :</span>{' '}
                            {format(
                              new Date(b.flight.arrivalTime),
                              'd MMM yyyy HH:mm',
                              { locale: fr },
                            )}
                          </p>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-xs text-slate-300'>
                        <div>
                          <p className='font-medium text-white'>
                            {b.seatsBooked} Siège{b.seatsBooked > 1 ? 's' : ''}
                          </p>
                          <p className='text-slate-400 uppercase tracking-wider text-[10px]'>
                            {classLabels[b.seatClass] || b.seatClass}
                          </p>
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[b.status] || 'bg-slate-500/20 text-slate-400'}`}
                        >
                          {statusLabels[b.status] || b.status}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex flex-col gap-1'>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold max-w-max ${paymentColors[b.paymentStatus] || 'bg-slate-500/20 text-slate-400'}`}
                          >
                            {paymentLabels[b.paymentStatus] || b.paymentStatus}
                          </span>
                          {b.payment?.transactionId && (
                            <span className='text-[10px] text-slate-400 select-all'>
                              ID: {b.payment.transactionId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-4 py-3 text-white font-bold text-sm'>
                        {Number(b.totalPrice).toFixed(0)} $
                      </td>
                      <td className='px-4 py-3'>
                        {b.status !== 'CANCELLED' ? (
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  'Êtes-vous sûr de vouloir annuler cette réservation de vol ?',
                                )
                              ) {
                                cancelBooking.mutate(b.id)
                              }
                            }}
                            disabled={cancelBooking.isPending}
                            className='w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors'
                            title='Annuler la réservation'
                          >
                            <XCircle className='w-4 h-4' />
                          </button>
                        ) : (
                          <span className='text-xs text-slate-500'>-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-2 mt-6'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className='glass border border-white/10 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 disabled:opacity-40 transition-colors'
              >
                <ChevronLeft className='w-4 h-4 text-white' />
              </button>
              <span className='text-sm text-slate-400'>
                Page {page} sur {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className='glass border border-white/10 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 disabled:opacity-40 transition-colors'
              >
                <ChevronRight className='w-4 h-4 text-white' />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
