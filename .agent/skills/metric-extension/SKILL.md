---
name: metric-extension
description: Add, correct, rename, or retire a normalized sports-lib activity metric. Use for FIT, GPX, TCX, or provider-JSON field mapping; Data class, unit, display, serialization, canonical-token changes, metric-related public API or documentation updates, and downstream Quantified Self MCP discovery contracts.
---

# Sports-Lib Metric Extension

Preserve a metric's meaning from raw input through the normalized activity model, persistence, and consumer documentation.

## Read First

Read `.agent/README.md` and `.agent/workflows/add-new-data.md`. Use the `debug-utils` skill when inspecting FIT input. Inspect the closest existing metric and importer before designing a new class or token.

## Workflow

1. Prove the source field exists with a representative sample. Identify its record scope, source unit, missing-value behavior, and whether the source is device- or provider-derived.
2. Reuse the nearest existing `src/data/` pattern. Add a class only when the metric has distinct semantics; preserve canonical `Data*.type` tokens exactly, including legacy whitespace.
3. Map the value in the appropriate importer and scope. Do not infer a missing raw value or silently change units.
4. Cover parsing plus the narrowest relevant class behavior: value, unit, display, JSON serialization, and canonical-name behavior.
5. Update `docs/guides/metrics-and-calculations.md` whenever an exported data type changes. For supported package-root API changes, also update `src/index.ts`, `docs/api.ts`, JSDoc, and the affected guide or README.
6. Revert temporary debugging-script edits unless they are a deliberate reusable improvement.
7. Determine whether existing persisted activities need reparsing and document the downstream version or transition impact.
8. Assess the Quantified Self MCP metric contract:
   - a discoverable numeric metric must be publicly enumerable from `DataStore`;
   - its canonical token and aliases must resolve through `DynamicDataLoader`;
   - construction, `getValue()`, and validation must retain finite numeric semantics;
   - JSON persistence must retain the canonical event-stat key and value;
   - sensitive numeric data such as precise position must be identified for downstream exclusion; and
   - the corresponding Quantified Self change must use `.agent/skills/mcp-metric-surface/SKILL.md` to update its package
     versions, reparse decision, automatic-discovery/persistence tests, safe projection, and documentation.

Do not add an MCP-specific metric registry to Sports Lib. Nonnumeric structures may be useful to other consumers, but
they are not automatically eligible for Quantified Self's numeric event-metric MCP tool.

## Verify

Run the narrowest affected Jest specs, then `npm run build`. For an MCP-relevant metric, also verify a test proves public
`DataStore` enumeration, canonical `DynamicDataLoader` resolution, numeric behavior, and JSON round-trip persistence.
Run `npm run docs:build` whenever public API or consumer documentation changes.

## Guardrails

- Keep raw field names, canonical tokens, and display labels distinct; compatibility tokens are part of the contract.
- Prefer a focused fixture and assertion over broad parser snapshots.
- Do not commit generated `site/` output.
- Do not publish a package, edit a downstream production checkout, start a reparse, or deploy infrastructure as part of
  this skill.
