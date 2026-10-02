# Axiom Operating Board — mobile dashboard

This directory is the mobile-first interface layer for Axiom's shared operating state.

## Architecture

Canonical job systems -> AOE operating logic -> Axiom Operating Board -> authenticated API -> this dashboard.

The UI is not the source of truth. The canonical Axiom Operating Board remains the shared operational state layer; detailed job files, GetCost, Calendar, and other canonical systems remain authoritative.

## Security boundary

This repository is public. No customer data, Google credentials, API keys, OAuth tokens, passwords, session secrets, or live operating-board exports belong in the repository.

The production dashboard requires server-side environment variables:

- AXIOM_DASHBOARD_PASSWORD
- AXIOM_SESSION_SECRET
- GOOGLE_SERVICE_ACCOUNT_EMAIL
- GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
- AXIOM_OPERATING_BOARD_SPREADSHEET_ID

The Google service account must have read access to the canonical Axiom Operating Board spreadsheet. Credentials stay server-side.

## Runtime flow

1. Brandon or Nicole signs in at `/ops-dashboard/login.html`.
2. `POST /api/login` validates the shared dashboard password and sets a signed HttpOnly session cookie.
3. `GET /api/operating-board` verifies the session.
4. The serverless backend authenticates to Google Sheets using a service account.
5. Only the operational fields needed by the card interface are returned to the browser.
6. The browser never receives Google credentials.

## Deployment target

The branch contains `vercel.json` and Vercel-compatible serverless functions. A production deployment still requires a connected hosting account and the environment variables above.

## Current state

- Mobile responsive shell: complete
- Installable PWA metadata: complete
- Filters and card detail view: complete
- Password/session authentication code: complete
- Live Google Sheets read endpoint code: complete
- No live secrets committed: verified by design
- Hosting deployment and environment configuration: pending
- Service-account share to Operating Board: pending
- Authenticated write-back: pending
- Push notifications: pending

Preview rebuild trigger: 2026-10-03 environment-scope validation.
