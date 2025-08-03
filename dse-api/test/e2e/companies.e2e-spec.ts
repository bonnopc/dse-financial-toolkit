import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CompanyTestDataFactory, TestAssertions } from '../../src/test-utils';

describe('Companies API (E2E)', () => {
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
          TestAssertions.assertPaginatedList(res.body);
        });
    });

    it('should filter companies by sector', () => {
      return request(app.getHttpServer())
        .get('/companies?sector=Technology')
        .expect(200)
        .expect((res) => {
          TestAssertions.assertPaginatedList(res.body);
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
          TestAssertions.assertPaginatedList(res.body, 5);
        });
    });

    it('should include financial scores in response', () => {
      return request(app.getHttpServer())
        .get('/companies')
        .expect(200)
        .expect((res) => {
          if (res.body.length > 0) {
            const company = res.body[0];
            TestAssertions.assertCompanyStructure(company);
            expect(company).toHaveProperty('financial_score');
            expect(company).toHaveProperty('financial_score_components');
            expect(company).toHaveProperty('financial_score_calculated_at');
          }
        });
    });

    it('should handle invalid pagination parameters gracefully', () => {
      return request(app.getHttpServer())
        .get('/companies?limit=-1&offset=-5')
        .expect(200) // Should not crash, should use defaults
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should handle non-existent sector filter', () => {
      return request(app.getHttpServer())
        .get('/companies?sector=NonExistentSector')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });
  });

  describe('/companies/:code (GET)', () => {
    let testCompanyCode: string;

    beforeAll(async () => {
      // Get a company code to test with
      const response = await request(app.getHttpServer()).get('/companies');
      if (response.body.length > 0) {
        testCompanyCode = response.body[0].code;
      }
    });

    it('should return a specific company by code', () => {
      if (!testCompanyCode) {
        pending('No companies available for testing');
        return;
      }

      return request(app.getHttpServer())
        .get(`/companies/${testCompanyCode}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', testCompanyCode);
          TestAssertions.assertCompanyStructure(res.body);
          expect(res.body).toHaveProperty('dividends');
          expect(res.body).toHaveProperty('loans');
          expect(res.body).toHaveProperty('reserves');
        });
    });

    it('should return 404 for non-existent company', () => {
      return request(app.getHttpServer())
        .get('/companies/NONEXISTENT999')
        .expect(404);
    });

    it('should handle invalid company codes gracefully', () => {
      return request(app.getHttpServer())
        .get('/companies/INVALID-CODE-WITH-SPECIAL-CHARS!')
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
          res.body.forEach((sector: string) => {
            expect(typeof sector).toBe('string');
            expect(sector.length).toBeGreaterThan(0);
          });
        });
    });

    it('should return unique sectors only', () => {
      return request(app.getHttpServer())
        .get('/companies/sectors')
        .expect(200)
        .expect((res) => {
          const sectors = res.body;
          const uniqueSectors = [...new Set(sectors)];
          expect(sectors.length).toBe(uniqueSectors.length);
        });
    });
  });

  describe('/companies (POST)', () => {
    const testCompanyDto = CompanyTestDataFactory.createCreateCompanyDto({
      name: 'E2ETEST001',
      fullName: 'E2E Test Company 001',
    });

    afterEach(async () => {
      // Clean up test data
      try {
        await request(app.getHttpServer())
          .delete(`/companies/E2ETEST001`)
          .expect((_res) => {
            // Don't fail test if cleanup fails
          });
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    it('should create a new company', () => {
      return request(app.getHttpServer())
        .post('/companies')
        .send(testCompanyDto)
        .expect(201)
        .expect((res) => {
          TestAssertions.assertCompanyStructure(res.body);
          expect(res.body.code).toBe('E2ETEST001');
          expect(res.body.full_name).toBe('E2E Test Company 001');
          expect(res.body.financial_score).toBeDefined();
        });
    });

    it('should update existing company (upsert)', async () => {
      // First create the company
      await request(app.getHttpServer())
        .post('/companies')
        .send(testCompanyDto)
        .expect(201);

      // Then update it
      const updateDto = {
        ...testCompanyDto,
        fullName: 'E2E Test Company 001 Updated',
      };

      return request(app.getHttpServer())
        .post('/companies')
        .send(updateDto)
        .expect(201)
        .expect((res) => {
          TestAssertions.assertCompanyStructure(res.body);
          expect(res.body.full_name).toBe('E2E Test Company 001 Updated');
        });
    });

    it('should validate required fields', () => {
      const invalidDto = {
        name: 'INVALID',
        // Missing required fields
      };

      return request(app.getHttpServer())
        .post('/companies')
        .send(invalidDto)
        .expect(400);
    });

    it('should handle malformed request body', () => {
      return request(app.getHttpServer())
        .post('/companies')
        .send('invalid-json')
        .expect(400);
    });
  });

  describe('error handling', () => {
    it('should handle server errors gracefully', () => {
      return request(app.getHttpServer())
        .get('/companies?limit=999999999999999') // Extremely large limit
        .expect((res) => {
          expect([200, 400, 500]).toContain(res.status);
        });
    });

    it('should return appropriate headers', () => {
      return request(app.getHttpServer())
        .get('/companies')
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.headers).toHaveProperty('content-type');
        });
    });
  });

  describe('performance', () => {
    it('should respond within reasonable time limits', () => {
      const startTime = Date.now();

      return request(app.getHttpServer())
        .get('/companies')
        .expect(200)
        .expect(() => {
          const responseTime = Date.now() - startTime;
          expect(responseTime).toBeLessThan(5000); // 5 second timeout
        });
    });
  });
});
