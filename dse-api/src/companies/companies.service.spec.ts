import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DATABASE_CONNECTION } from '../database/database.module';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { FinancialScoringService } from './financial-scoring.service';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let mockDb: any;
  let mockFinancialScoringService: jest.Mocked<FinancialScoringService>;

  const mockCompany = {
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
    financial_score_calculated_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCreateCompanyDto: CreateCompanyDto = {
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
  };

  beforeEach(async () => {
    // Create mock database with transaction support
    mockDb = {
      selectFrom: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      selectAll: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      execute: jest.fn(),
      executeTakeFirst: jest.fn(),
      insertInto: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      onConflict: jest.fn().mockReturnThis(),
      doUpdateSet: jest.fn().mockReturnThis(),
      updateTable: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      transaction: jest.fn(),
    };

    // Mock financial scoring service
    mockFinancialScoringService = {
      calculateFinancialScore: jest.fn().mockReturnValue({
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
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
        {
          provide: FinancialScoringService,
          useValue: mockFinancialScoringService,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCompany', () => {
    it('should create a new company successfully', async () => {
      // Mock transaction
      const mockTrx = {
        selectFrom: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        selectAll: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        executeTakeFirst: jest
          .fn()
          .mockResolvedValueOnce(null) // No existing company
          .mockResolvedValueOnce({
            // Company data for financial scoring
            ...mockCompany,
            paid_up_capital_million: 1,
            short_term_million: 0,
            long_term_million: 0,
            reserve_million: 0,
            week_52_min: 0,
            week_52_max: 0,
          })
          .mockResolvedValue([]) // Additional queries return empty arrays
          .mockResolvedValue([])
          .mockResolvedValue(null),
        insertInto: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        executeTakeFirstOrThrow: jest.fn().mockResolvedValue(mockCompany),
        updateTable: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };

      mockDb.transaction.mockReturnValue({
        execute: jest.fn().mockImplementation(async (callback) => {
          return callback(mockTrx);
        }),
      });

      const result = await service.createCompany(mockCreateCompanyDto);

      expect(result).toEqual(mockCompany);
      expect(mockTrx.selectFrom).toHaveBeenCalledWith('companies');
      expect(mockTrx.insertInto).toHaveBeenCalledWith('companies');
    });

    it('should throw ConflictException if company already exists', async () => {
      const mockTrx = {
        selectFrom: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        selectAll: jest.fn().mockReturnThis(),
        executeTakeFirst: jest.fn().mockResolvedValue(mockCompany), // Existing company
      };

      mockDb.transaction.mockReturnValue({
        execute: jest.fn().mockImplementation(async (callback) => {
          return callback(mockTrx);
        }),
      });

      await expect(service.createCompany(mockCreateCompanyDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('upsertCompany', () => {
    it('should update existing company', async () => {
      const mockTrx = {
        selectFrom: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        selectAll: jest.fn().mockReturnThis(),
        executeTakeFirst: jest.fn().mockResolvedValue(mockCompany),
        executeTakeFirstOrThrow: jest.fn().mockResolvedValue(mockCompany),
        updateTable: jest.fn().mockReturnThis(),
        insertInto: jest.fn().mockReturnThis(),
        deleteFrom: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };

      mockDb.transaction.mockReturnValue({
        execute: jest.fn().mockImplementation(async (callback) => {
          return callback(mockTrx);
        }),
      });

      const result = await service.upsertCompany(mockCreateCompanyDto);

      expect(result).toEqual(mockCompany);
      expect(mockTrx.updateTable).toHaveBeenCalledWith('companies');
      expect(
        mockFinancialScoringService.calculateFinancialScore
      ).toHaveBeenCalled();
    });

    it('should create new company if not exists', async () => {
      const mockTrx = {
        selectFrom: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        selectAll: jest.fn().mockReturnThis(),
        executeTakeFirst: jest
          .fn()
          .mockResolvedValueOnce(null) // No existing company
          .mockResolvedValueOnce([]) // No dividends
          .mockResolvedValueOnce([]) // No financial performance
          .mockResolvedValueOnce(null), // No shareholding
        executeTakeFirstOrThrow: jest.fn().mockResolvedValue(mockCompany),
        insertInto: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        updateTable: jest.fn().mockReturnThis(),
      };

      mockDb.transaction.mockReturnValue({
        execute: jest.fn().mockImplementation(async (callback) => {
          return callback(mockTrx);
        }),
      });

      const result = await service.upsertCompany(mockCreateCompanyDto);

      expect(result).toEqual(mockCompany);
      expect(mockTrx.insertInto).toHaveBeenCalledWith('companies');
      expect(
        mockFinancialScoringService.calculateFinancialScore
      ).toHaveBeenCalled();
    });

    it('should calculate and store financial score during upsert', async () => {
      const mockTrx = {
        selectFrom: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        selectAll: jest.fn().mockReturnThis(),
        executeTakeFirst: jest
          .fn()
          .mockResolvedValueOnce(mockCompany) // Existing company found
          .mockResolvedValueOnce([]) // No dividends
          .mockResolvedValueOnce([]) // No financial performance
          .mockResolvedValueOnce(null), // No shareholding
        executeTakeFirstOrThrow: jest.fn().mockResolvedValue(mockCompany),
        updateTable: jest.fn().mockReturnThis(),
        insertInto: jest.fn().mockReturnThis(),
        deleteFrom: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };

      mockDb.transaction.mockReturnValue({
        execute: jest.fn().mockImplementation(async (callback) => {
          return callback(mockTrx);
        }),
      });

      await service.upsertCompany(mockCreateCompanyDto);

      // Verify financial scoring service was called
      expect(
        mockFinancialScoringService.calculateFinancialScore
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          paidUpCapitalInMillion: 1, // This comes from the actual mock setup
          shortTermMillion: 0,
          longTermMillion: 0,
          reserveInMillion: 0,
          movingRangeFor52Weeks: expect.objectContaining({
            min: 0,
            max: 0,
          }),
          dividends: [],
          financialPerformance: [],
          shareholdingPercentages: expect.arrayContaining([
            expect.objectContaining({
              date: expect.any(String),
              sponsorOrDirector: 0,
              institution: 0,
              foreign: 0,
            }),
          ]),
        })
      );

      // Verify financial score was stored in database
      expect(mockTrx.updateTable).toHaveBeenCalledWith('companies');
      expect(mockTrx.set).toHaveBeenCalledWith(
        expect.objectContaining({
          financial_score: 75.5,
          financial_score_components: expect.any(String),
          financial_score_calculated_at: expect.any(Date),
        })
      );
    });
  });

  describe('findAll', () => {
    const mockCompaniesWithData = [
      {
        ...mockCompany,
        authorized_capital_million: 200,
        paid_up_capital_million: 100,
        share_count: 10000000,
        last_trading_price: 25,
        change_amount: 1.5,
        change_percentage: 6.38,
        volume: 1000,
        value_million: 25,
        trade_count: 100,
        week_52_min: 20,
        week_52_max: 30,
        short_term_million: 20,
        long_term_million: 30,
        reserve_million: 50,
        unappropriated_profit_million: 25,
      },
    ];

    it('should return all companies with financial scores', async () => {
      mockDb.selectFrom.mockReturnThis();
      mockDb.leftJoin.mockReturnThis();
      mockDb.select.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.limit.mockReturnThis();
      mockDb.offset.mockReturnThis();
      mockDb.execute.mockResolvedValue(mockCompaniesWithData);

      // Mock related data queries
      mockDb.selectAll.mockReturnThis();
      mockDb.orderBy.mockReturnThis();
      mockDb.execute
        .mockResolvedValueOnce(mockCompaniesWithData) // Main query
        .mockResolvedValue([]) // Dividends
        .mockResolvedValue([]) // Financial performance
        .mockResolvedValue([]); // Shareholding

      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(mockDb.selectFrom).toHaveBeenCalledWith('companies');
    });

    it('should filter by sector when provided', async () => {
      mockDb.selectFrom.mockReturnThis();
      mockDb.leftJoin.mockReturnThis();
      mockDb.select.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.limit.mockReturnThis();
      mockDb.offset.mockReturnThis();
      mockDb.execute.mockResolvedValue(mockCompaniesWithData);

      // Mock related data queries
      mockDb.selectAll.mockReturnThis();
      mockDb.orderBy.mockReturnThis();
      mockDb.execute
        .mockResolvedValueOnce(mockCompaniesWithData)
        .mockResolvedValue([])
        .mockResolvedValue([])
        .mockResolvedValue([]);

      await service.findAll('Technology', 10, 0);

      expect(mockDb.where).toHaveBeenCalledWith(
        'companies.sector',
        '=',
        'Technology'
      );
    });

    it('should apply pagination correctly', async () => {
      mockDb.selectFrom.mockReturnThis();
      mockDb.leftJoin.mockReturnThis();
      mockDb.select.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.limit.mockReturnThis();
      mockDb.offset.mockReturnThis();
      mockDb.execute.mockResolvedValue(mockCompaniesWithData);

      // Mock related data queries
      mockDb.selectAll.mockReturnThis();
      mockDb.orderBy.mockReturnThis();
      mockDb.execute
        .mockResolvedValueOnce(mockCompaniesWithData)
        .mockResolvedValue([])
        .mockResolvedValue([])
        .mockResolvedValue([]);

      await service.findAll(undefined, 20, 10);

      expect(mockDb.limit).toHaveBeenCalledWith(20);
      expect(mockDb.offset).toHaveBeenCalledWith(10);
    });
  });

  describe('findOne', () => {
    it('should return company by code', async () => {
      mockDb.selectFrom.mockReturnThis();
      mockDb.leftJoin.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.select.mockReturnThis();
      mockDb.executeTakeFirst.mockResolvedValue(mockCompany);

      const result = await service.findOne('TEST');

      expect(result).toBeDefined();
      expect(result.code).toBe('TEST');
      expect(mockDb.where).toHaveBeenCalledWith('code', '=', 'TEST');
    });

    it('should throw NotFoundException if company not found', async () => {
      mockDb.selectFrom.mockReturnThis();
      mockDb.leftJoin.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.select.mockReturnThis();
      mockDb.executeTakeFirst.mockResolvedValue(null);

      await expect(service.findOne('NOTFOUND')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('getSectors', () => {
    it('should return unique sectors', async () => {
      const mockSectors = [
        { sector: 'Technology' },
        { sector: 'Banking' },
        { sector: 'Pharmaceuticals' },
      ];

      mockDb.selectFrom.mockReturnThis();
      mockDb.select.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.orderBy.mockReturnThis();
      mockDb.execute.mockResolvedValue(mockSectors);

      const result = await service.getSectors();

      expect(result).toEqual(['Technology', 'Banking', 'Pharmaceuticals']);
      expect(mockDb.selectFrom).toHaveBeenCalledWith('companies');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully in findAll', async () => {
      mockDb.selectFrom.mockReturnThis();
      mockDb.leftJoin.mockReturnThis();
      mockDb.select.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.limit.mockReturnThis();
      mockDb.offset.mockReturnThis();
      mockDb.execute.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.findAll()).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle transaction failures in upsertCompany', async () => {
      mockDb.transaction.mockReturnValue({
        execute: jest.fn().mockRejectedValue(new Error('Transaction failed')),
      });

      await expect(service.upsertCompany(mockCreateCompanyDto)).rejects.toThrow(
        'Transaction failed'
      );
    });
  });
});
