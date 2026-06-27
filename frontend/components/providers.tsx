'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { LanguageProvider } from '@/context/LanguageContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000 } },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {children}
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: { background: '#1e293b', color: '#f8fafc', borderRadius: '12px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }} />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
