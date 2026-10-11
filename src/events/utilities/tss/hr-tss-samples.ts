import { DataEvent } from '../../../data/data.event';
import { DataStartEvent } from '../../../data/data.start-event';
import { DataStopEvent } from '../../../data/data.stop-event';
import { DataStopAllEvent } from '../../../data/data.stop-all-event';

interface HeartRateSample {
  duration: number;
  value: number;
}

/** Put HR samples on the timer-active clock before TRIMP integration. Samples at a
 * stop boundary may close the preceding active interval; samples inside a pause
 * cannot supply HR. Removing paused time also handles recordings with no samples
 * during a pause. Without explicit timer events, retain elapsed-time integration. */
export function getHeartRateSamplesWithoutPauses(samples: HeartRateSample[], events: DataEvent[]): HeartRateSample[] {
  const timer = events.filter(event => Number.isFinite(event.timestamp) &&
    [DataStartEvent.type, DataStopEvent.type, DataStopAllEvent.type].includes(event.getType()))
    .slice().sort((a, b) => a.timestamp - b.timestamp);
  const result: HeartRateSample[] = [];
  let running = true, previousTime = 0, activeTime = 0, timerIndex = 0;
  for (const sample of samples.filter(sample => Number.isFinite(sample.duration) && sample.duration >= 0 &&
    Number.isFinite(sample.value) && sample.value > 0).sort((a, b) => a.duration - b.duration)) {
    let closesActiveInterval = false;
    while (timerIndex < timer.length && timer[timerIndex].timestamp <= sample.duration) {
      const event = timer[timerIndex++], time = Math.max(0, event.timestamp);
      const nextRunning = event.getType() === DataStartEvent.type;
      if (running) activeTime += time - previousTime;
      if (running && !nextRunning && time === sample.duration && activeTime > 0) closesActiveInterval = true;
      previousTime = time;
      running = nextRunning;
    }
    if (running) activeTime += sample.duration - previousTime;
    previousTime = sample.duration;
    if (running || closesActiveInterval) result.push({ duration: activeTime, value: sample.value });
  }
  return result;
}
