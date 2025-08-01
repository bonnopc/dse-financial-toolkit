import { NextRequest, NextResponse } from 'next/server'

const DSE_API_BASE_URL = process.env.DSE_API_URL || 'http://localhost:3001/api/v1'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sector = searchParams.get('sector')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    
    // Build query parameters for the DSE API
    const apiParams = new URLSearchParams()
    if (sector && sector !== 'All') {
      apiParams.append('sector', sector)
    }
    if (limit) {
      apiParams.append('limit', limit)
    }
    if (offset) {
      apiParams.append('offset', offset)
    }

    // Fetch from DSE API
    const dseApiUrl = `${DSE_API_BASE_URL}/companies${apiParams.toString() ? `?${apiParams.toString()}` : ''}`
    const response = await fetch(dseApiUrl)
    
    if (!response.ok) {
      throw new Error(`DSE API error: ${response.statusText}`)
    }

    const companies = await response.json()
    
    return NextResponse.json(companies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}
