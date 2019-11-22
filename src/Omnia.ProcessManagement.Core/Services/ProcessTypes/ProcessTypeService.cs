using Omnia.Fx.EnterpriseProperties;
using Omnia.Fx.Models.EnterpriseProperties;
using Omnia.ProcessManagement.Core.Repositories.ProcessTypes;
using Omnia.ProcessManagement.Core.Services.ProcessTypes.Validation;
using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessTypes
{
    internal class ProcessTypeService: IProcessTypeService
    {
        private IProcessTypeRepository ProcessTypeRepository { get; }
        private IEnterprisePropertyService EnterprisePropertyService { get; }
        private ProcessTypeValidation ProcessTypeValidation { get; }
        private IProcessTypeTermSynchronizationTrackingService TrackingService { get; }
        public ProcessTypeService(IProcessTypeRepository documentTypeRepository,
            IEnterprisePropertyService enterprisePropertyService,
            ProcessTypeValidation processTypeValidation,
            IProcessTypeTermSynchronizationTrackingService trackingService)
        {
            TrackingService = trackingService;
            ProcessTypeRepository = documentTypeRepository;
            EnterprisePropertyService = enterprisePropertyService;
            ProcessTypeValidation = processTypeValidation;
        }

        public async ValueTask SyncFromSharePointAsync(List<ProcessType> processTypes)
        {
            await ProcessTypeRepository.SyncFromSharePointAsync(processTypes);
        }

        public async ValueTask<Guid> GetProcessTypeTermSetIdAsync()
        {
            Guid termSetId = Guid.Empty;

            var (enterpriseProperties, _) = await EnterprisePropertyService.GetAllAsync();
            var opmProcessType = enterpriseProperties.Where(e => e.InternalName == OPMConstants.Features.OPMDefaultProperties.ProcessType.InternalName).FirstOrDefault();
            if (opmProcessType != null && opmProcessType.Settings != null)
            {
                var taxonomyPropertySettings = opmProcessType.Settings.CastTo<TaxonomyPropertySettings>();
                if (taxonomyPropertySettings.TermSetId != Guid.Empty)
                {
                    termSetId = taxonomyPropertySettings.TermSetId;

                    var processTypes = await GetByIdAsync(termSetId);
                    var rootProcessType = processTypes.FirstOrDefault();
                    if (rootProcessType == null)
                    {
                        rootProcessType = new ProcessType();
                        rootProcessType.Id = termSetId;
                        await CreateAsync(rootProcessType);
                    }
                }
            }

            return termSetId;
        }

        public async ValueTask<IList<ProcessType>> GetByIdAsync(params Guid[] ids)
        {
            List<Guid> idsNeedToGetDirectly = new List<Guid>();
            List<ProcessType> result = new List<ProcessType>();

            foreach (var id in ids)
            {
                idsNeedToGetDirectly.Add(id);
            }

            if (idsNeedToGetDirectly.Count > 0)
            {
                var processTypes = await this.ProcessTypeRepository.GetByIdAsync(idsNeedToGetDirectly);

                foreach (var processType in processTypes)
                {
                    result.Add(processType);
                }
            }

            return result;
        }

        public async ValueTask<ProcessType> CreateAsync(ProcessType documentType)
        {
            await ProcessTypeValidation.ValidateAsync(documentType);
            var createdDocumentType = await ProcessTypeRepository.CreateAsync(documentType);

            await this.TrackingService.TriggerSyncAsync(documentType.Settings.TermSetId);
            return createdDocumentType;
        }

        public async ValueTask<ProcessType> UpdateAsync(ProcessType processType)
        {
            var processTypeChanged = new List<ProcessType>();

            await ProcessTypeValidation.ValidateAsync(processType);
            var updatedProcessType = await ProcessTypeRepository.UpdateAsync(processType);
            processTypeChanged.Add(updatedProcessType);

            await this.TrackingService.TriggerSyncAsync(updatedProcessType.Settings.TermSetId);
            return updatedProcessType;
        }

        public async ValueTask RemoveAsync(Guid id)
        {
            var removedDocumentType = await ProcessTypeRepository.RemoveAsync(id);
            await this.TrackingService.TriggerSyncAsync(removedDocumentType.Settings.TermSetId);
        }
    }
}
