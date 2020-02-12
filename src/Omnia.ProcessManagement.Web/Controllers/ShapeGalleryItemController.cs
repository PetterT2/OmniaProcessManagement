using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core;
using Omnia.ProcessManagement.Core.Services.ShapeGalleryItems;
using Omnia.ProcessManagement.Models.ShapeGalleryItems;
using Omnia.ProcessManagement.Models.Shapes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/shapegalleryitem")]
    [ApiController]
    public class ShapeGalleryItemController : ControllerBase
    {
        ILogger<ShapeGalleryItemController> Logger { get; }
        IShapeGalleryItemService ShapeGalleryItemService { get; }
        FileExtensionContentTypeProvider ContentTypeProvider { get; }
        public ShapeGalleryItemController(IShapeGalleryItemService shapeGalleryItemService, ILogger<ShapeGalleryItemController> logger)
        {
            ShapeGalleryItemService = shapeGalleryItemService;
            ContentTypeProvider = new FileExtensionContentTypeProvider();
            Logger = logger;
        }

        [HttpGet, Route("all")]
        [Authorize]
        public async ValueTask<ApiResponse<List<ShapeGalleryItem>>> GetAllAsync()
        {
            try
            {
                var categories = await ShapeGalleryItemService.GetAllAsync();
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
                var shapeDeclaration = await ShapeGalleryItemService.GetByIdAsync(id);
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
        public async ValueTask<ApiResponse<ShapeGalleryItem>> AddOrUpdateAsync(ShapeGalleryItem shapeGalleryItem)
        {
            try
            {
                if(shapeGalleryItem.Settings.ShapeDefinition.ShapeTemplate.Id == OPMConstants.Features.OPMDefaultShapeGalleryItems.Media.Id)
                {
                    shapeGalleryItem.Settings.ShapeDefinition.AdditionalProperties["imageUrl"] = $"https://{Request.Host.Value}/api/shapegalleryitem/getimage/{shapeGalleryItem.Id}";
                }
                var result = await ShapeGalleryItemService.AddOrUpdateAsync(shapeGalleryItem);
                return result.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<ShapeGalleryItem>(ex);
            }
        }

        [HttpPost, Route("{shapeGalleryItemId:guid}/{fileName}")]
        [Authorize]
        public async ValueTask<ApiResponse<bool>> AddImageAsync([FromBody] string imageBase64, Guid shapeGalleryItemId, string fileName)
        {
            try
            {
                bool result = await ShapeGalleryItemService.AddImageAsync(shapeGalleryItemId, fileName, imageBase64);
                return ApiUtils.CreateSuccessResponse(result);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<bool>(ex);
            }
        }

        [HttpGet, Route("getimage/{shapeGalleryItemId:guid}")]
        [Authorize]
        public async ValueTask<IActionResult> GetImageAsync(Guid shapeGalleryItemId)
        {
            try
            {
                var (fileStream, fileName) = await ShapeGalleryItemService.GetImageAsync(shapeGalleryItemId);
                fileStream.Seek(0, System.IO.SeekOrigin.Begin);
                Response.GetTypedHeaders().CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue()
                {
                    Public = true,
                    MaxAge = TimeSpan.FromDays(365)
                };

                return File(fileStream, GetFileContentType(fileName), fileName);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return new NotFoundResult();
            }
        }

        [HttpDelete, Route("{id:guid}")]
        [Authorize(Fx.Constants.Security.Roles.TenantAdmin)]
        public async ValueTask<ApiResponse> DeleteAsync(Guid id)
        {
            try
            {
                await ShapeGalleryItemService.DeleteAsync(id);
                return ApiUtils.CreateSuccessResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<List<ShapeGalleryItem>>(ex);
            }
        }

        private string GetFileContentType(string fileName)
        {
            if (!ContentTypeProvider.TryGetContentType(fileName, out string contentType))
            {
                contentType = "application/octet-stream";
            }

            return contentType;
        }
    }
}
