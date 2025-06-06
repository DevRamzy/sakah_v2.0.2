import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Filter, 
  Grid, 
  List, 
  Star,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { getPublishedListings } from '../../features/listings/services/listingService';
import { ListingCategory } from '../../types/listings';
import type { BaseListing } from '../../types/listings';
import ListingCard from '../../features/listings/components/ListingCard';
import ListingCardSkeleton from '../../features/listings/components/ListingCardSkeleton';
import Button from '../../components/ui/Button';

const LISTINGS_PER_PAGE = 12;

const ServicesArchivePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<BaseListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalListings, setTotalListings] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    searchTerm: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    subcategory: searchParams.get('subcategory') || '',
    priceRange: searchParams.get('priceRange') || '',
    rating: searchParams.get('rating') || '',
    availability: searchParams.get('availability') || ''
  });

  const serviceSubcategories = [
    'Home Services',
    'Professional Services', 
    'Health & Wellness',
    'Education & Training',
    'Tech Services',
    'Events & Entertainment',
    'Other Services'
  ];

  const priceRanges = [
    { label: 'Under $50', value: '0-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: '$100 - $200', value: '100-200' },
    { label: '$200 - $500', value: '200-500' },
    { label: '$500+', value: '500+' }
  ];

  const fetchListings = useCallback(async (pageToFetch: number, resetListings = false) => {
    if (pageToFetch === 1 || resetListings) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const response = await getPublishedListings({
        category: ListingCategory.SERVICES,
        page: pageToFetch,
        limit: LISTINGS_PER_PAGE,
        searchTerm: filters.searchTerm || undefined,
        location: filters.location || undefined,
        // Add other filters as needed
      });

      const listingsData = response.listingsData || [];
      const totalCount = response.totalCount || 0;

      if (pageToFetch === 1 || resetListings) {
        setListings(listingsData);
      } else {
        setListings(prev => [...prev, ...listingsData]);
      }
      
      setTotalListings(totalCount);
      setCurrentPage(pageToFetch);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services. Please try again later.');
      if (pageToFetch === 1 || resetListings) setListings([]);
    } finally {
      if (pageToFetch === 1 || resetListings) {
        setLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    fetchListings(1, true);
  }, [fetchListings]);

  // Update URL parameters when filters change
  useEffect(() => {
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    
    if (JSON.stringify(params) !== JSON.stringify(Object.fromEntries(searchParams))) {
      setSearchParams(params, { replace: true });
    }
  }, [filters, setSearchParams, searchParams]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchListings(1, true);
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      location: '',
      subcategory: '',
      priceRange: '',
      rating: '',
      availability: ''
    });
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && (currentPage * LISTINGS_PER_PAGE < totalListings)) {
      fetchListings(currentPage + 1);
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Professional Services
            </h1>
            <p className="text-xl text-green-100 mb-8">
              Find trusted service providers for all your needs
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-2 shadow-xl">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                      placeholder="What service do you need?"
                      className="w-full pl-12 pr-4 py-4 text-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      placeholder="Location"
                      className="w-full pl-12 pr-4 py-4 text-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="bg-white border-b border-neutral-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              
              <span className="text-neutral-600">
                {loading ? 'Searching...' : `${totalListings} service${totalListings === 1 ? '' : 's'} found`}
              </span>

              {hasActiveFilters && (
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  className="text-sm text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">View:</span>
                <div className="flex border border-neutral-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Expandable Filters */}
          <motion.div
            initial={false}
            animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-6 border-t border-neutral-200 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Service Category
                  </label>
                  <select
                    value={filters.subcategory}
                    onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option value="">All Categories</option>
                    {serviceSubcategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Price Range
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option value="">Any Price</option>
                    {priceRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={filters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option value="">Any Time</option>
                    <option value="today">Available Today</option>
                    <option value="week">This Week</option>
                    <option value="emergency">Emergency Services</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Listings Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {Array.from({ length: LISTINGS_PER_PAGE }).map((_, index) => (
              <ListingCardSkeleton key={index} viewMode={viewMode} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <X className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Error Loading Services</h3>
            <p className="text-neutral-600 mb-4">{error}</p>
            <Button onClick={() => fetchListings(1, true)} className="bg-green-600 hover:bg-green-700 text-white">
              Try Again
            </Button>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">No Services Found</h3>
            <p className="text-neutral-600 mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more results.' 
                : 'No services are currently available.'}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearAllFilters} variant="outline">
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {listings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ListingCard listing={listing} viewMode={viewMode} />
                </motion.div>
              ))}
            </div>

            {/* Load More Button */}
            {currentPage * LISTINGS_PER_PAGE < totalListings && (
              <div className="text-center mt-12">
                <Button
                  onClick={handleLoadMore}
                  isLoading={isLoadingMore}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More Services'}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ServicesArchivePage;