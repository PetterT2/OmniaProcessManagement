using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core;
using Omnia.ProcessManagement.Core.Services.ShapeTemplates;
using Omnia.ProcessManagement.Models.ShapeTemplates;
using Omnia.ProcessManagement.Models.Shapes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Omnia.ProcessManagement.Models.Enums;
using System.IO;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/shapetemplate")]
    [ApiController]
    public class ShapeTemplateController : ControllerBase
    {
        ILogger<ShapeTemplateController> Logger { get; }
        IShapeTemplateService ShapeTemplateService { get; }
        FileExtensionContentTypeProvider ContentTypeProvider { get; }
        public ShapeTemplateController(IShapeTemplateService shapeTemplateService, ILogger<ShapeTemplateController> logger)
        {
            ShapeTemplateService = shapeTemplateService;
            ContentTypeProvider = new FileExtensionContentTypeProvider();
            Logger = logger;
        }

        [HttpGet, Route("all")]
        [Authorize]
        public async ValueTask<ApiResponse<List<ShapeTemplate>>> GetAllAsync()
        {
            try
            {
                var categories = await ShapeTemplateService.GetAllAsync();
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
                var shapeDeclaration = await ShapeTemplateService.GetByIdAsync(id);
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
                    shapeGalleryItem.Settings.AdditionalProperties["imageUrl"] = $"https://{Request.Host.Value}/api/shapetemplate/getimage/{shapeGalleryItem.Id}";
                }
                var result = await ShapeTemplateService.AddOrUpdateAsync(shapeGalleryItem);
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
                bool result = await ShapeTemplateService.AddImageAsync(shapeGalleryItemId, fileName, imageBase64);
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
                var (bytesData, fileName) = await ShapeTemplateService.GetImageAsync(shapeGalleryItemId);
                MemoryStream fileStream = new MemoryStream(bytesData);
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
                await ShapeTemplateService.DeleteAsync(id);
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
