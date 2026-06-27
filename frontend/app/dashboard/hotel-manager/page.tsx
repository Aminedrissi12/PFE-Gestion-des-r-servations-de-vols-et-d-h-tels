'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Hotel, DoorOpen, Users, Loader2 } from 'lucide-react';

const roomTypes: Record<string, string> = {
  SINGLE: 'Simple',
  DOUBLE: 'Double',
  SUITE: 'Suite',
  FAMILY: 'Familiale',
  DELUXE: 'Deluxe',
};

export default function HotelManagerDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'HOTEL_MANAGER')) router.push('/');
  }, [mounted, isAuthenticated, user]);

  const { data: hotels, isLoading } = useQuery({
    queryKey: ['my-hotels'],
    queryFn: () => api.get('/hotels/my-hotels').then(r => r.data),
    enabled: isAuthenticated && user?.role === 'HOTEL_MANAGER',
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tableau de Bord du Gestionnaire d'Hôtels</h1>
        <p className="text-slate-400 mb-8">Ravi de vous revoir, {user?.firstName}. Voici un aperçu de vos établissements.</p>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>
        ) : hotels?.length === 0 ? (
          <div className="glass border border-white/10 rounded-2xl p-12 text-center">
            <Hotel className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-white mb-2">Aucun établissement pour le moment</h2>
            <p className="text-slate-400">Aucun hôtel ne vous a encore été attribué. Contactez l'administrateur.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {hotels?.map((hotel: any) => (
              <div key={hotel.id} className="glass border border-emerald-500/20 rounded-3xl overflow-hidden">
                {hotel.imageUrl && (
                  <div className="h-48 w-full overflow-hidden">
                    <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{hotel.name}</h2>
                      <p className="text-slate-400 text-sm">{hotel.city} • {'★'.repeat(hotel.stars)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-emerald-400 mb-1">
                        <DoorOpen className="w-4 h-4" />
                        <span className="font-semibold text-sm">Chambres</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{hotel.rooms.length}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-blue-400 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold text-sm">Réservations</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{hotel._count?.reservations || 0}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-white text-sm">Chambres</h3>
                    {hotel.rooms.slice(0, 3).map((room: any) => (
                      <div key={room.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                        <div>
                          <p className="font-medium text-white text-sm">Chambre {room.roomNumber}</p>
                          <p className="text-xs text-slate-400">{roomTypes[room.type] || room.type} • Cap. : {room.capacity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-400 text-sm">{Number(room.pricePerNight).toFixed(0)} $ / nuit</p>
                          <p className="text-xs text-slate-400">{room.isAvailable ? 'Disponible' : 'Réservée'}</p>
                        </div>
                      </div>
                    ))}
                    {hotel.rooms.length > 3 && (
                      <p className="text-center text-xs text-slate-500 pt-2">+ {hotel.rooms.length - 3} autres chambres</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
