import dividendsData from '@/data/dividends.json'
import { Company } from '@/types/Company'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { companyCode: string } }
) {
  try {
    const companyCode = params.companyCode.toUpperCase()
    
    const company = (dividendsData as Company[]).find(
      company => company.name === companyCode
    )
    
    if (!company) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Company not found',
          companyCode 
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: company,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch company data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
