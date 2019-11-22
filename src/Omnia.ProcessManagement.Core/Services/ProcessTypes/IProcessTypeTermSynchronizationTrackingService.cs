using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessTypes
{
    public interface IProcessTypeTermSynchronizationTrackingService
    {
        ValueTask AddTrackingResultAsync(ProcessTypeTermSynchronizationTrackingResult result);
        ValueTask<ProcessTypeTermSynchronizationTrackingRequest> GetTrackingRequestAsync(Guid termSetId);
        ValueTask<ProcessTypeTermSynchronizationStatus> GetSyncStatusAsync(Guid termSetId);
        ValueTask TriggerSyncAsync(Guid termSetId, bool processTypeUpdatedInDb = true);
        ValueTask TriggerSyncFromSharePointAsync(Guid termSetId);
    }
}
