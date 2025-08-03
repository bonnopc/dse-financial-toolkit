export interface FinancialScoreBreakdown {
  debtScore: number;
  reserveScore: number;
  dividendConsistencyScore: number;
  dividendYieldScore: number;
  priceValuationScore: number;
  financialPerformanceScore: number;
  shareholdingQualityScore: number;
  peRatioScore: number;
}

export interface FinancialScore {
  overall: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  color: 'green' | 'yellow' | 'orange' | 'red' | 'gray';
  breakdown: FinancialScoreBreakdown;
}

export interface CompanyWithScore {
  id: number;
  code: string;
  full_name: string;
  sector: string;
  listing_year?: number;
  market_category?: string;
  unaudited_pe_ratio?: number;
  created_at: string;
  updated_at: string;

  // Price information
  last_trading_price?: number;
  change_amount?: number;
  change_percentage?: number;
  volume?: number;
  value_million?: number;
  trade_count?: number;
  week_52_min?: number;
  week_52_max?: number;

  // Company metadata
  authorized_capital_million?: number;
  paid_up_capital_million?: number;
  share_count?: number;

  // Loan information
  short_term_million?: number;
  long_term_million?: number;
  date_updated?: string;

  // Reserve information
  reserve_million?: number;
  unappropriated_profit_million?: number;

  // Related data arrays
  dividends?: Array<{
    id: number;
    company_id: number;
    year: number;
    cash_dividend: number;
    stock_dividend: number;
    created_at: string;
    updated_at: string;
  }>;

  financial_performance?: Array<{
    id: number;
    company_id: number;
    year: number;
    profit_million: number;
    earnings_per_share: number;
    nav_per_share: number;
    created_at: string;
    updated_at: string;
  }>;

  shareholding_percentages?: Array<{
    id: number;
    company_id: number;
    date: string;
    sponsor_or_director: number;
    government: number;
    institution: number;
    foreign: number;
    public_shares: number;
    created_at: string;
    updated_at: string;
  }>;

  // Financial score (calculated)
  financial_score?: FinancialScore;
}
