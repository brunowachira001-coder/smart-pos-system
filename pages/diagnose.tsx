export default function Diagnose() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">System Diagnostics</h1>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Environment</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-slate-600">Node Env:</span>{' '}
                <span className="text-slate-900">{process.env.NODE_ENV}</span>
              </p>
              <p>
                <span className="font-medium text-slate-600">Database URL:</span>{' '}
                <span className="text-slate-900">
                  {process.env.DATABASE_URL ? '✅ Set' : '❌ Not Set'}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Links</h2>
            <div className="space-y-2">
              <a
                href="/login"
                className="block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-center transition"
              >
                Go to Login
              </a>
              <a
                href="/api/health/check"
                className="block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition"
              >
                Check API Health
              </a>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-bold text-yellow-900 mb-2">⚠️ If you see this page:</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>The system is loading - wait 2-3 minutes</li>
              <li>Try accessing /login directly</li>
              <li>Clear your browser cache</li>
              <li>Check Vercel deployment status</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
