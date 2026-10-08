# AOB write safety — mandatory integration contract

Incident: CHG-20261008-126; implementation issue #11.

The production dashboard remains read-only. Its Google service-account scope is `spreadsheets.readonly`. Do not broaden that scope or expose a write endpoint without authorization, concurrency controls, and test coverage.

## For direct AI/Google Sheets edits

1. Read spreadsheet metadata and the populated Matter column from the canonical Operating Board immediately before modifying it. Identify clients by verified identity, not a remembered row number.
2. On **create**, check existing names, contact details, and job context for duplicates. If ambiguous, stop and ask. Never use `updateCells` against a guessed blank row. Use `insertDimension` in a single batch followed by template formatting/validation and values, or a verified empty append destination. Avoid copying another client's data.
3. On **update**, re-resolve identity and current row, update only intended fields, and preserve all others. Stop if identity or prewrite state changed.
4. Snapshot all affected records before editing. Re-read modified and adjacent records after editing. Verify identities, count, content, formatting/validation and formulas. Report any discrepancy immediately and restore only when snapshot-based restoration is safe.
5. Treat direct connector writes as **not concurrency-safe**. Read-before-write is not an atomic lock. Do not claim a software-enforced guarantee until all writers use a common serialized or optimistic-concurrency-controlled write service.

## Planned write service acceptance criteria

- Stable per-matter immutable IDs (not row numbers); schema migration for existing rows.
- Authenticated server-side service with least-privilege Google credentials, input validation, and allowlisted columns.
- Duplicate detection, conditional update/version checking, serialized writes or lock, atomic insertion and preservation of Sheets native structures.
- Read-back verification and audited rollback/recovery on failure.
- Tests against a copy of the spreadsheet: occupied row, duplicate, row shift, concurrent requests, partial failure, formula/validation preservation, and restore.
- Only after passing tests: migrate all automated writers to this single path, restrict other write credentials, and deploy with explicit owner review.

This file is an executable-workflow specification, not proof of deployed enforcement. Canonical prose copy: AOB - Safe Write Protocol - Canonical (Drive).
