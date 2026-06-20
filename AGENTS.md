# Agent Instructions

Read this file first for every task.

Shared library path (keep stable for other apps/agents): `.agent/`

Always-on rules:
- Use prefixed commit subjects: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`.
- Pick the dominant intent; do not create unprefixed commit subjects.
- Respect repo-specific guidance in `.agent/README.md` and any referenced workflows or skills under `.agent/`.
