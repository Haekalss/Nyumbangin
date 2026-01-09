# BAB 4: AUTENTIKASI & OTORISASI

<div align="center">

**⏱️ Estimasi Waktu: 2-3 Jam**

</div>

---

## 🎯 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, Anda akan:
- ✅ Memahami konsep JWT (JSON Web Token)
- ✅ Implementasi login & registration flow
- ✅ Membuat middleware untuk protected routes
- ✅ Implementasi Role-Based Access Control (RBAC)
- ✅ Memahami security best practices untuk authentication
- ✅ Integrasi OAuth dengan Google (optional)

---

## 4.1 Strategi Authentication

### JWT vs Session-Based Auth

| Aspect | JWT | Session |
|--------|-----|---------|
| **Storage** | Client-side (localStorage/cookie) | Server-side (memory/Redis) |
| **Scalability** | Stateless - easy to scale | Stateful - needs shared storage |
| **Security** | Token can't be revoked easily | Easy to revoke sessions |
| **Bandwidth** | Larger (sent with every request) | Smaller (only session ID) |
| **Best for** | APIs, microservices, mobile apps | Traditional web apps |

### Mengapa JWT untuk Platform Ini?

✅ **Stateless** - No need for session storage (Redis/Memcached)  
✅ **API-friendly** - Perfect untuk REST API architecture  
✅ **Mobile-ready** - Easy integration untuk mobile app nanti  
✅ **Scalable** - Serverless-friendly (Vercel)  
✅ **Cross-domain** - Easy untuk future subdomain/CORS setup  

**Trade-off**: Token tidak bisa di-revoke sampai expire (solved dengan short expiry + refresh token strategy)

---

## 4.2 User Registration Flow

### Creator Registration

```javascript
// pages/api/auth/register.js
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const {
      username,
      email,
      password,
      displayName,
      bankAccount,
    } = req.body;

    // 1. Validation
    if (!username || !email || !password || !displayName) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['username', 'email', 'password', 'displayName'],
      });
    }

    // Username format validation
    if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
      return res.status(400).json({
        error: 'Username must be 3-30 characters, lowercase letters, numbers, dash, or underscore only',
      });
    }

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters' 
      });
    }

    // 2. Check if username/email already exists
    const existingCreator = await Creator.findOne({
      $or: [{ username }, { email }],
    });

    if (existingCreator) {
      const field = existingCreator.username === username ? 'Username' : 'Email';
      return res.status(409).json({ 
        error: `${field} already taken` 
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create creator
    const creator = new Creator({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      displayName,
      bankAccount: bankAccount || {},
    });

    await creator.save();

    // 5. Generate JWT token
    const token = signToken({
      userId: creator._id,
      username: creator.username,
      role: 'creator',
    }, '7d'); // 7 days expiry

    // 6. Return success (don't send password!)
    const creatorData = creator.toObject();
    delete creatorData.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      creator: creatorData,
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(error.errors).map(e => e.message),
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

### Frontend Registration Component

```javascript
// src/app/creator/register/page.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          bankAccount: {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            accountName: formData.accountName,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.creator));

      toast.success('Registration successful!');
      router.push('/creator/dashboard');

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Create Creator Account</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="johndoe"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lowercase, 3-30 chars, letters/numbers/dash/underscore
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="John Doe"
            />
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Bank Account (for payouts)</h3>
            
            <div className="space-y-3">
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Bank</option>
                <option value="BCA">BCA</option>
                <option value="Mandiri">Mandiri</option>
                <option value="BNI">BNI</option>
                <option value="BRI">BRI</option>
                <option value="CIMB">CIMB Niaga</option>
              </select>

              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Account Number"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                placeholder="Account Name"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
```

---

## 4.3 Login Flow

### Backend Login API

```javascript
// pages/api/auth/login.js
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { email, password, role = 'creator' } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Determine which model to use
    const Model = role === 'admin' ? Admin : Creator;

    // Find user (include password field)
    const user = await Model.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Check if account is active
    if (user.isActive === false) {
      return res.status(403).json({ 
        error: 'Account is inactive. Please contact support.' 
      });
    }

    // Check if suspended (for creators)
    if (role === 'creator' && user.isSuspended) {
      return res.status(403).json({
        error: 'Account suspended',
        reason: user.suspensionReason || 'Contact support for details',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = signToken({
      userId: user._id,
      username: user.username,
      role: role,
    }, '7d');

    // Prepare user data (remove password)
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userData,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

### Frontend Login Component

```javascript
// src/app/login/page.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'creator', // or 'admin'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success('Login successful!');

      // Redirect based on role
      if (formData.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/creator/dashboard');
      }

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="creator">Creator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/creator/register" className="text-blue-600 hover:underline">
            Register as Creator
          </a>
        </p>
      </div>
    </div>
  );
}
```

---

## 4.4 JWT Implementation

### JWT Utility Functions

```javascript
// src/lib/jwt.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

/**
 * Sign a JWT token
 * @param {Object} payload - Data to encode in token
 * @param {String} expiresIn - Expiry time (e.g., '7d', '24h', '1h')
 * @returns {String} Signed JWT token
 */
export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify and decode JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('Token expired:', error.message);
    } else if (error.name === 'JsonWebTokenError') {
      console.log('Invalid token:', error.message);
    }
    return null;
  }
}

/**
 * Decode token without verification (use cautiously!)
 * @param {String} token - JWT token
 * @returns {Object|null} Decoded payload (unverified)
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param {Object} req - Request object
 * @returns {String|null} Token or null
 */
export function extractToken(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) return null;
  
  // Format: "Bearer <token>"
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
}
```

---

### Token Structure

```javascript
// Example JWT payload
{
  userId: "507f1f77bcf86cd799439011",
  username: "johndoe",
  role: "creator",
  iat: 1704729600, // Issued at (timestamp)
  exp: 1705334400  // Expires at (timestamp)
}
```

**Debug token**: Paste ke https://jwt.io/ untuk decode & inspect

---

## 4.5 Role-Based Access Control (RBAC)

### Middleware untuk Protected Routes

```javascript
// src/lib/middleware/auth.js
import { verifyToken } from '@/lib/jwt';

/**
 * Middleware to verify JWT and extract user info
 */
export function authenticate(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return { error: 'No token provided', status: 401 };
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return { error: 'Invalid or expired token', status: 401 };
  }
  
  // Attach user info to request
  req.user = decoded;
  return { user: decoded };
}

/**
 * Middleware to check if user has specific role
 */
export function requireRole(allowedRoles = []) {
  return (req, res) => {
    const authResult = authenticate(req, res);
    
    if (authResult.error) {
      return authResult;
    }
    
    const userRole = authResult.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return {
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        status: 403,
      };
    }
    
    req.user = authResult.user;
    return { user: authResult.user };
  };
}

/**
 * Middleware to check admin permissions
 */
export async function requirePermission(permission) {
  return async (req, res) => {
    const authResult = authenticate(req, res);
    
    if (authResult.error) {
      return authResult;
    }
    
    if (authResult.user.role !== 'admin') {
      return { error: 'Admin access required', status: 403 };
    }
    
    // Fetch admin from database to check permissions
    const Admin = (await import('@/models/Admin')).default;
    const admin = await Admin.findById(authResult.user.userId);
    
    if (!admin) {
      return { error: 'Admin not found', status: 404 };
    }
    
    if (!admin.hasPermission(permission)) {
      return { error: `Permission denied: ${permission}`, status: 403 };
    }
    
    req.user = authResult.user;
    req.admin = admin;
    return { user: authResult.user, admin };
  };
}
```

---

### Usage di API Route

#### Protected Creator Route

```javascript
// pages/api/creator/profile.js
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import { requireRole } from '@/lib/middleware/auth';

export default async function handler(req, res) {
  await dbConnect();

  // Check authentication & role
  const authCheck = requireRole(['creator'])(req, res);
  if (authCheck.error) {
    return res.status(authCheck.status).json({ error: authCheck.error });
  }

  const userId = req.user.userId;

  // GET - Fetch profile
  if (req.method === 'GET') {
    try {
      const creator = await Creator.findById(userId).select('-password');
      
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }

      res.status(200).json({ success: true, creator });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // PUT - Update profile
  else if (req.method === 'PUT') {
    try {
      const { displayName, bio, socialLinks, profileImage } = req.body;

      const creator = await Creator.findByIdAndUpdate(
        userId,
        { displayName, bio, socialLinks, profileImage },
        { new: true, runValidators: true }
      ).select('-password');

      res.status(200).json({ success: true, creator });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

---

#### Protected Admin Route with Permission

```javascript
// pages/api/admin/payouts.js
import dbConnect from '@/lib/db';
import Payout from '@/models/payout';
import { requirePermission } from '@/lib/middleware/auth';

export default async function handler(req, res) {
  await dbConnect();

  // GET - View payouts (requires VIEW_PAYOUTS permission)
  if (req.method === 'GET') {
    const authCheck = await requirePermission('VIEW_PAYOUTS')(req, res);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const payouts = await Payout.find({ status })
      .populate('creatorId', 'username displayName email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Payout.countDocuments({ status });

    res.status(200).json({
      success: true,
      payouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }

  // PUT - Approve/Reject payout (requires APPROVE_PAYOUTS permission)
  else if (req.method === 'PUT') {
    const authCheck = await requirePermission('APPROVE_PAYOUTS')(req, res);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    const { payoutId, action, reason } = req.body;

    const payout = await Payout.findById(payoutId);
    if (!payout) {
      return res.status(404).json({ error: 'Payout not found' });
    }

    if (action === 'approve') {
      await payout.approve(req.user.userId);
    } else if (action === 'reject') {
      await payout.reject(req.user.userId, reason);
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    res.status(200).json({ success: true, payout });
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

---

## 4.6 Frontend Route Guards

### Custom Hook untuk Auth

```javascript
// src/hooks/useAuth.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(requiredRole = null) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    // Check role if specified
    if (requiredRole && parsedUser.role !== requiredRole) {
      router.push('/unauthorized');
      return;
    }

    // Verify token with backend (optional)
    fetch('/api/auth/verify-token', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (!data.valid) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        } else {
          setUser(parsedUser);
          setLoading(false);
        }
      })
      .catch(() => {
        setUser(parsedUser);
        setLoading(false);
      });
  }, [router, requiredRole]);

  return { user, loading };
}
```

---

### Protected Page Component

```javascript
// src/app/creator/dashboard/page.js
'use client';
import { useAuth } from '@/hooks/useAuth';

export default function CreatorDashboard() {
  const { user, loading } = useAuth('creator');

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

---

## 4.7 OAuth Integration (Google)

### NextAuth.js Setup (Optional)

```javascript
// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      await dbConnect();

      // Check if creator exists
      let creator = await Creator.findOne({ email: user.email });

      if (!creator) {
        // Create new creator from Google profile
        const username = user.email.split('@')[0].toLowerCase();
        
        creator = new Creator({
          username,
          email: user.email,
          displayName: user.name,
          profileImage: user.image,
          password: 'OAUTH_NO_PASSWORD', // Placeholder
          isVerified: true,
          emailVerifiedAt: new Date(),
        });

        await creator.save();
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        await dbConnect();
        const creator = await Creator.findOne({ email: user.email });
        token.userId = creator._id;
        token.username = creator.username;
        token.role = 'creator';
      }
      return token;
    },

    async session({ session, token }) {
      session.user.userId = token.userId;
      session.user.username = token.username;
      session.user.role = token.role;
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },
});
```

---

## 4.8 Security Best Practices

### 1. Password Security

```javascript
// Strong password hashing
import bcrypt from 'bcryptjs';

// GOOD: Salt rounds = 10 (balanced security & performance)
const hashedPassword = await bcrypt.hash(password, 10);

// Compare password
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### 2. Token Storage

**Client-side options**:

| Method | Security | Pros | Cons |
|--------|----------|------|------|
| **localStorage** | ⚠️ Vulnerable to XSS | Simple, persistent | No httpOnly protection |
| **sessionStorage** | ⚠️ Vulnerable to XSS | Auto-clear on tab close | No httpOnly protection |
| **Cookie (httpOnly)** | ✅ Best | XSS protection | CSRF risk (mitigated) |
| **Memory (state)** | ✅ Secure | No persistence risk | Lost on refresh |

**Recommended**: HttpOnly cookie dengan CSRF protection

```javascript
// Set token as httpOnly cookie
res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`);
```

### 3. Token Expiry Strategy

```javascript
// Short-lived access token (1 hour)
const accessToken = signToken(payload, '1h');

// Long-lived refresh token (7 days)
const refreshToken = signToken({ userId }, '7d');

// Return both
res.json({ accessToken, refreshToken });
```

**Flow**:
1. Client uses `accessToken` for requests
2. When `accessToken` expires → use `refreshToken` to get new `accessToken`
3. If `refreshToken` expires → user must login again

### 4. Rate Limiting

```javascript
// Example: Simple in-memory rate limiter
const loginAttempts = new Map();

function checkRateLimit(identifier) {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || [];
  
  // Filter attempts in last 15 minutes
  const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000);
  
  if (recentAttempts.length >= 5) {
    return { allowed: false, retryAfter: 15 * 60 }; // 15 minutes
  }
  
  recentAttempts.push(now);
  loginAttempts.set(identifier, recentAttempts);
  
  return { allowed: true };
}

// Usage in login API
const rateLimit = checkRateLimit(email);
if (!rateLimit.allowed) {
  return res.status(429).json({ 
    error: 'Too many login attempts. Try again later.',
    retryAfter: rateLimit.retryAfter,
  });
}
```

### 5. Input Sanitization

```javascript
// Sanitize user input to prevent injection
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .substring(0, 1000); // Limit length
}

// Usage
const username = sanitizeInput(req.body.username);
```

### 6. HTTPS Only (Production)

```javascript
// next.config.mjs
export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
        ],
      },
    ];
  },
};
```

---

## 4.9 Logout & Session Management

### Logout Handler

```javascript
// Frontend logout
function logout() {
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Optionally call logout API (for token blacklist)
  fetch('/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  
  // Redirect to login
  router.push('/login');
}
```

### Token Blacklist (Advanced)

```javascript
// For production: Implement token blacklist in Redis
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Blacklist token on logout
export async function blacklistToken(token) {
  const decoded = decodeToken(token);
  const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
  
  await redis.setex(`blacklist:${token}`, expiresIn, '1');
}

// Check if token is blacklisted
export async function isTokenBlacklisted(token) {
  const result = await redis.get(`blacklist:${token}`);
  return result === '1';
}

// Usage in middleware
if (await isTokenBlacklisted(token)) {
  return res.status(401).json({ error: 'Token has been revoked' });
}
```

---

## 4.10 Latihan & Best Practices

### Latihan 1: Implementasi Password Reset

Buat flow untuk reset password:
1. User request reset (kirim email dengan token)
2. User click link, masukkan password baru
3. Verify token & update password

### Latihan 2: Email Verification

Buat flow untuk verify email saat registrasi:
1. Generate verification token
2. Kirim email dengan link
3. User click → mark `emailVerifiedAt`

### Latihan 3: Two-Factor Authentication (2FA)

Research & implementasi optional 2FA:
1. Generate TOTP secret
2. User scan QR code
3. Verify 6-digit code saat login

---

## ✅ Checklist Pemahaman

- [ ] Paham konsep JWT & struktur token
- [ ] Bisa implementasi registration & login
- [ ] Memahami middleware untuk protected routes
- [ ] Bisa implementasi RBAC dengan permissions
- [ ] Tahu best practices untuk password security
- [ ] Paham token storage options & trade-offs
- [ ] Bisa implementasi logout dengan token cleanup

---

## 📚 Referensi

- [JWT.io - Introduction to JWT](https://jwt.io/introduction)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [bcrypt - Best Practices](https://github.com/kelektiv/node.bcrypt.js#security-issues-and-concerns)

---

<div align="center">

**Navigasi**

[⬅️ Bab 3: Model Data](Bab-03-Model-Data.md) | [Bab 5: Donasi & Payout ➡️](Bab-05-Donasi-Payout.md)

</div>
