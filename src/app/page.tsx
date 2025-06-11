'use client'

import { useState, useEffect } from 'react'
import SearchBar from '@/components/SearchBar'
import CompanyCard from '@/components/CompanyCard'
import { Company, SearchFilters } from '@/lib/types'
import { Download, Building2 } from 'lucide-react'
import { useCompanies } from '@/lib/queries'
import Skeleton from '@/components/SkeletonLoading'

const ITEMS_PER_PAGE = 12

// Default filters
const defaultFilters: SearchFilters = {
  query: '',
  industry: 'all',
  state: 'all',
  status: 'all'
}

// Helper function to safely get localStorage items on the client side only
const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export default function Home() {
  // Client-side only state initialization
  const [initialized, setInitialized] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>(defaultFilters);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize state from localStorage only on the client side
  useEffect(() => {
    const filters = getLocalStorageItem('companyFinderFilters', defaultFilters);
    const page = getLocalStorageItem('companyFinderPage', 1);
    
    setCurrentFilters(filters);
    setCurrentPage(typeof page === 'number' ? page : 1);
    setInitialized(true);
  }, []);

  // Use React Query to fetch companies, but only after client-side initialization
  const { data, isLoading: queryLoading, error } = useCompanies({
    ...currentFilters,
    page: currentPage,
    limit: ITEMS_PER_PAGE
  });

  // Save filters and page to localStorage when they change, but only after initialization
  useEffect(() => {
    if (!initialized) return;
    
    try {
      localStorage.setItem('companyFinderFilters', JSON.stringify(currentFilters));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }, [currentFilters, initialized]);

  useEffect(() => {
    if (!initialized) return;
    
    try {
      localStorage.setItem('companyFinderPage', currentPage.toString());
    } catch (error) {
      console.error('Error saving page to localStorage:', error);
    }
  }, [currentPage, initialized]);

  // Update loading state for the UI
  useEffect(() => {
    setIsLoading(queryLoading);
  }, [queryLoading]);

  const handleSearchResults = (results: Company[], total: number, filters: SearchFilters) => {
    setCurrentFilters(filters);
    // Reset to page 1 when search filters change
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        query: currentFilters.query,
        industry: currentFilters.industry,
        state: currentFilters.state,
        status: currentFilters.status,
        page: currentPage.toString()
      });
      const response = await fetch(`/api/export?${params}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'companies.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const companies = data?.companies || [];
  const total = data?.total || 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Company Finder</h1>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Export search results to CSV"
            >
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {initialized ? (
              <SearchBar 
                onResults={handleSearchResults} 
                onLoading={setIsLoading} 
                initialFilters={currentFilters}
              />
            ) : (
              <Skeleton.SearchBar />
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {isLoading ? (
              <Skeleton.CardGrid />
            ) : error ? (
              <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100">
                <p className="text-red-500">Error loading companies. Please try again.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  aria-label="Reload page"
                >
                  Retry
                </button>
              </div>
            ) : companies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {companies.map((company, index) => (
                  <CompanyCard 
                    key={`${company.abn || 'no-abn'}-${company.register_name || company.business_name || 'unnamed'}-${index}`} 
                    company={company} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No companies found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && total > 0 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {Math.ceil(total / ITEMS_PER_PAGE)}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(total / ITEMS_PER_PAGE)}
                  className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
