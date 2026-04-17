import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../contexts/ThemeContext';
import MainLayout from '../components/Layout/MainLayout';
import '../styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isPublicPage = ['/login', '/', '/404', '/_error'].includes(router.pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {isPublicPage ? (
          <Component {...pageProps} />
        ) : (
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
