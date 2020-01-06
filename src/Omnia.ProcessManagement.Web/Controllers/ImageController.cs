using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Helpers.ImageHerlpers;
using Omnia.ProcessManagement.Core.Helpers.ProcessQueries;
using Omnia.ProcessManagement.Core.Services.Images;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Images;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/images")]
    [ApiController]
    public class ImageController : ControllerBase
    {
        ILogger<ImageController> Logger { get; }
        IImageService ImageService { get; }
        FileExtensionContentTypeProvider ContentTypeProvider { get; }

        public ImageController(ILogger<ImageController> logger, IImageService imageService)
        {
            ImageService = imageService;
            ContentTypeProvider = new FileExtensionContentTypeProvider();
            Logger = logger;
        }

        [HttpPost, Route("{processId:guid}/{fileName}")]
        [Authorize]
        public async ValueTask<ApiResponse<string>> AddImageAsync([FromBody] string imageBase64, Guid processId, string fileName)
        {
            try
            {
                var imageRelativeApiUrl = await ImageService.AddAuthroziedImageAsync(processId, fileName, imageBase64);
                var imageUrl = $"https://{Request.Host.Value}{imageRelativeApiUrl}";

                return imageUrl.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<string>(ex);
            }
        }

        [HttpGet, Route("{opmProcessId:guid}/{id:int}/{fileName}")]
        [Authorize]
        public async ValueTask<IActionResult> GetImageAsync(Guid opmProcessId, int id, string fileName)
        {
            try
            {
                var imageRef = new ImageReference()
                {
                    FileName = fileName,
                    ImageId = id
                };

                var fileStream = await ImageService.GetImageAsync(imageRef, opmProcessId);

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