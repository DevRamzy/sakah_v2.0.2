import React from 'react';
import { Star, MessageSquare, User } from 'lucide-react';
import type { Listing } from '../../types/listings';

interface ReviewsTabContentProps {
  listing: Listing;
}

// Mock review data - in a real app, this would come from an API
interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

const mockReviews: Review[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Ahmed M.',
    rating: 5,
    comment: 'Excellent service! The staff was very professional and helpful. Would definitely recommend to others.',
    date: '2025-05-15',
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Sara K.',
    rating: 4,
    comment: 'Great experience overall. The only reason I\'m not giving 5 stars is because of the wait time.',
    date: '2025-05-10',
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Mohammed A.',
    rating: 5,
    comment: 'Top notch quality and service. I\'ve been a customer for years and they never disappoint.',
    date: '2025-05-01',
  }
];

const ReviewsTabContent: React.FC<ReviewsTabContentProps> = ({ listing }) => {
  // In a real app, we would fetch reviews for this specific listing
  const reviews = mockReviews;
  
  // Calculate average rating
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  
  // Generate star rating breakdown
  const ratingCounts = [0, 0, 0, 0, 0]; // 5 stars, 4 stars, 3 stars, 2 stars, 1 star
  reviews.forEach(review => {
    ratingCounts[5 - review.rating]++;
  });
  
  // Calculate percentages for the rating bars
  const ratingPercentages = ratingCounts.map(count => (count / reviews.length) * 100);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
        <MessageSquare className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Reviews
      </h2>
      
      {/* Rating Summary */}
      <div className="bg-neutral-50 p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="text-center md:text-left md:mr-10">
            <div className="text-5xl font-bold text-neutral-800">{averageRating.toFixed(1)}</div>
            <div className="flex justify-center md:justify-start mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-neutral-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-neutral-500 mt-1">Based on {reviews.length} reviews</div>
          </div>
          
          <div className="flex-1 mt-6 md:mt-0">
            {[5, 4, 3, 2, 1].map((stars, index) => (
              <div key={stars} className="flex items-center mb-2">
                <div className="w-10 text-sm text-neutral-600 font-medium">{stars} star</div>
                <div className="flex-1 mx-2 bg-neutral-200 rounded-full h-2.5">
                  <div
                    className="bg-yellow-500 h-2.5 rounded-full"
                    style={{ width: `${ratingPercentages[index]}%` }}
                  ></div>
                </div>
                <div className="w-10 text-right text-sm text-neutral-600">
                  {ratingCounts[index]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-neutral-200 pb-6 last:border-0">
            <div className="flex items-start">
              <div className="bg-neutral-200 rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">
                {review.avatar ? (
                  <img src={review.avatar} alt={review.userName} className="w-10 h-10 rounded-full" />
                ) : (
                  <User className="w-5 h-5 text-neutral-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-medium text-neutral-800">{review.userName}</h3>
                  <span className="text-sm text-neutral-500">{new Date(review.date).toLocaleDateString()}</span>
                </div>
                <div className="flex mt-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-neutral-600">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Write a Review Button */}
      <div className="mt-8 text-center">
        <button className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors">
          Write a Review
        </button>
      </div>
    </div>
  );
};

export default ReviewsTabContent;
