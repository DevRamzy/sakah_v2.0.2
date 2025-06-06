import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Star,
  Award,
  TrendingUp
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  image: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  propertiesSold: number;
  specialties: string[];
}

interface ContactAgentProps {
  agent: Agent;
  propertyName: string;
  onScheduleViewing: () => void;
}

const ContactAgent: React.FC<ContactAgentProps> = ({ 
  agent, 
  propertyName,
  onScheduleViewing 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hi, I'm interested in ${propertyName}. Could you please provide more information?`,
    preferredContact: 'email' as 'email' | 'phone'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Handle form submission logic here
    console.log('Contact form submitted:', formData);
    
    setIsSubmitting(false);
    // Show success message or redirect
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Agent Profile Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6">
        <div className="flex items-start gap-4">
          <img
            src={agent.image}
            alt={agent.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-neutral-800">{agent.name}</h3>
            <p className="text-neutral-600 mb-2">{agent.title}</p>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-medium text-neutral-800">{agent.rating}</span>
                <span className="text-sm text-neutral-600">({agent.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-neutral-800">{agent.yearsExperience}</span>
                </div>
                <span className="text-xs text-neutral-600">Years Exp.</span>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-neutral-800">{agent.propertiesSold}</span>
                </div>
                <span className="text-xs text-neutral-600">Properties Sold</span>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold text-neutral-800">{agent.specialties.length}</span>
                </div>
                <span className="text-xs text-neutral-600">Specialties</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact Buttons */}
        <div className="flex gap-3 mt-4">
          <a
            href={`tel:${agent.phone}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="font-medium">Call Now</span>
          </a>
          <a
            href={`mailto:${agent.email}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span className="font-medium">Email</span>
          </a>
          <button
            onClick={onScheduleViewing}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors font-medium"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule</span>
          </button>
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

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Preferred Contact Method
            </label>
            <select
              name="preferredContact"
              value={formData.preferredContact}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
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
              placeholder="Tell us about your requirements..."
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

        {/* Agent Specialties */}
        {agent.specialties.length > 0 && (
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <h5 className="font-medium text-neutral-800 mb-3">Specialties</h5>
            <div className="flex flex-wrap gap-2">
              {agent.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactAgent;