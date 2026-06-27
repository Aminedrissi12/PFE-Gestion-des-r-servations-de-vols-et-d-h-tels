'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t, language, isRtl } = useTranslation();

  const schema = z.object({
    email: z.string().email(
      language === 'ar'
        ? 'البريد الإلكتروني غير صحيح'
        : language === 'en'
        ? 'Invalid email address'
        : 'Adresse e-mail invalide'
    ),
    password: z.string().min(
      6,
      language === 'ar'
        ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل'
        : language === 'en'
        ? 'Password must be at least 6 characters'
        : 'Le mot de passe doit comporter au moins 6 caractères'
    ),
  });

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      const { token, user } = res.data;
      setAuth(token, user);
      localStorage.setItem('token', token);
      
      const welcomeMsg = language === 'ar' 
        ? `مرحباً بعودتك، ${user.firstName} ! ✈️` 
        : language === 'en'
        ? `Welcome back, ${user.firstName}! ✈️`
        : `Ravi de vous revoir, ${user.firstName} ! ✈️`;

      toast.success(welcomeMsg);
      if (user.role === 'ADMIN') router.push('/dashboard/admin');
      else if (user.role === 'HOTEL_MANAGER') router.push('/dashboard/hotel-manager');
      else if (user.role === 'FLIGHT_MANAGER') router.push('/dashboard/flight-manager');
      else router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('auth.login.error'));
    } finally {
      setLoading(false);
    }
  };

  const demoAccountsLabel = {
    fr: "Comptes démo :",
    en: "Demo accounts:",
    ar: "حسابات تجريبية:"
  };
  const demoAdminLabel = {
    fr: "Admin : admin@flighthotel.com / admin123",
    en: "Admin: admin@flighthotel.com / admin123",
    ar: "المدير: admin@flighthotel.com / admin123"
  };
  const demoClientLabel = {
    fr: "Client : client@flighthotel.com / client123",
    en: "Client: client@flighthotel.com / client123",
    ar: "العميل: client@flighthotel.com / client123"
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center group mb-8">
          <span className="text-3xl font-extrabold tracking-tight select-none">
            <span className="text-white">Flight</span>
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Hotel</span>
          </span>
        </Link>

        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/10">
          <div className={`mb-8 ${isRtl ? 'text-right' : 'text-left'}`}>
            <h1 className="text-2xl font-bold text-white mb-1">{t('auth.login.title')}</h1>
            <p className="text-slate-400 text-sm">{t('auth.login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className={`${isRtl ? 'text-right' : 'text-left'}`}>
              <label className="text-sm text-slate-400 block mb-1.5">{t('auth.login.email')}</label>
              <div className="relative">
                <Mail className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
                <input
                  {...register('email')}
                  id="login-email"
                  type="email"
                  placeholder="vous@example.com"
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all ${
                    isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className={`${isRtl ? 'text-right' : 'text-left'}`}>
              <label className="text-sm text-slate-400 block mb-1.5">{t('auth.login.password')}</label>
              <div className="relative">
                <Lock className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
                <input
                  {...register('password')}
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all ${
                    isRtl ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10 text-left'
                  }`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300`}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className={`flex items-center ${isRtl ? 'justify-start' : 'justify-end'}`}>
              <Link href="/auth/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                {t('auth.login.forgotPass')}
              </Link>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/30 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? t('common.submitting') : t('auth.login.button')}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            {t('auth.login.noAccount')}{' '}
            <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              {t('auth.login.signUp')}
            </Link>
          </p>

          {/* Test accounts hint */}
          <div className={`mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl ${isRtl ? 'text-right' : 'text-left'}`}>
            <p className="text-xs text-blue-300 font-medium mb-1">{demoAccountsLabel[language]}</p>
            <p className="text-xs text-slate-400">{demoAdminLabel[language]}</p>
            <p className="text-xs text-slate-400">{demoClientLabel[language]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
