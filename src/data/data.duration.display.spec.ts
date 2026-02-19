import { DataDuration } from './data.duration';

describe('DataDuration.getDisplayValue', () => {
    // ─── Label format (default) ──────────────────────────────────────────────

    describe('label format (default)', () => {
        describe('seconds only (no minutes, no hours)', () => {
            it('should show 00s for zero', () => {
                expect(new DataDuration(0).getDisplayValue()).toBe('00s');
            });

            it('should zero-pad single digit seconds', () => {
                expect(new DataDuration(5).getDisplayValue()).toBe('05s');
            });

            it('should show 59s correctly', () => {
                expect(new DataDuration(59).getDisplayValue()).toBe('59s');
            });

            it('should hide seconds when showSeconds=false', () => {
                expect(new DataDuration(45).getDisplayValue(false, false)).toBe('45s');
            });

            it('should append milliseconds when showMilliseconds=true', () => {
                expect(new DataDuration(5.5).getDisplayValue(false, true, true)).toBe('05.5s');
            });
        });

        describe('minutes (no hours)', () => {
            it('should format 1 minute exactly', () => {
                expect(new DataDuration(60).getDisplayValue()).toBe('01m 00s');
            });

            it('should format 3m 45s', () => {
                expect(new DataDuration(225).getDisplayValue()).toBe('03m 45s');
            });

            it('should format 59m 59s', () => {
                expect(new DataDuration(3599).getDisplayValue()).toBe('59m 59s');
            });

            it('should hide seconds when showSeconds=false', () => {
                expect(new DataDuration(225).getDisplayValue(false, false)).toBe('03m');
            });

            it('should append milliseconds when showMilliseconds=true', () => {
                expect(new DataDuration(225.5).getDisplayValue(false, true, true)).toBe('03m 45.5s');
            });
        });

        describe('hours (no days)', () => {
            it('should format 1 hour exactly', () => {
                expect(new DataDuration(3600).getDisplayValue()).toBe('01h 00m 00s');
            });

            it('should format 1h 4m 32s', () => {
                expect(new DataDuration(3872).getDisplayValue()).toBe('01h 04m 32s');
            });

            it('should format 23h 59m 59s', () => {
                expect(new DataDuration(86399).getDisplayValue()).toBe('23h 59m 59s');
            });

            it('should hide seconds when showSeconds=false', () => {
                expect(new DataDuration(3872).getDisplayValue(false, false)).toBe('01h 04m ');
            });
        });

        describe('days', () => {
            it('should collapse days into hours when showDays=false (default)', () => {
                expect(new DataDuration(90000).getDisplayValue()).toBe('25h 00m 00s'); // 25h exactly
            });

            it('should show days when showDays=true', () => {
                expect(new DataDuration(90000).getDisplayValue(true)).toBe('1d 01h 00m 00s');
            });

            it('should format multi-day duration correctly', () => {
                expect(new DataDuration(172861).getDisplayValue(true)).toBe('2d 00h 01m 01s'); // 2d 0h 1m 1s
            });
        });

        describe('stress / boundary inputs', () => {
            it('should handle fractional seconds without ms flag', () => {
                expect(new DataDuration(61.9).getDisplayValue()).toBe('01m 01s');
            });

            it('should handle very large durations', () => {
                // 100 hours = 360000s → showDays=false: 100h 00m 00s
                expect(new DataDuration(360000).getDisplayValue()).toBe('100h 00m 00s');
            });

            it('should handle very large durations with showDays=true', () => {
                // 360000s = 4d 4h 0m 0s
                expect(new DataDuration(360000).getDisplayValue(true)).toBe('4d 04h 00m 00s');
            });

            it('getDisplayUnit should always return empty string', () => {
                expect(new DataDuration(3872).getDisplayUnit()).toBe('');
            });
        });
    });

    // ─── Colon format ────────────────────────────────────────────────────────

    describe('colon format (useColonFormat=true)', () => {
        const colon = (s: number, ms = false) => new DataDuration(s).getDisplayValue(false, true, ms, true);

        it('should format 0s as 00:00', () => {
            expect(colon(0)).toBe('00:00');
        });

        it('should format 5s as 00:05', () => {
            expect(colon(5)).toBe('00:05');
        });

        it('should format 59s as 00:59', () => {
            expect(colon(59)).toBe('00:59');
        });

        it('should format 1m as 01:00', () => {
            expect(colon(60)).toBe('01:00');
        });

        it('should format 3m 45s as 03:45', () => {
            expect(colon(225)).toBe('03:45');
        });

        it('should format 59m 59s as 59:59', () => {
            expect(colon(3599)).toBe('59:59');
        });

        it('should format 1h 0m 0s as 1:00:00', () => {
            expect(colon(3600)).toBe('1:00:00');
        });

        it('should format 1h 4m 32s as 1:04:32', () => {
            expect(colon(3872)).toBe('1:04:32');
        });

        it('should format 23h 59m 59s as 23:59:59', () => {
            expect(colon(86399)).toBe('23:59:59');
        });

        it('should format 25h (multi-day) without showing days as 25:00:00', () => {
            expect(colon(90000)).toBe('25:00:00');
        });

        it('should append fractional seconds when showMilliseconds=true', () => {
            expect(colon(3872.5, true)).toBe('1:04:32.5');
        });

        it('should handle zero milliseconds gracefully', () => {
            expect(colon(3872.0, true)).toBe('1:04:32');
        });

        describe('stress inputs', () => {
            it('should handle very large value (100h)', () => {
                expect(colon(360000)).toBe('100:00:00');
            });

            it('should handle fractional seconds without ms flag (truncates)', () => {
                expect(colon(61.9)).toBe('01:01');
            });
        });
    });
});
