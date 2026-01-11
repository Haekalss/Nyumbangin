const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^mongodb$': '<rootDir>/__mocks__/mongodb.js',
    '^mongodb/(.*)$': '<rootDir>/__mocks__/mongodb.js',
    '^bson$': '<rootDir>/__mocks__/mongodb.js',
    '^@mongodb/(.*)$': '<rootDir>/__mocks__/mongodb.js',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    'pages/api/**/*.{js,jsx}',
    // Exclude files that don't need testing
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx}',
    '!src/app/**/layout.js',
    '!src/app/**/page.js',
    '!src/app/**/loading.js',
    '!src/app/**/error.js',
    '!src/app/**/not-found.js',
    '!src/models/**',              // Mongoose models (just schema definitions)
    '!src/constants/**',           // Constants files
    '!pages/api/test/**',          // Test/debug endpoints
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**',
  ],
  coverageThreshold: {
    global: {
      branches: 20,    // Realistic target with current tests
      functions: 20,
      lines: 20,
      statements: 20,
    },
  },
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/dist/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(bson|mongodb|mongoose|@mongodb-js)/)'
  ],
  moduleDirectories: ['node_modules', '<rootDir>/'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
