export interface QueueItemInterface {
  // @todo make the optional ones not optional per sub class for garmin etc
  userName?: string,
  userID?: string
  workoutID?: string,
  activityID?: string,
  retryCount: number,
  totalRetryCount: number,
  processed: false,
  errors: QueueItemError[],
  processedAt: number
}

export interface QueueItemError {
  date: number,
  error: string,
  atRetryCount: number
}
