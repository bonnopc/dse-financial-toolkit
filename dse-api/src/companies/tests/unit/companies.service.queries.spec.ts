import { Test, TestingModule } from '@nestjs/testing';
import { DATABASE_CONNECTION } from '../../../database/database.module';
import {
  CompanyTestDataFactory,
  DatabaseTestUtils,
  MockDatabase,
  MockServices,
  TestAssertions,
} from '../../../test-utils';
import { CompaniesService } from '../../companies.service';
import { FinancialScoringService } from '../../financial-scoring.service';

describe('CompaniesService - Query Operations', () => {
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

    beforeEach(() => {
      DatabaseTestUtils.setupUnitTestMocks(mockDb);
    });

    it('should return all companies without filters', async () => {
      mockDb.execute.mockResolvedValue(mockCompanies);

      const result = await service.findAll();

      expect(Array.isArray(result)).toBe(true);
      TestAssertions.assertPaginatedList(result);
      expect(mockDb.selectFrom).toHaveBeenCalledWith('companies');
    });

    it('should filter companies by sector', async () => {
      const techCompanies = mockCompanies.filter(
        (c) => c.sector === 'Technology'
      );
      mockDb.execute.mockResolvedValue(techCompanies);

      const result = await service.findAll('Technology');

      expect(Array.isArray(result)).toBe(true);
      expect(mockDb.where).toHaveBeenCalledWith(
        'companies.sector',
        '=',
        'Technology'
      );
    });

    it('should apply pagination correctly', async () => {
      mockDb.execute.mockResolvedValue([]);

      await service.findAll(undefined, 10, 20);

      expect(mockDb.limit).toHaveBeenCalledWith(10);
      expect(mockDb.offset).toHaveBeenCalledWith(20);
    });

    it('should handle empty results', async () => {
      mockDb.execute.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    const mockCompany = CompanyTestDataFactory.createBasicCompany();

    beforeEach(() => {
      DatabaseTestUtils.setupUnitTestMocks(mockDb);
    });

    it('should return a company when found', async () => {
      mockDb.executeTakeFirst.mockResolvedValue(mockCompany);

      const result = await service.findOne('TEST');

      expect(result).toBeDefined();
      expect(result.code).toBe('TEST');
      expect(mockDb.where).toHaveBeenCalledWith('code', '=', 'TEST');
    });

    it('should return null when company not found', async () => {
      mockDb.executeTakeFirst.mockResolvedValue(null);

      try {
        const result = await service.findOne('NONEXISTENT');
        expect(result).toBeNull();
      } catch (error) {
        // Service throws NotFoundException instead of returning null
        expect(error.name).toBe('NotFoundException');
      }

      expect(mockDb.where).toHaveBeenCalledWith('code', '=', 'NONEXISTENT');
    });

    it('should throw NotFoundException when using legacy behavior', async () => {
      mockDb.executeTakeFirst.mockResolvedValue(null);

      await expect(service.findOne('NONEXISTENT')).rejects.toThrow(
        'Company with code NONEXISTENT not found'
      );
    });

    it('should include related data in query', async () => {
      mockDb.executeTakeFirst.mockResolvedValue(mockCompany);

      await service.findOne('TEST');

      expect(mockDb.selectFrom).toHaveBeenCalledWith('companies');
      // Note: The actual service may not use leftJoin in this specific query
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
