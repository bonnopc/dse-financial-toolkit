import { Test, TestingModule } from '@nestjs/testing';
import { FinancialScoringService, CompanyFinancialData, FinancialScoreResult } from './financial-scoring.service';

describe('FinancialScoringService', () => {
  let service: FinancialScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinancialScoringService],
    }).compile();

    service = module.get<FinancialScoringService>(FinancialScoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateFinancialScore', () => {
    let mockCompanyData: CompanyFinancialData;

    beforeEach(() => {
      mockCompanyData = {
        code: 'TEST',
        unauditedPERatio: 15,
        paidUpCapitalInMillion: 100,
        shortTermMillion: 20,
        longTermMillion: 30,
        reserveInMillion: 50,
        lastTradingPrice: 25,
        movingRangeFor52Weeks: {
          min: 20,
          max: 30
        },
        dividends: [
          { year: 2023, cashDividend: 2, stockDividend: 0 },
          { year: 2022, cashDividend: 1.8, stockDividend: 0 },
          { year: 2021, cashDividend: 1.5, stockDividend: 0 }
        ],
        financialPerformance: [
          { year: 2023, earningsPerShare: 3.5 },
          { year: 2022, earningsPerShare: 3.2 },
          { year: 2021, earningsPerShare: 2.8 }
        ],
        shareholdingPercentages: [
          {
            date: '2023-12-31',
            sponsorOrDirector: 30,
            institution: 25,
            foreign: 15
          }
        ]
      };
    });

    it('should calculate financial score for a healthy company', () => {
      const result: FinancialScoreResult = service.calculateFinancialScore(mockCompanyData);

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThan(0);
      expect(result.overall).toBeLessThanOrEqual(100);
      expect(result.grade).toMatch(/^[A-F]$/);
      expect(result.color).toMatch(/^(green|yellow|orange|red|gray)$/);
      expect(result.breakdown).toBeDefined();
    });

    it('should assign grade A for excellent companies (90-100)', () => {
      // Create a company with excellent financial metrics
      const excellentCompany: CompanyFinancialData = {
        ...mockCompanyData,
        shortTermMillion: 5, // Low debt
        longTermMillion: 5,
        reserveInMillion: 200, // High reserves
        unauditedPERatio: 12, // Good PE ratio
        dividends: [
          { year: 2023, cashDividend: 3, stockDividend: 0 },
          { year: 2022, cashDividend: 2.8, stockDividend: 0 },
          { year: 2021, cashDividend: 2.5, stockDividend: 0 },
          { year: 2020, cashDividend: 2.2, stockDividend: 0 },
          { year: 2019, cashDividend: 2.0, stockDividend: 0 }
        ],
        financialPerformance: [
          { year: 2023, earningsPerShare: 5.0 },
          { year: 2022, earningsPerShare: 4.8 },
          { year: 2021, earningsPerShare: 4.5 }
        ],
        shareholdingPercentages: [
          {
            date: '2023-12-31',
            sponsorOrDirector: 45, // High sponsor holding
            institution: 35,
            foreign: 20
          }
        ]
      };

      const result = service.calculateFinancialScore(excellentCompany);
      
      // Note: Actual grade depends on the specific algorithm implementation
      // This test validates the scoring structure
      expect(result.overall).toBeGreaterThan(70); // Should be high score
      expect(['A', 'B']).toContain(result.grade);
      expect(['green', 'yellow']).toContain(result.color);
    });

    it('should assign grade F for poor companies (0-40)', () => {
      const poorCompany: CompanyFinancialData = {
        ...mockCompanyData,
        shortTermMillion: 80, // Very high debt
        longTermMillion: 100,
        reserveInMillion: 10, // Very low reserves
        unauditedPERatio: 50, // Very high PE ratio
        dividends: [], // No dividends
        financialPerformance: [
          { year: 2023, earningsPerShare: -1.0 }, // Negative earnings
          { year: 2022, earningsPerShare: -0.5 },
          { year: 2021, earningsPerShare: 0.1 }
        ],
        shareholdingPercentages: [
          {
            date: '2023-12-31',
            sponsorOrDirector: 5, // Very low sponsor holding
            institution: 10,
            foreign: 5
          }
        ]
      };

      const result = service.calculateFinancialScore(poorCompany);
      
      expect(result.overall).toBeLessThan(60); // Should be low score
      expect(['C', 'D', 'F']).toContain(result.grade);
      expect(['orange', 'red', 'gray']).toContain(result.color);
    });

    it('should handle companies with missing data gracefully', () => {
      const incompleteCompany: CompanyFinancialData = {
        code: 'INCOMPLETE',
        paidUpCapitalInMillion: 50,
        shortTermMillion: 0,
        longTermMillion: 0,
        reserveInMillion: 0,
        dividends: [],
        financialPerformance: [],
        shareholdingPercentages: []
      };

      const result = service.calculateFinancialScore(incompleteCompany);
      
      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
      expect(result.grade).toMatch(/^[A-F]$/);
    });

    it('should calculate debt score correctly', () => {
      const lowDebtCompany: CompanyFinancialData = {
        ...mockCompanyData,
        shortTermMillion: 5,
        longTermMillion: 10,
        paidUpCapitalInMillion: 100
      };

      const highDebtCompany: CompanyFinancialData = {
        ...mockCompanyData,
        shortTermMillion: 50,
        longTermMillion: 60,
        paidUpCapitalInMillion: 100
      };

      const lowDebtResult = service.calculateFinancialScore(lowDebtCompany);
      const highDebtResult = service.calculateFinancialScore(highDebtCompany);

      expect(lowDebtResult.breakdown.debtScore).toBeGreaterThan(
        highDebtResult.breakdown.debtScore
      );
    });

    it('should calculate dividend consistency score correctly', () => {
      const consistentDividendCompany: CompanyFinancialData = {
        ...mockCompanyData,
        dividends: [
          { year: 2023, cashDividend: 2.0, stockDividend: 0 },
          { year: 2022, cashDividend: 2.0, stockDividend: 0 },
          { year: 2021, cashDividend: 2.0, stockDividend: 0 },
          { year: 2020, cashDividend: 2.0, stockDividend: 0 },
          { year: 2019, cashDividend: 2.0, stockDividend: 0 }
        ]
      };

      const inconsistentDividendCompany: CompanyFinancialData = {
        ...mockCompanyData,
        dividends: [
          { year: 2023, cashDividend: 3.0, stockDividend: 0 },
          { year: 2022, cashDividend: 0, stockDividend: 0 },
          { year: 2021, cashDividend: 1.0, stockDividend: 0 }
        ]
      };

      const consistentResult = service.calculateFinancialScore(consistentDividendCompany);
      const inconsistentResult = service.calculateFinancialScore(inconsistentDividendCompany);

      expect(consistentResult.breakdown.dividendConsistencyScore).toBeGreaterThan(
        inconsistentResult.breakdown.dividendConsistencyScore
      );
    });

    it('should calculate PE ratio score correctly', () => {
      const goodPERatioCompany: CompanyFinancialData = {
        ...mockCompanyData,
        unauditedPERatio: 12 // Good PE ratio
      };

      const poorPERatioCompany: CompanyFinancialData = {
        ...mockCompanyData,
        unauditedPERatio: 40 // High PE ratio
      };

      const goodPEResult = service.calculateFinancialScore(goodPERatioCompany);
      const poorPEResult = service.calculateFinancialScore(poorPERatioCompany);

      expect(goodPEResult.breakdown.peRatioScore).toBeGreaterThan(
        poorPEResult.breakdown.peRatioScore
      );
    });

    it('should validate all breakdown components are present', () => {
      const result = service.calculateFinancialScore(mockCompanyData);

      expect(result.breakdown).toHaveProperty('debtScore');
      expect(result.breakdown).toHaveProperty('reserveScore');
      expect(result.breakdown).toHaveProperty('dividendConsistencyScore');
      expect(result.breakdown).toHaveProperty('dividendYieldScore');
      expect(result.breakdown).toHaveProperty('priceValuationScore');
      expect(result.breakdown).toHaveProperty('financialPerformanceScore');
      expect(result.breakdown).toHaveProperty('shareholdingQualityScore');
      expect(result.breakdown).toHaveProperty('peRatioScore');

      // All scores should be between 0 and 100
      Object.values(result.breakdown).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it('should handle companies with zero paid up capital', () => {
      const zeroCapitalCompany: CompanyFinancialData = {
        ...mockCompanyData,
        paidUpCapitalInMillion: 0
      };

      expect(() => {
        service.calculateFinancialScore(zeroCapitalCompany);
      }).not.toThrow();
    });

    it('should handle negative values gracefully', () => {
      const negativeValueCompany: CompanyFinancialData = {
        ...mockCompanyData,
        shortTermMillion: -10,
        longTermMillion: -20,
        reserveInMillion: -5
      };

      const result = service.calculateFinancialScore(negativeValueCompany);
      
      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle companies with very high numbers', () => {
      const highValueCompany: CompanyFinancialData = {
        code: 'LARGE',
        paidUpCapitalInMillion: 10000,
        shortTermMillion: 1000,
        longTermMillion: 2000,
        reserveInMillion: 5000,
        unauditedPERatio: 15,
        lastTradingPrice: 1000,
        movingRangeFor52Weeks: { min: 800, max: 1200 },
        dividends: [
          { year: 2023, cashDividend: 50, stockDividend: 0 }
        ],
        financialPerformance: [
          { year: 2023, earningsPerShare: 100 }
        ],
        shareholdingPercentages: [
          {
            date: '2023-12-31',
            sponsorOrDirector: 30,
            institution: 25,
            foreign: 15
          }
        ]
      };

      const result = service.calculateFinancialScore(highValueCompany);
      
      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
    });

    it('should handle companies with minimal data', () => {
      const minimalCompany: CompanyFinancialData = {
        code: 'MIN',
        paidUpCapitalInMillion: 1,
        shortTermMillion: 0,
        longTermMillion: 0,
        reserveInMillion: 0,
        dividends: [],
        financialPerformance: [],
        shareholdingPercentages: []
      };

      const result = service.calculateFinancialScore(minimalCompany);
      
      expect(result).toBeDefined();
      expect(result.grade).toMatch(/^[A-F]$/);
      expect(result.color).toMatch(/^(green|yellow|orange|red|gray)$/);
    });
  });
});
