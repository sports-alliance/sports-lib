# Agent Configuration for sports-lib

This directory contains configuration, skills, and workflows for AI agents working on the `sports-lib` project.

## Structure

- **skills/**: Contains specialized "skills" (instructions + scripts) for the agent.
  - `debug-utils`: Instructions for using the project's ad-hoc FIT file debugging scripts.
- **workflows/**: Contains step-by-step guides for common tasks.
  - `add-new-data.md`: How to identify and add new data fields from FIT files.

## Usage

When asking an agent to help with debugging or adding data, you can refer them to these specific skills or workflows if they don't automatically pick them up.
- "Use the debug-utils skill to inspect this file."
- "Follow the add-new-data workflow."
