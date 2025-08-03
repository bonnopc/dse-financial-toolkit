/**
 * API client for the DSE Financial API
 */

export interface ApiCompany {
  // Basic company info
  id: number;
  code: string;
  full_name: string;
  sector: string;
  listing_year?: number;
  market_category?: string;
  unaudited_pe_ratio?: string;
  created_at: string;
  updated_at: string;

  // Price information (nullable from left join)
  last_trading_price?: number;
  change_amount?: number;
  change_percentage?: number;
  volume?: number;
  value_million?: number;
  trade_count?: number;
  week_52_min?: number;
  week_52_max?: number;

  // Company metadata (nullable from left join)
  authorized_capital_million?: number;
  paid_up_capital_million?: number;
  share_count?: number;

  // Loan information (nullable from left join)
  short_term_million?: number;
  long_term_million?: number;
  date_updated?: string;

  // Reserve information (nullable from left join)
  reserve_million?: number;
  unappropriated_profit_million?: number;

  // Related data arrays
  dividends?: ApiDividend[];
  financial_performance?: ApiFinancialPerformance[];
  shareholding_percentages?: ApiShareholdingPercentage[];
}

export interface ApiDividend {
  id: number;
  company_id: number;
  year: number;
  cash_dividend: number;
  stock_dividend: number;
  created_at: string;
  updated_at: string;
}

export interface ApiFinancialPerformance {
  id: number;
  company_id: number;
  year: number;
  earnings_per_share: number;
  net_operating_cash_flow_per_share: number;
  net_asset_value_per_share: number;
  created_at: string;
  updated_at: string;
}

export interface ApiShareholdingPercentage {
  id: number;
  company_id: number;
  date_recorded: string;
  sponsor_or_director: number;
  government: number;
  institution: number;
  foreign_ownership: number;
  public_shares: number;
  created_at: string;
  updated_at: string;
}

class DSEApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_DSE_API_URL || 'http://localhost:3001/api/v1';
  }

  async getCompanies(params?: {
    sector?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiCompany[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.sector && params.sector !== 'All') {
        searchParams.append('sector', params.sector);
      }
      if (params?.limit) {
        searchParams.append('limit', params.limit.toString());
      }
      if (params?.offset) {
        searchParams.append('offset', params.offset.toString());
      }

      const url = `${this.baseURL}/companies${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  }

  async getCompanyByCode(code: string): Promise<ApiCompany> {
    try {
      const response = await fetch(`${this.baseURL}/companies/${code}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch company ${code}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching company ${code}:`, error);
      throw error;
    }
  }
}

export const dseApiClient = new DSEApiClient();
