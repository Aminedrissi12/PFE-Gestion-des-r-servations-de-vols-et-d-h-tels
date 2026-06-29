'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Plane, Users, Loader2, Plus, Calendar, Clock, DollarSign, Search, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/context/LanguageContext';

const flightStatusLabels: Record<string, Record<string, string>> = {
  fr: {
    SCHEDULED: 'Programmé',
    BOARDING: 'Embarquement',
    DEPARTED: 'Parti',
    ARRIVED: 'Arrivé',
    CANCELLED: 'Annulé',
    DELAYED: 'Retardé',
  },
  en: {
    SCHEDULED: 'Scheduled',
    BOARDING: 'Boarding',
    DEPARTED: 'Departed',
    ARRIVED: 'Arrived',
    CANCELLED: 'Cancelled',
    DELAYED: 'Delayed',
  },
  ar: {
    SCHEDULED: 'مبرمج',
    BOARDING: 'صعود الطائرة',
    DEPARTED: 'غادرت',
    ARRIVED: 'وصلت',
    CANCELLED: 'ملغى',
    DELAYED: 'متأخرة',
  }
};

const paymentStatusLabels: Record<string, Record<string, string>> = {
  fr: {
    PENDING: 'Non Payé',
    PAID: 'Payé',
    REFUNDED: 'Remboursé',
    FAILED: 'Échoué',
  },
  en: {
    PENDING: 'Unpaid',
    PAID: 'Paid',
    REFUNDED: 'Refunded',
    FAILED: 'Failed',
  },
  ar: {
    PENDING: 'غير مدفوع',
    PAID: 'مدفوع',
    REFUNDED: 'مسترد',
    FAILED: 'فشل',
  }
};

export default function FlightManagerDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'flights' | 'reservations'>('flights');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { language } = useTranslation();

  const [newFlight, setNewFlight] = useState({
    flightNumber: '',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
    totalSeats: '',
    airlineId: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'FLIGHT_MANAGER')) router.push('/');
  }, [mounted, isAuthenticated, user]);

  const { data: flights, isLoading: isFlightsLoading, refetch: refetchFlights } = useQuery({
    queryKey: ['manager-flights'],
    queryFn: () => api.get('/flights/my').then(r => r.data.data),
    enabled: isAuthenticated && user?.role === 'FLIGHT_MANAGER',
  });

  const { data: airlines } = useQuery({
    queryKey: ['manager-airlines'],
    queryFn: () => api.get('/airlines/my').then(r => r.data),
    enabled: isAuthenticated && user?.role === 'FLIGHT_MANAGER',
  });

  const { data: reservations, isLoading: isReservationsLoading, refetch: refetchReservations } = useQuery({
    queryKey: ['manager-reservations'],
    queryFn: () => api.get('/reservations/all?type=flight&limit=50').then(r => r.data.data),
    enabled: isAuthenticated && user?.role === 'FLIGHT_MANAGER',
  });

  // Pre-select airline if manager has only one airline assigned
  useEffect(() => {
    if (airlines && airlines.length === 1 && !newFlight.airlineId) {
      setNewFlight(prev => ({ ...prev, airlineId: airlines[0].id }));
    }
  }, [airlines]);

  const handleStatusChange = async (flightId: string, newStatus: string) => {
    setUpdatingId(flightId);
    try {
      await api.put(`/flights/${flightId}`, { status: newStatus });
      toast.success(
        language === 'ar'
          ? 'تم تحديث حالة الرحلة بنجاح!'
          : language === 'en'
          ? 'Flight status updated successfully!'
          : 'Statut du vol mis à jour avec succès !'
      );
      refetchFlights();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update flight status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmPayment = async (resId: string) => {
    setUpdatingPaymentId(resId);
    try {
      await api.patch(`/reservations/flight/${resId}/payment`, { paymentStatus: 'PAID' });
      toast.success(
        language === 'ar'
          ? 'تم تأكيد الدفع بنجاح! 💰'
          : language === 'en'
          ? 'Payment confirmed successfully! 💰'
          : 'Paiement enregistré avec succès ! 💰'
      );
      refetchReservations();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update payment status');
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const handleCancelReservation = async (resId: string) => {
    if (!window.confirm(
      language === 'ar'
        ? 'هل أنت متأكد من إلغاء هذا الحجز؟'
        : language === 'en'
        ? 'Are you sure you want to cancel this reservation?'
        : 'Êtes-vous sûr de vouloir annuler cette réservation ?'
    )) return;

    setCancellingId(resId);
    try {
      await api.delete(`/reservations/flight/${resId}`);
      toast.success(
        language === 'ar'
          ? 'تم إلغاء الحجز بنجاح! 🗑️'
          : language === 'en'
          ? 'Reservation cancelled successfully! 🗑️'
          : 'Réservation annulée avec succès ! 🗑️'
      );
      refetchReservations();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  const handleAddFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlight.flightNumber || !newFlight.origin || !newFlight.destination || !newFlight.departureTime || !newFlight.arrivalTime || !newFlight.price || !newFlight.totalSeats || !newFlight.airlineId) {
      toast.error(
        language === 'ar'
          ? 'يرجى ملء جميع الحقول المطلوبة'
          : language === 'en'
          ? 'Please fill in all required fields'
          : 'Veuillez remplir tous les champs obligatoires'
      );
      return;
    }

    try {
      await api.post('/flights', {
        ...newFlight,
        price: parseFloat(newFlight.price),
        totalSeats: parseInt(newFlight.totalSeats),
      });
      toast.success(
        language === 'ar'
          ? 'تمت إضافة الرحلة بنجاح!'
          : language === 'en'
          ? 'Flight added successfully!'
          : 'Vol ajouté avec succès !'
      );
      setNewFlight({
        flightNumber: '',
        origin: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        price: '',
        totalSeats: '',
        airlineId: airlines && airlines.length === 1 ? airlines[0].id : '',
      });
      setShowAddForm(false);
      refetchFlights();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add flight');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      language === 'ar' ? 'ar-EG' : language === 'en' ? 'en-US' : 'fr-FR',
      { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    );
  };

  const filteredFlights = flights?.filter((f: any) => {
    const search = searchTerm.toLowerCase();
    return f.flightNumber.toLowerCase().includes(search) ||
           f.origin.toLowerCase().includes(search) ||
           f.destination.toLowerCase().includes(search);
  }) || [];

  const filteredReservations = reservations?.filter((res: any) => {
    const search = searchTerm.toLowerCase();
    const fullName = `${res.user?.firstName || ''} ${res.user?.lastName || ''}`.toLowerCase();
    const email = (res.user?.email || '').toLowerCase();
    const flightNum = (res.flight?.flightNumber || '').toLowerCase();
    return fullName.includes(search) || email.includes(search) || flightNum.includes(search);
  }) || [];

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
      <div className="flex-1 pt-20 max-w-7xl w-full mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {language === 'ar' ? 'لوحة تحكم مدير الرحلات' : language === 'en' ? 'Flight Manager Dashboard' : 'Tableau de Bord du Gestionnaire de Vols'}
            </h1>
            <p className="text-slate-400">
              {language === 'ar' ? `مرحباً بعودتك، ${user?.firstName}.` : language === 'en' ? `Welcome back, ${user?.firstName}.` : `Ravi de vous revoir, ${user?.firstName}.`}
            </p>
          </div>
          {activeTab === 'flights' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              {language === 'ar' ? 'إضافة رحلة' : language === 'en' ? 'Add Flight' : 'Ajouter un Vol'}
            </button>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex gap-6 border-b border-white/10 mb-8">
          <button
            onClick={() => { setActiveTab('flights'); setSearchTerm(''); }}
            className={`pb-4 px-2 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'flights' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Plane className="w-4 h-4" />
              {language === 'ar' ? 'رحلاتي' : language === 'en' ? 'My Flights' : 'Mes Vols'}
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('reservations'); setSearchTerm(''); }}
            className={`pb-4 px-2 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'reservations' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {language === 'ar' ? 'حجوزات المسافرين' : language === 'en' ? 'Passenger Bookings' : 'Réservations passagers'}
            </span>
          </button>
        </div>

        {/* Add Flight Inline Modal Form */}
        {showAddForm && activeTab === 'flights' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fade-in">
            <div className="glass-dark border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-white mb-4">
                {language === 'ar' ? 'إضافة رحلة جديدة' : language === 'en' ? 'Add New Flight' : 'Ajouter un Vol'}
              </h3>
              <form onSubmit={handleAddFlight} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">N° Vol</label>
                    <input
                      type="text"
                      placeholder="ex: AH1006"
                      value={newFlight.flightNumber}
                      onChange={e => setNewFlight({ ...newFlight, flightNumber: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Compagnie</label>
                    <select
                      value={newFlight.airlineId}
                      onChange={e => setNewFlight({ ...newFlight, airlineId: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="" className="text-slate-900 bg-white">Choisir...</option>
                      {airlines?.map((a: any) => (
                        <option key={a.id} value={a.id} className="text-slate-900 bg-white">{a.name} ({a.iataCode})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Origine</label>
                    <input
                      type="text"
                      placeholder="ex: Algiers (ALG)"
                      value={newFlight.origin}
                      onChange={e => setNewFlight({ ...newFlight, origin: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Destination</label>
                    <input
                      type="text"
                      placeholder="ex: Paris (CDG)"
                      value={newFlight.destination}
                      onChange={e => setNewFlight({ ...newFlight, destination: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Date/Heure Départ</label>
                    <input
                      type="datetime-local"
                      value={newFlight.departureTime}
                      onChange={e => setNewFlight({ ...newFlight, departureTime: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Date/Heure Arrivée</label>
                    <input
                      type="datetime-local"
                      value={newFlight.arrivalTime}
                      onChange={e => setNewFlight({ ...newFlight, arrivalTime: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Tarif ($)</label>
                    <input
                      type="number"
                      placeholder="ex: 240"
                      value={newFlight.price}
                      onChange={e => setNewFlight({ ...newFlight, price: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Total Sièges</label>
                    <input
                      type="number"
                      placeholder="ex: 150"
                      value={newFlight.totalSeats}
                      onChange={e => setNewFlight({ ...newFlight, totalSeats: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 glass border border-white/10 text-white py-2 rounded-xl text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-sm font-medium"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search Filter Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'flights'
                ? (language === 'ar' ? 'البحث عن رحلة...' : 'Rechercher par vol, origine, destination...')
                : (language === 'ar' ? 'البحث عن مسافر...' : 'Rechercher par nom, e-mail, vol...')
            }
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        </div>

        {/* Data Tabs Rendering */}
        {activeTab === 'flights' ? (
          /* flights list tab */
          isFlightsLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
          ) : filteredFlights.length === 0 ? (
            <div className="glass border border-white/10 rounded-3xl p-12 text-center">
              <Plane className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-white mb-2">Aucun vol trouvé</h2>
              <p className="text-slate-400">Aucun vol n'est programmé pour votre compagnie pour le moment.</p>
            </div>
          ) : (
            <div className="glass border border-white/10 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase text-xs">
                      <th className="px-6 py-4">Vol</th>
                      <th className="px-6 py-4">Itinéraire</th>
                      <th className="px-6 py-4">Départ / Arrivée</th>
                      <th className="px-6 py-4">Tarif</th>
                      <th className="px-6 py-4">Sièges</th>
                      <th className="px-6 py-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFlights.map((f: any) => (
                      <tr key={f.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-white">{f.flightNumber}</p>
                          <p className="text-xs text-slate-400">{f.airline?.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{f.origin} → {f.destination}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            <span>{formatDate(f.departureTime)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 pl-5">
                            <span>{formatDate(f.arrivalTime)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-400">${Number(f.price).toFixed(0)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <span>{f.availableSeats} libres</span>
                            <span className="text-slate-500">/ {f.totalSeats}</span>
                          </div>
                          <div className="w-24 bg-white/10 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${((f.totalSeats - f.availableSeats) / f.totalSeats) * 100}%` }} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {updatingId === f.id ? (
                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                          ) : (
                            <select
                              value={f.status}
                              onChange={e => handleStatusChange(f.id, e.target.value)}
                              className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                            >
                              {Object.keys(flightStatusLabels[language]).map(st => (
                                <option key={st} value={st} className="text-slate-900 bg-white">
                                  {flightStatusLabels[language][st]}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* reservations list tab */
          isReservationsLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
          ) : filteredReservations.length === 0 ? (
            <div className="glass border border-white/10 rounded-3xl p-12 text-center">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-white mb-2">Aucune réservation</h2>
              <p className="text-slate-400">Aucun passager n'a réservé de vols sur votre compagnie aérienne pour l'instant.</p>
            </div>
          ) : (
            <div className="glass border border-white/10 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase text-xs">
                      <th className="px-6 py-4">Passager</th>
                      <th className="px-6 py-4">Vol</th>
                      <th className="px-6 py-4">Départ</th>
                      <th className="px-6 py-4">Sièges selectionnés</th>
                      <th className="px-6 py-4">Paiement</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.map((res: any) => (
                      <tr key={res.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-white">{res.user?.firstName} {res.user?.lastName}</p>
                          <p className="text-xs text-slate-400">{res.user?.email}</p>
                          {res.user?.phone && <p className="text-xs text-slate-500 mt-0.5">{res.user.phone}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-white">{res.flight?.flightNumber}</p>
                          <p className="text-xs text-slate-400">{res.flight?.origin} → {res.flight?.destination}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-300 text-xs">
                          {formatDate(res.flight?.departureTime)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-medium text-xs">
                            {JSON.parse(res.seats || '[]').join(', ') || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-bold">${Number(res.totalPrice).toFixed(0)}</p>
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium ${
                            res.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {paymentStatusLabels[language]?.[res.paymentStatus] || res.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                            res.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' : res.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {res.status === 'CONFIRMED' ? 'Confirmé' : res.status === 'CANCELLED' ? 'Annulé' : 'En attente'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2 items-center justify-center">
                            {res.paymentStatus !== 'PAID' && res.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleConfirmPayment(res.id)}
                                disabled={updatingPaymentId === res.id}
                                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 w-full justify-center"
                              >
                                {updatingPaymentId === res.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : null}
                                {language === 'ar' ? 'تأكيد الدفع' : language === 'en' ? 'Confirm Payment' : 'Confirmer Paiement'}
                              </button>
                            )}
                            {res.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleCancelReservation(res.id)}
                                disabled={cancellingId === res.id}
                                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 w-full justify-center"
                              >
                                {cancellingId === res.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : null}
                                {language === 'ar' ? 'إلغاء الحجز' : language === 'en' ? 'Cancel Booking' : 'Annuler'}
                              </button>
                            )}
                            {res.status === 'CANCELLED' && (
                              <span className="text-xs text-slate-500 italic">
                                {language === 'ar' ? 'ملغى' : language === 'en' ? 'Cancelled' : 'Aucune action (Annulé)'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
