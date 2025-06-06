import React from 'react';
import { motion } from 'framer-motion';

interface ListingCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

const ListingCardSkeleton: React.FC<ListingCardSkeletonProps> = ({ viewMode = 'grid' }) => {
  const cardVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  if (viewMode === 'list') {
    return (
      <motion.div 
        className="bg-white shadow-md rounded-lg overflow-hidden flex flex-row w-full animate-pulse mb-4"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-1/3 md:w-48 flex-shrink-0 bg-neutral-200 h-36 md:h-auto"></div>
        <div className="p-4 flex flex-col flex-grow w-2/3">
          <div className="h-5 bg-neutral-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-neutral-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="flex gap-2 mb-4">
            <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
            <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
          </div>
          <div className="h-4 bg-neutral-200 rounded w-5/6 mb-4"></div>
          <div className="h-8 bg-neutral-200 rounded w-1/4 mt-auto self-end"></div>
        </div>
      </motion.div>
    );
  }

  // Grid View (default)
  return (
    <motion.div 
      className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-full animate-pulse"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full h-48 bg-neutral-200"></div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="h-6 bg-neutral-200 rounded w-5/6 mb-3"></div>
        <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-neutral-200 rounded w-1/2 mb-4"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
        </div>
        <div className="h-4 bg-neutral-200 rounded w-full mb-4"></div>
        <div className="mt-auto pt-3 border-t border-neutral-100">
          <div className="h-10 bg-neutral-200 rounded w-full"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingCardSkeleton;