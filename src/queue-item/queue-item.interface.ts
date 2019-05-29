export interface QueueItemInterface {
  userName: string,
  workoutID: string,
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
