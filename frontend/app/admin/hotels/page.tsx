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
import { useTranslation } from '@/context/LanguageContext';
import { Hotel as HotelIcon, Plus, Edit2, Trash2, Search, Loader2, X, Star, MapPin, DoorOpen } from 'lucide-react';

const defaultForm = { name: '', city: '', address: '', stars: '4', description: '', imageUrl: '', amenities: '' };

export default function AdminHotelsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { t, language, isRtl } = useTranslation();

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [mounted, setMounted] = useState(false);
  
  const [roomsModalOpen, setRoomsModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [roomForm, setRoomForm] = useState({ roomNumber: '', type: 'DOUBLE', pricePerNight: '', capacity: '2', description: '' });

  const roomTypes: Record<string, string> = {
    SINGLE: language === 'ar' ? 'فردية' : language === 'en' ? 'Single' : 'Simple',
    DOUBLE: language === 'ar' ? 'ثنائية' : language === 'en' ? 'Double' : 'Double',
    SUITE: language === 'ar' ? 'جناح' : language === 'en' ? 'Suite' : 'Suite',
    FAMILY: language === 'ar' ? 'عائلية' : language === 'en' ? 'Family' : 'Familiale',
    DELUXE: language === 'ar' ? 'فاخرة' : language === 'en' ? 'Deluxe' : 'Deluxe',
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || !['ADMIN', 'HOTEL_MANAGER'].includes(user?.role || ''))) router.push('/');
  }, [mounted, isAuthenticated, user]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-hotels', search],
    queryFn: () => api.get(`/hotels?city=${search}&limit=50&all=true`).then(r => r.data),
    enabled: isAuthenticated,
  });

  const createHotel = useMutation({
    mutationFn: (data: any) => api.post('/hotels', data),
    onSuccess: () => { 
      toast.success(language === 'ar' ? 'تم إنشاء الفندق!' : 'Hôtel créé'); 
      setModal(null); 
      setForm(defaultForm); 
      refetch(); 
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const updateHotel = useMutation({
    mutationFn: ({ id, data }: any) => api.put(`/hotels/${id}`, data),
    onSuccess: () => { 
      toast.success(language === 'ar' ? 'تم تحديث الفندق!' : 'Hôtel mis à jour'); 
      setModal(null); 
      refetch(); 
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const deleteHotel = useMutation({
    mutationFn: (id: string) => api.delete(`/hotels/${id}`),
    onSuccess: () => { 
      toast.success(language === 'ar' ? 'تم حذف الفندق!' : 'Hôtel supprimé'); 
      refetch(); 
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const { data: rooms, isLoading: isLoadingRooms, refetch: refetchRooms } = useQuery({
    queryKey: ['admin-hotel-rooms', selectedHotel?.id],
    queryFn: () => api.get(`/rooms/hotel/${selectedHotel.id}`).then(r => r.data),
    enabled: !!selectedHotel,
  });

  const addRoomMutation = useMutation({
    mutationFn: (newRoom: any) => api.post('/rooms', { ...newRoom, hotelId: selectedHotel?.id }),
    onSuccess: () => {
      const roomSuccess = language === 'ar' ? 'تمت إضافة الغرفة بنجاح!' : 'Chambre ajoutée avec succès !';
      toast.success(roomSuccess);
      setRoomForm({ roomNumber: '', type: 'DOUBLE', pricePerNight: '', capacity: '2', description: '' });
      refetchRooms();
      refetch();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (roomId: string) => api.delete(`/rooms/${roomId}`),
    onSuccess: () => {
      const deleteSuccess = language === 'ar' ? 'تم حذف الغرفة!' : 'Chambre supprimée avec succès !';
      toast.success(deleteSuccess);
      refetchRooms();
      refetch();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const openRoomsModal = (h: any) => {
    setSelectedHotel(h);
    setRoomsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      stars: parseInt(form.stars),
      amenities: form.amenities ? form.amenities.split(',').map(s => s.trim()) : [],
    };
    if (modal === 'create') createHotel.mutate(payload);
    else if (modal === 'edit' && editId) updateHotel.mutate({ id: editId, data: payload });
  };

  const hotels = data?.data || [];

  const pageTitle = {
    fr: "Gestion des Hôtels",
    en: "Hotel Management",
    ar: "إدارة الفنادق"
  };

  const totalLabel = {
    fr: `${hotels.length} hôtels`,
    en: `${hotels.length} hotels in database`,
    ar: `إجمالي الفنادق: ${hotels.length}`
  };

  const addHotelLabel = {
    fr: "Ajouter un hôtel",
    en: "Add Hotel",
    ar: "إضافة فندق جديد"
  };

  const searchPlaceholder = {
    fr: "Rechercher par ville...",
    en: "Search by city...",
    ar: "البحث حسب المدينة..."
  };

  const manageRoomsTooltip = {
    fr: "Gérer les chambres",
    en: "Manage Rooms",
    ar: "إدارة الغرف"
  };

  const roomsLabel = {
    fr: "chambres",
    en: "rooms",
    ar: "غرف"
  };

  const modalTitle = {
    create: language === 'ar' ? 'إضافة فندق جديد' : language === 'en' ? 'Add Hotel' : 'Ajouter un hôtel',
    edit: language === 'ar' ? 'تعديل بيانات الفندق' : language === 'en' ? 'Edit Hotel' : "Modifier l'hôtel"
  };

  const hotelNameLabel = {
    fr: "Nom de l'hôtel",
    en: "Hotel Name",
    ar: "اسم الفندق"
  };

  const addressLabel = {
    fr: "Adresse",
    en: "Address",
    ar: "العنوان"
  };

  const imageUrlLabel = {
    fr: "URL de l'image",
    en: "Image URL",
    ar: "رابط الصورة"
  };

  const amenitiesLabel = {
    fr: "Équipements (séparés par des virgules)",
    en: "Amenities (separated by commas)",
    ar: "الخدمات (مفصولة بفاصلة)"
  };

  const createSubmitBtn = {
    create: language === 'ar' ? 'إنشاء فندق' : language === 'en' ? 'Create Hotel' : "Créer l'hôtel",
    edit: t('profile.saveBtn')
  };

  const currentRoomsLabel = {
    fr: "Chambres actuelles",
    en: "Current Rooms",
    ar: "الغرف الحالية"
  };

  const emptyRoomsLabel = {
    fr: "Aucune chambre dans cet hôtel pour le moment.",
    en: "No rooms in this hotel yet.",
    ar: "لا توجد غرف في هذا الفندق حالياً."
  };

  const roomNumberLabel = {
    fr: "Numéro de chambre",
    en: "Room Number",
    ar: "رقم الغرفة"
  };

  const roomPriceLabel = {
    fr: "Prix par nuit ($)",
    en: "Price per night ($)",
    ar: "السعر للليلة ($)"
  };

  const roomTypeLabel = {
    fr: "Type de chambre",
    en: "Room Type",
    ar: "نوع الغرفة"
  };

  const roomCapacityLabel = {
    fr: "Capacité (personnes)",
    en: "Capacity (guests)",
    ar: "السعة (أشخاص)"
  };

  const roomDescLabel = {
    fr: "Description (facultatif)",
    en: "Description (optional)",
    ar: "الوصف (اختياري)"
  };

  const addRoomBtnLabel = {
    fr: "Ajouter la chambre",
    en: "Add Room",
    ar: "إضافة الغرفة"
  };

  const deleteHotelMsg = {
    fr: "Supprimer cet hôtel ?",
    en: "Delete this hotel?",
    ar: "هل تريد حذف هذا الفندق؟"
  };

  const deleteRoomMsg = (nr: string) => {
    return language === 'ar'
      ? `هل تريد حذف الغرفة ${nr}؟`
      : language === 'en'
      ? `Delete room ${nr}?`
      : `Supprimer la chambre ${nr} ?`;
  };

  const fillRoomMsg = {
    fr: "Veuillez renseigner le numéro de chambre et le prix",
    en: "Please enter room number and price",
    ar: "يرجى إدخال رقم الغرفة والسعر"
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className={`flex flex-1 pt-16 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <AdminSidebar />
        <main className="flex-1 px-8 py-8 overflow-y-auto flex justify-center">
          <div className="w-full">
            <div className={`flex items-center justify-between mb-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <h1 className={`text-3xl font-bold text-white flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <HotelIcon className="w-7 h-7 text-emerald-400" /> {pageTitle[language]}
                </h1>
                <p className="text-slate-400 mt-1">{totalLabel[language]}</p>
              </div>
              <button onClick={() => { setModal('create'); setForm(defaultForm); }} id="add-hotel-btn"
                className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
                <Plus className="w-4 h-4" /> {addHotelLabel[language]}
              </button>
            </div>

            <div className={`glass border border-white/10 rounded-2xl p-4 mb-6 flex gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="relative flex-1">
                <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  id="hotel-search-admin" placeholder={searchPlaceholder[language]}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-2 text-white text-sm focus:outline-none ${
                    isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                  }`} />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                {hotels.map((h: any) => (
                  <div key={h.id} className="glass border border-white/10 rounded-2xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5 flex flex-col">
                    {h.imageUrl && (
                      <div className="h-48 overflow-hidden relative shrink-0">
                        <img src={h.imageUrl} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60"></div>
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <div className={`flex items-start justify-between gap-2 mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <h3 className={`font-bold text-white text-lg leading-tight break-words min-w-0 flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>{h.name}</h3>
                          <div className={`flex items-center gap-1.5 shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <button onClick={() => openRoomsModal(h)}
                              id={`manage-rooms-${h.id}`}
                              title={manageRoomsTooltip[language]}
                              className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors">
                              <DoorOpen className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => {
                              setEditId(h.id);
                              const amen = h.amenities ? JSON.parse(h.amenities).join(', ') : '';
                              setForm({ name: h.name, city: h.city, address: h.address, stars: String(h.stars), description: h.description || '', imageUrl: h.imageUrl || '', amenities: amen });
                              setModal('edit');
                            }} id={`edit-hotel-${h.id}`} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-blue-400 transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {user?.role === 'ADMIN' && (
                              <button onClick={() => { if (confirm(deleteHotelMsg[language])) deleteHotel.mutate(h.id); }}
                                id={`delete-hotel-${h.id}`} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className={`text-slate-400 text-sm flex items-center gap-1.5 mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {h.city}
                        </p>
                      </div>
                      <div className={`flex items-center justify-between border-t border-white/5 pt-3 mt-auto ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-0.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < h.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
                          {h.rooms?.length || 0} {roomsLabel[language]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Hotel Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="glass-dark border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className={`flex items-center justify-between mb-5 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-lg font-bold text-white">{modalTitle[modal]}</h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 text-left">
                  <label className={`text-xs text-slate-400 block mb-1 ${isRtl ? 'text-right' : 'text-left'}`}>{hotelNameLabel[language]}</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} id="modal-hotel-name"
                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none ${isRtl ? 'text-right' : 'text-left'}`} />
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="text-xs text-slate-400 block mb-1">{t('home.searchForm.city')}</label>
                  <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} id="modal-hotel-city"
                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none ${isRtl ? 'text-right' : 'text-left'}`} />
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="text-xs text-slate-400 block mb-1">{t('hotels.filters.stars')}</label>
                  <select value={form.stars} onChange={e => setForm({ ...form, stars: e.target.value })} id="modal-hotel-stars"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none bg-slate-900">
                    {[5, 4, 3, 2, 1].map(s => <option key={s} value={s} className="bg-slate-850">{'★'.repeat(s)}</option>)}
                  </select>
                </div>
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs text-slate-400 block mb-1">{addressLabel[language]}</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} id="modal-hotel-address"
                  className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none ${isRtl ? 'text-right' : 'text-left'}`} />
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs text-slate-400 block mb-1">{imageUrlLabel[language]}</label>
                <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} id="modal-hotel-image"
                  placeholder="https://..." className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none ${isRtl ? 'text-right' : 'text-left'}`} />
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs text-slate-400 block mb-1">{amenitiesLabel[language]}</label>
                <input value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} id="modal-hotel-amenities"
                  placeholder="WiFi, Pool, Spa, Restaurant" className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none ${isRtl ? 'text-right' : 'text-left'}`} />
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} id="modal-hotel-desc"
                  rows={3} className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none resize-none ${isRtl ? 'text-right' : 'text-left'}`} />
              </div>
              <div className={`flex gap-2 pt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button type="button" onClick={() => setModal(null)} className="flex-1 glass border border-white/10 text-white py-2.5 rounded-xl text-sm">{t('common.cancel')}</button>
                <button type="submit" id="modal-hotel-submit" disabled={createHotel.isPending || updateHotel.isPending}
                  className="flex-1 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
                  {(createHotel.isPending || updateHotel.isPending) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {createSubmitBtn[modal]}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rooms Modal */}
      {roomsModalOpen && selectedHotel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="glass-dark border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col gap-6">
            <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <h3 className="text-xl font-bold text-white">{manageRoomsTooltip[language]}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedHotel.name}</p>
              </div>
              <button onClick={() => { setRoomsModalOpen(false); setSelectedHotel(null); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`grid md:grid-cols-2 gap-6 ${isRtl ? 'md:flex md:flex-row-reverse' : ''}`}>
              {/* Rooms List */}
              <div className="space-y-3 flex-1">
                <h4 className={`text-sm font-bold text-white uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>{currentRoomsLabel[language]}</h4>
                {isLoadingRooms ? (
                  <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /></div>
                ) : !rooms || rooms.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">{emptyRoomsLabel[language]}</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {rooms.map((room: any) => (
                      <div key={room.id} className={`bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                        <div>
                          <p className="font-semibold text-white text-sm">
                            {language === 'ar' ? `غرفة ${room.roomNumber}` : `Chambre ${room.roomNumber}`}
                          </p>
                          <p className="text-xs text-slate-400">
                            {roomTypes[room.type] || room.type} • {language === 'ar' ? `السعة: ${room.capacity}` : `Capacité : ${room.capacity}`}
                          </p>
                          <p className="text-xs font-bold text-emerald-400 mt-1">
                            {t('hotels.search.pricePerNight', { price: Number(room.pricePerNight).toFixed(0) })}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(deleteRoomMsg(room.roomNumber))) {
                              deleteRoomMutation.mutate(room.id);
                            }
                          }}
                          disabled={deleteRoomMutation.isPending}
                          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Room Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!roomForm.roomNumber || !roomForm.pricePerNight) {
                    toast.error(fillRoomMsg[language]);
                    return;
                  }
                  addRoomMutation.mutate({
                    roomNumber: roomForm.roomNumber,
                    type: roomForm.type,
                    pricePerNight: parseFloat(roomForm.pricePerNight),
                    capacity: parseInt(roomForm.capacity),
                    description: roomForm.description,
                  });
                }}
                className={`space-y-4 border-t md:border-t-0 pt-6 md:pt-0 flex-1 ${
                  isRtl ? 'md:border-r md:pr-6 border-white/10' : 'md:border-l md:pl-6 border-white/10'
                }`}
              >
                <h4 className={`text-sm font-bold text-white uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>{addRoomBtnLabel[language]}</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="text-xs text-slate-400 block mb-1">{roomNumberLabel[language]}</label>
                    <input
                      value={roomForm.roomNumber}
                      onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                      placeholder="ex. 101"
                      className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none ${isRtl ? 'text-right' : 'text-left'}`}
                    />
                  </div>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="text-xs text-slate-400 block mb-1">{roomPriceLabel[language]}</label>
                    <input
                      type="number"
                      value={roomForm.pricePerNight}
                      onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: e.target.value })}
                      placeholder="ex. 150"
                      className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none ${isRtl ? 'text-right' : 'text-left'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="text-xs text-slate-400 block mb-1">{roomTypeLabel[language]}</label>
                    <select
                      value={roomForm.type}
                      onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none bg-slate-900"
                    >
                      {['SINGLE', 'DOUBLE', 'SUITE', 'FAMILY', 'DELUXE'].map((t) => (
                        <option key={t} value={t} className="bg-slate-850">{roomTypes[t] || t}</option>
                      ))}
                    </select>
                  </div>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="text-xs text-slate-400 block mb-1">{roomCapacityLabel[language]}</label>
                    <input
                      type="number"
                      value={roomForm.capacity}
                      onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                      className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none ${isRtl ? 'text-right' : 'text-left'}`}
                    />
                  </div>
                </div>

                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="text-xs text-slate-400 block mb-1">{roomDescLabel[language]}</label>
                  <textarea
                    value={roomForm.description}
                    onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                    rows={2}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none resize-none ${isRtl ? 'text-right' : 'text-left'}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={addRoomMutation.isPending}
                  className="w-full text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
                >
                  {addRoomMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {addRoomBtnLabel[language]}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
