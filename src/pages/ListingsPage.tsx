import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPublishedListings } from '../features/listings/services/listingService';
import type { BaseListing } from '../types/listings';
import { motion } from 'framer-motion';
import { ListingCategory } from '../types/listings';
import ListingCard from '../features/listings/components/ListingCard';
import ListingCardSkeleton from '../features/listings/components/ListingCardSkeleton';
import Button from '../components/ui/Button';

const LISTINGS_PER_PAGE = 12;
const CAROUSEL_SCROLL_AMOUNT = 300; // pixels

// Icons
const ChevronLeftIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
  </svg>
);

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

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const initialSearchTerm = searchParams.get('q') || '';
  const initialCategoryParam = searchParams.get('categories');
  const initialCategory = initialCategoryParam && Object.values(ListingCategory).includes(initialCategoryParam.toUpperCase() as ListingCategory) 
    ? initialCategoryParam.toUpperCase() as ListingCategory 
    : null;

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | null>(initialCategory);

  const checkCarouselScrollability = useCallback(() => {
    const element = carouselRef.current;
    if (element) {
      setCanScrollPrev(element.scrollLeft > 0);
      setCanScrollNext(element.scrollLeft < element.scrollWidth - element.clientWidth -1); // -1 for precision issues
    }
  }, []);

  useEffect(() => {
    if (!loading && featuredListings.length > 0) {
      checkCarouselScrollability();
      const carouselElement = carouselRef.current;
      carouselElement?.addEventListener('scroll', checkCarouselScrollability);
      window.addEventListener('resize', checkCarouselScrollability);

      return () => {
        carouselElement?.removeEventListener('scroll', checkCarouselScrollability);
        window.removeEventListener('resize', checkCarouselScrollability);
      };
    }
  }, [loading, featuredListings, checkCarouselScrollability]);


  const fetchListingsData = useCallback(async (pageToFetch: number, currentSearchTerm: string, currentCategory: ListingCategory | null) => {
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
        category: currentCategory || undefined,
      });
      
      // Extract data from response
      const listingsData = response.listingsData || [];
      const totalCount = response.totalCount || 0;

      if (pageToFetch === 1) {
        setListings(listingsData);
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
    fetchListingsData(1, searchTerm, selectedCategory);
  }, [searchTerm, selectedCategory, fetchListingsData]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchTerm.trim()) params.q = searchTerm.trim();
    if (selectedCategory) params.categories = selectedCategory;
    if (searchParams.toString() !== new URLSearchParams(params).toString()) {
        setSearchParams(params, { replace: true });
    }
  }, [searchTerm, selectedCategory, setSearchParams, searchParams]);

  const uniqueCategories = useMemo(() => 
    Array.from(new Set(listings.map((listing: BaseListing) => listing.category)))
    .sort((a,b) => a.localeCompare(b)) 
  , [listings]);

  const handleCategorySelect = (category: ListingCategory | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };



  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && (currentPage * LISTINGS_PER_PAGE < totalListings)) {
      fetchListingsData(currentPage + 1, searchTerm, selectedCategory);
    }
  };

  const handleTryAgain = () => {
    fetchListingsData(1, searchTerm, selectedCategory);
  };

  const handleScrollFeatured = (direction: 'prev' | 'next') => {
    const element = carouselRef.current;
    if (element) {
      const scrollVal = direction === 'prev' ? -CAROUSEL_SCROLL_AMOUNT : CAROUSEL_SCROLL_AMOUNT;
      element.scrollBy({ left: scrollVal, behavior: 'smooth' });
      // checkCarouselScrollability will be called by the scroll event listener
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      {/* Header Section */}
      <header className="relative text-white pt-8 pb-6 md:pt-12 md:pb-10 shadow-xl overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black opacity-70"></div>
          <img 
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80" 
            alt="City background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-yellow-400"
          >
            Discover Local Offerings
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mt-3 text-sm sm:text-base text-neutral-300 max-w-xl mx-auto"
          >
            Find the best local businesses and services in your area, curated for you.
          </motion.p>
        </div>
      </header>

      <main className="flex-grow">
        {/* Featured Service Providers Carousel */}
        {!loading && featuredListings.length > 0 && (
          <section className="py-12 md:py-16 bg-neutral-50 border-b border-neutral-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-neutral-800 mb-10 text-center">Featured Service Providers</h2>
              <div className="relative group">
                {canScrollPrev && (
                  <button 
                    onClick={() => handleScrollFeatured('prev')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/70 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform group-hover:opacity-100 opacity-0 focus:opacity-100 -ml-4 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Previous featured listings"
                    disabled={!canScrollPrev}
                  >
                    <ChevronLeftIcon />
                  </button>
                )}
                <div 
                  ref={carouselRef} 
                  className="flex overflow-x-auto space-x-6 pb-6 scrollbar-hide" // scrollbar-hide to hide scrollbar if desired
                >
                  {featuredListings.map(listing => (
                    <motion.div 
                      key={`featured-${listing.id}`}
                      className="flex-shrink-0 w-72 md:w-[300px] transform transition-all duration-300 hover:scale-105"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <ListingCard listing={listing} /> 
                    </motion.div>
                  ))}
                </div>
                {canScrollNext && (
                  <button 
                    onClick={() => handleScrollFeatured('next')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/70 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform group-hover:opacity-100 opacity-0 focus:opacity-100 -mr-4 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Next featured listings"
                    disabled={!canScrollNext}
                  >
                    <ChevronRightIcon />
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Main Content Area: Filters and Listings */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          {/* Pill-style Category Filters */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h3 className="text-2xl font-semibold text-neutral-800">Browse Listings</h3>
                { (searchTerm.trim() || selectedCategory !== null) && (
                    <Button 
                        variant="outline" 
                        onClick={clearAllFilters} 
                        className="text-sm text-yellow-600 hover:text-yellow-700 font-medium px-3 py-1.5 border-yellow-500 hover:bg-yellow-50 focus:ring-yellow-400"
                    >
                        Clear All Filters
                    </Button>
                )}
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <Button
                onClick={() => handleCategorySelect(null)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md transform hover:-translate-y-0.5 
                            ${selectedCategory === null 
                                ? 'bg-yellow-400 text-black ring-2 ring-yellow-500' 
                                : 'bg-white text-neutral-700 hover:bg-neutral-50 ring-1 ring-neutral-300'}`}
              >
                All
              </Button>
              {uniqueCategories.map(categoryValue => (
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
            <p className="mt-6 text-sm text-neutral-600">
                {loading ? 'Searching...' : `${totalListings} result${totalListings === 1 ? '' : 's'} found.`}
            </p>
          </div>

          {/* Listings Display Area */}
          {loading ? (
            <div className="grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: LISTINGS_PER_PAGE }).map((_, index) => (
                <ListingCardSkeleton key={`skeleton-${index}`} />
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
              {searchTerm.trim() || selectedCategory ? <EmptyFilterIcon /> : <EmptyBoxIcon />}
              <h2 className="text-2xl font-semibold text-neutral-700 mt-4">
                {searchTerm.trim() || selectedCategory ? 'No Listings Match Your Criteria' : 'No Listings Available'}
              </h2>
              <p className="mt-2 text-md text-neutral-600">
                {searchTerm.trim() || selectedCategory 
                  ? 'Try adjusting your search term or selected category.' 
                  : 'There are currently no published listings. Please check back later.'}
              </p>
              {(searchTerm.trim() || selectedCategory) && (
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
              className="grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
                  <ListingCard listing={listing} />
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
      {/* Optional: <SiteFooter /> */}
    </div>
  );
};

export default ListingsPage;
