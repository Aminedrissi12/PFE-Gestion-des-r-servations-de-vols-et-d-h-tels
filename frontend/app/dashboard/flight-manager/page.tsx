'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Plane, Users, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Programmé',
  BOARDING: 'Embarquement',
  DEPARTED: 'Parti',
  ARRIVED: 'Arrivé',
  CANCELLED: 'Annulé',
  DELAYED: 'Retardé',
};

export default function FlightManagerDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'FLIGHT_MANAGER')) router.push('/');
  }, [mounted, isAuthenticated, user]);

  const { data: flights, isLoading } = useQuery({
    queryKey: ['manager-flights'],
    queryFn: () => api.get('/flights?limit=50').then(r => r.data.data), // Since the endpoint isn't fully manager-specific, we'll fetch general flights for now
    enabled: isAuthenticated && user?.role === 'FLIGHT_MANAGER',
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
        <h1 className="text-3xl font-bold text-white mb-2">Tableau de Bord du Gestionnaire de Vols</h1>
        <p className="text-slate-400 mb-8">Ravi de vous revoir, {user?.firstName}. Aperçu des vols actifs.</p>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
        ) : (
          <div className="glass border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-400" /> Vols récents
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-xs">
                    <th className="px-4 py-3">Vol</th>
                    <th className="px-4 py-3">Itinéraire</th>
                    <th className="px-4 py-3">Départ</th>
                    <th className="px-4 py-3">Sièges</th>
                    <th className="px-4 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {flights?.slice(0, 10).map((f: any) => (
                    <tr key={f.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-white">{f.flightNumber}</p>
                        <p className="text-xs text-slate-400">{f.airline?.name}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{f.origin} → {f.destination}</td>
                      <td className="px-4 py-3 text-slate-400">{format(new Date(f.departureTime), 'd MMM yyyy HH:mm', { locale: fr })}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-500" />
                          <span className="text-white">{f.availableSeats}</span>
                          <span className="text-slate-500">/ {f.totalSeats}</span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${((f.totalSeats - f.availableSeats) / f.totalSeats) * 100}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                          {statusLabels[f.status] || f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
