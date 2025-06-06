import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wrench, 
  Star, 
  Clock, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Search,
  MapPin,
  Users,
  Award
} from 'lucide-react';
import { getPublishedListings } from '../../features/listings/services/listingService';
import { ListingCategory } from '../../types/listings';
import type { BaseListing } from '../../types/listings';
import ListingCard from '../../features/listings/components/ListingCard';
import Button from '../../components/ui/Button';

const ServicesLandingPage: React.FC = () => {
  const [featuredServices, setFeaturedServices] = useState<BaseListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        const response = await getPublishedListings({
          category: ListingCategory.SERVICES,
          limit: 6
        });
        setFeaturedServices(response.listingsData);
      } catch (error) {
        console.error('Error fetching featured services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedServices();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('categories', 'SERVICES');
    if (searchTerm) params.set('q', searchTerm);
    if (location) params.set('location', location);
    window.location.href = `/services/browse?${params.toString()}`;
  };

  const serviceCategories = [
    {
      name: 'Home Services',
      icon: '🏠',
      description: 'Plumbing, electrical, cleaning, and more',
      count: '150+'
    },
    {
      name: 'Professional Services',
      icon: '💼',
      description: 'Legal, accounting, consulting services',
      count: '80+'
    },
    {
      name: 'Health & Wellness',
      icon: '🏥',
      description: 'Healthcare, fitness, beauty services',
      count: '120+'
    },
    {
      name: 'Tech Services',
      icon: '💻',
      description: 'IT support, web design, software development',
      count: '90+'
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Verified Professionals',
      description: 'All service providers are background checked and verified'
    },
    {
      icon: Star,
      title: 'Top Rated',
      description: 'Browse services with real customer reviews and ratings'
    },
    {
      icon: Clock,
      title: 'Quick Response',
      description: 'Get quotes and responses within 24 hours'
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'Satisfaction guarantee on all completed services'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <Wrench className="w-12 h-12" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Professional
              <span className="block text-yellow-400">Services</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-green-100 mb-12 max-w-3xl mx-auto">
              Connect with trusted local professionals for all your service needs. 
              From home repairs to business consulting, we've got you covered.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-2 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="What service do you need?"
                      className="w-full pl-12 pr-4 py-4 text-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Your location"
                      className="w-full pl-12 pr-4 py-4 text-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl"
                  >
                    Find Services
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Popular Service Categories
            </h2>
            <p className="text-xl text-neutral-600">
              Explore our most requested professional services
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Link
                  to={`/services/browse?subcategory=${encodeURIComponent(category.name)}`}
                  className="block bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-green-400 border border-transparent"
                >
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">
                      {category.count} providers
                    </span>
                    <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Featured Service Providers
            </h2>
            <p className="text-xl text-neutral-600">
              Top-rated professionals ready to help you
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-neutral-200 rounded-lg h-64 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListingCard listing={service} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/services/browse">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl">
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-neutral-600">
              We make finding reliable services simple and secure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-neutral-600">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Your Perfect Service Provider?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join thousands of satisfied customers who found their ideal service through our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/services/browse">
                <Button className="bg-white text-green-600 hover:bg-neutral-100 px-8 py-4 text-lg font-semibold rounded-xl">
                  Browse All Services
                </Button>
              </Link>
              <Link to="/auth">
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  List Your Service
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ServicesLandingPage;