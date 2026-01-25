# PLAN_01_backend_domain

## Goals

- Establish a shared backend domain model aligned with current use cases and roles.
- Define core entities, relationships, and invariants for companies, users, apps, and versions.
- Produce a stable baseline for API contracts and persistence planning.

## Tasks

1. [ ] - Review `docs/USECASES.md` and confirm scope for backend domain modeling.
2. [ ] - Refine core entities and relationships in `docs/DOMAIN.md` (companies, users, roles, apps, versions, devices).
3. [ ] - Specify key invariants and constraints (latest version updates only, publish visibility, role boundaries).
4. [ ] - Draft aggregate boundaries and ownership (who owns what data and rules).
5. [ ] - Identify required API endpoints at a high level (no implementation yet).
6. [ ] - Document environment config policy (.env in .gitignore, .env.example committed).
7. [ ] - Seed initial SUPER_ADMIN user (super.admin@example.com / passwrod123) in init database.
8. [ ] - Quick QA: sanity check against use cases and login/access rules.
