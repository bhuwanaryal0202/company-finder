import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database query functions
export const searchCompanies = async (params: {
  query?: string
  industry?: string
  state?: string
  status?: string
  limit?: number
  offset?: number
}) => {
  let queryBuilder = supabase
    .from('companies')
    .select('*', { count: 'exact' })
    .order('register_name')

  if (params.query) {
    queryBuilder = queryBuilder.or(`register_name.ilike.%${params.query}%,business_name.ilike.%${params.query}%`)
  }
  
  if (params.industry && params.industry !== 'all') {
    queryBuilder = queryBuilder.ilike('industry', `%${params.industry}%`)
  }
  
  if (params.state && params.state !== 'all') {
    queryBuilder = queryBuilder.eq('state', params.state)
  }
  
  if (params.status && params.status !== 'all') {
    queryBuilder = queryBuilder.eq('status', params.status)
  }

  return queryBuilder.range(
    params.offset || 0, 
    (params.offset || 0) + (params.limit || 20) - 1
  )
} 