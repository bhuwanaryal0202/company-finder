import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query') || ''
    const industry = searchParams.get('industry') || 'all'
    const state = searchParams.get('state') || 'all'
    const status = searchParams.get('status') || 'all'

    let dbQuery = supabase.from('companies').select('*')

    // Apply filters
    if (query) {
      dbQuery = dbQuery.ilike('register_name', `%${query}%`)
    }
    
    if (industry !== 'all') {
      dbQuery = dbQuery.eq('business_name', industry)
    }
    
    if (state !== 'all') {
      dbQuery = dbQuery.eq('state', state)
    }
    
    if (status !== 'all') {
      dbQuery = dbQuery.eq('status', status)
    }

    // Order by register_name
    dbQuery = dbQuery.order('register_name')

    const { data: companies, error } = await dbQuery

    if (error) {
      console.error('Error fetching companies for export:', error)
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      )
    }

    // Generate CSV
    const headers = [
      'Register Name',
      'Business Name',
      'Status',
      'Registration Date',
      'State',
      'ABN'
    ]

    // CSV header row
    let csv = headers.join(',') + '\n'

    // CSV data rows
    companies.forEach((company) => {
      const row = [
        escapeCsvValue(company.register_name || ''),
        escapeCsvValue(company.business_name || ''),
        escapeCsvValue(company.status || ''),
        escapeCsvValue(company.registration_date || ''),
        escapeCsvValue(company.state || ''),
        escapeCsvValue(company.abn || '')
      ]
      csv += row.join(',') + '\n'
    })

    // Return CSV with proper headers
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="companies.csv"'
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}

// Helper function to escape CSV values
function escapeCsvValue(value: string) {
  // If the value contains commas, quotes, or newlines, wrap it in quotes
  if (value && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
    // Double any quotes in the value
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
} 