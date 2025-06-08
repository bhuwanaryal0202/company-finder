import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 