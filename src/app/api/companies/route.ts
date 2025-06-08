import { NextRequest, NextResponse } from 'next/server'
import { searchCompanies } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params = {
      query: searchParams.get('q') || '',
      industry: searchParams.get('industry') || 'all',
      state: searchParams.get('state') || 'all',
      status: searchParams.get('status') || 'all',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    }

    const { data: companies, error, count } = await searchCompanies(params)

    if (error) {
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    return NextResponse.json({
      companies: companies || [],
      total: count || 0,
      hasMore: (companies?.length || 0) === params.limit
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 