using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Omnia.Fx.Models.Language;
using Omnia.Fx.MultilingualTexts;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using Omnia.Fx.Users;
using Omnia.ProcessManagement.Core.Repositories.Processes;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;

namespace Omnia.ProcessManagement.Core.Services.ProcessLibrary
{
    internal class PublishProcessService : IPublishProcessService
    {
        IProcessService ProcessService { get; }
        private ISharePointClientContextProvider SharePointClientContextProvider { get; }
        private IUserService UserService { get; }

        public PublishProcessService(IProcessService processService,
            ISharePointClientContextProvider sharePointClientContextProvider,
            IUserService userService)
        {
            ProcessService = processService;
            SharePointClientContextProvider = sharePointClientContextProvider;
            UserService = userService;
        }

        public async ValueTask PublishProcessAsync(PublishProcessWithoutApprovalRequest request)
        {
            var process = await ProcessService.PublishProcessAsync(request.OPMProcessId, request.Comment, request.IsRevisionPublishing);
        }

        public async ValueTask PublishProcessWithApprovalAsync(PublishProcessWithApprovalRequest request)
        {
            var process = await ProcessService.PublishProcessAsync(request.OPMProcessId, request.Comment, request.IsRevisionPublishing);

        }
    }
}
