export interface Dividend {
  year: number;
  cashDividend: number;
  stockDividend: number;
}

export interface Loans {
  shortTermMillion: number;
  longTermMillion: number;
  dateUpdated: string;
}

export interface ReserveAndIncome {
  reserveInMillion: number;
  ociInMillion: number;
}

export interface Metadata {
  sector: string;
  authorizedCapitalInMillion: number;
  paidUpCapitalInMillion: number;
  shareCount?: number;
}

export interface PriceInfo {
  lastTradingPrice: string;
  movingRangeFor52Weeks: {
    min: number;
    max: number;
  };
}

export interface ShareHolding {
  date: string;
  sponsorOrDirector: number;
  government: number;
  institution: number;
  foreign: number;
  publicShares: number;
}

export interface OtherInfo {
  listingYear: number;
  marketCategory: string;
  shareHoldingParcentages: ShareHolding[];
}

export interface FinancialPerformance {
  year: number;
  profitInMillion: number;
  earningsPerShare: number;
  NAVPerShare: number;
}

export interface Company {
  name: string;
  fullName: string;
  dividends: Dividend[];
  loans: Loans;
  reserveAndIncome: ReserveAndIncome;
  metadata: Metadata;
  priceInfo: PriceInfo;
  otherInfo: OtherInfo;
  financialPerformance: FinancialPerformance[];
  unauditedPERatio?: number;
}
