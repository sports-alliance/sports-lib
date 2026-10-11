import { DataEvent } from '../../data/data.event';
import { DataStartEvent } from '../../data/data.start-event';
import { DataStopEvent } from '../../data/data.stop-event';
import { DataStopAllEvent } from '../../data/data.stop-all-event';

/** Rolling NP on the library's one-second power grid. Missing seconds are unknown,
 * not zero or carried-forward power. Require a complete 30-second window, restarting
 * at gaps, invalid samples, nonconsecutive timestamps and explicit timer boundaries.
 * Sparse recordings can retain device-supplied NP; no resampling is invented here. */
export function calculateNormalizedPower(power: number[], seconds: number[], events: DataEvent[] = []): number {
  const timer = events.filter(event => Number.isFinite(event.timestamp) &&
    [DataStartEvent.type, DataStopEvent.type, DataStopAllEvent.type].includes(event.getType()))
    .slice().sort((a, b) => a.timestamp - b.timestamp);
  const window = new Array<number>(30);
  let count = 0, cursor = 0, sum = 0, fourthSum = 0, windows = 0;
  let previous = NaN, timerIndex = 0, running = true;
  const reset = () => { count = 0; cursor = 0; sum = 0; };
  for (let index = 0; index < seconds.length; index++) {
    const time = seconds[index], value = power[index];
    while (timerIndex < timer.length && timer[timerIndex].timestamp <= time) {
      const nextRunning = timer[timerIndex++].getType() === DataStartEvent.type;
      if (nextRunning !== running) reset();
      running = nextRunning;
    }
    if (!Number.isFinite(time) || time < 0 || !Number.isFinite(value) || value < 0 || !running) {
      reset(); previous = NaN; continue;
    }
    if (!Number.isFinite(previous) || Math.abs(time - previous - 1) > 1e-6) reset();
    previous = time;
    if (count === 30) sum -= window[cursor];
    else count++;
    window[cursor] = value; cursor = (cursor + 1) % 30; sum += value;
    if (count === 30) { fourthSum += Math.pow(Math.max(0, sum) / 30, 4); windows++; }
  }
  return windows ? Math.pow(fourthSum / windows, 0.25) : NaN;
}
