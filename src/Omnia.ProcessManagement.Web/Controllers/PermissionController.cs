using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Apps;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Models.Users;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Helpers.ProcessQueries;
using Omnia.ProcessManagement.Core.Helpers.Security;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.ProcessLibrary;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.TeamCollaborationApps;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.Security;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/opmpermissions")]
    [ApiController]
    public class PermissionController : ControllerBase
    {
        ILogger<ProcessController> Logger { get; }
        IProcessService ProcessService { get; }
        IProcessSecurityService ProcessSecurityService { get; }
        ISharePointClientContextProvider SharePointClientContextProvider { get; }
        ITeamCollaborationAppsService TeamCollaborationAppService { get; }

        public PermissionController(IProcessService processService, ILogger<ProcessController> logger,
            IProcessSecurityService processSecurityService, ITeamCollaborationAppsService teamCollaborationAppService,
            ISharePointClientContextProvider sharePointClientContextProvider)
        {
            ProcessService = processService;
            ProcessSecurityService = processSecurityService;
            TeamCollaborationAppService = teamCollaborationAppService;
            SharePointClientContextProvider = sharePointClientContextProvider;
            Logger = logger;
        }

        [HttpPost, Route("")]
        [Authorize]
        public async ValueTask<ApiResponse> AddOrUpdateOPMAuthorAndDefaultReaderAsync([FromBody] AuthorAndDefaultReaderUpdateInput updateInput)
        {
            try
            {
                return await ProcessSecurityService.InitSecurityResponseByTeamAppId(updateInput.TeamAppId)
                    .RequireTeamAppAdmin()
                    .OrRequireAuthor()
                    .DoAsync(async () =>
                    {
                        var spUrl = await TeamCollaborationAppService.GetSharePointSiteUrlAsync(updateInput.TeamAppId);
                        var ctx = SharePointClientContextProvider.CreateClientContext(spUrl, true);
                        await ProcessSecurityService.AddOrUpdateOPMAuthorAndDefaultReaderAsync(ctx, updateInput);
                        return ApiUtils.CreateSuccessResponse();
                    });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }
    }
}