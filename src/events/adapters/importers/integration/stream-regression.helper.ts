import { ActivityInterface } from '../../../../activities/activity.interface';
import { EventInterface } from '../../../event.interface';

export function getPrimaryActivityForStreamRegression(event: EventInterface): ActivityInterface {
  return event
    .getActivities()
    .reduce((previous, current) =>
      previous.getDuration().getValue() > current.getDuration().getValue() ? previous : current
    );
}

export function getUniqueStreamTypes(activity: ActivityInterface): string[] {
  return Array.from(new Set(activity.getAllStreams().map(stream => stream.type)));
}

export function getDuplicateStreamTypes(activity: ActivityInterface): string[] {
  const counts = new Map<string, number>();
  activity.getAllStreams().forEach(stream => {
    counts.set(stream.type, (counts.get(stream.type) || 0) + 1);
  });
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([type]) => type)
    .sort((a, b) => a.localeCompare(b));
}
