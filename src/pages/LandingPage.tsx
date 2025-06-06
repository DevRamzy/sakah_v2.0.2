import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Star, 
  Users, 
  Building, 
  Wrench, 
  ShoppingBag, 
  Car,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import { getPublishedListings } from '../features/listings/services/listingService';
import { ListingCategory } from '../types/listings';
import type { BaseListing } from '../types/listings';
import ListingCard from '../features/listings/components/ListingCard';

const LandingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [mounted, setMounted] = useState(false);
  const [featuredListings, setFeaturedListings] = useState<Record<string, BaseListing[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [heroListings, setHeroListings] = useState<BaseListing[]>([]);

  useEffect(() => {
    setMounted(true);
    
    const fetchAllFeaturedListings = async () => {
      setLoading(true);
      
      try {
        // Fetch listings for each category
        const categories = Object.values(ListingCategory);
        const results: Record<string, BaseListing[]> = {};
        
        // Fetch hero listings (random mix of categories)
        const heroResponse = await getPublishedListings({
          limit: 5
        });
        setHeroListings(heroResponse.listingsData || []);
        
        // Fetch category-specific listings
        for (const category of categories) {
          const response = await getPublishedListings({
            category: category as ListingCategory,
            limit: 4
          });
          results[category] = response.listingsData || [];
        }
        
        setFeaturedListings(results);
      } catch (error) {
        console.error('Error fetching featured listings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllFeaturedListings();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (location) params.set('location', location);
    window.location.href = `/listings?${params.toString()}`;
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const categories = [
    { 
      icon: Wrench, 
      name: 'Services', 
      description: 'Professional services for your needs',
      color: 'bg-green-100 text-green-700',
      count: '500+',
      category: ListingCategory.SERVICES
    },
    { 
      icon: Building, 
      name: 'Property', 
      description: 'Find your perfect home or office',
      color: 'bg-blue-100 text-blue-700',
      count: '200+',
      category: ListingCategory.PROPERTY
    },
    { 
      icon: ShoppingBag, 
      name: 'Stores', 
      description: 'Local shops and retailers',
      color: 'bg-purple-100 text-purple-700',
      count: '300+',
      category: ListingCategory.STORE
    },
    { 
      icon: Car, 
      name: 'Vehicles', 
      description: 'Cars, motorcycles, and more',
      color: 'bg-red-100 text-red-700',
      count: '150+',
      category: ListingCategory.AUTO_DEALERSHIP
    }
  ];

  const features = [
    {
      icon: Search,
      title: 'Easy Discovery',
      description: 'Find exactly what you need with our powerful search and filtering system.'
    },
    {
      icon: Shield,
      title: 'Verified Listings',
      description: 'All businesses are verified to ensure quality and authenticity.'
    },
    {
      icon: Clock,
      title: '24/7 Access',
      description: 'Browse and connect with businesses anytime, anywhere.'
    },
    {
      icon: TrendingUp,
      title: 'Growing Network',
      description: 'Join thousands of businesses and customers in our expanding marketplace.'
    }
  ];

  const stats = [
    { number: '1,000+', label: 'Active Listings' },
    { number: '500+', label: 'Verified Businesses' },
    { number: '10,000+', label: 'Happy Customers' },
    { number: '50+', label: 'Cities Covered' }
  ];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % heroListings.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + heroListings.length) % heroListings.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Featured Listing Carousel */}
      <section className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-black text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div 
            className="text-center"
            initial="hidden"
            animate={mounted ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
              variants={fadeInUp}
            >
              Discover Local
              <span className="block text-yellow-400">Businesses</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-neutral-300 mb-12 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Connect with the best local services, properties, stores, and dealerships in your area. 
              Your gateway to everything local.
            </motion.p>

            {/* Search Bar */}
            <motion.div 
              className="max-w-4xl mx-auto"
              variants={fadeInUp}
            >
              <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="What are you looking for?"
                      className="w-full pl-12 pr-4 py-4 text-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Location"
                      className="w-full pl-12 pr-4 py-4 text-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Search
                  </Button>
                </div>
              </form>
            </motion.div>

            {/* Quick Categories */}
            <motion.div 
              className="mt-12 flex flex-wrap justify-center gap-4"
              variants={fadeInUp}
            >
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={`/listings?categories=${category.category}`}
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-full transition-all duration-200 flex items-center gap-2"
                >
                  <category.icon className="w-5 h-5" />
                  {category.name}
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Featured Listings Carousel in Hero */}
        {!loading && heroListings.length > 0 && (
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-xl shadow-2xl">
                <div className="relative">
                  {heroListings.map((listing, index) => (
                    <div 
                      key={listing.id}
                      className={`transition-opacity duration-500 ${index === activeSlide ? 'block' : 'hidden'}`}
                    >
                      <div className="relative h-64 md:h-96 bg-neutral-800">
                        {listing.images && listing.images[0] && (
                          <img 
                            src={listing.images[0].url} 
                            alt={listing.businessName}
                            className="w-full h-full object-cover opacity-70"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <div className="flex items-center mb-2">
                            <span className="px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full mr-2">
                              FEATURED
                            </span>
                            <span className="px-3 py-1 bg-black/50 text-white text-xs font-medium rounded-full">
                              {listing.category.replace('_', ' ')}
                            </span>
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold mb-2">{listing.businessName}</h3>
                          <p className="text-white/80 mb-4 line-clamp-2">{listing.description}</p>
                          <div className="flex items-center text-white/70 mb-4">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{listing.location}</span>
                          </div>
                          <Link 
                            to={`/listings/${listing.id}`}
                            className="inline-flex items-center px-4 py-2 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors"
                          >
                            View Details
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Carousel Controls */}
                <button 
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                {/* Carousel Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {heroListings.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSlide(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        index === activeSlide ? 'bg-yellow-400' : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                variants={fadeInUp}
              >
                <div className="text-3xl md:text-4xl font-bold text-neutral-800 mb-2">
                  {stat.number}
                </div>
                <div className="text-neutral-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Explore Categories
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Discover a wide range of local businesses and services tailored to your needs
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {categories.map((category) => (
              <motion.div
                key={category.name}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Link
                  to={`/listings?categories=${category.category}`}
                  className="block bg-white border border-neutral-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group-hover:border-yellow-400"
                >
                  <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-600">
                      {category.count} listings
                    </span>
                    <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Listings by Category */}
      {!loading && Object.keys(featuredListings).length > 0 && (
        <section className="py-20 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
                Featured Listings
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Explore top listings from each category
              </p>
            </motion.div>

            {/* Services */}
            {featuredListings[ListingCategory.SERVICES]?.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-neutral-800 flex items-center">
                    <Wrench className="w-6 h-6 mr-2 text-green-600" />
                    Services
                  </h3>
                  <Link 
                    to={`/listings?categories=${ListingCategory.SERVICES}`}
                    className="text-green-600 hover:text-green-700 font-medium flex items-center"
                  >
                    View All <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredListings[ListingCategory.SERVICES].map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ListingCard listing={listing} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Property */}
            {featuredListings[ListingCategory.PROPERTY]?.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-neutral-800 flex items-center">
                    <Building className="w-6 h-6 mr-2 text-blue-600" />
                    Property
                  </h3>
                  <Link 
                    to={`/listings?categories=${ListingCategory.PROPERTY}`}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    View All <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredListings[ListingCategory.PROPERTY].map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ListingCard listing={listing} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Stores */}
            {featuredListings[ListingCategory.STORE]?.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-neutral-800 flex items-center">
                    <ShoppingBag className="w-6 h-6 mr-2 text-purple-600" />
                    Stores
                  </h3>
                  <Link 
                    to={`/listings?categories=${ListingCategory.STORE}`}
                    className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
                  >
                    View All <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredListings[ListingCategory.STORE].map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ListingCard listing={listing} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Auto Dealerships */}
            {featuredListings[ListingCategory.AUTO_DEALERSHIP]?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-neutral-800 flex items-center">
                    <Car className="w-6 h-6 mr-2 text-red-600" />
                    Vehicles
                  </h3>
                  <Link 
                    to={`/listings?categories=${ListingCategory.AUTO_DEALERSHIP}`}
                    className="text-red-600 hover:text-red-700 font-medium flex items-center"
                  >
                    View All <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredListings[ListingCategory.AUTO_DEALERSHIP].map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ListingCard listing={listing} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Why Choose Sakah?
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              We make it easy to discover and connect with local businesses
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={fadeInUp}
              >
                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section for Businesses */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Ready to Grow Your Business?
            </h2>
            <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using Sakah to reach more customers and grow their presence online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button className="bg-black text-yellow-400 hover:bg-neutral-800 px-8 py-4 text-lg font-semibold rounded-xl">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/listings">
                <Button 
                  variant="outline" 
                  className="border-black text-black hover:bg-black hover:text-yellow-400 px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  Browse Listings
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-6">
                Everything You Need in One Place
              </h2>
              <p className="text-xl text-neutral-600 mb-8">
                From finding the perfect service provider to discovering your dream property, 
                Sakah connects you with verified local businesses across all categories.
              </p>
              
              <div className="space-y-4">
                {[
                  'Verified business listings',
                  'Real-time availability',
                  'Direct contact with providers',
                  'Customer reviews and ratings',
                  'Mobile-friendly platform'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-neutral-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative"
            >
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 w-20 h-20 bg-yellow-300 rounded-full opacity-50"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-yellow-400 rounded-full opacity-30"></div>
                
                <div className="relative z-10">
                  <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-800">Professional Plumber</h4>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                          <span className="text-sm text-neutral-600 ml-1">4.9 (127 reviews)</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-neutral-600 text-sm">
                      "Fast, reliable, and professional service. Highly recommended!"
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-800">Downtown Apartment</h4>
                        <p className="text-sm text-neutral-600">2 bed • 2 bath • 1,200 sq ft</p>
                      </div>
                    </div>
                    <p className="text-neutral-600 text-sm">
                      "Perfect location with modern amenities and great value."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start Exploring Today
            </h2>
            <p className="text-xl text-neutral-300 mb-8">
              Join our community and discover the best local businesses in your area.
            </p>
            <Link to="/listings">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 text-lg font-semibold rounded-xl">
                Browse All Listings
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;