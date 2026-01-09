# LAMPIRAN A: REFERENSI API

<div align="center">

**📖 Complete API Endpoint Documentation**

*Quick reference untuk semua API routes di Nyumbangin*

</div>

---

## 📋 Table of Contents

1. [Authentication API](#authentication-api)
2. [Creator API](#creator-api)
3. [Donation API](#donation-api)
4. [Payout API](#payout-api)
5. [Admin API](#admin-api)
6. [Stats API](#stats-api)
7. [Webhook API](#webhook-api)
8. [Utility API](#utility-api)

---

## Base URL

**Development**: `http://localhost:3000`  
**Production**: `https://yourdomain.com`

---

## Error Response Format

Semua error menggunakan format standar:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

# AUTHENTICATION API

## 1. Register Creator

**Endpoint**: `POST /api/auth/register`

**Description**: Mendaftarkan creator baru

**Authentication**: None

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe",
  "bio": "Content creator passionate about tech"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Registration successful",
  "creator": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "johndoe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "bio": "Content creator passionate about tech",
    "isActive": true,
    "createdAt": "2026-01-08T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- `400`: Validation errors (username taken, invalid email, weak password)
- `500`: Server error

---

## 2. Login

**Endpoint**: `POST /api/auth/login`

**Description**: Login untuk creator atau admin

**Authentication**: None

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "john@example.com",
    "username": "johndoe",
    "displayName": "John Doe",
    "role": "creator"
  }
}
```

**Error Responses**:
- `400`: Missing email/password
- `401`: Invalid credentials
- `500`: Server error

---

## 3. Google OAuth

**Endpoint**: `GET /api/auth/[...nextauth]`

**Description**: NextAuth.js handler untuk Google OAuth

**Flow**:
1. Redirect ke `/api/auth/signin`
2. User selects Google
3. Authenticates with Google
4. Redirects back dengan session

**Session Object**:
```json
{
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://lh3.googleusercontent.com/...",
    "role": "creator"
  },
  "expires": "2026-02-08T10:00:00.000Z"
}
```

---

## 4. Verify Token

**Endpoint**: `GET /api/auth/verify`

**Description**: Verify JWT token validity

**Authentication**: Bearer token required

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200):
```json
{
  "success": true,
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "john@example.com",
    "role": "creator"
  }
}
```

**Error Responses**:
- `401`: Missing or invalid token

---

# CREATOR API

## 5. Get Creator Profile (Public)

**Endpoint**: `GET /api/creator/[username]`

**Description**: Get public creator profile

**Authentication**: None

**Example**: `GET /api/creator/johndoe`

**Response** (200):
```json
{
  "success": true,
  "creator": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "johndoe",
    "displayName": "John Doe",
    "bio": "Content creator passionate about tech",
    "profileImage": "https://...",
    "socialLinks": {
      "youtube": "https://youtube.com/@johndoe",
      "instagram": "https://instagram.com/johndoe",
      "twitter": "https://twitter.com/johndoe"
    },
    "totalDonations": 150000,
    "totalSupporters": 25,
    "isActive": true,
    "createdAt": "2026-01-01T10:00:00.000Z"
  }
}
```

**Error Responses**:
- `404`: Creator not found
- `403`: Creator suspended or inactive

---

## 6. Update Creator Profile

**Endpoint**: `PUT /api/creator/profile`

**Description**: Update own creator profile

**Authentication**: Bearer token (creator role)

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "displayName": "John Doe Updated",
  "bio": "New bio text",
  "profileImage": "https://example.com/image.jpg",
  "socialLinks": {
    "youtube": "https://youtube.com/@johndoe",
    "instagram": "https://instagram.com/johndoe"
  },
  "bankAccount": {
    "bankName": "BCA",
    "accountNumber": "1234567890",
    "accountName": "John Doe"
  }
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "creator": { /* updated creator object */ }
}
```

**Error Responses**:
- `401`: Unauthorized (invalid token)
- `400`: Validation errors
- `500`: Server error

---

## 7. Get Creator Dashboard Stats

**Endpoint**: `GET /api/creator/dashboard`

**Description**: Get creator's dashboard statistics

**Authentication**: Bearer token (creator role)

**Response** (200):
```json
{
  "success": true,
  "stats": {
    "totalEarned": 1500000,
    "availableBalance": 750000,
    "totalDonations": 50,
    "totalSupporters": 32,
    "recentDonations": [
      {
        "_id": "...",
        "supporterName": "Jane Doe",
        "amount": 50000,
        "message": "Great content!",
        "createdAt": "2026-01-08T09:00:00.000Z"
      }
    ],
    "monthlyChart": [
      { "month": "Dec", "amount": 500000 },
      { "month": "Jan", "amount": 1000000 }
    ]
  }
}
```

---

## 8. Get Creator Leaderboard

**Endpoint**: `GET /api/creator/leaderboard`

**Description**: Get top creators by total earnings

**Authentication**: None

**Query Parameters**:
- `limit` (optional): Number of creators (default: 10)

**Example**: `GET /api/creator/leaderboard?limit=5`

**Response** (200):
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "username": "topCreator",
      "displayName": "Top Creator",
      "profileImage": "https://...",
      "totalEarned": 5000000,
      "totalDonations": 200
    },
    {
      "rank": 2,
      "username": "secondPlace",
      "displayName": "Second Place",
      "profileImage": "https://...",
      "totalEarned": 3500000,
      "totalDonations": 150
    }
  ]
}
```

---

# DONATION API

## 9. Create Donation

**Endpoint**: `POST /api/donate/[username]`

**Description**: Initiate donation payment

**Authentication**: None

**Example**: `POST /api/donate/johndoe`

**Request Body**:
```json
{
  "amount": 50000,
  "supporterName": "Jane Doe",
  "supporterEmail": "jane@example.com",
  "message": "Keep up the great work!"
}
```

**Response** (201):
```json
{
  "success": true,
  "donation": {
    "_id": "65b1c2d3e4f5g6h7i8j9k0l1",
    "orderId": "TRX-1704710400000-ABC123",
    "creatorId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "amount": 50000,
    "supporterName": "Jane Doe",
    "supporterEmail": "jane@example.com",
    "message": "Keep up the great work!",
    "status": "PENDING",
    "createdAt": "2026-01-08T10:00:00.000Z"
  },
  "token": "abc123-snap-token",
  "paymentUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/abc123-snap-token"
}
```

**Error Responses**:
- `400`: Validation errors (amount < minimum, missing fields)
- `404`: Creator not found or inactive
- `500`: Midtrans API error

---

## 10. Get Donation by Order ID

**Endpoint**: `GET /api/donation/[orderId]`

**Description**: Get donation details

**Authentication**: None (public for supporter to check status)

**Example**: `GET /api/donation/TRX-1704710400000-ABC123`

**Response** (200):
```json
{
  "success": true,
  "donation": {
    "_id": "65b1c2d3e4f5g6h7i8j9k0l1",
    "orderId": "TRX-1704710400000-ABC123",
    "amount": 50000,
    "supporterName": "Jane Doe",
    "message": "Keep up the great work!",
    "status": "PAID",
    "paymentMethod": "gopay",
    "paidAt": "2026-01-08T10:05:00.000Z",
    "creatorId": {
      "username": "johndoe",
      "displayName": "John Doe"
    }
  }
}
```

**Error Responses**:
- `404`: Donation not found

---

## 11. Get Creator's Donations

**Endpoint**: `GET /api/donation/creator/[creatorId]`

**Description**: Get all donations for a creator (paginated)

**Authentication**: Bearer token (creator or admin)

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20)
- `status` (optional): Filter by status (PENDING, PAID, FAILED)

**Example**: `GET /api/donation/creator/65a1b2c3d4e5f6g7h8i9j0k1?page=1&limit=10&status=PAID`

**Response** (200):
```json
{
  "success": true,
  "donations": [
    {
      "_id": "...",
      "orderId": "TRX-...",
      "amount": 50000,
      "supporterName": "Jane Doe",
      "message": "Great content!",
      "status": "PAID",
      "paidAt": "2026-01-08T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalDonations": 50,
    "limit": 10
  }
}
```

---

# PAYOUT API

## 12. Request Payout

**Endpoint**: `POST /api/payout/request`

**Description**: Creator requests payout for available balance

**Authentication**: Bearer token (creator role)

**Request Body**:
```json
{
  "amount": 500000,
  "bankAccount": {
    "bankName": "BCA",
    "accountNumber": "1234567890",
    "accountName": "John Doe"
  },
  "note": "Monthly payout request"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Payout request submitted",
  "payout": {
    "_id": "65c1d2e3f4g5h6i7j8k9l0m1",
    "creatorId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "amount": 500000,
    "status": "PENDING",
    "bankAccount": {
      "bankName": "BCA",
      "accountNumber": "1234567890",
      "accountName": "John Doe"
    },
    "requestedAt": "2026-01-08T10:00:00.000Z"
  }
}
```

**Error Responses**:
- `400`: Insufficient balance, invalid amount
- `409`: Existing pending payout

---

## 13. Get Creator Payouts

**Endpoint**: `GET /api/payout/creator`

**Description**: Get payout history for logged-in creator

**Authentication**: Bearer token (creator role)

**Query Parameters**:
- `status` (optional): Filter by status

**Response** (200):
```json
{
  "success": true,
  "payouts": [
    {
      "_id": "...",
      "amount": 500000,
      "status": "APPROVED",
      "bankAccount": {
        "bankName": "BCA",
        "accountNumber": "****7890"
      },
      "requestedAt": "2026-01-08T10:00:00.000Z",
      "approvedAt": "2026-01-09T09:00:00.000Z",
      "approvedBy": {
        "name": "Admin User"
      }
    }
  ]
}
```

---

## 14. Admin: Get All Payouts

**Endpoint**: `GET /api/admin/payouts`

**Description**: Get all payout requests (admin only)

**Authentication**: Bearer token (admin role)

**Query Parameters**:
- `status` (optional): PENDING, APPROVED, PROCESSED, REJECTED
- `page` (default: 1)
- `limit` (default: 20)

**Response** (200):
```json
{
  "success": true,
  "payouts": [
    {
      "_id": "...",
      "creatorId": {
        "username": "johndoe",
        "displayName": "John Doe",
        "email": "john@example.com"
      },
      "amount": 500000,
      "status": "PENDING",
      "bankAccount": {
        "bankName": "BCA",
        "accountNumber": "1234567890",
        "accountName": "John Doe"
      },
      "requestedAt": "2026-01-08T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalPayouts": 30
  }
}
```

---

## 15. Admin: Approve Payout

**Endpoint**: `POST /api/admin/payouts/[payoutId]/approve`

**Description**: Approve payout request

**Authentication**: Bearer token (admin with payout_approve permission)

**Request Body**:
```json
{
  "note": "Approved, will be processed today"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Payout approved successfully",
  "payout": {
    "_id": "65c1d2e3f4g5h6i7j8k9l0m1",
    "status": "APPROVED",
    "approvedAt": "2026-01-09T09:00:00.000Z",
    "approvedBy": "65x9y8z7w6v5u4t3s2r1q0p9"
  }
}
```

---

## 16. Admin: Mark Payout Processed

**Endpoint**: `POST /api/admin/payouts/[payoutId]/process`

**Description**: Mark payout as processed (money transferred)

**Authentication**: Bearer token (admin with payout_process permission)

**Request Body**:
```json
{
  "transactionReference": "TF-20260109-001",
  "note": "Transferred via internet banking"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Payout marked as processed",
  "payout": {
    "_id": "65c1d2e3f4g5h6i7j8k9l0m1",
    "status": "PROCESSED",
    "processedAt": "2026-01-09T10:00:00.000Z",
    "processedBy": "65x9y8z7w6v5u4t3s2r1q0p9",
    "transactionReference": "TF-20260109-001"
  }
}
```

---

## 17. Admin: Reject Payout

**Endpoint**: `POST /api/admin/payouts/[payoutId]/reject`

**Description**: Reject payout request

**Authentication**: Bearer token (admin with payout_approve permission)

**Request Body**:
```json
{
  "reason": "Bank account details incorrect"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Payout rejected",
  "payout": {
    "_id": "65c1d2e3f4g5h6i7j8k9l0m1",
    "status": "REJECTED",
    "rejectedAt": "2026-01-09T09:00:00.000Z",
    "rejectedBy": "65x9y8z7w6v5u4t3s2r1q0p9",
    "rejectionReason": "Bank account details incorrect"
  }
}
```

---

# ADMIN API

## 18. Get Admin Dashboard Stats

**Endpoint**: `GET /api/admin/stats`

**Description**: Get platform-wide statistics

**Authentication**: Bearer token (admin role)

**Response** (200):
```json
{
  "success": true,
  "stats": {
    "totalCreators": 150,
    "activeCreators": 120,
    "totalDonations": 50000000,
    "totalPayouts": 30000000,
    "pendingPayouts": 5000000,
    "recentActivity": [
      {
        "type": "donation",
        "message": "Jane Doe donated Rp50,000 to John Doe",
        "timestamp": "2026-01-08T10:00:00.000Z"
      }
    ]
  }
}
```

---

## 19. Get All Creators (Admin)

**Endpoint**: `GET /api/admin/creators`

**Description**: Get list of all creators with filters

**Authentication**: Bearer token (admin role)

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20)
- `search` (optional): Search by username/email
- `status` (optional): active, suspended, inactive

**Response** (200):
```json
{
  "success": true,
  "creators": [
    {
      "_id": "...",
      "username": "johndoe",
      "displayName": "John Doe",
      "email": "john@example.com",
      "totalEarned": 1500000,
      "isActive": true,
      "isSuspended": false,
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 8,
    "totalCreators": 150
  }
}
```

---

## 20. Suspend/Unsuspend Creator

**Endpoint**: `POST /api/admin/creators/[creatorId]/suspend`

**Description**: Suspend or unsuspend creator account

**Authentication**: Bearer token (admin with user_manage permission)

**Request Body**:
```json
{
  "suspend": true,
  "reason": "Violated terms of service"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Creator suspended successfully",
  "creator": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "isSuspended": true,
    "suspendedAt": "2026-01-09T10:00:00.000Z",
    "suspensionReason": "Violated terms of service"
  }
}
```

---

# STATS API

## 21. Public Platform Stats

**Endpoint**: `GET /api/stats`

**Description**: Get public platform statistics

**Authentication**: None

**Response** (200):
```json
{
  "success": true,
  "stats": {
    "totalCreators": 150,
    "totalDonations": 50000000,
    "totalSupporters": 5000,
    "recentDonations": [
      {
        "creatorUsername": "johndoe",
        "creatorDisplayName": "John Doe",
        "supporterName": "Jane Doe",
        "amount": 50000,
        "timestamp": "2026-01-08T10:00:00.000Z"
      }
    ]
  }
}
```

---

# WEBHOOK API

## 22. Midtrans Payment Notification

**Endpoint**: `POST /api/webhook/midtrans`

**Description**: Receive payment notifications from Midtrans

**Authentication**: Signature verification (not Bearer token)

**Headers** (from Midtrans):
```
Content-Type: application/json
```

**Request Body** (from Midtrans):
```json
{
  "transaction_time": "2026-01-08 10:05:00",
  "transaction_status": "settlement",
  "transaction_id": "mid-123456",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "abc123...",
  "settlement_time": "2026-01-08 10:05:00",
  "payment_type": "gopay",
  "order_id": "TRX-1704710400000-ABC123",
  "merchant_id": "G123456789",
  "gross_amount": "50000.00",
  "fraud_status": "accept",
  "currency": "IDR"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Notification processed"
}
```

**Internal Process**:
1. Verify signature
2. Find donation by orderId
3. Update status based on transaction_status
4. Send email notification
5. Update creator stats

---

# UTILITY API

## 23. Health Check

**Endpoint**: `GET /api/health`

**Description**: Check API health status

**Authentication**: None

**Response** (200):
```json
{
  "status": "ok",
  "timestamp": "2026-01-08T10:00:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## 24. Check Payment Status

**Endpoint**: `GET /api/check-payment-status?order_id=TRX-...`

**Description**: Manually check payment status from Midtrans

**Authentication**: None

**Query Parameters**:
- `order_id` (required)

**Response** (200):
```json
{
  "success": true,
  "status": "settlement",
  "donation": {
    "orderId": "TRX-1704710400000-ABC123",
    "amount": 50000,
    "status": "PAID",
    "paidAt": "2026-01-08T10:05:00.000Z"
  }
}
```

---

## 25. Contact Form

**Endpoint**: `POST /api/contact`

**Description**: Submit contact form (send email to admin)

**Authentication**: None

**Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Question about platform",
  "message": "How do I become a creator?"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

---

## HTTP Status Code Summary

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET/PUT/DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation errors, missing fields |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 405 | Method Not Allowed | Wrong HTTP method |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 500 | Internal Server Error | Server/database errors |

---

## Rate Limiting

**Development**: No limits  
**Production**: 
- Authentication endpoints: 5 requests/minute
- Donation endpoints: 10 requests/minute
- Other endpoints: 60 requests/minute

**Rate Limit Headers**:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704710460
```

---

## Authentication Header Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Expiry**: 7 days (configurable)

---

## Pagination Format

For paginated endpoints:

**Query Parameters**:
```
?page=2&limit=20
```

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 2,
    "totalPages": 10,
    "totalItems": 200,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

---

## Testing API with cURL

### Example: Create Donation

```bash
curl -X POST https://localhost:3000/api/donate/johndoe \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "supporterName": "Jane Doe",
    "supporterEmail": "jane@example.com",
    "message": "Great content!"
  }'
```

### Example: Get Creator Profile (with auth)

```bash
curl -X GET https://localhost:3000/api/creator/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

<div align="center">

**Navigasi**

[⬅️ Bab 6: Deploy & Testing](Bab-06-Deploy-Test-Troubleshoot.md) | [Lampiran B: Environment Variables ➡️](Lampiran-B-Environment-Variables.md)

</div>
