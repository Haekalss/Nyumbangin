// Password change endpoint removed. Returning 404 to disable.
export default function handler(req, res) {
  return res.status(404).json({ message: 'Endpoint removed' });
}
