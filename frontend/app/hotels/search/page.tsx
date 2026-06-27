'use client';
import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { Hotel, Star, MapPin, Search, SlidersHorizontal, Users, ChevronLeft, ChevronRight, ArrowRight, X, Wifi, Coffee, Dumbbell, Waves } from 'lucide-react';

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-3 h-3" />,
  'Pool': <Waves className="w-3 h-3" />,
  'Gym': <Dumbbell className="w-3 h-3" />,
  'Restaurant': <Coffee className="w-3 h-3" />,
};

function HotelCard({ hotel }: { hotel: any }) {
  const { t, language, isRtl } = useTranslation();
  const minPrice = hotel.rooms?.[0]?.pricePerNight;
  const amenities = hotel.amenities ? JSON.parse(hotel.amenities) : [];

  return (
    <Link href={`/hotels/${hotel.id}`} className="group block">
      <div className="glass border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300 card-hover">
        {hotel.imageUrl ? (
          <div className="relative h-44 overflow-hidden">
            <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
          </div>
        ) : (
          <div className="h-44 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 flex items-center justify-center">
            <Hotel className="w-16 h-16 text-emerald-500/40" />
          </div>
        )}

        <div className="p-5">
          <div className={`flex items-start justify-between gap-2 mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <h3 className={`font-bold text-white text-lg leading-tight ${isRtl ? 'text-right' : 'text-left'}`}>{hotel.name}</h3>
            <div className="shrink-0 flex items-center gap-1 text-amber-400 text-sm font-semibold mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{hotel.stars}</span>
            </div>
          </div>
          <p className={`text-slate-400 text-sm flex items-center gap-1 mb-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {hotel.city}
          </p>

          {amenities.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {amenities.slice(0, 4).map((a: string) => (
                <span key={a} className={`text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-slate-400 flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  {amenityIcons[a] || null} <span>{a}</span>
                </span>
              ))}
            </div>
          )}

          <div className={`flex items-center justify-between pt-3 border-t border-white/5 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className={isRtl ? 'text-right' : 'text-left'}>
              {minPrice ? (
                <span className="text-sm font-bold text-white">
                  {t('hotels.search.pricePerNight', { price: Number(minPrice).toFixed(0) })}
                </span>
              ) : (
                <span className="text-sm text-slate-500">{t('hotels.search.onRequest')}</span>
              )}
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/40 transition-colors">
              <ArrowRight className={`w-4 h-4 text-emerald-400 ${isRtl ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function HotelSearchContent() {
  const searchParams = useSearchParams();
  const { t, language, isRtl } = useTranslation();
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || '1',
    minPrice: '',
    maxPrice: '',
    stars: '',
  });
  const [page, setPage] = useState(1);

  const queryParams = new URLSearchParams({ ...filters, page: String(page), limit: '12' });

  const { data, isLoading } = useQuery({
    queryKey: ['hotels', queryParams.toString()],
    queryFn: () => api.get(`/hotels?${queryParams}`).then(r => r.data),
    staleTime: 30000,
  });

  const hotels = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 12);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); };

  const paginationLabel = {
    fr: `Page ${page} sur ${totalPages}`,
    en: `Page ${page} of ${totalPages}`,
    ar: `صفحة ${page} من ${totalPages}`
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="pt-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className={`text-3xl font-bold text-white mb-6 ${isRtl ? 'text-right' : 'text-left'}`}>
            {t('hotels.search.title').split(' ')[0]} <span style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t('hotels.search.title').split(' ').slice(1).join(' ')}</span>
          </h1>
          <form onSubmit={handleSearch} className="glass border border-white/10 rounded-2xl p-4">
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {[
                { key: 'city', label: t('home.searchForm.city'), placeholder: t('home.searchForm.cityPlaceholder') },
                { key: 'checkIn', label: t('home.searchForm.checkIn'), placeholder: '', type: 'date' },
                { key: 'checkOut', label: t('home.searchForm.checkOut'), placeholder: '', type: 'date' },
                { key: 'guests', label: t('home.searchForm.guests'), placeholder: '1', type: 'number' },
              ].map((f) => (
                <div key={f.key} className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="text-xs text-slate-400 block mb-1">{f.label}</label>
                  <input type={f.type || 'text'} placeholder={f.placeholder}
                    id={`hotel-search-${f.key}`}
                    value={(filters as any)[f.key]}
                    onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 ${
                      isRtl ? 'text-right' : 'text-left'
                    }`} />
                </div>
              ))}
              <div className="flex items-end">
                <button type="submit" id="hotel-search-submit" className="w-full py-2.5 rounded-xl font-medium text-sm text-white flex items-center justify-center gap-1 transition-all"
                  style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
                  <Search className="w-4 h-4" /> {t('home.searchForm.search')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`flex flex-col lg:flex-row gap-6 ${isRtl ? 'lg:flex-row-reverse' : ''}`}>
          {/* Filters */}
          <div className="lg:w-64 shrink-0 lg:sticky lg:top-24 self-start">
            <div className="glass border border-white/10 rounded-2xl p-4">
              <h3 className={`text-sm font-semibold text-white mb-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" /> {t('hotels.filters.title')}
              </h3>
              <div className="space-y-4">
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="text-xs text-slate-400 block mb-1">{t('hotels.filters.stars')}</label>
                  <select value={filters.stars} onChange={(e) => setFilters({ ...filters, stars: e.target.value })}
                    id="hotel-filter-stars"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none bg-slate-900">
                    <option value="" className="bg-slate-850">{t('hotels.filters.anyStars')}</option>
                    {[5, 4, 3, 2].map(s => (
                      <option key={s} value={s} className="bg-slate-850">
                        {`${s} ★ ${t('hotels.filters.andUp')}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="text-xs text-slate-400 block mb-1">{t('hotels.filters.pricePerNight')}</label>
                  <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <input type="number" placeholder={t('flights.filters.min')} value={filters.minPrice}
                      id="hotel-filter-min"
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className={`w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none ${isRtl ? 'text-right' : 'text-left'}`} />
                    <input type="number" placeholder={t('flights.filters.max')} value={filters.maxPrice}
                      id="hotel-filter-max"
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className={`w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none ${isRtl ? 'text-right' : 'text-left'}`} />
                  </div>
                </div>
                <button onClick={() => setFilters({ city: '', checkIn: '', checkOut: '', guests: '1', minPrice: '', maxPrice: '', stars: '' })}
                  className={`w-full text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <X className="w-3 h-3" /> {t('hotels.filters.clear')}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <p className={`text-slate-400 text-sm mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
              {isLoading ? t('hotels.search.searching') : t('hotels.search.results', { count: total })}
            </p>
            {isLoading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="glass border border-white/10 rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-44 bg-white/5" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-white/10 rounded w-2/3" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : hotels.length === 0 ? (
              <div className="text-center py-20 animate-fade-in">
                <Hotel className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{t('hotels.search.noHotels')}</h3>
                <p className="text-slate-400">{t('hotels.search.noHotelsDesc')}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
                {hotels.map((h: any) => <HotelCard key={h.id} hotel={h} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`flex items-center justify-center gap-2 mt-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="glass border border-white/10 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 disabled:opacity-40 transition-colors">
                  <ChevronLeft className={`w-4 h-4 text-white ${isRtl ? 'rotate-180' : ''}`} />
                </button>
                <span className="text-sm text-slate-400">{paginationLabel[language]}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, page + 1))} disabled={page === totalPages}
                  className="glass border border-white/10 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 disabled:opacity-40 transition-colors">
                  <ChevronRight className={`w-4 h-4 text-white ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HotelSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <HotelSearchContent />
    </Suspense>
  );
}
