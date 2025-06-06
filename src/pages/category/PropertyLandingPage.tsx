import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Building,
  ArrowRight
} from 'lucide-react';
import { getPublishedListings } from '../../features/listings/services/listingService';
import { ListingCategory } from '../../types/listings';
import type { BaseListing } from '../../types/listings';
import ListingCard from '../../features/listings/components/ListingCard';
import Button from '../../components/ui/Button';

const PropertyLandingPage: React.FC = () => {
  const [featuredProperties, setFeaturedProperties] = useState<BaseListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: ''
  });

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const response = await getPublishedListings({
          category: ListingCategory.PROPERTY,
          limit: 6
        });
        setFeaturedProperties(response.listingsData);
      } catch (error) {
        console.error('Error fetching featured properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('categories', 'PROPERTY');
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    window.location.href = `/property/browse?${params.toString()}`;
  };

  const propertyTypes = [
    {
      name: 'Residential',
      icon: '🏠',
      description: 'Houses, apartments, condos',
      count: '250+'
    },
    {
      name: 'Commercial',
      icon: '🏢',
      description: 'Offices, retail spaces, warehouses',
      count: '80+'
    },
    {
      name: 'Land',
      icon: '🌳',
      description: 'Vacant lots, development land',
      count: '45+'
    },
    {
      name: 'Industrial',
      icon: '🏭',
      description: 'Manufacturing, distribution centers',
      count: '25+'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Verified Listings',
      description: 'All properties are verified and up-to-date'
    },
    {
      icon: TrendingUp,
      title: 'Market Insights',
      description: 'Get real-time market data and trends'
    },
    {
      icon: Users,
      title: 'Expert Agents',
      description: 'Connect with top-rated real estate professionals'
    },
    {
      icon: Clock,
      title: 'Quick Process',
      description: 'Streamlined buying and selling experience'
    }
  ];

  const stats = [
    { number: '500+', label: 'Properties Listed' },
    { number: '1,200+', label: 'Happy Clients' },
    { number: '$50M+', label: 'Properties Sold' },
    { number: '98%', label: 'Satisfaction Rate' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
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
                <Home className="w-12 h-12" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Dream
              <span className="block text-yellow-400">Property</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Discover the perfect home, office, or investment property. 
              Browse thousands of verified listings with detailed information.
            </p>

            {/* Advanced Search Form */}
            <form onSubmit={handleSearch} className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={searchFilters.location}
                      onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                      placeholder="Location"
                      className="w-full pl-10 pr-4 py-3 text-neutral-800 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  
                  <select
                    value={searchFilters.propertyType}
                    onChange={(e) => setSearchFilters({...searchFilters, propertyType: e.target.value})}
                    className="w-full px-4 py-3 text-neutral-800 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Property Type</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="land">Land</option>
                    <option value="industrial">Industrial</option>
                  </select>

                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={searchFilters.minPrice}
                      onChange={(e) => setSearchFilters({...searchFilters, minPrice: e.target.value})}
                      placeholder="Min Price"
                      className="w-full pl-10 pr-4 py-3 text-neutral-800 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={searchFilters.maxPrice}
                      onChange={(e) => setSearchFilters({...searchFilters, maxPrice: e.target.value})}
                      placeholder="Max Price"
                      className="w-full pl-10 pr-4 py-3 text-neutral-800 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <select
                    value={searchFilters.bedrooms}
                    onChange={(e) => setSearchFilters({...searchFilters, bedrooms: e.target.value})}
                    className="w-full px-4 py-3 text-neutral-800 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Bedrooms</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>

                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-neutral-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Browse by Property Type
            </h2>
            <p className="text-xl text-neutral-600">
              Find exactly what you're looking for
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {propertyTypes.map((type, index) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Link
                  to={`/property/browse?propertyType=${type.name.toLowerCase()}`}
                  className="block bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-blue-400 border border-transparent"
                >
                  <div className="text-4xl mb-4">{type.icon}</div>
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                    {type.name}
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    {type.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">
                      {type.count} listings
                    </span>
                    <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Featured Properties
            </h2>
            <p className="text-xl text-neutral-600">
              Handpicked properties you'll love
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
              {featuredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListingCard listing={property} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/property/browse">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl">
                View All Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
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
              We make property search simple and reliable
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
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
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Your Perfect Property?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start your property journey today with our comprehensive listings and expert support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/property/browse">
                <Button className="bg-white text-blue-600 hover:bg-neutral-100 px-8 py-4 text-lg font-semibold rounded-xl">
                  Browse Properties
                </Button>
              </Link>
              <Link to="/auth">
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  List Your Property
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PropertyLandingPage;