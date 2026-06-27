'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plane, Plus, Edit2, Trash2, Search, Loader2, X } from 'lucide-react';

const defaultForm = { name: '', country: '', iataCode: '', logoUrl: '' };

export default function AdminAirlinesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'ADMIN')) router.push('/');
  }, [mounted, isAuthenticated, user]);

  const { data: airlines, isLoading, refetch } = useQuery({
    queryKey: ['admin-airlines'],
    queryFn: () => api.get('/airlines').then(r => r.data),
    enabled: isAuthenticated && user?.role === 'ADMIN',
  });

  const createAirline = useMutation({
    mutationFn: (data: any) => api.post('/airlines', data),
    onSuccess: () => { toast.success('Compagnie aérienne créée'); setModal(null); setForm(defaultForm); refetch(); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Échec'),
  });

  const updateAirline = useMutation({
    mutationFn: ({ id, data }: any) => api.put(`/airlines/${id}`, data),
    onSuccess: () => { toast.success('Compagnie aérienne mise à jour'); setModal(null); refetch(); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Échec'),
  });

  const deleteAirline = useMutation({
    mutationFn: (id: string) => api.delete(`/airlines/${id}`),
    onSuccess: () => { toast.success('Compagnie aérienne supprimée'); refetch(); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Échec'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal === 'create') createAirline.mutate(form);
    else if (modal === 'edit' && editId) updateAirline.mutate({ id: editId, data: form });
  };

  const filteredAirlines = airlines?.filter((a: any) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.iataCode.toLowerCase().includes(search.toLowerCase())
  ) || [];

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
        <main className="flex-1 px-8 py-8 overflow-y-auto flex justify-center">
          <div className="w-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  <Plane className="w-7 h-7 text-blue-400" /> Gestion des Compagnies Aériennes
                </h1>
                <p className="text-slate-400 mt-1">{airlines?.length || 0} compagnies aériennes dans le système</p>
              </div>
              <button onClick={() => { setModal('create'); setForm(defaultForm); }}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" /> Ajouter une compagnie
              </button>
            </div>

            <div className="glass border border-white/10 rounded-2xl p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher par nom ou code IATA..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAirlines.map((a: any) => (
                  <div key={a.id} className="glass border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center group hover:border-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5">
                    <div className="w-20 h-20 bg-white rounded-2xl p-3 mb-4 flex items-center justify-center shadow-lg border border-white/5 shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
                      {a.logoUrl ? (
                        <img src={a.logoUrl} alt={a.name} className="max-w-full max-h-full object-contain rounded-lg" />
                      ) : (
                        <Plane className="w-10 h-10 text-slate-300" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 leading-tight">{a.name}</h3>
                    <p className="text-sm text-slate-400 font-medium mb-3">{a.iataCode} • {a.country}</p>
                    <div className="text-xs text-slate-400 bg-white/5 px-3 py-1 rounded-full mb-5">
                      {a._count?.flights || 0} vols enregistrés
                    </div>
                    <div className="flex gap-2.5 w-full mt-auto">
                      <button onClick={() => {
                        setEditId(a.id);
                        setForm({ name: a.name, country: a.country, iataCode: a.iataCode, logoUrl: a.logoUrl || '' });
                        setModal('edit');
                      }} className="flex-1 glass text-slate-300 hover:text-white hover:bg-white/10 py-2 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" /> Modifier
                      </button>
                      <button onClick={() => { if (confirm('Supprimer cette compagnie aérienne ?')) deleteAirline.mutate(a.id); }}
                        className="flex-1 glass text-red-400 hover:bg-red-500/20 py-2 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="glass-dark border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">{modal === 'create' ? 'Ajouter une compagnie' : 'Modifier la compagnie'}</h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nom de la compagnie</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Pays</label>
                <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Code IATA</label>
                <input value={form.iataCode} onChange={e => setForm({ ...form, iataCode: e.target.value })} required maxLength={2} placeholder="ex. AH"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none uppercase" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">URL du logo</label>
                <input value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 glass border border-white/10 text-white py-2 rounded-xl text-sm">Annuler</button>
                <button type="submit" disabled={createAirline.isPending || updateAirline.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-xl text-sm font-medium flex justify-center items-center">
                  {(createAirline.isPending || updateAirline.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
