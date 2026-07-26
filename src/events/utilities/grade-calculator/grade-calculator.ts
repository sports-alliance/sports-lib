export const CLAMP = 50;
export const LOOK_AHEAD_IN_METERS = 10;

type AheadIndexFinder = (startIndex: number) => number;

const isFiniteNonDecreasing = (values: number[]): boolean => {
  if (!values.length) {
    return true;
  }

  if (!Number.isFinite(values[0])) {
    return false;
  }

  for (let index = 1; index < values.length; index++) {
    if (!Number.isFinite(values[index]) || values[index] < values[index - 1]) {
      return false;
    }
  }
  return true;
};

/**
 * Finds the first finite value at or after a requested index that reaches a threshold.
 *
 * A max segment tree keeps this lookup O(log n) for corrupt/non-monotonic distance
 * streams while preserving Array.findIndex's first-match behavior.
 */
class FirstDistanceAtLeastIndex {
  private readonly length: number;
  private readonly treeSize: number;
  private readonly maximums: Array<number | undefined>;

  constructor(values: number[]) {
    this.length = values.length;
    this.treeSize = this.getTreeSize(values.length);
    this.maximums = Array(this.treeSize * 2).fill(undefined);

    values.forEach((value, index) => {
      if (Number.isFinite(value)) {
        this.maximums[this.treeSize + index] = value;
      }
    });

    for (let node = this.treeSize - 1; node > 0; node--) {
      const left = this.maximums[node * 2];
      const right = this.maximums[node * 2 + 1];
      this.maximums[node] = left === undefined ? right : right === undefined ? left : Math.max(left, right);
    }
  }

  public findFirst(startIndex: number, threshold: number): number {
    return this.findFirstInNode(1, 0, this.treeSize, startIndex, threshold);
  }

  private getTreeSize(length: number): number {
    let size = 1;
    while (size < length) {
      size *= 2;
    }
    return size;
  }

  private findFirstInNode(
    node: number,
    leftIndex: number,
    rightIndex: number,
    startIndex: number,
    threshold: number
  ): number {
    const maximum = this.maximums[node];
    if (rightIndex <= startIndex || maximum === undefined || !(threshold <= maximum)) {
      return -1;
    }

    if (rightIndex - leftIndex === 1) {
      return leftIndex < this.length ? leftIndex : -1;
    }

    const middleIndex = (leftIndex + rightIndex) >> 1;
    const leftResult = this.findFirstInNode(node * 2, leftIndex, middleIndex, startIndex, threshold);
    return leftResult >= 0
      ? leftResult
      : this.findFirstInNode(node * 2 + 1, middleIndex, rightIndex, startIndex, threshold);
  }
}

const createAheadIndexFinder = (distances: number[], aheadMeters: number): AheadIndexFinder => {
  const lastIndex = distances.length - 1;

  if (isFiniteNonDecreasing(distances)) {
    let aheadIndex = 0;
    return (startIndex: number): number => {
      aheadIndex = Math.max(aheadIndex, startIndex);
      const threshold = distances[startIndex] + aheadMeters;
      while (aheadIndex < distances.length && !(threshold <= distances[aheadIndex])) {
        aheadIndex++;
      }
      return aheadIndex < distances.length ? aheadIndex : lastIndex;
    };
  }

  const distanceIndex = new FirstDistanceAtLeastIndex(distances);
  return (startIndex: number): number => {
    const matchIndex = distanceIndex.findFirst(startIndex, distances[startIndex] + aheadMeters);
    return matchIndex >= 0 ? matchIndex : lastIndex;
  };
};

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
    const findAheadIndex = createAheadIndexFinder(squashedAlignedDist, aheadMeters);
    for (let indexNow = 0; indexNow < squashedAlignedTime.length; indexNow++) {
      const distanceNow = squashedAlignedDist[indexNow];
      const altitudeNow = squashedAlignedAlt[indexNow];
      const aheadIndex = findAheadIndex(indexNow);

      // Compute deltas & grade
      const aheadDeltaDistance = squashedAlignedDist[aheadIndex] - distanceNow;
      const aheadDeltaAltitude = squashedAlignedAlt[aheadIndex] - altitudeNow;

      const aheadGrade =
        aheadDeltaDistance > 0 ? Math.min(Math.max((aheadDeltaAltitude / aheadDeltaDistance) * 100, -clamp), clamp) : 0;

      squashedAlignedGrade.push(Math.round(aheadGrade * 10) / 10);
    }

    // Rebuild grade stream with empty values using computed squashed/aligned time & grade streams
    const gradeStream = Array(altitudeStream.length).fill(null);
    for (const [index, seconds] of squashedAlignedTime.entries()) {
      gradeStream[seconds as number] = squashedAlignedGrade[index];
    }

    return gradeStream;
  }

  public static computeGradeStreamByDistance(
    distanceStream: (number | null)[],
    altitudeStream: (number | null)[],
    aheadMeters = LOOK_AHEAD_IN_METERS,
    clamp = CLAMP
  ): (number | null)[] {
    const squashedAlignedPoints = GradeCalculator.squashAlignDistanceAltitudeStreams(distanceStream, altitudeStream);
    const gradeStream = Array(Math.max(distanceStream.length, altitudeStream.length)).fill(null);
    if (!squashedAlignedPoints.length) {
      return gradeStream;
    }

    const squashedAlignedGrade = [];
    const findAheadIndex = createAheadIndexFinder(
      squashedAlignedPoints.map(point => point.distance),
      aheadMeters
    );
    for (let indexNow = 0; indexNow < squashedAlignedPoints.length; indexNow++) {
      const pointNow = squashedAlignedPoints[indexNow];
      const aheadPoint = squashedAlignedPoints[findAheadIndex(indexNow)];
      const aheadDeltaDistance = aheadPoint.distance - pointNow.distance;
      const aheadDeltaAltitude = aheadPoint.altitude - pointNow.altitude;

      const aheadGrade =
        aheadDeltaDistance > 0 ? Math.min(Math.max((aheadDeltaAltitude / aheadDeltaDistance) * 100, -clamp), clamp) : 0;

      squashedAlignedGrade.push(Math.round(aheadGrade * 10) / 10);
    }

    for (const [index, point] of squashedAlignedPoints.entries()) {
      gradeStream[point.index] = squashedAlignedGrade[index];
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

  public static squashAlignDistanceAltitudeStreams(
    distanceData: (number | null)[],
    altitudeData: (number | null)[]
  ): { index: number; distance: number; altitude: number }[] {
    const squashedAlignedPoints: { index: number; distance: number; altitude: number }[] = [];

    let lastKnownDistance: number | null = null;
    let lastKnownAlt: number | null = null;

    Array.from({ length: Math.max(distanceData.length, altitudeData.length) }).forEach((_value, index) => {
      const distance = distanceData[index];
      const altitude = altitudeData[index];

      if (Number.isFinite(distance) && Number.isFinite(altitude)) {
        squashedAlignedPoints.push({
          index,
          distance: distance as number,
          altitude: altitude as number
        });
        lastKnownDistance = distance;
        lastKnownAlt = altitude;
      } else if (!Number.isFinite(distance) && Number.isFinite(altitude) && Number.isFinite(lastKnownDistance)) {
        squashedAlignedPoints.push({
          index,
          distance: lastKnownDistance as number,
          altitude: altitude as number
        });
        lastKnownAlt = altitude;
      } else if (Number.isFinite(distance) && !Number.isFinite(altitude) && Number.isFinite(lastKnownAlt)) {
        squashedAlignedPoints.push({
          index,
          distance: distance as number,
          altitude: lastKnownAlt as number
        });
        lastKnownDistance = distance;
      }
    });

    return squashedAlignedPoints;
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
