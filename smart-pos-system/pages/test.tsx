import { useEffect, useState } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testEndpoints = async () => {
      try {
        // Test health endpoint
        const healthRes = await fetch('/api/health');
        const healthData = await healthRes.json();
        
        setStatus({
          health: {
            status: healthRes.status,
            data: healthData,
          },
          environment: {
            nodeEnv: process.env.NODE_ENV,
            apiUrl: process.env.NEXT_PUBLIC_API_URL,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testEndpoints();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-6">Smart POS System - Deployment Test</h1>
        
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Testing deployment...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <h2 className="text-red-800 font-bold mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {status && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h2 className="text-green-800 font-bold mb-2">✓ Deployment Status</h2>
              <p className="text-green-700">Application is running on Vercel</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h2 className="text-blue-800 font-bold mb-2">Health Check</h2>
              <pre className="bg-white p-3 rounded text-sm overflow-auto">
                {JSON.stringify(status.health, null, 2)}
              </pre>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded p-4">
              <h2 className="text-purple-800 font-bold mb-2">Environment</h2>
              <pre className="bg-white p-3 rounded text-sm overflow-auto">
                {JSON.stringify(status.environment, null, 2)}
              </pre>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <h2 className="text-gray-800 font-bold mb-2">Timestamp</h2>
              <p className="text-gray-700">{status.timestamp}</p>
            </div>

            <div className="mt-8 pt-6 border-t">
              <h3 className="font-bold mb-3">Next Steps:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>If health check shows "healthy", database is connected ✓</li>
                <li>If health check shows "unhealthy", check environment variables in Vercel dashboard</li>
                <li>Go to <a href="/login" className="text-blue-600 hover:underline">/login</a> to access the application</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
