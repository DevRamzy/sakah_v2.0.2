import React from 'react';
import { Phone, Mail, Globe, MapPin, ExternalLink, Clock, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Listing, BaseListing } from '../../types/listings';
import ListingCard from '../../features/listings/components/ListingCard';
import { getPlaceholderImage } from '../../utils/imageUtils';

interface ListingSidebarProps {
  listing: Listing;
}

const ListingSidebar: React.FC<ListingSidebarProps> = ({ listing }) => {
  // Mock similar listings - in a real app, these would be fetched based on category, location, etc.
  const similarListings: BaseListing[] = [
    {
      id: 'sim1',
      userId: 'mock-user-id',
      businessName: 'Similar Business 1',
      category: listing.category,
      subcategory: listing.subcategory || 'General',
      description: 'A similar business in your area offering comparable services.',
      location: 'Nearby Location',
      isPublished: true,
      images: [{
        id: 'img1',
        listingId: 'sim1',
        storagePath: '',
        path: '',
        isPrimary: true,
        url: getPlaceholderImage()
      }]
    },
    {
      id: 'sim2',
      userId: 'mock-user-id',
      businessName: 'Similar Business 2',
      category: listing.category,
      subcategory: listing.subcategory || 'General',
      description: 'Another business you might be interested in based on your current view.',
      location: 'Another Location',
      isPublished: true,
      images: [{
        id: 'img2',
        listingId: 'sim2',
        storagePath: '',
        path: '',
        isPrimary: true,
        url: getPlaceholderImage()
      }]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Contact Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-neutral-100 hover:shadow-xl transition-shadow duration-300"
      >
        <div className="flex items-center mb-5">
          <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center mr-3">
            <Phone className="w-5 h-5 text-yellow-500" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Contact Information</h3>
        </div>
        
        <div className="space-y-4">
          {listing.phone && (
            <motion.div 
              whileHover={{ x: 5 }}
              className="flex items-center p-3 rounded-lg hover:bg-neutral-50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                <Phone className="w-4 h-4 text-neutral-700" />
              </div>
              <a href={`tel:${listing.phone}`} className="ml-3 text-neutral-700 hover:text-yellow-600 font-medium">
                {listing.phone}
              </a>
            </motion.div>
          )}
          
          {listing.email && (
            <motion.div 
              whileHover={{ x: 5 }}
              className="flex items-center p-3 rounded-lg hover:bg-neutral-50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                <Mail className="w-4 h-4 text-neutral-700" />
              </div>
              <a href={`mailto:${listing.email}`} className="ml-3 text-neutral-700 hover:text-yellow-600 break-all font-medium">
                {listing.email}
              </a>
            </motion.div>
          )}
          
          {listing.website && (
            <motion.div 
              whileHover={{ x: 5 }}
              className="flex items-center p-3 rounded-lg hover:bg-neutral-50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                <Globe className="w-4 h-4 text-neutral-700" />
              </div>
              <a 
                href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 text-neutral-700 hover:text-yellow-600 break-all flex items-center font-medium group"
              >
                <span className="truncate">{listing.website}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1.5 flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Business Hours */}
      {listing.businessHours && typeof listing.businessHours === 'object' && !Array.isArray(listing.businessHours) && Object.keys(listing.businessHours).length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-neutral-100 hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex items-center mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">Business Hours</h3>
          </div>
          
          <div className="space-y-3">
            {Object.entries(listing.businessHours as Record<string, string>).map(([day, hours]) => (
              <div key={day} className="flex justify-between items-center p-2 hover:bg-neutral-50 rounded-lg transition-colors">
                <span className="text-neutral-700 capitalize font-medium">{day}</span>
                <span className={`text-sm px-3 py-1 rounded-full ${hours ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                  {hours || 'Closed'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Location Map Preview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
          <MapPin className="w-5 h-5 text-yellow-500 mr-2" /> Location
        </h3>
        
        <div className="bg-neutral-100 rounded-lg h-40 flex items-center justify-center mb-3">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">{listing.location}</p>
          </div>
        </div>
        
        <button className="w-full bg-neutral-100 text-neutral-700 font-medium py-2 px-4 rounded-lg hover:bg-neutral-200 transition-colors text-sm">
          View on Map
        </button>
      </div>
      
      {/* Similar Listings */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-neutral-100 hover:shadow-xl transition-shadow duration-300"
      >
        <div className="flex items-center mb-5">
          <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center mr-3">
            <Building className="w-5 h-5 text-yellow-500" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Similar Listings</h3>
        </div>
        
        <div className="space-y-4">
          {similarListings.map(item => (
            <div key={item.id} className="mb-4">
              <ListingCard listing={item} viewMode="list" />
            </div>
          ))}
        </div>
        
        <button className="w-full bg-neutral-100 text-neutral-700 font-medium py-2 px-4 rounded-lg hover:bg-neutral-200 transition-colors text-sm mt-4">
          View More
        </button>
      </motion.div>
    </div>
  );
};

export default ListingSidebar;
