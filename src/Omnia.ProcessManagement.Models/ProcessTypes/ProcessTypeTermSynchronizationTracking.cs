using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes
{
    class ProcessTypeTermSynchronizationTracking
    {
    }

    public class ProcessTypeTermSynchronizationTrackingRequest : ProcessTypeTermSynchronizationTrackingBase
    {
        public enum ProcessTypeTermSynchronizationTrackingRequestType
        {
            PendingSyncFromSharePoint = 1,
            PendingSyncToSharePoint = 2,
            Synced = 3
        }

        public class ProcessTypeTerm
        {
            public Guid Id { get; set; }
            public MultilingualString Title { get; set; }
        }

        public ProcessTypeTermSynchronizationTrackingRequestType Type { get; set; }
        public List<ProcessTypeTerm> ProcessTypeTerms { get; set; }
        public ProcessTypeTermSynchronizationTrackingResult CreateTrackingResult(bool success, string message, long milliseconds)
        {
            return new ProcessTypeTermSynchronizationTrackingResult()
            {
                Hash = Hash,
                LatestModifiedAt = LatestModifiedAt,
                Message = message,
                Success = success,
                Milliseconds = milliseconds,
                ProcessTypeRootId = ProcessTypeRootId,
                IsSyncFromSharePoint = Type == ProcessTypeTermSynchronizationTrackingRequestType.PendingSyncFromSharePoint
            };
        }
    }

    public class ProcessTypeTermSynchronizationTrackingResult : ProcessTypeTermSynchronizationTrackingBase
    {
        public bool IsSyncFromSharePoint { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }
        public long Milliseconds { get; set; }
    }

    public class ProcessTypeTermSynchronizationTrackingBase
    {
        public Guid ProcessTypeRootId { get; set; }
        public DateTimeOffset LatestModifiedAt { get; set; }
        public string Hash { get; set; }
    }
}
