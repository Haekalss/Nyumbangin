/**
 * Date Utilities untuk konsistensi waktu reset di seluruh aplikasi
 * Semua reset menggunakan midnight (00:00:00) waktu Indonesia (WIB UTC+7)
 */

/**
 * Get start of day (midnight 00:00:00) in Indonesia timezone (WIB UTC+7)
 * @param {Date} date - Date to get start of day from (default: now)
 * @returns {Date} Start of day in Indonesia timezone
 */
export function getStartOfDayIndonesia(date = new Date()) {
  // Convert to Indonesia timezone (UTC+7)
  const indonesiaOffset = 7 * 60; // 7 hours in minutes
  const localOffset = date.getTimezoneOffset(); // Local timezone offset in minutes
  
  // Create new date in Indonesia timezone
  const indonesiaTime = new Date(date.getTime() + (indonesiaOffset + localOffset) * 60 * 1000);
  
  // Set to midnight (00:00:00.000)
  indonesiaTime.setHours(0, 0, 0, 0);
  
  // Convert back to UTC
  const startOfDay = new Date(indonesiaTime.getTime() - (indonesiaOffset + localOffset) * 60 * 1000);
  
  return startOfDay;
}

/**
 * Get end of day (23:59:59.999) in Indonesia timezone (WIB UTC+7)
 * @param {Date} date - Date to get end of day from (default: now)
 * @returns {Date} End of day in Indonesia timezone
 */
export function getEndOfDayIndonesia(date = new Date()) {
  const startOfDay = getStartOfDayIndonesia(date);
  // Add 24 hours minus 1 millisecond
  return new Date(startOfDay.getTime() + (24 * 60 * 60 * 1000) - 1);
}

/**
 * Check if a date is today (Indonesia timezone)
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export function isTodayIndonesia(date) {
  const startOfToday = getStartOfDayIndonesia();
  const endOfToday = getEndOfDayIndonesia();
  const checkDate = new Date(date);
  
  return checkDate >= startOfToday && checkDate <= endOfToday;
}

/**
 * Get donations for today (since midnight Indonesia time)
 * @param {Array} donations - Array of donations
 * @returns {Array} Filtered donations for today
 */
export function getTodayDonations(donations) {
  const startOfToday = getStartOfDayIndonesia();
  
  return donations.filter(donation => {
    const donationDate = new Date(donation.createdAt);
    return donationDate >= startOfToday;
  });
}

/**
 * Get 24 hours ago from now (for archive purposes)
 * @returns {Date} 24 hours ago
 */
export function get24HoursAgo() {
  return new Date(Date.now() - (24 * 60 * 60 * 1000));
}

/**
 * Format date to Indonesia date string (YYYY-MM-DD)
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateIndonesia(date = new Date()) {
  const indonesiaOffset = 7 * 60;
  const localOffset = date.getTimezoneOffset();
  const indonesiaTime = new Date(date.getTime() + (indonesiaOffset + localOffset) * 60 * 1000);
  
  const year = indonesiaTime.getFullYear();
  const month = String(indonesiaTime.getMonth() + 1).padStart(2, '0');
  const day = String(indonesiaTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Get start of month in Indonesia timezone
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Date} Start of month
 */
export function getStartOfMonthIndonesia(year, month) {
  // Create date at start of month in Indonesia timezone
  const indonesiaOffset = 7 * 60;
  const date = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const localOffset = date.getTimezoneOffset();
  
  return new Date(date.getTime() - (indonesiaOffset + localOffset) * 60 * 1000);
}

/**
 * Get end of month in Indonesia timezone
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Date} End of month
 */
export function getEndOfMonthIndonesia(year, month) {
  // Create date at end of month in Indonesia timezone
  const indonesiaOffset = 7 * 60;
  const date = new Date(year, month, 0, 23, 59, 59, 999);
  const localOffset = date.getTimezoneOffset();
  
  return new Date(date.getTime() - (indonesiaOffset + localOffset) * 60 * 1000);
}
