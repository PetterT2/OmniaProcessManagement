using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Services.ProcessLibrary;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/unpublish")]
    [ApiController]
    public class UnpublishProcessController : ControllerBase
    {
        ILogger<ProcessController> Logger { get; }
        IProcessSecurityService ProcessSecurityService { get; }
        IUnpublishProcessService UnpublishProcessService { get; }

        public UnpublishProcessController(ILogger<ProcessController> logger, 
            IProcessSecurityService processSecurityService,
            IUnpublishProcessService unpublishProcessService) 
        {
            Logger = logger;
            ProcessSecurityService = processSecurityService;
            UnpublishProcessService = unpublishProcessService;
        }

        [HttpGet]
        [Authorize]
        public async ValueTask<ApiResponse> UnpublishProcess(Guid opmProcessId)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(opmProcessId, ProcessVersionType.Published);

                return await securityResponse
                    .RequireAuthor()
                    .DoAsync(async (teamAppId) =>
                    {
                        await UnpublishProcessService.UnpublishProcessAsync(opmProcessId);
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
