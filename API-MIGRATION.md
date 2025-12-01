# API Migration Progress

**Status**: 🟡 In Progress (3/25 endpoints migrated)

## Migration Strategy
- ✅ Create new App Router endpoints in `src/app/api/`
- ✅ Keep old Pages Router endpoints active during migration
- ✅ Test new endpoints thoroughly
- ⏳ Update frontend to use new endpoints
- ⏳ Remove old `pages/api/` when all verified

## Completed ✅

### Auth Endpoints (3/4)
- [x] `POST /api/auth/login` → `src/app/api/auth/login/route.js`
- [x] `POST /api/auth/register` → `src/app/api/auth/register/route.js`
- [x] `POST /api/auth/check-username` → `src/app/api/auth/check-username/route.js`
- [ ] `POST /api/auth/oauth-token` → Pending

## In Progress ⏳

### User Endpoints (0/4)
- [ ] `GET/PUT /api/user/profile`
- [ ] `PUT /api/user/password`
- [ ] `POST /api/user/upload-image`
- [ ] `GET /api/user/profile-image/[id]`

### Creator Endpoints (0/3)
- [ ] `GET /api/creator/payouts`
- [ ] `POST /api/creator/request-payout`
- [ ] `GET /api/creator/weekly-payout`

### Public Creators (0/2)
- [ ] `GET /api/creators` (list)
- [ ] `POST /api/creators/[username]/donate`

### Dashboard (0/3)
- [ ] `GET /api/dashboard/donations`
- [ ] `GET /api/dashboard/donations/[id]`
- [ ] `GET /api/dashboard/leaderboard`

### Admin Endpoints (0/4)
- [ ] `GET/POST /api/admin/creators`
- [ ] `GET/PUT/DELETE /api/admin/creators/[id]`
- [ ] `GET /api/admin/donations`
- [ ] `GET/PUT /api/admin/payouts`

### Overlay Endpoints (0/5)
**Need Restructure**: Merge `overlay` + `overlay-config`
- [ ] `GET /api/overlay/[username]/donations`
- [ ] `GET /api/overlay/[username]/leaderboard`
- [ ] `GET/PUT /api/overlay/[username]/config`
- [ ] `GET /api/overlay/[username]/config/leaderboard`
- [ ] `GET /api/overlay/[username]/config/notifications`

### Other Endpoints (0/4)
- [ ] `POST /api/webhook/midtrans`
- [ ] `POST /api/mediashare/[username]`
- [ ] `POST /api/cron/archive-donations`
- [ ] `POST /api/cron/update-leaderboard`
- [ ] `GET /api/check-payment-status`
- [ ] `GET /api/stats`

## Testing Checklist
- [ ] Test login flow
- [ ] Test register flow
- [ ] Test username availability check
- [ ] Verify JWT token generation
- [ ] Check error handling
- [ ] Test with Postman/Thunder Client

## Notes
- OAuth token endpoint belum di-migrate (perlu review dulu)
- Overlay endpoints perlu restructure besar
- Admin fix-permissions.js mungkin bisa dihapus (dev tool)
