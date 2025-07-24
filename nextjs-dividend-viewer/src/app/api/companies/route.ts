import dividendsData from '@/data/dividends.json'
import { Company } from '@/types/Company'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sector = searchParams.get('sector')
    const limit = searchParams.get('limit')
    
    let companies = dividendsData as Company[]
    
    // Filter by sector if specified
    if (sector && sector !== 'All') {
      companies = companies.filter(company => 
        company.metadata.sector === sector
      )
    }
    
    // Limit results if specified
    if (limit) {
      companies = companies.slice(0, parseInt(limit))
    }
    
    return NextResponse.json({
      success: true,
      data: companies,
      total: companies.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch companies data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
