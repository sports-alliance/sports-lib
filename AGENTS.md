# Agent Instructions

Read this file first for every task.

Shared library path (keep stable for other apps/agents): `.agent/`

Always-on rules:
- Use prefixed commit subjects: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`.
- Pick the dominant intent; do not create unprefixed commit subjects.
- Respect repo-specific guidance in `.agent/README.md` and any referenced workflows or skills under `.agent/`.
- When adding, renaming, removing, or changing an exported metric or its persisted representation, use
  `.agent/skills/metric-extension/SKILL.md` and assess the Quantified Self MCP consumer contract in the same change.
- When creating or editing a GitHub release, derive the notes from the commits since the previous release tag and match
  the established consumer-facing style. Name the release `sports-lib X.Y.Z`; use `## Fixed`, `## Migration`, and
  `## Compatibility` for patch releases, or `## Highlights`, `## Migration`, and `## Compatibility` for feature
  releases. State whether consumers must reparse source files, regenerate derived summaries, or migrate persisted data,
  and describe public API and serialized-data compatibility. Omit internal-only implementation and CI details unless
  they materially affect consumers.
