import { DataPause } from '../data/data.pause';
import { DataDuration } from '../data/data.duration';
export interface DurationClassInterface {
    startDate: Date;
    endDate: Date;
    /**
     * Returns the duration in seconds
     * (This excludes pauses)
     */
    getDuration(): DataDuration;
    /**
     * Returns the paused time
     */
    getPause(): DataPause;
    setDuration(duration: DataDuration): void;
    setPause(pause: DataPause): void;
}
