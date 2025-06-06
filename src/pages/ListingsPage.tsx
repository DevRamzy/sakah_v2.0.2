import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getPublishedListings } from '../features/listings/services/listingService';
import type { BaseListing } from '../types/listings';
import { motion } from 'framer-motion';
import { ListingCategory } from '../types/listings';
import ListingCard from '../features/listings/components/ListingCard';
import ListingCardSkeleton from '../features/listings/components/ListingCardSkeleton';
import Button from '../components/ui/Button';
import { Search, MapPin, Filter, Grid, List, X, ChevronDown, ChevronUp } from 'lucide-react';

const LISTINGS_PER_PAGE = 12;

// Error and Empty State Icons
const ErrorIcon = () => (
  <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const EmptyFilterIcon = () => (
  <svg className="w-12 h-12 mx-auto mb-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4zM21 21l-6-6"></path>
  </svg>
);

const EmptyBoxIcon = () => (
  <svg className="w-12 h-12 mx-auto mb-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
  </svg>
);

const ListingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<BaseListing[]>([]);
  const [featuredListings, setFeaturedListings] = useState<BaseListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalListings, setTotalListings] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Initialize state from URL parameters
  const initialSearchTerm = searchParams.get('q') || '';
  const initialLocationTerm = searchParams.get('location') || '';
  const initialCategoryParam = searchParams.get('categories');
  const initialCategory = initialCategoryParam && Object.values(ListingCategory).includes(initialCategoryParam.toUpperCase() as ListingCategory) 
    ? initialCategoryParam.toUpperCase() as ListingCategory 
    : null;

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [locationTerm, setLocationTerm] = useState(initialLocationTerm);
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | null>(initialCategory);

  const fetchListingsData = useCallback(async (pageToFetch: number, currentSearchTerm: string, currentLocationTerm: string, currentCategory: ListingCategory | null) => {
    if (pageToFetch === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const response = await getPublishedListings({
        page: pageToFetch,
        limit: LISTINGS_PER_PAGE,
        searchTerm: currentSearchTerm.trim() || undefined,
        location: currentLocationTerm.trim() || undefined,
        category: currentCategory || undefined,
      });
      
      const listingsData = response.listingsData || [];
      const totalCount = response.totalCount || 0;

      if (pageToFetch === 1) {
        setListings(listingsData);
        // Set first 5 listings as featured
        setFeaturedListings(listingsData.slice(0, 5));
      } else {
        setListings(prevListings => [...prevListings, ...listingsData]);
      }
      setTotalListings(totalCount);
      setCurrentPage(pageToFetch);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings. Please try again later.');
      if (pageToFetch === 1) setListings([]); 
    } finally {
      if (pageToFetch === 1) {
        setLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchListingsData(1, searchTerm, locationTerm, selectedCategory);
  }, [searchTerm, locationTerm, selectedCategory, fetchListingsData]);

  // Update URL parameters when search state changes
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchTerm.trim()) params.q = searchTerm.trim();
    if (locationTerm.trim()) params.location = locationTerm.trim();
    if (selectedCategory) params.categories = selectedCategory;
    if (searchParams.toString() !== new URLSearchParams(params).toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [searchTerm, locationTerm, selectedCategory, setSearchParams, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchListingsData(1, searchTerm, locationTerm, selectedCategory);
  };

  const handleCategorySelect = (category: ListingCategory | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setLocationTerm('');
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && (currentPage * LISTINGS_PER_PAGE < totalListings)) {
      fetchListingsData(currentPage + 1, searchTerm, locationTerm, selectedCategory);
    }
  };

  const handleTryAgain = () => {
    fetchListingsData(1, searchTerm, locationTerm, selectedCategory);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              All Listings
            </h1>
            <p className="text-xl text-black/80 mb-8 max-w-3xl mx-auto">
              Browse all listings or use our search and filters to find exactly what you're looking for
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-12">
              <div className="bg-white rounded-2xl p-2 shadow-xl">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="What are you looking for?"
                      className="w-full pl-12 pr-4 py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-neutral-800 placeholder-neutral-500"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={locationTerm}
                      onChange={(e) => setLocationTerm(e.target.value)}
                      placeholder="Enter location..."
                      className="w-full pl-12 pr-4 py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-neutral-800 placeholder-neutral-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-black hover:bg-neutral-800 text-yellow-400 font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 lg:w-auto w-full"
                  >
                    <Search className="w-5 h-5" />
                    Search
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Filter Toggle and Results Count */}
      <section className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center gap-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <span className="text-neutral-600">
                {loading ? 'Searching...' : `${totalListings} result${totalListings === 1 ? '' : 's'} found`}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">View:</span>
                <div className="flex border border-neutral-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-yellow-400 text-black' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-yellow-400 text-black' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {(searchTerm.trim() || locationTerm.trim() || selectedCategory !== null) && (
                <Button 
                  variant="outline" 
                  onClick={clearAllFilters} 
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-medium border-yellow-500 hover:bg-yellow-50 focus:ring-yellow-400"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Collapsible Categories Section */}
          <motion.div
            initial={false}
            animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-6 border-t border-neutral-200 mt-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Browse by Category</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => handleCategorySelect(null)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md transform hover:-translate-y-0.5 
                              ${selectedCategory === null 
                                  ? 'bg-yellow-400 text-black ring-2 ring-yellow-500' 
                                  : 'bg-white text-neutral-700 hover:bg-neutral-50 ring-1 ring-neutral-300'}`}
                >
                  All Categories
                </Button>
                {Object.values(ListingCategory).map(categoryValue => (
                  <Button
                    key={categoryValue}
                    onClick={() => handleCategorySelect(categoryValue as ListingCategory)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md transform hover:-translate-y-0.5 capitalize 
                                ${selectedCategory === categoryValue 
                                    ? 'bg-yellow-400 text-black ring-2 ring-yellow-500' 
                                    : 'bg-white text-neutral-700 hover:bg-neutral-50 ring-1 ring-neutral-300'}`}
                  >
                    {categoryValue.toLowerCase().replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="flex-grow">
        {/* Featured Listings Carousel (only show if we have featured listings and on first page) */}
        {!loading && !error && featuredListings.length > 0 && currentPage === 1 && !searchTerm && !locationTerm && !selectedCategory && (
          <section className="py-10 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
                <span className="w-2 h-8 bg-yellow-400 rounded-full mr-3"></span>
                Featured Listings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredListings.slice(0, 3).map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ListingCard listing={listing} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Main Listings Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Listings Display Area */}
          {loading ? (
            <div className={`grid gap-x-6 gap-y-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {Array.from({ length: LISTINGS_PER_PAGE }).map((_, index) => (
                <ListingCardSkeleton key={`skeleton-${index}`} viewMode={viewMode} />
              ))}
            </div>
          ) : error ? (
            <motion.div 
              className="text-center py-12 px-4 sm:px-6 lg:px-8 bg-white border border-red-200 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ErrorIcon />
              <p className="text-xl font-semibold text-neutral-700 mt-4">Oops! Something went wrong.</p>
              <p className="text-neutral-500 mt-2">{error}</p>
              <Button 
                onClick={handleTryAgain}
                variant="primary"
                className="mt-8 bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                Try Again
              </Button>
            </motion.div>
          ) : totalListings === 0 ? ( 
            <motion.div 
              className="text-center py-12 px-4 sm:px-6 lg:px-8 bg-white border border-neutral-200 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {searchTerm.trim() || locationTerm.trim() || selectedCategory ? <EmptyFilterIcon /> : <EmptyBoxIcon />}
              <h2 className="text-2xl font-semibold text-neutral-700 mt-4">
                {searchTerm.trim() || locationTerm.trim() || selectedCategory ? 'No Listings Match Your Criteria' : 'No Listings Available'}
              </h2>
              <p className="mt-2 text-md text-neutral-600">
                {searchTerm.trim() || locationTerm.trim() || selectedCategory 
                  ? 'Try adjusting your search terms or selected category.' 
                  : 'There are currently no published listings. Please check back later.'}
              </p>
              {(searchTerm.trim() || locationTerm.trim() || selectedCategory) && (
                <Button 
                  onClick={clearAllFilters} 
                  variant="outline"
                  className="mt-8 border-yellow-500 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-400"
                >
                  Clear All Filters
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              className={`grid gap-x-6 gap-y-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.05 } }
              }}
            >
              {listings.map((listing: BaseListing) => (
                <motion.div
                  key={listing.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
                  }}
                >
                  <ListingCard listing={listing} viewMode={viewMode} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Load More Button */}
          {!loading && !error && listings.length > 0 && (currentPage * LISTINGS_PER_PAGE < totalListings) && (
            <div className="mt-12 text-center">
              <Button
                onClick={handleLoadMore}
                variant="primary"
                isLoading={isLoadingMore}
                className="bg-yellow-400 text-black hover:bg-yellow-500 py-3 px-8 rounded-lg font-semibold shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
              >
                {isLoadingMore ? 'Loading...' : 'Load More Listings'}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ListingsPage;