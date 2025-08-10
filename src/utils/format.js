// Formatting helpers
export const formatRupiah = (amount) => {
  if (amount == null || isNaN(amount)) return 'Rp 0';
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
};
