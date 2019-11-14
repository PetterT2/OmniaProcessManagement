using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Services.ProcessTemplates;
using Omnia.ProcessManagement.Models.ProcessTemplates;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/processtemplates")]
    [ApiController]
    public class ProcessTemplateController : ControllerBase
    {
        ILogger<ProcessTemplateController> Logger { get; }
        IProcessTemplateService ProcessTemplateService { get; }
        public ProcessTemplateController(IProcessTemplateService processTemplateService, ILogger<ProcessTemplateController> logger)
        {
            ProcessTemplateService = processTemplateService;
            Logger = logger;
        }

        [HttpGet, Route("all")]
        [Authorize]
        public async ValueTask<ApiResponse<List<ProcessTemplate>>> GetAllAsync()
        {
            try
            {
                var categories = await ProcessTemplateService.GetAllAsync();
                return categories.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<List<ProcessTemplate>>(ex);
            }
        }


        [HttpPost, Route("")]
        [Authorize(Fx.Constants.Security.Roles.TenantAdmin)]
        public async ValueTask<ApiResponse<ProcessTemplate>> AddOrUpdateAsync(ProcessTemplate processTemplate)
        {
            try
            {
                var result = await ProcessTemplateService.AddOrUpdateAsync(processTemplate);
                return result.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<ProcessTemplate>(ex);
            }
        }

        [HttpDelete, Route("{id:guid}")]
        [Authorize(Fx.Constants.Security.Roles.TenantAdmin)]
        public async ValueTask<ApiResponse> DeleteAsync(Guid id)
        {
            try
            {
                await ProcessTemplateService.DeleteAsync(id);
                return ApiUtils.CreateSuccessResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<List<ProcessTemplate>>(ex);
            }
        }
    }
}