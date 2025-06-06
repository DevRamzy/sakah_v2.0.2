import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Bookmark, Share2, X } from 'lucide-react';

interface ListingActionButtonsProps {
  onContactClick: () => void;
  onSaveClick: () => void;
}

const ListingActionButtons: React.FC<ListingActionButtonsProps> = ({ 
  onContactClick, 
  onSaveClick 
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpanded = () => setExpanded(!expanded);
  
  // Staggered animation for buttons
  const containerVariants = {
    collapsed: {},
    expanded: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const buttonVariants = {
    collapsed: { 
      scale: 0,
      opacity: 0,
      y: 20
    },
    expanded: { 
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <motion.div 
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-30 flex flex-col items-end"
      initial="collapsed"
      animate={expanded ? "expanded" : "collapsed"}
      variants={containerVariants}
    >
      {/* Main action button */}
      <motion.button
        onClick={toggleExpanded}
        className="w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-8 h-1 bg-yellow-500 rounded-full mb-1.5"></div>
              <div className="w-5 h-1 bg-yellow-500 rounded-full ml-3"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Action buttons */}
      <div className="mt-4 flex flex-col space-y-3">
        <AnimatePresence>
          {expanded && (
            <>
              <motion.div
                variants={buttonVariants}
                className="flex items-center justify-end gap-3"
                exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
              >
                <span className="bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                  Contact
                </span>
                <motion.button
                  onClick={() => {
                    onContactClick();
                    setExpanded(false);
                  }}
                  className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Phone className="w-5 h-5 text-black" />
                </motion.button>
              </motion.div>
              
              <motion.div
                variants={buttonVariants}
                className="flex items-center justify-end gap-3"
                exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
              >
                <span className="bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                  Save
                </span>
                <motion.button
                  onClick={() => {
                    onSaveClick();
                    setExpanded(false);
                  }}
                  className="w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-neutral-800 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bookmark className="w-5 h-5 text-white" />
                </motion.button>
              </motion.div>
              
              <motion.div
                variants={buttonVariants}
                className="flex items-center justify-end gap-3"
                exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
              >
                <span className="bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                  Share
                </span>
                <motion.button
                  onClick={() => {
                    // Share functionality could be added here
                    navigator.share?.({ 
                      title: 'Check out this listing', 
                      url: window.location.href 
                    }).catch(() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    });
                    setExpanded(false);
                  }}
                  className="w-14 h-14 bg-neutral-800 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-neutral-700 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share2 className="w-5 h-5 text-white" />
                </motion.button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ListingActionButtons;