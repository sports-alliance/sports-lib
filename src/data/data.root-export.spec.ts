import * as RootExports from '../index';
import * as DataExports from './index';
import { DataStore } from './data.store';

describe('Root data exports parity', () => {
  // Explicit allowlist for intentionally store-only entries.
  const ROOT_EXPORT_ALLOWLIST = new Set<string>([]);

  it('exports each DataStore entry from package root', () => {
    Object.keys(DataStore).forEach(key => {
      if (ROOT_EXPORT_ALLOWLIST.has(key)) {
        return;
      }

      expect(Object.prototype.hasOwnProperty.call(RootExports, key)).toBe(true);
      expect((RootExports as Record<string, unknown>)[key]).toBe((DataStore as Record<string, unknown>)[key]);
    });
  });

  it('exports each DataStore entry from data barrel', () => {
    Object.keys(DataStore).forEach(key => {
      if (ROOT_EXPORT_ALLOWLIST.has(key)) {
        return;
      }

      expect(Object.prototype.hasOwnProperty.call(DataExports, key)).toBe(true);
      expect((DataExports as Record<string, unknown>)[key]).toBe((DataStore as Record<string, unknown>)[key]);
    });
  });
});
