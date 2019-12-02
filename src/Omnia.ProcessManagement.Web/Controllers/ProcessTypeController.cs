using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Services.ProcessTypes;
using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/processtypes")]
    [ApiController]
    public class ProcessTypeController : ControllerBase
    {
        private ILogger<ProcessController> Logger { get; }
        private IProcessTypeService ProcessTypeService { get; }
        private IProcessTypeTermSynchronizationTrackingService ProcessTypeTermSynchronizationTrackingService { get; }
        public ProcessTypeController(IProcessTypeService processTypeService, 
            ILogger<ProcessController> logger,
            IProcessTypeTermSynchronizationTrackingService processTypeTermSynchronizationTrackingService)
        {
            ProcessTypeTermSynchronizationTrackingService = processTypeTermSynchronizationTrackingService;
            ProcessTypeService = processTypeService;
            Logger = logger;
        }

        [HttpPost, Route("refreshcache")]
        [Authorize(Fx.Constants.Security.Roles.TenantAdmin)]
        public ApiResponse RefreshCache()
        {
            try
            {
                ProcessTypeService.RefreshCache();
                return ApiUtils.CreateSuccessResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        [HttpGet, Route("getprocesstypetermsetid")]
        [Authorize]
        public async ValueTask<ApiResponse<Guid>> GetProcessTypeTermSetIdAsync()
        {
            try
            {
                var result = await ProcessTypeService.GetProcessTypeTermSetIdAsync();
                return ApiUtils.CreateSuccessResponse(result);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Guid>(ex);
            }
        }

        [HttpPost, Route("getbyids")]
        [Authorize]
        public async ValueTask<ApiResponse<IList<ProcessType>>> GetByIdsAsync([FromBody] List<Guid> ids)
        {
            try
            {
                var result = await ProcessTypeService.GetByIdsAsync(ids.ToArray());
                return ApiUtils.CreateSuccessResponse(result);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<IList<ProcessType>>(ex);
            }
        }

        [HttpGet, Route("children")]
        [Authorize]
        public async ValueTask<ApiResponse<IList<ProcessType>>> GetChildrenAsync(Guid? parentId)
        {
            try
            {
                var result = await ProcessTypeService.GetChildrenAsync(parentId);
                return ApiUtils.CreateSuccessResponse(result);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<IList<ProcessType>>(ex);
            }
        }

        [HttpPost]
        [Authorize(Fx.Constants.Security.Roles.TenantAdmin)]
        public async ValueTask<ApiResponse<ProcessType>> CreateAsync([FromBody] ProcessType processType)
        {
            try
            {
                if (!processType.ParentId.HasValue)
                    throw new Exception("Don't support client-side to create root process type");

                await IsSyncingDataFromSharePointAsync(processType.Settings.TermSetId);

                var result = await ProcessTypeService.CreateAsync(processType);
                return ApiUtils.CreateSuccessResponse(result);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<ProcessType>(ex);
            }
        }

        [HttpPut]
        [Authorize(Fx.Constants.Security.Roles.TenantAdmin)]
        public async ValueTask<ApiResponse<ProcessType>> UpdateAsync([FromBody] ProcessType processType)
        {
            try
            {
                await IsSyncingDataFromSharePointAsync(processType.Settings.TermSetId);

                var result = await ProcessTypeService.UpdateAsync(processType);
                return ApiUtils.CreateSuccessResponse(result);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<ProcessType>(ex);
            }
        }

        [HttpDelete, Route("{id:guid}")]
        [Authorize(Fx.Constants.Security.Roles.TenantAdmin)]
        public async ValueTask<ApiResponse> RemoveAsync(Guid id)
        {
            try
            {
                await ProcessTypeService.RemoveAsync(id);
                return ApiUtils.CreateSuccessResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        private async ValueTask IsSyncingDataFromSharePointAsync(Guid termSetId)
        {
            var syncStatus = await ProcessTypeTermSynchronizationTrackingService.GetSyncStatusAsync(termSetId);
            //On client-side, we already ensure that NO ui-action is available when a sync process (From SharePoint To Dbs) is running

            if (syncStatus.Status == ProcessTypeTermSynchronizationStatus.Statuses.Syncing && syncStatus.SyncFromSharePoint)
            {
                throw new Exception($"Syncing process types from SharePoint's term set {termSetId}");
            }
        }
    }
}
