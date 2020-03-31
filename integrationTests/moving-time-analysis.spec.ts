import * as CYCLING_MOVE_STREAM from './fixtures/movingTimeAnalysis/move_cycling_strava_stream.json';
import * as RUNNING_MOVE_STREAM from './fixtures/movingTimeAnalysis/move_running_strava_stream.json';

describe('Moving time analysis from strava based velocity and rest streams', () => {


  it('should find cycling rest speed threshold', done => {
    // Stream URL: https://www.strava.com/activities/2621275265/streams?stream_types%5B%5D=velocity_smooth&stream_types%5B%5D=resting

    const restSpeeds: number[] = [];
    CYCLING_MOVE_STREAM.velocity_smooth.forEach((meterPerSec, index) => {
      const isResting = CYCLING_MOVE_STREAM.resting[index];
      if (isResting) {
        restSpeeds.push(meterPerSec)
      }
    });

    const maxRestingSpeed = Math.max.apply(null, restSpeeds);
    console.log('Cycling rest speed threshold in meter per seconds: ' + maxRestingSpeed);
    console.log('Cycling rest speed threshold in kilometers per hours: ' + (maxRestingSpeed * 3.6));
    done();
  });


  it('should find running rest speed threshold', done => {

    const restSpeeds: number[] = [];
    RUNNING_MOVE_STREAM.velocity_smooth.forEach((meterPerSec, index) => {
      const isResting = RUNNING_MOVE_STREAM.resting[index];
      if (isResting) {
        restSpeeds.push(meterPerSec)
      }
    });

    const maxRestingSpeed = Math.max.apply(null, restSpeeds);
    console.log('Running rest speed threshold in meter per seconds: ' + maxRestingSpeed);
    console.log('Running rest speed threshold in kilometers per hours: ' + (maxRestingSpeed * 3.6));
    done();
  });

});
