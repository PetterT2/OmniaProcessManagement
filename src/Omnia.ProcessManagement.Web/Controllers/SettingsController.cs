using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Services.Settings;
using Omnia.ProcessManagement.Models.Settings;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/settings")]
    [ApiController]
    public class SettingsController : ControllerBase
    {
        private ILogger<SettingsController> Logger { get; }
        private ISettingsService SettingsService { get; }
        public SettingsController(ISettingsService settingsService,
            ILogger<SettingsController> logger
            )
        {
            Logger = logger;
            SettingsService = settingsService;
        }


        [HttpGet]
        [Authorize]
        public async ValueTask<ApiResponse<Setting>> GetByKeyAsync(string key)
        {
            try
            {
                var result = await SettingsService.GetByKeyAsync(key);
                return ApiUtils.CreateSuccessResponse(result);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Setting>(ex);
            }
        }

        [HttpDelete]
        [Authorize]
        public async ValueTask<ApiResponse> RemoveByKeyAsync(string key)
        {
            try
            {
                await SettingsService.RemoveByKeyAsync(key);
                return ApiUtils.CreateSuccessResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        [HttpPost]
        [Authorize]
        public async ValueTask<ApiResponse<Setting>> AddOrUpdateAsync([FromBody] Setting settings)
        {
            try
            {
                var result = await SettingsService.AddOrUpdateAsync(settings);
                return ApiUtils.CreateSuccessResponse(result);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Setting>(ex);
            }
        }
    }
}