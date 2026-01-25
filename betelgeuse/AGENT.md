# Betelgeuse – Mobile App Agent

## Role
Betelgeuse is a mobile client application.
It is optimized for usability and simplicity.

It does NOT own the domain.

## Tech Stack
- React Native
- TypeScript
- Expo (unless explicitly changed)
- REST API consumption

## Architecture Rules
- Thin client
- Backend-driven behavior
- Clear separation between:
  - Screens
  - Components
  - API calls
  - State

## Offline Considerations
- Offline support may be introduced later
- Do not assume offline-first behavior by default

## Coding Rules
- Simplicity over abstraction
- Avoid over-engineering
- Prefer platform-agnostic solutions

## Non-Goals
- No direct persistence of domain data
- No business rule enforcement

