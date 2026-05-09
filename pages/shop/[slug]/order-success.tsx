import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useShopTheme } from '@/hooks/useShopTheme';

export default function OrderSuccess() {
  const router = useRouter();
  const { slug, orderId, orderNumber } = router.query;
  const theme = useShopTheme(slug);
  const p = theme.primary;

  return (
    <>
      <Head><title>Order Confirmed – {theme.name || slug}</title></Head>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link href={`/shop/${slug}`} className="flex items-center gap-2 font-extrabold text-xl" style={{ color: p }}>
              {theme.logo_url && <img src={theme.logo_url} alt="logo" className="h-8 w-auto object-contain" />}
              <span>{theme.name || slug}</span>
            </Link>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Success card */}
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: `${p}20` }}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: p }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
            <p className="text-gray-500 mb-5 text-sm">
              Thank you for your order. We'll contact you shortly to confirm delivery.
            </p>
            {orderNumber && (
              <div className="inline-block bg-gray-50 border border-gray-200 rounded-xl px-6 py-3">
                <p className="text-xs text-gray-500 mb-1">Order Number</p>
                <p className="text-xl font-bold" style={{ color: p }}>{orderNumber}</p>
              </div>
            )}
          </div>

          {/* What happens next */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-4">What happens next?</h2>
            <div className="space-y-4">
              {[
                { icon: '📞', title: 'We\'ll call you', desc: 'Our team will call to confirm your order and delivery details.' },
                { icon: '📦', title: 'We prepare your order', desc: 'Your items are packed and ready for dispatch.' },
                { icon: '🚚', title: 'Delivery', desc: 'Your order is delivered to your address within 3–5 days.' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xl shrink-0">{step.icon}</div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{step.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href={`/shop/${slug}`} className="flex-1">
              <button
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition"
                style={{ backgroundColor: p }}
              >
                Continue Shopping
              </button>
            </Link>
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-700 hover:border-gray-400 transition"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
