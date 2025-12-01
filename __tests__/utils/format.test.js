import { formatRupiah } from '@/utils/format';

describe('formatRupiah', () => {
  test('should format positive numbers correctly', () => {
    expect(formatRupiah(1000)).toBe('Rp 1.000');
    expect(formatRupiah(1000000)).toBe('Rp 1.000.000');
    expect(formatRupiah(50000)).toBe('Rp 50.000');
  });

  test('should handle zero', () => {
    expect(formatRupiah(0)).toBe('Rp 0');
  });

  test('should handle null and undefined', () => {
    expect(formatRupiah(null)).toBe('Rp 0');
    expect(formatRupiah(undefined)).toBe('Rp 0');
  });

  test('should handle NaN values', () => {
    expect(formatRupiah('invalid')).toBe('Rp 0');
    expect(formatRupiah(NaN)).toBe('Rp 0');
  });

  test('should handle decimal numbers', () => {
    expect(formatRupiah(1000.50)).toBe('Rp 1.000,5');
  });

  test('should handle negative numbers', () => {
    expect(formatRupiah(-1000)).toBe('Rp -1.000');
  });

  test('should handle string numbers', () => {
    expect(formatRupiah('5000')).toBe('Rp 5.000');
  });
});
