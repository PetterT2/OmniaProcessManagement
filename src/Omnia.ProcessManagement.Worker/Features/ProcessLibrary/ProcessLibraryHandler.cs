using Microsoft.Extensions.Logging;
using Omnia.Fx.Apps;
using Omnia.Fx.NetCore.Features.Attributes;
using Omnia.Fx.NetCore.Features.FeatureProviders;
using Omnia.ProcessManagement.Core;
using Omnia.ProcessManagement.Core.Services.Features;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Worker.Features.ProcessLibrary
{
    [OmniaFeature(id: OPMConstants.Features.ProcessLibrary.IdAsString)]
    internal class ProcessLibraryHandler : BaseAppFeatureProvider
    {
        ILogger<ProcessLibraryHandler> Logger { get; }
        IProcessLibraryFeatureService ProcessLibraryFeatureService { get; }

        public ProcessLibraryHandler(ILogger<ProcessLibraryHandler> logger,
            IAppService appService,
            IProcessLibraryFeatureService processLibraryFeatureService
            ) : base(appService)
        {
            Logger = logger;
            ProcessLibraryFeatureService = processLibraryFeatureService;
        }

        protected override async Task ActivateAsync()
        {
            var spUrl = AppInstance.Properties.ContextParams.EnsureContextParamStringValue(Fx.SharePoint.Constants.Parameters.SPUrl);
            await ProcessLibraryFeatureService.ActiveFeatureAsync(spUrl, EventArg);
        }

        protected override Task DeactivateAsync(string fromVersion)
        {
            return Task.CompletedTask;
        }

        protected override async Task UpgradeAsync(string fromVersion)
        {
            var spUrl = AppInstance.Properties.ContextParams.EnsureContextParamStringValue(Fx.SharePoint.Constants.Parameters.SPUrl);
            await ProcessLibraryFeatureService.UpgradeFeatureAsync(fromVersion, spUrl, EventArg);
        }

    }
}
