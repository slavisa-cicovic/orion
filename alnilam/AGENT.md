# Alnilam – Backend Agent

## Role
Alnilam is the central backend system.
It owns the domain, data, and business rules.

## Tech Stack
- Java 21
- Spring Boot 3.x
- Gradle
- PostgreSQL
- REST API (JSON over HTTP)

## Persistence Rules
- PostgreSQL is the only supported database
- Database schema is owned exclusively by alnilam
- No frontend or mobile database access
- No auto-DDL in production environments
- In-memory databases (H2) allowed only for explicit test scenarios

## Architecture
- Layered architecture
- Domain-first approach
- Controllers are thin
- Business logic lives outside controllers
- Infrastructure concerns are isolated

## API Rules
- No direct entity exposure
- DTOs are mandatory
- Explicit request/response models
- Versioning strategy must be explicit when introduced

## Coding Rules
- Prefer readability over brevity
- Avoid framework magic without clear justification
- Lombok usage must be explicit and minimal
- Comments must be in English

## Non-Goals (for now)
- No GraphQL
- No reactive stack
- No event-driven architecture

