/**
 * Format angka ringkas untuk landing page.
 * Dipakai untuk statistik (mis. "Rp38 jt", "4,2 rb").
 */

/** Angka biasa dengan pemisah ribuan locale Indonesia. */
export const formatNumber = (value) => {
  const n = Number(value) || 0;
  return Math.round(n).toLocaleString('id-ID');
};

/**
 * Angka ringkas: 1.2 jt / 4.2 rb / 850.
 * `suffix` bisa dikustom (default: jt / rb).
 */
export const formatCompact = (value, { jt = 'jt', rb = 'rb' } = {}) => {
  const n = Number(value) || 0;
  if (n >= 1_000_000) return `${trimZero(n / 1_000_000)} ${jt}`;
  if (n >= 1_000) return `${trimZero(n / 1_000)} ${rb}`;
  return formatNumber(n);
};

/** Rupiah ringkas: "Rp38 jt". */
export const formatCompactIDR = (value) => `Rp${formatCompact(value)}`;

/** Buang angka nol di belakang koma: 1.0 -> 1, 4.2 -> 4.2 */
const trimZero = (n) => {
  const fixed = n.toFixed(1);
  return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed;
};
