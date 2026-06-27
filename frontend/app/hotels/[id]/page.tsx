'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Hotel, Star, MapPin, Wifi, Waves, Coffee, Dumbbell, ChevronLeft,
  CheckCircle, Shield, Download, Loader2, Users, Calendar
} from 'lucide-react';

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-4 h-4" />,
  Pool: <Waves className="w-4 h-4" />,
  Gym: <Dumbbell className="w-4 h-4" />,
  Restaurant: <Coffee className="w-4 h-4" />,
  Spa: <Star className="w-4 h-4" />,
};

const roomTypeColors: Record<string, string> = {
  SINGLE: 'border-blue-500/30 bg-blue-500/5',
  DOUBLE: 'border-emerald-500/30 bg-emerald-500/5',
  SUITE: 'border-purple-500/30 bg-purple-500/5',
  FAMILY: 'border-amber-500/30 bg-amber-500/5',
  DELUXE: 'border-rose-500/30 bg-rose-500/5',
};

export default function HotelDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [booking, setBooking] = useState(false);

  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel', id],
    queryFn: () => api.get(`/hotels/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const handleBook = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user?.role !== 'CLIENT') { toast.error('Only clients can make reservations'); return; }
    if (!selectedRoom) { toast.error('Please select a room'); return; }
    if (!checkIn || !checkOut) { toast.error('Please select check-in and check-out dates'); return; }
    if (new Date(checkIn) >= new Date(checkOut)) { toast.error('Check-out must be after check-in'); return; }

    setBooking(true);
    try {
      const res = await api.post('/reservations/hotel', {
        hotelId: id, roomId: selectedRoom, checkIn, checkOut, guestCount,
      });
      toast.success('Hotel reservation created! Proceed to payment.');
      router.push(`/payment?type=hotel&id=${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;

  const selectedRoomData = hotel?.rooms?.find((r: any) => r.id === selectedRoom);
  const totalPrice = selectedRoomData && nights > 0 ? Number(selectedRoomData.pricePerNight) * nights : 0;

  if (isLoading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
    </div>
  );

  if (!hotel) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center"><Hotel className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white">Hotel not found</h2>
        <Link href="/hotels/search" className="text-emerald-400 mt-2 block hover:text-emerald-300">Back to search</Link>
      </div>
    </div>
  );

  const amenities = hotel.amenities ? JSON.parse(hotel.amenities) : [];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-4 py-8">
        <Link href="/hotels/search" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to search
        </Link>

        {hotel.imageUrl && (
          <div className="relative h-64 sm:h-80 rounded-3xl overflow-hidden mb-6">
            <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h1 className="text-3xl font-extrabold text-white mb-1">{hotel.name}</h1>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-emerald-400" />{hotel.city}</span>
                <span className="flex items-center gap-1 text-amber-400">
                  {'★'.repeat(hotel.stars)}{'☆'.repeat(5 - hotel.stars)}
                </span>
              </div>
            </div>
          </div>
        )}

        {!hotel.imageUrl && (
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-white mb-2">{hotel.name}</h1>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-emerald-400" />{hotel.city}, {hotel.address}</span>
              <span className="text-amber-400">{'★'.repeat(hotel.stars)}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {hotel.description && (
              <div className="glass border border-white/10 rounded-2xl p-5">
                <h2 className="text-lg font-bold text-white mb-3">About</h2>
                <p className="text-slate-400 text-sm leading-relaxed">{hotel.description}</p>
              </div>
            )}

            {amenities.length > 0 && (
              <div className="glass border border-white/10 rounded-2xl p-5">
                <h2 className="text-lg font-bold text-white mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-3">
                  {amenities.map((a: string) => (
                    <div key={a} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-sm text-slate-300">
                      {amenityIcons[a] || <CheckCircle className="w-4 h-4" />} {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms */}
            <div className="glass border border-white/10 rounded-2xl p-5">
              <h2 className="text-lg font-bold text-white mb-4">Available Rooms</h2>
              <div className="space-y-3">
                {hotel.rooms?.filter((r: any) => r.isAvailable).map((room: any) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(selectedRoom === room.id ? null : room.id)}
                    id={`room-${room.id}`}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      selectedRoom === room.id
                        ? 'border-emerald-500/60 bg-emerald-500/10'
                        : roomTypeColors[room.type] || 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">{room.type} Room</span>
                          <span className="text-xs text-slate-400">#{room.roomNumber}</span>
                          {selectedRoom === room.id && (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Up to {room.capacity} guests
                        </p>
                        {room.description && <p className="text-xs text-slate-500 mt-1">{room.description}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">${Number(room.pricePerNight).toFixed(0)}</p>
                        <p className="text-xs text-slate-400">per night</p>
                      </div>
                    </div>
                  </div>
                ))}
                {hotel.rooms?.filter((r: any) => r.isAvailable).length === 0 && (
                  <p className="text-center text-slate-400 py-6">No rooms available</p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Widget */}
          <div>
            <div className="glass border border-white/10 rounded-2xl p-5 sticky top-24 space-y-4">
              <h3 className="font-bold text-white">Book Your Stay</h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Check-in</label>
                <input type="date" value={checkIn} min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)} id="hotel-checkin"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Check-out</label>
                <input type="date" value={checkOut} min={checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckOut(e.target.value)} id="hotel-checkout"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Guests</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} id="guests-minus"
                    className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white hover:bg-white/10">-</button>
                  <span className="flex-1 text-center text-white font-semibold">{guestCount}</span>
                  <button onClick={() => setGuestCount(guestCount + 1)} id="guests-plus"
                    className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white hover:bg-white/10">+</button>
                </div>
              </div>

              {selectedRoomData && nights > 0 && (
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex justify-between text-sm text-slate-400 mb-1">
                    <span>${Number(selectedRoomData.pricePerNight).toFixed(0)} × {nights} nights</span>
                    <span className="text-white font-bold">${totalPrice.toFixed(0)}</span>
                  </div>
                </div>
              )}

              <button onClick={handleBook} disabled={booking || !selectedRoom} id="book-hotel-btn"
                className="w-full text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
                {booking && <Loader2 className="w-4 h-4 animate-spin" />}
                {booking ? 'Booking...' : !selectedRoom ? 'Select a Room' : 'Book Now'}
              </button>

              <div className="space-y-1.5 text-xs text-slate-400">
                <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" /> Free cancellation (24h)</p>
                <p className="flex items-center gap-1"><Shield className="w-3 h-3 text-blue-400" /> Secure payment</p>
                <p className="flex items-center gap-1"><Download className="w-3 h-3 text-purple-400" /> PDF voucher on payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
