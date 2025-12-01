# Strategi Meningkatkan Coverage - Nyumbangin

## 📈 Hasil Peningkatan Coverage

### Before (Coverage Awal)
- **Statements**: 2.51% (51/2031)
- **Branches**: 3.67% (43/1169)
- **Functions**: 3.66% (8/218)
- **Lines**: 2.32% (45/1933)
- **Test Suites**: 6 suites, 70 tests

### After (Setelah Menambahkan Component Tests)
- **Statements**: ~5.41% (**+115% peningkatan!**)
- **Test Suites**: 13 suites, **121 tests** (+51 tests baru)

## ✅ Strategi yang Berhasil

### 1. **Focus pada UI Components** (Paling Efektif!)

**Kenapa Components?**
- ✅ Tidak perlu database
- ✅ Tidak ada masalah BSON/Mongoose
- ✅ Mudah di-test dengan React Testing Library
- ✅ Coverage langsung meningkat signifikan

**Components yang Ditambahkan:**

#### Organisms (3 komponen = 30 lines covered)
- ✅ **Header.test.js** - 9 tests
  - Test user display, buttons, navigation
  - Router mocking untuk navigation
  
- ✅ **StatsSection.test.js** - 8 tests
  - Test stats display, callbacks
  - Mock formatRupiah utility
  
- ✅ **DonationTable.test.js** - 15 tests
  - Test table rendering, delete, preview
  - Event handling dengan stopPropagation

#### Molecules (2 komponen = 13 lines covered)
- ✅ **DonationCard.test.js** - 6 tests
  - Test donation display, delete action
  
- ✅ **SectionBox.test.js** - 8 tests
  - Test tones (default, danger, success)
  - Title, description rendering

#### Atoms (2 komponen = 12 lines covered)
- ✅ **Badge.test.js** - 11 tests
  - Test variants (default, success, warning, danger, info)
  - Test sizes (small, medium, large)
  
- ✅ **StatusBadge.test.js** - 8 tests
  - Test status styles (PAID, UNPAID, PENDING, FAILED)
  - Custom children handling

**Total Komponen Baru**: 7 test files
**Total Test Cases Baru**: 65 tests
**Coverage Increase**: ~3% (dari komponen saja)

---

## 🎯 Strategi Berikutnya untuk 20-30% Coverage

### Priority 1: Test Organism Components Lainnya (~15% tambahan)

**Target Files** (164 lines total):
```javascript
src/components/organisms/
├── AdminDashboard.js     (30 lines) - ⏳ TODO
├── CreatorSection.js     (11 lines) - ⏳ TODO
├── ProfileModal.js       (63 lines) - ⏳ TODO
├── PayoutSection.js      (5 lines)  - ⏳ TODO
├── HistoryModal.js       (10 lines) - ⏳ TODO
├── LeaderboardModal.js   (8 lines)  - ⏳ TODO
├── AdminSidebar.js       (4 lines)  - ⏳ TODO
├── CreatorDetailModal.js (5 lines)  - ⏳ TODO
└── PayoutNotesModal.js   (2 lines)  - ⏳ TODO
```

**Estimasi**: 50-60 test cases → **+7-8% coverage**

### Priority 2: Test Molecule Components (~5% tambahan)

**Target Files** (47 lines total):
```javascript
src/components/molecules/
├── ImageCropModal.js      (43 lines) - Complex, skip untuk sekarang
├── NotificationToast.js   (4 lines)  - ⏳ TODO
└── PayoutFields.js        (9 lines)  - ⏳ TODO
```

**Estimasi**: 10-15 test cases → **+2-3% coverage**

### Priority 3: Test Remaining Atoms (~2% tambahan)

**Target Files** (5 lines total):
```javascript
src/components/atoms/
└── Modal.js (5 lines) - ⏳ TODO
```

**Estimasi**: 5-7 test cases → **+1% coverage**

---

## ❌ Yang TIDAK Perlu Di-Test (Sekarang)

### 1. API Routes - SKIP
**Alasan**: BSON/Mongoose ESM compatibility issues
**Alternative**: Integration testing dengan supertest atau Vitest

### 2. Hooks yang Depend pada API - SKIP  
**Files**: useAdminAuth, useAdminData, useProfileForm
**Alasan**: Perlu mock API yang kompleks
**Alternative**: Test setelah components selesai

### 3. Page Components - LOW PRIORITY
**Alasan**: Next.js routing kompleks, perlu mock banyak

---

## 🚀 Action Plan untuk 25-30% Coverage

### Week 1: Organisms
1. Test AdminDashboard (30 lines)
2. Test ProfileModal (63 lines)
3. Test CreatorSection (11 lines)
4. Test PayoutSection (5 lines)

**Target**: +10% coverage

### Week 2: Molecules & Remaining Atoms
1. Test NotificationToast (4 lines)
2. Test PayoutFields (9 lines)
3. Test Modal (5 lines)
4. Test HistoryModal & LeaderboardModal (18 lines)

**Target**: +5% coverage

### Week 3: Optimization
1. Increase test quality (edge cases)
2. Add integration tests untuk critical flows
3. Document testing patterns

**Target**: +5% coverage

---

## 📊 Coverage Target Realistis

| Target | Coverage | Test Suites | Test Cases | Effort |
|--------|----------|-------------|------------|--------|
| ✅ Current | 5.41% | 13 | 121 | Completed |
| 🎯 Phase 1 | 15% | 20 | 200+ | 1-2 weeks |
| 🎯 Phase 2 | 25% | 25 | 300+ | 3-4 weeks |
| 🎯 Phase 3 | 35% | 30 | 400+ | 1-2 months |
| ⭐ Ideal | 50%+ | 40+ | 600+ | 2-3 months |

---

## 💡 Best Practices yang Diterapkan

### 1. Mocking Strategy
```javascript
// Mock external dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock utilities
jest.mock('@/utils/format', () => ({
  formatRupiah: jest.fn((v) => `Rp ${v.toLocaleString()}`)
}));
```

### 2. Test Organization
```
__tests__/
├── components/
│   ├── atoms/      → Badge, StatusBadge, Button, Input
│   ├── molecules/  → DonationCard, FormField, SectionBox
│   └── organisms/  → Header, StatsSection, DonationTable
├── lib/           → jwt.test.js
└── utils/         → format.test.js
```

### 3. Test Patterns
- **Rendering Tests**: Component muncul dengan benar
- **Prop Tests**: Props di-pass dengan benar
- **Event Tests**: onClick, onChange callbacks
- **Edge Cases**: null, undefined, empty arrays
- **Style Tests**: CSS classes applied correctly

### 4. Coverage Focus
- ✅ **UI Components**: High ROI, easy to test
- ⚠️ **Business Logic**: Medium ROI, perlu mock
- ❌ **API Routes**: Low ROI dengan Jest, gunakan tools lain

---

## 🔧 Tools & Commands

```bash
# Run all tests
npm test

# Run dengan coverage
npm run test:coverage

# Run specific test file
npm test Header.test.js

# Run tests in watch mode
npm run test:watch

# View coverage report
# Open: coverage/lcov-report/index.html
```

---

## 📝 Lessons Learned

1. **Component testing lebih efektif** daripada API testing untuk Jest
2. **Organisms memberikan coverage terbesar** untuk effort yang sama
3. **Mock early, mock often** - setup mocks di jest.setup.js
4. **Test edge cases** - null, undefined, empty sangat penting
5. **BSON/Mongoose tidak compatible** dengan Jest - pakai Vitest atau integration testing

---

## 🎓 Next Steps

### Immediate (This Week)
1. ✅ Test remaining organisms (AdminDashboard, ProfileModal)
2. ✅ Test molecules (NotificationToast, PayoutFields)
3. ✅ Reach 15-20% coverage

### Short Term (This Month)
1. Consider migrating to Vitest for better ESM support
2. Add integration tests untuk critical API routes
3. Setup CI/CD dengan coverage reporting

### Long Term (Next Quarter)
1. 50%+ coverage target
2. E2E testing dengan Playwright/Cypress
3. Performance testing
4. Visual regression testing

---

**Last Updated**: December 2025
**Current Coverage**: 5.41%
**Target Coverage**: 25-30% (achievable dalam 3-4 minggu)
