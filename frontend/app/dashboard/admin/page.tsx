'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
  Users, Plane, Hotel, DollarSign, TrendingUp, TrendingDown, Activity,
  LayoutDashboard, Settings, Shield, ArrowUpRight, Loader2
} from 'lucide-react';
import Link from 'next/link';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrateur',
  HOTEL_MANAGER: "Gestionnaire d'Hôtel",
  FLIGHT_MANAGER: 'Gestionnaire de Vols',
  CLIENT: 'Client',
};

const statusLabels: Record<string, string> = {
  CONFIRMED: 'Confirmé',
  PENDING: 'En attente',
  CANCELLED: 'Annulé',
};

function StatCard({ title, value, subtitle, icon, color, trend }: any) {
  return (
    <div className={`glass border border-white/10 rounded-2xl p-5 relative overflow-hidden`}>
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${color}`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-20`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs flex items-center gap-0.5 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-extrabold text-white">{value}</p>
      <p className="text-sm font-medium text-white mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) { router.push('/auth/login'); return; }
    if (mounted && !['ADMIN', 'FLIGHT_MANAGER', 'HOTEL_MANAGER'].includes(user?.role || '')) {
      router.push('/');
    }
  }, [mounted, isAuthenticated, user]);

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data),
    enabled: isAuthenticated && user?.role === 'ADMIN',
    refetchInterval: 60000,
  });

  const { data: monthly } = useQuery({
    queryKey: ['dashboard-monthly'],
    queryFn: () => api.get('/dashboard/monthly').then(r => r.data),
    enabled: isAuthenticated,
  });

  const { data: hotelRevenue } = useQuery({
    queryKey: ['dashboard-hotel-revenue'],
    queryFn: () => api.get('/dashboard/revenue/hotels').then(r => r.data),
    enabled: isAuthenticated,
  });

  const { data: airlineRevenue } = useQuery({
    queryKey: ['dashboard-airline-revenue'],
    queryFn: () => api.get('/dashboard/revenue/airlines').then(r => r.data),
    enabled: isAuthenticated,
  });

  const { data: recent } = useQuery({
    queryKey: ['dashboard-recent'],
    queryFn: () => api.get('/dashboard/recent').then(r => r.data),
    enabled: isAuthenticated && user?.role === 'ADMIN',
  });

  const isAdmin = user?.role === 'ADMIN';

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <AdminSidebar />
        <main className="flex-1 px-8 py-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LayoutDashboard className="w-5 h-5 text-blue-400" />
                <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
              </div>
              <p className="text-slate-400">Ravi de vous revoir, <span className="text-white font-medium">{user?.firstName}</span> — {roleLabels[user?.role || ''] || user?.role}</p>
            </div>
          </div>

        {/* Stat Cards */}
        {isAdmin && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Utilisateurs" value={stats.totalUsers?.toLocaleString()} subtitle={`${stats.totalClients} clients`}
              icon={<Users className="w-5 h-5 text-blue-400" />} color="bg-blue-500" trend={12} />
            <StatCard title="Réservations" value={stats.totalReservations?.toLocaleString()}
              subtitle={`${stats.totalFlightReservations} vols, ${stats.totalHotelReservations} hôtels`}
              icon={<Activity className="w-5 h-5 text-emerald-400" />} color="bg-emerald-500" trend={8} />
            <StatCard title="Chiffre d'Affaires" value={`${Number(stats.totalRevenue || 0).toLocaleString()} $`}
              icon={<DollarSign className="w-5 h-5 text-amber-400" />} color="bg-amber-500" trend={15} />
            <StatCard title="Vols Actifs" value={stats.activeFlights?.toLocaleString()}
              subtitle={`${stats.totalHotels} hôtels`}
              icon={<Plane className="w-5 h-5 text-purple-400" />} color="bg-purple-500" />
          </div>
        )}

        {/* Charts Row 1 */}
        {monthly && (
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="glass border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> Réservations mensuelles
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthly}>
                  <defs>
                    <linearGradient id="flightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="hotelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="flights" stroke="#3b82f6" fill="url(#flightGrad)" strokeWidth={2} name="Vols" />
                  <Area type="monotone" dataKey="hotels" stroke="#10b981" fill="url(#hotelGrad)" strokeWidth={2} name="Hôtels" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" /> Chiffre d'Affaires Mensuel
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    formatter={(v: any) => [`${Number(v).toLocaleString()} $`, 'Revenu']} />
                  <Bar dataKey="revenue" fill="url(#revenueGrad)" radius={[6, 6, 0, 0]}>
                    {monthly.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {hotelRevenue && hotelRevenue.length > 0 && (
            <div className="glass border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Hotel className="w-4 h-4 text-emerald-400" /> Revenu par Hôtel
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={hotelRevenue.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${v.toLocaleString()} $`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    formatter={(v: any) => [`${Number(v).toLocaleString()} $`, 'Revenu']} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {airlineRevenue && airlineRevenue.length > 0 && (
            <div className="glass border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Plane className="w-4 h-4 text-blue-400" /> Revenu par Compagnie
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={airlineRevenue.slice(0, 5)} cx="50%" cy="50%" outerRadius={80} dataKey="revenue" nameKey="name"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}>
                    {airlineRevenue.slice(0, 5).map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    formatter={(v: any) => [`${Number(v).toLocaleString()} $`, 'Revenu']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {recent && isAdmin && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-4">Réservations de vols récentes</h3>
              <div className="space-y-3">
                {recent.recentFlights?.slice(0, 5).map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{r.user.firstName} {r.user.lastName}</p>
                      <p className="text-xs text-slate-400">{r.flight.flightNumber} · {r.flight.origin} → {r.flight.destination}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{Number(r.totalPrice).toFixed(0)} $</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${r.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {statusLabels[r.status] || r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-4">Utilisateurs récents</h3>
              <div className="space-y-3">
                {recent.recentUsers?.slice(0, 5).map((u: any) => (
                  <div key={u.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                    </div>
                    <span className="text-xs glass border border-white/10 px-2 py-0.5 rounded-full text-slate-300">
                      {roleLabels[u.role] || u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  </div>
  );
}
