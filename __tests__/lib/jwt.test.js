import { signToken, verifyToken } from '@/lib/jwt';
import jwt from 'jsonwebtoken';

describe('JWT Utils', () => {
  const TEST_SECRET = 'test-secret-key-for-testing-only';

  // Mock jwt module to use our test secret
  beforeAll(() => {
    // Set JWT_SECRET before importing functions
    process.env.JWT_SECRET = TEST_SECRET;
  });

  describe('signToken', () => {
    test('should create a valid token for creator', () => {
      const user = {
        _id: '123456',
        username: 'testuser',
        email: 'test@example.com',
      };

      const token = signToken(user, 'creator');
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, TEST_SECRET);
      expect(decoded.userId).toBe('123456');
      expect(decoded.username).toBe('testuser');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.userType).toBe('creator');
      expect(decoded.role).toBe('user');
    });

    test('should create a valid token for admin', () => {
      const user = {
        _id: 'admin123',
        username: 'admin',
        email: 'admin@example.com',
        role: 'superadmin',
      };

      const token = signToken(user, 'admin');
      expect(token).toBeTruthy();

      const decoded = jwt.verify(token, TEST_SECRET);
      expect(decoded.userId).toBe('admin123');
      expect(decoded.userType).toBe('admin');
      expect(decoded.role).toBe('superadmin');
    });

    test('should default to creator when userType not specified', () => {
      const user = {
        _id: '123',
        username: 'user',
        email: 'user@test.com',
      };

      const token = signToken(user);
      const decoded = jwt.verify(token, TEST_SECRET);
      expect(decoded.userType).toBe('creator');
      expect(decoded.role).toBe('user');
    });

    test('should include expiration time', () => {
      const user = {
        _id: '123',
        username: 'user',
        email: 'user@test.com',
      };

      const token = signToken(user);
      const decoded = jwt.verify(token, TEST_SECRET);
      
      expect(decoded.exp).toBeTruthy();
      expect(decoded.iat).toBeTruthy();
    });
  });

  describe('verifyToken', () => {
    test('should verify valid token', () => {
      const user = {
        _id: '123',
        username: 'testuser',
        email: 'test@example.com',
      };

      const token = signToken(user);
      const decoded = verifyToken(token);

      expect(decoded).toBeTruthy();
      expect(decoded.userId).toBe('123');
      expect(decoded.username).toBe('testuser');
    });

    test('should return null for invalid token', () => {
      const result = verifyToken('invalid-token');
      expect(result).toBeNull();
    });

    test('should return null for expired token', () => {
      const expiredToken = jwt.sign(
        { userId: '123' },
        TEST_SECRET,
        { expiresIn: '-1h' }
      );

      const result = verifyToken(expiredToken);
      expect(result).toBeNull();
    });

    test('should handle backward compatibility for old tokens with id field', () => {
      const oldToken = jwt.sign(
        { id: '123', username: 'user' },
        TEST_SECRET
      );

      const decoded = verifyToken(oldToken);
      expect(decoded).toBeTruthy();
      expect(decoded.userId).toBe('123');
    });

    test('should handle backward compatibility for role field', () => {
      const oldToken = jwt.sign(
        { userId: '123', role: 'admin' },
        TEST_SECRET
      );

      const decoded = verifyToken(oldToken);
      expect(decoded).toBeTruthy();
      expect(decoded.userType).toBe('admin');
    });

    test('should handle creator role backward compatibility', () => {
      const oldToken = jwt.sign(
        { userId: '123', role: 'user' },
        TEST_SECRET
      );

      const decoded = verifyToken(oldToken);
      expect(decoded).toBeTruthy();
      expect(decoded.userType).toBe('creator');
    });
  });
});
