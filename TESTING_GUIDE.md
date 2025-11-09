# 🧪 Comprehensive Testing Guide - SPORE CMMS

## Overview
This guide explains the AI-friendly testing system designed for the SPORE CMMS application. The testing framework is built to be easily expandable and maintained by AI assistants.

## 📁 Testing Structure

```
tests/
├── setup/                  # Test setup files
│   ├── unit.setup.js      # Unit test mocks and configuration
│   ├── integration.setup.js # Integration test setup
│   ├── security.setup.js   # Security-focused test setup
│   └── api.setup.js        # API test utilities
├── unit/                   # Unit tests (fast, isolated)
│   ├── validation.test.ts
│   ├── rate-limiting.test.ts
│   └── activity-logger.test.ts
├── integration/            # Integration tests (component interaction)
│   ├── auth-flow.test.ts
│   └── data-flow.test.ts
├── security/              # Security-focused tests
│   ├── rate-limiting.test.ts
│   ├── input-validation.test.ts
│   └── auth-security.test.ts
└── api/                   # API endpoint tests
    ├── assets.test.ts
    ├── work-orders.test.ts
    └── auth.test.ts
```

## 🚀 Available Test Commands

### Basic Testing Commands
```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI environments
npm run test:ci
```

### Targeted Testing Commands
```bash
# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only security tests
npm run test:security

# Run only API tests
npm run test:api

# Run all specialized tests
npm run test:all
```

## 🎯 Testing Patterns (AI-Friendly)

### 1. Descriptive Test Names
```typescript
// ✅ Good: Descriptive and clear
it('should reject asset creation with invalid category', () => {
  // Test implementation
})

// ❌ Bad: Vague
it('handles bad input', () => {
  // Test implementation
})
```

### 2. Arrange-Act-Assert Pattern
```typescript
describe('Asset Creation', () => {
  it('should create asset with valid data', async () => {
    // Arrange
    const validAssetData = {
      name: 'Test Machine',
      category: 'equipment',
      location: 'Workshop'
    }

    // Act
    const result = await createAsset(validAssetData)

    // Assert
    expect(result.success).toBe(true)
    expect(result.data.name).toBe('Test Machine')
  })
})
```

### 3. Test Data Factories
```typescript
// Use factory functions for test data
const createMockAsset = (overrides = {}) => ({
  id: 'test-asset-id',
  name: 'Test Machine',
  category: 'equipment',
  location: 'Workshop',
  status: 'ACTIVE',
  createdAt: new Date(),
  ...overrides
})
```

### 4. Group Related Tests
```typescript
describe('Input Validation', () => {
  describe('Asset Schema', () => {
    // Asset-specific validation tests
  })

  describe('Work Order Schema', () => {
    // Work order-specific validation tests
  })
})
```

## 🔒 Security Testing Focus

### Rate Limiting Tests
- ✅ Test different rate limit types
- ✅ Test IP extraction from headers
- ✅ Test rate limit violations
- ✅ Test concurrent requests

### Input Validation Tests
- ✅ Test valid and invalid inputs
- ✅ Test boundary conditions
- ✅ Test SQL injection prevention
- ✅ Test XSS prevention

### Authentication Tests
- ✅ Test session validation
- ✅ Test unauthorized access
- ✅ Test role-based access control
- ✅ Test token security

## 🔧 Testing Utilities

### Security Test Utils
```typescript
// Available in security tests
global.securityTestUtils.createMockRequest()
global.securityTestUtils.assertSecurityHeaders()
global.securityTestUtils.assertRateLimitHeaders()
```

### API Test Utils
```typescript
// Available in API tests
global.apiTestUtils.createMockApiRequest()
global.apiTestUtils.createMockSession()
global.apiTestUtils.assertApiResponse()
```

## 📊 Coverage Requirements

### Coverage Thresholds
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

## 🛠️ Mock Strategy

### Unit Test Mocks
- **Database**: Full mocking with predictable responses
- **External APIs**: Mocked with realistic data
- **Authentication**: Mocked session data
- **Rate Limiting**: Mocked to always succeed unless testing rate limits

### Integration Test Mocks
- **Database**: Partial mocking or test database
- **External APIs**: Mocked with realistic failure scenarios
- **Authentication**: Mocked with session flows
- **Rate Limiting**: Mocked with actual behavior simulation

### Security Test Mocks
- **Rate Limiting**: Configurable success/failure
- **Security Headers**: Actual implementation with assertions
- **Input Validation**: Real validation functions
- **Authentication**: Real authentication flows

## 🚨 Security Testing Checklist

### Before Production Deployment
- [ ] All security tests pass
- [ ] Rate limiting tests cover all endpoint types
- [ ] Input validation tests cover all schemas
- [ ] Authentication tests cover all roles
- [ ] API tests include security header verification
- [ ] Coverage requirements met
- [ ] No sensitive data in test files
- [ ] Test secrets are properly managed

## 📋 AI Development Guidelines

### When Adding New Tests
1. **Follow the naming convention**: `test-pathPattern=type`
2. **Use descriptive test names**: Explain what the test validates
3. **Include edge cases**: Test both success and failure scenarios
4. **Add security considerations**: Test potential vulnerabilities
5. **Document test purpose**: Comments explaining complex scenarios

### When Modifying Existing Tests
1. **Preserve test intent**: Don't change what the test validates
2. **Update test data**: Keep test data realistic
3. **Maintain coverage**: Don't reduce test coverage
4. **Check security impact**: Ensure security aspects remain tested

### Test Maintenance
1. **Regular updates**: Keep tests in sync with code changes
2. **Performance monitoring**: Ensure tests run efficiently
3. **Coverage monitoring**: Maintain or improve coverage percentages
4. **Security review**: Regular security test audits

## 🔗 Integration with Sentry

### Error Testing
```typescript
// Test Sentry integration in production
it('should send critical errors to Sentry', async () => {
  // Arrange
  const criticalError = new Error('Database connection failed')

  // Act
  const result = await handleCriticalError(criticalError)

  // Assert
  expect(Sentry.captureException).toHaveBeenCalledWith(criticalError)
  expect(result).toEqual({ success: false, message: 'Internal error' })
})
```

### Performance Testing
```typescript
// Test performance metrics
it('should complete within acceptable time limits', async () => {
  const startTime = performance.now()

  await expensiveOperation()

  const duration = performance.now() - startTime
  expect(duration).toBeLessThan(1000) // 1 second limit
})
```

## 📚 Testing Best Practices

### Do's
- ✅ Test both happy path and error scenarios
- ✅ Use descriptive test names
- ✅ Keep tests independent and isolated
- ✅ Use realistic test data
- ✅ Include security considerations
- ✅ Test edge cases and boundary conditions

### Don'ts
- ❌ Test implementation details
- ❌ Use hardcoded values in assertions
- ❌ Create tests that depend on each other
- ❌ Include sensitive data in tests
- ❌ Write tests without clear purpose
- ❌ Ignore test failures

## 🚀 Running Tests in CI/CD

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - name: Upload coverage
        uses: codecov/codecov-action@v1
```

### Environment Variables
```bash
# Set test environment
NODE_ENV=test

# Disable Sentry in tests
SENTRY_DSN=

# Use test database
DATABASE_URL="file:./test.db"
```

## 🔄 Continuous Improvement

### Test Metrics to Monitor
- Test execution time
- Coverage percentages
- Test failure rates
- Security test coverage
- Performance test results

### Regular Reviews
- Weekly test coverage reports
- Monthly security test audits
- Quarterly test strategy reviews
- Annual testing framework updates

This testing system is designed to be easily maintained and expanded by AI assistants while ensuring comprehensive coverage of all application functionality and security measures.