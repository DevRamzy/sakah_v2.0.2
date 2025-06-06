import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Clock,
  Navigation,
  Store
} from 'lucide-react';

interface ContactStoreProps {
  storeName: string;
  phone?: string;
  email?: string;
  address: string;
  businessHours: Array<{
    day: string;
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }>;
}

const ContactStore: React.FC<ContactStoreProps> = ({ 
  storeName,
  phone,
  email,
  address,
  businessHours
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hi, I'd like to know more about your store and products. Are you currently open for visits?`,
    inquiryType: 'general' as 'general' | 'product' | 'hours' | 'location'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Store inquiry submitted:', formData);
    
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getCurrentStatus = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().slice(0, 5);
    
    const todayHours = businessHours.find(h => h.day === currentDay);
    if (!todayHours || todayHours.isClosed) {
      return { isOpen: false, status: 'Closed' };
    }
    
    if (todayHours.openTime && todayHours.closeTime) {
      const isOpen = currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
      return { 
        isOpen, 
        status: isOpen ? 'Open Now' : 'Closed',
        hours: `${todayHours.openTime} - ${todayHours.closeTime}`
      };
    }
    
    return { isOpen: false, status: 'Closed' };
  };

  const status = getCurrentStatus();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Store Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
            <Store className="w-8 h-8 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-800">{storeName}</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              status.isOpen 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <Clock className="w-4 h-4" />
              {status.status}
            </div>
          </div>
        </div>

        {/* Quick Contact Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">Call</span>
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="font-medium">Email</span>
            </a>
          )}
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors font-medium"
          >
            <Navigation className="w-4 h-4" />
            <span>Directions</span>
          </a>
        </div>
      </div>

      {/* Store Information */}
      <div className="p-6 border-b border-neutral-200">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-neutral-800">Address</p>
              <p className="text-neutral-600">{address}</p>
            </div>
          </div>

          {status.hours && (
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-neutral-800">Today's Hours</p>
                <p className="text-neutral-600">{status.hours}</p>
              </div>
            </div>
          )}

          {phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-neutral-800">Phone</p>
                <a href={`tel:${phone}`} className="text-yellow-600 hover:text-yellow-700">
                  {phone}
                </a>
              </div>
            </div>
          )}

          {email && (
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-neutral-800">Email</p>
                <a href={`mailto:${email}`} className="text-yellow-600 hover:text-yellow-700">
                  {email}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Form */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-5 h-5 text-yellow-500" />
          <h4 className="text-lg font-semibold text-neutral-800">Send a Message</h4>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Inquiry Type
            </label>
            <select
              name="inquiryType"
              value={formData.inquiryType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="general">General Inquiry</option>
              <option value="product">Product Information</option>
              <option value="hours">Store Hours</option>
              <option value="location">Location & Directions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
              placeholder="How can we help you?"
            />
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-neutral-300 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5" />
                Send Message
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ContactStore;