import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DATABASE_CONNECTION } from '../../../database/database.module';
import {
  CompanyTestDataFactory,
  DatabaseTestUtils,
  MockDatabase,
  MockServices,
  TestAssertions,
  TestValidation,
} from '../../../test-utils';
import { CompaniesService } from '../../companies.service';
import { FinancialScoringService } from '../../financial-scoring.service';

describe('CompaniesService - Mutation Operations', () => {
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

  describe('createCompany', () => {
    const mockCreateDto = CompanyTestDataFactory.createCreateCompanyDto();
    const mockCompany = CompanyTestDataFactory.createBasicCompany();

    it('should create a new company successfully', async () => {
      const mockTrx = DatabaseTestUtils.setupCompanyCreationMocks(
        mockDb,
        'success'
      );

      const result = await service.createCompany(mockCreateDto);

      expect(result).toBeDefined();
      expect(result.code).toBe(mockCompany.code);
      expect(result.full_name).toBe(mockCompany.full_name);
      expect(result.financial_score).toBe(mockCompany.financial_score);
      // Use flexible time assertions since exact timestamps may differ by milliseconds
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
      expect(result.financial_score_calculated_at).toBeInstanceOf(Date);

      TestAssertions.assertCompanyStructure(result);
      TestValidation.validateTransactionMock(mockTrx);
    });
    it('should throw ConflictException when company already exists', async () => {
      DatabaseTestUtils.setupCompanyCreationMocks(mockDb, 'conflict');

      await expect(service.createCompany(mockCreateDto)).rejects.toThrow(
        ConflictException
      );
    });

    it('should calculate financial score during creation', async () => {
      DatabaseTestUtils.setupCompanyCreationMocks(mockDb, 'success');

      await service.createCompany(mockCreateDto);

      expect(
        mockFinancialScoringService.calculateFinancialScore
      ).toHaveBeenCalled();
    });

    it('should handle database transaction errors', async () => {
      DatabaseTestUtils.setupCompanyCreationMocks(mockDb, 'error');

      await expect(service.createCompany(mockCreateDto)).rejects.toThrow(
        'Database error'
      );
    });

    it('should insert related data (dividends, financial performance)', async () => {
      const mockTrx = DatabaseTestUtils.setupCompanyCreationMocks(
        mockDb,
        'success'
      );

      await service.createCompany(mockCreateDto);

      // Verify dividends were inserted
      expect(mockTrx.insertInto).toHaveBeenCalledWith('dividends');
      expect(mockTrx.values).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            year: 2023,
            cash_dividend: 2,
            stock_dividend: 0,
          }),
        ])
      );

      // Verify financial performance was inserted
      expect(mockTrx.insertInto).toHaveBeenCalledWith('financial_performance');
      expect(mockTrx.values).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            year: 2023,
            earnings_per_share: 3.5,
          }),
        ])
      );
    });
  });

  describe('upsertCompany', () => {
    const mockCreateDto = CompanyTestDataFactory.createCreateCompanyDto();
    const mockCompany = CompanyTestDataFactory.createBasicCompany();

    it('should create new company when it does not exist', async () => {
      const mockTrx = DatabaseTestUtils.setupCompanyCreationMocks(
        mockDb,
        'success'
      );

      const result = await service.upsertCompany(mockCreateDto);

      expect(result).toBeDefined();
      expect(result.code).toBe(mockCompany.code);
      expect(result.full_name).toBe(mockCompany.full_name);
      expect(result.financial_score).toBe(mockCompany.financial_score);
      // Use flexible time assertions since exact timestamps may differ by milliseconds
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
      expect(result.financial_score_calculated_at).toBeInstanceOf(Date);

      TestAssertions.assertCompanyStructure(result);
      expect(mockTrx.selectFrom).toHaveBeenCalledWith('companies');
      expect(mockTrx.insertInto).toHaveBeenCalledWith('companies');
    });

    it('should update existing company when it exists', async () => {
      const existingCompany = CompanyTestDataFactory.createBasicCompany();
      const mockTrx = MockDatabase.createTransactionMock({
        executeTakeFirst: jest.fn().mockResolvedValueOnce(existingCompany), // Company exists
        executeTakeFirstOrThrow: jest.fn().mockResolvedValue({
          ...existingCompany,
          full_name: mockCreateDto.fullName,
        }),
      });

      mockDb.transaction.mockReturnValue({
        execute: jest
          .fn()
          .mockImplementation(async (callback: any) => callback(mockTrx)),
      });

      const result = await service.upsertCompany(mockCreateDto);

      expect(result).toBeDefined();
      expect(mockTrx.updateTable).toHaveBeenCalledWith('companies');
      expect(mockTrx.set).toHaveBeenCalledWith(
        expect.objectContaining({
          full_name: mockCreateDto.fullName,
        })
      );
    });

    it('should handle database transaction errors gracefully', async () => {
      DatabaseTestUtils.setupCompanyCreationMocks(mockDb, 'error');

      await expect(service.upsertCompany(mockCreateDto)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('data validation', () => {
    it('should validate DTO structure before processing', () => {
      const mockCreateDto = CompanyTestDataFactory.createCreateCompanyDto();

      TestValidation.validateCreateCompanyDto(mockCreateDto);
      expect(mockCreateDto.name).toBe('TEST');
      expect(mockCreateDto.fullName).toBe('Test Company Limited');
    });

    it('should handle missing optional fields gracefully', async () => {
      const minimalDto = CompanyTestDataFactory.createCreateCompanyDto({
        dividends: [],
        financialPerformance: [],
      });

      DatabaseTestUtils.setupCompanyCreationMocks(mockDb, 'success');

      await expect(service.createCompany(minimalDto)).resolves.toBeDefined();
    });
  });

  describe('error handling', () => {
    const mockCreateDto = CompanyTestDataFactory.createCreateCompanyDto();

    it('should handle database errors gracefully in upsertCompany', async () => {
      mockDb.transaction.mockReturnValue({
        execute: jest
          .fn()
          .mockRejectedValue(new Error('Database connection failed')),
      });

      await expect(service.upsertCompany(mockCreateDto)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle transaction failures in createCompany', async () => {
      mockDb.transaction.mockReturnValue({
        execute: jest.fn().mockRejectedValue(new Error('Transaction failed')),
      });

      await expect(service.createCompany(mockCreateDto)).rejects.toThrow(
        'Transaction failed'
      );
    });
  });
});
