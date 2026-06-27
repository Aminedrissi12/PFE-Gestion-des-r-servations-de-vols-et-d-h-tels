'use client';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Plane, Hotel, Menu, X, Bell, User, LogOut, LayoutDashboard, ChevronDown, Home, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation, Language } from '@/context/LanguageContext';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const isDashboardOrAdminRoute = pathname ? (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) : false;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { language, setLanguage, t, isRtl } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);

  const langNames = {
    en: { name: 'English', flag: '🇬🇧' },
    fr: { name: 'Français', flag: '🇫🇷' },
    ar: { name: 'العربية', flag: '🇲🇦' }
  };

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  const queryClient = useQueryClient();

  const clearNotifications = useMutation({
    mutationFn: () => api.delete('/notifications'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('common.navbar.confirmClear'));
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed');
    }
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('common.navbar.markAllRead') + ' ! ✓');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed');
    }
  });

  const markSingleRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to mark notification as read');
    }
  });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    if (user.role === 'ADMIN') return '/dashboard/admin';
    if (user.role === 'HOTEL_MANAGER') return '/dashboard/hotel-manager';
    if (user.role === 'FLIGHT_MANAGER') return '/dashboard/flight-manager';
    return '/reservations';
  };

  const isAdminOrManager = mounted && isAuthenticated && user && ['ADMIN', 'HOTEL_MANAGER', 'FLIGHT_MANAGER'].includes(user.role) && isDashboardOrAdminRoute;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-dark shadow-2xl' : 'bg-transparent'
    }`}>
      <div className={isAdminOrManager ? 'w-full px-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
        <div className="flex items-center justify-between h-16 animate-fade-in">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-xl font-extrabold tracking-tight select-none">
              <span className="text-white">Flight</span>
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Hotel</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {(!mounted || !isAuthenticated || user?.role === 'CLIENT' || !isDashboardOrAdminRoute) && (
              <>
                <NavLink href="/" icon={<Home className="w-4 h-4" />} label={t('common.navbar.home')} />
                <NavLink href="/flights/search" icon={<Plane className="w-4 h-4" />} label={t('common.navbar.flights')} />
                <NavLink href="/hotels/search" icon={<Hotel className="w-4 h-4" />} label={t('common.navbar.hotels')} />
              </>
            )}
            {mounted && isAuthenticated && user && user.role === 'CLIENT' && (
              <NavLink href="/reservations" icon={<Calendar className="w-4 h-4" />} label={t('common.navbar.bookings')} />
            )}
          </div>

          {/* Actions & Language & Auth */}
          <div className="flex items-center gap-3">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setLangOpen(!langOpen); setProfileOpen(false); setNotifOpen(false); }}
                className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-all text-sm font-semibold"
                id="lang-btn"
              >
                <span>{langNames[language].flag}</span>
              </button>
              {langOpen && (
                <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-12 w-32 glass-dark rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 p-1`}>
                  {(['en', 'fr', 'ar'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLanguage(l);
                        setLangOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        language === l ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      } ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                    >
                      <span>{langNames[l].flag}</span>
                      <span>{langNames[l].name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {mounted && isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); setLangOpen(false); }}
                    className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors relative"
                    id="notif-btn"
                  >
                    <Bell className="w-4 h-4 text-slate-300" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-12 w-80 glass-dark rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50`}>
                      <div className="p-3 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">{t('common.navbar.notifications')}</h3>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={() => markAllRead.mutate()}
                              disabled={markAllRead.isPending}
                              id="mark-all-notifs-read"
                              className="text-[10px] text-blue-400 hover:text-blue-300 font-medium transition-colors disabled:opacity-50 mr-1"
                            >
                              {t('common.navbar.markAllRead')}
                            </button>
                          )}
                          {notifications && notifications.length > 0 && (
                            <button
                              onClick={() => {
                                if (confirm(t('common.navbar.confirmClear'))) {
                                  clearNotifications.mutate();
                                }
                              }}
                              disabled={clearNotifications.isPending}
                              id="clear-all-notifs"
                              className="text-[10px] text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50"
                            >
                              {t('common.navbar.clearAll')}
                            </button>
                          )}
                          <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-white">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {!notifications || notifications.length === 0 ? (
                          <p className="text-center text-slate-400 py-6 text-sm">{t('common.navbar.noNotifications')}</p>
                        ) : (
                          notifications.slice(0, 5).map((n: any) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (!n.isRead) {
                                  markSingleRead.mutate(n.id);
                                }
                              }}
                              className={`p-3 border-b border-white/5 text-left transition-colors ${
                                !n.isRead ? 'bg-blue-500/10 cursor-pointer hover:bg-blue-500/15' : 'bg-transparent'
                              } ${isRtl ? 'text-right' : 'text-left'}`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-sm font-medium text-white">{n.title}</p>
                                {!n.isRead && (
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); setLangOpen(false); }}
                    className="flex items-center gap-2 glass rounded-xl px-3 py-2 hover:bg-white/10 transition-colors"
                    id="profile-btn"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <span className="text-sm text-white font-medium hidden sm:block">{user.firstName}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {profileOpen && (
                    <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-12 w-52 glass-dark rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50`}>
                      <div className="p-3 border-b border-white/10 text-left">
                        <p className="text-sm font-semibold text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-400">{user.role}</p>
                      </div>
                      <div className="p-1">
                        <ProfileItem href="/profile" icon={<User className="w-4 h-4" />} label={t('common.navbar.profile')} onClick={() => setProfileOpen(false)} isRtl={isRtl} />
                        {user.role !== 'CLIENT' && (
                          <ProfileItem href={getDashboardLink()} icon={<LayoutDashboard className="w-4 h-4" />} label={t('common.navbar.dashboard')} onClick={() => setProfileOpen(false)} isRtl={isRtl} />
                        )}
                        {user.role === 'CLIENT' && (
                          <ProfileItem href="/reservations" icon={<Plane className="w-4 h-4" />} label={t('common.navbar.bookings')} onClick={() => setProfileOpen(false)} isRtl={isRtl} />
                        )}
                        <button
                          onClick={handleLogout}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm mt-1 ${isRtl ? 'flex-row-reverse' : ''}`}
                        >
                          <LogOut className="w-4 h-4" /> {t('common.navbar.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="text-sm text-slate-300 hover:text-white transition-colors px-3 py-2">
                  {t('common.navbar.login')}
                </Link>
                <Link href="/auth/register" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25">
                  {t('common.navbar.start')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden glass w-9 h-9 rounded-xl flex items-center justify-center"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden glass-dark rounded-2xl mb-2 p-3 border border-white/10 animate-slide-up space-y-1">
            {(!mounted || !isAuthenticated || user?.role === 'CLIENT' || !isDashboardOrAdminRoute) && (
              <>
                <Link href="/" className={`flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors ${isRtl ? 'flex-row-reverse text-right' : ''}`} onClick={() => setMobileOpen(false)}>
                  <Home className="w-4 h-4" /> {t('common.navbar.home')}
                </Link>
                <Link href="/flights/search" className={`flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors ${isRtl ? 'flex-row-reverse text-right' : ''}`} onClick={() => setMobileOpen(false)}>
                  <Plane className="w-4 h-4" /> {t('common.navbar.flights')}
                </Link>
                <Link href="/hotels/search" className={`flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors ${isRtl ? 'flex-row-reverse text-right' : ''}`} onClick={() => setMobileOpen(false)}>
                  <Hotel className="w-4 h-4" /> {t('common.navbar.hotels')}
                </Link>
              </>
            )}
            {mounted && isAuthenticated && user && user.role === 'CLIENT' && (
              <Link href="/reservations" className={`flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors ${isRtl ? 'flex-row-reverse text-right' : ''}`} onClick={() => setMobileOpen(false)}>
                <Calendar className="w-4 h-4" /> {t('common.navbar.bookings')}
              </Link>
            )}
            <div className="h-px bg-white/10 my-2" />
            <div className="flex gap-2 p-1">
              {(['en', 'fr', 'ar'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLanguage(l);
                    setMobileOpen(false);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                    language === l ? 'bg-blue-600 text-white' : 'glass text-slate-400'
                  }`}
                >
                  {langNames[l].flag} {langNames[l].name.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium">
      {icon} {label}
    </Link>
  );
}

function ProfileItem({ href, icon, label, onClick, isRtl }: { href: string; icon: React.ReactNode; label: string; onClick: () => void; isRtl: boolean }) {
  return (
    <Link href={href} onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-sm ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
      {icon} {label}
    </Link>
  );
}
