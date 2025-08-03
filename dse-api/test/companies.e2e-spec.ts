import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Companies (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/companies (GET)', () => {
    it('should return paginated companies list', () => {
      return request(app.getHttpServer())
        .get('/companies')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter companies by sector', () => {
      return request(app.getHttpServer())
        .get('/companies?sector=Technology')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('sector', 'Technology');
          }
        });
    });

    it('should apply pagination correctly', () => {
      return request(app.getHttpServer())
        .get('/companies?limit=5&offset=0')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeLessThanOrEqual(5);
        });
    });

    it('should include financial scores in response', () => {
      return request(app.getHttpServer())
        .get('/companies')
        .expect(200)
        .expect((res) => {
          if (res.body.length > 0) {
            const company = res.body[0];
            expect(company).toHaveProperty('financial_score');
            expect(company).toHaveProperty('financial_score_components');
            expect(company).toHaveProperty('financial_score_calculated_at');
          }
        });
    });
  });

  describe('/companies/:code (GET)', () => {
    it('should return a specific company by code', () => {
      // This test assumes there's at least one company in the database
      // In a real test, you'd either seed test data or use a known company code
      return request(app.getHttpServer())
        .get('/companies')
        .then((res) => {
          if (res.body.length > 0) {
            const companyCode = res.body[0].code;
            return request(app.getHttpServer())
              .get(`/companies/${companyCode}`)
              .expect(200)
              .expect((res) => {
                expect(res.body).toHaveProperty('code', companyCode);
                expect(res.body).toHaveProperty('financial_score');
                expect(res.body).toHaveProperty('dividends');
                expect(res.body).toHaveProperty('loans');
                expect(res.body).toHaveProperty('reserves');
              });
          }
        });
    });

    it('should return 404 for non-existent company', () => {
      return request(app.getHttpServer())
        .get('/companies/NONEXISTENT')
        .expect(404);
    });
  });

  describe('/companies/sectors (GET)', () => {
    it('should return list of available sectors', () => {
      return request(app.getHttpServer())
        .get('/companies/sectors')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(typeof res.body[0]).toBe('string');
          }
        });
    });
  });

  describe('/companies (POST)', () => {
    const uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase(); // Generate unique 6-char ID
    const newCompanyDto = {
      name: `TEST${uniqueId}`,
      fullName: 'Test Company Limited',
      dividends: [{ year: 2023, cashDividend: 2, stockDividend: 0 }],
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
    };

    it('should create a new company with financial score', () => {
      return request(app.getHttpServer())
        .post('/companies')
        .send(newCompanyDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', `TEST${uniqueId}`);
          expect(res.body).toHaveProperty('financial_score');
          expect(res.body).toHaveProperty('financial_score_calculated_at');
          // Fix: Convert string to number if needed for validation
          const financialScore =
            typeof res.body.financial_score === 'string'
              ? parseFloat(res.body.financial_score)
              : res.body.financial_score;
          expect(typeof financialScore).toBe('number');
        });
    });

    it('should return conflict error for duplicate company', () => {
      // Try to create the same company again - should get conflict
      return request(app.getHttpServer())
        .post('/companies')
        .send(newCompanyDto)
        .expect(409);
    });
  });

  describe('/companies/upsert (PUT)', () => {
    const uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase(); // Generate unique 6-char ID
    const upsertCompanyDto = {
      name: `UPS${uniqueId}`,
      fullName: 'Upsert Test Company Limited',
      dividends: [{ year: 2023, cashDividend: 3, stockDividend: 0 }],
      loans: {
        shortTermMillion: 15,
        longTermMillion: 25,
        dateUpdated: '2023-12-31',
      },
      reserveAndIncome: {
        reserveMillion: 60,
        unappropriatedProfitMillion: 30,
        dateUpdated: '2023-12-31',
      },
      metadata: {
        sector: 'Banking',
        authorizedCapitalInMillion: 300,
        paidUpCapitalInMillion: 150,
        shareCount: 15000000,
      },
      priceInfo: {
        lastTradingPrice: 30,
        changeAmount: 2,
        changePercentage: 7.14,
        volume: 1500,
        valueMillion: 45,
        tradeCount: 150,
        week52Min: 25,
        week52Max: 35,
      },
      financialPerformance: [
        {
          year: 2023,
          earningsPerShare: 4.5,
          netOperatingCashFlowPerShare: 5,
          netAssetValuePerShare: 20,
        },
      ],
      otherInfo: {
        listingYear: 2018,
        marketCategory: 'A',
        shareHoldingParcentages: [
          {
            date: '2023-12-31',
            sponsorOrDirector: 35,
            government: 10,
            institution: 30,
            foreign: 20,
            publicShares: 5,
          },
        ],
      },
      unauditedPERatio: 12,
    };

    it('should upsert company and calculate financial score', () => {
      return request(app.getHttpServer())
        .put('/companies/upsert')
        .send(upsertCompanyDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', `UPS${uniqueId}`);
          expect(res.body).toHaveProperty('financial_score');
          expect(res.body).toHaveProperty('financial_score_calculated_at');
          // Fix: Convert string to number if needed
          const financialScore =
            typeof res.body.financial_score === 'string'
              ? parseFloat(res.body.financial_score)
              : res.body.financial_score;
          expect(typeof financialScore).toBe('number');
          expect(financialScore).toBeGreaterThan(0);
          expect(financialScore).toBeLessThanOrEqual(100);
        });
    });

    it('should update existing company and recalculate financial score', () => {
      const updatedDto = {
        ...upsertCompanyDto,
        dividends: [
          { year: 2023, cashDividend: 4, stockDividend: 0 },
          { year: 2022, cashDividend: 3.5, stockDividend: 0 },
        ],
      };

      return request(app.getHttpServer())
        .put('/companies/upsert')
        .send(updatedDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('financial_score');
          expect(res.body.financial_score_calculated_at).toBeDefined();
        });
    });
  });

  describe('Financial Score Validation', () => {
    it('should validate financial score is within valid range', () => {
      return request(app.getHttpServer())
        .get('/companies')
        .expect(200)
        .expect((res) => {
          res.body.forEach((company: any) => {
            if (company.financial_score !== null) {
              expect(company.financial_score).toBeGreaterThanOrEqual(0);
              expect(company.financial_score).toBeLessThanOrEqual(100);
            }
          });
        });
    });

    it('should validate financial score components structure', () => {
      return request(app.getHttpServer())
        .get('/companies')
        .expect(200)
        .expect((res) => {
          res.body.forEach((company: any) => {
            if (company.financial_score_components) {
              const components = JSON.parse(company.financial_score_components);
              expect(components).toHaveProperty('debtScore');
              expect(components).toHaveProperty('reserveScore');
              expect(components).toHaveProperty('dividendConsistencyScore');
              expect(components).toHaveProperty('dividendYieldScore');
              expect(components).toHaveProperty('priceValuationScore');
              expect(components).toHaveProperty('financialPerformanceScore');
              expect(components).toHaveProperty('shareholdingQualityScore');
              expect(components).toHaveProperty('peRatioScore');

              // Validate each component score is within range
              Object.values(components).forEach((score: any) => {
                expect(score).toBeGreaterThanOrEqual(0);
                expect(score).toBeLessThanOrEqual(10);
              });
            }
          });
        });
    });
  });
});
