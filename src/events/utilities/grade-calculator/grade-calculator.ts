export const CLAMP = 50;
export const LOOK_AHEAD_IN_METERS = 10;

export class GradeCalculator {
  public static computeGradeStream(
    timeStream: (number | null)[],
    distanceStream: (number | null)[],
    altitudeStream: (number | null)[],
    aheadMeters = LOOK_AHEAD_IN_METERS,
    clamp = CLAMP
  ): (number | null)[] {
    const [squashedAlignedTime, squashedAlignedDist, squashedAlignedAlt] = GradeCalculator.squashAlignStreams(
      timeStream,
      distanceStream,
      altitudeStream
    );

    const squashedAlignedGrade = [];
    let indexNow = 0;
    do {
      // Remove first index of distances & altitudes stream at every loop
      const aheadDistances = squashedAlignedDist.slice(indexNow);
      const aheadAltitudes = squashedAlignedAlt.slice(indexNow);

      // Take our current distance travelled & altitude
      const distanceNow = aheadDistances[0];
      const altitudeNow = aheadAltitudes[0];

      // Find ahead index matching minimal distance travelled
      let aheadIndex = aheadDistances.findIndex(dist => distanceNow + aheadMeters <= dist);

      // Validate we find an index with distance ahead for sure, else use last index of ahead distances
      aheadIndex = aheadIndex >= 0 ? aheadIndex : aheadDistances.length - 1;

      // Compute deltas & grade
      const aheadDeltaDistance = aheadDistances[aheadIndex] - distanceNow;
      const aheadDeltaAltitude = aheadAltitudes[aheadIndex] - altitudeNow;

      const aheadGrade =
        aheadDeltaDistance > 0 ? Math.min(Math.max((aheadDeltaAltitude / aheadDeltaDistance) * 100, -clamp), clamp) : 0;

      squashedAlignedGrade.push(Math.round(aheadGrade * 10) / 10);

      indexNow++;
    } while (indexNow < squashedAlignedTime.length);

    // Rebuild grade stream with empty values using computed squashed/aligned time & grade streams
    const gradeStream = Array(altitudeStream.length).fill(null);
    for (const [index, seconds] of squashedAlignedTime.entries()) {
      gradeStream[seconds as number] = squashedAlignedGrade[index];
    }

    return gradeStream;
  }

  /**
   * Repair distance and altitude streams based on time streams
   * @param timeData
   * @param distanceData
   * @param altitudeData
   */
  public static squashAlignStreams(
    timeData: (number | null)[],
    distanceData: (number | null)[],
    altitudeData: (number | null)[]
  ) {
    const squashedAlignedTime: number[] = [];
    const squashedAlignedDist: number[] = [];
    const squashedAlignedAlt: number[] = [];

    let lastKnownDistance = distanceData.find(dist => Number.isFinite(dist));
    let lastKnownAlt = altitudeData.find(alt => Number.isFinite(alt));

    timeData.forEach((seconds, index) => {
      // If we have time data
      if (Number.isFinite(seconds)) {
        if (Number.isFinite(distanceData[index]) && Number.isFinite(altitudeData[index])) {
          // If we have finite distance and altitude, store values
          squashedAlignedTime.push(seconds as number);
          squashedAlignedDist.push(distanceData[index] as number);
          squashedAlignedAlt.push(altitudeData[index] as number);

          // Then track last known dist and alt
          lastKnownDistance = distanceData[index];
          lastKnownAlt = altitudeData[index];
        } else if (!Number.isFinite(distanceData[index]) && Number.isFinite(altitudeData[index])) {
          // If only altitude is finite, then store altitude, and use last known distance instead of empty distance
          squashedAlignedTime.push(seconds as number);
          squashedAlignedDist.push(lastKnownDistance as number);
          squashedAlignedAlt.push(altitudeData[index] as number);

          // Then track last known alt
          lastKnownAlt = altitudeData[index];
        } else if (Number.isFinite(distanceData[index]) && !Number.isFinite(altitudeData[index])) {
          // If only distance is finite, then store distance, and use last known altitude instead of empty altitude
          squashedAlignedTime.push(seconds as number);
          squashedAlignedDist.push(distanceData[index] as number);
          squashedAlignedAlt.push(lastKnownAlt as number);

          // Then track last known distance
          lastKnownDistance = distanceData[index];
        } else {
          // Do nothing. Don't store any time or distance data
        }
      } else {
        // Do nothing. Don't store any time or distance data
      }
    });

    return [squashedAlignedTime, squashedAlignedDist, squashedAlignedAlt];
  }

  /**
   * Contains a 5th order equation which models the Strava GAP behavior described on picture "./strava_gap_modelization.png"
   * ------------------------------------------------------------------------------------
   * Get Real Strava Premium Grade Adjusted Pace on every strava activities with below gist
   * https://gist.github.com/thomaschampagne/2781dce212d12cd048728e70ae791a30
   * ------------------------------------------------------------------------------------
   *
   * This Strava GAP behavior is described by the below data
   * [{ grade: -34, speedFactor: 1.7 }, { grade: -32, speedFactor: 1.6 }, { grade: -30, speedFactor: 1.5 },
   * { grade: -28, speedFactor: 1.4 }, { grade: -26, speedFactor: 1.3 }, { grade: -24, speedFactor: 1.235 },
   * { grade: -22, speedFactor: 1.15 }, { grade: -20, speedFactor: 1.09 }, { grade: -18, speedFactor: 1.02 },
   * { grade: -16, speedFactor: 0.95 }, { grade: -14, speedFactor: 0.91 }, { grade: -12, speedFactor: 0.89 },
   * { grade: -10, speedFactor: 0.88 }, { grade: -8, speedFactor: 0.88 }, { grade: -6, speedFactor: 0.89 },
   * { grade: -4, speedFactor: 0.91 }, { grade: -2, speedFactor: 0.95 }, { grade: 0, speedFactor: 1 },
   * { grade: 2, speedFactor: 1.05 }, { grade: 4, speedFactor: 1.14 }, { grade: 6, speedFactor: 1.24 },
   * { grade: 8, speedFactor: 1.34 }, { grade: 10, speedFactor: 1.47 }, { grade: 12, speedFactor: 1.5 },
   * { grade: 14, speedFactor: 1.76 }, { grade: 16, speedFactor: 1.94 }, { grade: 18, speedFactor: 2.11 },
   * { grade: 20, speedFactor: 2.3 }, { grade: 22, speedFactor: 2.4 }, { grade: 24, speedFactor: 2.48 },
   * { grade: 26, speedFactor: 2.81 }, { grade: 28, speedFactor: 3 }, { grade: 30, speedFactor: 3.16 },
   * { grade: 32, speedFactor: 3.31 }, { grade: 34, speedFactor: 3.49 } ]
   *
   * The 5th order equation has been curve fitted using plot.ly
   */
  public static estimateAdjustedSpeed(speedMeterSeconds: number, grade: number): number {
    const kA = 1;
    const kB = 0.029290920646623777;
    const kC = 0.0018083953212790634;
    const kD = 4.0662425671715924e-7;
    const kE = -3.686186584867523e-7;
    const kF = -2.6628107325930747e-9;
    const speedAdjust =
      kA +
      kB * grade +
      kC * Math.pow(grade, 2) +
      kD * Math.pow(grade, 3) +
      kE * Math.pow(grade, 4) +
      kF * Math.pow(grade, 5);
    return speedMeterSeconds * speedAdjust;
  }
}
