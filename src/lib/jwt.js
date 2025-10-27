import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_dulu';

export function signToken(user, userType = 'creator') {
  return jwt.sign(
    { 
      userId: user._id, 
      username: user.username,
      email: user.email, 
      userType: userType,
      role: userType === 'admin' ? user.role : 'user' // For backwards compatibility
    },
    JWT_SECRET,
    { expiresIn: '3h' }
  );
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Handle backward compatibility for old tokens
    if (decoded.id && !decoded.userId) {
      decoded.userId = decoded.id;
    }
    if (decoded.role && !decoded.userType) {
      decoded.userType = decoded.role === 'admin' ? 'admin' : 'creator';
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}
