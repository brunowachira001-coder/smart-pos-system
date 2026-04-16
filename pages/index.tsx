import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redirect to login page (served from public/index.html)
    window.location.href = '/login';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Smart POS System</h1>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
