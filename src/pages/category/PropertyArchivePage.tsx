import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Filter, 
  Grid, 
  List, 
  Home,
  Bed,
  Bath,
  Square,
  DollarSign,
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { getPublishedListings } from '../../features/listings/services/listingService';
import { ListingCategory } from '../../types/listings';
import type { BaseListing } from '../../types/listings';
import ListingCard from '../../features/listings/components/ListingCard';
import ListingCardSkeleton from '../../features/listings/components/ListingCardSkeleton';
import Button from '../../components/ui/Button';

const LISTINGS_PER_PAGE = 12;

const PropertyArchivePage: React.FC = () => {
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
    propertyType: searchParams.get('propertyType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    minSize: searchParams.get('minSize') || '',
    maxSize: searchParams.get('maxSize') || ''
  });

  const propertyTypes = [
    'Residential',
    'Commercial', 
    'Land',
    'Industrial',
    'Mixed Use'
  ];

  const bedroomOptions = ['1+', '2+', '3+', '4+', '5+'];
  const bathroomOptions = ['1+', '1.5+', '2+', '2.5+', '3+', '4+'];

  const fetchListings = useCallback(async (pageToFetch: number, resetListings = false) => {
    if (pageToFetch === 1 || resetListings) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const response = await getPublishedListings({
        category: ListingCategory.PROPERTY,
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
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again later.');
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
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      minSize: '',
      maxSize: ''
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
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Property Listings
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Find your perfect property from our extensive collection
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl p-4 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      placeholder="Location"
                      className="w-full pl-10 pr-4 py-3 text-neutral-800 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  
                  <select
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                    className="w-full px-4 py-3 text-neutral-800 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Property Type</option>
                    {propertyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>

                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      placeholder="Min Price"
                      className="w-full pl-10 pr-4 py-3 text-neutral-800 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      placeholder="Max Price"
                      className="w-full pl-10 pr-4 py-3 text-neutral-800 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

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
                <SlidersHorizontal className="w-4 h-4" />
                Advanced Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              
              <span className="text-neutral-600">
                {loading ? 'Searching...' : `${totalListings} propert${totalListings === 1 ? 'y' : 'ies'} found`}
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
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Expandable Advanced Filters */}
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
                    <Bed className="w-4 h-4 inline mr-1" />
                    Bedrooms
                  </label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Any</option>
                    {bedroomOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <Bath className="w-4 h-4 inline mr-1" />
                    Bathrooms
                  </label>
                  <select
                    value={filters.bathrooms}
                    onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Any</option>
                    {bathroomOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <Square className="w-4 h-4 inline mr-1" />
                    Min Size (sq ft)
                  </label>
                  <input
                    type="number"
                    value={filters.minSize}
                    onChange={(e) => handleFilterChange('minSize', e.target.value)}
                    placeholder="Min sq ft"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <Square className="w-4 h-4 inline mr-1" />
                    Max Size (sq ft)
                  </label>
                  <input
                    type="number"
                    value={filters.maxSize}
                    onChange={(e) => handleFilterChange('maxSize', e.target.value)}
                    placeholder="Max sq ft"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
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
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Error Loading Properties</h3>
            <p className="text-neutral-600 mb-4">{error}</p>
            <Button onClick={() => fetchListings(1, true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              Try Again
            </Button>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <Home className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">No Properties Found</h3>
            <p className="text-neutral-600 mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your search criteria to see more results.' 
                : 'No properties are currently available.'}
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More Properties'}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default PropertyArchivePage;