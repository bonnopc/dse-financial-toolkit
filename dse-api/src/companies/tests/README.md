# Test Organization

This directory contains organized test files following best practices for maintainability and readability.

## Structure

```
src/
├── companies/
│   └── tests/
│       ├── unit/              # Unit tests for individual components
│       │   ├── companies.controller.spec.ts
│       │   ├── companies.service.queries.spec.ts
│       │   ├── companies.service.mutations.spec.ts
│       │   └── financial-scoring.service.spec.ts
│       └── integration/       # Integration tests
│           └── companies.integration.spec.ts
└── test-utils/               # Shared test utilities
    ├── factories.ts          # Test data factories
    ├── mocks.ts             # Mock services and objects
    ├── test-helpers.ts      # Test setup helpers
    ├── database-test-utils.ts # Database testing utilities
    └── index.ts

test/
└── e2e/                     # End-to-end tests
    ├── app.e2e-spec.ts
    └── companies.e2e-spec.ts
```

## Test Types

### Unit Tests

- **Controllers**: Test HTTP layer, request/response handling
- **Services (Queries)**: Test data retrieval operations
- **Services (Mutations)**: Test data modification operations
- **Financial Scoring**: Test calculation logic

### Integration Tests

- Test interaction between services
- Test with real database connections
- Test business logic flows

### E2E Tests

- Test complete API endpoints
- Test real HTTP requests/responses
- Test error handling and edge cases

## Benefits of This Organization

1. **Separation of Concerns**: Each test file focuses on specific functionality
2. **Reusability**: Shared utilities reduce code duplication
3. **Maintainability**: Easy to find and update tests
4. **Scalability**: Easy to add new test categories
5. **Performance**: Can run specific test suites in isolation

## Running Tests

```bash
# Run all tests
bun test

# Run only unit tests
bun test src/companies/tests/unit

# Run only integration tests
bun test src/companies/tests/integration

# Run only E2E tests
bun test test/e2e

# Run specific test file
bun test src/companies/tests/unit/companies.controller.spec.ts
```

## Test Utilities

The `test-utils` directory provides:

- **Factories**: Create consistent test data
- **Mocks**: Mock external dependencies
- **Helpers**: Common test setup and assertions
- **Database Utils**: Database-specific testing utilities

## Best Practices Applied

1. **DRY Principle**: Shared utilities prevent code duplication
2. **Clear Naming**: Test files clearly indicate what they test
3. **Focused Tests**: Each test file has a single responsibility
4. **Consistent Structure**: All tests follow the same patterns
5. **Comprehensive Coverage**: Unit, integration, and E2E tests
6. **Easy Maintenance**: Changes to one component don't affect others
