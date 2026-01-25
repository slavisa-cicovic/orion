# Orion – Domain Overview (v1)

## Purpose
Orion is a learning-oriented, multi-client application ecosystem used to explore:
- clean architecture
- multi-platform development
- AI-assisted development workflows (CODEX)

This is NOT a production-driven product. Stability and clarity of structure
have priority over feature completeness.

## System Landscape

Orion consists of three main applications:

- **alnilam** – backend (Spring Boot)
- **bellatrix** – web frontend (Next.js + MUI)
- **betelgeuse** – mobile app (React Native)

Each application is autonomous but shares a common conceptual domain.

## Persistence

- Primary database: **PostgreSQL**
- Database schema is owned exclusively by the backend (alnilam)
- No shared database access from frontend or mobile
- Migrations will be managed explicitly (tool to be decided later)

Persistence details (tables, relations, constraints) are intentionally
out of scope for this version of the domain document.

## High-Level Domain Idea

The system represents an **internal application store / registry**
used to:
- manage applications
- manage versions
- control access and visibility
- experiment with deployment and lifecycle concepts

Exact business rules are intentionally deferred.

## Core Domains and Entities (draft)

### Identity & Access

- **Company**: Tenant boundary for users and app availability.
- **User**: Belongs to a single company; has one or more roles.
- **Role**: SUPER_ADMIN, COMPANY_ADMIN, COMPANY_PILOT_USER, COMPANY_USER.
- **Device**: A phone or tablet used by a user to install apps.

### Application Registry

- **Application**: Logical app (e.g., app1) owned by the platform.
- **ApplicationVersion**: Versioned release (e.g., 1.0.0, 2.0.0).

## Entity Drafts (initial)

### Company

- id
- name
- code
- address
- city
- zip
- isActive
- createdAt
- createdById
- updatedAt
- updatedById

### CompanyRegistrationCode

- id
- companyId
- code
- expiresAt
- createdAt
- createdById

### User

- id
- companyId
- firstName
- lastName
- email
- phone
- roles (set of SUPER_ADMIN | COMPANY_ADMIN | COMPANY_PILOT_USER | COMPANY_USER)
- isActive
- createdAt
- createdById
- updatedAt
- updatedById
Notes:
- companyId is null for SUPER_ADMIN (global user).

### RegistrationRequest

- id
- companyId
- companyCode
- firstName
- lastName
- email
- phone
- passwordHash
- status (PENDING | APPROVED | REJECTED)
- requestedAt
- decidedAt
- decidedById

### Device

- id
- deviceType (PHONE | TABLET)
- platform (ANDROID | IOS)
- model
- osVersion
- lastSeenAt
- createdAt
- createdById
- updatedAt
- updatedById

### UserDeviceAssignment

- id
- userId
- deviceId
- assignedAt
- unassignedAt
- assignedById

### DeviceAppInstallation

- id
- deviceId
- appId
- appVersionId
- installedAt
- uninstalledAt
- installedByUserId

### AuditLog

- id
- entityType
- entityId
- action (UPDATE | DELETE | ACTIVATE | DEACTIVATE | PUBLISH)
- actorUserId
- actorRole
- reason
- createdAt

### Application

- id
- packageName
- displayName
- description
- iconUrl
- isActive
- createdAt
- createdById
- updatedAt
- updatedById

### ApplicationVersion

- id
- appId
- versionName
- versionCode
- platform (ANDROID | IOS)
- minSdk
- targetSdk
- fileUrl
- checksum
- isActive
- createdAt
- createdById
- updatedAt
- updatedById

### Distribution / Installation

- **CompanyApplicationAccess**: Which companies can see a published application version.
- **UserAppInstallation**: Which app versions are installed on a user device.
- **CompanyAppVisibility**: Whether a company has published a version to pilot users or all users.

## Auth and Identity (draft)

- Single auth endpoint for web and mobile.
- Login with username or email.
- Issues accessToken and refreshToken (JWT).
- accessToken must include at least the user roles.
- Token lifetimes are configurable via `.env` (default: access 15 minutes, refresh 30 days).
- Refresh tokens rotate on use.

Example accessToken payload:
```json
{
  "iss": "orion-alnilam",
  "sub": "userId",
  "uid": 123,
  "email": "user@example.com",
  "username": "jdoe",
  "roles": ["COMPANY_USER"],
  "iat": 1710000000,
  "exp": 1710000900
}
```

## Key Rules from Use Cases (draft)

- SUPER_ADMIN signs in only to the web app; other roles sign in only to the mobile app.
- SUPER_ADMIN can manage companies, users, applications, and application versions.
- Roles are scoped to a single company per user.
- SUPER_ADMIN is global (no companyId); multiple SUPER_ADMIN users are allowed.
- COMPANY_PILOT_USER always implies COMPANY_USER.
- SUPER_ADMIN can update only the latest application version.
- Latest version is determined by `versionCode`; rollback is not allowed.
- An application with a published version cannot be deleted.
- SUPER_ADMIN can publish an application version to one or more companies.
- COMPANY_ADMIN can manage users only within their company and can assign COMPANY_PILOT_USER.
- COMPANY_ADMIN can generate a time-limited company registration code (default: 7 days).
- COMPANY_USER registration uses the company code and creates a RegistrationRequest.
- COMPANY_ADMIN approves or rejects RegistrationRequests for their company.
- COMPANY_ADMIN can publish an application version to pilots only or to all users in their company.
- COMPANY_PILOT_USER and COMPANY_USER can install/uninstall and upgrade apps.
- Publishing flow uses ApplicationVersion statuses: DRAFT, PUBLISHED_TO_COMPANIES, PUBLISHED_TO_USERS.
- SUPER_ADMIN creates versions and publishes them to companies.
- SUPER_ADMIN can see latest version per app and whether it is published.
- SUPER_ADMIN can see version publish state, target companies, and whether COMPANY_ADMIN published to users.
- Installation tracking is per device, scoped to the current user-device assignment.
- User visibility is based on company publish rules, while installed versions reflect the device state.
- Backend must audit update/delete/activate actions with actor, timestamp, and a short user-provided reason.
- AuditLog scope: Company, User, Application, ApplicationVersion.

### ApplicationVersion status definitions (draft)

- DRAFT: Created by SUPER_ADMIN, not visible to companies.
- PUBLISHED_TO_COMPANIES: Visible to COMPANY_ADMIN users for selected companies.
- PUBLISHED_TO_USERS: Published by COMPANY_ADMIN to pilots or all users in their company.

## Relationships (draft)

- Company 1..* Users
- User 0..* Devices (many-to-many via assignments)
- Application 1..* ApplicationVersions
- ApplicationVersion 0..* CompanyApplicationAccess
- CompanyApplicationAccess 1 Company, 1 ApplicationVersion
- UserAppInstallation 1 User, 1 Device, 1 ApplicationVersion

## Aggregate Drafts (initial)

- Company aggregate: Company (root) with Users and RegistrationRequests scoped to the company.
- Application aggregate: Application (root) with ApplicationVersions.
- Device aggregate: Device (root) with UserDeviceAssignments and DeviceAppInstallations.
- AuditLog is a separate append-only aggregate.

## Bounded Contexts (Initial)

At this stage, contexts are conceptual and may change:

- Identity & Access
- Application Registry
- Distribution / Installation
- Audit & Metadata

No persistence or schema assumptions yet.

## Explicit Non-Goals (for now)

- No billing
- No marketplace payments
- No public app store logic
- No production-grade security hardening

## Architectural Principles

- Backend owns the domain
- Frontend and mobile are consumers, not domain owners
- API contracts are explicit and versioned
- No shared DB access across apps
- No “smart frontend”

## Evolution Strategy

- DOMAIN.md will evolve **after USECASES.md**
- Entities and aggregates will be introduced later
- Refactoring is expected and encouraged
