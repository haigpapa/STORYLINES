# Implementation Plan - Literary Explorer Fixes

**Created**: November 9, 2025
**Status**: In Progress
**Timeline**: 2-3 weeks

---

## 🎯 Overview

This document tracks the systematic implementation of all fixes and enhancements identified in ANALYSIS.md.

---

## ✅ Phase 1A: Critical Fixes - File Structure (Day 1)

### 1.1 Fix Empty Component Files
**Priority**: HIGH | **Effort**: LOW | **Status**: 🔄 In Progress

Empty files to address:
- [x] `.env.example` - Created ✅
- [ ] `LeftToolbar.jsx` - Remove or implement
- [ ] `RightToolbar.jsx` - Remove or implement
- [ ] `PhotoNode.jsx` - Remove or implement
- [ ] `PhotoViz.jsx` - Remove or implement
- [ ] `SidePanels.jsx` - Remove or implement
- [ ] `Sidebar.jsx` - Remove or implement
- [ ] `TopBar.jsx` - Remove or implement

**Decision**: Remove unused files for now, can be added back when needed.

---

## ✅ Phase 1B: Error Handling (Day 1-2)

### 1.2 Add React Error Boundaries
**Priority**: CRITICAL | **Effort**: MEDIUM | **Status**: ⏳ Pending

**Files to create**:
- [ ] `ErrorBoundary.jsx` - Main error boundary component
- [ ] `ErrorFallback.jsx` - Fallback UI component

**Implementation**:
```jsx
// ErrorBoundary.jsx - Wrap entire app
// GraphErrorBoundary.jsx - Wrap 3D graph
// APIErrorBoundary.jsx - Wrap API-dependent components
```

### 1.3 Add Input Validation
**Priority**: CRITICAL | **Effort**: LOW | **Status**: ⏳ Pending

**Files to modify**:
- [ ] `actions.js` - Add validation to `sendQuery()`
- [ ] `utils/validation.js` - Create validation helpers

**What to validate**:
- Search query length (1-500 chars)
- No malicious patterns
- Sanitize HTML/script tags

### 1.4 Improve Error Handling
**Priority**: HIGH | **Effort**: MEDIUM | **Status**: ⏳ Pending

**Files to modify**:
- [ ] `actions.js` - Add try-catch to all async functions
- [ ] `libraryApi.js` - Add retry logic for Open Library
- [ ] `llm.js` - Enhance error messages

---

## ✅ Phase 1C: User Experience (Day 2-3)

### 1.5 Add Loading States
**Priority**: HIGH | **Effort**: MEDIUM | **Status**: ⏳ Pending

**Files to create**:
- [ ] `LoadingSkeleton.jsx` - Skeleton screens
- [ ] `ProgressIndicator.jsx` - Better progress UI

**Files to modify**:
- [ ] `App.jsx` - Replace spinner with skeleton
- [ ] `GraphViz.jsx` - Add loading state for graph
- [ ] `BookGridViz.jsx` - Add loading state for grid

### 1.6 Add Toast Notifications
**Priority**: MEDIUM | **Effort**: LOW | **Status**: ⏳ Pending

**Files to create**:
- [ ] `Toast.jsx` - Toast notification component
- [ ] `useToast.js` - Toast hook

**Integration**:
- Success messages (search complete, node expanded)
- Error messages (API failures, network errors)
- Info messages (features, tips)

---

## ✅ Phase 2A: Performance (Day 3-4)

### 2.1 API Response Caching
**Priority**: HIGH | **Effort**: MEDIUM | **Status**: ⏳ Pending

**Files to create**:
- [ ] `utils/cache.js` - LRU cache implementation

**Files to modify**:
- [ ] `libraryApi.js` - Add caching layer
- [ ] `llm.js` - Cache similar queries

**Implementation**:
```javascript
// LRU cache with 100 entries, 1 hour TTL
const cache = new LRUCache({ max: 100, ttl: 3600000 });
```

### 2.2 Client-Side Rate Limiting
**Priority**: HIGH | **Effort**: LOW | **Status**: ⏳ Pending

**Files to create**:
- [ ] `utils/rateLimiter.js` - Rate limiter utility

**Files to modify**:
- [ ] `actions.js` - Add rate limiting to search

**Implementation**:
```javascript
// Max 10 searches per minute
const rateLimiter = new RateLimiter({ max: 10, window: 60000 });
```

### 2.3 Request Deduplication
**Priority**: MEDIUM | **Effort**: LOW | **Status**: ⏳ Pending

**Files to create**:
- [ ] `utils/deduplicator.js` - Deduplication helper

**Use case**: Prevent duplicate API calls for same query

---

## ✅ Phase 2B: Code Quality (Day 4-5)

### 2.4 TypeScript Type Definitions
**Priority**: HIGH | **Effort**: HIGH | **Status**: ⏳ Pending

**Files to create**:
- [ ] `types/index.ts` - Central type definitions
- [ ] `types/node.ts` - Node interfaces
- [ ] `types/edge.ts` - Edge interfaces
- [ ] `types/api.ts` - API response types

**Interfaces to define**:
```typescript
interface Node {
  id: string;
  label: string;
  type: 'book' | 'author' | 'theme';
  description: string;
  publicationYear?: number;
  // ... etc
}
```

### 2.5 Convert Store to TypeScript
**Priority**: HIGH | **Effort**: MEDIUM | **Status**: ⏳ Pending

**Files to convert**:
- [ ] `store.js` → `store.ts`

**Add**:
- Type-safe state interface
- Type-safe actions
- Type-safe selectors

### 2.6 Add PropTypes to Components
**Priority**: MEDIUM | **Effort**: MEDIUM | **Status**: ⏳ Pending

**Files to modify**:
- [ ] `LiteraryNode.jsx` - Add PropTypes
- [ ] `GraphViz.jsx` - Add PropTypes
- [ ] `BookGridViz.jsx` - Add PropTypes
- [ ] `SidePanel.jsx` - Add PropTypes
- [ ] `TopLeftToolbar.jsx` - Add PropTypes

**Or**: Convert to TypeScript (.tsx) instead

---

## ✅ Phase 3: Testing (Day 5-7)

### 3.1 Setup Testing Framework
**Priority**: HIGH | **Effort**: MEDIUM | **Status**: ⏳ Pending

**Dependencies to add**:
```json
{
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "@testing-library/user-event": "^14.0.0"
}
```

**Files to create**:
- [ ] `vitest.config.ts` - Test configuration
- [ ] `setupTests.ts` - Test setup

### 3.2 Unit Tests for Utilities
**Priority**: HIGH | **Effort**: MEDIUM | **Status**: ⏳ Pending

**Files to create**:
- [ ] `actions.test.js` - Test parseLlmJson, etc.
- [ ] `libraryApi.test.js` - Test API functions
- [ ] `utils/cache.test.js` - Test caching
- [ ] `utils/validation.test.js` - Test validation

**Coverage goal**: 80%+ for utility functions

### 3.3 Component Tests
**Priority**: MEDIUM | **Effort**: HIGH | **Status**: ⏳ Pending

**Files to create**:
- [ ] `App.test.jsx` - Test main app
- [ ] `LiteraryNode.test.jsx` - Test node rendering
- [ ] `SidePanel.test.jsx` - Test panel logic

**Coverage goal**: 60%+ for components

### 3.4 E2E Tests
**Priority**: LOW | **Effort**: HIGH | **Status**: ⏳ Pending

**Tool**: Playwright

**Test scenarios**:
- [ ] Search for a book
- [ ] Expand a node
- [ ] Find connection between nodes
- [ ] Switch visualization modes
- [ ] Filter by timeline

---

## ✅ Phase 4: Security (Day 7-8)

### 4.1 Backend Proxy (Future)
**Priority**: CRITICAL | **Effort**: HIGH | **Status**: ⏳ Planned

**Note**: Requires backend infrastructure
**Options**:
1. Cloudflare Workers
2. Vercel Serverless Functions
3. Express backend

**For now**: Add warnings and usage limits

### 4.2 Input Sanitization
**Priority**: CRITICAL | **Effort**: LOW | **Status**: ⏳ Pending

**Files to create**:
- [ ] `utils/sanitize.js` - Input sanitization

**Implementation**:
```javascript
import DOMPurify from 'dompurify';

export const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};
```

### 4.3 CSP Headers (Production)
**Priority**: MEDIUM | **Effort**: LOW | **Status**: ⏳ Pending

**Files to create**:
- [ ] `public/_headers` - For Netlify/Vercel

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;
```

---

## ✅ Phase 5: Additional Features (Day 8-10)

### 5.1 Keyboard Shortcuts
**Priority**: MEDIUM | **Effort**: LOW | **Status**: ⏳ Pending

**Files to create**:
- [ ] `useKeyboardShortcuts.js` - Hook for shortcuts
- [ ] `ShortcutsModal.jsx` - Help modal

**Shortcuts to implement**:
- `Ctrl/Cmd + K` - Focus search
- `Escape` - Clear selection
- `Space` - Reset camera
- `Ctrl/Cmd + /` - Show shortcuts

### 5.2 Local Storage Persistence
**Priority**: MEDIUM | **Effort**: LOW | **Status**: ⏳ Pending

**Files to modify**:
- [ ] `store.js` - Add persist middleware

```javascript
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    immer((set) => ({ /* state */ })),
    { name: 'literary-explorer' }
  )
);
```

### 5.3 Export Functionality
**Priority**: MEDIUM | **Effort**: MEDIUM | **Status**: ⏳ Pending

**Files to create**:
- [ ] `utils/export.js` - Export utilities
- [ ] `ExportButton.jsx` - Export UI

**Export formats**:
- PNG (screenshot)
- JSON (graph data)
- SVG (vector)

---

## ✅ Phase 6: CI/CD (Day 10)

### 6.1 GitHub Actions
**Priority**: HIGH | **Effort**: LOW | **Status**: ⏳ Pending

**Files to create**:
- [ ] `.github/workflows/test.yml` - Run tests on PR
- [ ] `.github/workflows/deploy.yml` - Deploy on merge

**Pipeline**:
1. Install dependencies
2. Run linter
3. Run tests
4. Build
5. Deploy (if main branch)

### 6.2 Pre-commit Hooks
**Priority**: MEDIUM | **Effort**: LOW | **Status**: ⏳ Pending

**Files to create**:
- [ ] `.husky/pre-commit` - Run tests before commit

**Dependencies**:
```json
{
  "husky": "^8.0.0",
  "lint-staged": "^15.0.0"
}
```

---

## 📊 Progress Tracking

### Overall Progress: 1/60 tasks complete (2%)

| Phase | Tasks | Complete | Progress |
|-------|-------|----------|----------|
| 1A: File Structure | 8 | 1 | 12% |
| 1B: Error Handling | 3 | 0 | 0% |
| 1C: User Experience | 2 | 0 | 0% |
| 2A: Performance | 3 | 0 | 0% |
| 2B: Code Quality | 3 | 0 | 0% |
| 3: Testing | 4 | 0 | 0% |
| 4: Security | 3 | 0 | 0% |
| 5: Features | 3 | 0 | 0% |
| 6: CI/CD | 2 | 0 | 0% |

---

## 🎯 Success Criteria

**Phase 1 Complete When**:
- [ ] All empty files removed/implemented
- [ ] Error boundaries in place
- [ ] Input validation added
- [ ] Loading states everywhere
- [ ] No console errors on happy path

**Phase 2 Complete When**:
- [ ] API caching working
- [ ] Rate limiting active
- [ ] All TypeScript interfaces defined
- [ ] Store is type-safe

**Phase 3 Complete When**:
- [ ] 80%+ test coverage for utils
- [ ] 60%+ test coverage for components
- [ ] E2E tests for critical flows

**Full Project Complete When**:
- [ ] All phases complete
- [ ] Documentation updated
- [ ] CI/CD pipeline running
- [ ] Security audit passed
- [ ] Performance benchmarks met

---

## 📝 Notes

- **Dependencies to add**: Will track as we go
- **Breaking changes**: Will document in CHANGELOG.md
- **Migration guide**: Will create if needed for users

---

## 🚀 Next Steps

1. ✅ Create implementation plan (this document)
2. 🔄 Start with Phase 1A - Fix empty files
3. ⏳ Continue with error handling
4. ⏳ Add testing framework
5. ⏳ Implement remaining phases

**Current Focus**: Phase 1A - File Structure Cleanup
**Timeline**: Complete by end of Day 1
