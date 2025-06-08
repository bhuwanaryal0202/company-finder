'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Filter } from 'lucide-react'
import { Company, SearchFilters, SearchResponse } from '@/lib/types'
import debounce from 'lodash/debounce'

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

interface SearchBarProps {
  onResults: (companies: Company[], total: number, filters: SearchFilters) => void
  onLoading: (loading: boolean) => void
}

export default function SearchBar({ onResults, onLoading }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    industry: 'all',
    state: 'all',
    status: 'all'
  })
  const [showFilters, setShowFilters] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const searchCache = useRef<Map<string, { data: SearchResponse; timestamp: number }>>(new Map())
  const ongoingRequests = useRef<Map<string, Promise<SearchResponse>>>(new Map())
  const lastRequestRef = useRef<string>('')
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

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
    [onResults, onLoading]
  )

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    debouncedSearch(searchQuery, newFilters)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    debouncedSearch(value, filters)
  }

  // Initial search on mount
  useEffect(() => {
    debouncedSearch('', filters)
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

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-600" />
        </div>
        <input
          type="text"
          placeholder="Search companies by registered name..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
        >
          <Filter className="h-5 w-5" />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Industry Filter */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                id="industry"
                value={filters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                id="state"
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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