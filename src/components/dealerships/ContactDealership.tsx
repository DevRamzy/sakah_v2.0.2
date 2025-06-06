import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Car,
  DollarSign,
  Clock,
  MapPin,
  User
} from 'lucide-react';

interface ContactDealershipProps {
  dealershipName: string;
  phone?: string;
  email?: string;
  address: string;
  businessHours: Array<{
    day: string;
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }>;
  onScheduleTestDrive: () => void;
}

const ContactDealership: React.FC<ContactDealershipProps> = ({ 
  dealershipName,
  phone,
  email,
  address,
  businessHours,
  onScheduleTestDrive
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hi, I'm interested in learning more about your vehicles and would like to schedule a visit to your dealership.`,
    inquiryType: 'general' as 'general' | 'financing' | 'trade-in' | 'service' | 'test-drive',
    vehicleInterest: '',
    budgetRange: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Dealership inquiry submitted:', formData);
    
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
      {/* Dealership Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
            <Car className="w-8 h-8 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-800">{dealershipName}</h3>
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

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
          <button
            onClick={onScheduleTestDrive}
            className="flex items-center justify-center gap-2 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors font-medium"
          >
            <Car className="w-4 h-4" />
            <span>Test Drive</span>
          </button>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg transition-colors font-medium"
          >
            <MapPin className="w-4 h-4" />
            <span>Directions</span>
          </a>
        </div>
      </div>

      {/* Dealership Information */}
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

      {/* Inquiry Form */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-5 h-5 text-yellow-500" />
          <h4 className="text-lg font-semibold text-neutral-800">Send an Inquiry</h4>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Your Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="financing">Financing Options</option>
                <option value="trade-in">Trade-In Value</option>
                <option value="service">Service & Maintenance</option>
                <option value="test-drive">Schedule Test Drive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Budget Range
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <select
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select budget range</option>
                  <option value="under-20k">Under $20,000</option>
                  <option value="20k-40k">$20,000 - $40,000</option>
                  <option value="40k-60k">$40,000 - $60,000</option>
                  <option value="60k-80k">$60,000 - $80,000</option>
                  <option value="over-80k">Over $80,000</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Vehicle Interest
            </label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                name="vehicleInterest"
                value={formData.vehicleInterest}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="e.g., Honda Civic, Toyota Camry, SUV"
              />
            </div>
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
              placeholder="Tell us about your vehicle needs..."
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
                Sending Inquiry...
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5" />
                Send Inquiry
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ContactDealership;