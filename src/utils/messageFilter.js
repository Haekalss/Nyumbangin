/**
 * Filter kata-kata kasar/tidak pantas dari pesan donasi
 * @param {string} message - Pesan asli
 * @param {Array<string>} filteredWords - Array kata-kata yang akan difilter
 * @returns {string} - Pesan yang sudah difilter
 */
export function filterMessage(message, filteredWords = []) {
  if (!message || filteredWords.length === 0) {
    return message;
  }

  let filteredMessage = message;

  filteredWords.forEach(word => {
    if (!word || word.trim() === '') return;

    // Escape special regex characters
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create regex pattern:
    // - Case insensitive (i flag)
    // - Word boundaries (\b) untuk match whole word
    // - Global (g flag) untuk replace semua occurrence
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
    
    // Replace dengan bintang sesuai panjang kata
    filteredMessage = filteredMessage.replace(regex, (match) => {
      return '*'.repeat(match.length);
    });
  });

  return filteredMessage;
}

/**
 * Check apakah message mengandung kata terfilter
 * @param {string} message - Pesan yang akan dicek
 * @param {Array<string>} filteredWords - Array kata-kata yang akan difilter
 * @returns {boolean} - True jika ada kata terfilter
 */
export function hasFilteredWords(message, filteredWords = []) {
  if (!message || filteredWords.length === 0) {
    return false;
  }

  return filteredWords.some(word => {
    if (!word || word.trim() === '') return false;
    
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'i');
    
    return regex.test(message);
  });
}
