'use client';
import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { CreditCard, Lock, CheckCircle, Loader2, ArrowLeft, Plane, Hotel } from 'lucide-react';
import { generateFlightTicketPDF, generateHotelVoucherPDF } from '@/lib/generatePDF';
import { useTranslation } from '@/context/LanguageContext';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const type = searchParams.get('type') as 'flight' | 'hotel';
  const reservationId = searchParams.get('id');
  const { t, language, isRtl } = useTranslation();

  const [form, setForm] = useState({
    cardHolder: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '', method: 'CARD'
  });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const { data: reservation } = useQuery({
    queryKey: ['reservation', type, reservationId],
    queryFn: () => {
      if (!reservationId) return null;
      return api.get(`/reservations/my`).then(r => {
        const list = type === 'flight' ? r.data.flights : r.data.hotels;
        return list.find((item: any) => item.id === reservationId);
      });
    },
    enabled: !!reservationId && isAuthenticated,
  });

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cardNumber || !form.cardHolder || !form.expiryMonth || !form.expiryYear || !form.cvv) {
      toast.error(t('payment.errors.fields')); 
      return;
    }

    setProcessing(true);
    try {
      const res = await api.post('/payments', {
        reservationType: type, reservationId,
        paymentMethod: form.method, cardNumber: form.cardNumber, cardHolder: form.cardHolder,
      });
      setTransactionId(res.data.transactionId);
      setSuccess(true);
      toast.success(t('payment.success.toast'));
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('payment.errors.failed'));
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reservation) return;
    try {
      if (type === 'flight') {
        await generateFlightTicketPDF({
          ...reservation,
          user: { firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email },
        });
      } else {
        await generateHotelVoucherPDF({
          ...reservation,
          user: { firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email },
        });
      }
      const pdfSuccess = language === 'ar' ? 'تم تحميل ملف PDF بنجاح!' : language === 'en' ? 'PDF downloaded successfully!' : 'PDF téléchargé avec succès !';
      toast.success(pdfSuccess);
    } catch (err) {
      console.error('PDF generation error:', err);
      const pdfFail = language === 'ar' ? 'فشل تحميل ملف PDF' : language === 'en' ? 'Failed to download PDF' : 'Échec de la génération du PDF';
      toast.error(pdfFail);
    }
  };

  const summaryRowLabels = {
    flight: language === 'ar' ? 'الرحلة' : language === 'en' ? 'Flight' : 'Vol',
    route: language === 'ar' ? 'المسار' : language === 'en' ? 'Route' : 'Itinéraire',
    seats: language === 'ar' ? 'المقاعد' : language === 'en' ? 'Seats' : 'Sièges',
    class: language === 'ar' ? 'الدرجة' : language === 'en' ? 'Class' : 'Classe',
    hotel: language === 'ar' ? 'الفندق' : language === 'en' ? 'Hotel' : 'Hôtel',
    room: language === 'ar' ? 'الغرفة' : language === 'en' ? 'Room' : 'Chambre',
    checkin: t('home.searchForm.checkIn'),
    checkout: t('home.searchForm.checkOut'),
    total: language === 'ar' ? 'المجموع' : language === 'en' ? 'Total' : 'Total',
  };

  const downloadBtnLabel = {
    fr: `Télécharger le PDF du ${type === 'flight' ? 'billet' : 'bon'}`,
    en: `Download ${type === 'flight' ? 'ticket' : 'voucher'} PDF`,
    ar: `تحميل ملف PDF لل${type === 'flight' ? 'تذكرة' : 'سند'}`
  };

  if (success) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <Navbar />
      <div className="relative z-10 text-center max-w-md animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('payment.success.title')}</h1>
        <p className="text-slate-400 mb-2">{t('payment.success.transaction')} : <span className="text-blue-400 font-mono text-sm">{transactionId}</span></p>
        <p className="text-slate-400 mb-8">
          {t('payment.success.instruction', { type: type === 'flight' ? t('payment.success.boardingPass') : t('payment.success.voucher') })}
        </p>
        <div className={`flex gap-3 justify-center ${isRtl ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all"
          >
            {downloadBtnLabel[language]}
          </button>
          <button onClick={() => router.push('/reservations')} className="px-6 py-3 glass border border-white/10 text-white rounded-xl font-medium text-sm hover:bg-white/10 transition-all">
            {t('payment.success.viewBookings')}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="absolute inset-0 hero-gradient" />
      <div className="relative z-10 pt-24 max-w-2xl mx-auto px-4 pb-10">
        <button onClick={() => router.back()} className={`flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {t('common.back')}
        </button>

        <h1 className={`text-3xl font-bold text-white mb-8 ${isRtl ? 'text-right' : 'text-left'}`}>{t('payment.title')}</h1>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Summary */}
          {reservation && (
            <div className="glass border border-white/10 rounded-2xl p-5 h-fit">
              <h3 className={`font-semibold text-white mb-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                {type === 'flight' ? <Plane className="w-4 h-4 text-blue-400" /> : <Hotel className="w-4 h-4 text-emerald-400" />}
                {t('payment.summary')}
              </h3>
              <div className="space-y-2 text-sm">
                {type === 'flight' ? (
                  <>
                    <SummaryRow label={summaryRowLabels.flight} value={reservation.flight?.flightNumber} isRtl={isRtl} />
                    <SummaryRow label={summaryRowLabels.route} value={isRtl ? `${reservation.flight?.destination} ← ${reservation.flight?.origin}` : `${reservation.flight?.origin} → ${reservation.flight?.destination}`} isRtl={isRtl} />
                    <SummaryRow label={summaryRowLabels.seats} value={String(reservation.seatsBooked)} isRtl={isRtl} />
                    <SummaryRow label={summaryRowLabels.class} value={reservation.seatClass} isRtl={isRtl} />
                  </>
                ) : (
                  <>
                    <SummaryRow label={summaryRowLabels.hotel} value={reservation.hotel?.name} isRtl={isRtl} />
                    <SummaryRow label={summaryRowLabels.room} value={`${reservation.room?.type} #${reservation.room?.roomNumber}`} isRtl={isRtl} />
                    <SummaryRow label={summaryRowLabels.checkin} value={new Date(reservation.checkIn).toLocaleDateString()} isRtl={isRtl} />
                    <SummaryRow label={summaryRowLabels.checkout} value={new Date(reservation.checkOut).toLocaleDateString()} isRtl={isRtl} />
                  </>
                )}
                <div className={`pt-3 border-t border-white/10 flex justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span className="text-slate-400 font-medium">{summaryRowLabels.total}</span>
                  <span className="text-white font-bold text-lg">{Number(reservation.totalPrice).toFixed(2)} $</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Form */}
          <form onSubmit={handlePay} className="glass border border-white/10 rounded-2xl p-5 space-y-4">
            <div className={`flex items-center gap-2 mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Lock className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-white">{t('payment.secure')}</span>
              <span className={`${isRtl ? 'mr-auto' : 'ml-auto'} text-xs text-slate-400`}>{t('payment.ssl')}</span>
            </div>

            {/* Payment method */}
            <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {['CARD', 'PAYPAL'].map((m) => (
                <button key={m} type="button" onClick={() => setForm({ ...form, method: m })}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                    form.method === m ? 'bg-blue-600 text-white' : 'glass text-slate-400 hover:text-white'
                  }`}>
                  {m === 'CARD' ? t('payment.methodCard') : t('payment.methodPaypal')}
                </button>
              ))}
            </div>

            <div className={isRtl ? 'text-right' : 'text-left'}>
              <label className="text-xs text-slate-400 block mb-1">{t('payment.cardHolder')}</label>
              <input value={form.cardHolder} onChange={e => setForm({ ...form, cardHolder: e.target.value })}
                id="card-holder" placeholder="John Doe"
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${isRtl ? 'text-right' : 'text-left'}`} />
            </div>

            <div className={isRtl ? 'text-right' : 'text-left'}>
              <label className="text-xs text-slate-400 block mb-1">{t('payment.cardNumber')}</label>
              <div className="relative">
                <CreditCard className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
                <input value={form.cardNumber} onChange={e => setForm({ ...form, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                  id="card-number" placeholder="1234 5678 9012 3456"
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 tracking-wider ${
                    isRtl ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3 text-left'
                  }`} />
              </div>
            </div>

            <div className={`grid grid-cols-3 gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs text-slate-400 block mb-1">{t('payment.expiryMonth')}</label>
                <input value={form.expiryMonth} onChange={e => setForm({ ...form, expiryMonth: e.target.value })}
                  id="card-exp-month" placeholder="MM" maxLength={2}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${isRtl ? 'text-right' : 'text-left'}`} />
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs text-slate-400 block mb-1">{t('payment.expiryYear')}</label>
                <input value={form.expiryYear} onChange={e => setForm({ ...form, expiryYear: e.target.value })}
                  id="card-exp-year" placeholder="AA" maxLength={2}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${isRtl ? 'text-right' : 'text-left'}`} />
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs text-slate-400 block mb-1">{t('payment.cvv')}</label>
                <input value={form.cvv} type="password" onChange={e => setForm({ ...form, cvv: e.target.value.slice(0, 4) })}
                  id="card-cvv" placeholder="•••"
                  className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${isRtl ? 'text-right' : 'text-left'}`} />
              </div>
            </div>

            <div className={`bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300 ${isRtl ? 'text-right' : 'text-left'}`}>
              {t('payment.simulated')}
            </div>

            <button type="submit" disabled={processing} id="pay-now-btn"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg">
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {processing ? t('common.submitting') : reservation ? t('payment.payBtn', { amount: Number(reservation.totalPrice).toFixed(2) }) : t('payment.payNow')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>}>
      <PaymentContent />
    </Suspense>
  );
}

function SummaryRow({ label, value, isRtl }: { label: string; value?: string; isRtl?: boolean }) {
  return (
    <div className={`flex justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
      <span className="text-slate-400">{label}</span>
      <span className="text-white font-medium">{value || '-'}</span>
    </div>
  );
}
