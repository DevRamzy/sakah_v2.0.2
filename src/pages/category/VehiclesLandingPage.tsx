import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Car, 
  Search, 
  MapPin, 
  Star, 
  Shield, 
  DollarSign,
  Calendar,
  Gauge,
  Award,
  Users,
  ArrowRight,
  Truck,
  Bike
} from 'lucide-react';
import { getPublishedListings } from '../../features/listings/services/listingService';
import { ListingCategory } from '../../types/listings';
import type { BaseListing } from '../../types/listings';
import ListingCard from '../../features/listings/components/ListingCard';
import Button from '../../components/ui/Button';

const VehiclesLandingPage: React.FC = () => {
  const [featuredDealerships, setFeaturedDealerships] = useState<BaseListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    vehicleType: '',
    brand: '',
    priceRange: '',
    year: ''
  });

  useEffect(() => {
    const fetchFeaturedDealerships = async () => {
      try {
        const response = await getPublishedListings({
          category: ListingCategory.AUTO_DEALERSHIP,
          limit: 6
        });
        setFeaturedDealerships(response.listingsData);
      } catch (error) {
        console.error('Error fetching featured dealerships:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDealerships();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('categories', 'AUTO_DEALERSHIP');
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    window.location.href = `/vehicles/browse?${params.toString()}`;
  };

  const vehicleTypes = [
    {
      name: 'New Cars',
      icon: '🚗',
      description: 'Latest models with warranty',
      count: '150+'
    },
    {
      name: 'Used Cars',
      icon: '🚙',
      description: 'Quality pre-owned vehicles',
      count: '300+'
    },
    {
      name: 'Luxury Vehicles',
      icon: '🏎️',
      description: 'Premium and exotic cars',
      count: '45+'
    },
    {
      name: 'Commercial Vehicles',
      icon: '🚛',
      description: 'Trucks, vans, and fleet vehicles',
      count: '80+'
    },
    {
      name: 'Motorcycles',
      icon: '🏍️',
      description: 'Bikes and scooters',
      count: '60+'
    },
    {
      name: 'Electric Vehicles',
      icon: '⚡',
      description: 'Eco-friendly electric cars',
      count: '35+'
    }
  ];

  const services = [
    {
      icon: Shield,
      title: 'Certified Dealers',
      description: 'All dealerships are verified and licensed'
    },
    {
      icon: DollarSign,
      title: 'Financing Options',
      description: 'Flexible payment plans and loan assistance'
    },
    {
      icon: Award,
      title: 'Quality Guarantee',
      description: 'Inspected vehicles with quality assurance'
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: 'Professional sales and service teams'
    }
  ];

  const stats = [
    { number: '500+', label: 'Vehicles Available' },
    { number: '50+', label: 'Trusted Dealers' },
    { number: '2,000+', label: 'Happy Customers' },
    { number: '98%', label: 'Satisfaction Rate' }
  ];

  const popularBrands = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 
    'Audi', 'Nissan', 'Hyundai', 'Volkswagen', 'Mazda', 'Subaru'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white overflow-hidden">
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
                <Car className="w-12 h-12" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect
              <span className="block text-yellow-400">Vehicle</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-red-100 mb-12 max-w-3xl mx-auto">
              Discover trusted dealerships with quality vehicles. From new cars to 
              motorcycles, find your next ride with confidence.
            </p>

            {/* Advanced Search Form */}
            <form onSubmit={handleSearch} className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={searchFilters.location}
                      onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                      placeholder="Location"
                      className="w-full pl-10 pr-4 py-3 text-neutral-800 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  
                  <select
                    value={searchFilters.vehicleType}
                    onChange={(e) => setSearchFilters({...searchFilters, vehicleType: e.target.value})}
                    className="w-full px-4 py-3 text-neutral-800 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <option value="">Vehicle Type</option>
                    <option value="new">New Cars</option>
                    <option value="used">Used Cars</option>
                    <option value="luxury">Luxury</option>
                    <option value="commercial">Commercial</option>
                    <option value="motorcycle">Motorcycles</option>
                  </select>

                  <select
                    value={searchFilters.brand}
                    onChange={(e) => setSearchFilters({...searchFilters, brand: e.target.value})}
                    className="w-full px-4 py-3 text-neutral-800 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <option value="">Brand</option>
                    {popularBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>

                  <select
                    value={searchFilters.priceRange}
                    onChange={(e) => setSearchFilters({...searchFilters, priceRange: e.target.value})}
                    className="w-full px-4 py-3 text-neutral-800 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <option value="">Price Range</option>
                    <option value="0-15000">Under $15,000</option>
                    <option value="15000-30000">$15,000 - $30,000</option>
                    <option value="30000-50000">$30,000 - $50,000</option>
                    <option value="50000-100000">$50,000 - $100,000</option>
                    <option value="100000+">$100,000+</option>
                  </select>

                  <Button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg"
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
      <section className="py-16 bg-red-50">
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
                <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-neutral-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Browse by Vehicle Type
            </h2>
            <p className="text-xl text-neutral-600">
              Find exactly what you're looking for
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicleTypes.map((type, index) => (
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
                  to={`/vehicles/browse?vehicleType=${type.name.toLowerCase().replace(' ', '-')}`}
                  className="block bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-red-400 border border-transparent"
                >
                  <div className="text-4xl mb-4">{type.icon}</div>
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                    {type.name}
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    {type.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-600">
                      {type.count} available
                    </span>
                    <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dealerships */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Featured Dealerships
            </h2>
            <p className="text-xl text-neutral-600">
              Trusted dealers with quality vehicles
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
              {featuredDealerships.map((dealership, index) => (
                <motion.div
                  key={dealership.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListingCard listing={dealership} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/vehicles/browse">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl">
                View All Dealerships
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
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
              We make vehicle shopping simple and secure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <service.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">
                  {service.title}
                </h3>
                <p className="text-neutral-600">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Brands */}
      <section className="py-20 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Popular Brands
            </h2>
            <p className="text-xl text-neutral-600">
              Find vehicles from top manufacturers
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {popularBrands.map((brand, index) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  to={`/vehicles/browse?brand=${brand}`}
                  className="block bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 text-center group"
                >
                  <h3 className="font-semibold text-neutral-800 group-hover:text-red-600 transition-colors">
                    {brand}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Your Next Vehicle?
            </h2>
            <p className="text-xl text-red-100 mb-8">
              Start your vehicle search today with our trusted dealership network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/vehicles/browse">
                <Button className="bg-white text-red-600 hover:bg-neutral-100 px-8 py-4 text-lg font-semibold rounded-xl">
                  Browse Vehicles
                </Button>
              </Link>
              <Link to="/auth">
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  List Your Dealership
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default VehiclesLandingPage;