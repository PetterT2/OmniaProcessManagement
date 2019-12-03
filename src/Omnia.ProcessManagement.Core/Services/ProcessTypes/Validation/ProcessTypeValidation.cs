using Omnia.Fx.EnterpriseProperties;
using Omnia.Fx.EnterprisePropertySets;
using Omnia.Fx.Models.Extensions;
using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessTypes.Validation
{
    internal class ProcessTypeValidation
    {
        private IEnterprisePropertySetService EnterprisePropertySetService { get; }
        private IEnterprisePropertyService EnterprisePropetyService { get; }

        public ProcessTypeValidation(IEnterprisePropertySetService enterprisePropertySetService,
            IEnterprisePropertyService enterprisePropetyService)
        {
            EnterprisePropetyService = enterprisePropetyService;
            EnterprisePropertySetService = enterprisePropertySetService;
        }

        internal async ValueTask ValidateAsync(ProcessType processType)
        {
            if (processType.Settings == null)
            {
                throw new Exception("ProcessType.Settings cannot be null");
            }

            if (processType.Settings.TermSetId == Guid.Empty)
            {
                throw new Exception("ProcessType.TermSetId is invalid");
            }


            if (processType.Settings.Type == ProcessTypeSettingsTypes.Item)
            {
                if (!processType.ParentId.HasValue)
                    throw new Exception("ProcessType.ParentId is invalid");

                var (properties, dependencyCache) = await EnterprisePropetyService.GetAllAsync();
                var itemSettings = CleanSettingsModel<ProcessTypeItemSettings>(processType);

                var set = await EnterprisePropertySetService.GetByIdAsync(itemSettings.EnterprisePropertySetId);

                ProcessTypeItemSettingsValidation.Validate(itemSettings, properties, set);

                if (itemSettings.PublishingApprovalSettings != null)
                {
                    itemSettings.PublishingApprovalSettings = PublishingApprovalSettingsValidation.Validate(itemSettings.PublishingApprovalSettings, set);
                }
            }
            else
            {
                var groupSettings = CleanSettingsModel<ProcessTypeGroupSettings>(processType);
            }
        }

        private T CleanSettingsModel<T>(ProcessType processType) where T : ProcessTypeSettings, new()
        {
            var settings = processType.Settings.Cast<ProcessTypeSettings, T>();
            if (settings.AdditionalProperties != null)
            {
                settings.AdditionalProperties.Clear();
            }
            processType.Settings = settings;
            return settings;
        }
    }
}
