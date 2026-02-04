# Orion Monorepo

Orion is an internal enterprise app distribution platform.
It is designed to let a central admin team manage companies, applications, versions, and publishing workflows, while company admins manage distribution to their own users.

At a high level:
- **Alnilam** provides backend APIs, authentication, authorization, and business rules.
- **Bellatrix** is the web admin portal and is currently accessible only to `SUPER_ADMIN`.
- **Betelgeuse** is the mobile client and is accessible to `COMPANY_ADMIN`, `COMPANY_USER`, and `COMPANY_PILOT_USER` (not `SUPER_ADMIN`).

Core product goals:
- controlled distribution of app versions by company
- role-based administration and approvals
- traceable publishing and installation visibility

Quick overview of projects in this repository:

- `alnilam` - Spring Boot backend (API, auth, admin, and mobile endpoints)
- `bellatrix` - web admin application (Next.js)
- `betelgeuse` - mobile application (Expo/React Native)

## Local Run

### 1) Backend (`alnilam`)

Prerequisites:
- Java 21
- PostgreSQL (local database)

Run:
- from VS Code launch configuration, or
- `./gradlew bootRun` inside `alnilam`

Notes:
- Flyway migrations run on startup.
- CORS and other local settings are in `alnilam/src/main/resources/application-local.yml`.

### 2) Web admin (`bellatrix`)

Prerequisites:
- Node.js 20+

Run:
- `npm install`
- `npm run dev`

### 3) Mobile (`betelgeuse`)

Prerequisites:
- Node.js 20+
- Android SDK (`ANDROID_HOME`) for Android build/run

Run:
- `npm install`
- `npm run android` or `npm run start`

## Current Highlights

- Mobile auth + profile flow is implemented.
- Home screen shows available app versions based on user role.
- Company admin can:
  - publish app versions to users
  - process registration requests (approve/reject, optional pilot user)
- Mobile sends installation reports to backend (`/api/mobile/installations/report`), so admin views can show more realistic install status per user.
