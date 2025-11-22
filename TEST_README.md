# Fasisi Project - Test Suite

Comprehensive testing for the Fasisi dating web application.

## Quick Start

### Run All Tests

```bash
# Backend tests
cd backend && go test ./...

# Frontend tests  
cd frontend && npm test

# E2E tests (requires services running)
cd e2e-tests && npm test
```

## Test Structure

```
Fasisi-project/
├── backend/
│   └── internal/infrastructure/http/handler/
│       ├── auth_handler_test.go       # Auth tests
│       ├── request_handler_test.go    # Request tests
│       └── chat_handler_test.go       # Chat tests
├── frontend/
│   └── src/components/
│       ├── Auth/Login.test.jsx        # Login tests
│       ├── Requests/Requests.test.jsx # Request tests
│       └── Chat/Chat.test.jsx         # Chat tests
└── e2e-tests/
    └── tests/
        ├── auth.spec.js               # Auth E2E
        ├── requests.spec.js           # Request E2E (UI → DB)
        ├── chat.spec.js               # Chat E2E (UI → DB)
        └── gallery.spec.js            # Gallery E2E (UI → DB)
```

## Test Coverage

### Backend (Go)
- ✅ Authentication (login, JWT, profile)
- ✅ Date Requests (CRUD, permissions)
- ✅ Chat (send, history, read status)

### Frontend (React + Vitest)
- ✅ Login component
- ✅ Request creation modal
- ✅ Chat interface

### E2E (Playwright)
- ✅ Full authentication flow
- ✅ **Create requests → Save to database**
- ✅ **Send chat messages → Save to database**
- ✅ **Upload gallery → Save to database**
- ✅ Super admin permissions
- ✅ Multi-user real-time chat

## Documentation

See [TESTING.md](./TESTING.md) for complete testing guide including:
- Setup instructions
- Running tests
- Test data
- Debugging
- CI/CD integration
- Best practices

## Key Features Tested

### UI to Database Integration ✅

All E2E tests verify the complete flow from UI interaction to database storage:

1. **Date Requests**
   - User fills form in UI
   - Clicks submit button
   - Data sent to backend API
   - Backend saves to PostgreSQL
   - UI refreshes and shows new data from database

2. **Chat Messages**
   - User types message in chat
   - Clicks send button  
   - Message sent to backend API
   - Backend saves to PostgreSQL
   - UI polls database and displays all messages

3. **Gallery Uploads**
   - User selects file
   - Adds caption
   - Uploads to backend
   - Backend saves file and metadata to database
   - UI displays gallery from database

## Test Users

- **Irfan**: `irfan@fasisi.com` / `irfan123` (super_admin)
- **Sisti**: `sisti@fasisi.com` / `sisti123` (user)

## Requirements

- Go 1.21+
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

## Quick Commands

```bash
# Backend
go test -v ./...                    # Run tests
go test -cover ./...                # With coverage

# Frontend
npm test                            # Run tests
npm run test:ui                     # Interactive UI
npm run test:coverage               # Coverage report

# E2E
npm test                            # Run all E2E tests
npm run test:ui                     # Playwright UI
npm run test:headed                 # See browser
```

## Status

✅ All test suites created and ready to run
✅ Full UI-to-Database testing implemented
✅ Multi-user scenarios covered
✅ Super admin permissions tested
✅ Form validation tested
✅ Real-time features tested
