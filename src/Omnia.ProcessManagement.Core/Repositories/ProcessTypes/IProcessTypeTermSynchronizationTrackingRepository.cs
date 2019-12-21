using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.ProcessTypes
{
    internal interface IProcessTypeTermSynchronizationTrackingRepository
    {
        ValueTask AddTrackingResultAsync(ProcessTypeTermSynchronizationTrackingResult result);
        ValueTask<ProcessTypeTermSynchronizationTrackingRequest> GetTrackingRequestAsync(Guid rootId);
        ValueTask<ProcessTypeTermSynchronizationStatus> GetSyncStatusAsync(Guid rootId);
        ValueTask TriggerSyncAsync(Guid rootId);
        ValueTask TriggerSyncFromSharePointAsync(Guid rootId);
    }
}
