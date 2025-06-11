import { useQuery } from '@tanstack/react-query'
import { SearchFilters, Company, SearchResponse } from './types'

export const COMPANIES_QUERY_KEY = 'companies'
export const COMPANY_DETAIL_QUERY_KEY = 'company-detail'

interface CompaniesQueryParams extends SearchFilters {
  page: number
  limit: number
}

// Custom error class for better error classification
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Generic fetch function with retries
async function fetchWithRetry<T>(
  url: string, 
  options: RequestInit = {}, 
  retries = 3, 
  backoff = 300
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new ApiError(
          `Request failed: ${response.status} ${errorText}`, 
          response.status
        );
      }
      
      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry for 4xx errors (client errors)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // For network errors or server errors (5xx), retry with exponential backoff
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError || new Error('Request failed with no specific error');
}

async function fetchCompanies(params: CompaniesQueryParams): Promise<SearchResponse> {
  const { query, industry, state, status, page, limit } = params
  const offset = (page - 1) * limit
  
  const searchParams = new URLSearchParams()
  
  // Add parameters safely, avoiding undefined values
  if (query) searchParams.set('q', query)
  if (industry && industry !== 'all') searchParams.set('industry', industry)
  if (state && state !== 'all') searchParams.set('state', state)
  if (status && status !== 'all') searchParams.set('status', status)
  searchParams.set('limit', limit.toString())
  searchParams.set('offset', offset.toString())
  
  try {
    const data = await fetchWithRetry<{
      companies: Company[];
      total: number;
      hasMore: boolean;
    }>(`/api/companies?${searchParams}`);
    return {
      companies: data.companies || [],
      total: data.total || 0,
      hasMore: data.hasMore || false
    }
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
}

export function useCompanies(params: CompaniesQueryParams) {
  return useQuery({
    queryKey: [COMPANIES_QUERY_KEY, params],
    queryFn: () => fetchCompanies(params),
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error) => {
      // Don't retry client errors (4xx)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      // Retry server errors (5xx) and network issues, but limit attempts
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (for caching)
  })
}

async function fetchCompanyById(id: string): Promise<Company> {
  if (!id) {
    throw new Error('Company ID is required')
  }
  
  try {
    return await fetchWithRetry<Company>(`/api/companies/${id}`);
  } catch (error) {
    console.error(`Error fetching company with ID ${id}:`, error);
    throw error;
  }
}

export function useCompanyDetails(id: string | undefined) {
  return useQuery({
    queryKey: [COMPANY_DETAIL_QUERY_KEY, id],
    queryFn: () => fetchCompanyById(id as string),
    enabled: !!id,
    retry: (failureCount, error) => {
      // Don't retry client errors (4xx)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      // Retry server errors (5xx) and network issues, but limit attempts
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (for caching)
  })
} 