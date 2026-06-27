'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { useTranslation } from '@/context/LanguageContext';
import {
  Plane, MapPin, Clock, Star, Filter, Search, ChevronLeft, ChevronRight,
  ArrowRight, Wifi, Coffee, X, SlidersHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { enUS, fr, ar } from 'date-fns/locale';

const dateLocales: Record<string, any> = { en: enUS, fr, ar };

function FlightCard({ flight }: { flight: any }) {
  const { t, language, isRtl } = useTranslation();
  const depart = new Date(flight.departureTime);
  const arrive = new Date(flight.arrivalTime);
  const durationMs = arrive.getTime() - depart.getTime();
  const hours = Math.floor(durationMs / 3600000);
  const minutes = Math.floor((durationMs % 3600000) / 60000);

  const statusColor: Record<string, string> = {
    SCHEDULED: 'bg-blue-500/20 text-blue-400',
    BOARDING: 'bg-amber-500/20 text-amber-400',
    CANCELLED: 'bg-red-500/20 text-red-400',
    DELAYED: 'bg-orange-500/20 text-orange-400',
    DEPARTED: 'bg-green-500/20 text-green-400',
    ARRIVED: 'bg-teal-500/20 text-teal-400',
  };

  return (
    <Link href={`/flights/${flight.id}`} className="group block">
      <div className="glass border border-white/10 rounded-2xl p-5 hover:border-blue-500/40 hover:bg-white/5 transition-all duration-300 card-hover">
        <div className={`flex items-center justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {flight.airline.logoUrl ? (
              <img src={flight.airline.logoUrl} alt={flight.airline.name} className="w-8 h-8 object-contain rounded-lg bg-white/10 p-1" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Plane className="w-4 h-4 text-blue-400" />
              </div>
            )}
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <p className="text-xs text-slate-400">{flight.airline.name}</p>
              <p className="text-sm font-bold text-white">{flight.flightNumber}</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[flight.status] || 'bg-slate-500/20 text-slate-400'}`}>
            {t('common.status.' + flight.status)}
          </span>
        </div>

        <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{format(depart, 'HH:mm')}</p>
            <p className="text-xs text-slate-400 mt-0.5 max-w-[90px] truncate">{flight.origin}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <p className="text-xs text-slate-500">{hours}h {minutes}m</p>
            <div className="flex items-center gap-1 w-full">
              <div className="flex-1 h-px bg-gradient-to-r from-blue-600 to-purple-600" />
              <Plane className={`w-3.5 h-3.5 text-blue-400 rotate-45 ${isRtl ? '-scale-x-100' : ''}`} />
              <div className="flex-1 h-px bg-gradient-to-r from-purple-600 to-blue-600" />
            </div>
            <p className="text-xs text-slate-500">{t('flights.search.seatsLeft', { count: flight.availableSeats })}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{format(arrive, 'HH:mm')}</p>
            <p className="text-xs text-slate-400 mt-0.5 max-w-[90px] truncate">{flight.destination}</p>
          </div>
        </div>

        <div className={`flex items-center justify-between mt-4 pt-4 border-t border-white/5 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <p className="text-xs text-slate-500 capitalize">{format(depart, 'd MMM yyyy', { locale: dateLocales[language] || fr })}</p>
          <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className={isRtl ? 'text-left' : 'text-right'}>
              <p className="text-xl font-bold text-white">{Number(flight.price).toFixed(0)} $</p>
              <p className="text-xs text-slate-400">{t('flights.search.pricePerPerson')}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/40 transition-colors">
              <ArrowRight className={`w-4 h-4 text-blue-400 ${isRtl ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FlightSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, language, isRtl } = useTranslation();

  const [filters, setFilters] = useState({
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    departureDate: searchParams.get('date') || '',
    passengers: searchParams.get('passengers') || '1',
    minPrice: '',
    maxPrice: '',
    airline: '',
  });
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const queryParams = new URLSearchParams({
    ...filters,
    page: String(page),
    limit: '12',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['flights', queryParams.toString()],
    queryFn: () => api.get(`/flights?${queryParams}`).then(r => r.data),
    staleTime: 30000,
  });

  const { data: airlines } = useQuery({
    queryKey: ['airlines'],
    queryFn: () => api.get('/airlines').then(r => r.data),
  });

  const flights = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 12);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const paginationLabel = {
    fr: `Page ${page} sur ${totalPages}`,
    en: `Page ${page} of ${totalPages}`,
    ar: `صفحة ${page} من ${totalPages}`
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Search Header */}
      <div className="pt-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className={`text-3xl font-bold text-white mb-6 ${isRtl ? 'text-right' : 'text-left'}`}>
            {t('flights.search.title').split(' ')[0]} <span className="gradient-text">{t('flights.search.title').split(' ').slice(1).join(' ')}</span>
          </h1>

          {/* Search form */}
          <form onSubmit={handleSearch} className="glass border border-white/10 rounded-2xl p-4">
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {[
                { key: 'origin', label: t('home.searchForm.from'), placeholder: t('home.searchForm.fromPlaceholder') },
                { key: 'destination', label: t('home.searchForm.to'), placeholder: t('home.searchForm.toPlaceholder') },
                { key: 'departureDate', label: t('home.searchForm.date'), placeholder: t('home.searchForm.date'), type: 'date' },
                { key: 'passengers', label: t('home.searchForm.passengers'), placeholder: '1', type: 'number' },
              ].map((f) => (
                <div key={f.key} className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="text-xs text-slate-400 block mb-1">{f.label}</label>
                  <input
                    id={`search-${f.key}`}
                    type={f.type || 'text'}
                    placeholder={f.placeholder}
                    value={(filters as any)[f.key]}
                    onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
                      isRtl ? 'text-right' : 'text-left'
                    }`}
                  />
                </div>
              ))}
              <div className="flex items-end">
                <button id="flight-search-submit" type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-1 hover:from-blue-500 hover:to-indigo-500 transition-all">
                  <Search className="w-4 h-4" /> {t('home.searchForm.search')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`flex flex-col lg:flex-row gap-6 ${isRtl ? 'lg:flex-row-reverse' : ''}`}>
          {/* Filters Sidebar */}
          <div className={`lg:w-64 shrink-0 lg:sticky lg:top-24 self-start space-y-4 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="glass border border-white/10 rounded-2xl p-4">
              <h3 className={`text-sm font-semibold text-white mb-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <SlidersHorizontal className="w-4 h-4 text-blue-400" /> {t('flights.filters.title')}
              </h3>

              <div className="space-y-4">
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="text-xs text-slate-400 block mb-1">{t('flights.filters.priceRange')}</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder={`${t('flights.filters.min')} $`} value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      id="filter-min-price"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
                    <input type="number" placeholder={`${t('flights.filters.max')} $`} value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      id="filter-max-price"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
                  </div>
                </div>

                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="text-xs text-slate-400 block mb-1">{t('flights.filters.airline')}</label>
                  <select value={filters.airline} onChange={(e) => setFilters({ ...filters, airline: e.target.value })}
                    id="filter-airline"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none bg-slate-900">
                    <option value="" className="bg-slate-850">{t('flights.filters.allAirlines')}</option>
                    {airlines?.map((a: any) => (
                      <option key={a.id} value={a.id} className="bg-slate-850">{a.name}</option>
                    ))}
                  </select>
                </div>

                <button onClick={() => setFilters({ origin: '', destination: '', departureDate: '', passengers: '1', minPrice: '', maxPrice: '', airline: '' })}
                  className={`w-full text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <X className="w-3 h-3" /> {t('flights.filters.clear')}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className={`flex items-center justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <p className="text-slate-400 text-sm">
                {isLoading ? t('flights.search.searching') : t('flights.search.results', { count: total })}
              </p>
              <button onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden glass border border-white/10 px-3 py-1.5 rounded-lg text-sm text-slate-300 flex items-center gap-1">
                <Filter className="w-3 h-3" /> {t('flights.filters.title')}
              </button>
            </div>

            {isLoading ? (
              <div className="grid gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="glass border border-white/10 rounded-2xl p-5 animate-pulse">
                    <div className="h-4 bg-white/10 rounded mb-3 w-1/3" />
                    <div className="h-8 bg-white/10 rounded mb-2" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : flights.length === 0 ? (
              <div className="text-center py-20 animate-fade-in">
                <Plane className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{t('flights.search.noFlights')}</h3>
                <p className="text-slate-400">{t('flights.search.noFlightsDesc')}</p>
              </div>
            ) : (
              <div className="grid gap-4 animate-fade-in">
                {flights.map((f: any) => <FlightCard key={f.id} flight={f} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`flex items-center justify-center gap-2 mt-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                  className="glass border border-white/10 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 disabled:opacity-40 transition-colors">
                  <ChevronLeft className={`w-4 h-4 text-white ${isRtl ? 'rotate-180' : ''}`} />
                </button>
                <span className="text-sm text-slate-400">{paginationLabel[language]}</span>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
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

export default function FlightSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <FlightSearchContent />
    </Suspense>
  );
}
