import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-black text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">
                Snatch Your <span className="text-accent">Style</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Bold, confident, modern fashion for the trend-conscious. Discover curated collections that define your unique style.
              </p>
              <div className="flex gap-4">
                <Link href="/shop" className="bg-accent text-black px-8 py-3 rounded-lg font-bold hover:bg-pink-600 transition">
                  Shop Now
                </Link>
                <Link href="/about" className="border-2 border-accent text-accent px-8 py-3 rounded-lg font-bold hover:bg-accent hover:text-black transition">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">👗</div>
                <p className="text-white font-bold">Premium Fashion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-4xl mb-12 text-center">Featured Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Summer Dresses', emoji: '👗', color: 'from-pink-400 to-pink-600' },
              { name: 'Casual Tops', emoji: '👕', color: 'from-purple-400 to-purple-600' },
              { name: 'Trendy Bottoms', emoji: '👖', color: 'from-blue-400 to-blue-600' },
            ].map((collection, idx) => (
              <Link key={idx} href={`/shop?category=${collection.name.toLowerCase().split(' ')[0]}`}>
                <div className="bg-gradient-to-br {collection.color} rounded-lg h-64 flex items-center justify-center cursor-pointer hover:shadow-2xl transition transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{collection.emoji}</div>
                    <p className="text-white font-bold text-xl">{collection.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why SnatchFit */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-4xl mb-12 text-center">Why SnatchFit?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Curated Selection', desc: 'Hand-picked pieces that define modern fashion' },
              { title: 'Premium Quality', desc: 'High-quality materials and expert craftsmanship' },
              { title: 'Fast Shipping', desc: 'Quick delivery to your doorstep' },
            ].map((feature, idx) => (
              <div key={idx} className="text-center p-6">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-4xl mb-6">Ready to Snatch Your Style?</h2>
          <p className="text-xl text-gray-300 mb-8">Join thousands of fashion-forward customers</p>
          <Link href="/shop" className="bg-accent text-black px-8 py-3 rounded-lg font-bold hover:bg-pink-600 transition inline-block">
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
