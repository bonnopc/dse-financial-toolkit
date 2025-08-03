import { CompaniesService } from '../companies/companies.service';
import { FinancialScoringService } from '../companies/financial-scoring.service';
import { CompanyTestDataFactory } from './factories';

/**
 * Mock services for testing
 */
export class MockServices {
  static createCompaniesService() {
    return {
      findAll: jest.fn(),
      findOne: jest.fn(),
      createCompany: jest.fn(),
      upsertCompany: jest.fn(),
      getSectors: jest.fn(),
    } as jest.Mocked<Partial<CompaniesService>>;
  }

  static createFinancialScoringService() {
    return {
      calculateFinancialScore: jest
        .fn()
        .mockReturnValue(CompanyTestDataFactory.createFinancialScoreResult()),
    } as jest.Mocked<Partial<FinancialScoringService>>;
  }
}

/**
 * Database mock utilities
 */
export class MockDatabase {
  static createKyselyMock() {
    return {
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
      executeTakeFirstOrThrow: jest.fn(),
      insertInto: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      onConflict: jest.fn().mockReturnThis(),
      doUpdateSet: jest.fn().mockReturnThis(),
      updateTable: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      transaction: jest.fn(),
    };
  }

  static createTransactionMock(overrides: any = {}) {
    return {
      selectFrom: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      selectAll: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      executeTakeFirst: jest.fn(),
      insertInto: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      executeTakeFirstOrThrow: jest.fn(),
      updateTable: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
      deleteFrom: jest.fn().mockReturnThis(),
      ...overrides,
    };
  }
}
