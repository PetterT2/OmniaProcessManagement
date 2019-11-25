export enum ProcessTypeTermSynchronizationStatusStatuses {
    Syncing = 0,
    Success = 1,
    Failed = 2
}

export interface ProcessTypeTermSynchronizationStatus {
    latestTrackingId: number;
    status: ProcessTypeTermSynchronizationStatusStatuses;
    latestTrackingRunTime: Date;
    totalSeconds: number;
    message: string;
    syncFromSharePoint: boolean;
}