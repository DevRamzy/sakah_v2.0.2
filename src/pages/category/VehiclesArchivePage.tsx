import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Filter, 
  Grid, 
  List, 
  Car,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  Truck,
  Bike
} from 'lucide-react';
import { getPublishedListings } from '../../features/listings/services/listingService';
import { ListingCategory } from '../../types/listings';
import type { BaseListing } from '../../types/listings';
import ListingCard from '../../features/listings/components/ListingCard';
import ListingCardSkeleton from '../../features/listings/components/ListingCardSkeleton';
import Button from '../../components/ui/Button';

const LISTINGS_PER_PAGE = 12;

const VehiclesArchivePage: React.FC = () => {
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
    vehicleType: searchParams.get('vehicleType') || '',
    brand: searchParams.get('brand') || '',
    priceRange: searchParams.get('priceRange') || '',
    year: searchParams.get('year') || '',
    financing: searchParams.get('financing') || ''
  });

  const vehicleTypes = [
    'New Cars',
    'Used Cars',
    'Luxury Vehicles',
    'Commercial Vehicles',
    'Motorcycles',
    'Electric Vehicles'
  ];

  const popularBrands = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 
    'Audi', 'Nissan', 'Hyundai', 'Volkswagen', 'Mazda', 'Subaru'
  ];

  const priceRanges = [
    { label: 'Under $15,000', value: '0-15000' },
    { label: '$15,000 - $30,000', value: '15000-30000' },
    { label: '$30,000 - $50,000', value: '30000-50000' },
    { label: '$50,000 - $100,000', value: '50000-100000' },
    { label: 'Over $100,000', value: '100000+' }
  ];

  const yearRanges = [
    { label: '2023 - 2025', value: '2023-2025' },
    { label: '2020 - 2022', value: '2020-2022' },
    { label: '2015 - 2019', value: '2015-2019' },
    { label: '2010 - 2014', value: '2010-2014' },
    { label: 'Before 2010', value: '-2010' }
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
        category: ListingCategory.AUTO_DEALERSHIP,
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
      console.error('Error fetching dealerships:', err);
      setError('Failed to load dealerships. Please try again later.');
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
      vehicleType: '',
      brand: '',
      priceRange: '',
      year: '',
      financing: ''
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
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Vehicle Dealerships
            </h1>
            <p className="text-xl text-red-100 mb-8">
              Find trusted dealerships with quality vehicles
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
                      placeholder="Search dealerships or vehicles"
                      className="w-full pl-12 pr-4 py-4 text-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      placeholder="Location"
                      className="w-full pl-12 pr-4 py-4 text-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-xl"
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
                <SlidersHorizontal className="w-4 h-4" />
                Advanced Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              
              <span className="text-neutral-600">
                {loading ? 'Searching...' : `${totalListings} dealership${totalListings === 1 ? '' : 's'} found`}
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
                    className={`p-2 ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
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
                    <Car className="w-4 h-4 inline mr-1" />
                    Vehicle Type
                  </label>
                  <select
                    value={filters.vehicleType}
                    onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <option value="">All Types</option>
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Brand
                  </label>
                  <select
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <option value="">All Brands</option>
                    {popularBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Price Range
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <option value="">Any Price</option>
                    {priceRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Year
                  </label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <option value="">Any Year</option>
                    {yearRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Financing Options
                  </label>
                  <select
                    value={filters.financing}
                    onChange={(e) => handleFilterChange('financing', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <option value="">Any</option>
                    <option value="true">Financing Available</option>
                    <option value="false">No Financing Required</option>
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
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Error Loading Dealerships</h3>
            <p className="text-neutral-600 mb-4">{error}</p>
            <Button onClick={() => fetchListings(1, true)} className="bg-red-600 hover:bg-red-700 text-white">
              Try Again
            </Button>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <Car className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">No Dealerships Found</h3>
            <p className="text-neutral-600 mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more results.' 
                : 'No dealerships are currently available.'}
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
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More Dealerships'}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default VehiclesArchivePage;