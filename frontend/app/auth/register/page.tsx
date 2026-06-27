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
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t, language, isRtl } = useTranslation();

  const schema = z.object({
    firstName: z.string().min(2, language === 'ar' ? 'الاسم الأول مطلوب' : language === 'en' ? 'First name is required' : 'Le prénom est requis'),
    lastName: z.string().min(2, language === 'ar' ? 'الاسم الأخير مطلوب' : language === 'en' ? 'Last name is required' : 'Le nom de famille est requis'),
    email: z.string().email(language === 'ar' ? 'البريد الإلكتروني غير صحيح' : language === 'en' ? 'Invalid email address' : 'Adresse e-mail invalide'),
    phone: z.string().optional(),
    password: z.string().min(6, language === 'ar' ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' : language === 'en' ? 'Password must be at least 6 characters' : 'Le mot de passe doit comporter au moins 6 caractères'),
    confirmPassword: z.string(),
    role: z.enum(['CLIENT', 'HOTEL_MANAGER', 'FLIGHT_MANAGER']),
  }).refine((d) => d.password === d.confirmPassword, {
    message: language === 'ar' ? 'كلمتا المرور غير متطابقتين' : language === 'en' ? 'Passwords do not match' : 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CLIENT' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = data;
      const res = await api.post('/auth/register', payload);
      const { token, user } = res.data;
      setAuth(token, user);
      localStorage.setItem('token', token);
      
      const welcomeMsg = language === 'ar' 
        ? `تم إنشاء الحساب بنجاح! مرحباً بك، ${user.firstName} ! 🎉` 
        : language === 'en'
        ? `Account created successfully! Welcome, ${user.firstName}! 🎉`
        : `Compte créé ! Bienvenue, ${user.firstName} ! 🎉`;

      toast.success(welcomeMsg);
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('auth.register.error'));
    } finally {
      setLoading(false);
    }
  };

  const accountTypeLabel = {
    fr: "Type de compte",
    en: "Account Type",
    ar: "نوع الحساب"
  };

  const roleLabels = {
    CLIENT: language === 'ar' ? 'مسافر (عميل)' : language === 'en' ? 'Traveler (Client)' : 'Voyageur (Client)',
    HOTEL_MANAGER: language === 'ar' ? 'مسؤول فندق' : language === 'en' ? 'Hotel Manager' : "Responsable d'Hôtel",
    FLIGHT_MANAGER: language === 'ar' ? 'مسؤول رحلات' : language === 'en' ? 'Flight Manager' : 'Responsable de Vols',
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <Link href="/" className="flex items-center justify-center group mb-8">
          <span className="text-3xl font-extrabold tracking-tight select-none">
            <span className="text-white">Flight</span>
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Hotel</span>
          </span>
        </Link>

        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/10">
          <div className={`mb-8 ${isRtl ? 'text-right' : 'text-left'}`}>
            <h1 className="text-2xl font-bold text-white mb-1">{t('auth.register.title')}</h1>
            <p className="text-slate-400 text-sm">{t('auth.register.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t('auth.register.firstName')} icon={<User className="w-4 h-4" />} error={errors.firstName?.message} isRtl={isRtl}>
                <input {...register('firstName')} id="reg-firstname" placeholder="Jean" className="form-input" />
              </FormField>
              <FormField label={t('auth.register.lastName')} icon={<User className="w-4 h-4" />} error={errors.lastName?.message} isRtl={isRtl}>
                <input {...register('lastName')} id="reg-lastname" placeholder="Dupont" className="form-input" />
              </FormField>
            </div>

            <FormField label={t('auth.register.email')} icon={<Mail className="w-4 h-4" />} error={errors.email?.message} isRtl={isRtl}>
              <input {...register('email')} id="reg-email" type="email" placeholder="vous@exemple.com" className="form-input" />
            </FormField>

            <FormField label={t('auth.register.phone')} icon={<Phone className="w-4 h-4" />} isRtl={isRtl}>
              <input {...register('phone')} id="reg-phone" placeholder="+212 6XX XXX XXX" className="form-input" />
            </FormField>

            <div className={isRtl ? 'text-right' : 'text-left'}>
              <label className="text-sm text-slate-400 block mb-1.5">{accountTypeLabel[language]}</label>
              <select {...register('role')} id="reg-role" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm">
                <option value="CLIENT" className="bg-slate-800">{roleLabels.CLIENT}</option>
                <option value="HOTEL_MANAGER" className="bg-slate-800">{roleLabels.HOTEL_MANAGER}</option>
                <option value="FLIGHT_MANAGER" className="bg-slate-800">{roleLabels.FLIGHT_MANAGER}</option>
              </select>
            </div>

            <FormField label={t('auth.register.password')} icon={<Lock className="w-4 h-4" />} error={errors.password?.message} isRtl={isRtl} suffix={
              <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }>
              <input {...register('password')} id="reg-password" type={showPass ? 'text' : 'password'} placeholder="••••••••" className="form-input" />
            </FormField>

            <FormField label={t('auth.register.confirmPassword')} icon={<Lock className="w-4 h-4" />} error={errors.confirmPassword?.message} isRtl={isRtl}>
              <input {...register('confirmPassword')} id="reg-confirm-password" type="password" placeholder="••••••••" className="form-input" />
            </FormField>

            <button
              type="submit"
              id="register-submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t('common.submitting') : t('auth.register.button')}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            {t('auth.register.haveAccount')}{' '}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">{t('auth.register.signIn')}</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: ${isRtl ? '12px 40px 12px 16px' : '12px 16px 12px 40px'};
          text-align: ${isRtl ? 'right' : 'left'};
          color: white;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }
        .form-input:focus { 
          box-shadow: 0 0 0 2px rgba(59,130,246,0.5);
          border-color: rgba(59,130,246,0.5);
        }
        .form-input::placeholder { color: rgb(100, 116, 139); }
      `}</style>
    </div>
  );
}

function FormField({ label, icon, error, suffix, children, isRtl }: {
  label: string; icon: React.ReactNode; error?: string; suffix?: React.ReactNode; children: React.ReactNode; isRtl: boolean;
}) {
  return (
    <div className={isRtl ? 'text-right' : 'text-left'}>
      <label className="text-sm text-slate-400 block mb-1.5">{label}</label>
      <div className="relative">
        <div className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-500`}>{icon}</div>
        {children}
        {suffix && <div className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`}>{suffix}</div>}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
