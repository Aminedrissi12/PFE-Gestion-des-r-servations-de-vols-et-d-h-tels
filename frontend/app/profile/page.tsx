'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Edit2, Save, Lock, Loader2, Camera } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', avatarUrl: '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passSection, setPassSection] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t, language, isRtl } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/auth/login');
    if (mounted && user) setForm({ firstName: user.firstName, lastName: user.lastName, phone: '', avatarUrl: user.avatarUrl || '' });
  }, [mounted, isAuthenticated, user]);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/auth/me').then(r => r.data),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (profile) setForm({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone || '', avatarUrl: profile.avatarUrl || '' });
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: (data: any) => api.put('/auth/profile', data),
    onSuccess: (res) => {
      updateUser(res.data);
      toast.success(t('profile.success'));
      setEditing(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || t('profile.error')),
  });

  const changePassword = useMutation({
    mutationFn: (data: any) => api.put('/auth/change-password', data),
    onSuccess: () => {
      const successMsg = language === 'ar' 
        ? 'تم تغيير كلمة المرور بنجاح!' 
        : language === 'en'
        ? 'Password changed successfully!'
        : 'Mot de passe modifié !';
      toast.success(successMsg);
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPassSection(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const handleSave = () => updateProfile.mutate(form);
  const handleChangePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) { 
      const mismatchMsg = language === 'ar'
        ? 'كلمتا المرور غير متطابقتين'
        : language === 'en'
        ? 'Passwords do not match'
        : 'Les mots de passe ne correspondent pas';
      toast.error(mismatchMsg); 
      return; 
    }
    changePassword.mutate({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'from-red-500 to-orange-500',
    HOTEL_MANAGER: 'from-emerald-500 to-teal-500',
    FLIGHT_MANAGER: 'from-blue-500 to-cyan-500',
    CLIENT: 'from-purple-500 to-indigo-500',
  };

  const roleLabels = {
    ADMIN: t('common.roles.ADMIN'),
    HOTEL_MANAGER: t('common.roles.HOTEL_MANAGER'),
    FLIGHT_MANAGER: t('common.roles.FLIGHT_MANAGER'),
    CLIENT: t('common.roles.CLIENT'),
  };

  const avatarUrlLabel = {
    fr: "URL de l'Avatar",
    en: "Avatar URL",
    ar: "رابط الصورة الرمزية"
  };

  const changePassLabel = {
    fr: "Modifier le mot de passe",
    en: "Change Password",
    ar: "تغيير كلمة المرور"
  };

  const updatePassBtnLabel = {
    fr: "Mettre à jour le mot de passe",
    en: "Update Password",
    ar: "تحديث كلمة المرور"
  };

  const passFieldsLabels = [
    { label: language === 'ar' ? 'كلمة المرور الحالية' : language === 'en' ? 'Current Password' : 'Mot de passe actuel', key: 'currentPassword', id: 'current-pass' },
    { label: language === 'ar' ? 'كلمة المرور الجديدة' : language === 'en' ? 'New Password' : 'Nouveau mot de passe', key: 'newPassword', id: 'new-pass' },
    { label: language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : language === 'en' ? 'Confirm New Password' : 'Confirmer le nouveau mot de passe', key: 'confirmPassword', id: 'confirm-pass' },
  ];

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
      <div className="pt-20 max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className={`text-3xl font-bold text-white mb-8 ${isRtl ? 'text-right' : 'text-left'}`}>{t('profile.title')}</h1>

        <div className="glass border border-white/10 rounded-2xl p-6 mb-6">
          {/* Avatar & Role */}
          <div className={`flex items-center gap-5 mb-6 pb-6 border-b border-white/10 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className="relative">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover" />
              ) : (
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${roleColors[user?.role || 'CLIENT']} flex items-center justify-center text-white text-2xl font-extrabold`}>
                  {user?.firstName[0]}{user?.lastName[0]}
                </div>
              )}
            </div>
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <h2 className="text-xl font-bold text-white">{profile?.firstName} {profile?.lastName}</h2>
              <p className="text-slate-400 text-sm">{profile?.email}</p>
              <span className={`inline-block mt-1 text-xs px-3 py-1 rounded-full bg-gradient-to-r ${roleColors[user?.role || 'CLIENT']} text-white font-medium`}>
                {roleLabels[user?.role || 'CLIENT'] || user?.role}
              </span>
            </div>
            <button onClick={() => setEditing(!editing)} id="edit-profile-btn"
              className={`${isRtl ? 'mr-auto' : 'ml-auto'} glass border border-white/10 px-4 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2`}>
              <Edit2 className="w-3.5 h-3.5" /> {editing ? t('common.cancel') : t('profile.editBtn')}
            </button>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('profile.firstName')} icon={<User className="w-4 h-4" />} isRtl={isRtl}>
                <input value={form.firstName} disabled={!editing}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  id="profile-firstname"
                  className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none ${isRtl ? 'text-right' : 'text-left'} ${editing ? 'focus:ring-1 focus:ring-blue-500/50' : 'opacity-70'}`} />
              </Field>
              <Field label={t('profile.lastName')} icon={<User className="w-4 h-4" />} isRtl={isRtl}>
                <input value={form.lastName} disabled={!editing}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  id="profile-lastname"
                  className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none ${isRtl ? 'text-right' : 'text-left'} ${editing ? 'focus:ring-1 focus:ring-blue-500/50' : 'opacity-70'}`} />
              </Field>
            </div>
            <Field label={t('profile.email')} icon={<Mail className="w-4 h-4" />} isRtl={isRtl}>
              <input value={profile?.email || ''} disabled
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-400 text-sm opacity-60 cursor-not-allowed ${isRtl ? 'text-right' : 'text-left'}`} />
            </Field>
            <Field label={t('profile.phone')} icon={<Phone className="w-4 h-4" />} isRtl={isRtl}>
              <input value={form.phone} disabled={!editing}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                id="profile-phone" placeholder="+212 6XX XXX XXX"
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none ${isRtl ? 'text-right' : 'text-left'} ${editing ? 'focus:ring-1 focus:ring-blue-500/50' : 'opacity-70'}`} />
            </Field>
            {editing && (
              <Field label={avatarUrlLabel[language]} icon={<Camera className="w-4 h-4" />} isRtl={isRtl}>
                <input value={form.avatarUrl} onChange={e => setForm({ ...form, avatarUrl: e.target.value })}
                  id="profile-avatar" placeholder="https://..."
                  className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${isRtl ? 'text-right' : 'text-left'}`} />
              </Field>
            )}

            {editing && (
              <button onClick={handleSave} disabled={updateProfile.isPending} id="save-profile-btn"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 mt-2">
                {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('profile.saveBtn')}
              </button>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="glass border border-white/10 rounded-2xl p-6">
          <button onClick={() => setPassSection(!passSection)} className={`flex items-center gap-2 text-white font-semibold w-full ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Lock className="w-4 h-4 text-blue-400" /> {changePassLabel[language]}
            <span className={`${isRtl ? 'mr-auto' : 'ml-auto'} text-slate-400 text-sm`}>{passSection ? t('common.cancel') : t('profile.editBtn')}</span>
          </button>

          {passSection && (
            <form onSubmit={handleChangePass} className="space-y-3 mt-4">
              {passFieldsLabels.map(f => (
                <div key={f.key} className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="text-xs text-slate-400 block mb-1">{f.label}</label>
                  <input type="password" id={f.id}
                    value={(passForm as any)[f.key]}
                    onChange={e => setPassForm({ ...passForm, [f.key]: e.target.value })}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${isRtl ? 'text-right' : 'text-left'}`} />
                </div>
              ))}
              <button type="submit" id="change-pass-btn" disabled={changePassword.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
                {changePassword.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {updatePassBtnLabel[language]}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children, isRtl }: any) {
  return (
    <div className={isRtl ? 'text-right' : 'text-left'}>
      <label className={`text-xs text-slate-400 flex items-center gap-1 mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>{icon} {label}</label>
      {children}
    </div>
  );
}
