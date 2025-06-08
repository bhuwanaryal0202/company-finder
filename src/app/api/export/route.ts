import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

import { promises as fs } from 'fs'
import path from 'path'
import { SearchFilters } from '@/lib/types'

interface CompanyRecord {
  register_name: string
  abn: string
  acn: string
  status: string
  state: string
  registration_date: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filters: SearchFilters = {
      query: searchParams.get('q') || '',
      industry: searchParams.get('industry') || 'all',
      state: searchParams.get('state') || 'all',
      status: searchParams.get('status') || 'all'
    }

    // Create a temporary file path
    const tempFilePath = path.join(process.cwd(), 'temp', 'companies.csv')
    
    // Ensure the temp directory exists
    await fs.mkdir(path.dirname(tempFilePath), { recursive: true })

    // Build query
    let queryBuilder = supabase
      .from('companies')
      .select('*')
      .order('register_name')

    // Apply filters
    if (filters.query) {
      queryBuilder = queryBuilder.ilike('register_name', `%${filters.query}%`)
    }
    
    if (filters.industry && filters.industry !== 'all') {
      queryBuilder = queryBuilder.ilike('business_name', `%${filters.industry}%`)
    }
    
    if (filters.state && filters.state !== 'all') {
      queryBuilder = queryBuilder.eq('state', filters.state)
    }
    
    if (filters.status && filters.status !== 'all') {
      queryBuilder = queryBuilder.eq('status', filters.status)
    }

    // Get all results (no pagination for export)
    const { data: companies, error } = await queryBuilder

    if (error) {
      throw new Error('Failed to fetch companies')
    }

    // Generate CSV content
    const headers = ['Company Name', 'ABN', 'ACN', 'Status', 'State', 'Registration Date']
    const csvRows = [
      headers.join(','),
      ...companies.map((company: CompanyRecord) => [
        `"${(company.register_name || '').replace(/"/g, '""')}"`,
        company.abn || '',
        company.acn || '',
        company.status || '',
        company.state || '',
        company.registration_date || ''
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')

    // Return the CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="companies.csv"'
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export companies' },
      { status: 500 }
    )
  }
} 