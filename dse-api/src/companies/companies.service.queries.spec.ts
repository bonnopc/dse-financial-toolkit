import { Test, TestingModule } from '@nestjs/testing';
import { DATABASE_CONNECTION } from '../database/database.module';
import {
  CompanyTestDataFactory,
  DatabaseTestUtils,
  MockDatabase,
  MockServices,
} from '../test-utils';
import { CompaniesService } from './companies.service';
import { FinancialScoringService } from './financial-scoring.service';

describe('CompaniesService - findAll and findOne', () => {
  let service: CompaniesService;
  let mockDb: any;
  let mockFinancialScoringService: jest.Mocked<
    Partial<FinancialScoringService>
  >;

  beforeEach(async () => {
    mockDb = MockDatabase.createKyselyMock();
    mockFinancialScoringService = MockServices.createFinancialScoringService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: DATABASE_CONNECTION, useValue: mockDb },
        {
          provide: FinancialScoringService,
          useValue: mockFinancialScoringService,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  afterEach(() => {
    DatabaseTestUtils.resetMocks(mockDb);
  });

  describe('findAll', () => {
    const mockCompanies = CompanyTestDataFactory.createCompanyList(3);

    it('should return all companies without filters', async () => {
      // Mock the complex join query
      mockDb.limit = jest.fn().mockReturnThis();
      mockDb.offset = jest.fn().mockReturnThis();
      mockDb.execute.mockResolvedValueOnce(mockCompanies); // First call returns companies

      // Mock related data queries for each company (will be called in Promise.all)
      mockDb.selectFrom = jest.fn().mockReturnThis();
      mockDb.where = jest.fn().mockReturnThis();
      // Each related data query returns empty array
      mockDb.execute.mockResolvedValue([]); // All subsequent calls return empty arrays

      const result = await service.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(mockDb.selectFrom).toHaveBeenCalledWith('companies');
    });

    it('should filter companies by sector', async () => {
      const techCompanies = mockCompanies.filter(
        (c) => c.sector === 'Technology'
      );

      mockDb.limit = jest.fn().mockReturnThis();
      mockDb.offset = jest.fn().mockReturnThis();
      mockDb.execute.mockResolvedValueOnce(techCompanies); // First call returns filtered companies
      mockDb.selectFrom = jest.fn().mockReturnThis();
      mockDb.where = jest.fn().mockReturnThis();
      mockDb.execute.mockResolvedValue([]); // All subsequent calls return empty arrays

      const result = await service.findAll('Technology');

      expect(Array.isArray(result)).toBe(true);
      expect(mockDb.where).toHaveBeenCalledWith(
        'companies.sector',
        '=',
        'Technology'
      );
    });

    it('should apply pagination correctly', async () => {
      mockDb.limit = jest.fn().mockReturnThis();
      mockDb.offset = jest.fn().mockReturnThis();
      mockDb.execute.mockResolvedValue([]);

      await service.findAll(undefined, 10, 20);

      expect(mockDb.limit).toHaveBeenCalledWith(10);
      expect(mockDb.offset).toHaveBeenCalledWith(20);
    });

    it('should handle empty results', async () => {
      mockDb.limit = jest.fn().mockReturnThis();
      mockDb.offset = jest.fn().mockReturnThis();
      mockDb.execute.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    const mockCompany = CompanyTestDataFactory.createBasicCompany();

    it('should return a company when found', async () => {
      // Mock the main company query
      mockDb.executeTakeFirst.mockResolvedValueOnce(mockCompany);

      // Mock all the related data queries
      mockDb.execute
        .mockResolvedValueOnce([]) // dividends
        .mockResolvedValueOnce([]); // financial_performance

      mockDb.executeTakeFirst
        .mockResolvedValueOnce(null) // loans
        .mockResolvedValueOnce(null) // reserves
        .mockResolvedValueOnce(null) // metadata
        .mockResolvedValueOnce(null); // priceInfo

      const result = await service.findOne('TEST');

      // Check that basic properties exist
      expect(result.code).toBe('TEST');
      expect(result.full_name).toBe('Test Company Limited');
      expect(result.sector).toBe('Technology');
      expect(result.financial_score).toBe(75.5);
      expect(result.dividends).toEqual([]);
      expect(result.financialPerformance).toEqual([]);

      expect(mockDb.where).toHaveBeenCalledWith('code', '=', 'TEST');
    });

    it('should throw NotFoundException when company not found', async () => {
      mockDb.executeTakeFirst.mockResolvedValue(null);

      await expect(service.findOne('NONEXISTENT')).rejects.toThrow(
        'Company with code NONEXISTENT not found'
      );
      expect(mockDb.where).toHaveBeenCalledWith('code', '=', 'NONEXISTENT');
    });

    it('should query related data when company found', async () => {
      // Mock the main company query
      mockDb.executeTakeFirst.mockResolvedValueOnce(mockCompany);

      // Mock all the related data queries
      mockDb.execute
        .mockResolvedValueOnce([]) // dividends
        .mockResolvedValueOnce([]); // financial_performance

      mockDb.executeTakeFirst
        .mockResolvedValueOnce(null) // loans
        .mockResolvedValueOnce(null) // reserves
        .mockResolvedValueOnce(null) // metadata
        .mockResolvedValueOnce(null); // priceInfo

      await service.findOne('TEST');

      // Should query all related tables
      expect(mockDb.selectFrom).toHaveBeenCalledWith('companies');
    });
  });

  describe('getSectors', () => {
    const mockSectors = ['Technology', 'Banking', 'Healthcare'];

    it('should return unique sectors', async () => {
      mockDb.execute.mockResolvedValue(
        mockSectors.map((sector) => ({ sector }))
      );

      const result = await service.getSectors();

      expect(result).toEqual(mockSectors);
      expect(mockDb.selectFrom).toHaveBeenCalledWith('companies');
      expect(mockDb.select).toHaveBeenCalledWith('sector');
      expect(mockDb.groupBy).toHaveBeenCalledWith('sector');
    });

    it('should handle empty sectors list', async () => {
      mockDb.execute.mockResolvedValue([]);

      const result = await service.getSectors();

      expect(result).toEqual([]);
    });
  });
});
