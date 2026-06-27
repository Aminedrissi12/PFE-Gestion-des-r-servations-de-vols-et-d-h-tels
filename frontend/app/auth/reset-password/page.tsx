'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Lock, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error('Reset token is missing or invalid.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold text-red-400 mb-2">Invalid Reset Link</h2>
        <p className="text-slate-400 text-sm mb-6">The password reset token is missing. Please request a new link.</p>
        <Link href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Request new link
        </Link>
      </div>
    );
  }

  return (
    <div>
      {success ? (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
          <p className="text-slate-400 text-sm mb-6">Your password has been changed successfully. You can now log in.</p>
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Set New Password</h1>
            <p className="text-slate-400 text-sm">Please choose a secure password for your account</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('password')}
                  id="reset-password-input"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                />
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('confirmPassword')}
                  id="reset-confirm-input"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              id="reset-submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Reset Password
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
