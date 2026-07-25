# Agent Configuration for sports-lib

This directory contains configuration, skills, and workflows for AI agents working on the `sports-lib` project.

## Structure

- **skills/**: Contains specialized "skills" (instructions + scripts) for the agent.
  - `debug-utils`: Instructions for using the project's ad-hoc FIT file debugging scripts.
  - `metric-extension`: Safely add or correct normalized metrics from raw activity data.
- **workflows/**: Contains step-by-step guides for common tasks.
  - `add-new-data.md`: How to identify and add new data fields from FIT files.

## Usage

When asking an agent to help with debugging or adding data, you can refer them to these specific skills or workflows if they don't automatically pick them up.
- "Use the debug-utils skill to inspect this file."
- "Use the metric-extension skill to add this FIT metric."
- "Follow the add-new-data workflow."

## Agent Rule: Data Type Changes Must Update Metric Documentation

When an agent adds, renames, or removes any exported `Data*.type` in `src/data/`:
- Update the metric catalog in `docs/guides/metrics-and-calculations.md`.
- Keep canonical metric tokens exactly as declared in code (including legacy whitespace tokens like `` ` Steps` ``).
- Include the documentation update in the same change/PR as the data-type change.

## Agent Rule: Public API Changes Must Update Documentation

When adding, removing, renaming, or changing the signature or behavior of a supported package-root export:

- Update `docs/api.ts` so the curated TypeDoc API boundary matches the supported public API. Do not document a symbol that consumers cannot import from `@sports-alliance/sports-lib`; add supporting exports to `src/index.ts` only when they are part of a public signature.
- Add or update concise JSDoc for affected public classes, interfaces, methods, options, return values, and behavior.
- Update the affected guide in `docs/guides/` and the landing page in `docs/README.md` when consumer usage, inputs, outputs, or semantics change. Update the root `README.md` when its quick start or documentation links are affected.
- Keep `typedoc.json`, `tsconfig.docs.json`, and package exports compatible, and never commit generated `site/` output.
- Validate with `npm run docs:build`, plus the relevant build and tests for TypeScript API changes.

## Quantified Self MCP consumer

Quantified Self builds its MCP numeric event-metric catalog from the public `DataStore`, canonicalizes aliases through
`DynamicDataLoader`, and exposes only canonical numeric stats actually persisted in a user's event documents. Sports Lib
owns metric classes, canonical tokens, units, validators, parsing, and JSON behavior. Quantified Self owns user-specific
availability, sensitive-field exclusions, OAuth scopes, query limits, privacy projection, and transport.

A Sports Lib change must not assume that exporting a class alone is sufficient. Follow the metric-extension skill to
verify public enumeration, canonical loading, numeric behavior, persistence, reparse implications, and the downstream
Quantified Self contract.
