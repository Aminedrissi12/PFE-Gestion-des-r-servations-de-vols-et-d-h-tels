'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/context/LanguageContext';
import { Plane, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, fr, ar } from 'date-fns/locale';

const dateLocales: Record<string, any> = { en: enUS, fr, ar };

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-500/20 text-blue-400',
  BOARDING: 'bg-amber-500/20 text-amber-400',
  DEPARTED: 'bg-purple-500/20 text-purple-400',
  ARRIVED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
  DELAYED: 'bg-orange-500/20 text-orange-400',
};

const defaultForm = {
  flightNumber: '', origin: '', destination: '', departureTime: '',
  arrivalTime: '', price: '', totalSeats: '', airlineId: '', status: 'SCHEDULED',
};

export default function AdminFlightsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { t, language, isRtl } = useTranslation();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || !['ADMIN', 'FLIGHT_MANAGER'].includes(user?.role || ''))) router.push('/');
  }, [mounted, isAuthenticated, user]);

  const queryParams = new URLSearchParams({ origin: search, page: String(page), limit: '15' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-flights', queryParams.toString()],
    queryFn: () => api.get(`/flights?${queryParams}`).then(r => r.data),
    enabled: isAuthenticated,
  });

  const { data: airlines } = useQuery({
    queryKey: ['airlines'],
    queryFn: () => api.get('/airlines').then(r => r.data),
    enabled: isAuthenticated,
  });

  const createFlight = useMutation({
    mutationFn: (data: any) => api.post('/flights', data),
    onSuccess: () => { 
      toast.success(language === 'ar' ? 'تم إنشاء الرحلة!' : 'Vol créé'); 
      setModal(null); 
      setForm(defaultForm); 
      refetch(); 
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const updateFlight = useMutation({
    mutationFn: ({ id, data }: any) => api.put(`/flights/${id}`, data),
    onSuccess: () => { 
      toast.success(language === 'ar' ? 'تم تحديث الرحلة!' : 'Vol mis à jour'); 
      setModal(null); 
      refetch(); 
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const deleteFlight = useMutation({
    mutationFn: (id: string) => api.delete(`/flights/${id}`),
    onSuccess: () => { 
      toast.success(language === 'ar' ? 'تم حذف الرحلة!' : 'Vol supprimé'); 
      refetch(); 
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal === 'create') createFlight.mutate(form);
    else if (modal === 'edit' && editId) updateFlight.mutate({ id: editId, data: form });
  };

  const flights = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 15);

  const pageTitle = {
    fr: "Gestion des Vols",
    en: "Flight Management",
    ar: "إدارة الرحلات الجوية"
  };

  const totalLabel = {
    fr: `${total} vols dans le système`,
    en: `${total} flights in database`,
    ar: `إجمالي الرحلات: ${total}`
  };

  const addFlightLabel = {
    fr: "Ajouter un vol",
    en: "Add Flight",
    ar: "إضافة رحلة جديدة"
  };

  const searchPlaceholder = {
    fr: "Rechercher par origine...",
    en: "Search by origin...",
    ar: "البحث حسب مدينة المغادرة..."
  };

  const tableHeaders = [
    language === 'ar' ? 'الرحلة' : language === 'en' ? 'Flight' : 'Vol',
    language === 'ar' ? 'المسار' : language === 'en' ? 'Route' : 'Itinéraire',
    language === 'ar' ? 'المغادرة' : language === 'en' ? 'Departure' : 'Départ',
    language === 'ar' ? 'السعر' : language === 'en' ? 'Price' : 'Prix',
    language === 'ar' ? 'المقاعد' : language === 'en' ? 'Seats' : 'Places',
    language === 'ar' ? 'الحالة' : language === 'en' ? 'Status' : 'Statut',
    t('common.actions')
  ];

  const modalTitle = {
    create: language === 'ar' ? 'إضافة رحلة جديدة' : language === 'en' ? 'Add Flight' : 'Ajouter un vol',
    edit: language === 'ar' ? 'تعديل بيانات الرحلة' : language === 'en' ? 'Edit Flight' : 'Modifier le vol'
  };

  const flightNumberLabel = {
    fr: "Numéro de vol",
    en: "Flight Number",
    ar: "رقم الرحلة"
  };

  const selectAirlineLabel = {
    fr: "Sélectionner une compagnie",
    en: "Select Airline",
    ar: "اختر شركة الطيران"
  };

  const originLabel = {
    fr: "Origine",
    en: "Origin",
    ar: "المغادرة"
  };

  const destLabel = {
    fr: "Destination",
    en: "Destination",
    ar: "الوجهة"
  };

  const departureLabel = {
    fr: "Départ",
    en: "Departure",
    ar: "المغادرة"
  };

  const arrivalLabel = {
    fr: "Arrivée",
    en: "Arrival",
    ar: "الوصول"
  };

  const priceLabel = {
    fr: "Prix ($)",
    en: "Price ($)",
    ar: "السعر ($)"
  };

  const seatsLabel = {
    fr: "Places",
    en: "Seats",
    ar: "المقاعد"
  };

  const statusLabelModal = {
    fr: "Statut",
    en: "Status",
    ar: "الحالة"
  };

  const createSubmitBtn = {
    create: language === 'ar' ? 'إنشاء رحلة' : language === 'en' ? 'Create Flight' : 'Créer le vol',
    edit: t('profile.saveBtn')
  };

  const deleteConfirmMsg = {
    fr: "Supprimer ce vol ?",
    en: "Delete this flight?",
    ar: "هل تريد حذف هذه الرحلة؟"
  };

  const paginationLabel = {
    fr: `Page ${page} sur ${totalPages}`,
    en: `Page ${page} of ${totalPages}`,
    ar: `صفحة ${page} من ${totalPages}`
  };

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
      <div className={`flex flex-1 pt-16 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <AdminSidebar />
        <main className="flex-1 px-8 py-8 overflow-y-auto">
          <div className={`flex items-center justify-between mb-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <h1 className={`text-3xl font-bold text-white flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Plane className="w-7 h-7 text-blue-400" /> {pageTitle[language]}
              </h1>
              <p className="text-slate-400 mt-1">{totalLabel[language]}</p>
            </div>
            <button onClick={() => { setModal('create'); setForm(defaultForm); }} id="add-flight-btn"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium">
              <Plus className="w-4 h-4" /> {addFlightLabel[language]}
            </button>
          </div>

          <div className={`glass border border-white/10 rounded-2xl p-4 mb-6 flex gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className="relative flex-1">
              <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                id="flight-search-admin" placeholder={searchPlaceholder[language]}
                className={`w-full bg-white/5 border border-white/10 rounded-xl py-2 text-white text-sm focus:outline-none ${
                  isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                }`} />
            </div>
          </div>

          <div className="glass border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b border-white/10 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  {tableHeaders.map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-xs text-slate-400 font-medium uppercase tracking-wide ${
                      isRtl ? 'text-right' : 'text-left'
                    }`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-12"><Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto" /></td></tr>
                ) : flights.map((f: any) => (
                  <tr key={f.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-white">{f.flightNumber}</p>
                      <p className="text-xs text-slate-400">{f.airline.name}</p>
                    </td>
                    <td className={`px-4 py-3 text-slate-300 ${isRtl ? 'text-right' : 'text-left'}`}>
                      {isRtl ? `${f.destination} ← ${f.origin}` : `${f.origin} → ${f.destination}`}
                    </td>
                    <td className={`px-4 py-3 text-xs text-slate-400 ${isRtl ? 'text-right' : 'text-left'}`}>
                      {format(new Date(f.departureTime), 'd MMM, HH:mm', { locale: dateLocales[language] || fr })}
                    </td>
                    <td className={`px-4 py-3 font-semibold text-white ${isRtl ? 'text-right' : 'text-left'}`}>{Number(f.price).toFixed(0)} $</td>
                    <td className={`px-4 py-3 text-slate-400 ${isRtl ? 'text-right' : 'text-left'}`}>{f.availableSeats}/{f.totalSeats}</td>
                    <td className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[f.status]}`}>{t('common.status.' + f.status)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <button onClick={() => {
                          setEditId(f.id);
                          setForm({ flightNumber: f.flightNumber, origin: f.origin, destination: f.destination,
                            departureTime: f.departureTime.slice(0, 16), arrivalTime: f.arrivalTime.slice(0, 16),
                            price: String(f.price), totalSeats: String(f.totalSeats), airlineId: f.airlineId, status: f.status });
                          setModal('edit');
                        }} id={`edit-flight-${f.id}`} className="w-7 h-7 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-blue-400">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {user?.role === 'ADMIN' && (
                          <button onClick={() => { if (confirm(deleteConfirmMsg[language])) deleteFlight.mutate(f.id); }}
                            id={`delete-flight-${f.id}`} className="w-7 h-7 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-red-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={`flex items-center justify-center gap-2 mt-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="glass border border-white/10 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 disabled:opacity-40">
                <ChevronLeft className={`w-4 h-4 text-white ${isRtl ? 'rotate-180' : ''}`} />
              </button>
              <span className="text-sm text-slate-400">{paginationLabel[language]}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="glass border border-white/10 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 disabled:opacity-40">
                <ChevronRight className={`w-4 h-4 text-white ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="glass-dark border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className={`flex items-center justify-between mb-5 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-lg font-bold text-white">{modalTitle[modal]}</h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormInput label={flightNumberLabel[language]} value={form.flightNumber} onChange={v => setForm({ ...form, flightNumber: v })} id="modal-flight-number" isRtl={isRtl} />
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="text-xs text-slate-400 block mb-1">{t('flights.filters.airline')}</label>
                  <select value={form.airlineId} onChange={e => setForm({ ...form, airlineId: e.target.value })} id="modal-airline"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none bg-slate-900">
                    <option value="" className="bg-slate-850">{selectAirlineLabel[language]}</option>
                    {airlines?.map((a: any) => <option key={a.id} value={a.id} className="bg-slate-850">{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormInput label={originLabel[language]} value={form.origin} onChange={v => setForm({ ...form, origin: v })} id="modal-origin" placeholder="Ville (CODE)" isRtl={isRtl} />
                <FormInput label={destLabel[language]} value={form.destination} onChange={v => setForm({ ...form, destination: v })} id="modal-destination" placeholder="Ville (CODE)" isRtl={isRtl} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormInput label={departureLabel[language]} value={form.departureTime} onChange={v => setForm({ ...form, departureTime: v })} id="modal-departure" type="datetime-local" isRtl={isRtl} />
                <FormInput label={arrivalLabel[language]} value={form.arrivalTime} onChange={v => setForm({ ...form, arrivalTime: v })} id="modal-arrival" type="datetime-local" isRtl={isRtl} />
              </div>
              <div className={`grid grid-cols-3 gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <FormInput label={priceLabel[language]} value={form.price} onChange={v => setForm({ ...form, price: v })} id="modal-price" type="number" isRtl={isRtl} />
                <FormInput label={seatsLabel[language]} value={form.totalSeats} onChange={v => setForm({ ...form, totalSeats: v })} id="modal-seats" type="number" isRtl={isRtl} />
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="text-xs text-slate-400 block mb-1">{statusLabelModal[language]}</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} id="modal-status"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none bg-slate-900">
                    {['SCHEDULED', 'BOARDING', 'DEPARTED', 'ARRIVED', 'CANCELLED', 'DELAYED'].map(s => (
                      <option key={s} value={s} className="bg-slate-850">{t('common.status.' + s)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={`flex gap-2 pt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button type="button" onClick={() => setModal(null)} className="flex-1 glass border border-white/10 text-white py-2.5 rounded-xl text-sm">{t('common.cancel')}</button>
                <button type="submit" id="modal-flight-submit" disabled={createFlight.isPending || updateFlight.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                  {(createFlight.isPending || updateFlight.isPending) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {createSubmitBtn[modal]}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormInput({ label, value, onChange, id, type = 'text', placeholder, isRtl }: {
  label: string; value: string; onChange: (v: string) => void; id: string; type?: string; placeholder?: string; isRtl?: boolean;
}) {
  return (
    <div className={isRtl ? 'text-right' : 'text-left'}>
      <label className="text-xs text-slate-400 block mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} id={id} placeholder={placeholder}
        className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
          isRtl ? 'text-right' : 'text-left'
        }`} />
    </div>
  );
}
