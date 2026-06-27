'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/stores/authStore';
import {
  Plane, Hotel, Search, Star, Shield, Clock, ArrowRight,
  MapPin, Calendar, Users, CheckCircle, Globe, Award, TrendingUp
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels'>('flights');
  const [flightForm, setFlightForm] = useState({ origin: '', destination: '', date: '', passengers: '1' });
  const [hotelForm, setHotelForm] = useState({ city: '', checkIn: '', checkOut: '', rooms: '1' });
  const { t, language, isRtl } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFlightSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(flightForm);
    router.push(`/flights/search?${params}`);
  };

  const handleHotelSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(hotelForm);
    router.push(`/hotels/search?${params}`);
  };

  const badgeText = {
    fr: "Recommandé par plus de 50 000 voyageurs",
    en: "Recommended by over 50,000 travelers",
    ar: "موثوق به من قبل أكثر من 50,000 مسافر"
  };

  const ctaSubtitle = {
    fr: "Créez votre compte gratuit et commencez à réserver vos voyages de rêve dès aujourd'hui.",
    en: "Create your free account and start booking your dream travels today.",
    ar: "أنشئ حسابك المجاني وابدأ حجز رحلات أحلامك اليوم."
  };

  const ctaTitle = {
    fr: "Prêt à Explorer le Monde ?",
    en: "Ready to Explore the World?",
    ar: "جاهز لاستكشاف العالم؟"
  };

  const ctaRegister = {
    fr: "S'inscrire Gratuitement",
    en: "Register For Free",
    ar: "سجل مجاناً"
  };

  const ctaPoints = {
    fr: ['Sans carte de crédit', 'Annulation flexible', 'Sécurisé & crypté'],
    en: ['No credit card needed', 'Flexible cancellation', 'Secure & encrypted'],
    ar: ['بدون بطاقة ائتمان', 'إلغاء مرن', 'آمن ومحمي']
  };

  const statsLabels = {
    fr: ['Vols', 'Hôtels', 'Destinations', 'Voyageurs Satisfaits'],
    en: ['Flights', 'Hotels', 'Destinations', 'Happy Travelers'],
    ar: ['رحلات طيران', 'فنادق', 'وجهات', 'مسافرون سعداء']
  };

  const featuresList = {
    fr: [
      {
        icon: <Shield className="w-7 h-7 text-blue-400" />,
        title: 'Paiements Sécurisés',
        desc: 'Vos paiements sont protégés par un cryptage de niveau bancaire. Plusieurs méthodes de paiement sont prises en charge.',
        color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20',
      },
      {
        icon: <Clock className="w-7 h-7 text-emerald-400" />,
        title: 'Confirmation Instantanée',
        desc: 'Obtenez votre confirmation en quelques secondes. Les billets PDF sont envoyés directement à votre e-mail.',
        color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
      },
      {
        icon: <TrendingUp className="w-7 h-7 text-purple-400" />,
        title: 'Meilleurs Prix',
        desc: 'Comparez des centaines de vols et d\'hôtels pour trouver les meilleures offres disponibles.',
        color: 'from-purple-500/10 to-pink-500/10 border-purple-500/20',
      }
    ],
    en: [
      {
        icon: <Shield className="w-7 h-7 text-blue-400" />,
        title: 'Secure Payments',
        desc: 'Your payments are protected by bank-level encryption. Multiple payment methods supported.',
        color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20',
      },
      {
        icon: <Clock className="w-7 h-7 text-emerald-400" />,
        title: 'Instant Confirmation',
        desc: 'Get your confirmation in seconds. PDF tickets are sent directly to your inbox.',
        color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
      },
      {
        icon: <TrendingUp className="w-7 h-7 text-purple-400" />,
        title: 'Best Prices',
        desc: 'Compare hundreds of flights and hotels to find the best available deals.',
        color: 'from-purple-500/10 to-pink-500/10 border-purple-500/20',
      }
    ],
    ar: [
      {
        icon: <Shield className="w-7 h-7 text-blue-400" />,
        title: 'مدفوعات آمنة',
        desc: 'مدفوعاتك محمية بتشفير ذو مستوى بنكي. ندعم وسائل دفع متعددة.',
        color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20',
      },
      {
        icon: <Clock className="w-7 h-7 text-emerald-400" />,
        title: 'تأكيد فوري',
        desc: 'احصل على تأكيد حجزك في ثوانٍ معدودة. تُرسل تذاكر PDF مباشرة إلى بريدك.',
        color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
      },
      {
        icon: <TrendingUp className="w-7 h-7 text-purple-400" />,
        title: 'أفضل الأسعار',
        desc: 'قارن بين مئات الرحلات الجوية والفنادق للعثور على أفضل العروض المتاحة.',
        color: 'from-purple-500/10 to-pink-500/10 border-purple-500/20',
      }
    ]
  };

  const sectionHeaders = {
    fr: {
      choose: "Pourquoi Choisir FlightHotel ?",
      chooseSub: "Tout ce dont vous avez besoin pour une expérience de voyage parfaite",
      dest: "Destinations Populaires",
      destSub: "Voir tout"
    },
    en: {
      choose: "Why Choose FlightHotel?",
      chooseSub: "Everything you need for a perfect travel experience",
      dest: "Popular Destinations",
      destSub: "View all"
    },
    ar: {
      choose: "لماذا تختار FlightHotel؟",
      chooseSub: "كل ما تحتاجه لتجربة سفر مثالية ومريحة",
      dest: "الوجهات الأكثر شعبية",
      destSub: "عرض الكل"
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center pt-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-slate-300">{badgeText[language]}</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 animate-slide-up leading-tight">
            <span className="gradient-text">{t('home.hero.title')}</span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {t('home.hero.subtitle')}
          </p>

          {/* Search Widget */}
          <div className="glass rounded-3xl p-6 max-w-3xl mx-auto animate-slide-up shadow-2xl" style={{ animationDelay: '0.2s' }}>
            {/* Tabs */}
            <div className={`flex gap-2 mb-6 bg-white/5 rounded-2xl p-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setActiveTab('flights')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'flights'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
                id="tab-flights"
              >
                <Plane className="w-4 h-4" /> {t('common.navbar.flights')}
              </button>
              <button
                onClick={() => setActiveTab('hotels')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'hotels'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
                id="tab-hotels"
              >
                <Hotel className="w-4 h-4" /> {t('common.navbar.hotels')}
              </button>
            </div>

            {activeTab === 'flights' ? (
              <form onSubmit={handleFlightSearch}>
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <SearchInput
                    icon={<MapPin className="w-4 h-4 text-blue-400" />}
                    placeholder={t('home.searchForm.fromPlaceholder')}
                    value={flightForm.origin}
                    onChange={(v) => setFlightForm({ ...flightForm, origin: v })}
                    id="flight-origin"
                    isRtl={isRtl}
                  />
                  <SearchInput
                    icon={<MapPin className="w-4 h-4 text-purple-400" />}
                    placeholder={t('home.searchForm.toPlaceholder')}
                    value={flightForm.destination}
                    onChange={(v) => setFlightForm({ ...flightForm, destination: v })}
                    id="flight-destination"
                    isRtl={isRtl}
                  />
                  <SearchInput
                    icon={<Calendar className="w-4 h-4 text-blue-400" />}
                    placeholder={t('home.searchForm.date')}
                    type="date"
                    value={flightForm.date}
                    onChange={(v) => setFlightForm({ ...flightForm, date: v })}
                    id="flight-date"
                    isRtl={isRtl}
                  />
                  <SearchInput
                    icon={<Users className="w-4 h-4 text-blue-400" />}
                    placeholder={t('home.searchForm.passengers')}
                    type="number"
                    value={flightForm.passengers}
                    onChange={(v) => setFlightForm({ ...flightForm, passengers: v })}
                    id="flight-passengers"
                    isRtl={isRtl}
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/30"
                  id="search-flights-btn"
                >
                  <Search className="w-4 h-4" /> {t('home.hero.searchFlights')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleHotelSearch}>
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <SearchInput
                    icon={<MapPin className="w-4 h-4 text-emerald-400" />}
                    placeholder={t('home.searchForm.cityPlaceholder')}
                    value={hotelForm.city}
                    onChange={(v) => setHotelForm({ ...hotelForm, city: v })}
                    id="hotel-city"
                    isRtl={isRtl}
                  />
                  <SearchInput
                    icon={<Calendar className="w-4 h-4 text-emerald-400" />}
                    placeholder={t('home.searchForm.checkIn')}
                    type="date"
                    value={hotelForm.checkIn}
                    onChange={(v) => setHotelForm({ ...hotelForm, checkIn: v })}
                    id="hotel-checkin"
                    isRtl={isRtl}
                  />
                  <SearchInput
                    icon={<Calendar className="w-4 h-4 text-teal-400" />}
                    placeholder={t('home.searchForm.checkOut')}
                    type="date"
                    value={hotelForm.checkOut}
                    onChange={(v) => setHotelForm({ ...hotelForm, checkOut: v })}
                    id="hotel-checkout"
                    isRtl={isRtl}
                  />
                  <SearchInput
                    icon={<Users className="w-4 h-4 text-emerald-400" />}
                    placeholder={t('home.searchForm.guests')}
                    type="number"
                    value={hotelForm.rooms}
                    onChange={(v) => setHotelForm({ ...hotelForm, rooms: v })}
                    id="hotel-rooms"
                    isRtl={isRtl}
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/30"
                  id="search-hotels-btn"
                >
                  <Search className="w-4 h-4" /> {t('home.hero.searchHotels')}
                </button>
              </form>
            )}
          </div>

          {/* Stats */}
          <div className={`flex flex-wrap justify-center gap-8 mt-14 animate-fade-in ${isRtl ? 'flex-row-reverse' : ''}`}>
            {[
              { label: statsLabels[language][0], value: '500+', icon: <Plane className="w-5 h-5" /> },
              { label: statsLabels[language][1], value: '200+', icon: <Hotel className="w-5 h-5" /> },
              { label: statsLabels[language][2], value: '80+', icon: <Globe className="w-5 h-5" /> },
              { label: statsLabels[language][3], value: '50K+', icon: <Award className="w-5 h-5" /> },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="flex items-center justify-center gap-2 text-blue-400 mb-1">{s.icon}</div>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-white/60" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">{sectionHeaders[language].choose}</h2>
            <p className="text-slate-400 text-lg">{sectionHeaders[language].chooseSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuresList[language].map((f) => (
              <div key={f.title} className={`bg-gradient-to-br ${f.color} border rounded-2xl p-6 card-hover ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-white">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 px-4 bg-white/2">
        <div className="max-w-6xl mx-auto">
          <div className={`flex items-center justify-between mb-10 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-3xl font-bold">{sectionHeaders[language].dest}</h2>
            <Link href="/flights/search" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              {sectionHeaders[language].destSub} <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {destinations.map((d) => (
              <Link key={d.city} href={`/flights/search?destination=${d.city}`} className="group relative overflow-hidden rounded-2xl aspect-[3/4] card-hover">
                <img src={d.image} alt={d.city} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                <div className={`absolute bottom-4 ${isRtl ? 'right-4 text-right' : 'left-4 text-left'}`}>
                  <h3 className="text-lg font-bold text-white">{d.city}</h3>
                  <p className="text-slate-300 text-sm flex items-center gap-1">
                    <span className="text-blue-400 font-semibold">{language === 'ar' ? `دءاً من ${d.price} $` : `from ${d.price} $`}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">{ctaTitle[language]}</h2>
              <p className="text-slate-400 text-lg mb-8">{ctaSubtitle[language]}</p>
              <Link href="/auth/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-xl hover:shadow-blue-500/30 text-lg">
                {ctaRegister[language]} <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
              </Link>
              <div className={`flex items-center justify-center gap-6 mt-8 text-sm text-slate-400 ${isRtl ? 'flex-row-reverse' : ''}`}>
                {ctaPoints[language].map(t => (
                  <span key={t} className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4">
        <div className={`max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
          <div className="flex items-center">
            <span className="font-extrabold tracking-tight select-none text-lg">
              <span className="text-white">Flight</span>
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Hotel</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            {t('common.footer.rights', { year: new Date().getFullYear() })}
          </p>
          <div className={`flex gap-6 text-sm text-slate-400 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Link href="/flights/search" className="hover:text-white transition-colors">{t('common.navbar.flights')}</Link>
            <Link href="/hotels/search" className="hover:text-white transition-colors">{t('common.navbar.hotels')}</Link>
            {mounted && !isAuthenticated && (
              <Link href="/auth/login" className="hover:text-white transition-colors">{t('common.navbar.login')}</Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function SearchInput({ icon, placeholder, type = 'text', value, onChange, id, isRtl }: {
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  id: string;
  isRtl?: boolean;
}) {
  return (
    <div className="relative">
      <div className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 z-10`}>{icon}</div>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all ${
          isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
        }`}
      />
    </div>
  );
}

const destinations = [
  { city: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400', price: 280 },
  { city: 'Dubaï', country: 'Émirats arabes unis', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400', price: 350 },
  { city: 'Istanbul', country: 'Turquie', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400', price: 320 },
  { city: 'New York', country: 'États-Unis', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400', price: 890 },
];
