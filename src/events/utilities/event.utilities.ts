import { EventInterface } from '../event.interface';
import { ActivityInterface } from '../../activities/activity.interface';
import { Event } from '../event';
import { DataActivityTypes } from '../../data/data.activity-types';
import { DataDeviceNames } from '../../data/data.device-names';
import { Privacy } from '../../privacy/privacy.class.interface';
import { DataDescription } from '../../data/data.description';
import { ActivityUtilities } from './activity.utilities';
import { DataPowerCurve, DataPowerCurvePoint } from '../../data/data.power-curve';
import { DataDuration } from '../../data/data.duration';
import { DataPower } from '../../data/data.power';
import { DataPowerWattsPerKg } from '../../data/data.power-watts-per-kg';
import { normalizeActivityMetricSemanticsForStats } from '../../activities/activity.metric-semantics';

export class EventUtilities {
  public static mergeEvents(events: EventInterface[]): EventInterface {
    events.sort((eventA: EventInterface, eventB: EventInterface) => {
      return +eventA.getFirstActivity().startDate - +eventB.getFirstActivity().startDate;
    });
    const activities = events
      .reduce((activitiesArray: ActivityInterface[], event) => {
        activitiesArray.push(...event.getActivities());
        return activitiesArray;
      }, [])
      .map(activity => {
        return activity.setID(null);
      });
    const event = new Event(
      `Merged at ${new Date().toISOString()}`,
      activities[0].startDate,
      activities[activities.length - 1].endDate,
      events[0].srcFileType,
      Privacy.Private,
      `A merge of 2 or more activities `,
      true
    );
    event.addActivities(activities);
    this.generateStatsForAll(event);
    return event;
  }

  public static generateStatsForAll(event: EventInterface) {
    // First generate that stats on the activity it self
    event.getActivities().forEach((activity: ActivityInterface) => {
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    });
    this.reGenerateStatsForEvent(event);
  }

  /**
   * Regenerates event-level stats from the current in-memory event state.
   *
   * Important behavior:
   * - Clears ONLY event stats (`event.clearStats()`).
   * - Does NOT clear activity stats.
   * - Does NOT read the original imported file (FIT/TCX/GPX/etc.); raw source payload is not retained.
   *
   * Regeneration model:
   * - Single-activity event: copies current summary-eligible activity stats into the event.
   * - Multi-activity event: recomputes event summary stats from activity stats and aggregates power curves.
   * - The resulting event summary is canonicalized for its contributing activity types. In particular, an
   *   all-Diving-group event omits terrain ascent/descent, altitude, and grade summaries; mixed events aggregate
   *   those summaries only from their non-diving activities.
   *
   * Interaction with `generateStatsForAll(event)`:
   * - `generateStatsForAll` calls activity generation first (`generateMissingStreamsAndStatsForActivity`),
   *   then calls this method.
   * - Activity generation is "fill missing", not "replace existing": applicable activity stats are preserved.
   * - If activity stats were cleared or removed by caller code before regeneration, missing stats are recomputed
   *   from streams (for example, Average Speed from speed stream mean, Ascent from altitude gain).
   *
   * Distance behavior:
   * - Event distance is rebuilt from activities during event summarization.
   * - Activity distance is recomputed only when missing or equal to zero (in activity generation path).
   */
  public static reGenerateStatsForEvent(event: EventInterface) {
    event.clearStats();
    event.startDate = event.getFirstActivity().startDate;
    event.endDate = event.getLastActivity().endDate;
    const activities = event.getActivities();
    const activityTypes = activities.map(activity => activity.type);

    event.addStat(new DataActivityTypes(activityTypes));
    event.addStat(new DataDeviceNames(activities.map(activity => activity.creator.name)));

    // If only one
    if (activities.length === 1) {
      const firstActivity = activities[0];
      ActivityUtilities.getSummaryStatsForActivities([firstActivity]).forEach(stat => {
        event.addStat(stat);
      });

      if (firstActivity.powerCurve) {
        event.powerCurve = firstActivity.powerCurve;
      }

      // Add the description
      const description = event.getStat(DataDescription.type);
      if (description && description.getValue()) {
        event.description = <string>description.getValue();
      }
    } else {
      // Standard stat summarization
      ActivityUtilities.getSummaryStatsForActivities(activities).forEach(stat => event.addStat(stat));

      // Special handling for Power Curve Aggregation
      this.aggregatePowerCurves(event);
    }

    normalizeActivityMetricSemanticsForStats(event, activityTypes);
  }

  private static aggregatePowerCurves(event: EventInterface): void {
    const activities = event.getActivities();
    if (activities.length <= 1) return; // Already handled by single activity logic or no need to merge

    // Map duration (seconds) -> { maxPower: number, maxWKg: number }
    const mergedCurve = new Map<number, { maxPower: number; maxWKg: number }>();

    activities.forEach(activity => {
      const curveStat = activity.getStat(DataPowerCurve.type);
      if (curveStat && curveStat.getValue()) {
        const points = <DataPowerCurvePoint[]>(<unknown>curveStat.getValue());
        points.forEach(point => {
          const duration = point.duration.getValue();
          const power = point.power.getValue();
          const wKg = point.wattsPerKg ? point.wattsPerKg.getValue() : 0;

          if (!mergedCurve.has(duration)) {
            mergedCurve.set(duration, { maxPower: power, maxWKg: wKg });
          } else {
            const current = mergedCurve.get(duration)!;
            if (power > current.maxPower) {
              current.maxPower = power;
              // Usually max power implies max W/kg, but if weight changed mid-event, we take the W/kg associated with this power or just max W/kg?
              // Let's take max W/kg independently to be safe/best-effort.
            }
            if (wKg > current.maxWKg) {
              current.maxWKg = wKg;
            }
          }
        });
      }
    });

    if (mergedCurve.size > 0) {
      const curvePoints: DataPowerCurvePoint[] = [];
      // Sort by duration
      const sortedDurations = Array.from(mergedCurve.keys()).sort((a, b) => a - b);

      for (const duration of sortedDurations) {
        const data = mergedCurve.get(duration)!;
        const point: DataPowerCurvePoint = {
          duration: new DataDuration(duration),
          power: new DataPower(data.maxPower)
        };
        if (data.maxWKg > 0) {
          point.wattsPerKg = new DataPowerWattsPerKg(data.maxWKg);
        }
        curvePoints.push(point);
      }

      const powerCurve = new DataPowerCurve(curvePoints);
      event.addStat(<any>powerCurve);
      event.powerCurve = powerCurve;
    }
  }
}
