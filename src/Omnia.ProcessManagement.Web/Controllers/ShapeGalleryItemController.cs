using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Services.ShapeGalleryItems;
using Omnia.ProcessManagement.Models.ShapeGalleryItems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/shapedeclaration")]
    [ApiController]
    public class ShapeGalleryItemController : ControllerBase
    {
        ILogger<ShapeGalleryItemController> Logger { get; }
        IShapeGalleryItemService ShapeDeclarationService { get; }
        public ShapeGalleryItemController(IShapeGalleryItemService shapeDeclarationService, ILogger<ShapeGalleryItemController> logger)
        {
            ShapeDeclarationService = shapeDeclarationService;
            Logger = logger;
        }

        [HttpGet, Route("all")]
        [Authorize]
        public async ValueTask<ApiResponse<List<ShapeGalleryItem>>> GetAllAsync()
        {
            try
            {
                var categories = await ShapeDeclarationService.GetAllAsync();
                return categories.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<List<ShapeGalleryItem>>(ex);
            }
        }

        [HttpGet, Route("{id:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<ShapeGalleryItem>> GetAllAsync(Guid id)
        {
            try
            {
                var shapeDeclaration = await ShapeDeclarationService.GetByIdAsync(id);
                return shapeDeclaration.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<ShapeGalleryItem>(ex);
            }
        }

        [HttpPost, Route("addorupdate")]
        [Authorize(Fx.Constants.Security.Roles.TenantAdmin)]
        public async ValueTask<ApiResponse<ShapeGalleryItem>> AddOrUpdateAsync(ShapeGalleryItem shapeDeclaration)
        {
            try
            {
                var result = await ShapeDeclarationService.AddOrUpdateAsync(shapeDeclaration);
                return result.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<ShapeGalleryItem>(ex);
            }
        }

        [HttpDelete, Route("{id:guid}")]
        [Authorize(Fx.Constants.Security.Roles.TenantAdmin)]
        public async ValueTask<ApiResponse> DeleteAsync(Guid id)
        {
            try
            {
                await ShapeDeclarationService.DeleteAsync(id);
                return ApiUtils.CreateSuccessResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<List<ShapeGalleryItem>>(ex);
            }
        }
    }
}
