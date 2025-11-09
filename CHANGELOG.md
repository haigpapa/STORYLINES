# Changelog

All notable changes to the Literary Explorer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Error Handling**
  - `ErrorBoundary.jsx` - React Error Boundary component for graceful error recovery
  - Comprehensive error handling in `actions.js` with descriptive error messages
  - Better error messages for API quota, network issues, and general failures

- **Input Validation & Security**
  - `utils/validation.js` - Input validation and sanitization utilities
  - Query validation with length limits (1-500 characters)
  - Protection against XSS attacks (script tags, javascript: protocol, etc.)
  - Node ID validation with strict format checking
  - Year validation for timeline filtering

- **Performance Optimizations**
  - `utils/cache.js` - LRU cache implementation for API responses
  - API response caching with 1-hour TTL for Open Library calls
  - 2-hour caching for LLM responses
  - 24-hour caching for images
  - Increased API call interval from 100ms to 200ms for better reliability
  - Network error retry logic in `libraryApi.js`

- **Rate Limiting**
  - `utils/rateLimiter.js` - Client-side rate limiting to prevent API abuse
  - 10 searches per minute limit
  - 20 node expansions per minute limit
  - User-friendly retry messages with countdown

- **Testing Infrastructure**
  - `vitest.config.ts` - Vitest configuration for unit tests
  - `setupTests.ts` - Test environment setup
  - Comprehensive unit tests for validation, cache, and rate limiter
  - Test scripts in package.json: `test`, `test:watch`, `test:coverage`
  - Added testing dependencies: vitest, @testing-library/react, jsdom

- **CI/CD Pipeline**
  - `.github/workflows/ci.yml` - GitHub Actions workflow
  - Automated testing on push and pull requests
  - Multi-version Node.js testing (18.x, 20.x)
  - Type checking with TypeScript
  - Build verification
  - Artifact uploads for production builds

- **TypeScript Support**
  - `types/index.ts` - Comprehensive TypeScript type definitions
  - Interfaces for Node, Edge, Journey, BookData, AppState, etc.
  - Type-safe validation results and API responses
  - Better IDE autocomplete and type safety

- **Documentation**
  - `README.md` - Comprehensive project documentation
  - `ANALYSIS.md` - Detailed technical analysis and recommendations
  - `IMPLEMENTATION_PLAN.md` - Systematic implementation tracking
  - `.env.example` - Environment configuration template
  - This `CHANGELOG.md`

### Changed
- **Error Handling Improvements**
  - `sendQuery()` now validates and sanitizes all user input
  - `expandNode()` validates node IDs and checks rate limits
  - All async functions have improved try-catch blocks
  - Better error categorization (quota vs network vs general errors)

- **API Integration**
  - `fetchOpenLibrary()` now uses caching and has retry logic
  - API throttling interval increased from 100ms to 200ms
  - Network errors trigger automatic retry with 1-second delay

- **Application Bootstrap**
  - `index.tsx` now wraps app in ErrorBoundary
  - Added import for index.css

- **Styling**
  - Added error boundary fallback UI styles to `index.css`
  - Error display with icon, message, details, and action buttons
  - Dark theme consistent with app design

### Removed
- **Empty Component Files** (7 files)
  - `LeftToolbar.jsx` - Not implemented, no imports
  - `RightToolbar.jsx` - Not implemented, no imports
  - `PhotoNode.jsx` - Not implemented, no imports
  - `PhotoViz.jsx` - Not implemented, no imports
  - `SidePanels.jsx` - Not implemented, no imports
  - `Sidebar.jsx` - Not implemented, no imports
  - `TopBar.jsx` - Not implemented, no imports

### Fixed
- Missing environment configuration template
- No input validation leading to potential XSS vulnerabilities
- No error boundaries causing poor error recovery
- No API response caching causing slow repeated queries
- No rate limiting allowing API abuse
- Missing development dependencies for testing

### Security
- Input sanitization prevents XSS attacks
- Query validation prevents malicious patterns
- Rate limiting prevents API quota exhaustion
- Error messages don't expose sensitive information

---

## [0.0.0] - 2025-11-09

### Initial Release
- Interactive 3D graph visualization
- AI-powered search with Google Gemini
- Open Library API integration
- Dual visualization modes (Graph and Book Grid)
- Journey-based exploration
- Timeline filtering
- Connection finding between nodes
- Node expansion on click
- Theme extraction
- Book recommendations

---

## Implementation Progress

### Phase 1A: File Structure ✅
- [x] Create .env.example
- [x] Remove unused empty files

### Phase 1B: Error Handling ✅
- [x] Add React Error Boundaries
- [x] Add input validation
- [x] Improve error handling in all async functions

### Phase 1C: Performance ✅
- [x] Add API response caching
- [x] Add client-side rate limiting
- [x] Optimize API call intervals

### Phase 2A: Code Quality ✅
- [x] Create TypeScript type definitions
- [x] Add comprehensive utilities

### Phase 2B: Testing ✅
- [x] Setup testing framework
- [x] Write unit tests for utilities
- [x] Add test scripts to package.json

### Phase 2C: CI/CD ✅
- [x] Create GitHub Actions workflow
- [x] Configure automated testing
- [x] Setup build verification

### Next Steps 🔜
- [ ] Convert store.js to TypeScript
- [ ] Add PropTypes/TypeScript to all components
- [ ] Add component tests
- [ ] Add E2E tests with Playwright
- [ ] Implement loading skeletons
- [ ] Add keyboard shortcuts
- [ ] Add local storage persistence
- [ ] Improve mobile responsiveness

---

## Breaking Changes

None yet - this is the first major update.

---

## Migration Guide

### For Developers

**Install New Dependencies:**
```bash
npm install
```

**Run Tests:**
```bash
npm test
npm run test:coverage
```

**Type Check:**
```bash
npm run type-check
```

### For Users

No breaking changes for end users. All existing functionality remains the same with improvements to:
- Error recovery (less crashes)
- Performance (faster repeated queries)
- Security (safer input handling)

---

[Unreleased]: https://github.com/haigpapa/new-lit-engine/compare/v0.0.0...HEAD
[0.0.0]: https://github.com/haigpapa/new-lit-engine/releases/tag/v0.0.0
