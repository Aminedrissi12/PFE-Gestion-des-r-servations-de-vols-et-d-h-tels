'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Hotel, DoorOpen, Users, Loader2, Calendar, Phone, Mail, CheckCircle2, UserCheck, Search, Key, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/context/LanguageContext';

const roomTypes: Record<string, string> = {
  SINGLE: 'Simple',
  DOUBLE: 'Double',
  SUITE: 'Suite',
  FAMILY: 'Familiale',
  DELUXE: 'Deluxe',
};

const statusLabels: Record<string, Record<string, string>> = {
  fr: {
    PENDING: 'En attente Check-in',
    CONFIRMED: 'Arrivé (Clé remise)',
    CANCELLED: 'Annulé',
  },
  en: {
    PENDING: 'Pending Check-in',
    CONFIRMED: 'Checked In',
    CANCELLED: 'Cancelled',
  },
  ar: {
    PENDING: 'في انتظار تسجيل الدخول',
    CONFIRMED: 'تم تسجيل الدخول (تسليم المفتاح)',
    CANCELLED: 'ملغى',
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

export default function HotelManagerDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'hotels' | 'reservations'>('hotels');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);
  const [showAddRoomFormForHotelId, setShowAddRoomFormForHotelId] = useState<string | null>(null);
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    type: 'SINGLE',
    pricePerNight: '',
    capacity: '2',
  });
  const [addingRoom, setAddingRoom] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const { language } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'HOTEL_MANAGER')) router.push('/');
  }, [mounted, isAuthenticated, user]);

  const { data: hotels, isLoading: isHotelsLoading, refetch: refetchHotels } = useQuery({
    queryKey: ['my-hotels'],
    queryFn: () => api.get('/hotels/my').then(r => r.data),
    enabled: isAuthenticated && user?.role === 'HOTEL_MANAGER',
  });

  const { data: reservations, isLoading: isReservationsLoading, refetch: refetchReservations } = useQuery({
    queryKey: ['manager-reservations'],
    queryFn: () => api.get('/reservations/all?type=hotel&limit=50').then(r => r.data.data),
    enabled: isAuthenticated && user?.role === 'HOTEL_MANAGER',
  });

  const handleCheckIn = async (resId: string) => {
    setUpdatingId(resId);
    try {
      await api.patch(`/reservations/hotel/${resId}/status`, { status: 'CONFIRMED' });
      toast.success(
        language === 'ar'
          ? 'تم تسجيل الدخول بنجاح! تم تسليم مفتاح الغرفة 🔑'
          : language === 'en'
          ? 'Checked in successfully! Room key handed over 🔑'
          : 'Enregistrement réussi ! Clé de chambre remise 🔑'
      );
      refetchReservations();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to check in guest');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkAsPaid = async (resId: string) => {
    setUpdatingPaymentId(resId);
    try {
      await api.patch(`/reservations/hotel/${resId}/payment`, { paymentStatus: 'PAID' });
      toast.success(
        language === 'ar'
          ? 'تم تسجيل الدفع بنجاح! 💰'
          : language === 'en'
          ? 'Payment marked as paid successfully! 💰'
          : 'Paiement enregistré avec succès ! 💰'
      );
      refetchReservations();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update payment status');
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const handleAddRoom = async (hotelId: string) => {
    if (!newRoom.roomNumber || !newRoom.pricePerNight) {
      toast.error(
        language === 'ar'
          ? 'يرجى ملء جميع الحقول المطلوبة'
          : language === 'en'
          ? 'Please fill in all required fields'
          : 'Veuillez remplir tous les champs obligatoires'
      );
      return;
    }
    setAddingRoom(true);
    try {
      await api.post('/rooms', {
        hotelId,
        roomNumber: newRoom.roomNumber,
        type: newRoom.type,
        pricePerNight: parseFloat(newRoom.pricePerNight),
        capacity: parseInt(newRoom.capacity),
      });
      toast.success(
        language === 'ar'
          ? 'تمت إضافة الغرفة بنجاح! 🚪'
          : language === 'en'
          ? 'Room added successfully! 🚪'
          : 'Chambre ajoutée avec succès ! 🚪'
      );
      setNewRoom({ roomNumber: '', type: 'SINGLE', pricePerNight: '', capacity: '2' });
      setShowAddRoomFormForHotelId(null);
      refetchHotels();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add room');
    } finally {
      setAddingRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm(
      language === 'ar'
        ? 'هل أنت متأكد من حذف هذه الغرفة؟'
        : language === 'en'
        ? 'Are you sure you want to delete this room?'
        : 'Êtes-vous sûr de vouloir supprimer cette chambre ?'
    )) return;
    setDeletingRoomId(roomId);
    try {
      await api.delete(`/rooms/${roomId}`);
      toast.success(
        language === 'ar'
          ? 'تم حذف الغرفة بنجاح! 🗑️'
          : language === 'en'
          ? 'Room deleted successfully! 🗑️'
          : 'Chambre supprimée avec succès ! 🗑️'
      );
      refetchHotels();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete room');
    } finally {
      setDeletingRoomId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      language === 'ar' ? 'ar-EG' : language === 'en' ? 'en-US' : 'fr-FR',
      { day: 'numeric', month: 'short', year: 'numeric' }
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  const filteredReservations = reservations?.filter((res: any) => {
    const fullName = `${res.user?.firstName || ''} ${res.user?.lastName || ''}`.toLowerCase();
    const email = (res.user?.email || '').toLowerCase();
    const roomNum = (res.room?.roomNumber || '').toString();
    const hotelName = (res.hotel?.name || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search) || roomNum.includes(search) || hotelName.includes(search);
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {language === 'ar' ? 'لوحة تحكم مدير الفندق' : language === 'en' ? 'Hotel Manager Dashboard' : "Tableau de Bord du Gestionnaire d'Hôtels"}
            </h1>
            <p className="text-slate-400">
              {language === 'ar' ? `مرحباً بعودتك، ${user?.firstName}. إليك نظرة عامة.` : language === 'en' ? `Welcome back, ${user?.firstName}. Here is your overview.` : `Ravi de vous revoir, ${user?.firstName}. Voici un aperçu de vos établissements.`}
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-6 border-b border-white/10 mb-8">
          <button
            onClick={() => setActiveTab('hotels')}
            className={`pb-4 px-2 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'hotels'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Hotel className="w-4 h-4" />
              {language === 'ar' ? 'فنادقي' : language === 'en' ? 'My Hotels' : 'Mes Hôtels'}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`pb-4 px-2 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'reservations'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {language === 'ar' ? 'الطلبات والحجوزات' : language === 'en' ? 'Guest Reservations' : 'Réservations clients'}
            </span>
          </button>
        </div>

        {activeTab === 'hotels' ? (
          /* Hotels List Tab */
          isHotelsLoading ? (
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
                        <p className="text-2xl font-bold text-white">{hotel.rooms?.length || 0}</p>
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
                      <h3 className="font-bold text-white text-sm">
                        {language === 'ar' ? 'الغرف' : language === 'en' ? 'Rooms' : 'Chambres'}
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {hotel.rooms?.map((room: any) => (
                          <div key={room.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors">
                            <div>
                              <p className="font-medium text-white text-sm">Chambre {room.roomNumber}</p>
                              <p className="text-xs text-slate-400">{roomTypes[room.type] || room.type} • Cap. : {room.capacity}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-bold text-emerald-400 text-sm">{Number(room.pricePerNight).toFixed(0)} $ / nuit</p>
                                <p className="text-xs text-slate-400">{room.isAvailable ? 'Disponible' : 'Réservée'}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                disabled={deletingRoomId === room.id}
                                className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50"
                                title={language === 'ar' ? 'حذف الغرفة' : language === 'en' ? 'Delete Room' : 'Supprimer la chambre'}
                              >
                                {deletingRoomId === room.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {showAddRoomFormForHotelId === hotel.id ? (
                        <div className="border border-white/10 rounded-2xl p-4 bg-white/5 space-y-3 mt-4 animate-fade-in">
                          <h4 className="text-xs font-bold text-white mb-2">
                            {language === 'ar' ? 'غرفة جديدة' : language === 'en' ? 'New Room' : 'Nouvelle chambre'}
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-slate-400 block mb-1">
                                {language === 'ar' ? 'رقم الغرفة' : language === 'en' ? 'Room N°' : 'N° de chambre'}
                              </label>
                              <input
                                type="text"
                                placeholder="ex: 104"
                                value={newRoom.roomNumber}
                                onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400 block mb-1">
                                {language === 'ar' ? 'السعر / ليلة ($)' : language === 'en' ? 'Price/Night ($)' : 'Prix par nuit ($)'}
                              </label>
                              <input
                                type="number"
                                placeholder="ex: 120"
                                value={newRoom.pricePerNight}
                                onChange={(e) => setNewRoom({ ...newRoom, pricePerNight: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-slate-400 block mb-1">
                                {language === 'ar' ? 'نوع الغرفة' : language === 'en' ? 'Room Type' : 'Type de chambre'}
                              </label>
                              <select
                                value={newRoom.type}
                                onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              >
                                <option value="SINGLE">Simple</option>
                                <option value="DOUBLE">Double</option>
                                <option value="SUITE">Suite</option>
                                <option value="FAMILY">Familiale</option>
                                <option value="DELUXE">Deluxe</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-slate-400 block mb-1">
                                {language === 'ar' ? 'السعة (أشخاص)' : language === 'en' ? 'Capacity (guests)' : 'Capacité (personnes)'}
                              </label>
                              <input
                                type="number"
                                value={newRoom.capacity}
                                onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              onClick={() => setShowAddRoomFormForHotelId(null)}
                              className="text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-white/10"
                            >
                              {language === 'ar' ? 'إلغاء' : language === 'en' ? 'Cancel' : 'Annuler'}
                            </button>
                            <button
                              onClick={() => handleAddRoom(hotel.id)}
                              disabled={addingRoom}
                              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center gap-1.5"
                            >
                              {addingRoom && <Loader2 className="w-3 h-3 animate-spin" />}
                              {language === 'ar' ? 'حفظ' : language === 'en' ? 'Save' : 'Enregistrer'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAddRoomFormForHotelId(hotel.id)}
                          className="w-full border border-dashed border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-slate-400 hover:text-emerald-400 transition-all rounded-xl py-3 text-xs font-semibold flex items-center justify-center gap-2 mt-4 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          {language === 'ar' ? 'إضافة غرفة' : language === 'en' ? 'Add Room' : 'Ajouter une chambre'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Reservations List Tab */
          <div>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder={
                    language === 'ar'
                      ? 'البحث باسم الضيف أو الغرفة...'
                      : language === 'en'
                      ? 'Search by guest name, room number...'
                      : 'Rechercher par client, chambre...'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            {isReservationsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>
            ) : filteredReservations?.length === 0 ? (
              <div className="glass border border-white/10 rounded-2xl p-12 text-center">
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-bold text-white mb-2">
                  {language === 'ar' ? 'لا توجد حجوزات' : language === 'en' ? 'No Reservations' : 'Aucune réservation'}
                </h2>
                <p className="text-slate-400">
                  {language === 'ar' ? 'لم يتم العثور على أي حجز يطابق معايير البحث.' : language === 'en' ? 'No reservations found matching your criteria.' : 'Aucune réservation trouvée correspondant à vos critères.'}
                </p>
              </div>
            ) : (
              <div className="glass border border-white/10 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 uppercase text-xs">
                        <th className="px-6 py-4">{language === 'ar' ? 'الضيف' : language === 'en' ? 'Guest' : 'Client'}</th>
                        <th className="px-6 py-4">{language === 'ar' ? 'الفندق والغرفة' : language === 'en' ? 'Hotel & Room' : 'Hôtel & Chambre'}</th>
                        <th className="px-6 py-4">{language === 'ar' ? 'تواريخ الإقامة' : language === 'en' ? 'Stay Dates' : 'Dates du Séjour'}</th>
                        <th className="px-6 py-4">{language === 'ar' ? 'الدفع' : language === 'en' ? 'Payment' : 'Paiement'}</th>
                        <th className="px-6 py-4">{language === 'ar' ? 'حالة الحجز' : language === 'en' ? 'Reservation Status' : 'Statut'}</th>
                        <th className="px-6 py-4 text-center">{language === 'ar' ? 'الإجراءات' : language === 'en' ? 'Actions' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservations?.map((res: any) => (
                        <tr key={res.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-white">{res.user?.firstName} {res.user?.lastName}</p>
                            <div className="flex flex-col gap-0.5 text-xs text-slate-400 mt-1">
                              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 opacity-70" /> {res.user?.email}</span>
                              {res.user?.phone && (
                                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 opacity-70" /> {res.user?.phone}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-white font-medium">{res.hotel?.name}</p>
                            <p className="text-slate-400 text-xs mt-1">
                              Chambre {res.room?.roomNumber} • <span className="text-slate-500">{roomTypes[res.room?.type] || res.room?.type}</span>
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-300">
                              <Calendar className="w-4 h-4 text-emerald-400 opacity-85" />
                              <span>{formatDate(res.checkIn)}</span>
                            </div>
                            <div className="text-slate-500 text-xs pl-6 mt-0.5">
                              {language === 'ar' ? 'إلى' : language === 'en' ? 'to' : 'au'} {formatDate(res.checkOut)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-white font-bold">${Number(res.totalPrice).toFixed(0)}</p>
                            <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full mt-1.5 font-medium ${
                              res.paymentStatus === 'PAID'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : res.paymentStatus === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {paymentStatusLabels[language]?.[res.paymentStatus] || res.paymentStatus}
                            </span>
                            {res.paymentStatus !== 'PAID' && res.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleMarkAsPaid(res.id)}
                                disabled={updatingPaymentId === res.id}
                                className="block text-emerald-400 hover:text-emerald-300 text-xs font-semibold mt-2 underline cursor-pointer focus:outline-none disabled:opacity-50 text-left"
                              >
                                {updatingPaymentId === res.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                                ) : null}
                                {language === 'ar' ? 'تسجيل الدفع' : language === 'en' ? 'Mark as Paid' : 'Enregistrer le paiement'}
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                              res.status === 'CONFIRMED'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : res.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {statusLabels[language]?.[res.status] || res.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              {res.status === 'PENDING' ? (
                                <button
                                  onClick={() => handleCheckIn(res.id)}
                                  disabled={updatingId === res.id}
                                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/10 transition-all hover:scale-105"
                                >
                                  {updatingId === res.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <UserCheck className="w-3.5 h-3.5" />
                                  )}
                                  {language === 'ar' ? 'تسجيل الدخول' : language === 'en' ? 'Check In' : "Enregistrer l'arrivée"}
                                </button>
                              ) : res.status === 'CONFIRMED' ? (
                                <div className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                                  <Key className="w-3.5 h-3.5" />
                                  <span>{language === 'ar' ? 'الكل مفعل / تم التسليم' : language === 'en' ? 'Key Handed Over' : 'Clé remise'}</span>
                                </div>
                              ) : (
                                <span className="text-slate-500 text-xs italic">{language === 'ar' ? 'ملغى' : language === 'en' ? 'Cancelled' : 'Annulé'}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
