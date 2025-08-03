import { Test, TestingModule } from '@nestjs/testing';

/**
 * Common test setup utilities
 */
export class TestSetupHelper {
  /**
   * Creates a testing module with common providers
   */
  static async createTestingModule(
    providers: any[],
    imports: any[] = [],
    controllers: any[] = []
  ): Promise<TestingModule> {
    return Test.createTestingModule({
      imports,
      controllers,
      providers,
    }).compile();
  }

  /**
   * Setup common beforeEach for service tests
   */
  static setupServiceTest<T>(
    ServiceClass: new (...args: any[]) => T,
    providers: any[]
  ) {
    return async (): Promise<T> => {
      const module = await this.createTestingModule(providers);
      return module.get<T>(ServiceClass);
    };
  }

  /**
   * Setup common beforeEach for controller tests
   */
  static setupControllerTest<T>(
    ControllerClass: new (...args: any[]) => T,
    providers: any[]
  ) {
    return async (): Promise<{ controller: T; module: TestingModule }> => {
      const module = await this.createTestingModule(
        providers,
        [],
        [ControllerClass]
      );
      const controller = module.get<T>(ControllerClass);
      return { controller, module };
    };
  }
}

/**
 * Assertion helpers for common test patterns
 */
export class TestAssertions {
  /**
   * Assert that a result matches company structure
   */
  static assertCompanyStructure(company: any) {
    expect(company).toHaveProperty('id');
    expect(company).toHaveProperty('code');
    expect(company).toHaveProperty('full_name');
    expect(company).toHaveProperty('financial_score');
  }

  /**
   * Assert that a list is properly paginated
   */
  static assertPaginatedList(list: any[], maxLength?: number) {
    expect(Array.isArray(list)).toBe(true);
    if (maxLength) {
      expect(list.length).toBeLessThanOrEqual(maxLength);
    }
  }

  /**
   * Assert financial score structure
   */
  static assertFinancialScoreStructure(score: any) {
    expect(score).toHaveProperty('overall');
    expect(score).toHaveProperty('grade');
    expect(score).toHaveProperty('color');
    expect(score).toHaveProperty('breakdown');
    expect(score.overall).toBeGreaterThan(0);
    expect(score.overall).toBeLessThanOrEqual(100);
    expect(score.grade).toMatch(/^[A-F]$/);
    expect(score.color).toMatch(/^(green|yellow|orange|red|gray)$/);
  }

  /**
   * Assert that service methods were called with correct parameters
   */
  static assertServiceMethodCalls(
    mockService: any,
    methodName: string,
    expectedCalls: any[][]
  ) {
    expect(mockService[methodName]).toHaveBeenCalledTimes(expectedCalls.length);
    expectedCalls.forEach((call, index) => {
      expect(mockService[methodName]).toHaveBeenNthCalledWith(
        index + 1,
        ...call
      );
    });
  }
}

/**
 * Test data validation helpers
 */
export class TestValidation {
  /**
   * Validate that a company DTO has required fields
   */
  static validateCreateCompanyDto(dto: any) {
    expect(dto).toHaveProperty('name');
    expect(dto).toHaveProperty('fullName');
    expect(dto).toHaveProperty('metadata');
    expect(dto.metadata).toHaveProperty('paidUpCapitalInMillion');
  }

  /**
   * Validate database transaction mock setup
   */
  static validateTransactionMock(mockTrx: any) {
    expect(mockTrx.selectFrom).toBeDefined();
    expect(mockTrx.insertInto).toBeDefined();
    expect(mockTrx.updateTable).toBeDefined();
    expect(mockTrx.executeTakeFirst).toBeDefined();
  }
}
