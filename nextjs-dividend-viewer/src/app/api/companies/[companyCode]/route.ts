import { NextRequest, NextResponse } from 'next/server'

const DSE_API_BASE_URL = process.env.DSE_API_URL || 'http://localhost:3001/api/v1'

export async function GET(
  request: NextRequest,
  { params }: { params: { companyCode: string } }
) {
  try {
    const { companyCode } = params
    
    if (!companyCode) {
      return NextResponse.json(
        { error: 'Company code is required' },
        { status: 400 }
      )
    }

    // Fetch from DSE API
    const dseApiUrl = `${DSE_API_BASE_URL}/companies/${companyCode}`
    const response = await fetch(dseApiUrl)
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        )
      }
      throw new Error(`DSE API error: ${response.statusText}`)
    }

    const company = await response.json()
    
    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company data' },
      { status: 500 }
    )
  }
}
