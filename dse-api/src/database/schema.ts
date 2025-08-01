// Database schema types for Kysely
export interface Database {
  companies: CompanyTable;
  dividends: DividendTable;
  company_loans: CompanyLoanTable;
  company_reserves: CompanyReserveTable;
  company_metadata: CompanyMetadataTable;
  financial_performance: FinancialPerformanceTable;
  price_info: PriceInfoTable;
  shareholding_percentages: ShareholdingPercentageTable;
}

export interface CompanyTable {
  id: number;
  code: string;
  full_name: string | null;
  sector: string | null;
  listing_year: number | null;
  market_category: string | null;
  unaudited_pe_ratio: number | null;
  // Financial Score fields
  financial_score: number | null;
  financial_score_components: string | null; // JSON string containing score breakdown
  financial_score_calculated_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface DividendTable {
  id: number;
  company_id: number;
  year: number;
  cash_dividend: number;
  stock_dividend: number;
  created_at: Date;
  updated_at: Date;
}

export interface CompanyLoanTable {
  id: number;
  company_id: number;
  short_term_million: number;
  long_term_million: number;
  date_updated: string;
  created_at: Date;
  updated_at: Date;
}

export interface CompanyReserveTable {
  id: number;
  company_id: number;
  reserve_million: number;
  unappropriated_profit_million: number;
  date_updated: string;
  created_at: Date;
  updated_at: Date;
}

export interface CompanyMetadataTable {
  id: number;
  company_id: number;
  authorized_capital_million: number;
  paid_up_capital_million: number;
  share_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface FinancialPerformanceTable {
  id: number;
  company_id: number;
  year: number;
  earnings_per_share: number;
  net_operating_cash_flow_per_share: number;
  net_asset_value_per_share: number;
  created_at: Date;
  updated_at: Date;
}

export interface PriceInfoTable {
  id: number;
  company_id: number;
  last_trading_price: number;
  change_amount: number;
  change_percentage: number;
  volume: number;
  value_million: number;
  trade_count: number;
  week_52_min: number;
  week_52_max: number;
  created_at: Date;
  updated_at: Date;
}

export interface ShareholdingPercentageTable {
  id: number;
  company_id: number;
  date_recorded: Date;
  sponsor_or_director: number;
  government: number;
  institution: number;
  foreign_ownership: number;
  public_shares: number;
  created_at: Date;
  updated_at: Date;
}
