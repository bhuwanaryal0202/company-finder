import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    // Await the params object before accessing its properties
    const resolvedParams = await params
    
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    const id = resolvedParams.id
    
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
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