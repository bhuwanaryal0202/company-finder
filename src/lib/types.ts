export interface Company {
  id: string
  name: string
  business_name: string
  register_name: string
  abn: string
  acn: string
  status: string
  state: string
  state_number: string
  registration_date: string
  cancellation_date?: string
  industry: string
  registration_number: string
  email: string
  phone: string
}

export interface SearchFilters {
  query: string
  industry: string
  state: string
  status: string
}

export interface SearchResponse {
  companies: Company[]
  total: number
  hasMore: boolean
} 