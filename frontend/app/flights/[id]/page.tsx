'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import {
  Plane, Clock, Calendar, Users, ArrowRight, Star, MessageSquare,
  Shield, Download, CheckCircle, ChevronLeft, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function FlightDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [seats, setSeats] = useState(1);
  const [seatClass, setSeatClass] = useState('ECONOMY');
  const [booking, setBooking] = useState(false);

  const { data: flight, isLoading } = useQuery({
    queryKey: ['flight', id],
    queryFn: () => api.get(`/flights/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => api.get(`/reviews/flight/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const handleBook = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user?.role !== 'CLIENT') { toast.error('Only clients can make reservations'); return; }

    setBooking(true);
    try {
      const res = await api.post('/reservations/flight', { flightId: id, seatsBooked: seats, seatClass });
      toast.success('Reservation created! Proceed to payment.');
      router.push(`/payment?type=flight&id=${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
    </div>
  );

  if (!flight) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Plane className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white">Flight not found</h2>
        <Link href="/flights/search" className="text-blue-400 mt-2 block hover:text-blue-300">Back to search</Link>
      </div>
    </div>
  );

  const depart = new Date(flight.departureTime);
  const arrive = new Date(flight.arrivalTime);
  const durationMs = arrive.getTime() - depart.getTime();
  const hours = Math.floor(durationMs / 3600000);
  const minutes = Math.floor((durationMs % 3600000) / 60000);
  const classes = [
    { value: 'ECONOMY', label: 'Economy', mult: 1 },
    { value: 'BUSINESS', label: 'Business', mult: 2.2 },
    { value: 'FIRST', label: 'First Class', mult: 4 },
  ];
  const selectedClass = classes.find(c => c.value === seatClass)!;
  const price = Number(flight.price) * selectedClass.mult * seats;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-4 py-8">
        <Link href="/flights/search" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to search
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Header */}
            <div className="glass border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                {flight.airline.logoUrl && (
                  <img src={flight.airline.logoUrl} alt={flight.airline.name} className="w-12 h-12 object-contain rounded-xl bg-white/10 p-1" />
                )}
                <div>
                  <h1 className="text-xl font-bold text-white">{flight.airline.name}</h1>
                  <p className="text-slate-400 text-sm">Flight {flight.flightNumber}</p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                  flight.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                }`}>{flight.status}</span>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center flex-1">
                  <p className="text-4xl font-extrabold text-white">{format(depart, 'HH:mm')}</p>
                  <p className="text-blue-400 font-medium mt-1">{flight.origin}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{format(depart, 'MMM d, yyyy')}</p>
                </div>
                <div className="flex flex-col items-center gap-2 flex-1">
                  <p className="text-sm text-slate-400">{hours}h {minutes}m</p>
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600" />
                    <Plane className="w-5 h-5 text-blue-400 rotate-45" />
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600" />
                  </div>
                  <p className="text-xs text-slate-500">Direct Flight</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-4xl font-extrabold text-white">{format(arrive, 'HH:mm')}</p>
                  <p className="text-purple-400 font-medium mt-1">{flight.destination}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{format(arrive, 'MMM d, yyyy')}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/10 text-sm text-slate-400">
                <span className="flex items-center gap-1"><Users className="w-4 h-4 text-blue-400" /> {flight.availableSeats} seats available</span>
                <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-green-400" /> Secure booking</span>
                <span className="flex items-center gap-1"><Download className="w-4 h-4 text-purple-400" /> PDF ticket included</span>
              </div>
            </div>

            {/* Reviews */}
            {reviewsData && (
              <div className="glass border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-lg font-bold text-white">Passenger Reviews</h2>
                  <div className="flex items-center gap-1 ml-auto">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-amber-400 font-bold">{reviewsData.avgRating}</span>
                    <span className="text-slate-400 text-sm">({reviewsData.total})</span>
                  </div>
                </div>
                {reviewsData.reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviewsData.reviews.slice(0, 5).map((r: any) => (
                      <div key={r.id} className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {r.user.firstName[0]}{r.user.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{r.user.firstName} {r.user.lastName}</p>
                            <div className="flex gap-0.5">
                              {Array(5).fill(0).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        {r.comment && <p className="text-sm text-slate-400">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Booking Widget */}
          <div className="space-y-4">
            <div className="glass border border-white/10 rounded-2xl p-5 sticky top-24">
              <div className="mb-4">
                <p className="text-slate-400 text-sm">Price per person</p>
                <p className="text-3xl font-extrabold text-white">${Number(flight.price).toFixed(0)}</p>
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Class</label>
                  <select value={seatClass} onChange={(e) => setSeatClass(e.target.value)} id="seat-class"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
                    {classes.map(c => (
                      <option key={c.value} value={c.value} className="bg-slate-800">
                        {c.label} (×{c.mult})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Passengers</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSeats(Math.max(1, seats - 1))} id="seats-minus"
                      className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white hover:bg-white/10 transition-colors">-</button>
                    <span className="flex-1 text-center text-white font-semibold">{seats}</span>
                    <button onClick={() => setSeats(Math.min(flight.availableSeats, seats + 1))} id="seats-plus"
                      className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white hover:bg-white/10 transition-colors">+</button>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Total</span>
                  <span className="text-2xl font-extrabold text-white">${price.toFixed(0)}</span>
                </div>
              </div>

              <button
                onClick={handleBook}
                disabled={booking || flight.availableSeats === 0 || flight.status === 'CANCELLED'}
                id="book-flight-btn"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                {booking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {flight.status === 'CANCELLED' ? 'Flight Cancelled' : booking ? 'Booking...' : 'Book Now'}
              </button>

              <div className="mt-4 space-y-2 text-xs text-slate-400">
                <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" /> Free cancellation (24h)</p>
                <p className="flex items-center gap-1"><Shield className="w-3 h-3 text-blue-400" /> Secure payment</p>
                <p className="flex items-center gap-1"><Download className="w-3 h-3 text-purple-400" /> PDF ticket on payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
