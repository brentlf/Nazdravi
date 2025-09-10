import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

export default function Contact() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 uppercase" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>Contact Us</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Get in touch with us for any questions or inquiries about our nutrition services.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 uppercase" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>Contact Information</h2>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      <strong>Email:</strong> info@nazdravi.com
                    </p>
                    <p className="text-gray-600">
                      <strong>Phone:</strong> +1 (555) 123-4567
                    </p>
                    <p className="text-gray-600">
                      <strong>Address:</strong><br />
                      123 Health Street<br />
                      Wellness City, WC 12345
                    </p>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Hours</h2>
                  <div className="space-y-2 text-gray-600">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Send us a message</h2>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
