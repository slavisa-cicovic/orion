# Orion Use Cases

This document will eventually list every use case supported by the app.
For now, it starts with SUPER_ADMIN use cases only.

## User roles

- SUPER_ADMIN
- COMPANY_ADMIN
- COMPANY_PILOT_USER
- COMPANY_USER

## Login access

- SUPER_ADMIN can sign in only to the web app.
- COMPANY_ADMIN, COMPANY_USER, and COMPANY_PILOT_USER can sign in only to the mobile app.

## Registration

- SUPER_ADMIN creates COMPANY_ADMIN users with a default password; COMPANY_ADMIN must change it on first login.
- COMPANY_USER registration starts in the mobile app by submitting personal data, password, and a company code.
- Company code is provided by COMPANY_ADMIN and is valid for a limited time (e.g., 7 days).
- A registration request is created from the submitted data.
- COMPANY_ADMIN can approve or reject registration requests for their company.
- When approved, the system creates a new COMPANY_USER.

## SUPER_ADMIN use cases

### Company

- View company list
- Create company
- Update company
- Delete company
- Activate/deactivate company

### User

- View user list
- Create user
- Update user
- Delete user
- Activate/deactivate user
- View user devices (phone/tablet) and installed applications with versions

Notes:
- SUPER_ADMIN can create/update only COMPANY_ADMIN users.
- COMPANY_ADMIN can create/update COMPANY_USER users.

### Application

- View application list
- Create application
- Update application
- Delete application
- Activate/deactivate application

### Application version

- View application version list
- Create application version
- Update application version (latest only)
- Delete application version
- Activate/deactivate application version
- Publish application version to one or more companies (makes the version visible to COMPANY_ADMIN users in those companies)

Notes:
- An application with a published version cannot be deleted.
- Only the latest application version can be updated (by versionCode; rollback is not allowed).

## COMPANY_ADMIN use cases

### Company

- Update company
- Generate a company registration code

Notes:
- COMPANY_ADMIN can view only their company.

### User

- View user list
- Activate/deactivate user
- View user devices (phone/tablet) and installed applications with versions

Notes:
- COMPANY_ADMIN can view and manage users only within their company.
- COMPANY_ADMIN can assign the COMPANY_PILOT_USER role to users in their company.

### Application version

- View application list
- Install/uninstall application
- Upgrade application version 
- Publish application version to COMPANY_PILOT_USER users only
- Publish application version to all COMPANY_USER users

## COMPANY_PILOT_USER use cases

- View application list
- Install/uninstall application
- Upgrade application when a new version is available

## COMPANY_USER use cases

- View application list
- Install/uninstall application
- Upgrade application when a new version is available
