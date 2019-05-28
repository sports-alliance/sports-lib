export interface QueueItem {
  userName: string,
  workoutID: string,
  retryCount: number,
  totalRetryCount: number,
  processed: false,
  errors: QueueItemError[],
  processedAt: string
}

export interface QueueItemError {
  date: string,
  error: string,
  atRetryCount: string
}
