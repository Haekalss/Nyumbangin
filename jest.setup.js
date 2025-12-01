// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock bson module completely
jest.mock('bson', () => {
  const actualBson = {
    ObjectId: jest.fn().mockImplementation((id) => ({
      toString: () => id || '507f1f77bcf86cd799439011',
      toHexString: () => id || '507f1f77bcf86cd799439011',
      equals: (other) => other?.toString() === (id || '507f1f77bcf86cd799439011'),
    })),
    NumberUtils: {},
    BSON: {},
    BSONError: Error,
  };
  return actualBson;
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Set up environment variables for tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
process.env.JWT_SECRET = 'test-secret-key-for-testing-only'
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Suppress console errors in tests (keeps output clean)
// You can remove this if you want to see all console.error messages
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
       args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
       args[0].includes('Error checking username'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
