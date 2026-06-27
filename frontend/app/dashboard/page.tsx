'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user?.role === 'ADMIN') router.push('/dashboard/admin');
    else if (user?.role === 'HOTEL_MANAGER') router.push('/dashboard/hotel-manager');
    else if (user?.role === 'FLIGHT_MANAGER') router.push('/dashboard/flight-manager');
    else router.push('/reservations');
  }, [isAuthenticated, user]);

  return null;
}
