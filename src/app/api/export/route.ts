import { NextRequest, NextResponse } from 'next/server'
import { searchCompanies } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Extract search parameters
    const params = {
      query: searchParams.get('query') || '',
      industry: searchParams.get('industry') || 'all',
      state: searchParams.get('state') || 'all',
      status: searchParams.get('status') || 'all',
      // Set a high limit to get all results
      limit: 1000,
      offset: 0
    }
    
    // Use the same search function that powers the main search
    const { data: companies, error } = await searchCompanies(params)

    if (error) {
      console.error('Error fetching companies for export:', error)
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      )
    }

    if (!companies || companies.length === 0) {
      // Generate empty CSV with headers
      const headers = [
        'Register Name',
        'Business Name',
        'Status',
        'Registration Date',
        'State',
        'ABN'
      ]
      return new NextResponse(headers.join(',') + '\n', {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="companies.csv"'
        }
      })
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