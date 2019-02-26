import { DataPause } from '../data/data.pause';
import { DataDuration } from '../data/data.duration';
export interface DurationClassInterface {
    startDate: Date;
    endDate: Date;
    getDuration(): DataDuration;
    getPause(): DataPause;
    setDuration(duration: DataDuration): void;
    setPause(pause: DataPause): void;
}
