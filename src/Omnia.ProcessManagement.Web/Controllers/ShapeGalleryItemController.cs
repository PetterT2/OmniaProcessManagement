using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core;
using Omnia.ProcessManagement.Core.Services.ShapeGalleryItems;
using Omnia.ProcessManagement.Models.ShapeTemplates;
using Omnia.ProcessManagement.Models.Shapes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Omnia.ProcessManagement.Models.Enums;

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
        public async ValueTask<ApiResponse<List<ShapeTemplate>>> GetAllAsync()
        {
            try
            {
                var categories = await ShapeGalleryItemService.GetAllAsync();
                return categories.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<List<ShapeTemplate>>(ex);
            }
        }

        [HttpGet, Route("{id:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<ShapeTemplate>> GetAllAsync(Guid id)
        {
            try
            {
                var shapeDeclaration = await ShapeGalleryItemService.GetByIdAsync(id);
                return shapeDeclaration.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<ShapeTemplate>(ex);
            }
        }

        [HttpPost, Route("addorupdate")]
        [Authorize(Fx.Constants.Security.Roles.TenantAdmin)]
        public async ValueTask<ApiResponse<ShapeTemplate>> AddOrUpdateAsync(ShapeTemplate shapeGalleryItem)
        {
            try
            {
                if(shapeGalleryItem.Settings.Type == ShapeTemplateType.MediaShape)
                {
                    shapeGalleryItem.Settings.AdditionalProperties["imageUrl"] = $"https://{Request.Host.Value}/api/shapegalleryitem/getimage/{shapeGalleryItem.Id}";
                }
                var result = await ShapeGalleryItemService.AddOrUpdateAsync(shapeGalleryItem);
                return result.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<ShapeTemplate>(ex);
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
                return ApiUtils.CreateErrorResponse<List<ShapeTemplate>>(ex);
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
