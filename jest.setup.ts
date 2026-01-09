
import { ActivityParsingOptions } from './src/activities/activity-parsing-options';

// Disable unit stream generation by default for tests to improve performance
// This creates separate arrays for km/h, mph, etc. which are expensive and rarely needed in tests
// unless specifically testing the charting logic or unit conversion.
ActivityParsingOptions.DEFAULT.generateUnitStreams = false;

console.log('Jest Setup: Disabled ActivityParsingOptions.generateUnitStreams for faster tests.');
