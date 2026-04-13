import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate sending email
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-bold text-5xl mb-6">Contact Us</h1>
          <p className="text-xl text-gray-300">We'd love to hear from you</p>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Info */}
            <div>
              <h2 className="font-display font-bold text-3xl mb-8">Get in Touch</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2">Email</h3>
                  <p className="text-gray-600">hello@snatchfit.com</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Phone</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Address</h3>
                  <p className="text-gray-600">123 Fashion Street<br />New York, NY 10001</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Hours</h3>
                  <p className="text-gray-600">Mon - Fri: 9AM - 6PM<br />Sat - Sun: 10AM - 4PM</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-black py-2 rounded-lg font-bold hover:bg-pink-600 transition disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
