import {
  Company,
  Dividend,
  FinancialPerformance,
  ShareHolding,
} from '@/types/Company';
import {
  ApiCompany,
  ApiDividend,
  ApiFinancialPerformance,
  ApiShareholdingPercentage,
} from './dse-api-client';

/**
 * Transform API company data to frontend Company type
 * Now handles comprehensive data from the enhanced API response
 */
export function transformApiCompanyToCompany(apiCompany: ApiCompany): Company {
  return {
    name: apiCompany.code,
    fullName: apiCompany.full_name || apiCompany.code,

    // Transform dividends array
    dividends: apiCompany.dividends
      ? transformApiDividends(apiCompany.dividends)
      : [],

    loans: {
      shortTermMillion: parseFloat(
        apiCompany.short_term_million?.toString() || '0'
      ),
      longTermMillion: parseFloat(
        apiCompany.long_term_million?.toString() || '0'
      ),
      dateUpdated:
        apiCompany.date_updated || new Date().toISOString().split('T')[0],
    },

    reserveAndIncome: {
      reserveInMillion: parseFloat(
        apiCompany.reserve_million?.toString() || '0'
      ),
      ociInMillion: parseFloat(
        apiCompany.unappropriated_profit_million?.toString() || '0'
      ),
    },

    metadata: {
      sector: apiCompany.sector || 'Unknown',
      authorizedCapitalInMillion: parseFloat(
        apiCompany.authorized_capital_million?.toString() || '0'
      ),
      paidUpCapitalInMillion: parseFloat(
        apiCompany.paid_up_capital_million?.toString() || '0'
      ),
      shareCount:
        parseInt(apiCompany.share_count?.toString() || '0') || undefined,
    },

    priceInfo: {
      lastTradingPrice: apiCompany.last_trading_price?.toString() || '0',
      movingRangeFor52Weeks: {
        min: parseFloat(apiCompany.week_52_min?.toString() || '0'),
        max: parseFloat(apiCompany.week_52_max?.toString() || '0'),
      },
    },

    otherInfo: {
      listingYear: apiCompany.listing_year || new Date().getFullYear(),
      marketCategory: apiCompany.market_category || 'A',
      shareHoldingParcentages: apiCompany.shareholding_percentages
        ? transformApiShareholdingPercentages(
            apiCompany.shareholding_percentages
          )
        : [],
    },

    // Transform financial performance array
    financialPerformance: apiCompany.financial_performance
      ? transformApiFinancialPerformance(apiCompany.financial_performance)
      : [],

    unauditedPERatio: apiCompany.unaudited_pe_ratio
      ? parseFloat(apiCompany.unaudited_pe_ratio)
      : undefined,
  };
}

/**
 * Transform API dividends to frontend format
 */
export function transformApiDividends(apiDividends: ApiDividend[]): Dividend[] {
  return apiDividends.map((dividend) => ({
    year: dividend.year,
    cashDividend: parseFloat(dividend.cash_dividend?.toString() || '0'),
    stockDividend: parseFloat(dividend.stock_dividend?.toString() || '0'),
  }));
}

/**
 * Transform API financial performance to frontend format
 */
export function transformApiFinancialPerformance(
  apiPerformance: ApiFinancialPerformance[]
): FinancialPerformance[] {
  return apiPerformance.map((perf) => ({
    year: perf.year,
    profitInMillion: 0, // TODO: Calculate from available data or add to API
    earningsPerShare: parseFloat(perf.earnings_per_share?.toString() || '0'),
    NAVPerShare: parseFloat(perf.net_asset_value_per_share?.toString() || '0'),
  }));
}

/**
 * Transform API shareholding percentages to frontend format
 */
export function transformApiShareholdingPercentages(
  apiShareholding: ApiShareholdingPercentage[]
): ShareHolding[] {
  return apiShareholding.map((holding) => ({
    date: holding.date_recorded,
    sponsorOrDirector: parseFloat(
      holding.sponsor_or_director?.toString() || '0'
    ),
    government: parseFloat(holding.government?.toString() || '0'),
    institution: parseFloat(holding.institution?.toString() || '0'),
    foreign: parseFloat(holding.foreign_ownership?.toString() || '0'),
    publicShares: parseFloat(holding.public_shares?.toString() || '0'),
  }));
}

/**
 * Transform multiple API companies to frontend companies
 */
export function transformApiCompaniesToCompanies(
  apiCompanies: ApiCompany[]
): Company[] {
  return apiCompanies.map(transformApiCompanyToCompany);
}
