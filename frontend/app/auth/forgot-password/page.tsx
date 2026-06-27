'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

const schema = z.object({ email: z.string().email('Adresse e-mail invalide') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
    } catch { 
      toast.error('Une erreur est survenue'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center justify-center group mb-8">
          <span className="text-3xl font-extrabold tracking-tight select-none">
            <span className="text-white">Flight</span>
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Hotel</span>
          </span>
        </Link>
        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/10">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">E-mail envoyé !</h2>
              <p className="text-slate-400 text-sm mb-6">Si un compte existe, vous recevrez un lien de réinitialisation sous peu.</p>
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-1">Mot de passe oublié</h1>
                <p className="text-slate-400 text-sm">Entrez votre e-mail et nous vous enverrons un lien de réinitialisation</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1.5">Adresse e-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input {...register('email')} id="forgot-email" type="email" placeholder="vous@exemple.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm" />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <button type="submit" id="forgot-submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Envoi du lien...' : 'Envoyer le lien'}
                </button>
              </form>
              <p className="text-center text-slate-400 text-sm mt-6">
                <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
