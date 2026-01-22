---
name: debug-utils
description: Utilities for debugging FIT file parsing and inspecting raw data structure.
---

# Debug Utilities Skill

This skill provides instructions on how to use the various utility scripts in the root directory to debug FIT file parsing and inspect data structures.

## Available Utilities

### 1. `find-values.js`
**Purpose**: Recursively searches for a specific numeric value within a parsed FIT file object. Useful when you know a value exists (e.g., from a screenshot or another tool) but don't know which field it maps to.
**Usage**:
1. Edit the file to set `targetValue` and `file` path.
2. Run: `node find-values.js`

### 2. `inspect-devices.js`
**Purpose**: Inspects `device_infos` from a parsed FIT file.
**Target File**: Default is `samples/fit/road-with-power.fit`.
**Usage**: `node inspect-devices.js`

### 3. `inspect-session.js`
**Purpose**: Inspects `laps` and `sessions` data.
**Target File**: Default is `samples/fit/jumps-mtb.fit`.
**Usage**: `node inspect-session.js`

### 4. `inspect_jump_raw.js`
**Purpose**: Dumps root keys, the first `jump` record, and `user_profiles`.
**Target File**: Default is `samples/fit/jumps-mtb.fit`.
**Usage**: `node inspect_jump_raw.js`

### 5. `check-metrics.js`
**Purpose**: Iterates through all `events` and logs specific raw values (e.g., 57, 19, 1164). Useful for finding specific event types or data markers.
**Target File**: Default is `samples/fit/jumps-mtb.fit`.
**Usage**: `node check-metrics.js`

## Common Workflow for Debugging
1. **Identify the Issue**: Missing data, incorrect value, or unknown field.
2. **Select a Sample**: Choose a relevant `.fit` file from `samples/fit/` or add a new one.
3. **Use a Script**:
    - If you are looking for where a specific value ends up: use `find-values.js`.
    - If you want to see the general structure of a record type: use `inspect_jump_raw.js` (modify to log other record types).
4. **Modify Script**: These scripts are meant to be hacked. Change the `file` variable or the logging logic to suit your immediate need. Don't worry about committing changes to them unless it's a useful general-purpose improvement.
