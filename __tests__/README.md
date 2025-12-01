# 📁 Test Organization - Centralized Structure

## New Test Structure

All tests are now organized in a centralized `__tests__` folder at project root:

```
Nyumbangin/
├── __tests__/                    # ✅ All tests here (centralized)
│   ├── components/
│   │   └── StatsCard.test.js
│   ├── utils/
│   │   └── format.test.js
│   ├── lib/
│   │   └── jwt.test.js
│   └── api/
│       └── check-username.test.js
├── src/
│   ├── components/
│   │   └── StatsCard.js         # Source file
│   ├── utils/
│   │   └── format.js            # Source file
│   └── lib/
│       └── jwt.js               # Source file
└── pages/
    └── api/
        └── auth/
            └── check-username.js # Source file
```

## Benefits

### ✅ Pros of Centralized Tests:
1. **Clean source folders** - No `__tests__` folders scattered everywhere
2. **Easy to find** - All tests in one place
3. **Better organization** - Tests grouped by type (components, utils, lib, api)
4. **Clearer separation** - Source code vs test code
5. **Easier to ignore** - Just one folder to exclude from builds

### 📝 Import Paths:
Use `@/` alias to import source files from tests:

```javascript
// ✅ Good - Using alias
import StatsCard from '@/components/StatsCard';
import { formatRupiah } from '@/utils/format';
import { signToken } from '@/lib/jwt';

// ❌ Bad - Relative paths get messy
import StatsCard from '../../src/components/StatsCard';
```

## Coverage Configuration

### Files Excluded from Coverage:
```javascript
// Won't appear in coverage report:
✅ src/app/**/page.js          // Next.js pages
✅ src/app/**/layout.js        // Layout files  
✅ src/models/**               // Mongoose schemas
✅ src/constants/**            // Constants
✅ pages/api/test/**           // Test endpoints
```

### Files Included in Coverage:
```javascript
// Will be tracked in coverage:
📊 src/components/**/*.js      // React components
📊 src/utils/**/*.js           // Utility functions
📊 src/lib/**/*.js             // Library/helper functions
📊 src/hooks/**/*.js           // Custom hooks
📊 pages/api/**/*.js           // API routes (except /test)
```

## Coverage Thresholds

Current thresholds (realistic for starting):
```javascript
{
  branches: 2%,
  functions: 2%,
  lines: 2%,
  statements: 2%
}
```

**Gradually increase** as you add more tests:
- Week 1-2: 2% → 10%
- Week 3-4: 10% → 20%
- Month 2: 20% → 40%
- Month 3+: 40% → 70%+

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test StatsCard

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# View HTML coverage report
start coverage/lcov-report/index.html
```

## Adding New Tests

### For Components:
Create test in `__tests__/components/YourComponent.test.js`

```javascript
import { render, screen } from '@testing-library/react';
import YourComponent from '@/components/YourComponent';

describe('YourComponent', () => {
  test('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Something')).toBeInTheDocument();
  });
});
```

### For Utils:
Create test in `__tests__/utils/yourUtil.test.js`

```javascript
import { yourFunction } from '@/utils/yourUtil';

describe('yourFunction', () => {
  test('should do something', () => {
    expect(yourFunction('input')).toBe('output');
  });
});
```

### For API Routes:
Create test in `__tests__/api/your-endpoint.test.js`

```javascript
// Mock dependencies first
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({}),
}));

import handler from '@/../../pages/api/your-endpoint';

describe('/api/your-endpoint', () => {
  test('should handle requests', async () => {
    const req = { method: 'POST', body: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
```

## Migration Notes

### Old Structure (Scattered):
```
src/
├── components/
│   ├── StatsCard.js
│   └── __tests__/              ❌ Old location
│       └── StatsCard.test.js
└── utils/
    ├── format.js
    └── __tests__/              ❌ Old location
        └── format.test.js
```

### New Structure (Centralized):
```
__tests__/                      ✅ New location
├── components/
│   └── StatsCard.test.js
└── utils/
    └── format.test.js

src/
├── components/
│   └── StatsCard.js           # Clean!
└── utils/
    └── format.js              # Clean!
```

## Cleanup Instructions

After verifying tests work in new location:

1. **Delete old test folders:**
   ```bash
   rmdir /s src\components\__tests__
   rmdir /s src\utils\__tests__
   rmdir /s src\lib\__tests__
   rmdir /s pages\api\auth\__tests__
   ```

2. **Run tests to verify:**
   ```bash
   npm test
   ```

3. **Check coverage:**
   ```bash
   npm run test:coverage
   ```

All tests should pass with the same results! ✅
