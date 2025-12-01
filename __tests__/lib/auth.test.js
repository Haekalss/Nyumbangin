// Mock dependencies BEFORE any imports
jest.mock('@/lib/jwt');
jest.mock('@/lib/db', () => jest.fn().mockResolvedValue());
jest.mock('@/models/Creator', () => ({
  findById: jest.fn()
}));
jest.mock('@/models/Admin', () => ({
  findById: jest.fn()
}));

import { authMiddleware, requireCreator, requireAdmin, getUserFromToken } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import Admin from '@/models/Admin';

describe('Authentication Library - CRITICAL', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    dbConnect.mockResolvedValue();
  });

  describe('authMiddleware - Core Authentication', () => {
    test('CRITICAL: rejects request without token', async () => {
      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('CRITICAL: rejects request with malformed token', async () => {
      mockReq.headers.authorization = 'InvalidFormat';

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No token provided' });
    });

    test('CRITICAL: accepts valid creator token', async () => {
      const mockCreator = { _id: 'creator123', email: 'creator@test.com', username: 'creator' };
      mockReq.headers.authorization = 'Bearer validtoken';
      verifyToken.mockReturnValue({ id: 'creator123' });
      Creator.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockCreator)
      });

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(dbConnect).toHaveBeenCalled();
      expect(verifyToken).toHaveBeenCalledWith('validtoken');
      expect(mockReq.user).toEqual(mockCreator);
      expect(mockReq.userType).toBe('creator');
      expect(mockNext).toHaveBeenCalled();
    });

    test('CRITICAL: accepts valid admin token', async () => {
      const mockAdmin = { _id: 'admin123', email: 'admin@test.com', role: 'superadmin' };
      mockReq.headers.authorization = 'Bearer admintoken';
      verifyToken.mockReturnValue({ id: 'admin123' });
      Creator.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
      Admin.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmin)
      });

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(mockAdmin);
      expect(mockReq.userType).toBe('admin');
      expect(mockNext).toHaveBeenCalled();
    });

    test('CRITICAL: rejects invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalidtoken';
      verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('CRITICAL: rejects token for non-existent user', async () => {
      mockReq.headers.authorization = 'Bearer validtoken';
      verifyToken.mockReturnValue({ id: 'nonexistent' });
      Creator.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
      Admin.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token user' });
    });

    test('CRITICAL: enforces admin role requirement', async () => {
      const mockCreator = { _id: 'creator123', email: 'creator@test.com' };
      mockReq.headers.authorization = 'Bearer creatortoken';
      verifyToken.mockReturnValue({ id: 'creator123' });
      Creator.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockCreator)
      });

      await authMiddleware(mockReq, mockRes, mockNext, 'admin');

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Forbidden: Admin access required' });
    });

    test('CRITICAL: enforces creator role requirement', async () => {
      const mockAdmin = { _id: 'admin123', email: 'admin@test.com' };
      mockReq.headers.authorization = 'Bearer admintoken';
      verifyToken.mockReturnValue({ id: 'admin123' });
      Creator.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
      Admin.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmin)
      });

      await authMiddleware(mockReq, mockRes, mockNext, 'user');

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Forbidden: Creator access required' });
    });
  });

  describe('requireCreator - Creator Route Protection', () => {
    test('CRITICAL: allows creator access', async () => {
      const mockCreator = { _id: 'creator123' };
      mockReq.headers.authorization = 'Bearer creatortoken';
      verifyToken.mockReturnValue({ id: 'creator123' });
      Creator.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockCreator)
      });

      await requireCreator(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('CRITICAL: blocks admin from creator routes', async () => {
      const mockAdmin = { _id: 'admin123' };
      mockReq.headers.authorization = 'Bearer admintoken';
      verifyToken.mockReturnValue({ id: 'admin123' });
      Creator.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
      Admin.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmin)
      });

      await requireCreator(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin - Admin Route Protection', () => {
    test('CRITICAL: allows admin access', async () => {
      const mockAdmin = { _id: 'admin123' };
      mockReq.headers.authorization = 'Bearer admintoken';
      verifyToken.mockReturnValue({ id: 'admin123' });
      Creator.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
      Admin.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmin)
      });

      await requireAdmin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('CRITICAL: blocks creator from admin routes', async () => {
      const mockCreator = { _id: 'creator123' };
      mockReq.headers.authorization = 'Bearer creatortoken';
      verifyToken.mockReturnValue({ id: 'creator123' });
      Creator.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockCreator)
      });

      await requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('getUserFromToken - Token Validation', () => {
    test('CRITICAL: returns creator from valid token', async () => {
      const mockCreator = { _id: 'creator123', email: 'creator@test.com' };
      verifyToken.mockReturnValue({ id: 'creator123' });
      Creator.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockCreator)
      });

      const result = await getUserFromToken('validtoken');

      expect(result.user).toEqual(mockCreator);
      expect(result.type).toBe('creator');
    });

    test('CRITICAL: returns admin from valid token', async () => {
      const mockAdmin = { _id: 'admin123', email: 'admin@test.com' };
      verifyToken.mockReturnValue({ id: 'admin123' });
      Creator.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
      Admin.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmin)
      });

      const result = await getUserFromToken('validtoken');

      expect(result.user).toEqual(mockAdmin);
      expect(result.type).toBe('admin');
    });

    test('CRITICAL: returns null for invalid token', async () => {
      verifyToken.mockImplementation(() => {
        throw new Error('Invalid');
      });

      const result = await getUserFromToken('invalidtoken');

      expect(result).toBeNull();
    });

    test('CRITICAL: returns null for non-existent user', async () => {
      verifyToken.mockReturnValue({ id: 'nonexistent' });
      Creator.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
      Admin.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      const result = await getUserFromToken('validtoken');

      expect(result).toBeNull();
    });
  });

  describe('Database Connection Resilience', () => {
    test('CRITICAL: handles database connection failure', async () => {
      mockReq.headers.authorization = 'Bearer validtoken';
      dbConnect.mockRejectedValue(new Error('DB connection failed'));

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
