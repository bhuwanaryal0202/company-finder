'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Filter } from 'lucide-react'
import { Company, SearchFilters, SearchResponse } from '@/lib/types'
import debounce from 'lodash/debounce'
import RecentSearches from './RecentSearches'
import { useRecentSearches } from '@/lib/hooks'

// Constants for filter options
const industries = [
  'Retail',
  'Services',
  'Technology',
  'Construction',
  'Food & Beverage'
] as const

const states = [
  'NSW',
  'VIC',
  'QLD',
  'WA',
  'SA',
  'TAS',
  'ACT',
  'NT'
] as const

const statuses = [
  'Registered',
  'Deregistered'
] as const

// Default filters
const defaultFilters: SearchFilters = {
  query: '',
  industry: 'all',
  state: 'all',
  status: 'all'
}

interface SearchBarProps {
  onResults: (companies: Company[], total: number, filters: SearchFilters) => void
  onLoading: (loading: boolean) => void
  initialFilters?: SearchFilters
}

export default function SearchBar({ onResults, onLoading, initialFilters }: SearchBarProps) {
  // Use initialFilters or default values
  const safeInitialFilters = initialFilters || defaultFilters
  
  const [searchQuery, setSearchQuery] = useState(safeInitialFilters.query || '')
  const [filters, setFilters] = useState<SearchFilters>({
    query: safeInitialFilters.query || '',
    industry: safeInitialFilters.industry || 'all',
    state: safeInitialFilters.state || 'all',
    status: safeInitialFilters.status || 'all'
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [showRecentSearches, setShowRecentSearches] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const searchCache = useRef<Map<string, { data: SearchResponse; timestamp: number }>>(new Map())
  const ongoingRequests = useRef<Map<string, Promise<SearchResponse>>>(new Map())
  const lastRequestRef = useRef<string>('')
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  const initialSearchPerformed = useRef(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // Get access to recent searches hook
  const { addSearch } = useRecentSearches(5)

  // Debounced search function with increased delay
  const debouncedSearch = useCallback(
    debounce(async (query: string, filters: SearchFilters) => {
      try {
        onLoading(true)
        const params = new URLSearchParams({
          q: query,
          industry: filters.industry,
          state: filters.state,
          status: filters.status
        })

        const cacheKey = params.toString()

        // Prevent duplicate requests
        if (lastRequestRef.current === cacheKey) {
          onLoading(false)
          return
        }
        lastRequestRef.current = cacheKey

        // Check if we have a valid cached result
        const cachedResult = searchCache.current.get(cacheKey)
        if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
          onResults(cachedResult.data.companies, cachedResult.data.total, filters)
          onLoading(false)
          return
        }

        // Check if we have an ongoing request with the same parameters
        const ongoingRequest = ongoingRequests.current.get(cacheKey)
        if (ongoingRequest) {
          try {
            const result = await ongoingRequest
            if (result) {
              onResults(result.companies, result.total, filters)
              onLoading(false)
              return
            }
          } catch {
            // If the ongoing request fails, continue with a new request
            ongoingRequests.current.delete(cacheKey)
          }
        }

        // Cancel any ongoing request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController()

        const response = await fetch(`/api/companies?${params}`, {
          signal: abortControllerRef.current.signal
        })

        if (!response.ok) {
          throw new Error('Search failed')
        }

        const data = await response.json()
        
        // Cache the result
        searchCache.current.set(cacheKey, {
          data,
          timestamp: Date.now()
        })
        
        onResults(data.companies, data.total, filters)
        
        // Add non-empty queries to recent searches
        if (query.trim()) {
          addSearch(query.trim())
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Ignore abort errors
          return
        }
        console.error('Search failed:', error)
      } finally {
        onLoading(false)
      }
    }, 1000),
    [onResults, onLoading, addSearch]
  )

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    debouncedSearch(searchQuery, newFilters)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    const newFilters = { ...filters, query: value }
    setFilters(newFilters)
    debouncedSearch(value, newFilters)
    
    // Show recent searches when input is focused and empty
    setShowRecentSearches(value === '')
  }

  const handleRecentSearchSelect = (query: string) => {
    setSearchQuery(query)
    const newFilters = { ...filters, query }
    setFilters(newFilters)
    debouncedSearch(query, newFilters)
    setShowRecentSearches(false)
    
    // Focus the search input after selecting a recent search
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  // Initial search on mount
  useEffect(() => {
    if (!initialSearchPerformed.current) {
      initialSearchPerformed.current = true
      debouncedSearch(searchQuery, filters)
    }
    
    return () => {
      debouncedSearch.cancel()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup function to clear cache periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, value] of searchCache.current.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          searchCache.current.delete(key)
        }
      }
    }, CACHE_DURATION)

    const currentRequests = ongoingRequests.current

    return () => {
      clearInterval(cleanupInterval)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      currentRequests.clear()
    }
  }, [])

  // Handle input focus
  const handleInputFocus = () => {
    setShowRecentSearches(searchQuery === '')
  }
  
  // Handle input blur
  const handleInputBlur = () => {
    // Delay hiding recent searches to allow clicking on them
    setTimeout(() => {
      setShowRecentSearches(false)
    }, 200)
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search companies by registered name..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-full pl-10 pr-12 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm sm:text-base"
          aria-label="Search companies"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
          aria-expanded={showFilters}
          aria-controls="filter-panel"
          aria-label={showFilters ? "Hide filters" : "Show filters"}
        >
          <Filter className="h-4 sm:h-5 w-4 sm:w-5" />
        </button>
      </div>
      
      {/* Recent Searches */}
      {showRecentSearches && (
        <RecentSearches onSelectSearch={handleRecentSearchSelect} />
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div 
          id="filter-panel"
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 space-y-3 sm:space-y-4" 
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Industry Filter */}
            <div>
              <label htmlFor="industry" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                id="industry"
                value={filters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
                className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white text-xs sm:text-sm"
              >
                <option value="all">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label htmlFor="state" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                id="state"
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white text-xs sm:text-sm"
              >
                <option value="all">All States</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white text-xs sm:text-sm"
              >
                <option value="all">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 