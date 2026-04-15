import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-slate-900 mb-4">404</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-600 mb-8">
          The page you're looking for doesn't exist or the system is still loading.
        </p>

        <div className="space-y-3">
          <Link href="/login">
            <button className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition">
              Go to Login
            </button>
          </Link>

          <Link href="/">
            <button className="w-full px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition">
              Go to Home
            </button>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Tip:</strong> If you just deployed, wait 2-3 minutes for the system to fully load.
          </p>
        </div>
      </div>
    </div>
  );
}
