# Testing Guide - Fasisi Project

This document describes the comprehensive testing suite for the Fasisi dating web application.

## Test Structure

The project includes three levels of testing:

1. **Backend Unit Tests** (Go) - Testing handlers, repositories, and services
2. **Frontend Unit Tests** (React/Vitest) - Testing React components
3. **End-to-End Tests** (Playwright) - Testing UI interactions with database

## Backend Tests (Go)

### Location
```
backend/internal/infrastructure/http/handler/
├── auth_handler_test.go
├── request_handler_test.go
└── chat_handler_test.go
```

### Running Backend Tests

```bash
cd backend

# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run tests with verbose output
go test -v ./...

# Run tests for specific package
go test ./internal/infrastructure/http/handler/...

# Generate coverage report
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html
```

### Test Coverage

**Auth Handler Tests:**
- Valid login (Irfan & Sisti)
- Invalid credentials
- Missing fields validation
- Email format validation
- JWT token generation
- Profile retrieval
- Token validation

**Request Handler Tests:**
- Create food request
- Create place request
- Delete request (with permission checks)
- Super admin can delete any request
- Regular user can only delete own requests
- Update request status (approve/reject)
- List all requests
- Field validation

**Chat Handler Tests:**
- Send message
- Get message history
- Mark messages as read
- Get unread count
- Empty message validation
- Message length validation

## Frontend Tests (React + Vitest)

### Location
```
frontend/src/components/
├── Auth/Login.test.jsx
├── Requests/Requests.test.jsx
└── Chat/Chat.test.jsx
```

### Setup

```bash
cd frontend

# Install dependencies
npm install

# Install additional test dependencies if needed
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Running Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/index.html
```

### Test Coverage

**Login Component:**
- Renders login form correctly
- Validates email format
- Requires password
- Submits form with valid credentials
- Displays error on failed login
- Handles API errors gracefully

**Requests Component:**
- Renders requests page
- Opens modal on create button click
- Submits new request successfully
- Displays request list from API
- Super admin can delete any request
- Regular user can only delete own requests
- Form validation

**Chat Component:**
- Renders chat interface
- Displays chat messages
- Sends new message
- Prevents sending empty messages
- Clears input after sending
- Auto-refreshes messages
- Distinguishes sent vs received messages

## End-to-End Tests (Playwright)

### Location
```
e2e-tests/
├── tests/
│   ├── auth.spec.js
│   ├── requests.spec.js
│   ├── chat.spec.js
│   └── gallery.spec.js
└── playwright.config.js
```

### Setup

```bash
cd e2e-tests

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running E2E Tests

```bash
cd e2e-tests

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run specific test file
npx playwright test tests/requests.spec.js

# Run tests on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# View test report
npm run test:report
```

### E2E Test Coverage

**Authentication Flow:**
- Display login page
- Login as Irfan (super admin)
- Login as Sisti (user)
- Show error for invalid credentials
- Logout successfully

**Date Requests (UI → Database):**
- ✅ Create food request and save to database
- ✅ Create place request and save to database
- ✅ Approve request and update database
- ✅ Super admin delete request from database
- ✅ Form validation

**Chat (UI → Database):**
- ✅ Send message and save to database
- ✅ Load message history from database
- ✅ Display timestamps
- ✅ Prevent empty messages
- ✅ Clear input after sending
- ✅ Distinguish sent vs received messages
- ✅ Auto-refresh messages (polling)
- ✅ Multi-user real-time messaging

**Gallery (UI → Database):**
- Display gallery page
- Upload image to database
- Super admin delete any gallery item
- Empty state display

## Testing Prerequisites

### Backend Testing
- Go 1.21+ installed
- PostgreSQL running (for integration tests)
- Environment variables configured

### Frontend Testing
- Node.js 18+ installed
- Dependencies installed (`npm install`)

### E2E Testing
- Backend server running on http://localhost:8080
- Frontend server running on http://localhost:3000
- PostgreSQL database accessible
- Test users created (Irfan & Sisti)

## Running All Tests

### Option 1: Manual (Development)

```bash
# Terminal 1 - Start PostgreSQL
docker compose up postgres -d

# Terminal 2 - Start Backend
cd backend
go run cmd/api/main.go

# Terminal 3 - Start Frontend
cd frontend
npm run dev

# Terminal 4 - Run Backend Tests
cd backend
go test ./...

# Terminal 5 - Run Frontend Tests
cd frontend
npm test

# Terminal 6 - Run E2E Tests
cd e2e-tests
npm test
```

### Option 2: Docker Compose

```bash
# Start all services
docker compose up -d

# Run backend tests in container
docker compose exec backend go test ./...

# Run E2E tests (requires services running)
cd e2e-tests
npm test
```

## Test Data

### Test Users (Hardcoded)

1. **Irfan** (Super Admin)
   - Email: `irfan@fasisi.com`
   - Password: `irfan123`
   - Role: `super_admin`

2. **Sisti** (User)
   - Email: `sisti@fasisi.com`
   - Password: `sisti123`
   - Role: `user`

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-go@v2
        with:
          go-version: '1.21'
      - run: cd backend && go test ./...

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install && npm test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: docker compose up -d
      - run: cd e2e-tests && npm install && npx playwright install && npm test
```

## Test Reports

### Backend
- Console output with pass/fail status
- Coverage reports in HTML format

### Frontend
- Vitest UI for interactive testing
- Coverage reports with line-by-line breakdown
- JSON output for CI integration

### E2E
- HTML report with screenshots on failure
- Video recordings for failed tests
- Trace files for debugging

## Debugging Failed Tests

### Backend
```bash
# Run specific test
go test -v -run TestAuthHandler_Login

# Run with race detection
go test -race ./...
```

### Frontend
```bash
# Run tests in watch mode
npm run test:watch

# Run tests with UI for debugging
npm run test:ui
```

### E2E
```bash
# Run in debug mode (pauses on each step)
npx playwright test --debug

# Run in headed mode (see browser)
npx playwright test --headed

# Generate trace for debugging
npx playwright test --trace on
npx playwright show-trace trace.zip
```

## Best Practices

1. **Keep tests independent** - Each test should be able to run in isolation
2. **Use descriptive test names** - Clearly describe what is being tested
3. **Test user journeys** - E2E tests should follow real user workflows
4. **Mock external services** - Don't rely on external APIs in unit tests
5. **Clean up test data** - E2E tests should clean up after themselves
6. **Run tests frequently** - Catch bugs early by running tests often
7. **Maintain test coverage** - Aim for >80% code coverage
8. **Document test scenarios** - Keep this guide updated

## Troubleshooting

### Backend Tests Failing
- Check Go version (`go version`)
- Ensure dependencies are up to date (`go mod tidy`)
- Verify PostgreSQL is running

### Frontend Tests Failing
- Clear node_modules and reinstall (`rm -rf node_modules && npm install`)
- Check Node version (`node --version`)
- Verify all dev dependencies are installed

### E2E Tests Failing
- Ensure backend and frontend servers are running
- Check browser installation (`npx playwright install`)
- Verify database is accessible
- Check test user credentials are correct
- Look at screenshots/videos in `test-results/` folder

## Future Improvements

- [ ] Add integration tests for database repositories
- [ ] Add API contract tests
- [ ] Add performance tests
- [ ] Add security tests (OWASP)
- [ ] Add accessibility tests (a11y)
- [ ] Add mobile responsive tests
- [ ] Add load tests
- [ ] Add visual regression tests

## Support

For issues with tests, please:
1. Check this documentation
2. Review test output and error messages
3. Check browser console (for E2E tests)
4. Review application logs
5. Open an issue with test failure details
