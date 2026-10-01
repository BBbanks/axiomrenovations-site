# Axiom Operating Board deployment checklist

## Target
Deploy the dashboard as a protected Vercel project from branch `aoe-operating-dashboard-v1` before merging into `main`.

## Git-trigger note
Vercel creates Preview deployments automatically from commits pushed to non-production branches after the project has its initial production deployment. The production branch is `main`; therefore commits to `aoe-operating-dashboard-v1` should produce Preview deployments without changing production.

## Required environment variables
Configure these in Vercel Project Settings -> Environment Variables for Preview first:

- AXIOM_DASHBOARD_PASSWORD
- AXIOM_SESSION_SECRET
- GOOGLE_SERVICE_ACCOUNT_EMAIL
- GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
- AXIOM_OPERATING_BOARD_SPREADSHEET_ID

Use the canonical Operating Board spreadsheet ID:

`11b1T26MyocRUD6pBsoHejs4zTYP2N0crUK2rq6zh03M`

Do not expose any of these values to browser code.

## Google access
Create or use a Google Cloud service account for the dashboard runtime.

Grant the service-account email Viewer access to the canonical Axiom Operating Board only. The API code uses the read-only Sheets scope.

## Preview verification
After Vercel deploys the branch:

1. Open `/api/health`.
2. Confirm `ready: true`.
3. Open `/ops`.
4. Confirm unauthenticated access redirects to the dashboard login after the first API request.
5. Sign in with the dashboard password.
6. Confirm Bill Anderson, William Keith, and Robert Schiller render from the live Operating Board.
7. Tap each card and verify the job-folder link.
8. Test on Brandon's Android phone.
9. Test on Nicole's iPhone.
10. Add the dashboard to each home screen only after the protected preview passes.

## Production rule
Do not merge or expose the dashboard on the public Axiom site until:
- live read passes;
- authentication is verified;
- no secrets appear in client responses/source;
- both mobile platforms are tested.

Write-back and push notifications remain separate later phases.
