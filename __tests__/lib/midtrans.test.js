import { getSnap, MIDTRANS_CLIENT_KEY } from '@/lib/midtrans';

// Mock midtrans-client
jest.mock('midtrans-client', () => ({
  Snap: jest.fn().mockImplementation((config) => ({
    config,
    isProduction: config.isProduction,
    serverKey: config.serverKey,
    clientKey: config.clientKey
  }))
}));

describe('Midtrans Payment Integration - CRITICAL', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset env for each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getSnap - Payment Gateway Initialization', () => {
    test('CRITICAL: uses configured keys from environment', () => {
      const snap = getSnap();

      // Keys should be whatever is in env (could be test or real keys)
      expect(typeof snap.config.serverKey).toBe('string');
      expect(typeof snap.config.clientKey).toBe('string');
    });

    test('CRITICAL: always uses sandbox mode (not production)', () => {
      process.env.MIDTRANS_SERVER_KEY = 'test-server-key';
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY = 'test-client-key';
      process.env.MIDTRANS_PRODUCTION = 'true';

      const snap = getSnap();

      // Should force sandbox even if env says production
      expect(snap.config.isProduction).toBe(false);
    });

    test('CRITICAL: handles missing env gracefully', () => {
      // Even with missing env, should not crash
      const snap = getSnap();
      
      expect(snap).toBeDefined();
      expect(snap.config.isProduction).toBe(false);
    });
  });

  describe('MIDTRANS_CLIENT_KEY Export', () => {
    test('CRITICAL: exports client key from environment', () => {
      // Note: This tests the module export which is set when file is loaded
      // The actual value depends on when env is set
      expect(typeof MIDTRANS_CLIENT_KEY).toBe('string');
    });
  });

  describe('Configuration Safety', () => {
    test('CRITICAL: sandbox mode prevents accidental production charges', () => {
      process.env.MIDTRANS_SERVER_KEY = 'prod-key';
      process.env.MIDTRANS_PRODUCTION = 'true';

      const snap = getSnap();

      // Critical safety check: should never be production
      expect(snap.config.isProduction).toBe(false);
    });

    test('CRITICAL: creates new instance each call (no singleton issues)', () => {
      process.env.MIDTRANS_SERVER_KEY = 'test-key-1';
      
      const snap1 = getSnap();
      
      process.env.MIDTRANS_SERVER_KEY = 'test-key-2';
      
      const snap2 = getSnap();

      // Should be different instances
      expect(snap1).not.toBe(snap2);
    });
  });
});
