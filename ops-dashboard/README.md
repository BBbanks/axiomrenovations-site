# Axiom Operating Board — mobile dashboard scaffold

This directory is the mobile-first interface layer for Axiom's shared operating state.

## Architecture

Canonical job systems -> AOE operating logic -> Axiom Operating Board -> this dashboard.

The UI is intentionally not the source of truth. The canonical Axiom Operating Board remains the shared operational state layer; detailed job files, GetCost, Calendar, and other canonical systems remain authoritative.

## Security boundary

This repository is currently public. Therefore **no customer names, addresses, estimate details, Google credentials, API keys, OAuth tokens, or live operating-board exports belong in this repository**.

The committed client contains only generic demo records. Production data must be supplied at runtime through an authenticated same-origin endpoint:

    GET /api/operating-board

Expected response:

    {
      "matters": [
        {
          "id": "opaque-id",
          "name": "Client / job name",
          "type": "lead | estimate | job",
          "stage": "current stage",
          "owner": "Brandon | Nicole | Brandon + Nicole",
          "area": "service area",
          "currentState": "what is true now",
          "nextAction": "next Axiom action",
          "waitingOn": "dependency",
          "attention": "high | medium | low",
          "strategicNote": "durable context",
          "jobFolder": "authorized link"
        }
      ]
    }

## Production requirements

1. Host the dashboard behind authentication available to Brandon and Nicole.
2. Keep Google access and credentials server-side.
3. The backend reads the canonical Axiom Operating Board and returns only fields required by the UI.
4. Write actions must be authenticated, validated, logged, and routed back through the canonical operating-state workflow.
5. Never expose the Google Sheet publicly to make the dashboard work.
6. Support iPhone and Android through the same responsive web app / PWA.

## Current state

- Mobile responsive shell: complete
- Installable PWA metadata: complete
- Filters and card detail view: complete
- Demo fallback state: complete
- Live authenticated read endpoint: pending
- Authenticated write-back: pending
- Push notifications: pending
