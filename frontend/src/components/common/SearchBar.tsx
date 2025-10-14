import { useState } from 'react';
import { Search, Calendar, Users, MapPin } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (params: SearchParams) => void;
  className?: string;
}

interface SearchParams {
  location: string;
  guests: number;
  checkIn: string;
  checkOut: string;
}

export default function SearchBar({ onSearch, className = '' }: SearchBarProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    location: '',
    guests: 2,
    checkIn: '',
    checkOut: '',
  });

  const handleInputChange = (field: keyof SearchParams, value: string | number) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchParams);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className={`bg-white/90 backdrop-blur-md rounded-3xl shadow-large p-8 border border-white/50 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Location */}
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-secondary-700 mb-3">
            Location
          </label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500 group-focus-within:text-primary-600 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Where to?"
              value={searchParams.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="input-field pl-12 hover:border-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 placeholder:text-secondary-400 text-secondary-900"
            />
          </div>
        </div>

        {/* Check-in */}
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-secondary-700 mb-3">
            Check-in
          </label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500 group-focus-within:text-primary-600 transition-colors duration-300" />
            <input
              type="date"
              min={getTodayDate()}
              value={searchParams.checkIn}
              onChange={(e) => handleInputChange('checkIn', e.target.value)}
              className="input-field pl-12 hover:border-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 text-secondary-900"
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-secondary-700 mb-3">
            Check-out
          </label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500 group-focus-within:text-primary-600 transition-colors duration-300" />
            <input
              type="date"
              min={searchParams.checkIn || getTomorrowDate()}
              value={searchParams.checkOut}
              onChange={(e) => handleInputChange('checkOut', e.target.value)}
              className="input-field pl-12 hover:border-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 text-secondary-900"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-secondary-700 mb-3">
            Guests
          </label>
          <div className="relative group">
            <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500 group-focus-within:text-primary-600 transition-colors duration-300" />
            <select
              value={searchParams.guests}
              onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
              className="input-field pl-12 appearance-none hover:border-secondary-300 focus:border-primary-500 focus:ring-primary-500/20 text-secondary-900"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="md:col-span-1 flex items-end">
          <button
            onClick={handleSearch}
            className="btn-primary w-full flex items-center justify-center space-x-2 group"
          >
            <Search className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}

