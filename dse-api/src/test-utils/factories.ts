import { CreateCompanyDto } from '../companies/dto/create-company.dto';

/**
 * Factory for creating test company data
 */
export class CompanyTestDataFactory {
  static createBasicCompany(overrides: Partial<any> = {}) {
    const now = new Date();
    return {
      id: 1,
      code: 'TEST',
      full_name: 'Test Company Limited',
      sector: 'Technology',
      listing_year: 2020,
      market_category: 'A',
      unaudited_pe_ratio: 15,
      financial_score: 75.5,
      financial_score_components: JSON.stringify({
        debtScore: 8,
        reserveScore: 7,
        dividendConsistencyScore: 8,
        dividendYieldScore: 7,
        priceValuationScore: 6,
        financialPerformanceScore: 9,
        shareholdingQualityScore: 8,
        peRatioScore: 7,
      }),
      financial_score_calculated_at: now,
      created_at: now,
      updated_at: now,
      ...overrides,
    };
  }

  static createFullCompany(overrides: Partial<any> = {}) {
    const now = new Date();
    const companyId = overrides.id || 1;

    return {
      ...this.createBasicCompany(overrides),
      // Required field for complex company structure
      company_id: companyId,
      // Basic price/trading info
      last_trading_price: 25.5,
      change_amount: 0.5,
      change_percentage: 2.0,
      max_52_week: 30.0,
      min_52_week: 20.0,
      volume: 10000,
      value_million: 0.25,
      trade_count: 150,
      week_52_min: 20.0,
      week_52_max: 30.0,

      // Financial info
      short_term_million: 10,
      long_term_million: 15,
      date_updated: now,
      reserve_million: 100,
      unappropriated_profit_million: 25,
      authorized_capital_million: 100,
      paid_up_capital_million: 80,
      share_count: 10000000,

      // Related entities as separate simple objects (not full companies)
      loans: {
        id: 1,
        created_at: now,
        updated_at: now,
        company_id: companyId,
        short_term_million: 10,
        long_term_million: 15,
        date_updated: '2023-12-31',
      },
      reserves: {
        id: 1,
        created_at: now,
        updated_at: now,
        company_id: companyId,
        reserve_million: 100,
        unappropriated_profit_million: 25,
        date_updated: '2023-12-31',
      },
      metadata: {
        id: 1,
        created_at: now,
        updated_at: now,
        company_id: companyId,
        authorized_capital_million: 100,
        paid_up_capital_million: 80,
        share_count: 10000000,
      },
      priceInfo: {
        ...this.createBasicCompany({ id: companyId }),
        company_id: companyId,
        last_trading_price: 25.5,
        change_amount: 0.5,
        change_percentage: 2.0,
        max_52_week: 30.0,
        min_52_week: 20.0,
        volume: 10000,
        value_million: 0.25,
        trade_count: 150,
        week_52_min: 20.0,
        week_52_max: 30.0,
      },
      dividends: [
        {
          id: companyId,
          created_at: now,
          updated_at: now,
          company_id: companyId,
          year: 2023,
          cash_dividend: 2.5,
          stock_dividend: 0,
        },
      ],
      financial_performance: [
        {
          id: companyId,
          created_at: now,
          updated_at: now,
          company_id: companyId,
          year: 2023,
          earnings_per_share: 3.5,
          net_operating_cash_flow_per_share: 4.0,
          net_asset_value_per_share: 15.0,
        },
      ],
      financialPerformance: [
        {
          id: companyId,
          created_at: now,
          updated_at: now,
          company_id: companyId,
          year: 2023,
          earnings_per_share: 3.5,
          net_operating_cash_flow_per_share: 4.0,
          net_asset_value_per_share: 15.0,
        },
      ],
      shareholding_percentages: [
        {
          id: companyId,
          created_at: now,
          updated_at: now,
          company_id: companyId,
          date_recorded: now,
          sponsor_or_director: 30,
          government: 5,
          institution: 25,
          foreign_ownership: 15,
          public_shares: 25,
        },
      ],
    };
  }

  static createCompanyList(count: number = 3) {
    return Array.from({ length: count }, (_, index) =>
      this.createBasicCompany({
        id: index + 1,
        code: `TEST${index + 1}`,
        full_name: `Test Company ${index + 1} Limited`,
        sector: index % 2 === 0 ? 'Technology' : 'Banking',
      })
    );
  }

  // For controller tests that need the full company structure
  static createFullCompanyList(count: number = 3) {
    return Array.from({ length: count }, (_, index) =>
      this.createFullCompany({
        id: index + 1,
        code: `TEST${index + 1}`,
        full_name: `Test Company ${index + 1} Limited`,
        sector: index % 2 === 0 ? 'Technology' : 'Banking',
      })
    );
  }

  static createCreateCompanyDto(
    overrides: Partial<CreateCompanyDto> = {}
  ): CreateCompanyDto {
    return {
      name: 'TEST',
      fullName: 'Test Company Limited',
      dividends: [
        { year: 2023, cashDividend: 2, stockDividend: 0 },
        { year: 2022, cashDividend: 1.8, stockDividend: 0 },
      ],
      loans: {
        shortTermMillion: 20,
        longTermMillion: 30,
        dateUpdated: '2023-12-31',
      },
      reserveAndIncome: {
        reserveMillion: 50,
        unappropriatedProfitMillion: 25,
        dateUpdated: '2023-12-31',
      },
      metadata: {
        sector: 'Technology',
        authorizedCapitalInMillion: 200,
        paidUpCapitalInMillion: 100,
        shareCount: 10000000,
      },
      priceInfo: {
        lastTradingPrice: 25,
        changeAmount: 1.5,
        changePercentage: 6.38,
        volume: 1000,
        valueMillion: 25,
        tradeCount: 100,
        week52Min: 20,
        week52Max: 30,
      },
      financialPerformance: [
        {
          year: 2023,
          earningsPerShare: 3.5,
          netOperatingCashFlowPerShare: 4,
          netAssetValuePerShare: 15,
        },
        {
          year: 2022,
          earningsPerShare: 3.2,
          netOperatingCashFlowPerShare: 3.8,
          netAssetValuePerShare: 14,
        },
      ],
      otherInfo: {
        listingYear: 2020,
        marketCategory: 'A',
        shareHoldingParcentages: [
          {
            date: '2023-12-31',
            sponsorOrDirector: 30,
            government: 5,
            institution: 25,
            foreign: 15,
            publicShares: 25,
          },
        ],
      },
      unauditedPERatio: 15,
      ...overrides,
    };
  }

  static createFinancialScoreResult(overrides: any = {}) {
    return {
      overall: 75.5,
      grade: 'B' as const,
      color: 'yellow' as const,
      breakdown: {
        debtScore: 8,
        reserveScore: 7,
        dividendConsistencyScore: 8,
        dividendYieldScore: 7,
        priceValuationScore: 6,
        financialPerformanceScore: 9,
        shareholdingQualityScore: 8,
        peRatioScore: 7,
      },
      ...overrides,
    };
  }

  static createExcellentCompanyFinancialData() {
    return {
      code: 'EXCELLENT',
      unauditedPERatio: 12,
      paidUpCapitalInMillion: 100,
      shortTermMillion: 5,
      longTermMillion: 5,
      reserveInMillion: 200,
      lastTradingPrice: 25,
      movingRangeFor52Weeks: { min: 20, max: 30 },
      dividends: [
        { year: 2023, cashDividend: 3, stockDividend: 0 },
        { year: 2022, cashDividend: 2.8, stockDividend: 0 },
        { year: 2021, cashDividend: 2.5, stockDividend: 0 },
        { year: 2020, cashDividend: 2.2, stockDividend: 0 },
        { year: 2019, cashDividend: 2.0, stockDividend: 0 },
      ],
      financialPerformance: [
        { year: 2023, earningsPerShare: 5.0 },
        { year: 2022, earningsPerShare: 4.8 },
        { year: 2021, earningsPerShare: 4.5 },
      ],
      shareholdingPercentages: [
        {
          date: '2023-12-31',
          sponsorOrDirector: 45,
          institution: 35,
          foreign: 20,
        },
      ],
    };
  }
}
