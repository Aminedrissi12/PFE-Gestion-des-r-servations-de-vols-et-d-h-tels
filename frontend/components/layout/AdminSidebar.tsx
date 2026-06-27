'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Plane, Hotel, Landmark, Calendar } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export function AdminSidebar() {
  const pathname = usePathname();
  const { t, language, isRtl } = useTranslation();

  const consoleLabel = {
    fr: "Console d'Administration",
    en: "Administration Console",
    ar: "لوحة تحكم المسؤول"
  };

  const links = [
    { href: '/dashboard/admin', label: t('common.navbar.dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/admin/users', label: language === 'ar' ? 'المستخدمين' : language === 'en' ? 'Users' : 'Utilisateurs', icon: <Users className="w-4 h-4" /> },
    { href: '/admin/flights', label: t('common.navbar.flights'), icon: <Plane className="w-4 h-4" /> },
    { href: '/admin/hotels', label: t('common.navbar.hotels'), icon: <Hotel className="w-4 h-4" /> },
    { href: '/admin/airlines', label: language === 'ar' ? 'شركات الطيران' : language === 'en' ? 'Airlines' : 'Compagnies Aériennes', icon: <Landmark className="w-4 h-4" /> },
    { href: '/admin/bookings/flights', label: language === 'ar' ? 'حجوزات الرحلات' : language === 'en' ? 'Flight Bookings' : 'Réservations de Vols', icon: <Calendar className="w-4 h-4" /> },
    { href: '/admin/bookings/hotels', label: language === 'ar' ? 'حجوزات الفنادق' : language === 'en' ? 'Hotel Bookings' : "Réservations d'Hôtels", icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <aside className={`w-64 bg-slate-900/60 backdrop-blur-md border-r border-white/10 p-6 flex flex-col gap-2 shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-30 ${isRtl ? 'border-l border-r-0 text-right' : 'border-r text-left'}`}>
      <div className={`text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-3 ${isRtl ? 'text-right' : 'text-left'}`}>
        {consoleLabel[language]}
      </div>
      <nav className="flex-1 flex flex-col gap-1.5">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.08)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              } ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {link.icon}
              </div>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
