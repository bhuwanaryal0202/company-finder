import { useQuery } from '@tanstack/react-query'
import { SearchFilters, Company, SearchResponse } from './types'

export const COMPANIES_QUERY_KEY = 'companies'
export const COMPANY_DETAIL_QUERY_KEY = 'company-detail'

interface CompaniesQueryParams extends SearchFilters {
  page: number
  limit: number
}

async function fetchCompanies(params: CompaniesQueryParams): Promise<SearchResponse> {
  const { query, industry, state, status, page, limit } = params
  const offset = (page - 1) * limit
  
  const searchParams = new URLSearchParams()
  
  // Add parameters safely, avoiding undefined values
  if (query) searchParams.set('q', query)
  if (industry) searchParams.set('industry', industry)
  if (state) searchParams.set('state', state)
  if (status) searchParams.set('status', status)
  searchParams.set('limit', limit.toString())
  searchParams.set('offset', offset.toString())
  
  const response = await fetch(`/api/companies?${searchParams}`)
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`Failed to fetch companies: ${response.status} ${errorText}`)
  }
  
  const data = await response.json()
  return {
    companies: data.companies || [],
    total: data.total || 0,
    hasMore: data.hasMore || false
  }
}

export function useCompanies(params: CompaniesQueryParams) {
  return useQuery({
    queryKey: [COMPANIES_QUERY_KEY, params],
    queryFn: () => fetchCompanies(params),
    placeholderData: (previousData) => previousData,
    retry: (failureCount) => {
      // Only retry a few times
      return failureCount < 2
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

async function fetchCompanyById(id: string): Promise<Company> {
  if (!id) {
    throw new Error('Company ID is required')
  }
  
  const response = await fetch(`/api/companies/${id}`)
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`Failed to fetch company: ${response.status} ${errorText}`)
  }
  
  return response.json()
}

export function useCompanyDetails(id: string | undefined) {
  return useQuery({
    queryKey: [COMPANY_DETAIL_QUERY_KEY, id],
    queryFn: () => fetchCompanyById(id as string),
    enabled: !!id,
    retry: (failureCount) => {
      // Only retry a few times
      return failureCount < 2
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
} 