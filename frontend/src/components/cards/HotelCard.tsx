import { Link } from 'react-router-dom';
import { MapPin, Users, ArrowRight } from 'lucide-react';
import RatingStars from '../common/RatingStars';
import type { Hotel } from '../../services/hotels';

interface HotelCardProps {
  hotel: Hotel;
  className?: string;
}

export default function HotelCard({ hotel, className = '' }: HotelCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className={`card group hover-lift ${className}`}>
      {/* Image */}
      <div className="relative overflow-hidden rounded-2xl mb-6">
        <img
          src={hotel.thumbnail}
          alt={hotel.name}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-4 right-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2 shadow-lg border border-white/50">
            <span className="text-sm font-bold text-primary-600">
              {formatPrice(hotel.pricePerNight)}/night
            </span>
          </div>
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl px-3 py-1 shadow-lg border border-white/50">
            <RatingStars rating={hotel.stars} size="sm" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Title and Location */}
        <div>
          <Link
            to={`/hotels/${hotel.slug}`}
            className="text-2xl font-bold text-secondary-900 hover:text-primary-600 transition-colors duration-300 line-clamp-1 group-hover:gradient-text"
          >
            {hotel.name}
          </Link>
          <div className="flex items-center space-x-2 mt-2">
            <MapPin className="h-4 w-4 text-primary-500" />
            <span className="text-sm text-secondary-600 font-medium">
              {hotel.city}, {hotel.country}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-secondary-600 text-sm line-clamp-2 leading-relaxed">
          {hotel.description}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2">
          {hotel.amenities?.slice(0, 4).map((amenity) => (
            <span
              key={amenity}
              className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full border border-primary-100 hover:bg-primary-100 transition-colors duration-200"
            >
              {amenity}
            </span>
          ))}
          {hotel.amenities && hotel.amenities.length > 4 && (
            <span className="px-3 py-1 bg-secondary-100 text-secondary-700 text-xs font-medium rounded-full border border-secondary-200">
              +{hotel.amenities.length - 4} more
            </span>
          )}
        </div>

        {/* Room Info and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-secondary-100">
          <div className="flex items-center space-x-1 text-sm text-secondary-600">
            <Users className="h-4 w-4 text-primary-500" />
            <span className="font-medium">Up to {Math.max(...(hotel as any).rooms?.map((r: any) => r.maxGuests) || [1])} guests</span>
          </div>
          <Link
            to={`/hotels/${hotel.slug}`}
            className="btn-primary text-sm px-6 py-3 group"
          >
            <span>View Details</span>
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </div>
  );
}
