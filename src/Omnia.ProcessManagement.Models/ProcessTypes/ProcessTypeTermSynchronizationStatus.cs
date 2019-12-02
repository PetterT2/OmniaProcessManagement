using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes
{
    public class ProcessTypeTermSynchronizationStatus
    {
        /// <summary>
        /// Since we created DB Index base on a value in this enum, so please make sure do not changed the value enum
        /// </summary>
        public enum Statuses
        {
            Syncing = 0,
            Success = 1,
            Failed = 2,
            SkippedNotAvailableWorkingLanguages = 3
        }

        public bool SyncFromSharePoint { get; set; }
        public DateTimeOffset LatestTrackingRunTime { get; set; }
        public int LatestTrackingId { get; set; }
        public Statuses Status { get; set; }
        public long TotalSeconds { get; set; }
        public string Message { get; set; }
    }
}
