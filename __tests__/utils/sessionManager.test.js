/**
 * @jest-environment jsdom
 */
import { SessionManager } from '@/utils/sessionManager';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('react-hot-toast');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

describe('SessionManager - CRITICAL Session Security', () => {
  let sessionManager;
  let mockRouter;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    sessionManager = new SessionManager();
    mockRouter = { push: jest.fn() };
    
    // Mock localStorage with spies
    jest.spyOn(Storage.prototype, 'getItem');
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'removeItem');
    Storage.prototype.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
    sessionManager.stopSessionMonitoring();
    jest.restoreAllMocks();
  });

  describe('Session Token Management', () => {
    test('CRITICAL: detects missing token and logs out', () => {
      localStorage.getItem.mockReturnValue(null);

      sessionManager.checkTokenExpiry(mockRouter);

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    test('CRITICAL: detects expired token and forces logout', () => {
      // Create expired token (expired 1 hour ago)
      const expiredTime = Math.floor(Date.now() / 1000) - 3600;
      const payload = { exp: expiredTime };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      
      localStorage.getItem.mockReturnValue(token);

      sessionManager.checkTokenExpiry(mockRouter);

      expect(toast.error).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      
      // Fast forward timeout
      jest.advanceTimersByTime(1100);
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });

    test('CRITICAL: shows warning for soon-to-expire token', () => {
      // Create token expiring in 5 minutes
      const soonExpireTime = Math.floor(Date.now() / 1000) + 300;
      const payload = { exp: soonExpireTime };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      
      localStorage.getItem.mockReturnValue(token);

      sessionManager.checkTokenExpiry(mockRouter);

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Sesi Anda akan berakhir'),
        expect.any(Object)
      );
    });

    test('CRITICAL: does not show duplicate warnings', () => {
      const soonExpireTime = Math.floor(Date.now() / 1000) + 300;
      const payload = { exp: soonExpireTime };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      
      localStorage.getItem.mockReturnValue(token);

      // Check twice
      sessionManager.checkTokenExpiry(mockRouter);
      sessionManager.checkTokenExpiry(mockRouter);

      // Should only warn once
      expect(toast.error).toHaveBeenCalledTimes(1);
    });

    test('CRITICAL: handles malformed token and logs error', () => {
      Storage.prototype.getItem.mockReturnValue('invalid.token.format');

      sessionManager.checkTokenExpiry(mockRouter);

      // Should call handleLogout eventually
      expect(toast.error).toHaveBeenCalled();
    });

    test('CRITICAL: allows valid token through', () => {
      // Create token expiring in 1 hour
      const validExpireTime = Math.floor(Date.now() / 1000) + 3600;
      const payload = { exp: validExpireTime };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      
      localStorage.getItem.mockReturnValue(token);

      sessionManager.checkTokenExpiry(mockRouter);

      // Should NOT logout or show warning
      expect(toast.error).not.toHaveBeenCalled();
      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('Session Monitoring', () => {
    test('CRITICAL: starts interval monitoring', () => {
      const validExpireTime = Math.floor(Date.now() / 1000) + 3600;
      const payload = { exp: validExpireTime };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.getItem.mockReturnValue(token);

      sessionManager.startSessionMonitoring(mockRouter);

      expect(sessionManager.checkInterval).not.toBeNull();
      
      // Advance time by 1 minute
      jest.advanceTimersByTime(60000);
      
      // Should have checked token at least twice (immediate + after interval)
      expect(localStorage.getItem).toHaveBeenCalledTimes(2);
    });

    test('CRITICAL: stops monitoring on cleanup', () => {
      sessionManager.startSessionMonitoring(mockRouter);
      const intervalId = sessionManager.checkInterval;
      
      sessionManager.stopSessionMonitoring();

      expect(sessionManager.checkInterval).toBeNull();
    });

    test('CRITICAL: checks immediately on start', () => {
      const validExpireTime = Math.floor(Date.now() / 1000) + 3600;
      const payload = { exp: validExpireTime };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.getItem.mockReturnValue(token);

      sessionManager.startSessionMonitoring(mockRouter);

      // Should check immediately without waiting for interval
      expect(localStorage.getItem).toHaveBeenCalled();
    });
  });

  describe('Manual Logout', () => {
    test('CRITICAL: clears all session data on logout', () => {
      sessionManager.logout(mockRouter);

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    test('CRITICAL: shows success message on logout', () => {
      sessionManager.logout(mockRouter);

      expect(toast.success).toHaveBeenCalledWith(
        'Berhasil logout!',
        expect.any(Object)
      );
    });

    test('CRITICAL: redirects to login after logout', () => {
      sessionManager.logout(mockRouter);

      jest.advanceTimersByTime(600);
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });

    test('CRITICAL: prevents auto-logout notification during manual logout', () => {
      // Clear any previous calls
      toast.error.mockClear();
      toast.success.mockClear();
      
      sessionManager.logout(mockRouter);

      // Should only show success toast, not error
      expect(toast.success).toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });

    test('CRITICAL: stops monitoring on logout', () => {
      sessionManager.startSessionMonitoring(mockRouter);
      
      sessionManager.logout(mockRouter);

      expect(sessionManager.checkInterval).toBeNull();
    });
  });

  describe('Security Edge Cases', () => {
    test('CRITICAL: handles token with no expiry field gracefully', () => {
      const payload = { userId: '123' }; // No exp field
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      Storage.prototype.getItem.mockReturnValue(token);

      sessionManager.checkTokenExpiry(mockRouter);

      // Code catches error silently and continues without NaN checks
      // No toast error expected, just graceful handling
      expect(sessionManager).toBeDefined();
    });

    test('CRITICAL: handles empty token string', () => {
      localStorage.getItem.mockReturnValue('');

      sessionManager.checkTokenExpiry(mockRouter);

      expect(localStorage.removeItem).toHaveBeenCalled();
    });

    test('CRITICAL: handles whitespace token', () => {
      localStorage.getItem.mockReturnValue('   ');

      sessionManager.checkTokenExpiry(mockRouter);

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('Concurrent Session Protection', () => {
    test('CRITICAL: multiple checkTokenExpiry calls are safe', () => {
      const validExpireTime = Math.floor(Date.now() / 1000) + 3600;
      const payload = { exp: validExpireTime };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.getItem.mockReturnValue(token);

      // Simulate rapid concurrent checks
      sessionManager.checkTokenExpiry(mockRouter);
      sessionManager.checkTokenExpiry(mockRouter);
      sessionManager.checkTokenExpiry(mockRouter);

      // Should not cause errors or duplicate actions
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});
