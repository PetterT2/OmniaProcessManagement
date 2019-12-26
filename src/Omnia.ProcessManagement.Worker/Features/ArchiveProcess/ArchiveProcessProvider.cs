using Omnia.Fx.Apps;
using Omnia.Fx.NetCore.Features.Attributes;
using Omnia.Fx.NetCore.Features.FeatureProviders;
using Omnia.ProcessManagement.Core;
using Omnia.ProcessManagement.Core.Services.Features;
using System;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Worker.Features.ArchiveProcess
{
    [OmniaFeature(id: OPMConstants.Features.ArchiveProcess.IdAsString)]
    internal class ArchiveProcessProvider : BaseAppFeatureProvider
    {
        IArchiveProcessFeatureService ArchiveProcessFeatureService { get; }

        public ArchiveProcessProvider(IAppService appService,
            IArchiveProcessFeatureService archiveProcessFeatureService
            ) : base(appService)
        {
            ArchiveProcessFeatureService = archiveProcessFeatureService;
        }

        protected override async Task ActivateAsync()
        {
            var spUrl = AppInstance.Properties.ContextParams.EnsureContextParamStringValue(Fx.SharePoint.Constants.Parameters.SPUrl);
            await ArchiveProcessFeatureService.ActiveFeatureAsync(spUrl, EventArg);
        }

        protected override Task DeactivateAsync(string fromVersion)
        {
            return Task.CompletedTask;
        }

        protected override async Task UpgradeAsync(string fromVersion)
        {
            var spUrl = AppInstance.Properties.ContextParams.EnsureContextParamStringValue(Fx.SharePoint.Constants.Parameters.SPUrl);
            await ArchiveProcessFeatureService.UpgradeFeatureAsync(fromVersion, spUrl, EventArg);
        }
    }
}
