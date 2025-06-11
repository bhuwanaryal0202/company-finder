import React, { useEffect, useState } from 'react';
import { X, Clock, ArrowUpRight } from 'lucide-react';
import { useRecentSearches } from '@/lib/hooks';

interface RecentSearchesProps {
  onSelectSearch: (search: string) => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({ onSelectSearch }) => {
  const { recentSearches, removeSearch, clearSearches } = useRecentSearches(5);
  const [mounted, setMounted] = useState(false);

  // Only render after component has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || recentSearches.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 bg-white rounded-md shadow-sm border border-gray-200 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          Recent Searches
        </h3>
        <button
          onClick={clearSearches}
          className="text-xs text-gray-500 hover:text-gray-700"
          aria-label="Clear all recent searches"
        >
          Clear All
        </button>
      </div>
      
      <ul className="space-y-1" role="list">
        {recentSearches.map((search, index) => (
          <li key={`${search}-${index}`} className="flex items-center justify-between">
            <button
              onClick={() => onSelectSearch(search)}
              className="text-xs sm:text-sm text-gray-700 hover:text-blue-600 hover:underline flex items-center py-1 px-2 rounded-md hover:bg-gray-50 flex-grow text-left"
              aria-label={`Search for ${search}`}
            >
              <span className="truncate">{search}</span>
              <ArrowUpRight className="w-3 h-3 ml-1 flex-shrink-0" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeSearch(search);
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label={`Remove ${search} from recent searches`}
            >
              <X className="w-3 h-3" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentSearches; 