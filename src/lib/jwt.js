import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_dulu';

export function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
