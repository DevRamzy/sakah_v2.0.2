import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Shield, 
  Truck,
  CreditCard,
  Gift,
  ArrowRight,
  Store,
  Smartphone
} from 'lucide-react';
import { getPublishedListings } from '../../features/listings/services/listingService';
import { ListingCategory } from '../../types/listings';
import type { BaseListing } from '../../types/listings';
import ListingCard from '../../features/listings/components/ListingCard';
import Button from '../../components/ui/Button';

const StoresLandingPage: React.FC = () => {
  const [featuredStores, setFeaturedStores] = useState<BaseListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const fetchFeaturedStores = async () => {
      try {
        const response = await getPublishedListings({
          category: ListingCategory.STORE,
          limit: 6
        });
        setFeaturedStores(response.listingsData);
      } catch (error) {
        console.error('Error fetching featured stores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedStores();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('categories', 'STORE');
    if (searchTerm) params.set('q', searchTerm);
    if (location) params.set('location', location);
    window.location.href = `/stores/browse?${params.toString()}`;
  };

  const storeCategories = [
    {
      name: 'Fashion & Apparel',
      icon: '👗',
      description: 'Clothing, shoes, accessories',
      count: '120+'
    },
    {
      name: 'Electronics',
      icon: '📱',
      description: 'Phones, computers, gadgets',
      count: '85+'
    },
    {
      name: 'Home & Garden',
      icon: '🏡',
      description: 'Furniture, decor, gardening',
      count: '95+'
    },
    {
      name: 'Food & Beverage',
      icon: '🍕',
      description: 'Restaurants, cafes, grocery',
      count: '200+'
    },
    {
      name: 'Health & Beauty',
      icon: '💄',
      description: 'Cosmetics, wellness, pharmacy',
      count: '75+'
    },
    {
      name: 'Sports & Recreation',
      icon: '⚽',
      description: 'Sporting goods, outdoor gear',
      count: '60+'
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Verified Stores',
      description: 'All stores are verified and trusted by our community'
    },
    {
      icon: Truck,
      title: 'Local Delivery',
      description: 'Many stores offer local delivery and pickup options'
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing'
    },
    {
      icon: Gift,
      title: 'Special Offers',
      description: 'Exclusive deals and promotions from local stores'
    }
  ];

  const features = [
    {
      title: 'Store Hours',
      description: 'Real-time store hours and availability',
      icon: Clock
    },
    {
      title: 'Customer Reviews',
      description: 'Honest reviews from verified customers',
      icon: Star
    },
    {
      title: 'Mobile Friendly',
      description: 'Shop on-the-go with our mobile platform',
      icon: Smartphone
    },
    {
      title: 'Local Focus',
      description: 'Supporting local businesses in your community',
      icon: Store
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white overflow-hidden">
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
                <ShoppingBag className="w-12 h-12" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Local
              <span className="block text-yellow-400">Stores</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-3xl mx-auto">
              Shop local and support your community. Find unique stores, 
              restaurants, and services right in your neighborhood.
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
                      placeholder="What are you looking for?"
                      className="w-full pl-12 pr-4 py-4 text-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Your location"
                      className="w-full pl-12 pr-4 py-4 text-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-xl"
                  >
                    Find Stores
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Store Categories */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-neutral-600">
              Explore our diverse collection of local stores
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {storeCategories.map((category, index) => (
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
                  to={`/stores/browse?subcategory=${encodeURIComponent(category.name)}`}
                  className="block bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-purple-400 border border-transparent"
                >
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-600">
                      {category.count} stores
                    </span>
                    <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stores */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Featured Local Stores
            </h2>
            <p className="text-xl text-neutral-600">
              Discover amazing local businesses in your area
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
              {featuredStores.map((store, index) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListingCard listing={store} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/stores/browse">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl">
                View All Stores
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Why Shop Local?
            </h2>
            <p className="text-xl text-neutral-600">
              Supporting local businesses benefits everyone
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
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
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

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-6">
                Everything You Need to Shop Local
              </h2>
              <p className="text-xl text-neutral-600 mb-8">
                Our platform makes it easy to discover, connect with, and support 
                local businesses in your community.
              </p>
              
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-neutral-600">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 w-20 h-20 bg-purple-300 rounded-full opacity-50"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-purple-400 rounded-full opacity-30"></div>
                
                <div className="relative z-10">
                  <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-800">Local Boutique</h4>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                          <span className="text-sm text-neutral-600 ml-1">4.9 (89 reviews)</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-neutral-600 text-sm">
                      "Amazing selection and friendly service. Love supporting local!"
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Store className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-800">Corner Cafe</h4>
                        <p className="text-sm text-neutral-600">Open until 8 PM</p>
                      </div>
                    </div>
                    <p className="text-neutral-600 text-sm">
                      "Best coffee in town with a cozy atmosphere perfect for work."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Explore Local Stores?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Start discovering unique local businesses and support your community today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/stores/browse">
                <Button className="bg-white text-purple-600 hover:bg-neutral-100 px-8 py-4 text-lg font-semibold rounded-xl">
                  Browse All Stores
                </Button>
              </Link>
              <Link to="/auth">
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  List Your Store
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default StoresLandingPage;