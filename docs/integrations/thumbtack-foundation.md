# Thumbtack integration foundation (development only)

Status: PREPARATION — no Thumbtack credentials issued, no callback endpoint deployed, no live sync enabled.

## Confirmed environment
- GitHub: BBbanks/axiomrenovations-site
- Vercel project: axiomrenovations-site, team axiom-renovations
- Production deployment (observed): dpl_7ifrpn5kTJguAQVV1v6aAssdrkmz, branch aob-business-priorities, commit c3c46df8eb19dae95ae1e22565b237c440f46706
- Recent nonproduction preview: dpl_CKVF7GL2J14EreqtfoGQWrpQcVSt, branch aob-safe-write-hardening
- Existing vercel.json: /ops rewrites and /api no-store/nosniff headers; no Thumbtack routes found in checked locations.

## Implementation contract (proposed, subject to Thumbtack documentation)
1. Provider adapter maps provider-specific IDs and statuses to a canonical AOE lead record; keep raw provider event reference and provenance.
2. Store one stable external identity key per lead: (provider, provider_account_id, provider_lead_id). Make event ingestion idempotent.
3. Stage inbound events in a validated inbox before any write to institutional records; require explicit, auditable mapping.
4. Authenticate webhook requests per provider specifications, reject invalid payloads, handle retries safely, never log secrets or message bodies by default.
5. OAuth: validate state and callback parameters, store tokens only in server-side secret storage, refresh with concurrency protection, never expose tokens in AOB/browser responses.
6. Isolate staging from production storage, credentials, and webhook endpoints. No live lead writes until authorized and tested.
7. Expose integration health (last success, errors, reconnect needed) without leaking sensitive data.

## Verification gates
- Confirm actual repository API runtime and existing AOB lead model before implementing routes.
- Determine Thumbtack-supported endpoints, scopes, redirect URI rules, webhook signature and retry contract from official docs/partner response.
- Deploy and probe HTTPS staging callback, then production callback. Record exact URLs and expected behavior before communicating them as verified.
- Exercise fixtures: duplicate event, out-of-order status, invalid signature, OAuth state mismatch, expired tokens, transient downstream error, and replay.
- Review pull request and explicitly authorize production activation.

## External dependency
Thumbtack ticket PINT-4319 replied to October 14, 2026; eligibility and staging credentials pending. No fabricated credentials or endpoints.

## Rollback
No production modifications from this branch. Abandon branch/close PR to roll back proposed work; if preview deployment created, disable its exposure without changing production aliases.
