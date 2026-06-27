'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'HOTEL_MANAGER' | 'FLIGHT_MANAGER' | 'ADMIN';
  avatarUrl?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const useAuthStoreRaw = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      },
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

const getInitialState = () => {
  const defaultState = { token: null, user: null, isAuthenticated: false };
  if (typeof window === 'undefined') {
    return defaultState;
  }
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.state) {
        return {
          token: parsed.state.token || null,
          user: parsed.state.user || null,
          isAuthenticated: parsed.state.isAuthenticated || false,
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse auth-storage', e);
  }
  return defaultState;
};

export function useAuthStore<T = AuthState>(selector?: (state: AuthState) => T): T {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rawState = useAuthStoreRaw();
  const clientInitial = getInitialState();
  const safeState: AuthState = {
    ...rawState,
    isAuthenticated: mounted ? rawState.isAuthenticated : clientInitial.isAuthenticated,
    user: mounted ? rawState.user : clientInitial.user,
    token: mounted ? rawState.token : clientInitial.token,
  };

  if (selector) {
    return selector(safeState);
  }

  return safeState as unknown as T;
}
