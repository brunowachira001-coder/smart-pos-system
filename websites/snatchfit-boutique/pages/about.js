export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-bold text-5xl mb-6">About SnatchFit</h1>
          <p className="text-xl text-gray-300">Bold, confident, modern fashion for the trend-conscious</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display font-bold text-4xl mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                SnatchFit Boutique was born from a passion for fashion and a desire to make premium, trend-forward pieces accessible to everyone.
              </p>
              <p className="text-gray-600 mb-4">
                We believe that fashion should be bold, confident, and authentic. Every piece in our collection is carefully curated to reflect the latest trends while maintaining timeless quality.
              </p>
              <p className="text-gray-600">
                Our mission is to empower our customers to express their unique style and feel confident in what they wear.
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg h-96 flex items-center justify-center">
              <div className="text-6xl">👗</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-4xl mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Quality', desc: 'Premium materials and expert craftsmanship' },
              { title: 'Authenticity', desc: 'Real fashion for real people' },
              { title: 'Sustainability', desc: 'Ethical and responsible practices' },
            ].map((value, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="font-bold text-xl mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
