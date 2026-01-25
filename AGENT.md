# Orion – Agent Instructions

Private internal application store similar to Google Play / App Store, used for:

* Distributing internal company apps
* Managing versions, releases, and access control
* Bypassing public store restrictions (SDK level, policies, etc.)
* Centralized control over mobile app lifecycle

Primary users:

* Admins (IT / DevOps)
* Internal developers
* Employees (app consumers)

Orion is a learning-first, refactoring-oriented project.
The goal is architectural clarity, clean structure, and disciplined evolution,
not rapid feature delivery.

This repository contains multiple independent applications.
Each application must be treated as a separate system.

## Projects
- alnilam – backend (Spring Boot, PostgreSQL)
- bellatrix – web frontend (Next.js, MUI)
- betelgeuse – mobile app (React Native)

## Global Rules
- Do NOT mix concerns across projects
- Do NOT share code between apps unless explicitly defined
- Backend is the single source of truth for the domain
- Frontend and mobile are consumers only
- Prefer explicit, boring solutions over clever abstractions
- Refactoring is expected and encouraged

## Architecture Principles
- Clear ownership of responsibilities
- Explicit API contracts
- No implicit behavior
- No hidden magic

## AI Usage Guidelines
- Treat this as an educational environment
- Ask before introducing new frameworks or tools
- Avoid premature optimization
- Avoid speculative features

## Planning Conventions
* All plan documents must be written in English.
* Status legend:
  - `[ ]` not started
  - `[p]` in progress
  - `[d]` done
  - `[b]` blocked
  - `[r]` in review
  - `[t]` testing/QA
  - `[h]` on hold
* Tasks must be numbered and marked with the status legend (e.g., `[d]`, `[p]`).

## Session Context
All conversations related to this repository should be treated as:
"Orion – iAppStore refactoring sessions".

Subtopics (backend, frontend, mobile, tooling) are part of the same
refactoring effort and do not represent separate tasks.
