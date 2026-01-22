---
description: How to add new data types and fields from FIT files to the sports-lib project.
---

# Workflow: Add New Data from FIT Files

This workflow guides you through the process of adding support for new data fields or messages from FIT files into `sports-lib`.

## Prerequisites
- A sample `.fit` file containing the new data.
- Knowledge of the value you expect to find (optional but helpful).

## Steps

### 1. Verification of Raw Data
Before writing code, verify the data exists and understand its structure.
1. Use `find-values.js` if you know a specific number (e.g., "I know my max HR was 185").
   - Edit `find-values.js` to point to your sample file and search for `185`.
   - Run `node find-values.js`.
2. Use simple inspection scripts like `inspect_jump_raw.js` to dump specific sections.
   - Edit the script to log `data.my_new_record_type` (e.g., `data.record`, `data.session`).
   - Run `node inspect_jump_raw.js`.

### 2. Update `fit-file-parser` (External Dependency)
**Note**: This project uses `fit-file-parser`.
- If the field is missing entirely from the JSON output of the parser, you may need to check the `fit-parser` configuration or definition files.
- Ensure the `profile.csv` or internal mappings in `fit-file-parser` support the new field.
- *For this project context*: We assume the parser gives us the raw field, usually in snake_case.

### 3. Create or Update Data Class in `sports-lib`
1. Navigate to `src/data/`.
2. Check if a relevant class exists.
   - If adding a field to an existing category (e.g., a new heart rate metric), update `src/data/heart-rate/data.heart-rate.ts` etc.
   - If it's a new domain (e.g., "Grit" or "Flow"), create a new file/class (e.g., `src/data/mtb/data.grit.ts`).
3. Define the class extending `Data` or a subclass.
   - Implement `getValue()`, `getDisplayValue()`, etc.
   - Add unit tests for the data class.

### 4. Map in `importer.fit.ts`
1. Open `src/events/adapters/importers/fit/importer.fit.ts`.
2. Locate the relevant processing loop (e.g., `processRecords`, `processSession`, `processLap`).
3. map the raw FIT field to your new Data class.
   ```typescript
   // Example inside a processing loop
   if (record.my_new_field != null) {
       this.addData(new DataMyNewField(record.my_new_field));
   }
   ```

### 5. Verify
1. Run `npm test`.
2. Create a specific test case in `src/events/adapters/importers/fit/importer.fit.spec.ts` (or a specific spec file) that loads your sample FIT file and asserts the data is present.

// turbo
### 6. Clean Up
- Revert any temporary changes to the debug scripts (`find-values.js` etc.) unless they are useful for future debugging.
