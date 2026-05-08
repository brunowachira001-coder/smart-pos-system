import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../contexts/ThemeContext';
import MainLayout from '../components/Layout/MainLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import { initializeTheme } from '../lib/themes';
import '../styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  const isPublicPage = ['/login', '/landing', '/', '/404', '/_error'].includes(router.pathname);
  const isAdminPage = router.pathname.startsWith('/admin') || router.pathname.startsWith('/s/');
  const isMobileShop = router.pathname.startsWith('/m/');
  const isDesktopShop = router.pathname.startsWith('/shop/');

  useEffect(() => {
    // Mark as client-side to prevent hydration mismatch
    setIsClient(true);
    
    // Initialize theme after mount
    initializeTheme();
    
    // Setup fetch interceptor for authentication
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      const url = typeof input === 'string' ? input : (input as Request).url;
      if (url.startsWith('/api/')) {
        const token = localStorage.getItem('token') || '';
        init = init || {};
        init.headers = {
          ...init.headers,
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
      }
      return originalFetch.call(this, input, init);
    };
  }, []);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {isPublicPage || isAdminPage || isMobileShop || isDesktopShop ? (
            <Component {...pageProps} />
          ) : (
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
