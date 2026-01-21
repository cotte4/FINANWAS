# Finanwas Testing Infrastructure

This directory contains comprehensive tests for the Finanwas application.

## Setup

### Install Dependencies

```bash
npm install
```

This will install all testing dependencies including:
- `vitest` - Fast unit test framework
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom jest matchers for DOM
- `@testing-library/user-event` - User interaction simulation
- `msw` - Mock Service Worker for API mocking
- `happy-dom` - Lightweight DOM implementation
- `@vitest/ui` - UI for test visualization
- `@vitest/coverage-v8` - Code coverage reporting

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (recommended for development)
```bash
npm test -- --watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Generate coverage report
```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/` directory.

## Test Structure

```
tests/
├── setup.ts                      # Global test configuration
├── mocks/
│   ├── handlers.ts              # MSW request handlers
│   └── server.ts                # MSW server setup
├── utils/
│   ├── test-utils.tsx           # Custom render functions
│   └── mock-data.ts             # Reusable test fixtures
├── lib/
│   └── utils/
│       ├── formatters.test.ts   # Format function tests
│       ├── validators.test.ts   # Validation function tests
│       └── calculations.test.ts # Calculation function tests
├── components/
│   ├── forms/
│   │   ├── FormInput.test.tsx   # FormInput component tests
│   │   └── PasswordInput.test.tsx
│   └── ui/
│       └── Modal.test.tsx       # Modal component tests
├── hooks/
│   ├── useAuth.test.tsx         # Auth hook tests
│   ├── useLocalStorage.test.tsx # LocalStorage hook tests
│   └── useDebounce.test.tsx     # Debounce hook tests
└── integration/
    └── auth.test.ts             # Auth API integration tests
```

## Test Coverage Goals

The test suite aims for 70%+ code coverage across:
- Lines
- Functions
- Branches
- Statements

Current coverage can be viewed by running:
```bash
npm run test:coverage
```

## Writing Tests

### Component Tests

Use the custom `renderWithProviders` function to render components with necessary providers:

```typescript
import { renderWithProviders, screen } from '../utils/test-utils';
import { MyComponent } from '@/components/MyComponent';

it('should render correctly', () => {
  renderWithProviders(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Hook Tests

Use `renderHook` from `@testing-library/react`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '@/hooks/useMyHook';

it('should update value', () => {
  const { result } = renderHook(() => useMyHook());

  act(() => {
    result.current.updateValue('new value');
  });

  expect(result.current.value).toBe('new value');
});
```

### API Tests

MSW automatically intercepts fetch requests. Add handlers in `tests/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/endpoint', () => {
    return HttpResponse.json({ data: 'mock data' });
  }),
];
```

## Utilities

### Mock Data

Reusable mock data is available in `tests/utils/mock-data.ts`:
- `mockUsers` - Test user fixtures
- `mockInvitationCodes` - Invitation code fixtures
- `mockAssets` - Portfolio asset fixtures
- `mockGoals` - Savings goal fixtures
- And more...

### Custom Matchers

The test suite includes custom matchers from `@testing-library/jest-dom`:
- `toBeInTheDocument()`
- `toHaveClass()`
- `toHaveAttribute()`
- `toHaveTextContent()`
- And many more...

## Best Practices

1. **Test behavior, not implementation** - Focus on what the user sees and does
2. **Use semantic queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test error cases** - Always test both success and failure paths
4. **Keep tests independent** - Each test should be able to run in isolation
5. **Use descriptive test names** - Test names should clearly describe what they test
6. **Mock external dependencies** - Use MSW for API calls, mock Next.js router, etc.

## Troubleshooting

### Tests are slow
- Use `vi.useFakeTimers()` for tests with delays
- Run specific test files instead of the entire suite
- Check for missing `await` statements

### Tests failing intermittently
- Add proper `waitFor` for async operations
- Check for timing issues with debounced values
- Ensure proper cleanup in `afterEach` hooks

### Coverage is low
- Check the coverage report in `coverage/index.html`
- Focus on testing critical paths first
- Ensure all error cases are covered

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test -- --run

- name: Generate coverage
  run: npm run test:coverage
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
