'use client';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Plane, Hotel, Download, X, Star, ChevronRight, Calendar,
  MapPin, Users, Loader2, Search, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { generateFlightTicketPDF, generateHotelVoucherPDF } from '@/lib/generatePDF';
import { useTranslation } from '@/context/LanguageContext';

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-green-500/20 text-green-400',
  PENDING: 'bg-amber-500/20 text-amber-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

const paymentColors: Record<string, string> = {
  PAID: 'bg-green-500/20 text-green-400',
  PENDING: 'bg-amber-500/20 text-amber-400',
  REFUNDED: 'bg-blue-500/20 text-blue-400',
  FAILED: 'bg-red-500/20 text-red-400',
};

export default function ReservationsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels'>('flights');
  const [reviewModal, setReviewModal] = useState<{ flightId: string; reservationId: string } | null>(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [downloading, setDownloading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { t, language, isRtl } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/auth/login');
  }, [mounted, isAuthenticated]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: () => api.get('/reservations/my').then(r => r.data),
    enabled: isAuthenticated,
  });

  const cancelFlight = useMutation({
    mutationFn: (id: string) => api.delete(`/reservations/flight/${id}`),
    onSuccess: () => { 
      toast.success(t('reservations.cancellation.success')); 
      refetch(); 
    },
    onError: (err: any) => toast.error(err.response?.data?.error || t('reservations.cancellation.error')),
  });

  const cancelHotel = useMutation({
    mutationFn: (id: string) => api.delete(`/reservations/hotel/${id}`),
    onSuccess: () => { 
      toast.success(t('reservations.cancellation.success')); 
      refetch(); 
    },
    onError: (err: any) => toast.error(err.response?.data?.error || t('reservations.cancellation.error')),
  });

  const submitReview = useMutation({
    mutationFn: (data: any) => api.post('/reviews', data),
    onSuccess: () => {
      const reviewSuccess = language === 'ar' ? 'تم إرسال التقييم بنجاح!' : language === 'en' ? 'Review submitted successfully!' : 'Avis soumis avec succès !';
      toast.success(reviewSuccess);
      setReviewModal(null);
      setReview({ rating: 5, comment: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed"),
  });

  const downloadFlightPDF = async (r: any) => {
    try {
      setDownloading(r.id);
      await generateFlightTicketPDF({
        ...r,
        user: { firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email },
      });
      const pdfSuccess = language === 'ar' ? 'تم تحميل تذكرة PDF بنجاح!' : language === 'en' ? 'Ticket PDF downloaded!' : 'Billet PDF téléchargé !';
      toast.success(pdfSuccess);
    } catch (err) {
      console.error('PDF error:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(null);
    }
  };

  const downloadHotelPDF = async (r: any) => {
    try {
      setDownloading(r.id);
      await generateHotelVoucherPDF({
        ...r,
        user: { firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email },
      });
      const pdfSuccess = language === 'ar' ? 'تم تحميل سند الإقامة بنجاح!' : language === 'en' ? 'Voucher PDF downloaded!' : 'Bon d\'échange PDF téléchargé !';
      toast.success(pdfSuccess);
    } catch (err) {
      console.error('PDF error:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(null);
    }
  };

  const flightReservations = data?.flights || [];
  const hotelReservations = data?.hotels || [];

  const historyTitle = {
    fr: `Historique des voyages de ${user?.firstName}`,
    en: `${user?.firstName}'s travel history`,
    ar: `سجل سفر ${user?.firstName}`
  };

  const reloadMsg = {
    fr: "Réservations rechargées ! 🔄",
    en: "Reservations reloaded! 🔄",
    ar: "تم تحديث الحجوزات! 🔄"
  };

  const backToSearchLabel = {
    fr: "Retour à la recherche",
    en: "Back to Search",
    ar: "العودة للبحث"
  };

  const rateTitle = {
    fr: "Évaluer ce vol",
    en: "Rate this flight",
    ar: "تقييم هذه الرحلة"
  };

  const ratePlaceholder = {
    fr: "Partagez votre expérience...",
    en: "Share your experience...",
    ar: "شاركنا تجربتك..."
  };

  const submitRateBtn = {
    fr: "Soumettre l'avis",
    en: "Submit Review",
    ar: "إرسال التقييم"
  };

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
      <div className="pt-20 max-w-5xl mx-auto px-4 py-8 animate-fade-in">
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <h1 className="text-3xl font-bold text-white">{t('reservations.title')}</h1>
            <p className="text-slate-400 mt-1">{historyTitle[language]}</p>
          </div>
          <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Link href={activeTab === 'flights' ? '/flights/search' : '/hotels/search'} id="back-to-search-btn"
              className={`glass border border-white/10 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Search className="w-4 h-4 text-blue-400" /> {backToSearchLabel[language]}
            </Link>
            <button onClick={() => { refetch(); toast.success(reloadMsg[language]); }} id="reload-bookings-btn"
              className={`glass border border-white/10 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <RefreshCw className="w-4 h-4 text-emerald-400" /> {t('common.navbar.markAllRead').slice(0, 7) || 'Reload'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-2 mb-6 bg-white/5 rounded-2xl p-1 w-fit ${isRtl ? 'flex-row-reverse' : ''}`}>
          <button onClick={() => setActiveTab('flights')} id="tab-my-flights"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${isRtl ? 'flex-row-reverse' : ''} ${activeTab === 'flights' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}>
            <Plane className="w-4 h-4" /> {t('common.navbar.flights')} ({flightReservations.length})
          </button>
          <button onClick={() => setActiveTab('hotels')} id="tab-my-hotels"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${isRtl ? 'flex-row-reverse' : ''} ${activeTab === 'hotels' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}>
            <Hotel className="w-4 h-4" /> {t('common.navbar.hotels')} ({hotelReservations.length})
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : activeTab === 'flights' ? (
          <div className="space-y-4">
            {flightReservations.length === 0 ? (
              <EmptyState type="vol" href="/flights/search" isRtl={isRtl} t={t} language={language} />
            ) : (
              flightReservations.map((r: any) => (
                <div key={r.id} className="glass border border-white/10 rounded-2xl p-5">
                  <div className={`flex items-start justify-between gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div className={`flex items-center gap-3 flex-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      {r.flight.airline.logoUrl && (
                        <img src={r.flight.airline.logoUrl} alt={r.flight.airline.name} className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`flex items-center gap-2 flex-wrap ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <h3 className="font-bold text-white">{r.flight.flightNumber}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[r.status]}`}>{t('common.status.' + r.status)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${paymentColors[r.paymentStatus]}`}>{t('common.status.' + r.paymentStatus)}</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5">
                          {isRtl ? `${r.flight.destination} ← ${r.flight.origin}` : `${r.flight.origin} → ${r.flight.destination}`}
                        </p>
                        <div className={`flex items-center gap-4 mt-1 text-xs text-slate-500 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(r.flight.departureTime), 'MMM d, yyyy HH:mm')}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {t('reservations.flightCard.seats', { count: r.seatsBooked })}</span>
                          <span className="uppercase">{t('reservations.flightCard.class', { class: r.seatClass })}</span>
                        </div>
                      </div>
                    </div>
                    <div className={isRtl ? 'text-left' : 'text-right'}>
                      <p className="text-xl font-bold text-white">${Number(r.totalPrice).toFixed(0)}</p>
                      <p className="text-xs text-slate-400">{format(new Date(r.createdAt), 'MMM d')}</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 mt-4 pt-4 border-t border-white/5 flex-wrap ${isRtl ? 'flex-row-reverse' : ''}`}>
                    {r.status === 'PENDING' && r.paymentStatus === 'PENDING' && (
                      <button onClick={() => router.push(`/payment?type=flight&id=${r.id}`)} id={`pay-flight-${r.id}`}
                        className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                        {t('payment.payNow')}
                      </button>
                    )}
                    {r.paymentStatus === 'PAID' && (
                      <>
                        <button onClick={() => downloadFlightPDF(r)} id={`download-ticket-${r.id}`} disabled={downloading === r.id}
                          className="flex items-center gap-1 glass border border-white/10 text-xs px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition-colors disabled:opacity-50">
                          {downloading === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                          {t('reservations.flightCard.download')}
                        </button>
                        {r.status === 'CONFIRMED' && (
                          <button onClick={() => setReviewModal({ flightId: r.flightId, reservationId: r.id })}
                            id={`review-flight-${r.id}`}
                            className="flex items-center gap-1 glass border border-amber-500/20 text-xs px-3 py-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors">
                            <Star className="w-3 h-3" /> {language === 'ar' ? 'تقييم' : language === 'en' ? 'Review' : 'Évaluer'}
                          </button>
                        )}
                      </>
                    )}
                    {r.status !== 'CANCELLED' && (
                      <button
                        onClick={() => { if (confirm(t('reservations.cancellation.confirm'))) cancelFlight.mutate(r.id); }}
                        id={`cancel-flight-${r.id}`}
                        className={`flex items-center gap-1 glass border border-red-500/20 text-xs px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 ${isRtl ? 'mr-auto' : 'ml-auto'}`}
                        disabled={cancelFlight.isPending}>
                        <X className="w-3 h-3" /> {t('common.cancel')}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {hotelReservations.length === 0 ? (
              <EmptyState type="hotel" href="/hotels/search" isRtl={isRtl} t={t} language={language} />
            ) : (
              hotelReservations.map((r: any) => (
                <div key={r.id} className="glass border border-white/10 rounded-2xl p-5">
                  <div className={`flex items-start justify-between gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div className="flex-1">
                      <div className={`flex items-center gap-2 flex-wrap mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <h3 className="font-bold text-white">{r.hotel.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[r.status]}`}>{t('common.status.' + r.status)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${paymentColors[r.paymentStatus]}`}>{t('common.status.' + r.paymentStatus)}</span>
                      </div>
                      <p className={`text-sm text-slate-400 flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <MapPin className="w-3 h-3 text-emerald-400" /> {r.hotel.city}
                      </p>
                      <div className={`flex items-center gap-4 mt-1 text-xs text-slate-500 flex-wrap ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {format(new Date(r.checkIn), 'MMM d')} → {format(new Date(r.checkOut), 'MMM d, yyyy')}
                        </span>
                        <span>{t('reservations.hotelCard.room', { roomNumber: r.room.roomNumber, type: r.room.type })}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {r.guestCount} {t('home.searchForm.guests')}</span>
                      </div>
                    </div>
                    <div className={isRtl ? 'text-left' : 'text-right'}>
                      <p className="text-xl font-bold text-white">${Number(r.totalPrice).toFixed(0)}</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 mt-4 pt-4 border-t border-white/5 flex-wrap ${isRtl ? 'flex-row-reverse' : ''}`}>
                    {r.status === 'PENDING' && r.paymentStatus === 'PENDING' && (
                      <button onClick={() => router.push(`/payment?type=hotel&id=${r.id}`)} id={`pay-hotel-${r.id}`}
                        className="flex items-center gap-1 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
                        style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
                        {t('payment.payNow')}
                      </button>
                    )}
                    {r.paymentStatus === 'PAID' && (
                      <button onClick={() => downloadHotelPDF(r)} id={`download-voucher-${r.id}`} disabled={downloading === r.id}
                        className="flex items-center gap-1 glass border border-white/10 text-xs px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition-colors disabled:opacity-50">
                        {downloading === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        {t('reservations.hotelCard.download')}
                      </button>
                    )}
                    {r.status !== 'CANCELLED' && (
                      <button onClick={() => { if (confirm(t('reservations.cancellation.confirm'))) cancelHotel.mutate(r.id); }}
                        id={`cancel-hotel-${r.id}`}
                        className={`flex items-center gap-1 glass border border-red-500/20 text-xs px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 ${isRtl ? 'mr-auto' : 'ml-auto'}`}
                        disabled={cancelHotel.isPending}>
                        <X className="w-3 h-3" /> {t('common.cancel')}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="glass-dark border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className={`text-lg font-bold text-white mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>{rateTitle[language]}</h3>
            <div className={`flex gap-2 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setReview({ ...review, rating: s })}
                  id={`star-${s}`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${s <= review.rating ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-600'
                    }`}>
                  <Star className={`w-5 h-5 ${s <= review.rating ? 'fill-amber-400' : ''}`} />
                </button>
              ))}
            </div>
            <textarea value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })}
              id="review-comment"
              placeholder={ratePlaceholder[language]}
              rows={3}
              className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none mb-4 resize-none ${isRtl ? 'text-right' : 'text-left'}`} />
            <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button onClick={() => setReviewModal(null)} className="flex-1 glass border border-white/10 text-white py-2 rounded-xl text-sm">{t('common.cancel')}</button>
              <button onClick={() => submitReview.mutate({ flightId: reviewModal.flightId, rating: review.rating, comment: review.comment })}
                id="submit-review-btn"
                disabled={submitReview.isPending}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 rounded-xl text-sm font-medium">
                {submitReview.isPending ? t('common.submitting') : submitRateBtn[language]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ type, href, isRtl, t, language }: { type: string; href: string; isRtl: boolean; t: any; language: 'en' | 'fr' | 'ar' }) {
  const emptyLabel = {
    fr: `Aucune réservation de ${type === 'vol' ? 'vol' : 'hôtel'}`,
    en: `No ${type === 'vol' ? 'flight' : 'hotel'} bookings`,
    ar: `لا توجد حجوزات ${type === 'vol' ? 'طيران' : 'فنادق'}`
  };

  const emptyDesc = {
    fr: `Commencez à explorer et réservez votre premier ${type === 'vol' ? 'vol' : 'hôtel'} !`,
    en: `Start exploring and book your first ${type === 'vol' ? 'flight' : 'hotel'}!`,
    ar: `ابدأ الاستكشاف واحجز أول رحلة ${type === 'vol' ? 'طيران' : 'فندق'} لك!`
  };

  const searchBtnLabel = {
    fr: `Rechercher des ${type === 'vol' ? 'Vols' : 'Hôtels'}`,
    en: `Search ${type === 'vol' ? 'Flights' : 'Hotels'}`,
    ar: `البحث عن ${type === 'vol' ? 'رحلات طيران' : 'فنادق'}`
  };

  return (
    <div className="text-center py-20 glass border border-white/10 rounded-2xl animate-fade-in">
      {type === 'vol' ? <Plane className="w-16 h-16 text-slate-600 mx-auto mb-4" /> : <Hotel className="w-16 h-16 text-slate-600 mx-auto mb-4" />}
      <h3 className="text-xl font-semibold text-white mb-2">{emptyLabel[language]}</h3>
      <p className="text-slate-400 mb-6">{emptyDesc[language]}</p>
      <a href={href} className={`inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition-all ${isRtl ? 'flex-row-reverse' : ''}`}>
        {searchBtnLabel[language]} <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
      </a>
    </div>
  );
}
