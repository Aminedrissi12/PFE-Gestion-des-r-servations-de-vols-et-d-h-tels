'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/context/LanguageContext';
import {
  Users, Search, Plus, Edit2, Trash2, Shield, ShieldOff, ChevronLeft, ChevronRight,
  Loader2, X, CheckCircle, User
} from 'lucide-react';

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-500/20 text-red-400',
  HOTEL_MANAGER: 'bg-emerald-500/20 text-emerald-400',
  FLIGHT_MANAGER: 'bg-blue-500/20 text-blue-400',
  CLIENT: 'bg-slate-500/20 text-slate-400',
};

export default function AdminUsersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, language, isRtl } = useTranslation();

  const roleLabels: Record<string, string> = {
    ADMIN: t('common.roles.ADMIN'),
    HOTEL_MANAGER: t('common.roles.HOTEL_MANAGER'),
    FLIGHT_MANAGER: t('common.roles.FLIGHT_MANAGER'),
    CLIENT: t('common.roles.CLIENT'),
  };

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editUser, setEditUser] = useState<any>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '', role: 'CLIENT', isBlocked: false,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'ADMIN')) router.push('/');
  }, [mounted, isAuthenticated, user]);

  const queryParams = new URLSearchParams({ search, role: roleFilter, page: String(page), limit: '15' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', queryParams.toString()],
    queryFn: () => api.get(`/users?${queryParams}`).then(r => r.data),
    enabled: isAuthenticated && user?.role === 'ADMIN',
  });

  const createUser = useMutation({
    mutationFn: (data: any) => api.post('/users', data),
    onSuccess: () => { 
      toast.success(language === 'ar' ? 'تم إنشاء المستخدم بنجاح!' : 'Utilisateur créé'); 
      setModal(null); 
      refetch(); 
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }: any) => api.put(`/users/${id}`, data),
    onSuccess: () => { 
      toast.success(language === 'ar' ? 'تم تحديث المستخدم بنجaps!' : 'Utilisateur mis à jour'); 
      setModal(null); 
      refetch(); 
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => { 
      toast.success(language === 'ar' ? 'تم حذف المستخدم!' : 'Utilisateur supprimé'); 
      refetch(); 
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const toggleBlock = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/toggle-block`),
    onSuccess: () => { 
      toast.success(language === 'ar' ? 'تم تعديل حالة الحظر!' : "Statut de l'utilisateur mis à jour"); 
      refetch(); 
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal === 'create') createUser.mutate(form);
    else if (modal === 'edit' && editUser) updateUser.mutate({ id: editUser.id, data: form });
  };

  const openEdit = (u: any) => {
    setEditUser(u);
    setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, password: '', phone: u.phone || '', role: u.role, isBlocked: u.isBlocked });
    setModal('edit');
  };

  const openCreate = () => {
    setForm({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'CLIENT', isBlocked: false });
    setModal('create');
  };

  const users = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 15);

  const pageTitle = {
    fr: "Gestion des Utilisateurs",
    en: "User Management",
    ar: "إدارة المستخدمين"
  };

  const totalLabel = {
    fr: `${total} utilisateurs au total`,
    en: `${total} total users`,
    ar: `إجمالي المستخدمين: ${total}`
  };

  const addUserLabel = {
    fr: "Ajouter un utilisateur",
    en: "Add User",
    ar: "إضافة مستخدم جديد"
  };

  const searchPlaceholder = {
    fr: "Rechercher par nom ou e-mail...",
    en: "Search by name or email...",
    ar: "البحث بالاسم أو البريد الإلكتروني..."
  };

  const allRolesLabel = {
    fr: "Tous les rôles",
    en: "All Roles",
    ar: "جميع الصلاحيات"
  };

  const tableHeaders = [
    language === 'ar' ? 'المستخدم' : language === 'en' ? 'User' : 'Utilisateur',
    language === 'ar' ? 'الصلاحية' : language === 'en' ? 'Role' : 'Rôle',
    language === 'ar' ? 'الحالة' : language === 'en' ? 'Status' : 'Statut',
    language === 'ar' ? 'تاريخ التسجيل' : language === 'en' ? 'Registered' : 'Inscription',
    t('common.actions')
  ];

  const emptyUsersLabel = {
    fr: "Aucun utilisateur trouvé",
    en: "No users found",
    ar: "لم يتم العثور على مستخدمين"
  };

  const paginationLabel = {
    fr: `Page ${page} sur ${totalPages}`,
    en: `Page ${page} of ${totalPages}`,
    ar: `صفحة ${page} من ${totalPages}`
  };

  const modalTitle = {
    create: language === 'ar' ? 'إضافة مستخدم جديد' : language === 'en' ? 'Add New User' : 'Ajouter un nouvel utilisateur',
    edit: language === 'ar' ? 'تعديل بيانات المستخدم' : language === 'en' ? 'Edit User' : "Modifier l'utilisateur"
  };

  const passFieldLabel = {
    create: t('auth.login.password'),
    edit: language === 'ar' ? 'كلمة مرور جديدة (اتركه فارغاً للاحتفاظ بالحالية)' : language === 'en' ? 'New password (leave blank to keep current)' : "Nouveau mot de passe (laisser vide pour conserver l'actuel)"
  };

  const blockUserLabel = {
    fr: "Bloquer l'utilisateur",
    en: "Block this user",
    ar: "حظر هذا المستخدم"
  };

  const createSubmitBtn = {
    create: language === 'ar' ? 'إنشاء حساب جديد' : language === 'en' ? 'Create User' : "Créer l'utilisateur",
    edit: t('profile.saveBtn')
  };

  const deleteConfirmMsg = {
    fr: "Supprimer l'utilisateur ?",
    en: "Delete this user?",
    ar: "هل تريد حذف هذا المستخدم؟"
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className={`flex flex-1 pt-16 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <AdminSidebar />
        <main className="flex-1 px-8 py-8 overflow-y-auto">
          <div className={`flex items-center justify-between mb-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <h1 className={`text-3xl font-bold text-white flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Users className="w-7 h-7 text-blue-400" /> {pageTitle[language]}
              </h1>
              <p className="text-slate-400 mt-1">{totalLabel[language]}</p>
            </div>
            <button onClick={openCreate} id="create-user-btn"
              className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Plus className="w-4 h-4" /> {addUserLabel[language]}
            </button>
          </div>

          {/* Filters */}
          <div className={`glass border border-white/10 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className="relative flex-1 min-w-48">
              <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                id="user-search" placeholder={searchPlaceholder[language]}
                className={`w-full bg-white/5 border border-white/10 rounded-xl py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
                  isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                }`} />
            </div>
            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
              id="user-role-filter"
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none bg-slate-900">
              <option value="" className="bg-slate-850">{allRolesLabel[language]}</option>
              {['CLIENT', 'HOTEL_MANAGER', 'FLIGHT_MANAGER', 'ADMIN'].map(r => (
                <option key={r} value={r} className="bg-slate-850">{roleLabels[r]}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="glass border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b border-white/10 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  {tableHeaders.map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-xs text-slate-400 font-medium uppercase tracking-wide ${
                      isRtl ? 'text-right' : 'text-left'
                    }`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-12"><Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto" /></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className={`text-center py-12 text-slate-400 ${isRtl ? 'text-right' : 'text-left'}`}>{emptyUsersLabel[language]}</td></tr>
                ) : (
                  users.map((u: any) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div className={isRtl ? 'text-right' : 'text-left'}>
                            <p className="font-medium text-white">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColors[u.role]}`}>{roleLabels[u.role] || u.role}</span>
                      </td>
                      <td className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                        {u.isBlocked ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                            {language === 'ar' ? 'محظور' : language === 'en' ? 'Blocked' : 'Bloqué'}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                            {language === 'ar' ? 'نشط' : language === 'en' ? 'Active' : 'Actif'}
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-xs text-slate-400 ${isRtl ? 'text-right' : 'text-left'}`}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <button onClick={() => openEdit(u)} id={`edit-user-${u.id}`}
                            className="w-7 h-7 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-blue-400 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => toggleBlock.mutate(u.id)} id={`block-user-${u.id}`}
                            className="w-7 h-7 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-amber-400 transition-colors"
                            title={u.isBlocked ? (language === 'ar' ? 'إلغاء الحظر' : 'Unblock') : (language === 'ar' ? 'حظر' : 'Block')}>
                            {u.isBlocked ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => { if (confirm(deleteConfirmMsg[language])) deleteUser.mutate(u.id); }}
                            id={`delete-user-${u.id}`}
                            className="w-7 h-7 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`flex items-center justify-center gap-2 mt-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
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
        </main>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="glass-dark border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className={`flex items-center justify-between mb-5 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-lg font-bold text-white">{modalTitle[modal]}</h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="text-xs text-slate-400 block mb-1">{t('profile.firstName')}</label>
                  <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                    id="modal-firstname" className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none ${isRtl ? 'text-right' : 'text-left'}`} />
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="text-xs text-slate-400 block mb-1">{t('profile.lastName')}</label>
                  <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                    id="modal-lastname" className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none ${isRtl ? 'text-right' : 'text-left'}`} />
                </div>
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs text-slate-400 block mb-1">{t('auth.login.email')}</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  id="modal-email" className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none ${isRtl ? 'text-right' : 'text-left'}`} />
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs text-slate-400 block mb-1">
                  {passFieldLabel[modal]}
                </label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  id="modal-password" placeholder={modal === 'create' ? '' : '••••••••'}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none ${isRtl ? 'text-right' : 'text-left'}`} />
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs text-slate-400 block mb-1">{language === 'ar' ? 'الصلاحية' : 'Role'}</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  id="modal-role" className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none bg-slate-900`}>
                  {['CLIENT', 'HOTEL_MANAGER', 'FLIGHT_MANAGER', 'ADMIN'].map(r => (
                    <option key={r} value={r} className="bg-slate-850">{roleLabels[r]}</option>
                  ))}
                </select>
              </div>
              {modal === 'edit' && (
                <label className={`flex items-center gap-2 cursor-pointer ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <input type="checkbox" checked={form.isBlocked} onChange={e => setForm({ ...form, isBlocked: e.target.checked })}
                    id="modal-blocked" className="rounded" />
                  <span className="text-sm text-slate-300">{blockUserLabel[language]}</span>
                </label>
              )}
              <div className={`flex gap-2 pt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button type="button" onClick={() => setModal(null)} className="flex-1 glass border border-white/10 text-white py-2.5 rounded-xl text-sm">{t('common.cancel')}</button>
                <button type="submit" id="modal-submit"
                  disabled={createUser.isPending || updateUser.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                  {(createUser.isPending || updateUser.isPending) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {createSubmitBtn[modal]}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
