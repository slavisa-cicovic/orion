# Bellatrix – Web Frontend Agent

## Role
Bellatrix is a web client application.
It consumes backend APIs and presents data to users.

It does NOT own business rules.

## Tech Stack
- Next.js (App Router)
- TypeScript
- Material UI (MUI)
- REST API consumption

## Architecture Rules
- No business logic duplication from backend
- Backend responses are treated as source of truth
- Clear separation of:
  - API layer
  - State management
  - UI components
  - Pages / routes

## State Management
- Keep state minimal
- Avoid global state unless justified
- Prefer predictable data-fetching patterns

## UI Rules
- Consistent layout and styling
- Accessibility is preferred but not enforced initially
- Avoid custom components when MUI provides a solid default

## Non-Goals
- No direct database access
- No heavy client-side domain logic

