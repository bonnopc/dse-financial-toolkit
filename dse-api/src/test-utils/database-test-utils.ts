import { CompanyTestDataFactory } from './factories';
import { MockDatabase } from './mocks';

/**
 * Database testing utilities for complex scenarios
 */
export class DatabaseTestUtils {
  /**
   * Setup database mock for company creation scenarios
   */
  static setupCompanyCreationMocks(
    mockDb: any,
    scenario: 'success' | 'conflict' | 'error' = 'success'
  ) {
    const mockTrx = MockDatabase.createTransactionMock();

    // Add missing methods to mock transaction
    mockTrx.deleteFrom = jest.fn().mockReturnThis();

    switch (scenario) {
      case 'success':
        mockTrx.executeTakeFirst
          .mockResolvedValueOnce(null) // No existing company
          .mockResolvedValueOnce(CompanyTestDataFactory.createBasicCompany()) // Company data for scoring
          .mockResolvedValue([]) // Additional queries return empty arrays
          .mockResolvedValue([])
          .mockResolvedValue(null);

        mockTrx.executeTakeFirstOrThrow.mockResolvedValue(
          CompanyTestDataFactory.createBasicCompany()
        );
        break;

      case 'conflict':
        mockTrx.executeTakeFirst.mockResolvedValueOnce(
          CompanyTestDataFactory.createBasicCompany()
        ); // Existing company found
        break;

      case 'error':
        mockTrx.executeTakeFirst.mockRejectedValue(new Error('Database error'));
        break;
    }

    mockDb.transaction.mockReturnValue({
      execute: jest
        .fn()
        .mockImplementation(async (callback: any) => callback(mockTrx)),
    });

    return mockTrx;
  }

  /**
   * Setup database mock for company queries
   */
  static setupCompanyQueryMocks(
    mockDb: any,
    scenario: 'found' | 'not-found' | 'list' = 'found'
  ) {
    switch (scenario) {
      case 'found':
        mockDb.executeTakeFirst.mockResolvedValue(
          CompanyTestDataFactory.createBasicCompany()
        );
        break;

      case 'not-found':
        mockDb.executeTakeFirst.mockResolvedValue(null);
        break;

      case 'list':
        mockDb.execute.mockResolvedValue(
          CompanyTestDataFactory.createCompanyList()
        );
        break;
    }

    return mockDb;
  }

  /**
   * Setup database mock for financial scoring queries
   */
  static setupFinancialScoringMocks(mockDb: any) {
    const mockTrx = MockDatabase.createTransactionMock();

    // Mock queries needed for financial scoring
    mockTrx.executeTakeFirst
      .mockResolvedValueOnce({
        ...CompanyTestDataFactory.createBasicCompany(),
        paid_up_capital_million: 100,
        short_term_million: 20,
        long_term_million: 30,
        reserve_million: 50,
        week_52_min: 20,
        week_52_max: 30,
      })
      .mockResolvedValue([]) // Dividends query
      .mockResolvedValue([]) // Financial performance query
      .mockResolvedValue(null); // Shareholding query

    mockDb.transaction.mockReturnValue({
      execute: jest
        .fn()
        .mockImplementation(async (callback: any) => callback(mockTrx)),
    });

    return mockTrx;
  }

  /**
   * Reset all database mocks
   */
  static resetMocks(mockDb: any) {
    Object.values(mockDb).forEach((method: any) => {
      if (typeof method === 'function' && method.mockReset) {
        method.mockReset();
      }
    });
  }

  /**
   * Setup mocks to avoid actual service calls during testing
   */
  static setupUnitTestMocks(mockDb: any) {
    // Setup basic mocks that don't call real service methods
    mockDb.execute.mockResolvedValue([]);
    mockDb.executeTakeFirst.mockResolvedValue(null);
    mockDb.selectFrom.mockReturnThis();
    mockDb.leftJoin.mockReturnThis();
    mockDb.select.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.orderBy.mockReturnThis();
    mockDb.limit.mockReturnThis();
    mockDb.offset.mockReturnThis();
    mockDb.groupBy.mockReturnThis();

    return mockDb;
  }
}
