using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Omnia.Fx.Caching;
using Omnia.Fx.Contexts;
using Omnia.Fx.Messaging;
using Omnia.Fx.Users;
using Omnia.ProcessManagement.Core.Repositories.ProcessTypes;
using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessTypes
{
    internal class ProcessTypeTermSynchronizationTrackingService : IProcessTypeTermSynchronizationTrackingService
    {
        private IOmniaUserTokenProvider OmniaUserTokenProvider { get; }
        private IProcessTypeTermSynchronizationTrackingRepository TrackingRepository { get; }
        private IOmniaContext OmniaContext { get; }
        private IMessageBus MessageBus { get; }
        public ProcessTypeTermSynchronizationTrackingService(IProcessTypeTermSynchronizationTrackingRepository trackingRepository,
            IOmniaUserTokenProvider omniaUserTokenProvider,
            IOmniaContext omniaContext,
            IMessageBus messageBus,
            IOmniaMemoryDependencyCache omniaMemoryDependencyCache)
        {
            MessageBus = messageBus;
            TrackingRepository = trackingRepository;
            OmniaUserTokenProvider = omniaUserTokenProvider;
            OmniaContext = omniaContext;
        }

        public async ValueTask AddTrackingResultAsync(ProcessTypeTermSynchronizationTrackingResult result)
        {
            await TrackingRepository.AddTrackingResultAsync(result);
        }

        public async ValueTask<ProcessTypeTermSynchronizationTrackingRequest> GetTrackingRequestAsync(Guid termSetId)
        {
            var request = await TrackingRepository.GetTrackingRequestAsync(termSetId);
            return request;
        }

        public async ValueTask<ProcessTypeTermSynchronizationStatus> GetSyncStatusAsync(Guid termSetId)
        {
            var status = await TrackingRepository.GetSyncStatusAsync(termSetId);
            return status;
        }

        public async ValueTask TriggerSyncAsync(Guid termSetId, bool documentTypeUpdatedInDb = true)
        {
            //Skip update to dbs for trggering sync if there is db updates already
            if (!documentTypeUpdatedInDb)
                await TrackingRepository.TriggerSyncAsync(termSetId);
            await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OmniaTokenKeyUpdatedProcessType, GetUserOmniaTokenKey());
        }

        public async ValueTask TriggerSyncFromSharePointAsync(Guid termSetId)
        {
            await TrackingRepository.TriggerSyncFromSharePointAsync(termSetId);
            await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OmniaTokenKeyUpdatedProcessType, GetUserOmniaTokenKey());
        }

        private Dictionary<string, string> GetUserOmniaTokenKey()
        {
            return new Dictionary<string, string>()
            {
                [OmniaContext.Identity.LoginName] = Base64UrlEncoder.Encode(JsonConvert.SerializeObject(OmniaUserTokenProvider.Token))
            };
        }
    }
}
