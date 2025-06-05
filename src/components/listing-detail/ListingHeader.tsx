import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Calendar, CheckCircle2 } from 'lucide-react';

interface Rating {
  value: string;
  count: number;
}

interface ListingHeaderProps {
  location: string;
  isPublished: boolean;
  rating?: Rating | null;
}

const ListingHeader: React.FC<ListingHeaderProps> = ({ location, isPublished, rating }) => {
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div 
      className="mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Rating section with enhanced styling */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-6">
        {rating && (
          <div className="flex items-center bg-white border border-neutral-200 px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-center w-10 h-10 bg-yellow-50 rounded-full mr-3">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-xl font-semibold text-neutral-900">{rating.value}</span>
                <span className="ml-1 text-sm text-neutral-500">/ 5.0</span>
              </div>
              <span className="text-xs text-neutral-500">{rating.count} reviews</span>
            </div>
          </div>
        )}
        
        {/* Last updated info */}
        <div className="flex items-center bg-white border border-neutral-200 px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full mr-3">
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="text-sm font-medium text-neutral-900">Updated</div>
            <span className="text-xs text-neutral-500">June 2, 2025</span>
          </div>
        </div>
        
        {/* Status badge */}
        <div className="flex items-center bg-white border border-neutral-200 px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className={`flex items-center justify-center w-10 h-10 ${isPublished ? 'bg-green-50' : 'bg-yellow-50'} rounded-full mr-3`}>
            {isPublished ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Clock className="w-5 h-5 text-yellow-500" />
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-neutral-900">Status</div>
            <span className={`text-xs ${isPublished ? 'text-green-600' : 'text-yellow-600'} font-medium`}>
              {isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </motion.div>
      
      {/* Location with enhanced styling */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center mb-4 bg-white border border-neutral-200 px-5 py-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-full mr-4">
          <MapPin className="w-6 h-6 text-neutral-700" />
        </div>
        <div>
          <div className="text-sm font-medium text-neutral-500 mb-1">Location</div>
          <span className="text-lg font-medium text-neutral-900">{location}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ListingHeader;
